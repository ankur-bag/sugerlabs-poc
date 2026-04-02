from app.models.user_model import UserInDB
from app.utils.prompts import SYSTEM_PROMPT_TEMPLATE


def get_tone_for_age(age_group: str) -> str:
    if age_group == "6-8":
        return "playful and highly encouraging, using simple words"
    elif age_group == "13+":
        return "analytical, respectful, and slightly complex, treating them as a young adult"
    return "supportive and clear"


def build_past_reflection_block(past_reflection: dict | None) -> str:
    """Format the past session memory for injection into the system prompt."""
    if not past_reflection:
        return (
            "No past session found for this learner. "
            "Skip the callback and begin Stage 1 directly."
        )

    activity = past_reflection.get("activity", "")
    insight = past_reflection.get("insight", "")
    experimentation = past_reflection.get("experimentation", "")

    if not activity:
        return "No past session found. Skip the callback and begin Stage 1 directly."

    return (
        f"The learner has a previous session. Open with a warm callback before Stage 1.\n"
        f"Example: \"Last time you worked on {activity}, you mentioned {insight}. "
        f"Did you get a chance to try {experimentation}?\"\n"
        f"Adapt the callback naturally — don't copy it word for word."
    )


def format_system_prompt(
    user: UserInDB,
    activity_type: str,
    project_name: str,
    past_reflection: dict | None = None,
) -> str:
    past_reflection_block = build_past_reflection_block(past_reflection)
    return SYSTEM_PROMPT_TEMPLATE.format(
        name=user.name,
        age_group=user.ageGroup,
        activity_type=activity_type,
        project_name=project_name,
        past_reflection_block=past_reflection_block,
    )
