from ai_platform.schemas.ai_agent import AiAgentCreate, ConversationCreate
from ai_platform.supafast.database import engine, SessionLocal
from ai_platform.supafast.models.ai_agent import AiAgent, Conversation

db = SessionLocal()


def seed_data():
    try:
        # Seed AiAgents
        agents = [
            AiAgentCreate(
                name="General Assistant",
                model_name="gpt-4",
                model_type="openai",
                vector_index="general_index",
                response_token_limit=2000,
                temperature=0.7,
                description="A general-purpose AI assistant"
            ),
            AiAgentCreate(
                name="Code Helper",
                model_name="gpt-4",
                model_type="openai",
                vector_index="code_index",
                response_token_limit=4000,
                temperature=0.5,
                description="An AI assistant specialized in coding tasks"
            ),
            AiAgentCreate(
                name="Creative Writer",
                model_name="claude-v1",
                model_type="anthropic",
                vector_index="creative_index",
                response_token_limit=3000,
                temperature=0.9,
                description="An AI assistant for creative writing tasks"
            )
        ]

        for agent in agents:
            db_agent = AiAgent(**agent.dict())
            db.add(db_agent)

        db.commit()

        # Seed Conversations
        conversations = [
            ConversationCreate(
                agent_id=1,
                user_id=1,
                conversations=[
                    {"role": "user", "content": "Hello, how are you?"},
                    {"role": "assistant", "content": "I'm doing well, thank you! How can I assist you today?"}
                ]
            ),
            ConversationCreate(
                agent_id=2,
                user_id=1,
                conversations=[
                    {"role": "user", "content": "Can you help me with a Python problem?"},
                    {"role": "assistant", "content": "Certainly! What's the Python problem you're facing?"}
                ]
            ),
            ConversationCreate(
                agent_id=3,
                user_id=1,
                conversations=[
                    {"role": "user", "content": "I need help writing a short story."},
                    {"role": "assistant",
                     "content": "Great! Let's start by discussing the main elements of your story. What genre are you interested in?"}
                ]
            )
        ]

        for conversation in conversations:
            db_conversation = Conversation(**conversation.dict())
            db.add(db_conversation)

        db.commit()

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
