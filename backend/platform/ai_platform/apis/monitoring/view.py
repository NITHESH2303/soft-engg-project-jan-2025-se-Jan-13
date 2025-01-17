from fastapi import APIRouter

router = APIRouter()


@router.get('/health')
async def health_check():
    """API for monitoring"""
    return {
        "response": "ok"
    }
