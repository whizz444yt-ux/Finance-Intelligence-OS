# Security policy

- Never commit API keys, Supabase `service_role`, Builder private keys/PATs, Cloudflare API tokens, Vercel tokens or user exports.
- Keep the Cloudflare Worker CMS proxy allow-listed to known Builder models; validate output and cap result size.
- Keep private user records in Supabase tables with RLS ownership predicates using `auth.uid()`.
- Do not place Supabase elevated keys or private user data in public Builder content or browser code.
- Validate external URLs and use `rel="noopener noreferrer"` on external links.
- Report security issues privately to the repository owner; do not disclose live tokens in issues.
