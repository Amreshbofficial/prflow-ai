# Architectural Decisions

## Why Next.js?
Next.js provides a robust React framework with App Router, built-in API routes if needed, great TypeScript support, and strong defaults for production (SEO, performance, image optimization). It fits the standard modern stack expected for full-stack developers.

## Why FastAPI?
FastAPI is highly performant, natively supports async operations (crucial for calling external AI APIs), and uses Pydantic for data validation. This makes parsing and validating AI-generated JSON extremely safe and reliable.

## Why PostgreSQL & SQLAlchemy?
PostgreSQL is the industry standard for relational data. SQLAlchemy (with Alembic) provides a mature ORM and migration path for relational data like users, leads, and tracking analytics.

## Why abstract AI providers?
By creating an `AIService` abstraction, we prevent the application from being tightly coupled to OpenAI. This allows us to inject a `MockAIProvider` for demo purposes and fallback to Anthropic if OpenAI is down. 

## Why Demo Mode?
`DEMO_MODE=true` allows the application to function entirely locally without external API keys. This is critical for reviewers and hiring managers to quickly evaluate the app's functionality without configuring secrets.

## Why No Real Email / Twilio?
The goal is a small, polished MVP. Integrating real SMTP or Twilio requires handling bounce rates, complex rate limits, and actual API credentials, which distracts from the core requirement of demonstrating PR automation workflows and AI generation. These are treated as future roadmap items.
