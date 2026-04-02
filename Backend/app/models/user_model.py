from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime, timezone

class UserOnboarding(BaseModel):
    clerkId: str
    name: str
    ageGroup: str 
    interests: List[str] 
    currentFocus: str 
    skillLevel: str 

class UserInDB(UserOnboarding):
    id: Optional[str] = Field(alias="_id", default=None)
    last_memory: Optional[Dict[str, Any]] = None # Stores the save_to_memory block from last session
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "name": "Ankur",
                "ageGroup": "9-12",
                "interests": ["coding", "music"],
                "currentFocus": "coding",
                "skillLevel": "beginner",
                "last_memory": {
                    "activity": "building a game",
                    "insight": "loops are powerful",
                    "experimentation": "add music next time"
                }
            }
        }
    )
