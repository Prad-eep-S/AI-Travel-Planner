const { GoogleGenerativeAI } = require("@google/generative-ai");

const dotenv = require("dotenv");
dotenv.config();

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

console.log(process.env.GEMINI_API_KEY)

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const generateTravelPlan = async (
  destination,
  durationDays,
  budgetTier,
  interests
) => {
  const prompt = `
Generate a travel itinerary.

Destination: ${destination}
Days: ${durationDays}
Budget: ${budgetTier}
Interests: ${interests.join(", ")}

Return ONLY valid JSON.

Do not include markdown.
Do not include explanation text.
Do not include \`\`\`json.

Use this exact structure:

{
  "itinerary": [
    {
      "day": 1,
      "activities": []
    }
  ],
  "hotels": [
    {
      "name": "",
      "type": ""
    }
  ],
  "estimatedBudget": {
    "flights": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0
  }
}
`;

  const result = await model.generateContent(prompt);

  return result.response.text();
};

module.exports = {
  generateTravelPlan,
};