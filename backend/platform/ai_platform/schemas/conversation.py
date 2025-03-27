import uuid
from datetime import datetime

from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class ConversationBase(BaseModel):
    user_id: int
    conversations: List[Dict[str, Any]]  # JSONB data (list of messages)


class ConversationCreate(ConversationBase):
    agent_id: int
    title: Optional[str] = None


class ConversationUpdate(BaseModel):
    conversations: List[Dict[str, Any]]  # JSONB update data
    modified_at: Optional[datetime] = None


# Pydantic schema for individual messages
class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


# Pydantic schema for a single conversation
class ConversationResponse(BaseModel):
    id: uuid.UUID
    user_id: int
    conversations: List[Message]
    title: Optional[str] = None
    created_at: datetime
    modified_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            uuid.UUID: lambda v: str(v)
        }
