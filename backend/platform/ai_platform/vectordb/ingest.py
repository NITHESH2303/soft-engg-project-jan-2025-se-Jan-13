import os

from ai_platform.settings import BASE_DIR
from ai_platform.vectordb.db_pinecone import PineconeVectorDb

filename = input(
    "Enter the filename of the data to ingest. The data must be present under ai_platform/embedding_data dir\n")
filetype = input("Enter the file type. Only text file type is supported\n")

file_path = os.path.join(BASE_DIR, "embedding_data", filename)

if filetype == "text":
    try:
        data = open(file_path, "r").read()
        # call vectordb to insert this data
        vectordb = PineconeVectorDb("iitm-vector-index")
        docs = vectordb.create_docs_from_text(data)
        vectordb.create_embeddings(docs)
    except FileNotFoundError as e:
        print("No fileName matched skipping....")
else:
    print("Only text files are supported for now.")
