# SEEK Portal Backend - Team 13 Project (Jan Term 2025)

## Project Overview
This is the backend implementation for the SEEK Portal, an AI-powered academic guidance system developed for the IITM BS degree program. The project leverages modern technologies to create an intelligent learning support platform.

## Tech Stack
* **Backend**: FastAPI
* **Database**: SupaBase (PostgreSQL)
* **ORM**: SQLAlchemy
* **Migrations**: Alembic
* **AI Integration**: LangChain, OpenAI GPT-4o
* **Testing**: Pytest, FastAPI Test Client
* **Dependency Management**: Poetry

## Prerequisites
* Python 3.11 - 3.12
* Poetry (Python package manager)


## Quick Setup
```bash
pip install poetry
cd platform
poetry install 
paste a valid OPENAI_API_KEY in .env present in platform
poetry run python -m ai_platform 
```

Open browser and paste the url `http://127.0.0.1:8000/api/docs`

Now on this page login by Clicking on Authorize Button using below credentials 
- Username: pankaj
- Password: pankaj123 

You can try listed APIs.
```


## Welcome

Hi There, 

Welcome To the Software Engineering PROJECT JAN Term 2025 of Team-13 Backend 

## Important Warnings

### Database Connectivity
**Warning**: We are using a centralized cloud PostgreSQL database named Supabase which gets paused if there is no connection in 30 days. If you face any error in running APIs, it is likely due to a paused database. Once you mail us, we can reactivate the database, but normally you will get an active database.

### AI Integration and Credentials
For the RAG (Retrieval Augmented Generation), we have used OpenAI. You  have to set up any key as we are not providing the OpenAI key for security reasons. 

**Note**: These credentials will be valid for only 3 months (until 1-05-2025) with limited credits. If you are using them after that, they will not work, and you'll need to get the necessary keys.

## Local Database Setup (Optional)
If you want a fresh start with a local PostgreSQL database and don't want to use the Supabase cloud database:
1. Change the database credentials in `.env`
2. Create tables using Alembic
3. Use the following Alembic commands:
   ```bash
   alembic init migration  # This will push the migration
   ```

### Further Migrations
```bash
alembic revision --autogenerate -m "Your commit message"
alembic upgrade head
```

**Note**: For sample data, use the seed files inside the Supafast module present in the backend root directory. Seed files have "seed" keywords in their filename (e.g., `seed.py`).

## Setup and Installation

### Step 1: Download and Unzip
Download the backend code and unzip it. Navigate to the root of the backend where you'll find the directory structure:
```
platform
README.md
.gitignore
```

### Step 2: Python Installation
Install Python >=3.11,<3.13 from the official python.org website

### Step 3: Install Poetry
Install Poetry using global Python:
```bash
pip install poetry 

# Recommended Poetry installation
pip install pipx 
pipx install poetry 
```

### Step 4: Install Dependencies
Change directory to platform:
```bash
cd platform
```

Run Poetry to setup virtual environment and install dependencies:
```bash
poetry install
```

You can get the path of the created environment using:
```bash
poetry env info --path
```

### Optional: Activate Virtual Environment
```bash
poetry env activate 
```

### Run the Backend
```bash
poetry run python -m ai_platform 
```
**Note**: Ensure you are in the platform directory when running this command.

## Testing
Run individual test cases:
```bash
poetry run pytest -s .\tests\unit\test_openai_agent.py::test_parcel_agent
```

## Support
If you face any issue running the backend, feel free to mail 22f3001755@ds.study.iitm.ac.in. You will be expected to get a response within 2 hours.

