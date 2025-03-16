import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Add this to your .env.local file
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { problem, difficulty, current_progress } = body;
    
    if (!problem || !difficulty || !current_progress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create the prompt similar to your app.py
    const prompt = `
You are a non-interactive personalized assistant designed to help candidates in a proctoring test environment.
The candidate is currently attempting the following problem:
Problem: ${problem}
Difficulty Level: ${difficulty}
Candidate's Current Progress: ${current_progress}

Provide three distinct and escalating levels of hints based on the candidate's progress:
1. **Gentle Nudge**: Offer a minimal conceptual cue or a general direction to think about. Do not provide specific methods or steps.
2. **Stronger Hint**: Suggest a specific technique or approach to consider, but do not explain how to implement it fully.
3. **Direct Guidance**: Provide a high-level step-by-step direction without giving away the full solution. Focus on guiding the candidate to think critically.

Ensure that:
- Each hint level is distinct and does not overlap with the others.
- No full answers or direct implementation details are provided.
- The hints are encouraging and maintain the integrity of the learning process.
`;

    // Call OpenAI API directly
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt }
      ],
    });

    // Extract the response
    const hints = completion.choices[0].message.content;
    
    return NextResponse.json({ hints });
  } catch (error) {
    console.error('Error in hints API:', error);
    return NextResponse.json(
      { error: 'Failed to generate hints' },
      { status: 500 }
    );
  }
}