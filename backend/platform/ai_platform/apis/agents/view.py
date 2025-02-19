from typing import List, Dict

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ai_platform.agents.openai_agent import Agents
from ai_platform.agents.streaming_services import OpenAIStreaming
from starlette.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException

from ai_platform.apis.agents import crud
from ai_platform.schemas.ai_agent import AiAgentInDB, AiAgentCreate, AiAgentUpdate
from ai_platform.supafast.database import get_db
from ai_platform.vectordb.db_pinecone import PineconeVectorDb

streamClient = OpenAIStreaming()
agents = Agents()
vectordb = PineconeVectorDb("iitm-vector-index")

router = APIRouter()


@router.get("/agents/", response_model=List[AiAgentInDB])
def read_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    agents = crud.get_agents(db, skip=skip, limit=limit)
    return agents


@router.post("/agents/", response_model=AiAgentInDB)
def create_agent(agent: AiAgentCreate, db: Session = Depends(get_db)):
    return crud.create_agent(db=db, agent=agent)


@router.put("/agents/{agent_id}", response_model=AiAgentInDB)
def update_agent(agent_id: int, agent: AiAgentUpdate, db: Session = Depends(get_db)):
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return crud.update_agent(db=db, agent_id=agent_id, agent=agent)


@router.delete("/agents/{agent_id}", response_model=AiAgentInDB)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return crud.delete_agent(db=db, agent_id=agent_id)


class StreamingRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = Field(default_factory=list, description="List of previous interactions")


@router.post("/host_agent")
async def host_agent(request: StreamingRequest):
    message = request.message
    history = request.history
    context = vectordb.get_context_for_query(message, include_metadata=False)
    print(context)
    response_stream = agents.stream_generator(await agents.host_agent(message,
                                                                      history=history,
                                                                      context=context, streaming=True))

    return StreamingResponse(response_stream, media_type='text/event-stream')


@router.post(
    "/openai_streaming",
)
async def openai_streaming(request):
    return StreamingResponse(
        streamClient.stream_string("Sample Streaming Data"),
        media_type='text/event-stream')
