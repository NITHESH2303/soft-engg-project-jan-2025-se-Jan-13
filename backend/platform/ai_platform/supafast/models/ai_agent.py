from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, UUID
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
import uuid

from ai_platform.supafast.database import Base


class AiAgent(Base):
    __tablename__ = "ai_agents"

    id = Column(Integer, primary_key=True, index=True)
    system_prompt = Column(String, nullable=True, server_default="You are helpful assistant.")
    name = Column(String, index=True)
    model_name = Column(String, default="gpt-4")
    response_format = Column(String, server_default="text", doc="The response format of the gpt, can be json",nullable=True)
    model_type = Column(String)
    vector_index = Column(String)
    response_token_limit = Column(Integer)
    temperature = Column(Float)
    description = Column(String, nullable=True)

    conversations = relationship("Conversation", back_populates="agent")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(Integer, ForeignKey("ai_agents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    conversations = Column(JSONB)

    agent = relationship("AiAgent", back_populates="conversations")
    user = relationship("User", back_populates="conversations")
