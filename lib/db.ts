import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function getRandomQuestions(count = 5) {
  const questions = await sql`
    SELECT q.id, q.text, 
           json_agg(
             json_build_object(
               'id', o.id,
               'text', o.text,
               'type', o.learning_type
             )
           ) as options
    FROM questions q
    JOIN options o ON q.id = o.question_id
    GROUP BY q.id, q.text
    ORDER BY RANDOM()
    LIMIT ${count}
  `
  return questions
}

export async function saveAssessmentResult(
  userId: number,
  dominantType: string,
  percentages: {
    visual: number
    auditory: number
    kinesthetic: number
    reading: number
  },
) {
  return sql`
    INSERT INTO assessments (
      user_id,
      dominant_type,
      visual_percentage,
      auditory_percentage,
      kinesthetic_percentage,
      reading_percentage
    )
    VALUES (
      ${userId},
      ${dominantType},
      ${percentages.visual},
      ${percentages.auditory},
      ${percentages.kinesthetic},
      ${percentages.reading}
    )
    RETURNING id
  `
}

export async function getUserLatestAssessment(userId: number) {
  const [assessment] = await sql`
    SELECT *
    FROM assessments
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `
  return assessment
}

