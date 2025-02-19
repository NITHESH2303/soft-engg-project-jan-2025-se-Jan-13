from sqlalchemy.orm import Session

from ai_platform.schemas.ai_agent import AiAgentCreate, AiAgentUpdate
from ai_platform.supafast.models.ai_agent import AiAgent


def get_agents(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AiAgent).offset(skip).limit(limit).all()


def create_agent(db: Session, agent: AiAgentCreate):
    db_agent = AiAgent(**agent.dict())
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def get_agent(db: Session, agent_id: int):
    return db.query(AiAgent).filter(AiAgent.id == agent_id).first()


def update_agent(db: Session, agent_id: int, agent: AiAgentUpdate):
    db_agent = get_agent(db, agent_id)
    for key, value in agent.dict().items():
        setattr(db_agent, key, value)
    db.commit()
    db.refresh(db_agent)
    return db_agent


def delete_agent(db: Session, agent_id: int):
    db_agent = get_agent(db, agent_id)
    db.delete(db_agent)
    db.commit()
    return db_agent
