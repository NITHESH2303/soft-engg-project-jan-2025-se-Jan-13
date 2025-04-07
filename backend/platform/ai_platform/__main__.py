import uvicorn

# from ai_platform.settings import settings
from dotenv import load_dotenv
load_dotenv(override=True)

def main() -> None:
    """Entrypoint of the application."""
    uvicorn.run(
        "ai_platform.apis.application:get_app",
        # workers=settings.workers_count,
        # host="0.0.0.0",
        # port=settings.port,
        # reload=settings.reload,
        # log_level=settings.log_level.lower(),
        # factory=True,
    )


if __name__ == "__main__":
    main()