import { withSupabase } from "npm:@supabase/server"
import { companyFromDomain, parseEml } from "../_shared/eml.ts"

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims?.id
    if (!userId) return Response.json({ message: "Sign in." }, { status: 401 })
    const body = await req.json() as { proof_path?: string; interview_id?: string }
    const path = body.proof_path ?? ""
    if (!path.startsWith(`${userId}/`)) {
      return Response.json({ message: "Not your file." }, { status: 403 })
    }

    const { data, error } = await ctx.supabaseAdmin.storage.from("proofs").download(path)
    if (error || !data) return Response.json({ message: error?.message ?? "Missing file" }, { status: 404 })

    const raw = await data.text()
    const parse = parseEml(raw)
    const { error: upErr } = await ctx.supabaseAdmin.from("proofs").update({
      message_id: parse.messageId,
      from_addr: parse.fromAddr,
      from_domain: parse.fromDomain,
      subject: parse.subject,
      dkim_pass: parse.dkimPass,
      spf_pass: parse.spfPass,
      authentic: parse.authentic,
      parse_note: parse.note,
    }).eq("storage_path", path).eq("profile_id", userId)
    if (upErr) return Response.json({ message: upErr.message }, { status: 400 })

    if (parse.authentic && body.interview_id) {
      const company = companyFromDomain(parse.fromDomain, "")
      await ctx.supabaseAdmin.from("interviews").update({
        proved: true,
        ...(company ? { company } : {}),
        ...(parse.guessedRound ? { round: parse.guessedRound } : {}),
      }).eq("id", body.interview_id).eq("profile_id", userId)
    }

    return Response.json({ authentic: parse.authentic, note: parse.note, from: parse.fromAddr })
  }),
}
