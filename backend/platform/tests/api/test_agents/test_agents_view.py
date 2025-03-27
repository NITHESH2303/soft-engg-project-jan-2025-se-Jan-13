import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from ai_platform.apis.agents.view import router, extract_text_from_file, agents
from ai_platform.schemas.ai_agent import AiAgentCreate, AiAgentUpdate
from ai_platform.supafast.models.ai_agent import AiAgent
from ai_platform.vectordb.db_pgvector import PgvectorDB
from unittest.mock import Mock, patch, AsyncMock
import uuid
from datetime import datetime
import json
from io import BytesIO

# Create a test client for the router
client = TestClient(router)

# Mock data
mock_agent = AiAgent(id=1, name="Test Agent", description="Test Description")
mock_conversation_id = uuid.uuid4()


@pytest.fixture
def mock_db():
    """Fixture to mock database session"""
    return Mock(spec=Session)


@pytest.fixture
def mock_vectorstore():
    """Fixture to mock PgvectorDB"""
    with patch("ai_platform.apis.agents.view.PgvectorDB") as mock:
        instance = mock.return_value
        instance.create_docs_from_text.return_value = ["doc1", "doc2"]
        instance.create_embeddings.return_value = None
        yield mock


def test_extract_text_from_file_pdf():
    """Test text extraction from PDF"""
    with patch("pdfplumber.open") as mock_pdf:
        mock_pdf.return_value.__enter__.return_value.pages = [
            Mock(extract_text=lambda: "Page 1 text"),
            Mock(extract_text=lambda: "Page 2 text")
        ]
        file = Mock(filename="test.pdf", file=BytesIO(b"pdf content"))
        result = extract_text_from_file(file)
        assert result == "Page 1 text\nPage 2 text"


def test_extract_text_from_file_unsupported():
    """Test extraction with unsupported file type"""
    file = Mock(filename="test.jpg", file=BytesIO(b"image content"))
    with pytest.raises(HTTPException) as exc:
        extract_text_from_file(file)
    assert exc.value.status_code == 400
    assert "Unsupported file type" in exc.value.detail


def test_create_knowledge_base_with_content(mock_vectorstore):
    """Test creating knowledge base with raw content"""
    response = client.post(
        "/agent/create_knowledgebase",
        data={"vector_index": "test_index", "content": "Test content"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == True
    assert response.json()["document_inserted_count"] == 2
    assert response.json()["vector_index"] == "test_index"


def test_create_knowledge_base_no_input():
    """Test creating knowledge base with no content or file"""
    response = client.post(
        "/agent/create_knowledgebase",
        data={"vector_index": "test_index"}
    )

    assert response.status_code == 400
    assert "Either 'content' or 'file' must be provided" in response.json()["detail"]


def test_read_agents_success(mock_db):
    """Test successful retrieval of agents list"""
    mock_db.query.return_value.offset.return_value.limit.return_value.all.return_value = [mock_agent]

    response = client.get("/agent/agents/")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["id"] == 1


def test_create_agent_success(mock_db):
    """Test successful agent creation"""
    agent_data = AiAgentCreate(name="New Agent", description="New Description")

    with patch("ai_platform.apis.agents.crud.create_agent", return_value=mock_agent):
        response = client.post(
            "/agent/agents/",
            json=agent_data.dict()
        )

    assert response.status_code == 200
    assert response.json()["name"] == "Test Agent"


def test_update_agent_success(mock_db):
    """Test successful agent update"""
    update_data = AiAgentUpdate(name="Updated Agent")

    with patch("ai_platform.apis.agents.crud.get_agent", return_value=mock_agent), \
            patch("ai_platform.apis.agents.crud.update_agent", return_value=mock_agent):
        response = client.put(
            "/agent/agents/1",
            json=update_data.dict(exclude_unset=True)
        )

    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_update_agent_not_found(mock_db):
    """Test updating non-existent agent"""
    update_data = AiAgentUpdate(name="Updated Agent")

    with patch("ai_platform.apis.agents.crud.get_agent", return_value=None):
        response = client.put(
            "/agent/agents/1",
            json=update_data.dict(exclude_unset=True)
        )

    assert response.status_code == 404
    assert response.json()["detail"] == "Agent not found"


def test_delete_agent_success(mock_db):
    """Test successful agent deletion"""
    with patch("ai_platform.apis.agents.crud.get_agent", return_value=mock_agent), \
            patch("ai_platform.apis.agents.crud.delete_agent", return_value=mock_agent):
        response = client.delete("/agent/agents/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_stream_agent_response_new_conversation(mock_db):
    """Test streaming agent response with new conversation"""
    with patch("ai_platform.apis.agents.view.get_agent", return_value=mock_agent), \
            patch("ai_platform.apis.agents.view.create_conversation", return_value=mock_conversation_id), \
            patch("ai_platform.apis.agents.view.update_conversation", return_value=Mock(title="Test Chat")):
        # Mock the async stream_response method
        async def mock_stream_response(*args, **kwargs):
            yield json.dumps({"type": "text", "content": "Hello"})
            yield json.dumps({"type": "end"})

        with patch.object(agents, "stream_response", new=AsyncMock(side_effect=mock_stream_response)):
            response = client.get(
                "/agent/host_agent",
                params={
                    "query": "Hello",
                    "user_id": 1,
                    "history": json.dumps([{"role": "user", "content": "Hi"}])
                }
            )

    assert response.status_code == 200
    content = response.text.split("\n")
    assert any("data: {\"type\":\"text\",\"content\":\"Hello\"}" in line for line in content)
    assert any("data: {\"type\":\"end\"}" in line for line in content)


def test_stream_agent_response_existing_conversation(mock_db):
    """Test streaming agent response with existing conversation"""
    mock_conversation = Mock(user_id=1, title="Existing Chat")

    with patch("ai_platform.apis.agents.view.get_agent", return_value=mock_agent), \
            patch("ai_platform.apis.agents.view.get_conversation", return_value=mock_conversation), \
            patch("ai_platform.apis.agents.view.update_conversation", return_value=mock_conversation):
        async def mock_stream_response(*args, **kwargs):
            yield json.dumps({"type": "text", "content": "Response"})
            yield json.dumps({"type": "end"})

        with patch.object(agents, "stream_response", new=AsyncMock(side_effect=mock_stream_response)):
            response = client.get(
                "/agent/host_agent",
                params={
                    "query": "Hello",
                    "user_id": 1,
                    "conversation_id": str(mock_conversation_id),
                    "history": json.dumps([{"role": "user", "content": "Previous"}])
                }
            )

    assert response.status_code == 200
    content = response.text.split("\n")
    assert any("data: {\"type\":\"text\",\"content\":\"Response\"}" in line for line in content)


def test_stream_agent_response_invalid_history(mock_db):
    """Test streaming with invalid history format"""
    with patch("ai_platform.apis.agents.view.get_agent", return_value=mock_agent):
        response = client.get(
            "/agent/host_agent",
            params={
                "query": "Hello",
                "user_id": 1,
                "history": "invalid_json"
            }
        )

    assert response.status_code == 500
    assert "Invalid history format" in response.json()["detail"]


def test_stream_agent_response_missing_user_id(mock_db):
    """Test streaming without user_id"""
    response = client.get(
        "/agent/host_agent",
        params={"query": "Hello"}
    )

    assert response.status_code == 422  # Unprocessable Entity due to missing required field


if __name__ == "__main__":
    pytest.main()