import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")

if not PINECONE_API_KEY:
    print("Pinecone key not found.")
    exit(1)

pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "gympilot-memory"

existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]

if index_name not in existing_indexes:
    print(f"Creating index '{index_name}'...")
    pc.create_index(
        name=index_name,
        dimension=768, # Default dimension for many popular text embeddings including Google's older ones
        metric="cosine",
        spec=ServerlessSpec(
            cloud="aws",
            region="us-east-1"
        )
    )
    print("Index created successfully.")
else:
    print(f"Index '{index_name}' already exists.")
