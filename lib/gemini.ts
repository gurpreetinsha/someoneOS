import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";

if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
}

export const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = (modelName: string = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({
    model: modelName,
  });
};
