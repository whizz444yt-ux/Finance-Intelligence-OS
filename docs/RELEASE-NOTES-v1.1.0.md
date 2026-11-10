# Finance Intelligence OS v1.1.0

**Release date:** 10 November 2026

## Release focus

This release aligns the application, package metadata and offline cache under one semantic version, refreshes the visual system across the homepage and generated module pages, and introduces a tag-gated GitHub release pipeline.

## Included

- Premium visual polish for the Global Research homepage: improved contrast, typography, spacing, hover states, focus visibility and responsive layouts.
- Consistent premium styling across the generated Futures, Academy, Macro, Strategy Lab, Account and Data Health routes.
- Unified visible release marker, package version and service-worker cache namespace at v1.1.0.
- Version consistency checks in the standard quality workflow.
- A tag-triggered release workflow that verifies vX.Y.Z against package.json, rebuilds the site, reruns all checks and publishes GitHub release notes.
- Updated PWA metadata and platform/build documentation.
- Vercel production deployments are publicly accessible while Preview deployments retain SSO protection.

## Existing modules retained

P0 reliability, P1 modular intelligence, P2 economic ingestion, P3 ICT Academy, P4 reproducible Strategy Lab and P5 cloud workspace remain part of the product. This is a visual and release-engineering update, not a rewrite of their business logic.

## Operational prerequisites still visible

- Cloudflare Worker secrets are not present yet. Supabase server-side persistence and BEA/EIA/FRED credential-backed ingestion therefore remain unconfigured.
- Economic-provider observations are currently empty and provider statuses remain not-yet-fetched until the Worker is configured and the ingestion job succeeds.
- The 15 imported futures contract specifications remain explicitly unverified pending exchange-source reconciliation.
- No licensed CME/ICE real-time quotes, depth-of-market or broker execution integration is claimed.
- Supabase Auth needs a real user signup, email confirmation and sign-in smoke test before production sign-off.
- Builder.io remains optional and unconfigured; the static JSON Academy remains the fallback.

## Verification policy

A GitHub Release is created only when the pushed tag matches package.json and the build, unit tests, structural/security validator and internal-link audit all pass.
