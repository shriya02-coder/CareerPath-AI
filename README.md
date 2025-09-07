# CareerPath AI Lite

**CareerPath AI Lite** is a streamlined, production-ready prototype based on three high-value workflows:

1) Build a strong **Career Identity** statement (AI-generated)  
2) **Explore roles** with fast search + working category filters  
3) **Optimize resumes** with multi-job paste, inline per-bullet rewrites, and AI-driven tips (+ cover letter generation)

**Core value:** reliable, end-to-end AI assistance without flaky PDF/DOCX parsers or mock fallbacks.

---

## ✨ Features

### Landing + Navigation
- Clean, responsive landing with brand gradient
- “Resume Help” buttons open in a new tab for faster access

### Career Identity Builder (AI)
- Multi-step form: role, experience, education, skills, interests, achievements, goals
- 35+ roles, 42+ skills, with custom additions and quick goal suggestions
- Generates a concise, professional **Career Identity** statement

### Career Explorer
- Single search bar + collapsible Filters panel
- Categories: **Technology, Design & Creative, Business & Strategy, Marketing & Communications**
- Sorting: **Growth, Salary, Demand, A–Z**
- Fast cards with match details and deep links to detail pages
- Loading spinner while fetching

### Career Detail
- Description, skills, salary, growth, demand
- CTAs to explore more or open Resume Help in a new tab

### Resume Assistant (Paste-Only, Multi-Job)
- Paste-only (no fragile PDF/DOCX parsing)
- Add Job: Company, Role/Title, Period + textarea (one bullet per line)
- Inline per-bullet **Rewrite**: calls AI with target context → returns improved bullet, rationale, keywords → **Apply** replaces in place
- **Optimize Resume (full pass)**:
  - `optimizedGuide`: clear, actionable pointers tailored to the target job
  - `jobEdits`: per-job, per-bullet improvements (original, improved, rationale, keywords)
  - `proTips`: resume-specific tips derived from the user’s content
- **Cover Letter** generation tab

### Real AI Integration
- Emergent LLM Key via **emergentintegrations**
- Model: **OpenAI gpt-4o-mini** 
- **Strict JSON prompting** with robust fallbacks to ensure useful output

---

## 🧱 Tech Stack

- **Frontend:** React + Vite, TypeScript, TailwindCSS, shadcn/ui, React Router
- **Backend:** Node.js, TypeScript, Express
- **AI:** Emergent Integrations SDK → OpenAI gpt-4o-mini
- **Store/Cache:** Redis (rate limiting, transient job state)
- **Data:** Local JSON store or PostgreSQL (via Prisma) — both supported
- **Testing:** Vitest (frontend), Jest (backend)
- **Lint/Format:** ESLint, Prettier
- **Infra:** Docker, Docker Compose, GitHub Actions (CI)

