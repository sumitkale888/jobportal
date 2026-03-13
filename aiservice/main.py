from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List
import pdfplumber
import io
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv


load_dotenv()
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
    
# uvicorn main:app --port 5000 --reload