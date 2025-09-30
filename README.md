# 🤖 OCR + AI Analysis Application

A modern web application that combines **Tesseract OCR** for text extraction from images and PDFs with **Llama AI** for intelligent document analysis and summarization.

## ✨ Features

- 📄 **OCR Text Extraction**: Extract text from images (JPG, PNG, GIF, BMP, TIFF) and PDF files
- 🤖 **AI-Powered Analysis**: Get intelligent explanations and summaries of your documents
- 🌍 **Multi-language Support**: OCR in English and Indonesian
- 📱 **Modern UI**: Clean, responsive React interface with real-time processing indicators
- 🐳 **Dockerized**: Easy deployment with Docker Compose
- ⚡ **High Performance**: Optimized for speed and reliability

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Ollama      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (Llama AI)    │
│   Port: 8080    │    │   Port: 3000    │    │   Port: 11434   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**: [Install Docker](https://docs.docker.com/get-docker/)
- **Homebrew** (macOS): [Install Homebrew](https://brew.sh/)
- **At least 4GB RAM** for AI model

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd OCR
```

### 2. Install Ollama & AI Model

```bash
# Install Ollama
brew install ollama

# Start Ollama service
brew services start ollama

# Download Llama model (2GB download)
ollama pull llama3.2:3b

# Verify installation
ollama list
```

### 3. Start Application

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/ping

## 📋 Installation Guide (Step by Step)

### Step 1: System Requirements

Ensure your system meets these requirements:

- **Operating System**: macOS, Linux, or Windows with WSL2
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: At least 5GB free space
- **Docker**: Version 20.0 or higher

### Step 2: Install Dependencies

#### On macOS:
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install Ollama
brew install ollama
```

#### On Linux:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 3: Setup Ollama

```bash
# Start Ollama service
# macOS:
brew services start ollama

# Linux:
sudo systemctl start ollama

# Pull the AI model
ollama pull llama3.2:3b

# Test the model
ollama run llama3.2:3b "Hello, test response in Indonesian"
```

### Step 4: Configure Application

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd OCR
   ```

2. **Review configuration** (optional):
   ```bash
   # Check docker-compose.yml for any customizations
   cat docker-compose.yml
   ```

3. **Environment variables** (optional):
   ```bash
   # Create .env file for custom settings
   echo "LLAMA_API_URL=http://host.docker.internal:11434/api/generate" > .env
   echo "LLAMA_MODEL=llama3.2:3b" >> .env
   ```

### Step 5: Build and Run

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up

# Check if services are healthy
docker-compose ps
```

### Step 6: Verify Installation

1. **Test Frontend**: Open http://localhost:8080
2. **Test Backend**: `curl http://localhost:3000/ping`
3. **Test Ollama**: `curl http://localhost:11434/api/tags`
4. **Upload a test file** through the web interface

## 🛠️ Usage

### Web Interface

1. **Open** http://localhost:8080 in your browser
2. **Select** an image file or PDF (max 50MB)
3. **Choose** OCR language (English or Indonesian)
4. **Click** "Upload & OCR"
5. **View** results:
   - Left panel: Extracted text from OCR
   - Right panel: AI analysis and summary

### API Usage

#### Upload File for OCR + AI Analysis

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@your-document.pdf" \
  -F "lang=eng"
```

#### Response Format

```json
{
  "text": "Extracted text from OCR...",
  "analysis": {
    "penjelasan": "Brief explanation of the document",
    "ringkasan": "• Key point 1\n• Key point 2\n• Key point 3"
  },
  "metadata": {
    "filename": "document.pdf",
    "fileSize": 1234567,
    "language": "eng",
    "pages": 3,
    "timestamp": "2025-09-29T10:30:00.000Z"
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LLAMA_API_URL` | `http://localhost:11434/api/generate` | Ollama API endpoint |
| `LLAMA_MODEL` | `llama3.2:3b` | AI model to use |
| `NODE_ENV` | `production` | Node.js environment |
| `VITE_API_BASE` | `http://localhost:3000` | Backend API URL |

### Docker Compose Customization

```yaml
# docker-compose.override.yml (optional)
services:
  backend:
    environment:
      - LLAMA_MODEL=llama3.2:1b  # Use smaller model
    ports:
      - "3001:3000"  # Change backend port
  
  frontend:
    ports:
      - "8081:80"  # Change frontend port
```

## 📚 API Documentation

### Endpoints

#### `GET /ping`
Health check endpoint.

**Response:**
```json
{
  "message": "OCR Backend is running!",
  "timestamp": "2025-09-29T10:30:00.000Z"
}
```

#### `POST /api/upload`
Process file with OCR and AI analysis.

**Parameters:**
- `file` (multipart): Image or PDF file (max 50MB)
- `lang` (string): OCR language (`eng` or `ind`)

**Response:** See [Usage section](#api-usage) above.

### Supported File Types

- **Images**: JPG, JPEG, PNG, GIF, BMP, TIFF
- **Documents**: PDF (non-password protected)

## 🚨 Troubleshooting

### Common Issues

#### 1. "Ollama service not running"
```bash
# Check if Ollama is running
ps aux | grep ollama

# Start Ollama service
brew services start ollama  # macOS
sudo systemctl start ollama  # Linux
```

#### 2. "AI timeout errors"
```bash
# Check Ollama logs
docker logs ocr-backend

# Test Ollama directly
ollama run llama3.2:3b "Quick test"

# Reduce model size (optional)
ollama pull llama3.2:1b
```

#### 3. "OCR language not found"
```bash
# Check if language packs are installed
docker exec ocr-backend tesseract --list-langs

# Rebuild backend if languages missing
docker-compose build backend
```

#### 4. "Docker connection refused"
```bash
# Check Docker status
docker ps

# Restart services
docker-compose down
docker-compose up --build
```

#### 5. "File upload fails"
- Check file size (max 50MB)
- Verify file type is supported
- Ensure file is not corrupted

### Performance Optimization

#### For Low-RAM Systems
```bash
# Use smaller AI model
ollama pull llama3.2:1b

# Update environment variable
export LLAMA_MODEL=llama3.2:1b
```

#### For Faster Processing
```bash
# Pre-load the AI model
ollama run llama3.2:3b "warmup"

# Use SSD storage for Docker
# Configure Docker to use SSD location
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View frontend logs only
docker-compose logs -f frontend

# Check system resources
docker stats
```

## 🏗️ Development

### Local Development Setup

```bash
# Clone repository
git clone <repo-url>
cd OCR

# Backend development
cd backend
npm install
npm run dev

# Frontend development (separate terminal)
cd frontend
npm install
npm run dev
```

### Project Structure

```
OCR/
├── backend/
│   ├── server.js          # Main backend server
│   ├── package.json       # Backend dependencies
│   └── Dockerfile         # Backend container config
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind styles
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Frontend container config
│   └── index.html         # HTML template
├── docker-compose.yml     # Services orchestration
└── README.md             # This file
```

### Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - OCR engine
- [Ollama](https://ollama.ai/) - Local AI model runner
- [Llama 3.2](https://llama.meta.com/) - Meta's AI model
- [React](https://react.dev/) - Frontend framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

## 🆘 Support

If you encounter any issues:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](issues)
3. Create a new issue with:
   - System information
   - Error logs
   - Steps to reproduce

---

**Made with ❤️ by the OCR Team**