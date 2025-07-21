// index.js - Web AI HD Foto pakai Gemini 2.5 Flash
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import * as genai from '@google/generative-ai';

const app = express();
const upload = multer({ dest: '/tmp' });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ganti dengan API Key kamu
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyD60NTFSeUdPlPNiqS8DRnU757yzP1f_HY";
const genAI = new genai.GoogleGenerativeAI(GEMINI_API_KEY);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (_, res) => {
  res.send(\`
    <html>
      <head>
        <title>HD AI Photo Editor</title>
        <style>
          body {
            font-family: sans-serif;
            background: linear-gradient(135deg, #6a0dad, #00ffff, #00ffaa, #aaf);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px;
          }
          h1 {
            text-shadow: 1px 1px 4px #000;
          }
          form {
            background: rgba(0,0,0,0.4);
            padding: 20px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            width: 300px;
          }
          input[type="file"] {
            padding: 8px;
          }
          button {
            background: #fff;
            color: #000;
            font-weight: bold;
            padding: 10px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
          }
          img {
            margin-top: 20px;
            max-width: 90vw;
            border-radius: 12px;
            box-shadow: 0 0 12px #000;
          }
        </style>
      </head>
      <body>
        <h1>HD AI Photo Editor</h1>
        <form action="/process" method="post" enctype="multipart/form-data">
          <input type="file" name="image" accept="image/*" required />
          <button type="submit">Lanjut (Jadi HD)</button>
        </form>
      </body>
    </html>
  \`);
});

app.post('/process', upload.single('image'), async (req, res) => {
  const filePath = req.file.path;
  const fileBuffer = await readFile(filePath);
  const base64Image = fileBuffer.toString('base64');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
            {
              text: \`Ubah background foto ini menjadi [super realistik HD sore hari langit tajam refleksi cahaya matahari HD sore hari].\nJangan ubah apapun dari objek utama di depan (misalnya orang, hewan, atau benda).\nTingkatkan kualitas foto jadi HD: buat lebih tajam, detail, dan bersih, tapi tetap alami dan realistis.\`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'image/png',
      },
    });

    const imageBase64 = result.response.parts[0].inlineData.data;
    const fileName = `hd-result-${Date.now()}.png`;
    const filePathOut = path.join('/tmp', fileName);
    fs.writeFileSync(filePathOut, Buffer.from(imageBase64, 'base64'));

    const imgTag = \`<img src="data:image/png;base64,\${imageBase64}" /><br><a href="/download/\${fileName}"><button>⬇️ Download</button></a>\`;

    res.send(\`
      <html>
        <head><title>Hasil HD</title></head>
        <body style="text-align: center; background: #222; color: #fff; font-family: sans-serif;">
          <h1>Foto HD Selesai</h1>
          \${imgTag}
          <br><br>
          <a href="/">🔁 Kembali</a>
        </body>
      </html>
    \`);
  } catch (err) {
    console.error(err);
    res.send(\`<h1 style="color:red">Gagal proses: \${err.message}</h1>\`);
  } finally {
    fs.unlink(filePath, () => {}); // Hapus file upload asli
  }
});

app.get('/download/:filename', (req, res) => {
  const fullPath = path.join('/tmp', req.params.filename);
  res.download(fullPath, err => {
    if (!err) fs.unlink(fullPath, () => {});
  });
});

export default app;

export const config = {
  runtime: 'edge',
};