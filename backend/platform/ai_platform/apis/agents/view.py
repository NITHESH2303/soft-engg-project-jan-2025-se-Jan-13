import os
from typing import List, Dict, Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import pdfplumber
from io import BytesIO
from fastapi import UploadFile, File, Form
from ai_platform.agents.openai_agent import Agents
from ai_platform.agents.streaming_services import OpenAIStreaming
from starlette.responses import StreamingResponse
from fastapi import APIRouter, Depends, HTTPException

from ai_platform.apis.agents import crud
from ai_platform.schemas.ai_agent import AiAgentInDB, AiAgentCreate, AiAgentUpdate, CreateKnowledgeBaseResponse, \
    CreateKnowledgeBaseRequest
from ai_platform.supafast.database import get_db
from ai_platform.vectordb.db_pgvector import PgvectorDB
from docx import Document

streamClient = OpenAIStreaming()
agents = Agents()

router = APIRouter()


def extract_text_from_file(file: UploadFile) -> str:
    """Extracts text from a given uploaded file (PDF, DOCX, TXT)"""
    try:
        if file.filename.endswith(".pdf"):
            with pdfplumber.open(BytesIO(file.file.read())) as pdf:
                return "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])

        elif file.filename.endswith(".docx"):
            doc = Document(BytesIO(file.file.read()))
            return "\n".join([para.text for para in doc.paragraphs])

        elif file.filename.endswith(".txt"):
            return file.file.read().decode("utf-8")

        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDF, DOCX, and TXT are allowed.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


@router.post("/create_knowledgebase", response_model=CreateKnowledgeBaseResponse)
async def create_knowledge_base(
        vector_index: str = Form(...),
        content: Optional[str] = Form(None),
        file: Optional[UploadFile] = File(None)
):
    """API to create the knowledge base with either raw text or an uploaded document"""
    if not content and not file:
        raise HTTPException(status_code=400, detail="Either 'content' or 'file' must be provided.")

    extracted_text = content or ""  # Start with provided content if available

    if file:
        extracted_text += "\n" + extract_text_from_file(file)

    try:
        vectorstore = PgvectorDB(collection_name=vector_index, connection_str=os.getenv("SQLALCHEMY_DATABASE_URL"))
        docs = vectorstore.create_docs_from_text(text=extracted_text, chunk_size=500)
        vectorstore.create_embeddings(docs)

        return CreateKnowledgeBaseResponse(
            status=True,
            document_inserted_count=len(docs),
            vector_index=vector_index
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    #
    response = await agents.parser_agent(message)
    collection_name = response['vector_index']
    print(f"Collection name to looked at.", collection_name)
    vectordb = PgvectorDB(collection_name=collection_name, connection_str=os.getenv("SQLALCHEMY_DATABASE_URL"))
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
