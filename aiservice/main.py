from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pdfplumber
import io
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv


load_dotenv()
app = FastAPI()

SKILL_BANK = {
    "python", "java", "spring", "spring boot", "django", "flask", "fastapi", "sql", "mysql", "postgresql",
    "mongodb", "aws", "azure", "gcp", "docker", "kubernetes", "react", "angular", "vue", "javascript",
    "typescript", "node", "express", "git", "api", "rest api", "microservices", "html", "css", "ci/cd"
}

# -----------------------------------------
# 1. EXTRACT TEXT FROM PDF
# -----------------------------------------
@app.post("/extract-resume")
async def extract_resume_text(file: UploadFile = File(...)):
    text = ""
    try:
        contents = await file.read()
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return {"filename": file.filename, "text": text.strip()}
    except Exception as e:
        return {"error": str(e)}

# -----------------------------------------
# 2. AI MATCHING ENGINE
# -----------------------------------------
class JobItem(BaseModel):
    id: int
    text: str
    skills: str 

class MatchRequest(BaseModel):
    resume_text: str
    jobs: List[JobItem]

@app.post("/match-jobs")
def match_jobs(data: MatchRequest):
    try:
        if not data.jobs or not data.resume_text.strip():
            return []

        resume_lower = data.resume_text.lower()
        job_texts = [job.text for job in data.jobs]
        corpus = [data.resume_text] + job_texts

        # Calculate Overall Context Score (Experience, Vocabulary, Projects)
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)
        resume_vector = tfidf_matrix[0:1] 
        job_vectors = tfidf_matrix[1:]    
        similarities = cosine_similarity(resume_vector, job_vectors).flatten()

        results = []
        for i, context_score in enumerate(similarities):
            job = data.jobs[i]
            
            matched_skills = []
            missing_skills = []
            
            if job.skills:
                job_skills_list = [s.strip().lower() for s in job.skills.split(',') if s.strip()]
                total_skills = len(job_skills_list)
                
                for skill in job_skills_list:
                    escaped_skill = re.escape(skill)
                    if re.search(r'\b' + escaped_skill + r'\b', resume_lower):
                        matched_skills.append(skill.title())
                    else:
                        missing_skills.append(skill.title())
                
                # 🚨 HYBRID MATH: 70% Exact Skills + 30% Overall Context 🚨
                if total_skills > 0:
                    skill_percent = (len(matched_skills) / total_skills) * 100
                    text_percent = context_score * 100
                    
                    # Blend the scores
                    match_percent = round((skill_percent * 0.70) + (text_percent * 0.30), 2)
                    
                    # Ensure it never accidentally goes over 100%
                    match_percent = min(match_percent, 100.0)
                else:
                    match_percent = round(context_score * 100, 2)
            else:
                match_percent = round(context_score * 100, 2)

            if match_percent >= 0.0:
                results.append({
                    "job_id": job.id,
                    "match_score": match_percent,
                    "matched_skills": list(set(matched_skills)),
                    "missing_skills": list(set(missing_skills))
                })

        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results

    except ValueError:
        print("AI Warning: Not enough valid English words to compare.")
        return []
    except Exception as e:
        print(f"AI Error: {e}")
        return []


class MatchResumeRequest(BaseModel):
    resume_text: str
    required_skills: List[str]
    skill_weight: Optional[float] = 0.7
    context_weight: Optional[float] = 0.3


class CandidateItem(BaseModel):
    candidate_id: int
    name: Optional[str] = None
    resume_text: str


class RankCandidatesRequest(BaseModel):
    job_id: int
    required_skills: List[str]
    candidates: List[CandidateItem]
    skill_weight: Optional[float] = 0.7
    context_weight: Optional[float] = 0.3


def normalize_text(text: str) -> str:
    return re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())


def extract_skills(resume_text: str) -> List[str]:
    if not resume_text:
        return []
    text = normalize_text(resume_text)
    found_skills = set()
    for skill in SKILL_BANK:
        escaped = re.escape(skill)
        if re.search(r"\b" + escaped + r"\b", text):
            found_skills.add(skill)
    return sorted(found_skills)


@app.post("/extract-skills")
def extract_resume_skills(payload: Dict[str, Any]):
    resume_text = payload.get("resume_text", "")
    skills = extract_skills(resume_text)
    return {"skills": skills}


@app.post("/match-resume")
def match_resume(request: MatchResumeRequest):
    text = request.resume_text or ""
    required_skills = [s.strip().lower() for s in request.required_skills if s and s.strip()]
    required_skills = sorted(set(required_skills))

    normalized = normalize_text(text)
    matched_skills = []
    missing_skills = []
    for skill in required_skills:
        escaped = re.escape(skill)
        if re.search(r"\b" + escaped + r"\b", normalized):
            matched_skills.append(skill.title())
        else:
            missing_skills.append(skill.title())

    skill_percent = (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0
    context_score = 0
    if text.strip() and required_skills:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            corpus = [text, " ".join(required_skills)]
            mat = vectorizer.fit_transform(corpus)
            context_score = cosine_similarity(mat[0:1], mat[1:2]).flatten()[0] * 100
        except Exception:
            context_score = 0

    match_percentage = round(min((skill_percent * request.skill_weight) + (context_score * request.context_weight), 100.0), 2)
    return {
        "matched_skills": sorted(matched_skills),
        "missing_skills": sorted(missing_skills),
        "match_percentage": match_percentage
    }


@app.post("/rank-candidates")
def rank_candidates(request: RankCandidatesRequest):
    required_skills = [s.strip().lower() for s in request.required_skills if s and s.strip()]
    required_skills = sorted(set(required_skills))

    ranked = []
    for candidate in request.candidates:
        normalized = normalize_text(candidate.resume_text or "")
        matched_skills = []
        missing_skills = []
        for skill in required_skills:
            escaped = re.escape(skill)
            if re.search(r"\b" + escaped + r"\b", normalized):
                matched_skills.append(skill.title())
            else:
                missing_skills.append(skill.title())

        skill_percent = (len(matched_skills) / len(required_skills)) * 100 if required_skills else 0
        context_score = 0
        if candidate.resume_text and required_skills:
            try:
                vectorizer = TfidfVectorizer(stop_words='english')
                corpus = [candidate.resume_text, " ".join(required_skills)]
                mat = vectorizer.fit_transform(corpus)
                context_score = cosine_similarity(mat[0:1], mat[1:2]).flatten()[0] * 100
            except Exception:
                context_score = 0

        match_percentage = round(min((skill_percent * request.skill_weight) + (context_score * request.context_weight), 100.0), 2)
        ranked.append({
            "candidate_id": candidate.candidate_id,
            "name": candidate.name,
            "matched_skills": sorted(matched_skills),
            "missing_skills": sorted(missing_skills),
            "match_percentage": match_percentage
        })

    ranked.sort(key=lambda x: x["match_percentage"], reverse=True)
    for i, candidate in enumerate(ranked, start=1):
        candidate["candidate_rank"] = i

    return {"job_id": request.job_id, "ranked_candidates": ranked}

# uvicorn main:app --port 5000 --reload