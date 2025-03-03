import json
import sqlalchemy
from langchain_openai import OpenAIEmbeddings
from langchain_postgres.vectorstores import PGVector
import os
from langchain_community.document_loaders import DataFrameLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

try:
    from dotenv import load_dotenv

    load_dotenv(override=True)
except Exception as e:
    print(e)


class PgvectorDB:
    def __init__(self, collection_name, connection_str,
                 embedding_fn=OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"),
                                               model="text-embedding-3-small")):
        self.vectorstore = PGVector(
            embeddings=embedding_fn,
            collection_name=collection_name,
            connection=connection_str,
            use_jsonb=True,
            create_extension=False
        )
        self.collection = collection_name
        self.embedding_fn = embedding_fn

    def upsert_with_metadata(self, docs):
        """Takes ithe langchain docs and insert into the vector_db in specified collection"""
        self.vectorstore.add_documents(docs)
        print(f"INFO: Vectors created successfully on index: {self.collection}")

    def insert_from_df(self, df, page_content_column, duplicate_insertion=True):
        loader = DataFrameLoader(df, page_content_column=page_content_column)
        docs = loader.load()
        #TODO: Handle try and error
        self.upsert_with_metadata(docs)
        print(f"INFO: Vectors created successfully on index: {self.collection}")
        return "success"

    def query_with_score(self, query: str, k=6):
        """Takes the user query and get the relavent context to provide GPT"""
        try:
            result = self.vectorstore.similarity_search_with_score(query, k=k)
        except sqlalchemy.exc.OperationalError as e:
            result = self.vectorstore.similarity_search_with_score(query, k=k)
        return result

    def get_context_for_query(self, query, top_k=6, include_metadata=True, exclude_content=False):
        """Takes the user query and get the relavent context to provide GPT"""
        #TODO: Provide options for user for different combination for the context
        context = ""
        docs = self.query_with_score(query, k=top_k)
        if not include_metadata:
            for doc in docs:
                context += f"\n{'- ' * 90}\nContent: {doc[0].page_content}\n"
            return context
        if include_metadata and not exclude_content:
            for doc in docs:
                context += f"\n{'- ' * 90}\nSimilarity Score: {doc[1]}\nContent: {doc[0].page_content}\nMetadaDATA: {doc[0].metadata['metadata']}\n"
            return context
        if exclude_content and include_metadata:
            for doc in docs:
                context += f"\n{'- ' * 90}\nSimilarity Score: {doc[1]}\nMetadaDATA: {doc[0].metadata['metadata']}\n"
            return context

    def add_text(self, text: str, metadata: dict):
        return self.vectorstore.add_texts(texts=[text], metadatas=[metadata])

    def delete_vectors(self):
        return self.vectorstore.delete(delete_all=True)

    def drop_tables(self):
        return self.vectorstore.drop_tables()

    def create_docs_from_text(self, text, chunk_size: int = 1000, chunk_overlap: int = 100):
        """
        Convert the text into langchain docs
        """
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size,
                                                       chunk_overlap=chunk_overlap)
        texts = text_splitter.split_text(text)
        docs = text_splitter.create_documents(texts)
        return docs

    def create_embeddings(self, docs) -> None:
        """Creates the embedding from the langchain docs"""
        self.vectorstore.add_documents(docs)
        print(f"INFO: Vectors created successfully on index: {self.collection}")
