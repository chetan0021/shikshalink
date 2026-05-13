import os
from groq import Groq

def get_groq_client() -> Groq:
    """Factory to get Groq client using environment variables."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not found in environment variables")
    return Groq(api_key=api_key)
