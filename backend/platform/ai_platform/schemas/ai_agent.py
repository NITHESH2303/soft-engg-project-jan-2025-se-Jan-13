from pydantic import BaseModel, Field
from typing import Optional, List
import uuid


class AiAgentBase(BaseModel):
    name: str
    model_name: str = "gpt-4"
    system_prompt: str
    model_type: str
    vector_index: str | None
    response_format: str | None
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


# Request Model
class CreateKnowledgeBaseRequest(BaseModel):
    vector_index: str = Field(..., description="Name of the vector index to be created")
    content: str = Field(..., description="The content to perform embedding")


# Response Model
class CreateKnowledgeBaseResponse(BaseModel):
    status: bool = Field(..., description="Indicates if the operation was successful")
    document_inserted_count: int = Field(..., description="Number of documents inserted")
    vector_index: str = Field(..., description="Name of the created vector index")
