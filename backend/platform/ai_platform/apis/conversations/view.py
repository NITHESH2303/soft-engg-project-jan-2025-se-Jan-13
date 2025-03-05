from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from ai_platform.apis.conversations import crud
from ai_platform.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from ai_platform.supafast.database import get_db

router = APIRouter()


@router.post("/", response_model=str)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    conversation_id = crud.create_conversation(db, conversation)
    return str(conversation_id)  # Return UUID as a string


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    convo = crud.get_conversation(db, conversation_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.get("/user/{user_id}", response_model=ConversationResponse)
def get_conversation(user_id: int, db: Session = Depends(get_db)):
    convo = crud.get_user_conversations(db, user_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(conversation_id: uuid.UUID, update_data: ConversationUpdate, db: Session = Depends(get_db)):
    updated_convo = crud.update_conversation(db, conversation_id, update_data)
    if not updated_convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return updated_convo


@router.delete("/{conversation_id}", response_model=str)
def delete_conversation(conversation_id: uuid.UUID, db: Session = Depends(get_db)):
    deleted_convo = crud.delete_conversation(db, conversation_id)
    if not deleted_convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return "Conversation deleted successfully"
