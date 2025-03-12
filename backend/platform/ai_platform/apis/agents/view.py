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
from ai_platform.apis.courses.crud import get_course
from ai_platform.apis.students.course_crud import get_course_weeks
from ai_platform.schemas.ai_agent import AiAgentInDB, AiAgentCreate, AiAgentUpdate, CreateKnowledgeBaseResponse, \
    CreateKnowledgeBaseRequest
from ai_platform.supafast.database import get_db
from ai_platform.vectordb.db_pgvector import PgvectorDB
from docx import Document

streamClient = OpenAIStreaming()
agents = Agents()

router = APIRouter()


def extract_text_from_file(file: UploadFile) -> str:
    """
    **Extract text from an uploaded file (PDF, DOCX, TXT).**

    **Args:**
        file (UploadFile): The uploaded file object.

    **Returns:**
        str: Extracted text from the file.

    **Raises:**
        HTTPException: If the file type is unsupported or an error occurs during processing.
    """
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
    """
    **Create a knowledge base using raw text or an uploaded document.**

    This API allows users to provide either a text input or an uploaded document (PDF, DOCX, TXT) 
    to create a knowledge base.

    **Args:**
        vector_index (str): The name of the vector database index.
        content (Optional[str]): The raw text content to store in the knowledge base.
        file (Optional[UploadFile]): A document file from which text will be extracted.

    **Returns:**
        CreateKnowledgeBaseResponse: A response containing the status, document count, and vector index.

    **Raises:**
        HTTPException: If neither 'content' nor 'file' is provided.
        HTTPException: If an error occurs while processing the file or creating embeddings.
    """
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
    metadata: Dict[str, str] | None


@router.post("/host_agent")
async def host_agent(request: StreamingRequest, db: Session = Depends(get_db)):
    """
    **Host an AI agent conversation and stream responses.**

    **Args:**
        request (StreamingRequest): The request containing the user's message and interaction history.

    **Returns:**
        StreamingResponse: The AI agent's response as a streaming event.
    """
    message = request.message
    history = request.history
    metadata = request.metadata
    course_id = metadata.get("course_id")
    if course_id:
        try:
            course_week_details = get_course_weeks(db=db, course_id=int(course_id))
            course_data = get_course(db=db, course_id=int(course_id))
            course_context = f"Below is current course details where user opened the chatbot: {course_data}"
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail=f"Error from backend:{e}")
    #
    else:
        course_context = None
    response = await agents.parser_agent(message, context=course_context)
    print("Parser Agent Response", response)
    collection_name = response['vector_index']
    print(f"Collection name to looked at.", collection_name)
    if collection_name == "general":
        context = ""
    else:
        vectordb = PgvectorDB(collection_name=collection_name, connection_str=os.getenv("SQLALCHEMY_DATABASE_URL"))
        context = vectordb.get_context_for_query(message, include_metadata=False)
        print(context)
    if course_id:
        context = context+(f" Below is the actual context for most recent user message:"
                           f"Course Detail: {course_data}"
                           f"Weekwise Details:\n{course_week_details}\n")
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
