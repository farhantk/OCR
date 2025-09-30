# OCR + AI Analysis Setup

## Fitur Baru
- **OCR**: Ekstraksi teks dari gambar dan PDF menggunakan Tesseract
- **AI Analysis**: Analisis dokumen dan ringkasan menggunakan Llama AI

## Konfigurasi AI (Llama)

### Option 1: Local Ollama (Recommended)
1. Install Ollama: https://ollama.ai
2. Download model Llama:
   ```bash
   ollama pull llama3.2:3b
   ```
3. Start Ollama service:
   ```bash
   ollama serve
   ```
4. Ollama akan berjalan di `http://localhost:11434`

### Option 2: Custom API Endpoint
Set environment variables di docker-compose.yml atau .env:
```bash
LLAMA_API_URL=your-api-endpoint
LLAMA_MODEL=your-model-name
```

## Cara Menjalankan

1. **Tanpa AI Analysis** (jika Ollama tidak tersedia):
   Aplikasi tetap akan berfungsi untuk OCR, analisis AI akan menampilkan pesan error yang ramah.

2. **Dengan AI Analysis**:
   - Pastikan Ollama berjalan di local
   - Start aplikasi: `docker-compose up`
   - Upload file dan lihat hasil analisis AI

## UI Baru
- **Layout 2 kolom**: Hasil OCR di kiri, Analisis AI di kanan
- **Gradient design**: Interface yang lebih menarik untuk section AI
- **Loading indicator**: Menunjukkan proses analisis AI sedang berjalan
- **Error handling**: Pesan yang jelas jika AI tidak tersedia

## Port
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Ollama (jika local): http://localhost:11434