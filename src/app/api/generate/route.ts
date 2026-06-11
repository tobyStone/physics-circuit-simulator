import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { checkRateLimit } from '@/lib/rateLimit';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are an expert SQA National 5 Physics teacher and software engineer.
You are given an image of a circuit diagram. Your task is to convert this diagram into a JSON representation that our interactive React circuit simulator can render.

Our simulator uses a 150x150 pixel grid system. Components are placed at integer coordinates (e.g., x: 2, y: 3).
Wires are routed using orthogonal lines (only horizontal and vertical movements).

You must return ONLY a raw JSON object with no markdown formatting. The JSON must exactly match this schema:
{
  "id": "generated-circuit",
  "name": "Generated Circuit",
  "description": "A circuit generated from an uploaded diagram.",
  "sqaNotes": "Notes about the physics principles demonstrated in this circuit.",
  "components": [
    {
      "id": "unique-id (e.g., bat1, res1, led1)",
      "type": "Battery|Resistor|LED|Switch|TransistorNPN|Motor|Ammeter|Voltmeter",
      "name": "Human readable name",
      "value": 12,
      "current": 0,
      "voltageDrop": 0,
      "metadata": {
        "x": 1,
        "y": 1,
        "orientation": "horizontal|vertical",
        "adjustable": true,
        "min": 0,
        "max": 24,
        "step": 1,
        "unit": "V|Ω|A"
      }
    }
  ],
  "wirePaths": [
    {
      "from": "source_component_id",
      "to": "destination_component_id",
      "currentSourceId": "component_id_that_determines_current_flow",
      "path": [ {"x": 1, "y": 1}, {"x": 2, "y": 1} ]
    }
  ],
  "updateFunctionBody": "A string containing a valid javascript function body..."
}

CRITICAL RULES:
1. Ensure all wire paths are orthogonal (x or y must remain constant between sequential points).
2. The \`updateFunctionBody\` MUST be valid Javascript. Do NOT include \`function update(components) {\` or \`}\`. Just the inner body.
3. Ensure the math in the update function accurately reflects National 5 Physics (e.g., V=IR, series components share current, parallel branches share voltage).`;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
    }

    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = result.response;
    let text = response.text();
    
    // Clean up markdown block if it exists
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      return NextResponse.json({ error: 'AI generated invalid JSON.', rawText: text }, { status: 500 });
    }

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
