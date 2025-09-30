import React, { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState('eng');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
  
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/bmp', 'image/tiff', 'application/pdf'
  ];
  const maxFileSize = 50 * 1024 * 1024;

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!file) {
      return alert('Pilih file dulu');
    }

    if (!allowedTypes.includes(file.type)) {
      return setResult('Error: Tipe file tidak didukung. Gunakan gambar (JPG, PNG, GIF, BMP, TIFF) atau PDF.');
    }

    if (file.size > maxFileSize) {
      return setResult('Error: Ukuran file terlalu besar. Maksimal 50MB.');
    }

    setLoading(true);
    setResult('');
    setAnalysis(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);

    try {
      const response = await fetch(`${apiBase}/api/upload`, { 
        method: 'POST', 
        body: formData 
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setResult('Error: ' + (data.error || `HTTP ${response.status}`));
      } else if (data.error) {
        setResult('Error: ' + data.error + (data.details ? '\n\nDetail: ' + data.details : ''));
      } else {
        setResult(data.text);
        setAnalysis(data.analysis);
      }
    } catch (err) {
      setResult('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle file selection
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    // Reset results when new file is selected
    if (selectedFile) {
      setResult('');
      setAnalysis(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            OCR PDF / Image — Tesseract + AI Analysis
          </h1>
          <p className="text-gray-600">
            Extract text from images and PDFs, then get AI-powered analysis and summary
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-gray-50 p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File (Image or PDF)
              </label>
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OCR Language
                </label>
                <select 
                  value={lang} 
                  onChange={e => setLang(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="eng">English (eng)</option>
                  <option value="ind">Indonesian (ind)</option>
                </select>
              </div>
              
              <div className="flex-1"></div>
              
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={loading || !file}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  'Upload & OCR'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Results Section */}
        {(result || analysis || loading) && (
          <div className="w-full flex flex-col space-y-8">
            {/* OCR Results */}
            <div className="w-full space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📄 OCR Results
              </h2>
              <div className="w-full bg-slate-100 rounded-lg min-h-64 overflow-auto">
                <pre className="p-4 whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {result || (loading ? 'Processing OCR...' : 'OCR results will appear here.')}
                </pre>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="w-full space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🤖 AI Analysis
                </span>
              </h2>
              <div className="w-full bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg min-h-64 overflow-auto">
                {analysis ? (
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2 text-lg">
                        📋 Document Explanation
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-base">
                        {analysis.penjelasan}
                      </p>
                    </div>
                    <div className="border-t border-purple-200 pt-6">
                      <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2 text-lg">
                        📝 Key Summary
                      </h3>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                        {analysis.ringkasan}
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-purple-600">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3 mx-auto"></div>
                      <p className="text-sm font-medium">
                        {result ? 'Analyzing document with AI...' : 'Waiting for OCR to complete...'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🤖</div>
                      <p className="text-sm">
                        AI analysis will appear after OCR is complete
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            Powered by Tesseract OCR + Llama AI • 
          </p>
        </div>
      </div>
    </div>
  );
}