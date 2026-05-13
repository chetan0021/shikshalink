import json
import os
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.llm import get_groq_client

router = APIRouter()

# --- Schemas ---

class HistoryItem(BaseModel):
    role: str
    content: Any

class GetTutorRequest(BaseModel):
    question: str
    sessionId: Optional[str] = None
    history: Optional[List[HistoryItem]] = None

class GenerateStudyPlanRequest(BaseModel):
    targetRole: str  # Kept as targetRole for compatibility, but represents "Subject/Goal"
    interviewDate: str
    hoursPerDay: int

class EvaluateCodeRequest(BaseModel):
    code: str
    topic: str

class RunInterviewRequest(BaseModel):
    mode: str  # "generate" or "evaluate"
    topic: str
    question: Optional[str] = None
    answer: Optional[str] = None

# --- Endpoints ---

@router.post("/tutor")
async def get_tutor_response(req: GetTutorRequest):
    client = get_groq_client()
    
    # Build history
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert AI Tutor for a student. "
                "Explain concepts clearly, provide analogies, real-world context, "
                "an example, a mini-quiz question, and a hint for the quiz. "
                "Always output valid JSON strictly following this schema: "
                '{"concept": "string", "analogy": "string", "industryContext": "string", '
                '"example": "string", "miniQuiz": "string", "hint": "string"}'
            )
        }
    ]
    
    if req.history:
        for item in req.history:
            if item.role in ["user", "assistant"]:
                if isinstance(item.content, str):
                    messages.append({"role": item.role, "content": item.content})
                elif isinstance(item.content, dict):
                    messages.append({"role": item.role, "content": json.dumps(item.content)})
                    
    messages.append({"role": "user", "content": req.question})
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        
        return {
            "sessionId": req.sessionId or "new_session",
            "response": data
        }
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate tutor response.")

@router.post("/plan")
async def generate_study_plan(req: GenerateStudyPlanRequest):
    client = get_groq_client()
    
    prompt = f"""
    Create a study plan for a student preparing for: {req.targetRole}.
    Target date/timeline: {req.interviewDate}.
    Study hours per day: {req.hoursPerDay}.
    
    Output strictly as valid JSON matching this schema:
    {{
        "roadmap": [
            {{
                "day": 1,
                "focus": "string",
                "tasks": ["string"],
                "revision": false
            }}
        ],
        "daysRemaining": number,
        "weakTopicsUsed": ["string"],
        "readinessScore": number
    }}
    Limit roadmap to a maximum of 14 days for brevity, or group by weeks if the timeline is long.
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert academic study planner. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate study plan.")

@router.post("/evaluate")
async def evaluate_code(req: EvaluateCodeRequest):
    client = get_groq_client()
    
    prompt = f"""
    Evaluate this student's response or code snippet for the topic: {req.topic}.
    Content:
    {req.code}
    
    Provide a detailed evaluation with a rubric score (0-10) for: syntax, logic, bestPractices, and readability.
    Also provide an overallScore (0-100) and constructive feedback.
    
    Output strictly as valid JSON matching this schema:
    {{
        "rubricScore": {{
            "syntax": number,
            "logic": number,
            "bestPractices": number,
            "readability": number
        }},
        "overallScore": number,
        "feedback": "string",
        "detectedWeakTopics": ["string"]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": "You are an expert academic evaluator. Output JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        data = json.loads(response.choices[0].message.content)
        # Mocking some required frontend fields
        data.update({
            "submissionId": "sub_" + os.urandom(4).hex(),
            "updatedReadinessScore": 75, 
            "updatedConfidenceScore": 80
        })
        return data
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to evaluate content.")

@router.post("/discussion")
async def run_discussion(req: RunInterviewRequest):
    client = get_groq_client()
    
    if req.mode == "generate":
        prompt = f"Generate a challenging academic question for the topic: {req.topic}. Focus on core concepts."
        system_msg = "You are a teacher engaging in a discussion. Provide only the question as text."
    else:
        prompt = f"Evaluate this answer for the topic {req.topic}.\nQuestion: {req.question}\nAnswer: {req.answer}\n\nProvide an overallScore (0-100) and feedback."
        system_msg = "You are an evaluator. Output strictly JSON: {\"overallScore\": number, \"feedback\": \"string\"}"

    try:
        if req.mode == "generate":
            response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            return {"question": response.choices[0].message.content, "topic": req.topic}
        else:
            response = client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            data = json.loads(response.choices[0].message.content)
            data.update({
                "submissionId": "int_" + os.urandom(4).hex(),
                "updatedReadinessScore": 75,
                "updatedConfidenceScore": 80
            })
            return data
    except Exception as e:
        print(f"LLM Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process discussion.")
