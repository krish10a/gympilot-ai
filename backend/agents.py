import os
import json
from openai import OpenAI

# Load the NVIDIA API key from environment, fallback to the provided token
api_key = os.getenv("NVIDIA_API_KEY", "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")
client = None
if api_key:
    client = OpenAI(
        base_url="https://integrate.api.nvidia.com/v1",
        api_key=api_key
    )

MODEL_NAME = "nvidia/nemotron-3-super-120b-a12b"  # High-fidelity Nemotron-3 model on NIM

def input_fusion_agent(text_input: str = None, voice_input: str = None, mime_type: str = None, image_b64: str = None):
    """
    Agent 1: Input Fusion Agent
    Merges text, voice, and image to output structured JSON for a meal or workout log.
    Uses NVIDIA NIM Nemotron-3 model.
    """
    if not client:
        return {"error": "Missing NVIDIA_API_KEY"}

    system_instruction = """You are the Input Fusion Agent for GymPilot AI.
Your task is to take multiple inputs (text, voice transcript, image) and fuse them into a single structured log.
Do not hallucinate facts. If the input is empty or unclear, ask the user to clarify.

Return raw JSON matching this schema:
{
  "type": "meal" | "workout",
  "confidence_score": 0.0-1.0,
  "data": {
    // If meal:
    "items": [{"name": string, "quantity": string, "calories": number, "protein": number, "carbs": number, "fat": number}],
    "totalCalories": number,
    "totalProtein": number,
    "totalCarbs": number,
    "totalFat": number,
    // If workout:
    "title": string,
    "duration": number,
    "volume": number,
    "exercises": [{"name": string, "sets": [{"reps": number, "weight": number}]}]
  }
}"""
    
    contents = []
    if text_input:
        contents.append(text_input)
    if voice_input:
        contents.append(f"Voice Transcript: {voice_input}")
    
    prompt = "\n".join(contents)
    if not prompt:
         prompt = "Analyze this input for food or a workout."

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2, # Lower temperature ensures deterministic structural consistency
            top_p=0.95,
            max_tokens=4096,
            extra_body={"chat_template_kwargs": {"enable_thinking": True}, "reasoning_budget": 2048}
        )
        content = response.choices[0].message.content
        
        # Strip potential markdown wrapper blocks
        content_str = content.strip()
        if content_str.startswith("```json"):
            content_str = content_str[7:]
        if content_str.endswith("```"):
            content_str = content_str[:-3]
        content_str = content_str.strip()

        return json.loads(content_str)
    except Exception as e:
        return {"error": str(e)}

def coach_agent(profile_dict, summary_dict, pinecone_memory_chunks):
    """
    Agent 4: Coach Agent
    Turns structured analysis into short, helpful advice (1-2 sentences).
    Uses NVIDIA NIM Nemotron-3 model.
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
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            top_p=0.95,
            max_tokens=1024,
            extra_body={"chat_template_kwargs": {"enable_thinking": True}, "reasoning_budget": 512}
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Coach Error: {str(e)}"
