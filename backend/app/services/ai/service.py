import time
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session
from app.models.domain import AIRun, Lead
from app.services.ai.factory import get_ai_provider
from app.schemas.ai import ResearchSummary, OutreachDraft

T = TypeVar("T", bound=BaseModel)

class AIServiceRunner:
    def __init__(self, db: Session, owner_id: int = None):
        self.db = db
        self.owner_id = owner_id
        self.provider = get_ai_provider()
        self.provider_name = self.provider.__class__.__name__

    def _execute_and_log(
        self,
        task_type: str,
        system_prompt: str,
        user_prompt: str,
        response_model: Type[T]
    ) -> T:
        start_time = time.time()

        ai_run = AIRun(
            owner_id=self.owner_id,
            provider=self.provider_name,
            model="default",
            task_type=task_type,
            prompt_version="v1",
            input_data={"system": system_prompt, "user": user_prompt},
            status="pending",
        )
        self.db.add(ai_run)
        self.db.commit()

        try:
            result = self.provider.generate_structured(system_prompt, user_prompt, response_model)

            ai_run.output_data = result.model_dump()
            ai_run.validation_status = "success"
            ai_run.status = "completed"

        except ValidationError as e:
            ai_run.output_data = {"error": "ValidationError", "details": e.errors()}
            ai_run.validation_status = "failed"
            ai_run.status = "failed"
            self.db.commit()
            raise e
        except Exception as e:
            ai_run.output_data = {"error": str(e)}
            ai_run.validation_status = "unknown"
            ai_run.status = "failed"
            self.db.commit()
            raise e
        finally:
            end_time = time.time()
            ai_run.latency_ms = int((end_time - start_time) * 1000)
            self.db.commit()

        return result

    def generate_lead_research(self, lead: Lead) -> ResearchSummary:
        system_prompt = (
            "You are an expert PR researcher. Analyze the company details and provide a structured summary, "
            "identifying PR angles, personalization opportunities, and talking points. "
            "Return valid JSON matching the schema."
        )
        user_prompt = (
            f"Company: {lead.company_name}\n"
            f"Industry: {lead.industry}\n"
            f"Website: {lead.website}\n"
            f"Description: {lead.description}\n"
        )

        return self._execute_and_log(
            task_type="lead_research",
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=ResearchSummary,
        )

    def generate_outreach(self, lead: Lead, goal: str, tone: str, channel: str, key_angle: str) -> OutreachDraft:
        system_prompt = (
            "You are an experienced PR communications assistant. "
            "Your job is to create concise, personalized and fact-based outreach messages. "
            "Never invent facts. Use only information provided. "
            "Keep the message professional and make personalization obvious."
        )
        user_prompt = (
            f"Company: {lead.company_name}\n"
            f"Contact: {lead.contact_name}\n"
            f"Role: {lead.job_title}\n"
            f"Industry: {lead.industry}\n"
            f"Key angle: {key_angle}\n"
            f"Tone: {tone}\n"
            f"Channel: {channel}\n"
            f"Goal: {goal}\n"
        )

        return self._execute_and_log(
            task_type="outreach_generation",
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            response_model=OutreachDraft,
        )
