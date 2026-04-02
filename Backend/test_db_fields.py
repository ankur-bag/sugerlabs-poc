import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import pprint
from dotenv import load_dotenv

load_dotenv()

async def main():
    MONGO_DETAILS = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("MONGODB_DB_NAME", "reflect_journal")
    client = AsyncIOMotorClient(MONGO_DETAILS)
    db = client[DB_NAME]
    print("Checking 'reflections' collection for recent entries...")
    cursor = db.reflections.find().sort("_id", -1).limit(3)
    docs = await cursor.to_list(length=3)
    for doc in docs:
        print(f"ID: {doc.get('_id')} - {doc.get('projectName')}")
        print("Quality Score exists:", "quality_score" in doc)
        if "quality_score" in doc:
            pprint.pprint(doc["quality_score"])
        print("-" * 40)
        
    print("Checking 'users' collection for last_memory...")
    cursor = db.users.find().sort("_id", -1).limit(3)
    docs = await cursor.to_list(length=3)
    for doc in docs:
        print(f"User: {doc.get('name')}")
        print("Last Memory exists:", "last_memory" in doc)
        if "last_memory" in doc:
            pprint.pprint(doc["last_memory"])
        print("-" * 40)
        
if __name__ == "__main__":
    asyncio.run(main())
