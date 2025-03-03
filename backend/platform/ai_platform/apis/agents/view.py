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
    """
    **Retrieve a list of AI agents.**
    
    **Args:**
        skip (int): Number of records to skip (pagination).
        limit (int): Maximum number of records to return.
        db (Session): Database session dependency.
    
    **Returns:**
        List[AiAgentInDB]: A list of AI agent records.
    """
    agents = crud.get_agents(db, skip=skip, limit=limit)
    return agents


@router.post("/agents/", response_model=AiAgentInDB)
def create_agent(agent: AiAgentCreate, db: Session = Depends(get_db)):
    """
    **Create a new AI agent.**
    
    **Args:**
        agent (AiAgentCreate): The AI agent data to create.
        db (Session): Database session dependency.
    
    **Returns:**
        AiAgentInDB: The created AI agent.
    """
    return crud.create_agent(db=db, agent=agent)


@router.put("/agents/{agent_id}", response_model=AiAgentInDB)
def update_agent(agent_id: int, agent: AiAgentUpdate, db: Session = Depends(get_db)):
    """
    **Update an existing AI agent.**

    **Args:**
        agent_id (int): The ID of the agent to update.
        agent (AiAgentUpdate): The updated agent data.
        db (Session): Database session dependency.

    **Returns:**
        AiAgentInDB: The updated AI agent.

    **Raises:**
        HTTPException: If the agent is not found.
    """
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return crud.update_agent(db=db, agent_id=agent_id, agent=agent)


@router.delete("/agents/{agent_id}", response_model=AiAgentInDB)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """
    **Delete an AI agent.**

    **Args:**
        agent_id (int): The ID of the agent to delete.
        db (Session): Database session dependency.

    **Returns:**
        AiAgentInDB: The deleted AI agent.

    **Raises:**
        HTTPException: If the agent is not found.
    """
    db_agent = crud.get_agent(db, agent_id=agent_id)
    if db_agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return crud.delete_agent(db=db, agent_id=agent_id)


class StreamingRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = Field(default_factory=list, description="List of previous interactions")


@router.post("/host_agent")
async def host_agent(request: StreamingRequest):
    """
    **Host an AI agent conversation and stream responses.**

    **Args:**
        request (StreamingRequest): The request containing the user's message and interaction history.

    **Returns:**
        StreamingResponse: The AI agent's response as a streaming event.
    """
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
    """
    **Stream data using OpenAI's streaming service.**

    **Args:**
        request: The incoming request (not currently used).

    **Returns:**
        StreamingResponse: Sample streaming data as an event stream.
    """
    return StreamingResponse(
        streamClient.stream_string("Sample Streaming Data"),
        media_type='text/event-stream')
