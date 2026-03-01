import os

from ai_platform.settings import BASE_DIR
from ai_platform.vectordb.db_pgvector import PgvectorDB
from dotenv import load_dotenv

load_dotenv(override=True)

filename = input(
    "Enter the filename of the data to ingest. The data must be present under ai_platform/embedding_data dir\n")
filetype = input("Enter the file type. Only text file type is supported\n")

file_path = os.path.join(BASE_DIR, "embedding_data", filename)
connection_str = os.getenv("SQLALCHEMY_DATABASE_URL")

if filetype == "text":
    try:
        data = open(file_path, "r").read()
        vectordb = PgvectorDB(collection_name="general", connection_str=connection_str)
        docs = vectordb.create_docs_from_text(data)
        vectordb.create_embeddings(docs)
    except FileNotFoundError as e:
        print("No fileName matched skipping....")
else:
    print("Only text files are supported for now.")
