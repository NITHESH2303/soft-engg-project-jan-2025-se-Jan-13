

date 28-01-2025


1. Created schema directory- we will have all the pydantic schemas here
2. Created supafast/model directory - we will have all the models(aka: tables) here

3. installed new module alembic - to manage database

Youtube tutorial on Fastapi supabase
(https://www.youtube.com/watch?v=6ipV_yAP5I4)

Learn about Supabase alembic and fastapi [https://dev.to/j0/setting-up-fastapi-with-supabasedb-2jm0]()


date 30-01-2025

## How to Work With alembic 

## alembic init migrations-  It will create the migrations directory which will have all the migration
versions.
It will also create the alembic.ini and env.py inside it to control the migration flow

Note: Do not exectute this command if migrations directory already created under
backend/platform

## generate initial migration

alembic revision --autogenerate -m "generate initial migration"

it will create a version file so that we can change what changes to be done in the database by alembic

## upgrade head to the database

alembic upgrade head


We can then run alembic upgrade head to apply the migration changes to Supabase DB. Thereafter, we should be able to see the newly created table in the table editor
