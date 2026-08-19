#!/usr/bin/env node
/**
 * Elestarr MCP — attested hiring facts only.
 * Never returns raw .eml files.
 *
 * Env (never VITE_):
 *   SUPABASE_URL
 *   SUPABASE_SECRET_KEY
 *
 * Cursor / Claude Code:
 *   { "mcpServers": { "elestarr": { "command": "node", "args": ["mcp/elestarr.mjs"] } } }
 */

const URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
const KEY = process.env.SUPABASE_SECRET_KEY || ""

if (!URL || !KEY) {
  console.error("elestarr MCP needs SUPABASE_URL and SUPABASE_SECRET_KEY")
}

const SELECT =
  "id, display_name, title, location, availability, open_to, onboarded, role, hiring_for, work(storage_path, sort), sites(url, label, sort), interviews(company, round, role_title, occurred_on, proved)"

async function rest(path, query = "") {
  const res = await fetch(`${URL}/rest/v1/${path}${query}`, {
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      Accept: "application/json",
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}

function publicPerson(row) {
  const interviews = (row.interviews || []).filter(i => i.proved).map(i => ({
    company: i.company,
    round: i.round,
    role: i.role_title,
    date: i.occurred_on,
  }))
  return {
    id: row.id,
    name: row.display_name,
    title: row.title,
    location: row.location,
    availability: row.availability,
    open_to: row.open_to,
    labels: [
      row.title,
      row.location,
      row.open_to,
      ...interviews.map(i => i.company),
      ...interviews.map(i => i.round),
    ].filter(Boolean),
    sites: (row.sites || []).map(s => ({ url: s.url, label: s.label })),
    work_count: (row.work || []).length,
    interviews,
  }
}

const tools = [
  {
    name: "list_candidates",
    description: "Onboarded candidates with work or sites. Public facts only: name, work, proved interviews, labels.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_profile",
    description: "One candidate by uuid. Proved interviews, live sites, open_to. Never the email file.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "list_proved_interviews",
    description: "Every proved interview on the platform: company, round, date. No result, no assignment.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "list_roles",
    description: "Hiring desks: firm name and what they are hiring for.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "match_overlap",
    description: "Given a hiring brief, return candidates whose proved loops and titles overlap the brief.",
    inputSchema: {
      type: "object",
      properties: { brief: { type: "string" } },
      required: ["brief"],
    },
  },
]

async function callTool(name, args) {
  if (name === "list_candidates") {
    const rows = await rest("profiles", `?select=${encodeURIComponent(SELECT)}&role=eq.creative&onboarded=eq.true`)
    return rows.map(publicPerson).filter(p => p.work_count > 0 || p.sites.length > 0)
  }
  if (name === "get_profile") {
    const rows = await rest("profiles", `?select=${encodeURIComponent(SELECT)}&id=eq.${args.id}`)
    if (!rows[0]) return { error: "Not found" }
    return publicPerson(rows[0])
  }
  if (name === "list_proved_interviews") {
    const rows = await rest("interviews", "?select=company,round,role_title,occurred_on,profile_id&proved=eq.true")
    return rows
  }
  if (name === "list_roles") {
    const rows = await rest("profiles", "?select=display_name,firm_name,hiring_for&role=eq.firm&onboarded=eq.true")
    return rows.filter(r => r.hiring_for)
  }
  if (name === "match_overlap") {
    const brief = String(args.brief || "").toLowerCase()
    const tokens = brief.split(/[^a-z0-9]+/).filter(w => w.length > 3)
    const rows = await rest("profiles", `?select=${encodeURIComponent(SELECT)}&role=eq.creative&onboarded=eq.true`)
    return rows.map(publicPerson).map(p => {
      const blob = `${p.title} ${p.open_to} ${p.labels.join(" ")}`.toLowerCase()
      const hit = tokens.filter(t => blob.includes(t))
      return { ...p, overlap: hit, skip: p.interviews.map(i => i.round) }
    }).filter(p => p.overlap.length).slice(0, 12)
  }
  throw new Error(`Unknown tool ${name}`)
}

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`)
}

async function handle(msg) {
  if (msg.method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "elestarr", version: "0.1.0" },
    }
  }
  if (msg.method === "notifications/initialized") return null
  if (msg.method === "tools/list") return { tools }
  if (msg.method === "tools/call") {
    const result = await callTool(msg.params.name, msg.params.arguments || {})
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }
  }
  if (msg.method === "ping") return {}
  throw new Error(`Unknown method ${msg.method}`)
}

const rl = await import("node:readline")
const lines = rl.createInterface({ input: process.stdin })
for await (const line of lines) {
  if (!line.trim()) continue
  let msg
  try { msg = JSON.parse(line) } catch { continue }
  try {
    const result = await handle(msg)
    if (result && msg.id != null) send({ jsonrpc: "2.0", id: msg.id, result })
  } catch (err) {
    if (msg?.id != null) {
      send({ jsonrpc: "2.0", id: msg.id, error: { code: -32000, message: String(err.message || err) } })
    }
  }
}
