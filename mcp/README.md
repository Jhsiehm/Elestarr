# Elestarr MCP for Barney

Point Barney's harness at this server. It can query candidates, proved interviews, live sites, hiring desks, and overlap. It cannot download `.eml` files.

```bash
SUPABASE_URL=https://cerocddbqhvaffkkqbct.supabase.co \
SUPABASE_SECRET_KEY=... \
node mcp/elestarr.mjs
```

Copy `mcp.json.example` into your agent config. Never put the secret on a `VITE_` variable.

Tools:

- `list_candidates`
- `get_profile`
- `list_proved_interviews`
- `list_roles`
- `match_overlap`

Desk in the app already ranks live wall people from the hiring brief. Barney should call `match_overlap` with that same brief, then name skip-rounds from proved interviews only.
