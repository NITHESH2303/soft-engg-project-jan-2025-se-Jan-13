from fastapi.routing import APIRouter

from ai_platform.apis import monitoring, agents

api_router = APIRouter()

api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(agents.router, prefix="/agent", tags=["Agent APIs"])

