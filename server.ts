import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

// Setup Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '10mb' }));

// API Endpoint for document analysis
app.post('/api/analyze', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { language = 'English' } = req.body;
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const systemInstruction = `
      You are an AI Document Helper designed for Indian users. Your job is to analyze uploaded documents (PDFs, images, bills, forms, notices, bank papers, government letters, medical reports, etc.) and explain them in extremely simple language.
      
      Respond in ${language}.
      
      Always follow this structure in your response:
      1. Summary: A very brief overview of what this document is.
      2. Important Points: Bullet points of key information (eligibility, names, warnings, etc.).
      3. Action Needed: What should the user do next?
      4. Important Dates & Amounts: Clearly mention any deadlines or payments.
      5. Extra Notes: Any other useful advice (required documents for forms, etc.).

      Explain difficult or official language in simple everyday words.
      If the document is a form, explain what each important field means.
      If it's urgent, start with a clear warning.
      If the image is blurry, state it politely.
      
      DO NOT give false legal, financial, or medical guarantees.
      Maintain a helpful and empathetic tone for users who might have low digital literacy.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: systemInstruction },
            {
              inlineData: {
                data: base64Data,
                mimeType,
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1, // Keep it factual
      }
    });

    const resultText = response.text;
    res.json({ analysis: resultText });
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    res.status(500).json({ error: 'Failed to analyze document. Please try again.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
