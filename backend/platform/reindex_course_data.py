import os
import json
from dotenv import load_dotenv
from ai_platform.vectordb.db_pgvector import PgvectorDB
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv(override=True)

connection_str = os.getenv("SQLALCHEMY_DATABASE_URL")

def reindex_all():
    # Fix path to be relative to current working directory (assumed to be backend/platform)
    base_path = os.path.join(
        os.getcwd(),
        "ai_platform", "embedding_data", "course_data"
    )
    
    if not os.path.exists(base_path):
        print(f"❌ Base path not found: {base_path}")
        return

    courses = [d for d in os.listdir(base_path) if os.path.isdir(os.path.join(base_path, d))]
    
    if not connection_str:
        print("❌ SQLALCHEMY_DATABASE_URL not set")
        return

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)

    for course in courses:
        print(f"\n📚 Processing course: {course}")
        course_folder = os.path.join(base_path, course)
        
        # Initialize PGVector DB for this collection
        # Note: The framework uses the folder name as the collection name
        vectordb = PgvectorDB(
            collection_name=course,
            connection_str=connection_str
        )
        
        # Optional: Clear existing vectors if you want a clean start
        # vectordb.delete_vectors()
        
        all_text = ""
        for file_name in ["content.txt", "summary.txt", "faqs.txt"]:
            file_path = os.path.join(course_folder, file_name)
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    all_text += f"\n--- {file_name} ---\n{content}\n"
            else:
                print(f"⚠️ Warning: {file_name} not found in {course}")

        if all_text:
            docs = vectordb.create_docs_from_text(all_text)
            print(f"🚀 Inserting {len(docs)} chunks into PGVector...")
            vectordb.upsert_with_metadata(docs)
            print(f"✅ Finished indexing {course}")
        else:
            print(f"⚠️ No content found for {course}")

if __name__ == "__main__":
    reindex_all()
