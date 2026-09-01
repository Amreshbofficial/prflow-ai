# AI Workflow

This project uses AI in two distinct ways: as a **product feature** (AI-powered outreach generation for end users) and as a **development methodology** (AI-assisted coding via Codebuff).

---

## Part 1: End-User AI Workflow (Product Feature)

The PR consultant interacts with AI through a guided pipeline:

### Step 1: Lead Input
User creates a lead with company name, website, industry, contact info, and optional description.

### Step 2: AI Lead Research
User clicks "Research" on a lead detail page.

```
Frontend
  → POST /api/v1/leads/{id}/research
    → AIServiceRunner.run_research(lead_data)
      → get_ai_provider() selects MockAIProvider / OpenAI / Anthropic
      → Provider generates structured ResearchSummary (Pydantic model)
      → Response validated against schema
      → Saved to leads.research_data (JSON column)
      → ai_runs record created (provider, model, latency, status)
    → ResearchSummary returned to frontend
    → Displayed in lead detail page
    → Persisted — survives page refresh
```

**Research output includes:**
- Company summary
- Key PR angles (3-5)
- Personalization opportunities
- Suggested talking points
- Recommended approach

### Step 3: AI Outreach Generation
User navigates to outreach generation, selects a lead, and configures:
- **Channel**: Email / LinkedIn / Twitter
- **Goal**: Introductory Call / Partnership / Product Launch / Event / General
- **Tone**: Professional & Direct / Friendly & Casual / Formal & Corporate / Bold & Disruptive
- **Key Angle**: Optional focus area

```
Frontend
  → POST /api/v1/outreach/generate
    → AIServiceRunner.run_outreach(lead_data, channel, goal, tone, key_angle)
      → get_ai_provider() selects provider
      → Provider generates subject + message (Pydantic model)
      → Response validated against schema
      → Saved to outreach_messages (status=Draft, ai_generated=True)
      → ai_runs record created
    → OutreachResponse returned to frontend
    → User reviews in rich text editor
```

### Step 4: Human Review & Edit
The generated message loads in an editable text area. The consultant:
- Reviews AI output
- Edits content as needed
- Saves changes → PATCH `/api/v1/outreach/{id}` sets `human_edited=True`

### Step 5: Send
User clicks "Send" → POST `/api/v1/outreach/{id}/send`

```
If RESEND_API_KEY is configured:
  → Resend API called with recipient, subject, body
  → Success: status → "Sent"
  → Failure: status → "Failed", error logged
  → ai_runs record updated

If RESEND_API_KEY is NOT configured:
  → RuntimeError raised with clear message:
    "Email provider not configured. Set RESEND_API_KEY to enable real email sending."
  → Status remains "Draft"
  → User sees error toast explaining what's needed
```

### Step 6: Follow-up
User creates a follow-up task linked to the lead/outreach:
- Due date + time
- Notes
- Status transitions: Pending → Completed / Overdue
- Snooze: Updates due date
- Delete: Removes the task

---

## Part 2: AI Provider Architecture

### Provider Abstraction

```python
# backend/app/services/ai/base.py
class AIProvider(ABC):
    @abstractmethod
    def generate_structured(self, system_prompt, user_prompt, response_model: Type[T]) -> T:
        """Generates structured response conforming to Pydantic model."""
        pass
```

### Provider Factory

```python
# backend/app/services/ai/factory.py
def get_ai_provider() -> AIProvider:
    if settings.DEMO_MODE:
        return MockAIProvider()
    if settings.ANTHROPIC_API_KEY:
        return AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY)
    if settings.OPENAI_API_KEY:
        return OpenAIProvider(api_key=settings.OPENAI_API_KEY)
    return MockAIProvider()  # Fallback if no keys configured
```

### Provider Selection Logic
| Condition | Provider Used |
|-----------|--------------|
| `DEMO_MODE=true` | MockAIProvider |
| `DEMO_MODE=false` + `ANTHROPIC_API_KEY` set | AnthropicProvider |
| `DEMO_MODE=false` + `OPENAI_API_KEY` set | OpenAIProvider |
| `DEMO_MODE=false` + no keys set | MockAIProvider (fallback) |

### MockAIProvider Behavior
- No API keys required
- Parses lead data from the prompt (company name, industry, etc.)
- Returns **dynamic** responses based on actual input data (not static templates)
- Includes realistic company summaries, PR angles, and outreach messages
- Response time: ~0.5s (simulated delay)

### Pydantic Validation
Every AI response is validated against strict schemas:

```python
class ResearchSummary(BaseModel):
    company_summary: str
    key_pr_angles: list[str]
    personalization_opportunities: list[str]
    suggested_talking_points: list[str]
    recommended_approach: str

class OutreachContent(BaseModel):
    subject: str
    message: str
```

If the AI returns invalid JSON or mismatched fields:
- Validation fails gracefully
- Error is logged
- `ai_runs` record shows `validation_status=failed`
- User sees a meaningful error message

### AI Runs Tracking
Every AI execution creates a record in `ai_runs`:

| Field | Description |
|-------|-------------|
| `owner_id` | User who triggered the AI call |
| `provider` | Which provider was used |
| `model` | Specific model name |
| `task_type` | `research` or `outreach` |
| `input_data` | What was sent to the AI |
| `output_data` | What the AI returned |
| `validation_status` | `passed` or `failed` |
| `status` | `success` or `error` |
| `latency_ms` | How long the call took |

---

## Part 3: Developer AI Workflow (How This Project Was Built)

This project was built using **AI-assisted development with Codebuff**.

### Development Process

1. **Specification**: Created a detailed PRD and architecture document defining boundaries, features, and non-goals.

2. **Implementation Planning**: Decomposed the project into ordered phases:
   - Authentication → Database → AI Providers → Leads → Outreach → Follow-ups → Analytics → Settings → Testing

3. **AI-Assisted Implementation**: Used Codebuff to implement each phase. The AI wrote:
   - Backend: FastAPI routes, SQLAlchemy models, Pydantic schemas, AI service layer
   - Frontend: Next.js pages, React Query hooks, API client, UI components
   - Testing: Backend pytest suite
   - Configuration: Vercel deployment, Alembic migrations

4. **Human Review & Verification**: Every AI-generated change was:
   - Reviewed for correctness
   - Tested against the running application
   - Verified with automated tests (32/32 smoke tests passing)
   - Checked for security issues (data isolation, no secret exposure)

5. **Bug Fixes**: AI-assisted debugging of:
   - React Query cache leaking between users (stale data after logout)
   - JavaScript operator precedence bug in login error messages
   - Vercel deployment compatibility (Next.js 16→15 downgrade)
   - Alembic migration conflicts (duplicate migration files)
   - Deprecated `datetime.utcnow()` usage

6. **Git Discipline**: Meaningful commits at each phase with clear messages.

### What AI Did Well
- Rapid scaffolding of CRUD endpoints and React pages
- Consistent code style across frontend and backend
- Pydantic schema design with proper validation
- AI provider abstraction with factory pattern
- Comprehensive test suite generation

### What Required Human Judgment
- Architecture decisions (Vercel serverless vs. separate hosting)
- Security review (data isolation, IDOR protection)
- UX decisions (cache clearing on logout, error message wording)
- Deployment debugging (Vercel Python version, Next.js compatibility)
- Prioritization of features vs. polish

### Lessons Learned
- AI works best with clear specifications and boundaries
- Human review is essential for security-critical code
- Testing catches issues that code review misses
- Incremental commits make AI-assisted debugging easier
- Deployment configuration requires platform-specific knowledge that AI may not have
