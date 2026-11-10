# ChatGPT / Claude / GitHub Execution Prompts and Handoff Protocol

**Purpose:** Make every Part executable in isolation while preserving the global Futures-Only product contract.

## 1. How to use this folder

When starting a new implementation conversation, provide:
1. The exact Part file (for example `02-PART-1...`).
2. This folder's `README.md`.
3. `00-PROJECT-CHARTER-AND-EXECUTION-RULES.md`.
4. Optionally the source PDF only if the selected work is content/contract-related and the agent needs to consult page-level text.

Tell the agent explicitly: "Execute Part N only; do not start the next Part."

The roadmap folder is the implementation specification; source code and live platform state remain authoritative for what currently exists.

## 2. Universal master prompt

```text
You are the lead engineer/research engineer for Futures Intelligence OS.

Repository: https://github.com/whizz444yt-ux/Finance-Intelligence-OS
Target branch: inspect current main and create/use a focused feature branch.
Product: Futures-only market intelligence and ICT Futures education.

Read the complete selected Part file, README.md and 00-PROJECT-CHARTER-AND-EXECUTION-RULES.md. Follow the Part boundaries strictly.

FIRST:
- Inspect current repo branch, commit SHA and complete relevant file tree.
- Inspect exact source files and generated output.
- Inspect current deployed/runtime provider status where access exists.
- Report what exists, what is missing, what is broken, and what is only documented.
- Create a file-by-file plan with dependencies and risks.
- Identify current source of truth for any content/data before changing code.

IMPLEMENT:
- Work only on the selected Part.
- Preserve current static HTML/JavaScript/JSON + Python build system unless you prove a specific blocker.
- Reuse existing routes/data/schema/features; avoid duplication.
- Make changes in canonical source/builders, not generated dist output.
- Use additive migrations; preserve all Supabase user data.
- Do not remove useful futures features or legacy backups.
- Keep secrets out of Git/browser and use official secret stores.
- Do not invent provider data, current contract values, prop-firm rules, schedules, API limits, licence permission or model performance.
- Attach sources and retrieval/effective dates.
- Make loading/error/stale/unavailable states explicit.

VERIFY:
- Run build, unit tests, structural/security validation and internal link audit.
- Add tests for the new behavior.
- Inspect generated dist routes and source/build parity.
- Test affected routes and API behavior.
- Review SQL/RLS with at least two users where private data is involved.
- Check mobile, accessibility and browser console for UI changes.
- Verify current provider response timestamps and credential state when data changes.
- Do not claim a test/deployment succeeded unless observed.

HANDOFF:
Return a concise but complete report:
1. Scope completed and not completed.
2. Files changed.
3. Routes/APIs/schema changed.
4. Exact test commands, exit codes and evidence.
5. Git branch/commit/PR links.
6. Deployment status if actually verified.
7. Provider/credential/licence requirements still missing.
8. Security/data-quality risks.
9. Acceptance checklist.
10. Recommended next Part, without implementing it.

Stop after the selected Part.
```

## 3. Part-specific prompt files

Each Part file ends with a ready-to-copy execution prompt. Use that prompt after reading the charter. Do not combine all Parts into one "do everything" prompt; a large undifferentiated instruction tends to create unrelated edits, duplicate code and weak verification.

## 4. Agent roles

Recommended division of responsibility:
- ChatGPT: master planning, research, repository audit, implementation orchestration, code review, cross-Part consistency, final verification.
- Claude Code: focused code editing/refactor/test implementation when connected to same repository/worktree; must follow the same Part boundary and report diff.
- GitHub: source of truth for branches, commits, PRs, CI and review.
- Vercel: Preview and Production deployment result.
- Cloudflare: Worker deployment, secrets, Cron, KV and provider gateway.
- Supabase: schema, migration, Auth, RLS and private user data.

Do not have ChatGPT and Claude simultaneously overwrite the same branch/file. Assign one implementation owner per Part; use the other as reviewer or separate branches/PRs.

## 5. Required Part report template

```markdown
# Part N Implementation Report
- Part / title:
- Repository:
- Branch:
- Base commit:
- Implementation commit:
- Status: complete / partial / blocked

## Baseline
- Existing implementation:
- Gaps:
- Paths inspected:

## Changes
- Paths changed:
- Routes:
- APIs:
- Data/schema:
- Secrets/config required:

## Verification
| Check | Command / action | Result | Evidence |
|---|---|---|---|
| Build | ... | PASS/FAIL/NOT RUN | ... |
| Unit tests | ... | ... | ... |
| Validator | ... | ... | ... |
| Link audit | ... | ... | ... |
| Manual route/API QA | ... | ... | ... |
| Security/RLS/licensing | ... | ... | ... |

## Remaining
- Unverified facts:
- Provider/licence setup:
- Known limitations:
- Follow-up defects:

## Acceptance
- [ ] All Part checks satisfied
```

## 6. Rules when user sends only a Part document

- Resolve the Part number/title from the file name.
- Read this README and charter if available in repo.
- Inspect current repo; do not ask the user to repeat repository URL or known stack.
- Execute only that Part.
- If one essential credential or approval is missing, complete all non-blocked work, leave the integration in an explicit not-configured state, and identify the exact missing requirement.
- Do not stop to ask about details that the Part can resolve using current source documentation and official research.
- Do not claim background work or later delivery; complete what is possible in the current task.
- If a destructive or irreversible operation is required, do not perform it without explicit approval; use reversible archival/deprecation instead.

## 7. How to handle partial requests

If user asks "do Part 5 news only", treat it as a narrowed Part 5 scope and still apply its security, provider and testing rules. Record deferred sub-items in the report. If the user asks "review Part 5", audit and advise; do not change code unless asked to implement.

## 8. Prompt for documentation maintenance

```text
Review this futures-only roadmap against the current default branch and the latest official provider/exchange documentation. Update only the affected roadmap file(s). Preserve history and mark changed assumptions with a last-reviewed date. Do not modify application source code. Verify internal links and folder index after editing.
```
