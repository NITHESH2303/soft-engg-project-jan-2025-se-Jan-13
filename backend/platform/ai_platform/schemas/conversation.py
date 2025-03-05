import uuid
from pydantic import BaseModel
from typing import List, Dict, Any


class ConversationBase(BaseModel):
    user_id: int
    conversations: List[Dict[str, Any]]  # JSONB data (list of messages)


class ConversationCreate(ConversationBase):
    agent_id: int


class ConversationUpdate(BaseModel):
    conversations: List[Dict[str, Any]]  # JSONB update data


class ConversationResponse(ConversationBase):
    id: uuid.UUID

    class Config:
        orm_mode = True  # Enable ORM compatibility
