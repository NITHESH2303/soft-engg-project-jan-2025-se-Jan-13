from ai_platform.agents.openai_agent import Agents
from dotenv import load_dotenv
import pytest

load_dotenv(override=True)

agents = Agents()


@pytest.mark.asyncio
async def test_parcel_agent():
    response = await agents.parser_agent("can you help me with selecting courses this term?")
    print(response)


@pytest.mark.asyncio
async def test_host_agent():
    response = await agents.host_agent("can you help me with the graded assignment of week 4", context="Course id is 4")
    print(response)
