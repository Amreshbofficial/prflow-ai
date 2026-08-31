# AI Workflow

This project heavily leverages AI not just as a feature within the product, but as a core aspect of the development and end-user workflow.

## End-User AI Workflow

The product guides the PR Consultant through a specific pipeline:

1. **Requirement / Input**: User inputs basic lead details (Company Name, Industry, Contact, URL).
2. **AI Lead-Research**: The system builds a structured AI prompt (System Instruction + Lead Context) and requests a company summary and PR angles.
3. **AI Outreach Generation**: User selects a goal, tone, and channel. The AI generates a customized pitch.
4. **Validation**: The backend validates the AI response against a strict Pydantic JSON schema. Failures are caught gracefully and logged to `ai_runs` for quality evaluation.
5. **Human Review (Editor)**: The generated message is loaded into a rich text editor. The PR consultant reviews, edits, and finalizes the AI draft.
6. **Execution**: The message is marked as approved and ready to be sent, tracking the state transition (`AI Generated` -> `Human Edited` -> `Approved`).

## Developer AI Workflow (Agent-Assisted)

This project was built using an AI-assisted development workflow (via Google Antigravity):

1. **Specification**: Clear markdown blueprint and PRD defining boundaries.
2. **Implementation Plan**: Decomposition of the blueprint into architectural phases and database schemas.
3. **Review**: Human evaluation of the plan to prevent hallucinated requirements or scope creep.
4. **Iterative Implementation**: Agent implements code phase-by-phase (Setup, DB Core, UI Shell, AI Providers, etc.).
5. **Testing & Fixes**: Human-in-the-loop testing of features, passing error logs back to the agent for bug fixing.
6. **Git History**: Each logical phase is committed incrementally.
