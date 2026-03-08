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
    text: str # This will be Job Title + Description + Skills combined

class MatchRequest(BaseModel):
    resume_text: str
    jobs: List[JobItem]

@app.post("/match-jobs")
def match_jobs(data: MatchRequest):
    try:
        if not data.jobs or not data.resume_text.strip():
            return []

        # 1. Prepare the data pool (Resume + All Jobs)
        job_texts = [job.text for job in data.jobs]
        corpus = [data.resume_text] + job_texts

        # 2. Vectorize (Convert words into numbers/dimensions)
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)

        # 3. Calculate Cosine Similarity
        resume_vector = tfidf_matrix[0:1] # The first item is the resume
        job_vectors = tfidf_matrix[1:]    # The rest are jobs
        
        similarities = cosine_similarity(resume_vector, job_vectors).flatten()

        # 4. Format and filter results
        results = []
        for i, score in enumerate(similarities):
            match_percent = round(score * 100, 2)
            
            # Show all matches for now to debug
            if match_percent >= 5.0:
                results.append({
                    "job_id": data.jobs[i].id,
                    "match_score": match_percent
                })

        # Sort by highest match first
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results

    except ValueError:
        print("AI Warning: Not enough valid English words to compare.")
        return []
    except Exception as e:
        print(f"AI Error: {e}")
        return []
    
# uvicorn main:app --port 5000 --reload