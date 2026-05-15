/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, ChevronRight, Globe, IndianRupee, Calendar, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeDocument } from './services/api';
import Markdown from 'react-markdown';

type Language = 'English' | 'Hindi' | 'Hinglish';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('English');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size is too large. Please upload a file smaller than 10MB.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setAnalysis(null);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDocument(file, language);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setAnalysis(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Bharat Doc Helper</h1>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer hover:text-orange-600 transition-colors"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Understand Any Document Easily
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-xl mx-auto"
          >
            Upload Aadhaar, PAN cards, bills, medical reports, or any official paper. 
            We'll explain it to you in simple language.
          </motion.p>
        </div>

        <section className="space-y-6">
          {!file ? (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white hover:border-orange-400 hover:bg-orange-50/30 transition-all cursor-pointer group"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={onFileChange}
                accept="image/*,.pdf"
              />
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-lg font-medium mb-2">Click to upload or drag & drop</h3>
              <p className="text-sm text-gray-400">PDFs or Images up to 10MB</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                  <div className="aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative group">
                    {preview ? (
                      <img src={preview} alt="Document" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <FileText className="w-12 h-12" />
                        <span className="text-sm font-medium">{file.name}</span>
                      </div>
                    )}
                    <button 
                      onClick={reset}
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-red-500"
                    >
                      <AlertCircle className="w-4 h-4 translate-y-[0.5px] rotate-45" />
                    </button>
                  </div>
                  <button
                    disabled={loading}
                    onClick={handleAnalyze}
                    className="w-full bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-orange-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Now
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  <button 
                    onClick={reset}
                    className="text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
                  >
                    Choose another file
                  </button>
                </div>

                <div className="w-full md:w-2/3">
                  <div className="min-h-[300px] flex flex-col">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3"
                        >
                          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <p className="text-sm font-medium">{error}</p>
                        </motion.div>
                      )}

                      {loading && !analysis && (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4"
                        >
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">Reading your document...</h4>
                            <p className="text-gray-400 text-sm">This usually takes about 10-15 seconds.</p>
                          </div>
                        </motion.div>
                      )}

                      {analysis && (
                        <motion.div 
                          key="analysis"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="prose prose-sm max-w-none prose-orange"
                        >
                          <div className="bg-orange-50/50 rounded-xl p-6 border border-orange-100 shadow-sm">
                            <div className="markdown-body">
                              <Markdown>{analysis}</Markdown>
                            </div>
                          </div>
                          
                          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                              <ClipboardList className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-semibold text-blue-900 text-xs uppercase tracking-wider mb-1">Expert Note</h5>
                                <p className="text-sm text-blue-800 leading-relaxed">Always verify the original physical document details before taking any financial or legal action.</p>
                              </div>
                            </div>
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                              <div>
                                <h5 className="font-semibold text-green-900 text-xs uppercase tracking-wider mb-1">Data Safety</h5>
                                <p className="text-sm text-green-800 leading-relaxed">Your data is processed securely and is not stored permanently on our servers.</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {!loading && !analysis && !error && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                          <Loader2 className="w-12 h-12 mb-4 opacity-20" />
                          <p className="max-w-[200px]">Click "Analyze Now" to see the breakdown of your document.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* Feature Grid */}
        {!analysis && !loading && !file && (
          <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <IndianRupee className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Bills & Payments</h4>
              <p className="text-sm text-gray-500">Know exactly how much to pay and when, with clear penalty warnings.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Important Deadlines</h4>
              <p className="text-sm text-gray-500">Never miss a renewal or application date for government schemes.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h4 className="font-bold mb-2">Simple Language</h4>
              <p className="text-sm text-gray-500">Hard government words explained in everyday English, Hindi, or Hinglish.</p>
            </div>
          </section>
        )}
      </main>

      <footer className="mt-24 py-12 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 Bharat Doc Helper. Built for Indian Citizens.</p>
          <p className="mt-2">Disclaimer: This tool provides general guidance using AI. For sensitive legal or financial matters, please consult a professional.</p>
        </div>
      </footer>
    </div>
  );
}
