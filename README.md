# Claims Validator using LLM

An LLM checks whether a clinical study justifies a cosmetic product claim, such as *"Reduces wrinkles by 20% in 4 weeks"*. It returns **Justified: Yes/No**, a **confidence score** and its **reasoning**. Each result is saved for audit and shown in a React UI with history.

📄 **Read the proposal:** [PROPOSAL.md](PROPOSAL.md) covers business understanding, research, architecture justification and the roadmap.

| Layer | Tech |
| --- | --- |
| Frontend | React 18 + Vite |
| Backend | NestJS 11 |
| Database | Prisma 6 · SQLite locally (PostgreSQL-ready) |
| LLM | OpenAI (`gpt-4o` by default, JSON mode, temperature 0) |

## Run locally

Requires Node 20+ and an OpenAI API key.

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env          # then set OPENAI_API_KEY in .env
npx prisma migrate dev        # creates the SQLite database and tables
npm run start:dev             # http://localhost:3000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :3000)
```

Open http://localhost:5173 and try:

| Claim | Evidence | Expected |
| --- | --- | --- |
| Reduces wrinkles by 20% in 4 weeks | Randomised, placebo-controlled, 120 women, 4 weeks, wrinkle depth −22% vs −3% placebo, p<0.01 | Justified |
| Reduces wrinkles by 20% in 4 weeks | Open-label pilot, 12 women, 2 weeks, self-reported smoother skin, no control group | Not justified |

To browse the stored data: `cd backend && npx prisma studio`.

## API

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/api/claims/assess` | `{ "claim": string, "evidence": string }` | The saved assessment: `justified`, `confidence` (0–1), `reasoning`, `model`, `claim` |
| GET | `/api/claims/assessments` | none | The latest 50 assessments, newest first |

Errors: `400` invalid input · `502` the OpenAI call failed or returned invalid output · `503` no API key configured.

## Project structure

```
backend/
  prisma/schema.prisma              Claim and Assessment models
  src/claims/claims.controller.ts   HTTP routes + validation
  src/claims/claims.service.ts      orchestration only
  src/openai/openai.service.ts      the only class that talks to OpenAI
  src/claims/assessment-db.service.ts   the only class that talks to the DB
frontend/
  src/ClaimAssessor.jsx             form, result and history
```

## Switch to PostgreSQL

In `backend/prisma/schema.prisma`, set `provider = "postgresql"`. Set `DATABASE_URL` to a `postgresql://` URL, then run `npx prisma migrate dev`. No application code changes.
