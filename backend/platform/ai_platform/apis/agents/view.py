from typing import List, Dict

from pydantic import BaseModel, Field

from ai_platform.agents.openai_agent import Agents
from ai_platform.agents.streaming_services import OpenAIStreaming
from starlette.responses import StreamingResponse
from fastapi import APIRouter

from ai_platform.vectordb.db_pinecone import PineconeVectorDb

streamClient = OpenAIStreaming()
agents = Agents()
vectordb = PineconeVectorDb("iitm-vector-index")

router = APIRouter()


class StreamingRequest(BaseModel):
    message: str
    history: List[Dict[str, str]] = Field(default_factory=list, description="List of previous interactions")


@router.post("/host_agent")
async def host_agent(request: StreamingRequest):
    message = request.message
    history = request.history
    context = vectordb.get_context_for_query(message,include_metadata=False)
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
