from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from app.models.reflection_model import ReflectionSession, Message
from app.models.user_model import UserInDB
from app.db.mongo import get_database
from app.services.reflection_engine import process_next_question, generate_summary

router = APIRouter()

from typing import Optional

class StartReflectionRequest(BaseModel):
    clerk_id: str
    activity_type: str
    project_name: Optional[str] = "Untitled Project"
    mode: Optional[str] = "guided"

class NextQuestionRequest(BaseModel):
    session_id: str

class SubmitResponseRequest(BaseModel):
    session_id: str
    content: str
    
class SummarizeRequest(BaseModel):
    session_id: str

async def get_session_and_user(session_id: str):
    db = get_database()
    # Query active conversational state from 'sessions' collection
    session_dict = await db.sessions.find_one({"_id": ObjectId(session_id)})
    if not session_dict:
        raise HTTPException(status_code=404, detail="Session not found")
        
    user_dict = await db.users.find_one({"clerkId": session_dict["user_id"]})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
        
    session_dict["_id"] = str(session_dict["_id"])
    user_dict["_id"] = str(user_dict["_id"])
    
    session = ReflectionSession(**session_dict)
    return session, UserInDB(**user_dict)

@router.post("/start-reflection", response_model=ReflectionSession)
async def start_reflection(req: StartReflectionRequest):
    db = get_database()
    user_dict = await db.users.find_one({"clerkId": req.clerk_id})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_dict["_id"] = str(user_dict["_id"])
    user = UserInDB(**user_dict)
    
    # Store user's last memory on the session to inject into AI context
    past_reflection = getattr(user, "last_memory", None)

    session = ReflectionSession(
        user_id=req.clerk_id,
        project_name=req.project_name,
        activity_type=req.activity_type,
        current_stage="experience",
        mode=req.mode,
        past_reflection=past_reflection
    )
    
    session_dict = session.model_dump(by_alias=True, exclude_none=True)
    result = await db.sessions.insert_one(session_dict)
    
    session.id = str(result.inserted_id)
    return session

@router.post("/next-question")
async def next_question(req: NextQuestionRequest):
    db = get_database()
    session, user = await get_session_and_user(req.session_id)
    
    question_text = await process_next_question(session, user)
    
    msg = Message(role="assistant", content=question_text)
    session.messages.append(msg)
    
    await db.sessions.update_one(
        {"_id": ObjectId(req.session_id)},
        {"$set": {"messages": [m.model_dump() for m in session.messages], "current_stage": session.current_stage}}
    )
    
    return {"question": question_text, "current_stage": session.current_stage}

@router.post("/submit-response")
async def submit_response(req: SubmitResponseRequest):
    db = get_database()
    session, _ = await get_session_and_user(req.session_id)
    
    msg = Message(role="user", content=req.content)
    session.messages.append(msg)
    
    await db.sessions.update_one(
        {"_id": ObjectId(req.session_id)},
        {"$set": {"messages": [m.model_dump() for m in session.messages]}}
    )
    
    return {"status": "success", "message": "Response recorded"}

@router.post("/summarize")
async def summarize(req: SummarizeRequest):
    db = get_database()
    session, user = await get_session_and_user(req.session_id)
    
    # generate_summary now returns detailed V2.1 dict
    summary_data = await generate_summary(session, user)
    
    journal_entry = summary_data.get("journal_entry", "")
    quality_score = {
        "scores": summary_data.get("scores", {}),
        "reasoning": summary_data.get("reasoning", {}),
        "feedback": summary_data.get("feedback", "")
    }
    
    save_to_memory = summary_data.get("save_to_memory", {})
    
    from datetime import datetime, timezone
    
    reflections_arr = []
    for i in range(len(session.messages)-1):
        if session.messages[i].role == "assistant" and session.messages[i+1].role == "user":
            reflections_arr.append({
                "question": session.messages[i].content,
                "answer": session.messages[i+1].content
            })
            
    # Write final synthesized format into 'reflections' collection
    await db.reflections.insert_one({
        "session_id": req.session_id,
        "user_id": session.user_id,
        "projectName": getattr(session, "project_name", "Untitled Project"),
        "activityType": session.activity_type,
        "summary": journal_entry, # Use first-person summary
        "quality_score": quality_score,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "reflections": reflections_arr
    })
    
    # Update user with the new memory for the next session
    if save_to_memory:
        await db.users.update_one(
            {"clerkId": session.user_id},
            {"$set": {"last_memory": save_to_memory}}
        )
    
    # Update active session to show it was summarized
    await db.sessions.update_one(
        {"_id": ObjectId(req.session_id)},
        {"$set": {
            "quality_score": quality_score, 
            "summary": journal_entry,
            "current_stage": "done"
        }}
    )
    
    return {
        "summary": journal_entry, 
        "quality_score": quality_score
    }

@router.get("/reflections/{clerk_id}")
async def get_reflections(clerk_id: str):
    db = get_database()
    cursor = db.reflections.find({"user_id": clerk_id}).sort("_id", -1)
    reflections = await cursor.to_list(length=100)
    for r in reflections:
        r["_id"] = str(r["_id"])
    return {"entries": reflections}
