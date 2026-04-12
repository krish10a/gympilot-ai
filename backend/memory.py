import os
from pinecone import Pinecone

pc = None
index = None
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")

if PINECONE_API_KEY:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    # Assume the index is called "gympilot-memory"
    # To run successfully, user must have created this index via Pinecone Console 
    # with dimension matching their embedding model (e.g. 768 for gemini text-embedding)
    try:
        index = pc.Index("gympilot-memory")
    except Exception:
        index = None

def store_memory_chunk(user_id: str, chunk_id: str, embedding: list[float], text: str):
    """
    Stores a semantic summary of a user's behavior.
    """
    if not index:
        return False
    
    index.upsert(
        vectors=[
            {
                "id": chunk_id,
                "values": embedding,
                "metadata": {"user_id": user_id, "text": text}
            }
        ],
        namespace=user_id
    )
    return True

def query_pinecone_context(user_id: str, query_embedding: list[float], top_k: int = 3):
    """
    Retrieves top relevant memory contexts for the user.
    """
    if not index:
        return ["Memory Layer Offline: Missing Pinecone Configuration."]
        
    res = index.query(
        namespace=user_id,
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )
    
    if not res or not res.matches:
        return []
        
    return [match.metadata["text"] for match in res.matches]
