
import formidable from 'formidable';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = { api: { bodyParser: false } };
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Use POST");

  const form = new formidable.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err || !files.image) return res.status(400).send("Invalid upload");

    const imageBuffer = fs.readFileSync(files.image[0].filepath);

    const prompt = \`
      Ubah background foto ini menjadi [super realistik HD sore hari langit tajam refleksi cahaya matahari HD sore hari].
      Jangan ubah apapun dari objek utama di depan (misalnya orang, hewan, atau benda).
      Tingkatkan kualitas foto jadi HD: buat lebih tajam, detail, dan bersih, tapi tetap alami dan realistis.
    \`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBuffer.toString('base64'),
        },
      },
    ]);

    const response = await result.response;
    const part = response.parts.find(p => p.inlineData);
    const buffer = Buffer.from(part.inlineData.data, 'base64');

    res.setHeader('Content-Type', part.inlineData.mimeType);
    return res.send(buffer);
  });
}
