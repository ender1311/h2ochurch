# H2O Church Columbus — CLAUDE.md

Web app for H2O Church in Columbus, Ohio. Development/deployment conventions below
are carried over from the `nexus` project.

## Git workflow

Solo repo for now, so **pushing and merging directly to `main` is fine** — a feature
branch is optional, not required. "Push and merge" means ship it immediately
(commit → push → merge), no finishing prompt. Run the full check before pushing
anything non-trivial.

## Testing policy

- Every new API endpoint → integration test in `tests/integration/`
- Every new pure function / lib module → unit test in `tests/unit/`
- Every bug fix → regression test in `tests/regression/` with a comment linking to the bug
- Every new raw SQL query (`$queryRaw` / `queryRawUnsafe`) in a page/server component →
  regression test in `tests/regression/` verifying the exact SQL column names
- Every new page component using DB data → at minimum an integration test verifying
  the underlying API returns the correct shape
- Run the quick suite (typecheck + lint + unit) while iterating; run the full suite
  (adds integration + regression) before opening an MR / pushing
- CI enforces all checks — anything with a failing pipeline is not merged
- **Automatic coverage enforcement**: the PostToolUse hook (`.claude/test-coverage-check.sh`)
  reminds you to write tests immediately when you create/modify API routes or page
  components with raw SQL. Do not dismiss the reminder.

## Self-learning setup

- **Stop hook**: auto-reviews each session's git diff and writes new, non-obvious
  learnings to `~/.claude/projects/…/memory/` so they surface in future sessions.
- **PostToolUse hook**: ESLint auto-fixes `.ts`/`.tsx` files on every write, and
  runs the test-coverage check — no need to remember to lint or add tests manually.

## Working method

Applies to every task in this repo. In this project, "lessons" live in the
auto-memory system (`~/.claude/projects/…/memory/`, written by the Stop hook and
saved as feedback memories) and "the plan / todo list" is the harness task list
(TaskCreate/TaskUpdate) or a Plan — not separate `tasks/*.md` files.

### Core principles
- **Simplicity first** — make every change as simple as possible; touch minimal code.
- **No laziness** — find root causes; no temporary or hacky fixes; senior-developer standards.
- **Minimal impact** — only touch what's necessary; no side effects, no new bugs.

### Task management
- **Plan first** — for non-trivial work, write the plan as tasks (or a Plan) before coding.
- **Verify the plan** — check in with the user before starting a large implementation.
- **Track progress** — mark task items complete as you finish them, not in a batch.
- **Explain changes** — give a short, high-level summary at each meaningful step.
- **Document results** — end with a concise review of what changed and what's next.
- **Capture lessons** — after any correction, record the pattern in memory (feedback).

### Verification before done
- Never mark a task complete without proving it works — run tests, check logs,
  exercise the UI/endpoint, demonstrate correctness.
- Diff behavior against `main` when it clarifies the change.
- Ask: "Would a staff engineer approve this?" before presenting work.

### Demand elegance (balanced)
- For non-trivial changes, pause and ask "is there a more elegant way?" If a fix
  feels hacky, implement the clean solution instead. Challenge your own work first.
- Skip this for simple, obvious fixes — don't over-engineer.

### Self-improvement loop
- After ANY correction from the user, save the pattern as a feedback memory and
  write a rule that prevents repeating the mistake. Review relevant memories at
  session start. Iterate until the mistake rate drops.

### Autonomous bug fixing
- Given a bug report, just fix it — point at the logs/errors/failing tests and
  resolve them without hand-holding or context-switching back to the user.
- Fix failing CI without being told how.

## Engineering standards

### TypeScript discipline
- **No `any`** — use `unknown` and narrow with type guards, or an explicit union/interface.
- API route handlers type their request params and return a typed response.
- JSON fields from the DB are parsed/validated immediately on read — never spread raw
  strings into typed objects.

### API design contracts
- Every route returns `{ data: T }` on success or `{ error: string }` on failure with
  the correct HTTP status code.
- Validate all input at the route boundary before any DB access — reject bad payloads
  with 400, not a 500 from a DB constraint error.
- Never surface DB error messages, stack traces, or internal IDs in HTTP responses.

### React / Next.js component design
- **No business logic in components** — components orchestrate UI; `lib/` computes.
- Default to Server Components; add `"use client"` only for interactivity, kept at leaf nodes.
- Fetch data in the nearest Server Component and pass it as props.

### Correctness over cleverness
- Prefer explicit over terse. Delete dead code rather than commenting it out.
- Name things for what they represent, not how they're implemented.
- Don't add error handling for impossible paths — trust the type system and invariants.

## Deployment

- Hosted on Vercel (`framework: nextjs`).
- Disable deployments for `docs/*` and `chore/*` branches.
- Pre-push git hook runs the quick check; CI runs typecheck → lint → tests, then builds
  on `main` only.
