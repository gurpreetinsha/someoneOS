import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { EXTRACTION_PROMPT } from "@/prompts/extraction";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Brain dump text is required." },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: EXTRACTION_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(`Analyze this brain dump:\n\n${text}`);
    const responseText = result.response.text();

    // Clean up potential code fences if any slipped through
    const cleanedText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze brain dump with Gemini." },
      { status: 500 }
    );
  }
}
