from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import pdfplumber
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

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
    skills: str  # 🚨 Added skills field to analyze specifically

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

        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)

        resume_vector = tfidf_matrix[0:1] 
        job_vectors = tfidf_matrix[1:]    
        
        similarities = cosine_similarity(resume_vector, job_vectors).flatten()

        results = []
        for i, score in enumerate(similarities):
            job = data.jobs[i]
            match_percent = round(score * 100, 2)
            
            # 🚨 NEW: Extract specific skill matches to explain the score
            matched_skills = []
            missing_skills = []
            
            if job.skills:
                # Split skills by comma or space and clean them
                job_skills_list = [s.strip().lower() for s in job.skills.replace(',', ' ').split() if s.strip()]
                for skill in job_skills_list:
                    if skill in resume_lower:
                        matched_skills.append(skill.capitalize())
                    else:
                        missing_skills.append(skill.capitalize())

            # For testing, we show all scores >= 0.0
            if match_percent >= 0.0:
                results.append({
                    "job_id": job.id,
                    "match_score": match_percent,
                    "matched_skills": list(set(matched_skills)), # Remove duplicates
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
    
# uvicorn main:app --port 5000 --reload