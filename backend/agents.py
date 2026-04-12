import os
import json
from google import genai
from google.genai import types

# In case the user doesn't have an API key right now, we handle it gracefully.
api_key = os.getenv("GEMINI_API_KEY", "")
client = None
if api_key:
    client = genai.Client(api_key=api_key)

MODEL_NAME = "gemini-2.5-flash"  # Fastest multimodal model

def input_fusion_agent(text_input: str = None, voice_input: str = None, mime_type: str = None, image_b64: str = None):
    """
    Agent 1: Input Fusion Agent
    Merges text, voice, and image to output structured JSON for a meal or workout log.
    """
    if not client:
        return {"error": "Missing GEMINI_API_KEY"}

    system_instruction = """You are the Input Fusion Agent for GymPilot AI.
Your task is to take multiple inputs (text, voice transcript, image) and fuse them into a single structured log.
Do not hallucinate facts. If the input is empty or unclear, ask the user to clarify.

Return raw JSON matching this schema:
{
  "type": "meal" | "workout",
  "confidence_score": 0.0-1.0,
  "data": {
    // If meal:
    "items": [{"name": string, "quantity": string}],
    "estimated_calories": number,
    // If workout:
    "title": string,
    "exercises": [{"name": string, "sets": [{"reps": number, "weight": number}]}]
  }
}"""
    
    contents = []
    if text_input:
        contents.append(text_input)
    if voice_input:
        contents.append(f"Voice Transcript: {voice_input}")
    
    # Normally we would encode images using standard Gemini multimodality here
    # Assuming prompt is text-based for now to demonstrate agentic behavior
    prompt = "\n".join(contents)
    if not prompt:
         prompt = "Analyze this image for food or a workout."

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        return {"error": str(e)}

def coach_agent(profile_dict, summary_dict, pinecone_memory_chunks):
    """
    Agent 4: Coach Agent
    Turns structured analysis into short, helpful advice (1-2 sentences).
    """
    if not client:
        return "Coach Agent Offline: Missing API Key"

    system_instruction = """You are the GymPilot AI Coach.
Produce short, actionable, and encouraging guidance (1-3 lines max).
Use the user's profile, daily summary, and long-term memory chunks to provide context-aware advice.

Focus on:
- Missing targets (protein, calories, water)
- Consistency patterns from memory
- No rambling text! Very short!"""

    prompt = f"""
    Profile: {json.dumps(profile_dict)}
    Daily Summary: {json.dumps(summary_dict)}
    Long-Term Memory Patterns: {pinecone_memory_chunks}
    """

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
            )
        )
        return response.text
    except Exception as e:
        return f"Coach Error: {str(e)}"
