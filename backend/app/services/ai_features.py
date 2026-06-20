from typing import Any

from sqlalchemy.orm import Session

from app.services.ai_manager import call_ai, compress_resume_text


async def analyze_ats_score(resume_json: Any, job_description: str | None = None, db: Session | None = None, user_id: str | None = None) -> dict | None:
    resume_text = compress_resume_text(resume_json, 1200)
    job_context = f"\nJob Description:\n{job_description[:500]}" if job_description else ""
    prompt = f"""You are an enterprise ATS scoring engine.
Analyze the resume and return a detailed ATS compatibility score.{job_context}

Resume:
{resume_text}

Return ONLY valid JSON:
{{"overallScore":0,"skillScore":0,"experienceScore":0,"educationScore":0,"keywordScore":0,"formatScore":0,"strengths":[],"gaps":[],"improvementTips":[],"summary":""}}
Rules: All scores 0-100. Be specific and actionable in tips. No buzzwords."""
    result = await call_ai(prompt, "ATS_SCORE", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def optimize_for_ats(resume_json: Any, job_description: str, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""You are an ATS optimization expert. Rewrite the resume sections to maximize ATS score for this job.

Job Description:
{job_description[:600]}

Current Resume:
{compress_resume_text(resume_json, 1000)}

Return ONLY valid JSON:
{{"optimizedSections":{{"summary":"","skills":[],"experience":[{{"original":"","optimized":""}}]}},"keywordsToAdd":[],"sectionsToRemove":[],"formattingFixes":[],"estimatedScoreIncrease":0}}"""
    result = await call_ai(prompt, "ATS_OPTIMIZE", db=db, user_id=user_id, use_cache=False)
    return result.data if result.success else None


async def rewrite_resume(raw_text: str, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""You are a professional resume writer. Transform this raw resume text into a structured, ATS-optimized resume.
Rules:
- Use strong action verbs
- Quantify impact where the text supports it
- Keep summary under 3 sentences

Raw Resume:
{raw_text[:6000]}

Return ONLY valid JSON:
{{"summary":"","technicalSkills":[],"workExperience":[{{"company":"","role":"","duration":"","description":"","achievements":[]}}],"projects":[{{"name":"","description":"","tech":[],"impact":""}}],"education":[{{"degree":"","field":"","institution":"","graduationYear":""}}]}}"""
    result = await call_ai(prompt, "RESUME_REWRITE", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def generate_cover_letter(resume_json: Any, job_title: str, company_name: str, job_description: str, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""Write a professional personalized cover letter.
Position: {job_title} at {company_name}
Job Description: {job_description[:400]}
Candidate Profile: {compress_resume_text(resume_json, 800)}
Return ONLY valid JSON: {{"subject":"","body":"","callToAction":"","wordCount":0}}"""
    result = await call_ai(prompt, "COVER_LETTER", db=db, user_id=user_id, use_cache=False)
    return result.data if result.success else None


async def generate_interview_questions(role_title: str, resume_json: Any, difficulty: str, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""Generate realistic interview questions.
Role: {role_title} ({difficulty})
Candidate Profile: {compress_resume_text(resume_json, 600)}
Return ONLY valid JSON:
{{"technical":[{{"question":"","difficulty":"Medium","hint":""}}],"behavioral":[{{"question":"","starHint":""}}],"roleSpecific":[{{"question":"","whyAsked":""}}],"systemDesign":[{{"question":"","approach":""}}]}}"""
    result = await call_ai(prompt, "INTERVIEW_QUESTIONS", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def analyze_skill_gap(resume_json: Any, target_role: str, job_description: str, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""Identify skill gaps between the candidate and target role.
Target Role: {target_role}
Job Requirements: {job_description[:400]}
Candidate Profile: {compress_resume_text(resume_json, 800)}
Return ONLY valid JSON:
{{"currentSkills":[],"requiredSkills":[],"gapSkills":[{{"skill":"","importance":"Important","timeToLearn":"2-4 weeks","resources":[]}}],"readinessScore":0,"learningPath":[]}}"""
    result = await call_ai(prompt, "SKILL_GAP", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def generate_career_recommendations(resume_json: Any, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""Analyze this candidate profile and provide career recommendations.
Candidate Profile: {compress_resume_text(resume_json, 800)}
Return ONLY valid JSON:
{{"currentLevel":"","potentialRoles":[{{"title":"","matchPercentage":0,"salaryRange":"","transitionDifficulty":"Moderate","requiredSkills":[]}}],"careerTrajectory":"","actionableSteps":[]}}"""
    result = await call_ai(prompt, "CAREER_RECOMMENDATION", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def predict_job_match(resume_json: Any, job_doc: Any, db: Session | None = None, user_id: str | None = None) -> dict | None:
    prompt = f"""Predict how well this candidate matches the job.
Job: {job_doc.title}
Requirements: {str(job_doc.requirements)[:300]}
Description: {job_doc.description[:400]}
Candidate: {compress_resume_text(resume_json, 800)}
Return ONLY valid JSON:
{{"overallMatch":0,"skillsMatch":0,"experienceMatch":0,"educationMatch":0,"cultureMatch":0,"pros":[],"cons":[],"recommendation":"Apply","negotiationPoints":[]}}"""
    result = await call_ai(prompt, "JOB_MATCH", db=db, user_id=user_id, use_cache=True)
    return result.data if result.success else None


async def rank_candidates(job_title: str, job_description: str, candidates: list[dict], db: Session | None = None, user_id: str | None = None) -> dict | None:
    compressed = [{"candidateName": c["name"], "candidateId": c["id"], "resume": compress_resume_text(c["resume"], 400)} for c in candidates[:10]]
    prompt = f"""Rank these candidates for the given role.
Job: {job_title}
Description: {job_description[:400]}
Candidates: {compressed}
Return ONLY valid JSON:
{{"rankedCandidates":[{{"candidateName":"","candidateId":"","overallScore":0,"skillsScore":0,"experienceScore":0,"educationScore":0,"strengthSummary":"","riskFlags":[],"recommendation":""}}],"averageScore":0,"topCandidate":"","hiringInsights":""}}
Sort by overallScore descending."""
    result = await call_ai(prompt, "CANDIDATE_RANK", db=db, user_id=user_id, use_cache=False)
    return result.data if result.success else None


async def generate_hiring_insights(job_title: str, applications: list[dict], db: Session | None = None, user_id: str | None = None) -> dict | None:
    summary = {
        "jobTitle": job_title,
        "totalApplications": len(applications),
        "avgScore": sum(a.get("matchScore", 0) for a in applications) / (len(applications) or 1),
    }
    prompt = f"""Generate actionable hiring insights for this job analytics summary:
{summary}
Return ONLY valid JSON:
{{"talentPoolHealth":"Moderate","commonSkillGaps":[{{"skill":"","gapCount":0}}],"salaryBenchmark":{{"low":"","median":"","high":""}},"hiringRecommendations":[],"timeToFillEstimate":"2-4 weeks","diversityScore":0,"marketInsights":""}}"""
    result = await call_ai(prompt, "HIRING_INSIGHTS", db=db, user_id=user_id, use_cache=False)
    return result.data if result.success else None
