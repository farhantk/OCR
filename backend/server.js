const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const tesseract = require('node-tesseract-ocr');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const uploadDir = './uploads';

require('fs').mkdirSync(uploadDir, { recursive: true });

const LLAMA_API_URL = process.env.LLAMA_API_URL || 'http://localhost:11434/api/generate';
const LLAMA_MODEL = process.env.LLAMA_MODEL || 'llama3.2:3b';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

async function getLlamaAnalysis(ocrText) {
  try {
    const maxTextLength = 2000;
    const truncatedText = ocrText.length > maxTextLength 
      ? ocrText.substring(0, maxTextLength) + "..." 
      : ocrText;

    console.log('Sending text to Llama for analysis...');

    const prompt = `Analisis teks berikut dari hasil OCR. Berikan penjelasan singkat dan ringkasan dalam bahasa Indonesia:

Teks:
"""
${truncatedText}
"""

Jawab dalam format:
Penjelasan: [penjelasan singkat tentang isi dokumen]
Ringkasan: 
- [poin 1]
- [poin 2]
- [poin 3]`;

    const response = await axios.post(LLAMA_API_URL, {
      model: LLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 500,
        num_predict: 500
      }
    }, {
      timeout: 60000, // 60 seconds timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response from Llama');

    if (response.data && response.data.response) {
      const fullResponse = response.data.response.trim();
      
      const penjelasanMatch = fullResponse.match(/Penjelasan:\s*(.*?)(?=Ringkasan:|$)/is);
      const ringkasanMatch = fullResponse.match(/Ringkasan:\s*(.*)/is);
      
      return {
        penjelasan: penjelasanMatch ? penjelasanMatch[1].trim() : "Dokumen berhasil dianalisis",
        ringkasan: ringkasanMatch ? ringkasanMatch[1].trim() : fullResponse
      };
    }

    return {
      penjelasan: "Tidak dapat menganalisis dokumen",
      ringkasan: "Response kosong dari AI"
    };

  } catch (error) {
    console.error('Llama API error:', error.message);

    let errorMessage = "Layanan AI tidak tersedia saat ini";
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Ollama service tidak berjalan";
    } else if (error.code === 'ECONNRESET' || error.message.includes('timeout')) {
      errorMessage = "AI membutuhkan waktu terlalu lama, coba dengan teks yang lebih pendek";
    }

    return {
      penjelasan: "Gagal menganalisis dokumen dengan AI",
      ringkasan: errorMessage
    };
  }
}


app.get('/ping', (req, res) => {
  res.json({ message: 'OCR Backend is running!', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.pdf'];
  if (!allowedTypes.includes(ext)) {
    await fs.unlink(filePath).catch(() => {});
    return res.status(400).json({ 
      error: `File type ${ext} not supported. Allowed: ${allowedTypes.join(', ')}` 
    });
  }

  try {
    let images = [];

    if (ext === '.pdf') {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const header = fileBuffer.toString('ascii', 0, 4);
        if (header !== '%PDF') {
          throw new Error('Invalid PDF file format');
        }
      } catch (validationError) {
        await fs.unlink(filePath).catch(() => {});
        return res.status(400).json({ 
          error: 'File is not a valid PDF: ' + validationError.message 
        });
      }

      const outPrefix = filePath + '-page';
      const cmd = `pdftoppm -png "${filePath}" "${outPrefix}"`;

      try {
        await execPromise(cmd);
      } catch (pdfError) {
        await fs.unlink(filePath).catch(() => {});
        return res.status(400).json({ 
          error: 'PDF processing failed. The PDF file may be corrupted, password-protected, or in an unsupported format.',
          details: pdfError.message 
        });
      }

      const dirFiles = await fs.readdir(path.dirname(filePath));
      const basename = path.basename(outPrefix);
      for (const f of dirFiles) {
        if (f.startsWith(basename) && f.endsWith('.png')) {
          images.push(path.join(path.dirname(filePath), f));
        }
      }

      if (images.length === 0) {
        await fs.unlink(filePath).catch(() => {});
        return res.status(400).json({ 
          error: 'No pages could be extracted from the PDF file' 
        });
      }

      images.sort();
    } else {
      try {
        const fileBuffer = await fs.readFile(filePath);
        const isValidImage = 
          fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8 && fileBuffer[2] === 0xFF || 
          fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47 || 
          fileBuffer[0] === 0x47 && fileBuffer[1] === 0x49 && fileBuffer[2] === 0x46 || 
          fileBuffer[0] === 0x42 && fileBuffer[1] === 0x4D; 

        if (!isValidImage) {
          throw new Error('Invalid image file format');
        }
      } catch (validationError) {
        await fs.unlink(filePath).catch(() => {});
        return res.status(400).json({ 
          error: 'File is not a valid image: ' + validationError.message 
        });
      }

      images = [filePath];
    }

    const config = {
      lang: req.body.lang || 'eng',
      oem: 1,
      psm: 3
    };

    let finalText = '';
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const text = await tesseract.recognize(img, config);
      finalText += `--- Page ${i + 1} ---\n${text}\n\n`;
    }

    if (ext === '.pdf') {
      for (const img of images) {
        await fs.unlink(img).catch(() => {});
      }
    }
    await fs.unlink(filePath).catch(() => {});

    let llamaAnalysis = null;
    if (finalText && finalText.trim().length > 10) {
      console.log(`OCR completed. Text length: ${finalText.length} characters. Starting AI analysis...`);
      try {
        llamaAnalysis = await getLlamaAnalysis(finalText);
        console.log('AI analysis completed successfully');
      } catch (analysisError) {
        console.error('AI analysis failed:', analysisError.message);
        llamaAnalysis = {
          penjelasan: "AI analysis error",
          ringkasan: "Terjadi kesalahan saat menganalisis dokumen dengan AI"
        };
      }
    } else {
      console.log('Text too short for AI analysis');
    }

    res.json({ 
      text: finalText,
      analysis: llamaAnalysis,
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        language: config.lang,
        pages: images.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (err) {
    console.error('OCR processing error:', err);
    await fs.unlink(filePath).catch(() => {});
    res.status(500).json({ 
      error: 'OCR processing failed', 
      details: String(err) 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 OCR Backend listening on port ${PORT}`);
  console.log(`📊 API Base URL: http://localhost:${PORT}`);
  console.log(`🤖 Llama API URL: ${LLAMA_API_URL}`);
  console.log(`🧠 Llama Model: ${LLAMA_MODEL}`);
});