import uuid
from pydantic import BaseModel
from typing import List, Dict, Any

class ConversationBase(BaseModel):
    user_id: uuid.UUID
    conversation: List[Dict[str, Any]]  # JSONB data (list of messages)

class ConversationCreate(ConversationBase):
    pass  # No changes needed for create request

class ConversationUpdate(BaseModel):
    conversation: List[Dict[str, Any]]  # JSONB update data

class ConversationResponse(ConversationBase):
    id: uuid.UUID

    class Config:
        orm_mode = True  # Enable ORM compatibility
