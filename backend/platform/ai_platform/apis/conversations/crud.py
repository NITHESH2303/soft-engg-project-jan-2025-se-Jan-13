import uuid
from sqlalchemy.orm import Session
from ai_platform.schemas.conversation import ConversationCreate, ConversationUpdate
from ai_platform.supafast.models.conversation import Conversation

def create_conversation(db: Session, conversation: ConversationCreate):
    new_convo = Conversation(id=uuid.uuid4(), **conversation.dict())
    db.add(new_convo)
    db.commit()
    db.refresh(new_convo)
    return new_convo.id  # Return the generated UUID

def get_conversation(db: Session, conversation_id: uuid.UUID):
    return db.query(Conversation).filter(Conversation.id == conversation_id).first()

def update_conversation(db: Session, conversation_id: uuid.UUID, update_data: ConversationUpdate):
    db_convo = get_conversation(db, conversation_id)
    if not db_convo:
        return None  # Error: Not Found

    db_convo.conversation = update_data.conversation  # Update JSONB data
    db.commit()
    db.refresh(db_convo)
    return db_convo

def delete_conversation(db: Session, conversation_id: uuid.UUID):
    db_convo = get_conversation(db, conversation_id)
    if not db_convo:
        return None  # Error: Not Found

    db.delete(db_convo)
    db.commit()
    return db_convo
