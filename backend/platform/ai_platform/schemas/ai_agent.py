from pydantic import BaseModel
from typing import Optional, List
import uuid


class AiAgentBase(BaseModel):
    name: str
    model_name: str = "gpt-4"
    model_type: str
    vector_index: str
    response_token_limit: int
    temperature: float
    description: Optional[str] = None


class AiAgentCreate(AiAgentBase):
    pass


class AiAgentUpdate(AiAgentBase):
    pass


class AiAgentInDB(AiAgentBase):
    id: int

    class Config:
        orm_mode = True


class ConversationBase(BaseModel):
    agent_id: int
    user_id: int
    conversations: List[dict]


class ConversationCreate(ConversationBase):
    pass


class ConversationInDB(ConversationBase):
    id: uuid.UUID

    class Config:
        orm_mode = True
