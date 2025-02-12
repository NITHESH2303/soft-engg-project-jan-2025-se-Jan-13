from fastapi.routing import APIRouter

from ai_platform.apis import monitoring, agents,auth, courses

api_router = APIRouter()

api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])
api_router.include_router(agents.router, prefix="/agent", tags=["Agent APIs"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth APIs"])
api_router.include_router(courses.router, prefix="/student", tags=["Auth APIs"])
