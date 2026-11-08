# Builder.io content integration

The web app is Builder-ready but not connected to a Builder Space until a public Content API key and model setup are supplied from the Builder workspace. The Worker exposes an allow-listed proxy at `/api/v1/cms/{model}`. It uses the Builder Content API public key as a Worker secret/config value and never exposes a private API key or personal access token.

Models: `page`, `ict-lesson`, `research-article`, `glossary`. The authoritative model/field list and editorial guardrails are in `models.json`.

## Setup

1. Create/select a Builder Content Space and copy its **Public API Key**.
2. Create the four models in `models.json`; configure `slug` as a unique searchable field.
3. Add public, published lesson content; leave drafts inaccessible from the public site.
4. Set the Worker secret: `wrangler secret put BUILDER_PUBLIC_API_KEY`.
5. Verify `GET /api/v1/cms/ict-lesson?limit=10` and publish a test lesson.
6. Only after API responses are verified, add a webhook to trigger a secure cache revalidation endpoint. Do not accept unauthenticated arbitrary cache purge URLs.

The legacy Academy JSON and HTML lessons remain as fallback; the CMS is editorial content, not the source of financial prices or economic release facts.
