from fastapi import APIRouter

router = APIRouter()


@router.get('/health')
async def health_check():
    """
    **Health Check API**
    
    This endpoint is used to monitor the system health.  
    It returns a simple response indicating whether the service is running.  

    **Returns:**
    - `200 OK`: `{"response": "ok"}`
    """
    return {
        "response": "ok"
    }
