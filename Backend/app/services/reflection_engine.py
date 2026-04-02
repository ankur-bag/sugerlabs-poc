import re
import json
import logging
from app.models.reflection_model import ReflectionSession
from app.models.user_model import UserInDB
from app.services.llm_service import generate_chat_response
from app.services.personalization import format_system_prompt
from app.utils.prompts import QUALITY_SCORE_PROMPT

logger = logging.getLogger(__name__)


def _strip_json_fences(text: str) -> str:
    """Strip markdown code fences that Gemini sometimes wraps JSON in."""
    # Matches ```json ... ``` or ``` ... ```
    stripped = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.IGNORECASE)
    stripped = re.sub(r"\s*```$", "", stripped.strip())
    return stripped.strip()


async def process_next_question(session: ReflectionSession, user: UserInDB) -> str:
    """Generate the next question based on Kolb's 4-stage cycle (4-question limit)."""

    user_msg_count = sum(1 for m in session.messages if m.role == "user")

    if user_msg_count == 0:
        session.current_stage = "concrete experience"
    elif user_msg_count == 1:
        session.current_stage = "reflective observation"
    elif user_msg_count == 2:
        session.current_stage = "abstract conceptualization"
    elif user_msg_count == 3:
        session.current_stage = "active experimentation"
    else:
        session.current_stage = "done"

    if session.current_stage == "done":
        return "Thank you for sharing your reflections! You're a great maker ⭐"

    # Read past_reflection stored on the session document (written at /start-reflection)
    past_reflection = getattr(session, "past_reflection", None)
    system_prompt = format_system_prompt(
        user, session.activity_type, session.project_name, past_reflection
    )

    if not session.messages:
        history = []
        new_message = (
            f"Hello! The student has just finished {session.activity_type}. "
            f"Start the '{session.current_stage}' stage reflection."
        )
    else:
        history = [{"role": msg.role, "content": msg.content} for msg in session.messages]
        last_msg = history.pop()

        if last_msg.get("role") == "user":
            new_message = last_msg["content"]
        else:
            history.append(last_msg)
            new_message = "Please ask the next follow-up question."

    response_text = await generate_chat_response(system_prompt, history, new_message)

    if "Stage: complete" in response_text or "stage: complete" in response_text.lower():
        session.current_stage = "done"
        return "You've completed the reflection journal! Thank you for sharing your thoughts! redirecting..."

    clean_question = response_text
    if "Question:" in response_text:
        clean_question = response_text.split("Question:", 1)[1].strip()
    elif "\n" in response_text:
        parts = response_text.split("\n", 1)
        if "Stage:" in parts[0] and len(parts) > 1:
            clean_question = parts[1].strip()

    return clean_question


async def generate_summary(session: ReflectionSession, user: UserInDB) -> dict:
    """
    Summarize the reflection session and return a quality score dict.

    Returns a dict with: journal_entry, scores, reasoning, feedback, save_to_memory.
    """
    history = [{"role": msg.role, "content": msg.content} for msg in session.messages]

    # Format the prompt with the student's name for personalized reasoning
    personalized_prompt = QUALITY_SCORE_PROMPT.format(name=user.name)

    response_text = await generate_chat_response(
        personalized_prompt,
        history,
        "Please evaluate this reflection session and return the JSON report."
    )

    # Strip markdown fences before parsing (Gemini often wraps output)
    cleaned = _strip_json_fences(response_text)

    try:
        result = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError) as e:
        logger.warning("generate_summary: Failed to parse quality score JSON: %s\nRaw: %s", e, response_text)
        # Return a safe fallback so the session still saves
        result = {
            "journal_entry": "I had a great time reflecting on my project today!",
            "scores": {"experience": 3, "reflection": 3, "conceptualization": 3, "experimentation": 3, "overall": 3},
            "reasoning": {"experience": "N/A", "reflection": "N/A", "conceptualization": "N/A", "experimentation": "N/A", "overall": "N/A"},
            "feedback": "Great effort on your reflection today!",
            "save_to_memory": {}
        }

    return result
