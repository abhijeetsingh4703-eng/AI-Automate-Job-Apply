// PHASE 2: AI Prompt Templates
// These will be used with OpenAI to tailor resumes, generate cover letters, etc.

// TODO: Resume Tailoring Prompt
export const resumeTailoringPrompt = (resume: string, jobDescription: string) => {
  return {
    system: `You are an expert career coach and resume writer. Your task is to tailor a resume to match a specific job description while maintaining truthfulness and professional standards.`,
    user: `
Please tailor the following resume to better match this job description:

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Provide a tailored resume that:
1. Highlights relevant skills and experiences
2. Uses keywords from the job description
3. Maintains all truthful information
4. Improves readability and impact
    `,
  };
};

// TODO: Cover Letter Generation Prompt
export const coverLetterPrompt = (resume: string, jobDescription: string, companyName: string) => {
  return {
    system: `You are an expert writer skilled at creating compelling cover letters that match job requirements.`,
    user: `
Generate a professional cover letter based on:

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

COMPANY:
${companyName}

The cover letter should:
1. Be professional and compelling
2. Match the job requirements
3. Show enthusiasm for the role
4. Be 3-4 paragraphs
    `,
  };
};

// TODO: Job Matching Score Prompt
export const jobMatchingPrompt = (resume: string, jobDescription: string) => {
  return {
    system: `You are a career matching expert. Score how well a candidate matches a job.`,
    user: `
Rate this match on a scale of 1-10 and explain why:

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Provide:
1. Match score (1-10)
2. Top 3 strengths that match the job
3. Top 3 areas for improvement
    `,
  };
};
