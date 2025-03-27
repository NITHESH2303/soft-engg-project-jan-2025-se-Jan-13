import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.conversations.view import router
from ai_platform.schemas.conversation import ConversationCreate, ConversationUpdate
from datetime import datetime
import uuid
from unittest.mock import Mock, patch

from ai_platform.supafast.models.ai_agent import Conversation

# Create a test client for the router
client = TestClient(router)

# Mock conversation data
mock_conversation_id = uuid.uuid4()
mock_conversation = Conversation(
    id=mock_conversation_id,
    user_id=1,
    conversations={"messages": [{"role": "user", "content": "Hello"}]},
    title="Test Conversation",
    created_at=datetime.utcnow(),
    modified_at=datetime.utcnow()
)


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


def test_create_conversation_success(mock_db):
    """Test successful conversation creation"""
    convo_data = ConversationCreate(
        user_id=1,
        conversations={"messages": [{"role": "user", "content": "Hello"}]},
        title="Test Conversation"
    )

    with patch("ai_platform.apis.conversations.crud.create_conversation", return_value=mock_conversation_id):
        response = client.post(
            "/conversation/",
            json=convo_data.dict()
        )

    assert response.status_code == 200
    assert response.json() == str(mock_conversation_id)


def test_get_conversation_success(mock_db):
    """Test successful retrieval of a single conversation"""
    with patch("ai_platform.apis.conversations.crud.get_conversation", return_value=mock_conversation):
        response = client.get(f"/conversation/{mock_conversation_id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(mock_conversation_id)
    assert response.json()["user_id"] == 1
    assert response.json()["title"] == "Test Conversation"


def test_get_conversation_not_found(mock_db):
    """Test retrieval of non-existent conversation"""
    with patch("ai_platform.apis.conversations.crud.get_conversation", return_value=None):
        response = client.get(f"/conversation/{mock_conversation_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"


def test_get_user_conversations_success(mock_db):
    """Test successful retrieval of user conversations"""
    mock_conversations = [mock_conversation]
    with patch("ai_platform.apis.conversations.crud.get_user_conversations", return_value=mock_conversations):
        response = client.get("/conversation/user/1")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == str(mock_conversation_id)
    assert response.json()[0]["user_id"] == 1


def test_get_user_conversations_not_found(mock_db):
    """Test retrieval of conversations for user with no conversations"""
    with patch("ai_platform.apis.conversations.crud.get_user_conversations", return_value=[]):
        response = client.get("/conversation/user/1")

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"


def test_update_conversation_success(mock_db):
    """Test successful update of a conversation"""
    update_data = ConversationUpdate(
        conversations={"messages": [{"role": "user", "content": "Updated Hello"}]},
        title="Updated Title"
    )

    updated_convo = Conversation(
        id=mock_conversation_id,
        user_id=1,
        conversations=update_data.conversations,
        title=update_data.title,
        created_at=mock_conversation.created_at,
        modified_at=datetime.utcnow()
    )

    with patch("ai_platform.apis.conversations.crud.update_conversation", return_value=updated_convo):
        response = client.put(
            f"/conversation/{mock_conversation_id}",
            json=update_data.dict(exclude_unset=True)
        )

    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["conversations"] == {"messages": [{"role": "user", "content": "Updated Hello"}]}


def test_update_conversation_not_found(mock_db):
    """Test update of non-existent conversation"""
    update_data = ConversationUpdate(title="Updated Title")

    with patch("ai_platform.apis.conversations.crud.update_conversation", return_value=None):
        response = client.put(
            f"/conversation/{mock_conversation_id}",
            json=update_data.dict(exclude_unset=True)
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"


def test_delete_conversation_success(mock_db):
    """Test successful deletion of a conversation"""
    with patch("ai_platform.apis.conversations.crud.delete_conversation", return_value=True):
        response = client.delete(f"/conversation/{mock_conversation_id}")

    assert response.status_code == 200
    assert response.json() == "Conversation deleted successfully"


def test_delete_conversation_not_found(mock_db):
    """Test deletion of non-existent conversation"""
    with patch("ai_platform.apis.conversations.crud.delete_conversation", return_value=None):
        response = client.delete(f"/conversation/{mock_conversation_id}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Conversation not found"


if __name__ == "__main__":
    pytest.main()