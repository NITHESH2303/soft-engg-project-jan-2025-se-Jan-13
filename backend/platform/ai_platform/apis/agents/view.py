import os
import time
import uuid
from datetime import datetime
from typing import List, Dict, Optional

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import pdfplumber
from io import BytesIO
from fastapi import UploadFile, File, Form, Query

from ai_platform.agents.streaming_services import OpenAIStreaming
from starlette.responses import StreamingResponse, JSONResponse
from fastapi import APIRouter, Depends, HTTPException
from ai_platform.apis.agents import crud
from ai_platform.apis.agents.crud import get_agent
from ai_platform.apis.conversations.crud import update_conversation, get_conversation, create_conversation
from ai_platform.apis.courses.crud import get_course
from ai_platform.apis.students.course_crud import get_course_weeks
from ai_platform.schemas.ai_agent import AiAgentInDB, AiAgentCreate, AiAgentUpdate, CreateKnowledgeBaseResponse, \
    CreateKnowledgeBaseRequest
from ai_platform.schemas.conversation import ConversationUpdate, ConversationCreate
from ai_platform.supafast.database import get_db
from ai_platform.vectordb.db_pgvector import PgvectorDB
from docx import Document
from sse_starlette.sse import EventSourceResponse
import json
from ai_platform.agents.framework_agentic import Agents

# from ai_platform.agents.openai_agent import Agents

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





@router.get("/host_agent")
async def stream_agent_response(
        query: str,
        course_id: int = None,
        history: Optional[str] = Query(None, description="JSON-encoded chat history"),
        conversation_id: Optional[uuid.UUID] = Query(None, description="ID of existing conversation"),
        db: Session = Depends(get_db),
        agent_id: Optional[int] = Query(None, description="ID of the agent to use"),
        user_id: int = Query(..., description="ID of the authenticated user"),
        title: Optional[str] = Query(None, description="Title for new conversation")
):
    """Stream API endpoint that uses the agent_response method from agents.py and saves conversations"""

    # Set a default agent_id if none provided
    if not agent_id:
        agent_id = 8
    else:
        try:
            agent_id = int(agent_id)
        except (ValueError, TypeError):
            agent_id = 8

    # Get agent from database to validate it exists
    agent = get_agent(db, agent_id)
    if not agent:
        return JSONResponse(
            status_code=404,
            content={"error": f"Agent with ID {agent_id} not found"}
        )

    # Prepare course context if course_id is provided
    course_context = None

    if course_id:
        try:
            course_id = int(course_id)
        except (ValueError, TypeError):
            course_id = None
    
    if course_id:
        try:
            course_week_details = get_course_weeks(db=db, course_id=course_id)
            course_data = get_course(db=db, course_id=course_id)
            course_context = (f"Course Details: {course_data}\n"
                              f"Course Week Details: {course_week_details}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving course data: {e}")

    # Parse chat history
    chat_history = []
    if history:
        try:
            chat_history = json.loads(history)
            if not isinstance(chat_history, list):
                raise ValueError("History must be a list of message objects")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Invalid history format: {str(e)}")

    # Handle conversation creation or retrieval
    current_conversation_id = conversation_id
    if (len(chat_history) == 1 and not conversation_id) or (chat_history and not conversation_id):  
        # Use provided title, first user message, or timestamp as fallback
        first_message = query[:50] if query else "New Chat"  # Truncate to 50 chars
        convo_title = title or first_message or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

        convo_create = ConversationCreate(
            agent_id=agent_id,
            user_id=user_id,
            conversations=chat_history,
            title=convo_title
        )
        current_conversation_id = create_conversation(db, convo_create)
    elif conversation_id:  # Existing conversation
        conversation = get_conversation(db, conversation_id)
        if not conversation or conversation.user_id != user_id:
            return JSONResponse(
                status_code=404,
                content={"error": "Conversation not found or access denied"}
            )
    else:  # Fallback for empty history and no ID
        # Just use the query to start a new convo
        first_message = query[:50] if query else "New Chat"
        convo_title = title or first_message or f"Chat {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        convo_create = ConversationCreate(
            agent_id=agent_id,
            user_id=user_id,
            conversations=[],
            title=convo_title
        )
        current_conversation_id = create_conversation(db, convo_create)

    # Function to generate streaming events and update conversation
    async def event_generator():
        try:
            full_response = ""
            async for chunk in agents.stream_response(
                    user_input=query,
                    course_id=course_id,
                    agent_id=agent_id,
                    chat_history=chat_history,
                    context=course_context,
            ):
                # Parse the chunk to get the content
                try:
                    chunk_data = json.loads(chunk)
                    if chunk_data.get("type") == "text":
                        full_response += chunk_data.get("content", "")
                    elif chunk_data.get("type") == "end":
                        continue
                except json.JSONDecodeError:
                    full_response += chunk  # Fallback if not JSON

                yield {"data": chunk}

            # Update conversation with new message
            updated_history = chat_history + [
                {"role": "user", "content": query},
                {"role": "assistant", "content": full_response}
            ]
            update_data = ConversationUpdate(
                conversations=updated_history,
                modified_at=datetime.now()
            )
            updated_conversation = update_conversation(db, current_conversation_id, update_data)
            
            # Include conversation metadata in the final message
            yield {"data": json.dumps({
                "type": "metadata",
                "conversation_id": str(current_conversation_id),
                "title": updated_conversation.title,
                "created_at": updated_conversation.created_at.isoformat(),
                "modified_at": updated_conversation.modified_at.isoformat()
            })}
        except Exception as e:
            error_message = f"Error generating response: {str(e)}"
            yield {"data": json.dumps({"type": "error", "content": error_message})}
        finally:
            yield {"data": json.dumps({"type": "end"})}

    return EventSourceResponse(event_generator())
