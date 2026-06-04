import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { message, symptoms } = await req.json()

    const userInput = symptoms
      ? `Symptoms: ${symptoms}\n\nQuestion: ${message}`
      : message

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are LifeLink, a smart AI health assistant. Be conversational, warm and concise — like a knowledgeable friend, not a textbook.

Response rules:
- Keep answers SHORT and clear — 3 to 5 lines maximum for simple questions
- For complex questions use bullet points but keep each point to one line
- Never dump everything you know — give the most important info only
- Do NOT end with a disclaimer every single time
- ALWAYS end your response with one smart follow-up question to learn more about the user's situation, like ChatGPT does
- If user writes in Hindi respond in Hindi, Tamil respond in Tamil

Example of good response style:
User: I have a headache
You: Could be tension, dehydration, or eye strain — these are the most common causes.
- Try drinking water and resting in a dark room
- A painkiller like paracetamol can help

How long have you had it, and is it on one side or both?

Medical rules:
- Never give a definitive diagnosis
- If symptoms sound like an emergency (chest pain, trouble breathing, stroke signs) tell them to go to hospital immediately
- Recommend a doctor for anything serious or lasting more than a few days`
        },
        {
          role: 'user',
          content: userInput
        }
      ]
    })

    const reply = response.choices[0].message.content

    return NextResponse.json({ reply, success: true })

  } catch (error) {
    console.error('Groq API error:', String(error))
    return NextResponse.json(
      { error: String(error), success: false },
      { status: 500 }
    )
  }
}