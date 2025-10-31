## Contributing to RentFlow

Thank you for your interest in improving RentFlow (by Bradley Virtual Solutions, LLC).

### Code of Conduct
Be respectful. Assume positive intent. Keep discussions technical and constructive.

### Project Setup
- Node 18+, npm 9+
- Copy `.env.local.example` (or see ENVIRONMENT.md) to `.env.local`
- Install and run: `npm ci && npm run dev`
- Seed data (optional): `POST http://localhost:3000/api/seed`

### Branching & Commits
- Branch naming: `feature/<short-summary>`, `fix/<short-summary>`, `docs/<short-summary>`
- Use Conventional Commits:
  - `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `perf:`
  - Scope when useful: `feat(templates): add version modal`

### Pull Requests
1. Keep PRs focused and < 400 LOC when possible
2. Include a short description and screenshots/GIFs for UI changes
3. Ensure build passes locally: `npm run build`
4. Add/adjust tests when adding features or fixing bugs

### Coding Standards
- TypeScript: prefer explicit function signatures for exported APIs
- React: functional components, hooks, early returns, minimal state
- Avoid deep nesting; extract helpers/components when logic grows
- Error handling: surface clear messages via `NextResponse.json({ error }, { status })`
- Avoid TODO comments; implement or create follow-up issues

### Linting & Formatting
- Follow existing formatting
- Prefer multi-line over complex one-liners

### Tests
- E2E tests use Puppeteer (headless or visible); keep selectors resilient
- Add waits for dynamic UI (`waitForSelector`, `waitForResponse`) instead of fixed timeouts

### Security & Secrets
- Never commit secrets. `.env.local` is gitignored
- Report vulnerabilities privately (see SECURITY.md)

### Releases & Deployments
- GitHub is for code only
- Vercel deploys are performed manually via CLI (see README)

### Questions
Open a discussion or a draft PR with your approach for feedback


