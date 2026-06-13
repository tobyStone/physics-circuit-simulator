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
2. The \`updateFunctionBody\` MUST be valid Javascript.
3. If total resistance is 0 (short circuit), set the current to a very high value like 999 instead of 0!
3. Components on the LEFT or RIGHT vertical branches MUST have \`"orientation": "vertical"\`.
4. Components on the TOP or BOTTOM horizontal branches MUST have \`"orientation": "horizontal"\`.

EXAMPLE SPACIOUS TALL LOOP LAYOUT:
If the user uploads a tall circuit with 2 resistors on the right branch and a voltmeter across one of them:
- Battery on the far left: metadata.x: 1, metadata.y: 3 (metadata.orientation: "vertical")
- Top wire goes from x: 1, y: 1 to x: 5, y: 1
- Resistor 1 on the top-right vertical branch: metadata.x: 5, metadata.y: 2 (metadata.orientation: "vertical")
- Resistor 2 on the bottom-right vertical branch: metadata.x: 5, metadata.y: 4 (metadata.orientation: "vertical")
- Bottom wire goes from x: 5, y: 5 to x: 1, y: 5
- Voltmeter in parallel across Resistor 2: metadata.x: 6, metadata.y: 4 (metadata.orientation: "vertical")
Wire Paths:
- bat to res1: path: [ {"x": 1, "y": 3}, {"x": 1, "y": 1}, {"x": 5, "y": 1}, {"x": 5, "y": 2} ]
- res1 to res2: path: [ {"x": 5, "y": 2}, {"x": 5, "y": 4} ]
- res2 to bat: path: [ {"x": 5, "y": 4}, {"x": 5, "y": 5}, {"x": 1, "y": 5}, {"x": 1, "y": 3} ]
- voltmeter top wire: from res1/res2 junction to voltmeter: path: [ {"x": 5, "y": 3}, {"x": 6, "y": 3}, {"x": 6, "y": 4} ]
- voltmeter bottom wire: from voltmeter to res2 bottom: path: [ {"x": 6, "y": 4}, {"x": 6, "y": 5}, {"x": 5, "y": 5} ]

Always make the circuit tall and spacious. Set orientations strictly based on the branch the component is on!`;

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

    const modelsToTry = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-flash-latest",
      "gemini-pro-latest",
      "gemini-2.0-flash"
    ];

    let responseText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          SYSTEM_PROMPT,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg"
            }
          }
        ]);
        responseText = result.response.text();
        console.log(`Successfully generated using model: ${modelName}`);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error("All Gemini models failed to generate content.");
    }
    
    let text = responseText;
    
    // Clean up markdown block if it exists
    text = text.replace(/```json\n?|\n?```/g, '').trim();
    
    // Extract strictly the JSON object in case the model added conversational text
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    if (startIndex !== -1 && endIndex !== -1) {
      text = text.substring(startIndex, endIndex + 1);
    }

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
