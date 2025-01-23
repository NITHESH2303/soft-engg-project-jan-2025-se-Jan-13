import json

from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
import os
from langchain_community.document_loaders import DataFrameLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
load_dotenv(override=True)

class PineconeVectorDb:
    def __init__(self, index_name, embedding_fn=OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"),
        model="text-embedding-3-small")):
        self.vectorstore = PineconeVectorStore(index_name=index_name, embedding=embedding_fn)
        self.index = index_name
        self.embedding_fn = embedding_fn

    def insert_vectors_with_metadata(self, contents, metadatas) -> None:
        print(f"Started data insertion")
        vector_dict = dict(zip(contents, metadatas))
        docs = [
            Document(page_content=vector_column, metadata=metadata)
            for vector_column, metadata in vector_dict.items()
        ]
        print(docs)
        self.vectorstore.from_documents(docs, self.embedding_fn, index_name=self.index)
        print(f"INFO: Vectors created successfully on index: {self.index}")

    def upsert_with_metadata(self, vectors: list):
        self.index.upsert(vectors)
        print(f"INFO: Vectors created successfully on index: {self.index}")

    def add_text(self, text: str, metadata: dict):
        return self.vectorstore.add_texts(texts=[text], metadatas=[metadata])

    def query(self, query: str):
        return self.vectorstore.similarity_search(query, k=8)

    def create_embeddings(self, docs) -> None:
        """Creates the embedding from the langchain docs"""
        self.vectorstore.add_documents(docs)
        print(f"INFO: Vectors created successfully on index: {self.index}")
    def create_docs_from_text(self, text, chunk_size: int = 1000, chunk_overlap: int = 100):
        """
        Convert the text into langchain docs
        """
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size,
                                                       chunk_overlap=chunk_overlap)
        texts = text_splitter.split_text(text)
        docs = text_splitter.create_documents(texts)
        return docs

    def query_with_score(self, query: str, k=6):
        return self.vectorstore.similarity_search_with_score(query, k=k)

    def get_context_for_query(self, query, top_k=6, include_metadata=True, exclude_content=False):
        # TODO: Provide options for user for different combination for the context
        context = ""
        docs = self.query_with_score(query, k=top_k)
        if not include_metadata:
            for doc in docs:
                context += f"\n{'- ' * 90}\nContent: {doc[0].page_content}\n"
            return context
        for doc in docs:
            context += f"\n{'- ' * 90}\nSimilarity Score: {doc[1]}\nContent: {doc[0].page_content}\nMetadaDATA: {doc[0].metadata['metadata']}\n"
        if exclude_content:
            for doc in docs:
                context += f"\n{'- ' * 90}\nSimilarity Score: {doc[1]}\nMetadaDATA: {doc[0].metadata['metadata']}\n"
        return context

    def delete_vectors(self):
        return self.vectorstore.delete(delete_all=True)
