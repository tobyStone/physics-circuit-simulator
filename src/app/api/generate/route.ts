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
3. Ensure the math in the update function accurately reflects National 5 Physics (e.g., V=IR, series components share current, parallel branches share voltage).
4. Do NOT set 'adjustable': true for Switches. Switches are toggled by the user clicking directly on the component in the diagram, not via a slider.

EXAMPLE SPACIOUS LOOP LAYOUT (Very Important):
To make the circuit visually clear, you MUST space components out widely. Create a large, spacious rectangular loop. Do NOT cluster components tightly together.
- Battery on the far left: x: 1, y: 3 (orientation: vertical)
- Top wire goes from x: 1, y: 1 to x: 5, y: 1
- Resistor 1 on the top branch: x: 3, y: 1 (orientation: horizontal)
- Resistor 2 on the far right: x: 5, y: 3 (orientation: vertical)
- Bottom wire goes from x: 5, y: 5 to x: 1, y: 5
- Ammeter on the bottom branch: x: 3, y: 5 (orientation: horizontal)

If there is a voltmeter in parallel across Resistor 2, place it further out:
- Voltmeter: x: 6, y: 3 (orientation: vertical)
- Voltmeter wires: Connect from x:5,y:2 to x:6,y:2 to Voltmeter, and from Voltmeter to x:6,y:4 to x:5,y:4.

Always aim for large, beautifully spaced rectangular loops (e.g. using coordinates 1 through 6) and perfect orthogonal paths!`;

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
