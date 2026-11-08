# Contributing

Thanks for improving Finance Intelligence OS.

## Source additions
- Prefer official exchange, regulator, issuer, central-bank and statistical-agency links for primary facts.
- Include a concise description of what the source covers; do not imply that a link provides real-time data unless the provider documents that.
- Identify free/public, freemium, paid, API-key or license requirements where known.
- Mark legal/jurisdiction status conservatively and link the primary rule or provider's eligibility policy.
- Do not add stolen credential dumps, hacked databases, doxxing materials or instructions for bypassing legal/platform restrictions.

## Code changes
- Keep the core page dependency-light and resilient when external providers fail.
- Use textContent or safe DOM construction for external/untrusted article titles; do not inject feed HTML.
- Make network operations user-triggered where practical, use timeouts, label cache/freshness, and never fabricate quotes/headlines.
- Never commit API secrets, private notes, exported workspace backups or personal data.
- Run `python scripts/validate.py` before submitting.

## Forecasting and signals
Avoid guaranteed direction claims. Any scenario or signal must distinguish original source facts, inference, uncertainty, horizon and invalidation conditions.
