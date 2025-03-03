## cd platform

## poetry install

## poetry run python -m ai_platform


## poetry env info --path  



## How to Work With alembic 

## alembic init migrations-  It will create the migrations directory which will have all the migration
versions.
It will also create the alembic.ini and env.py inside it to control the migration flow

Note: Do not exectute this command if migrations directory already created under
backend/platform

Run individual test cases using
```poetry run pytest -s .\tests\unit\test_openai_agent.py::test_parcel_agent
```