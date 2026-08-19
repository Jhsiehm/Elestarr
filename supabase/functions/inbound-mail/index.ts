import { withSupabase } from "npm:@supabase/server"
import { companyFromDomain, extractAttachedOriginal, parseEml, plusToken } from "../_shared/eml.ts"

async function rawFrom(req: Request) {
  const type = req.headers.get("content-type") || ""
  if (type.includes("json")) {
    const json = await req.json() as { raw?: string; email?: string; text?: string }
    return json.raw || json.email || json.text || ""
  }
  return await req.text()
}

export default {
  fetch: withSupabase({ auth: "secret" }, async (req, ctx) => {
    const inbound = await rawFrom(req)
    if (!inbound || inbound.length < 40) {
      return Response.json({ message: "Empty message" }, { status: 400 })
    }

    const wrapper = parseEml(inbound)
    const token = plusToken(inbound)
    if (!token) return Response.json({ message: "No prove+token address." }, { status: 400 })

    const { data: profile, error: pErr } = await ctx.supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("proof_token", token)
      .maybeSingle()
    if (pErr || !profile) return Response.json({ message: "Unknown prove address." }, { status: 404 })

    const original = extractAttachedOriginal(inbound)
    const parse = parseEml(original)
    const company = companyFromDomain(parse.fromDomain, wrapper.fromDomain)
    const round = parse.guessedRound
    const proved = parse.authentic

    const { data: interview, error: ivErr } = await ctx.supabaseAdmin.from("interviews").insert({
      profile_id: profile.id,
      company: company || "Unknown company",
      round,
      role_title: "",
      proved,
    }).select("id").single()
    if (ivErr) return Response.json({ message: ivErr.message }, { status: 400 })

    const path = `${profile.id}/inbound-${Date.now()}.eml`
    const bytes = new TextEncoder().encode(original)
    const up = await ctx.supabaseAdmin.storage.from("proofs").upload(path, bytes, {
      contentType: "message/rfc822",
      upsert: false,
    })
    if (up.error) return Response.json({ message: up.error.message }, { status: 400 })

    const { error: prErr } = await ctx.supabaseAdmin.from("proofs").insert({
      profile_id: profile.id,
      interview_id: interview.id,
      storage_path: path,
      source: "inbound",
      message_id: parse.messageId,
      from_addr: parse.fromAddr,
      from_domain: parse.fromDomain,
      subject: parse.subject,
      dkim_pass: parse.dkimPass,
      spf_pass: parse.spfPass,
      authentic: parse.authentic,
      parse_note: parse.note,
    })
    if (prErr) return Response.json({ message: prErr.message }, { status: 400 })

    return Response.json({
      ok: true,
      authentic: parse.authentic,
      company,
      round,
      note: parse.note,
    })
  }),
}
