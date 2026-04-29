import { create, all } from 'mathjs';
const math = create(all);

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  Home, BookOpen, MessageSquare, ListChecks, Newspaper, 
  ChevronRight, ArrowLeft, Send, Sparkles, Trophy, 
  History, Calculator, User as UserIcon,
  PlayCircle, FileText,
  Clock, Plus, FlaskConical, Globe, Divide, TrendingUp, Activity, Monitor,
  Layout as ToolLayout, GraduationCap, Timer, Book, Zap, Users,
  Bot, Coffee, Pause, Play, RotateCcw, RotateCw, Flame, Wind, Calendar,
  Dna, Binary, Languages, Microscope, Sigma, Scale, Lightbulb, Bell, Megaphone,
  Pin, Info, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, CheckCircle2, Search, Download, PenTool, Eye, EyeOff,
  ExternalLink, BarChart3, LogOut, LayoutDashboard, Video, FileJson, MessageSquareQuote, 
  Trash2, Edit3, Check, CheckCircle, X, Filter, Image as ImageIcon, PlusSquare, Radio, Database, Server, Lock,
  BrainCircuit, ClipboardCheck, XCircle, Library, Grid3X3, UserCheck, GalleryVertical, Archive,
  ShieldCheck, ArrowRight, SearchX, Target, ClipboardList, Settings, Heart, Bookmark, Volume2, ArrowRightLeft, Copy, Save,
  BookMarked, Layout as LayoutIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { jsPDF } from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import Groq from "groq-sdk";
import { AppData, User, SubjectData, NewsItem, SubjectType, Chapter, LeaderboardEntry, CalendarEvent } from './types.ts';

/**
 * Utility for Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cerebras AI - Main Brain for MOMO
 */
const callCerebrasForMomo = async (messages: any[], isJson: boolean = false) => {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY || "";

    if (!apiKey) throw new Error("API key is not configured. Please add VITE_CEREBRAS_API_KEY to your environment variables.");

    const formattedMessages = messages.map(m => ({
        role: m.role === 'model' || m.role === 'ai' || m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user'),
        content: typeof m.parts?.[0]?.text === 'string' ? m.parts[0].text : m.text || m.content
    }));

    try {
        const client = new Groq({ apiKey, baseURL: "https://api.cerebras.ai/v1", dangerouslyAllowBrowser: true });
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b",
            messages: formattedMessages as any,
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0]?.message?.content || "";
    } catch (err: any) {
        console.warn("Cerebras failed, falling back to reliable Groq LLaMA 70B", err);
        // @ts-ignore
        const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
        if (!groqKey) throw new Error(`Cerebras failed: ${err.message}. (No Groq fallback available)`);
        
        const backupClient = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
        const response = await backupClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: formattedMessages as any,
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0]?.message?.content || "";
    }
};

/**
 * YouTube Utility - Enhanced to handle shorts and various URL formats
 */
const extractYoutubeId = (url: string) => {
    if (!url) return null;
    // Enhanced regex to handle regular, embed, share, and shorts URLs
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : null;
};

/**
 * SambaNova AI - Reliable Backup for MANGO
 */
const callSambaNovaForMomo = async (messages: any[], isJson: boolean = false) => {
    // @ts-ignore
    const apiKey = import.meta.env.VITE_SAMBANOVA_API_KEY || "";

    if (!apiKey) throw new Error("API key is not configured. Please add VITE_SAMBANOVA_API_KEY to your environment variables.");

    const formattedMessages = messages.map(m => ({
        role: m.role === 'model' || m.role === 'ai' || m.role === 'assistant' ? 'assistant' : (m.role === 'system' ? 'system' : 'user'),
        content: typeof m.parts?.[0]?.text === 'string' ? m.parts[0].text : m.text || m.content
    }));

    try {
        const client = new Groq({ apiKey, baseURL: "https://api.sambanova.ai/v1", dangerouslyAllowBrowser: true });
        const response = await client.chat.completions.create({
            model: "Meta-Llama-3.3-70B-Instruct",
            messages: formattedMessages as any,
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0]?.message?.content || "";
    } catch (err: any) {
        console.warn("SambaNova failed, falling back to reliable Groq LLaMA 70B", err);
        // @ts-ignore
        const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
        if (!groqKey) throw new Error(`SambaNova failed: ${err.message}. (No Groq fallback available)`);
        
        const backupClient = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
        const response = await backupClient.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: formattedMessages as any,
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0]?.message?.content || "";
    }
};

// ════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════

const SUBJECTS_CONFIG: Record<SubjectType, { color: string; icon: any; gradient: string }> = {
  'English': { color: 'blue', icon: Languages, gradient: 'from-blue-500 to-indigo-600' },
  'नेपाली': { color: 'purple', icon: Edit3, gradient: 'from-purple-500 to-pink-600' },
  'Maths': { color: 'red', icon: Sigma, gradient: 'from-rose-500 to-orange-600' },
  'Science': { color: 'emerald', icon: Microscope, gradient: 'from-emerald-500 to-teal-600' },
  'सामाजिक': { color: 'amber', icon: Globe, gradient: 'from-amber-500 to-orange-500' },
  'Optional Maths': { color: 'indigo', icon: Binary, gradient: 'from-indigo-600 to-violet-700' },
  'Account': { color: 'orange', icon: ListChecks, gradient: 'from-orange-500 to-yellow-600' },
  'Computer': { color: 'cyan', icon: Monitor, gradient: 'from-cyan-500 to-blue-600' },
  'Economics': { color: 'emerald', icon: TrendingUp, gradient: 'from-emerald-600 to-green-700' },
  'Health': { color: 'rose', icon: Activity, gradient: 'from-rose-500 to-red-600' }
};

const BOOK_LINKS: Record<string, string> = {
    'Maths': 'https://drive.google.com/file/d/1QEgiAKkKofFFAxDyVoFD40LgBWe0s8n9/view?usp=drivesdk',
    'Optional Maths': 'https://drive.google.com/file/d/1vJS4bY7fkLs5QbrLXFNKmvFFhrznzGrg/view?usp=drivesdk',
    'Science': 'https://drive.google.com/file/d/1IwcVyKC2tZyzScya7Qfw1p-9CWdVfkKm/view?usp=drivesdk',
    'सामाजिक': 'https://drive.google.com/file/d/1t3hbvuPC2CgPGvdwmKRbrCVOHPiKSAhl/view?usp=drivesdk',
    'English': 'https://drive.google.com/file/d/1kmRslmTG3vzXFGwjE5xsdE0SzAPi75bt/view?usp=drivesdk',
    'नेपाली': 'https://drive.google.com/file/d/1aaVFJKXRRIrW4UriLQaaopVpkaA9AQZY/view?usp=drivesdk',
    'Computer': 'https://drive.google.com/file/d/1XL9dSK7Vjvxo888E4ThIxbb5yQSljUdb/view?usp=drivesdk',
    'Account': 'https://drive.google.com/file/d/1QEgiAKkKofFFAxDyVoFD40LgBWe0s8n9/view?usp=drivesdk'
};

const STATIC_MCQS: Record<string, any[]> = {};

// ════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useApp();

  useEffect(() => {
     window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/hub', icon: BookOpen, label: 'Hub' },
    { path: '/ai', icon: Bot, label: 'AI Tutor' },
    { path: '/tools', icon: ToolLayout, label: 'Tools' },
    { path: '/mock', icon: ListChecks, label: 'Battle' },
    { path: '/news', icon: Newspaper, label: 'News' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="fixed top-0 w-full z-[1000] bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-[620px] md:max-w-4xl lg:max-w-6xl mx-auto flex justify-between items-center">
          <div className="logo cursor-pointer flex items-center gap-2 group transition-all duration-500" onClick={() => navigate('/')}>
            <div className="flex flex-col leading-none">
              <span className="text-[#E11D48] font-black text-xl tracking-tighter uppercase italic">Aadhar</span>
              <span className="text-[#1D4ED8] font-black text-xl tracking-tighter uppercase italic">Pathshala</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {user && (
               <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white relative group shadow-lg hover:ring-4 hover:ring-blue/20 transition-all">
                  <UserIcon className="w-5 h-5 fill-current" />
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[#4ADE80] border-2 border-white rounded-full" />
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-[620px] md:max-w-4xl lg:max-w-6xl mx-auto px-4 pt-24 pb-32 min-h-screen">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-100 backdrop-blur-3xl z-[1000] px-4 py-3">
        <div className="max-w-[620px] md:max-w-xl lg:max-w-2xl mx-auto flex justify-between items-center px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            // Map icons to specific colors for Better Logo feel
            const iconColors: Record<string, string> = {
                'Home': 'bg-rose-500',
                'Hub': 'bg-blue-500',
                'AI Tutor': 'bg-purple-500',
                'Tools': 'bg-emerald-500',
                'Battle': 'bg-orange-500',
                'News': 'bg-cyan-500'
            };
            const activeColor = iconColors[item.label] || 'bg-slate-900';

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center gap-1"
              >
                <div 
                  className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 relative shadow-sm",
                    isActive 
                      ? `${activeColor} text-white shadow-md ring-2 ring-white` 
                      : "bg-transparent text-slate-400 group-hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                </div>
                <span 
                  className={cn(
                    "text-[0.55rem] md:text-[0.6rem] font-black uppercase tracking-wider md:tracking-widest mt-1 text-center transition-colors duration-300",
                    isActive ? "text-slate-900" : "text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Floating Admin Button Removed as requested */}
    </div>
  );
};

// --- MOCK TEST ---
const MockTest = () => {
    const { addTestResult, user } = useApp();
    const navigate = useNavigate();
    const storageKey = `aadhar_mock_${user?.id || 'guest'}`;

    const [status, setStatus] = useState<'setup' | 'quiz' | 'result' | 'review'>(() => {
        const saved = localStorage.getItem(`${storageKey}_status`);
        return saved ? saved as any : 'setup';
    });
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem(`${storageKey}_settings`);
        return saved ? { ...JSON.parse(saved), model: JSON.parse(saved).model || 'momo' } : { subject: 'Science' as SubjectType, count: 5, model: 'momo' as 'momo' | 'mango' };
    });
    const [questions, setQuestions] = useState<any[]>(() => {
        const saved = localStorage.getItem(`${storageKey}_questions`);
        return saved ? JSON.parse(saved) : [];
    });
    const [currentIdx, setCurrentIdx] = useState(() => {
        const saved = localStorage.getItem(`${storageKey}_idx`);
        return saved ? parseInt(saved) : 0;
    });
    const [timer, setTimer] = useState(() => {
        const saved = localStorage.getItem(`${storageKey}_timer`);
        return saved ? parseInt(saved) : 0;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        localStorage.setItem(`${storageKey}_status`, status);
        localStorage.setItem(`${storageKey}_settings`, JSON.stringify(settings));
        localStorage.setItem(`${storageKey}_questions`, JSON.stringify(questions));
        localStorage.setItem(`${storageKey}_idx`, currentIdx.toString());
        localStorage.setItem(`${storageKey}_timer`, timer.toString());
    }, [status, settings, questions, currentIdx, timer, storageKey]);

    const clearMockTest = () => {
        setStatus('setup');
        setQuestions([]);
        setCurrentIdx(0);
        setTimer(0);
    };

    const currentSubjectConfig = SUBJECTS_CONFIG[settings.subject];

    const startTest = async () => {
        setLoading(true);
        try {
            const isNepaliSubject = settings.subject === 'नेपाली' || settings.subject === 'सामाजिक';
            
            // GROQ (ACHAR) for questions - Force Groq as requested
            // @ts-ignore
            const viteGroqKey = import.meta.env.VITE_GROQ_API_KEY || "";
            const processGroqKey = (typeof process !== 'undefined' && process.env ? process.env.GROQ_API_KEY : "") || viteGroqKey;
            const groqKey = processGroqKey || viteGroqKey;
            
            if (!groqKey) throw new Error("GROQ_API_KEY is not configured. Please add it to Secrets.");
            
            const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
            
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an expert exam paper generator for Grade 10 Nepal Students (SEE). You must return high-quality multiple choice questions. You MUST return ONLY the JSON object, NO other text. Do NOT include greetings. IMPORTANT: Use LaTeX ($...$) for ALL mathematical symbols, numbers, and formulas. Ensure questions and correct answers are 100% factually accurate without mistakes." },
                    { role: "user", content: `Generate ${settings.count} accurate multiple-choice questions for Grade 10 SEE preparation in the subject: ${settings.subject}. 
                    IMPORTANT: Each option ('a', 'b', 'c', 'd') must be a distinct possible answer. NEVER include the question text in the options.
                    Ensure that 'correct' field is one of 'a', 'b', 'c', 'd'.
                    ${isNepaliSubject ? 'IMPORTANT: BOTH QUESTIONS AND ANSWERS MUST BE IN NEPALI LANGUAGE.' : 'Use professional English Language.'}
                    Return JSON format: { "quiz": [{ "q": "...", "a": "...", "b": "...", "c": "...", "d": "...", "correct": "a", "explanation": "..." }] }` }
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" }
            });
            const data = JSON.parse(completion.choices[0]?.message?.content || "{}");
            const quizData = data.quiz || [];

            if (quizData.length === 0) throw new Error("No questions generated. Check your Groq API Key.");
            
            setQuestions(quizData);
            setStatus('quiz');
            setTimer(settings.count * 60);
        } catch (e) {
            alert("Failed to start trial. " + (e instanceof Error ? e.message : "Try again."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'quiz' && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (status === 'quiz' && timer === 0) {
            setStatus('result');
        }
    }, [status, timer]);

    const handleAnswer = (choice: string) => {
        const updated = [...questions];
        updated[currentIdx].userChoice = choice;
        setQuestions(updated);
        if (currentIdx < questions.length - 1) setCurrentIdx(currentIdx + 1);
        else setStatus('result');
    };

    const score = questions.filter(q => q.userChoice === q.correct).length;
    const timeTaken = (settings.count * 60) - timer;

    useEffect(() => {
        if (status === 'result') addTestResult(score, settings.count, timeTaken);
    }, [status]);

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500 bg-linear-to-br text-white",
                    currentSubjectConfig.gradient
                )}>
                    <ListChecks className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Battle Ground</h1>
            </div>

            {status === 'setup' && (
                <div className="bg-white p-5 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-xl space-y-6 md:space-y-8 relative overflow-hidden">
                    <div className={cn("absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-10 transition-colors duration-700", `bg-${currentSubjectConfig.color}-500`)} />
                    
                    <div className={cn("p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-center text-white relative shadow-2xl transition-all duration-700 bg-linear-to-br shadow-emerald-500/20", currentSubjectConfig.gradient)}>
                        <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-white/50 mx-auto mb-2 md:mb-4 animate-pulse" />
                        <h2 className="text-xl md:text-3xl font-black italic tracking-tighter uppercase">Board Trial Ready</h2>
                        <p className="text-[0.6rem] md:text-[0.65rem] font-bold text-white/60 uppercase mt-2 tracking-[0.2em] leading-relaxed">Synthesizing {settings.subject} Challenges</p>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-[0.6rem] md:text-[0.65rem] font-black uppercase text-slate-400 block tracking-widest px-1">Choose Trial Realm</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                            {(Object.keys(SUBJECTS_CONFIG) as SubjectType[]).map((sub) => {
                                const cfg = SUBJECTS_CONFIG[sub];
                                return (
                                    <button
                                        key={sub}
                                        onClick={() => setSettings({ ...settings, subject: sub })}
                                        className={cn(
                                            "py-3 md:py-4 px-3 md:px-4 rounded-[1rem] md:rounded-2xl border-2 font-black text-[0.65rem] md:text-[0.7rem] transition-all uppercase tracking-tight",
                                            settings.subject === sub 
                                                ? `text-white border-transparent bg-linear-to-br ${cfg.gradient} shadow-lg scale-105` 
                                                : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                                        )}
                                    >
                                        {sub}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-[0.6rem] md:text-[0.65rem] font-black uppercase text-slate-400 block tracking-widest px-1">Challenge Intensity</label>
                        <div className="flex gap-2 md:gap-3">
                            {[5, 10, 20, 30].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setSettings({ ...settings, count: c })}
                                    className={cn(
                                        "flex-1 py-3 md:py-5 rounded-[1rem] md:rounded-2xl border-2 font-black text-xs md:text-sm transition-all",
                                        settings.count === c 
                                            ? `text-white border-transparent bg-linear-to-br ${currentSubjectConfig.gradient} shadow-lg shadow-${currentSubjectConfig.color}-500/20` 
                                            : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                                    )}
                                >
                                    {c}Q
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        <label className="text-[0.6rem] md:text-[0.65rem] font-black uppercase text-slate-400 block tracking-widest px-1">AI Scholar Core</label>
                        <div className="flex gap-2 md:gap-3">
                            {[
                                { id: 'momo', label: 'MOMO', desc: 'Detailed Expert', color: 'rose-500', icon: Bot },
                                { id: 'mango', label: 'MANGO', desc: 'Reliable Backup', color: 'amber-500', icon: Sparkles }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setSettings({ ...settings, model: m.id as any })}
                                    className={cn(
                                        "flex-1 py-4 md:py-6 rounded-[2rem] border-2 font-black transition-all flex flex-col items-center gap-2 group relative overflow-hidden",
                                        settings.model === m.id 
                                            ? `text-white border-transparent bg-linear-to-br ${currentSubjectConfig.gradient} shadow-xl` 
                                            : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                        settings.model === m.id ? "bg-white/20" : "bg-slate-50 text-slate-300"
                                    )}>
                                        <m.icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-xs md:text-sm uppercase block tracking-wider">{m.label}</span>
                                        <span className="text-[0.5rem] md:text-[0.55rem] font-bold opacity-60 uppercase tracking-widest">{m.desc}</span>
                                    </div>
                                    {settings.model === m.id && (
                                        <motion.div layoutId="active-tick" className="absolute top-2 right-2">
                                            <div className="p-1 bg-white/20 rounded-full">
                                                <CheckCircle2 className="w-3 h-3" />
                                            </div>
                                        </motion.div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startTest}
                        disabled={loading}
                        className={cn(
                            "w-full text-white py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] font-black text-sm md:text-lg shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 bg-linear-to-r",
                            currentSubjectConfig.gradient
                        )}
                    >
                        {loading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" /> : <Zap className="w-6 h-6" />}
                        {loading ? 'CALIBRATING CORE...' : 'IGNITE EXAM'}
                    </button>
                </div>
            )}

            {status === 'quiz' && (
                <div className="space-y-6 pb-20 relative">
                     <button 
                         onClick={clearMockTest}
                         className="absolute -top-10 right-0 bg-rose-50 text-rose-500 px-3 py-1.5 rounded-lg text-[0.65rem] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                     >
                         Quit Test
                     </button>
                     <div className="flex justify-between items-center bg-white border border-slate-100 shadow-sm p-4 md:p-6 rounded-[2.5rem] relative z-20">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black italic shadow-lg bg-linear-to-br", currentSubjectConfig.gradient)}>
                                {currentIdx + 1}
                            </div>
                            <div>
                                <p className="text-[0.55rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest leading-none">Question</p>
                                <span className="text-sm md:text-base font-black text-slate-900 tracking-tight uppercase">{settings.subject} TRIAL</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 md:px-6 md:py-3 bg-slate-900 text-white rounded-3xl flex items-center gap-2 font-mono font-black text-sm md:text-lg shadow-xl shadow-slate-900/20">
                            <Timer className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                            {Math.floor(timer/60)}:{(timer%60).toString().padStart(2, '0')}
                        </div>
                    </div>

                    <motion.div 
                        key={currentIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white p-6 md:p-12 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-[0_50px_100px_rgba(0,0,0,0.05)] relative overflow-hidden"
                    >
                        <div className={cn("absolute top-0 left-0 w-2 h-full bg-linear-to-b", currentSubjectConfig.gradient)} />
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-6 md:mb-12 leading-[1.15] tracking-tighter uppercase italic">
                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{questions[currentIdx].q}</Markdown>
                        </h2>
                        <div className="grid grid-cols-1 gap-2 md:gap-4">
                            {['a', 'b', 'c', 'd'].map((c, i) => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        const updated = [...questions];
                                        updated[currentIdx].selectedOption = c;
                                        setQuestions(updated);
                                    }}
                                    className={cn(
                                        "w-full text-left p-4 md:p-8 border-2 rounded-[1.5rem] md:rounded-[2.5rem] font-bold text-[0.85rem] md:text-lg active:scale-[0.97] transition-all flex items-center gap-4 md:gap-6 group relative",
                                        questions[currentIdx].selectedOption === c 
                                            ? "border-blue-500 bg-blue-50/50" 
                                            : "border-slate-50 hover:border-blue-200 hover:bg-blue-50/20"
                                    )}
                                >
                                    <span className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black transition-all uppercase border-2",
                                        questions[currentIdx].selectedOption === c
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-slate-50 text-slate-400 border-slate-100 group-hover:border-blue-300 group-hover:text-blue-500"
                                    )}>
                                        {c}
                                    </span>
                                    <span className="text-slate-700 leading-tight">
                                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{questions[currentIdx][c]}</Markdown>
                                    </span>
                                </button>
                            ))}
                        </div>
                        
                        {questions[currentIdx].selectedOption && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleAnswer(questions[currentIdx].selectedOption)}
                                className={cn(
                                    "w-full mt-6 py-5 md:py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest text-white shadow-xl bg-linear-to-r",
                                    currentSubjectConfig.gradient
                                )}
                            >
                                Confirm Answer
                            </motion.button>
                        )}
                    </motion.div>
                </div>
            )}

            {status === 'result' && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl text-center animate-fade-up max-w-2xl mx-auto overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                         <Trophy className="w-64 h-64 -rotate-12" />
                    </div>
                    <Trophy className={cn("w-24 h-24 mx-auto mb-4 animate-bounce relative z-10", `text-${currentSubjectConfig.color}-500`)} />
                    <h2 className="text-4xl font-black text-[#020617] italic tracking-tighter mb-2 uppercase relative z-10">MISSION COMPLETE!</h2>
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 relative z-10">Board evaluation for {settings.subject} synchronized</p>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
                        <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col items-center justify-center">
                             <p className="text-[0.55rem] font-black uppercase text-emerald-600 mb-2 opacity-60 tracking-widest">Score Prediction</p>
                             <p className="text-3xl font-black text-emerald-700">{score} / {questions.length}</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex flex-col items-center justify-center">
                             <p className="text-[0.55rem] font-black uppercase text-blue mb-2 opacity-60 tracking-widest">XP Accrued</p>
                             <p className="text-3xl font-black text-blue">+{score * 25}</p>
                        </div>
                        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex flex-col items-center justify-center">
                             <p className="text-[0.55rem] font-black uppercase text-amber-600 mb-2 opacity-60 tracking-widest">Accuracy</p>
                             <p className="text-3xl font-black text-amber-700">{Math.round((score/questions.length)*100)}%</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 flex flex-col items-center justify-center">
                             <p className="text-[0.55rem] font-black uppercase text-purple-600 mb-2 opacity-60 tracking-widest">Time Taken</p>
                             <p className="text-3xl font-black text-purple-700">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
                        </div>
                    </div>

                    {(score === questions.length || timeTaken < (questions.length * 60) / 2) && (
                        <div className="mb-10 p-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] text-white shadow-xl shadow-orange-500/20 relative z-10 animate-fade-up">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Badges Unlocked!</h3>
                                    <p className="text-[0.65rem] font-bold text-white/80 uppercase tracking-widest flex gap-2 mt-2">
                                        {score === questions.length && <span className="bg-white/20 px-2 py-1 rounded-md">Perfect Score</span>}
                                        {(timeTaken < (questions.length * 60) / 2 && score >= questions.length * 0.8) && <span className="bg-white/20 px-2 py-1 rounded-md">Speed Demon</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 md:space-y-4 relative z-10">
                        <button onClick={() => setStatus('review')} className="w-full py-6 bg-[#020617] text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest hover:bg-slate-900 border border-slate-800">Review Protocol</button>
                        <button onClick={clearMockTest} className={cn("w-full py-6 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-fuchsia-500/20 active:scale-95 transition-all uppercase tracking-widest bg-[linear-gradient(45deg,#ff2a85,#ff7a00,#ff004d,#8a2be2)] bg-[length:300%_300%] animate-[flow_4s_ease-in-out_infinite]")}>Initiate New Battle</button>
                        <button onClick={() => navigate(`/hub/${settings.subject}`)} className={cn("w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3", currentSubjectConfig.gradient)}>
                            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Return to Hub
                        </button>
                    </div>
                </div>
            )}

            {status === 'review' && (
                <div className="space-y-6 pb-32 animate-fade-up">
                    <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 bg-linear-to-br rounded-2xl flex items-center justify-center text-white", currentSubjectConfig.gradient)}>
                                <ClipboardCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Review Protocol</h2>
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Analyzing Performance Metadata</p>
                            </div>
                        </div>
                        <button onClick={() => setStatus('result')} className={cn("px-6 py-3 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 bg-linear-to-r from-rose-500 to-orange-500 active:scale-95 transition-transform")}>Back</button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, i) => (
                            <ReviewCard key={i} question={q} index={i} subject={settings.subject} />
                        ))}
                    </div>

                    <button onClick={clearMockTest} className={cn("w-full py-6 text-white rounded-[2rem] font-black text-sm shadow-xl shadow-fuchsia-500/20 active:scale-95 transition-all uppercase tracking-widest bg-[linear-gradient(45deg,#00d2ff,#3a7bd5,#00d2ff,#3a7bd5)] bg-[length:300%_300%] animate-[flow_4s_ease-in-out_infinite]")}>Initiate New Battle</button>
                </div>
            )}
        </div>
    );
};

const ReviewCard = ({ question, index, subject }: { question: any, index: number, subject: string }) => {
    const [explanation, setExplanation] = useState('');
    const [loading, setLoading] = useState(false);

    const getAIReview = async () => {
        setLoading(true);
        try {
            const prompt = `Student performed a Grade 10 Nepal SEE ${subject} Exam.
Question: ${question.q}
Options: a: ${question.a}, b: ${question.b}, c: ${question.c}, d: ${question.d}
Correct: ${question.correct}
Student Answered: ${question.userChoice}

Your task: Provide a hint or conceptual explanation as to why the student's choice was wrong and guide them toward the right logic.
CRITICAL INSTRUCTION: DO NOT explicitly state the correct answer (e.g. do not say "The correct answer is X" or give away the option). Guide the student conceptually so they realize it themselves.
Be extremely direct and brief. Use bullet points if needed. No greetings.
Use simple "Neplish" (English + Nepali mix). Focus on logic. 
IMPORTANT: Use LaTeX ($...$) for mathematical symbols.
Keep it under 50 words.`;

            const res = await callCerebrasForMomo([{ role: "user", content: prompt }]);
            setExplanation(res || "Could not generate review.");
        } catch (e) {
            setExplanation("Analysis Failed. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const isCorrect = question.userChoice === question.correct;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm shrink-0 mt-1">{index + 1}</span>
                    <h3 className="text-lg font-black text-slate-800 leading-tight uppercase italic mt-1">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{question.q}</Markdown>
                    </h3>
                </div>
                {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map(key => (
                    <div key={key} className={cn(
                        "p-4 rounded-[1.5rem] border-2 text-sm font-bold flex items-center gap-3",
                        key === question.correct ? "bg-emerald-50 border-emerald-500 text-emerald-700" : 
                        (key === question.userChoice && !isCorrect) ? "bg-rose-50 border-rose-500 text-rose-700" :
                        "bg-slate-50 border-slate-100/50 text-slate-600"
                    )}>
                        <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center text-[0.65rem] shrink-0 uppercase">{key}</span>
                        <div className="leading-tight pt-1">
                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{question[key]}</Markdown>
                        </div>
                    </div>
                ))}
            </div>

            {explanation ? (
                <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 animate-fade-up">
                    <div className="flex items-center gap-2 mb-3 text-blue">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-blue-800">Expert System Analysis</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-700 font-medium">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{explanation}</Markdown>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={getAIReview}
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {loading ? 'Analyzing...' : 'Request Expert Analysis'}
                </button>
            )}
        </div>
    );
};

// ════════════════════════════════════════════
// AI TUTOR COMPONENTS
// ════════════════════════════════════════════

const Mascot = ({ mood = 'idle' }: { mood?: 'idle' | 'talking' | 'thinking' }) => {
    const cycleColors = ['bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-indigo-500', 'bg-orange-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-purple-500'];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        if (mood !== 'idle') return;
        const interval = setInterval(() => {
            setColorIndex(prev => (prev + 1) % cycleColors.length);
        }, 3000); // changes every 3 seconds to cycle through 10 colors
        return () => clearInterval(interval);
    }, [mood, cycleColors.length]);

    return (
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            {/* Status Glow */}
            <div className="absolute inset-0 bg-blue/10 rounded-full blur-3xl animate-pulse" />
            
            {/* Central Animated Token */}
            <motion.div 
                animate={mood === 'thinking' ? { 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                } : mood === 'talking' ? {
                    scale: [1, 1.15, 1],
                } : {
                    y: [0, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: mood === 'thinking' ? 2 : 4, ease: "easeInOut" }}
                className={cn(
                    "w-20 h-20 rounded-[1.5rem] flex items-center justify-center shadow-2xl relative z-10 border-4 border-white transition-colors duration-700",
                    mood === 'thinking' ? "bg-amber-500 text-white" : mood === 'talking' ? "bg-emerald-500 text-white" : `${cycleColors[colorIndex]} text-white`
                )}
            >
                {mood === 'thinking' ? (
                    <RotateCcw className="w-10 h-10 animate-spin-slow" />
                ) : mood === 'talking' ? (
                    <MessageSquare className="w-10 h-10" />
                ) : (
                    <Sparkles className="w-10 h-10" />
                )}
            </motion.div>
            
            <AnimatePresence>
                {mood === 'talking' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0, x: 20 }}
                        className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center border border-slate-50 z-20"
                    >
                        <Zap className="w-5 h-5 text-emerald-500" />
                    </motion.div>
                )}
            </AnimatePresence>
            
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black/5 rounded-full blur-xl" />
        </div>
    );
};

const AILoadingImage = ({ src, alt, i }: { src: string, alt: string, i: number }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className="my-10 relative group-visual">
            <div className="absolute -inset-2 bg-linear-to-r from-blue-500 to-cyan-400 rounded-[3.5rem] blur-2xl opacity-10" />
            <div className={cn(
                "relative overflow-hidden rounded-[3rem] bg-slate-50 border-[8px] border-white shadow-2xl min-h-[300px] flex items-center justify-center transition-all duration-500",
                loading ? "bg-slate-100" : "bg-slate-50"
            )}>
                {loading && (
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.7, 0.3],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                    >
                        <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                            <Bot className="w-10 h-10" />
                        </div>
                        <p className="text-[0.6rem] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Rendering Insight...</p>
                    </motion.div>
                )}
                <img 
                    src={src}
                    alt={alt}
                    className={cn(
                        "w-full h-auto object-cover transition-all duration-1000",
                        loading ? "opacity-0 scale-95" : "opacity-100 scale-100 ring-2 ring-white/50"
                    )}
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoading(false)}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('retry=true')) {
                            target.src = `https://pollinations.ai/p/${encodeURIComponent(alt + ' scientific_diagram')}?width=800&height=600&nologo=true&retry=true`;
                        } else {
                            setError(true);
                            setLoading(false);
                        }
                    }}
                />
                {!loading && !error && (
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl border border-blue/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue rounded-full animate-ping" />
                            <span className="text-[0.65rem] font-black text-blue uppercase tracking-widest">Visual Core 3.0</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-slate-50">
                        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visual Link Interrupted</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AITutor = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    
    // Using simple view state instead of complex routing for better control
    const [view, setView] = useState<'selection' | 'chat'>('selection');
    const [activeTutor, setActiveTutor] = useState<'momo' | 'mango' | 'achar'>('momo');

    const storageKey = `aadhar_chats_${user?.id || 'guest'}_${activeTutor}`;
    
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initialize messages from localStorage when tutor changes
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);
    }, [activeTutor, storageKey]);

    useEffect(() => {
        if (view === 'chat' && messages.length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, storageKey, view]);

    const clearChat = () => {
        setMessages([]);
        localStorage.removeItem(storageKey);
    };

    const handleSend = async (txt: string) => {
        const text = txt || input;
        if (!text.trim()) return;

        const updated = [...messages, { role: 'user', text: text }];
        setMessages(updated);
        setInput('');
        setLoading(true);

        // Add placeholder AI message
        setMessages(prev => [...prev, { role: 'ai', text: '' }]);

        try {
            // SHARED FORMATTING RULES
            const sharedFormatting = `
FORMATTING RULES:
1. MATH: Use $ for inline and $$ for block math.
2. VISUALS (SITUATIONAL): You MAY include a visual for Science, History, or Geography if it helps explain a complex topic, or if explicitly asked.
   - DO NOT provide visuals for simple text-based questions unless necessary.
   - USE THE TAG: [VISUAL: DESCRIPTION]
   - DESCRIPTION: 5 specific keywords for a scientific diagram (e.g., [VISUAL: human heart internal anatomy labeled]).
   - Put this on its own line with empty lines around it.
3. SUBJECT EXPERTISE:
   - NEPALI & SOCIAL STUDIES (Nepali: नेपाली, Social: सामाजिक): Answer in a mix of clear English and proper Nepali script (Unicode) where appropriate. 
   - Use real-world examples from Nepal (e.g., specific rivers like Koshi, historical figures like Prithvi Narayan Shah, or social issues in rural Nepal).
   - Ensure historical dates are accurate to the Nepali calendar (B.S.) where applicable.
4. VIBRANCY: Use ### for section headers to ensure colourful output.
   - MOMO: Use "### 🧬 Concept Core" and "### 💡 Expert Insight".
   - MANGO: Use "### 📊 Case Data" and "### 🔍 Reliable Check".
   - ACHAR: Use "### ⚡ Quick Facts".
5. NO GREETINGS: Start answering immediately.
6. PARAGRAPHS: Max 2 sentences each. Use **bold** for key concepts.`;

            if (activeTutor === 'achar') {
                // GROQ (ACHAR) Implementation
                const systemPrompt = `You are ACHAR, the Instant Helper. 
IDENTITY: Lightning fast, ultra-concise facts.
STYLE: Bullet points only.
RESTRICTION: NO formulas, NO equations unless specifically asked for a calculation. Focus on definition and quick tips.
${sharedFormatting}`;

                const chatHistory = updated.map(m => ({
                    role: (m.role === 'ai' ? 'assistant' : 'user') as 'assistant' | 'user',
                    content: m.text
                }));

                // @ts-ignore
                const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
                const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });

                const stream = await groq.chat.completions.create({
                    messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
                    model: "llama-3.1-8b-instant",
                    stream: true,
                });

                let fullResponse = "";
                for await (const chunk of stream) {
                    fullResponse += chunk.choices[0]?.delta?.content || "";
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = fullResponse;
                        return newMessages;
                    });
                }
            } else if (activeTutor === 'momo') {
                // CEREBRAS (MOMO) Implementation
                const systemInstruction = `You are MOMO, the Concept Tutor.
IDENTITY: Academic Expert. Deep conceptual dives.
VIBRANCY PERFECTION: You MUST start your response with "### 🧬 Concept Dive" and include "### 💡 Expert Insight".
${sharedFormatting}`;

                const contents = [
                    { role: 'system', content: systemInstruction },
                    ...updated.map(m => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.text
                    }))
                ];

                const responseText = await callCerebrasForMomo(contents);
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = responseText || "Brain freeze! MOMO rebooting...";
                    return newMessages;
                });
            } else {
                // SAMBANOVA (MANGO) Implementation
                const systemInstruction = `You are MANGO, the Precise Assistant.
IDENTITY: Fact-checker. Accurate, data-driven.
VIBRANCY PERFECTION: You MUST start your response with "### 📊 Case Study" and include "### 🔍 Fact Verified".
${sharedFormatting}`;

                const contents = [
                    { role: 'system', content: systemInstruction },
                    ...updated.map(m => ({
                        role: m.role === 'ai' ? 'assistant' : 'user',
                        content: m.text
                    }))
                ];

                const responseText = await callSambaNovaForMomo(contents);
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = responseText || "Brain freeze! MANGO rebooting...";
                    return newMessages;
                });
            }
        } catch (e: any) {
            setMessages(prev => {
                const newMessages = [...prev];
                const errMsg = e.message || String(e);
                let displayMsg = `Opp! Something went wrong: ${errMsg}`;
                if (errMsg.includes("429") || errMsg.includes("quota")) {
                    displayMsg = "We've hit a small limit! Please wait a bit before asking again, Sathi.";
                }
                newMessages[newMessages.length - 1].text = displayMsg;
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    if (view === 'selection') {
        return (
            <div className="fixed inset-0 pt-20 pb-[76px] bg-[#F8FAFC] z-10 flex flex-col items-center animate-fade-up overflow-y-auto">
                <div className="w-full max-w-[620px] p-6 space-y-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400">
                            <Home className="w-6 h-6" />
                        </button>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">AI Hub</h1>
                    </div>

                    <div className="text-center space-y-3 py-10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-4 animate-bounce border-4 border-white">
                            <Bot className="w-10 h-10 text-white" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tight">K chha Sathi!</h2>
                        <p className="text-slate-500 font-bold max-w-[300px] mx-auto leading-relaxed">Choose your study companion for SEE 2083 prep.</p>
                    </div>

                    <div className="grid gap-6">
                        {/* MOMO Card */}
                        <button 
                            onClick={() => { setActiveTutor('momo'); setView('chat'); }}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-left flex flex-col items-center text-center group hover:border-pink-500 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white group-hover:scale-110 transition-transform">
                                <Bot className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase text-slate-900 leading-none mb-1">MOMO Tutor</h3>
                            <p className="text-[0.55rem] font-black text-pink-500 uppercase tracking-widest mb-3">Conceptual Guru (Cerebras)</p>
                            <p className="text-[0.7rem] font-bold text-slate-400 leading-relaxed italic">"Let's dive deep." Deep conceptual explanations.</p>
                        </button>

                        {/* ACHAR Card */}
                        <button 
                            onClick={() => { setActiveTutor('achar'); setView('chat'); }}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-left flex flex-col items-center text-center group hover:border-emerald-500 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="w-16 h-16 bg-linear-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white group-hover:scale-110 transition-transform">
                                <Zap className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase text-slate-900 leading-none mb-1">ACHAR Assistant</h3>
                            <p className="text-[0.55rem] font-black text-emerald-500 uppercase tracking-widest mb-3">Instant Helper (Groq)</p>
                            <p className="text-[0.7rem] font-bold text-slate-400 leading-relaxed italic">"Serving it hot!" Formulas and quick facts.</p>
                        </button>

                        {/* MANGO Card */}
                        <button 
                            onClick={() => { setActiveTutor('mango'); setView('chat'); }}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-left flex flex-col items-center text-center group hover:border-amber-500 transition-all relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white group-hover:scale-110 transition-transform">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-black italic uppercase text-slate-900 leading-none mb-1">MANGO Assistant</h3>
                            <p className="text-[0.55rem] font-black text-orange-500 uppercase tracking-widest mb-3">Reliable Backup (SambaNova)</p>
                            <p className="text-[0.7rem] font-bold text-slate-400 leading-relaxed italic">"Stays Factual!" Reliable and accurate factual help.</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 pt-20 pb-[76px] bg-[#F8FAFC] z-10 flex flex-col items-center animate-fade-up">
            <div className="w-full max-w-[620px] md:max-w-4xl lg:max-w-6xl flex flex-col h-full bg-[#F8FAFC]">
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 shrink-0 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('selection')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110", 
                            activeTutor === 'momo' ? "bg-linear-to-r from-pink-500 to-rose-600 shadow-rose-500/30" : 
                            activeTutor === 'mango' ? "bg-linear-to-r from-amber-400 to-orange-600 shadow-orange-500/30" :
                            "bg-linear-to-r from-emerald-500 to-teal-700 shadow-emerald-500/30"
                        )}>
                            {activeTutor === 'momo' ? <Bot className="text-white w-5 h-5 md:w-6 md:h-6" /> : 
                             activeTutor === 'mango' ? <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" /> :
                             <Zap className="text-white w-5 h-5 md:w-6 md:h-6" />}
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">
                                {activeTutor === 'momo' ? 'MOMO' : activeTutor === 'mango' ? 'MANGO' : 'ACHAR'}
                            </h1>
                            <p className="text-[0.5rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {activeTutor === 'momo' ? 'Conceptual Guru' : activeTutor === 'mango' ? 'Reliable Assistant' : 'Instant Helper'}
                            </p>
                        </div>
                    </div>
                    
                    {messages.length > 0 && (
                        <button 
                            onClick={clearChat}
                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 space-y-8 py-6 custom-scrollbar">
                    {messages.length === 0 && (
                        <div className="text-center py-20 space-y-8">
                            <div className="relative w-24 h-24 mx-auto">
                                <div className={cn(
                                    "absolute inset-0 rounded-[1.5rem] animate-pulse blur-xl opacity-20", 
                                    activeTutor === 'momo' ? "bg-pink-500" : 
                                    activeTutor === 'mango' ? "bg-amber-500" :
                                    "bg-emerald-500"
                                )} />
                                <div className={cn(
                                    "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative border-4 border-white transition-all duration-700 text-white shadow-xl", 
                                    activeTutor === 'momo' ? "bg-linear-to-br from-pink-500 to-rose-600" : 
                                    activeTutor === 'mango' ? "bg-linear-to-br from-amber-400 to-orange-600" :
                                    "bg-linear-to-br from-slate-700 to-slate-900"
                                )}>
                                    {activeTutor === 'momo' ? <Bot className="w-12 h-12" /> : 
                                     activeTutor === 'mango' ? <Sparkles className="w-12 h-12" /> :
                                     <Zap className="w-12 h-12 text-emerald-400" />}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase shrink-0">
                                    {activeTutor === 'momo' ? "Let's dive deep into concepts." : 
                                     activeTutor === 'mango' ? "Factual accuracy is my priority." :
                                     "Serving facts at lightning speed!"}
                                </h2>
                                <p className="text-[0.85rem] font-bold text-slate-400 max-w-[320px] mx-auto leading-relaxed border-l-4 border-slate-100 pl-4 py-2 italic">
                                    {activeTutor === 'momo' 
                                        ? "Master Grade 10 concepts with conceptual clarity and real Nepali examples."
                                        : activeTutor === 'mango'
                                        ? "Reliable and precise assistance for all your school projects and homework."
                                        : "Fastest tips, formulas, and shortcut methods for your SEE 2083 prep."}
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex flex-col gap-2 max-w-[92%] md:max-w-[85%]", m.role === 'ai' ? "self-start" : "self-end items-end")}>
                            <div className={cn(
                                "p-6 rounded-[2.5rem] text-[0.95rem] leading-relaxed shadow-xl border transition-all",
                                m.role === 'ai' 
                                    ? "bg-white border-slate-100 text-slate-800 rounded-tl-sm relative" 
                                    : "bg-blue text-white border-blue shadow-2xl shadow-blue/20 rounded-tr-sm"
                            )}>
                                <div className={cn(
                                    "prose prose-sm max-w-none prose-p:mb-4 prose-headings:font-black prose-headings:text-slate-900 prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:border prose-img:border-slate-100",
                                    m.role === 'ai' ? "prose-slate" : "prose-invert"
                                )}>
                                    <Markdown 
                                        remarkPlugins={[remarkMath]} 
                                        rehypePlugins={[rehypeKatex, rehypeRaw]}
                                        components={{
                                            h1: ({node, ...props}) => <h1 className="text-3xl font-black text-rose-500 uppercase tracking-tighter mt-6 mb-2" {...props} />,
                                            h2: ({node, ...props}) => <h2 className="text-2xl font-black text-blue uppercase tracking-tighter mt-5 mb-2" {...props} />,
                                            h3: ({node, ...props}) => <h3 className="text-xl font-black text-emerald-500 uppercase tracking-tight mt-4 mb-2" {...props} />,
                                            h4: ({node, ...props}) => <h4 className="text-lg font-black text-amber-500 uppercase tracking-tight mt-3 mb-1" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-black text-indigo-600" {...props} />,
                                            p: ({node, children, ...props}) => {
                                                const content = String(children);
                                                const visualMatch = content.match(/\[VISUAL:\s*(.*?)\]/i);
                                                if (visualMatch) {
                                                    const prompt = visualMatch[1].trim();
                                                    const primaryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' highly detailed scientific labeled educational diagram white background')}?width=1024&height=768&nologo=true&seed=${i}`;
                                                    return <AILoadingImage src={primaryUrl} alt={prompt} i={i} />;
                                                }
                                                return <p className="mb-4" {...props}>{children}</p>;
                                            },
                                            img: ({node, ...props}) => {
                                                const altText = props.alt || "educational_visual";
                                                const prompt = altText.replace(/_/g, ' ');
                                                const stableUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' educational scientific diagram')}?width=1024&height=768&nologo=true&seed=${i}`;
                                                return <AILoadingImage src={stableUrl} alt={altText} i={i} />;
                                            }
                                        }}
                                    >
                                        {m.text}
                                    </Markdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-4 self-start max-w-[320px] w-full"
                        >
                            <div className="relative p-[2px] rounded-[2.5rem] bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 overflow-hidden shadow-2xl">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 bg-conic/from-180 via-blue-500 via-transparent to-blue-500 opacity-20 scale-150"
                                />
                                <div className="relative bg-white p-6 rounded-[2.4rem] space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg overflow-hidden">
                                                <motion.div 
                                                    animate={{ y: [0, -40, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="flex flex-col items-center gap-4"
                                                >
                                                    <BrainCircuit className="w-6 h-6 text-blue-400" />
                                                    <Sparkles className="w-6 h-6 text-emerald-400" />
                                                    <Bot className="w-6 h-6 text-pink-400" />
                                                </motion.div>
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-lg" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[0.65rem] font-black uppercase text-blue-600 tracking-widest italic">
                                                    {activeTutor === 'momo' ? 'Synthesizing Wisdom' : activeTutor === 'mango' ? 'Extracting Data' : 'Speed Processing'}
                                                </span>
                                                <div className="flex gap-1">
                                                    {[0, 1, 2].map(i => (
                                                        <motion.div 
                                                            key={i}
                                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                            className="w-1 h-1 bg-blue-500 rounded-full"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: ["10%", "90%", "30%", "100%"] }}
                                                    transition={{ duration: 5, repeat: Infinity }}
                                                    className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-slate-100 italic">
                                        <p className="text-[0.6rem] font-black text-slate-800 uppercase tracking-tighter leading-none">Synthesizing Educational Matrix...</p>
                                        <p className="text-[0.5rem] font-bold text-slate-400 uppercase tracking-widest leading-none">Accessing Deep Knowledge Base</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#F8FAFC] shrink-0 border-t border-slate-100">
                    <div className="p-2 md:p-3 bg-white border-2 border-slate-100 rounded-full shadow-2xl flex items-center gap-2 focus-within:border-blue transition-all">
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend('')}
                            placeholder={activeTutor === 'momo' ? "Ask MOMO for detailed help..." : "Ask ACHAR for quick answers..."}
                            className="flex-1 bg-transparent border-none outline-none font-bold text-sm md:text-base text-slate-700 px-6"
                        />
                        <button 
                            onClick={() => handleSend('')}
                            disabled={!input.trim() || loading}
                            className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-20 shrink-0",
                                activeTutor === 'momo' ? "bg-pink-500 shadow-pink-500/20" : "bg-slate-900 shadow-slate-900/20"
                            )}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


/* ── CALCULATOR SUITE ── */
const StandardCalculator = () => {
    const [equation, setEquation] = useState('0');
    const [answer, setAnswer] = useState('');
    const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
    const [shift, setShift] = useState(false);
    const [alpha, setAlpha] = useState(false);
    const [ans, setAns] = useState('0');
    const [outputMode, setOutputMode] = useState<'decimal' | 'fraction'>('fraction');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    const [uiMode, setUiMode] = useState<'NORMAL' | 'MODE_SEL' | 'CONST_SEL'>('NORMAL');

    const SCI_CONSTANTS = [
        { sym: 'mp', val: '1.67262192e-27', name: 'Proton mass' },
        { sym: 'mn', val: '1.6749275e-27', name: 'Neutron mass' },
        { sym: 'me', val: '9.1093837e-31', name: 'Electron mass' },
        { sym: 'h', val: '6.62607015e-34', name: 'Planck' },
        { sym: 'a0', val: '5.291772109e-11', name: 'Bohr radius' },
        { sym: 'g', val: '9.80665', name: 'Standard grav' },
        { sym: 'G', val: '6.6743e-11', name: 'Newtonian G' },
        { sym: 'c', val: '299792458', name: 'Speed of light' },
        { sym: 'e', val: '1.602176634e-19', name: 'Elem charge' },
        { sym: 'k', val: '1.380649e-23', name: 'Boltzmann k' }
    ];

    const getTexEquation = (eq: string) => {
        if (!eq) return "\\text{ }";
        try {
            let processedEq = eq.replace(/sqrt\(/g, 'sqrt(')
                                .replace(/pi/g, 'pi')
                                .replace(/ans/i, 'Ans')
                                .replace(/log10\(/g, 'log10(')
                                .replace(/log\(/g, 'log(')
                                .replace(/det\(/g, 'det(')
                                .replace(/solveQuad\(/g, '\\text{solveQuad}(')
                                .replace(/solveLin\(/g, '\\text{solveLin}(');
            return math.parse(processedEq).toTex({ parenthesis: 'auto', implicit: 'hide' });
        } catch {
            return eq.replace(/([{}_\\])/g, "\\$1")
                     .replace(/\//g, '\\div ')
                     .replace(/\*/g, '\\times ');
        }
    };

    const calculate = () => {
        try {
            let expr = equation;
            if (!expr || expr === '0') return;

            expr = expr.replace(/ans/g, ans);

            SCI_CONSTANTS.forEach(c => {
                const regex = new RegExp(c.sym, 'g');
                expr = expr.replace(regex, `(${c.val})`);
            });

            if (angleMode === 'deg') {
                expr = expr.replace(/sin\((.*?)\)/g, 'sin(($1) deg)');
                expr = expr.replace(/cos\((.*?)\)/g, 'cos(($1) deg)');
                expr = expr.replace(/tan\((.*?)\)/g, 'tan(($1) deg)');
                expr = expr.replace(/asin\((.*?)\)/g, 'asin($1) to deg');
                expr = expr.replace(/acos\((.*?)\)/g, 'acos($1) to deg');
                expr = expr.replace(/atan\((.*?)\)/g, 'atan($1) to deg');
            }

            const customScope = {
                solveQuad: (a: any, b: any, c: any) => {
                    const discriminant = math.subtract(math.pow(b, 2), math.multiply(4, math.multiply(a, c)));
                    const x1 = math.divide(math.add(math.unaryMinus(b), math.sqrt(discriminant as any)), math.multiply(2, a));
                    const x2 = math.divide(math.subtract(math.unaryMinus(b), math.sqrt(discriminant as any)), math.multiply(2, a));
                    return [x1, x2];
                },
                solveLin: (a: any, b: any) => {
                    return math.divide(math.unaryMinus(b), a);
                }
            };

            const result = math.evaluate(expr, customScope);
            let resultStr = '';
            
            if (outputMode === 'fraction') {
                try {
                    const frac = math.fraction(result);
                    resultStr = Number(frac.d) === 1 ? frac.n.toString() : `${frac.n}/${frac.d}`;
                } catch (e) {
                    resultStr = typeof result === 'number' ? result.toFixed(8).replace(/\.?0+$/, '') : math.format(result, { precision: 8 });
                }
            } else {
                if (typeof result === 'number') {
                    resultStr = result.toFixed(8).replace(/\.?0+$/, '');
                } else if (result && result.value !== undefined) {
                    resultStr = result.value.toFixed(8).replace(/\.?0+$/, '');
                } else {
                    resultStr = math.format(result, { precision: 8 });
                }
            }

            setAnswer(resultStr);
            setAns(resultStr);
            
            if (!history.includes(equation)) {
                setHistory(prev => [...prev, equation]);
            }
            setHistoryIndex(-1);
        } catch (err) {
            console.error(err);
            setAnswer('Math ERROR');
        }
    };

    const toggleSD = () => {
        if (!answer || answer === 'Math ERROR' || answer === 'Syntax ERROR') return;
        try {
            if (answer.includes('/')) {
                const parts = answer.split('/');
                const dec = (parseFloat(parts[0]) / parseFloat(parts[1])).toFixed(8).replace(/\.?0+$/, '');
                setAnswer(dec);
                setOutputMode('decimal');
            } else {
                const frac: any = math.fraction(parseFloat(answer));
                if (Number(frac.d) !== 1) {
                    setAnswer(`${frac.n}/${frac.d}`);
                }
                setOutputMode('fraction');
            }
        } catch (e) {
            console.error("S=D conversion failed", e);
        }
    };

    const addToken = (token: string) => {
        if (uiMode !== 'NORMAL') return;
        const operators = ['+', '-', '*', '/', '^'];
        
        if (answer !== '') {
            if (operators.includes(token)) {
                setEquation('ans' + token);
            } else {
                setEquation(token);
            }
            setAnswer('');
            return;
        }

        setEquation(prev => prev === '0' ? token : prev + token);
    };

    const handleAction = (btn: any) => {
        if (btn.val === 'AC') { 
            setEquation('0'); 
            setAnswer(''); 
            setShift(false); 
            setAlpha(false); 
            setUiMode('NORMAL');
            return;
        }

        if (shift && btn.val === '7') {
            setUiMode('CONST_SEL');
            setShift(false);
            return;
        }

        if (shift && btn.val === '(') { addToken('['); setShift(false); return; }
        if (shift && btn.val === ')') { addToken(']'); setShift(false); return; }
        if (shift && btn.val === 'sd') { addToken(','); setShift(false); return; }
        
        if (btn.val === 'MODE') {
            setUiMode('MODE_SEL');
            return;
        }
        
        if (uiMode === 'MODE_SEL') {
            if (btn.val === '1') { setAngleMode('deg'); setUiMode('NORMAL'); }
            if (btn.val === '2') { setAngleMode('rad'); setUiMode('NORMAL'); }
            if (btn.val === '3') { addToken('solveQuad('); setUiMode('NORMAL'); }
            if (btn.val === '4') { addToken('det('); setUiMode('NORMAL'); }
            if (btn.val === '5') { addToken('solveLin('); setUiMode('NORMAL'); }
            if (btn.val === '6') { setUiMode('CONST_SEL'); }
            return;
        }

        if (uiMode === 'CONST_SEL') {
            const num = parseInt(btn.val, 10);
            if (!isNaN(num) && num >= 0 && num < SCI_CONSTANTS.length) {
                addToken(SCI_CONSTANTS[num].sym);
                setUiMode('NORMAL');
            }
            return;
        }

        if (btn.val === 'DEL') {
            if (answer !== '') {
                setAnswer('');
            } else {
                setEquation(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
            }
        }
        else if (btn.val === '=') calculate();
        else addToken(btn.val);
        
        if (btn.val !== 'Shift' && btn.val !== 'Alpha') {
            setShift(false);
            setAlpha(false);
        }
    };

    const handleDpad = (dir: 'up' | 'down' | 'left' | 'right') => {
        if (uiMode !== 'NORMAL') return;
        if (dir === 'up') {
            if (history.length > 0) {
                const newIdx = Math.min(historyIndex + 1, history.length - 1);
                setHistoryIndex(newIdx);
                setEquation(history[history.length - 1 - newIdx]);
                setAnswer('');
            }
        } else if (dir === 'down') {
            if (historyIndex > 0) {
                const newIdx = historyIndex - 1;
                setHistoryIndex(newIdx);
                setEquation(history[history.length - 1 - newIdx]);
                setAnswer('');
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setEquation('0');
                setAnswer('');
            }
        } else if (dir === 'left') {
            handleAction({ val: 'DEL' });
        }
    };

    const functionKeys = [
        { label: shift ? 'CALC' : 'SOLVE', val: '' },
        { label: '∫dx', val: 'integral(' },
        { label: 'x⁻¹', val: '^-1' },
        { label: 'log▢', val: 'log(' },
        { label: '▢/▢', val: '/' },
        { label: '√', val: 'sqrt(' },
        { label: 'x²', val: '^2' },
        { label: 'x▢', val: '^' },
        { label: 'log', val: 'log10(' },
        { label: 'ln', val: 'log(' },
        { label: '(-)', val: '-' },
        { label: '°\'"', val: '' },
        { label: 'hyp', val: 'hypot(' },
        { label: 'sin', val: shift ? 'asin(' : 'sin(' },
        { label: 'cos', val: shift ? 'acos(' : 'cos(' },
        { label: 'tan', val: shift ? 'atan(' : 'tan(' },
        { label: 'RCL', val: '' },
        { label: 'ENG', val: 'i' },
        { label: shift ? '[' : '(', val: '(' },
        { label: shift ? ']' : ')', val: ')' },
        { label: shift ? ',' : 'S⇔D', val: 'sd' },
        { label: 'M+', val: 'm+' },
    ];

    const mainKeys = [
        { label: '7', val: '7', type: 'num' }, { label: '8', val: '8', type: 'num' }, { label: '9', val: '9', type: 'num' }, { label: 'DEL', val: 'DEL', type: 'del' }, { label: 'AC', val: 'AC', type: 'del' },
        { label: '4', val: '4', type: 'num' }, { label: '5', val: '5', type: 'num' }, { label: '6', val: '6', type: 'num' }, { label: '×', val: '*', type: 'op' }, { label: '÷', val: '/', type: 'op' },
        { label: '1', val: '1', type: 'num' }, { label: '2', val: '2', type: 'num' }, { label: '3', val: '3', type: 'num' }, { label: '+', val: '+', type: 'op' }, { label: '-', val: '-', type: 'op' },
        { label: '0', val: '0', type: 'num' }, { label: '.', val: '.', type: 'num' }, { label: '×10ˣ', val: 'e', type: 'op' }, { label: 'Ans', val: 'ans', type: 'op' }, { label: '=', val: '=', type: 'op' },
    ];

    return (
        <div className="flex bg-transparent items-center justify-center">
            <div className="bg-[#3b3b5c] p-3 sm:p-5 rounded-[2rem] shadow-2xl border-[6px] border-[#2d2d4a] max-w-[360px] w-full mx-auto relative font-mono overflow-hidden">
                {/* Branding Top */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="text-white font-black text-lg italic tracking-tighter opacity-90 leading-none">CASIO</div>
                        <div className="text-[0.4rem] text-white/40 font-bold tracking-widest mt-0.5">fx-991ES PLUS</div>
                    </div>
                    <div className="w-16 h-6 bg-[#222] border border-white/5 rounded flex flex-col items-center justify-center relative shadow-inner">
                        <div className="w-10 h-2 bg-[#442] opacity-30 blur-[1px]"></div>
                        <span className="text-[0.3rem] text-white/30 font-black absolute bottom-[1px] uppercase tracking-tighter">Two Way Power</span>
                    </div>
                </div>

                {/* Display Area */}
                <div className="bg-[#9da98e] p-2 rounded-xl mb-4 shadow-inner border-[3px] border-[#828f73] min-h-[100px] flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start z-10 opacity-70">
                        <div className="flex gap-1">
                             <span className={cn("text-[0.45rem] font-black px-1 rounded", angleMode === 'deg' ? "bg-black text-[#9da98e]" : "text-black/50")}>D</span>
                             <span className={cn("text-[0.45rem] font-black px-1 rounded", angleMode === 'rad' ? "bg-black text-[#9da98e]" : "text-black/50")}>R</span>
                        </div>
                        <div className="flex gap-2">
                            {shift && <span className="text-[0.45rem] font-black text-black">S</span>}
                            {alpha && <span className="text-[0.45rem] font-black text-black">A</span>}
                            <span className="text-[0.45rem] font-black text-black/40">MATH</span>
                        </div>
                    </div>

                    <div className="z-10 flex flex-col items-end w-full mt-1 h-full">
                        {uiMode === 'NORMAL' ? (
                            <>
                                <div className="text-black/80 font-serif font-bold w-full text-left truncate mb-1 opacity-80 min-h-[20px] text-[0.9rem] flex items-start break-all leading-tight">
                                    <span className="inline-block">
                                        <InlineMath math={getTexEquation(equation) + (answer ? '' : '\\_')} />
                                    </span>
                                </div>
                                <div className="text-black text-3xl font-black tabular-nums tracking-tighter leading-none flex flex-1 items-end justify-end overflow-hidden max-w-full">
                                    {answer === 'Math ERROR' || answer === 'Syntax ERROR' ? (
                                        <span className="text-lg">{answer}</span>
                                    ) : answer.includes('/') ? (
                                        <div className="scale-75 flex pb-1 origin-bottom-right"><InlineMath math={`\\frac{${answer.split('/')[0]}}{${answer.split('/')[1]}}`} /></div>
                                    ) : (
                                        <span>{answer}</span>
                                    )}
                                </div>
                            </>
                        ) : uiMode === 'MODE_SEL' ? (
                            <div className="w-full h-full text-black/80 font-mono text-xs leading-relaxed grid grid-cols-2 gap-x-2 px-1">
                                <div>1:COMP</div><div>2:CMPLX</div>
                                <div>3:EQN</div><div>4:MAT</div>
                                <div>5:VCT</div><div>6:CONST</div>
                            </div>
                        ) : uiMode === 'CONST_SEL' ? (
                            <div className="w-full h-full text-black/80 font-mono text-xs px-1">
                                <div className="font-bold border-b border-black/20 mb-1 text-[0.6rem]">Select Constant (0-9)</div>
                                <div className="grid grid-cols-2 gap-x-2 text-[0.55rem]">
                                    {SCI_CONSTANTS.map((c, i) => (
                                        <div key={i} className="truncate">{i}: {c.sym}</div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Top Control Bar with REPLAY */}
                <div className="flex justify-between items-center mb-4 px-1 gap-2">
                    <div className="flex gap-2 h-16 w-1/3">
                        <div className="flex flex-col justify-between h-full py-1">
                            <button onClick={() => setShift(!shift)} className={cn("py-1 px-1.5 rounded-lg text-[0.5rem] font-black transition-all border-b-2", shift ? "bg-amber-400 border-amber-600 text-black shadow-lg" : "bg-[#444] border-black text-amber-500")}>SHIFT</button>
                            <button className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">CALC</button>
                        </div>
                        <div className="flex flex-col justify-between h-full py-1">
                            <button onClick={() => setAlpha(!alpha)} className={cn("py-1 px-1.5 rounded-lg text-[0.5rem] font-black transition-all border-b-2", alpha ? "bg-rose-500 border-rose-700 text-white shadow-lg" : "bg-[#444] border-black text-rose-500")}>ALPHA</button>
                            <button className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">∫dx</button>
                        </div>
                    </div>

                    {/* REPLAY D-PAD */}
                    <div className="relative w-16 h-16 mx-auto shrink-0 z-20">
                        <div className="absolute inset-0 bg-[#2d2d4a] rounded-full shadow-2xl border border-white/5"></div>
                        <div className="absolute inset-0.5 bg-[#555] rounded-full border-b-[4px] border-black flex items-center justify-center text-white/20 select-none group">
                           <span className="absolute top-1 text-[0.3rem] font-black uppercase group-active:text-white transition-colors tracking-widest z-10 pointer-events-none">Replay</span>
                           <div onClick={() => handleDpad('up')} className="absolute top-1 w-4 h-4 text-white/40 active:text-white cursor-pointer"><ChevronUp className="w-full h-full" /></div>
                           <div onClick={() => handleDpad('down')} className="absolute bottom-1 w-4 h-4 text-white/40 active:text-white cursor-pointer"><ChevronDown className="w-full h-full" /></div>
                           <div onClick={() => handleDpad('left')} className="absolute left-1 w-4 h-4 text-white/40 active:text-white cursor-pointer"><ChevronLeft className="w-full h-full" /></div>
                           <div onClick={() => handleDpad('right')} className="absolute right-1 w-4 h-4 text-white/40 active:text-white cursor-pointer"><ChevronRight className="w-full h-full" /></div>
                        </div>
                    </div>

                    <div className="flex gap-2 h-16 w-1/3 justify-end">
                        <div className="flex flex-col justify-between h-full py-1">
                            <button onClick={() => setUiMode(uiMode === 'NORMAL' ? 'MODE_SEL' : 'NORMAL')} className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">MODE</button>
                            <button className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">x⁻¹</button>
                        </div>
                        <div className="flex flex-col justify-between h-full py-1">
                            <button onClick={() => {setEquation('0'); setAnswer('');}} className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">ON</button>
                            <button className="bg-[#444] border-b-2 border-black text-slate-300 py-1 px-1.5 rounded-lg text-[0.45rem] font-black uppercase">log▢</button>
                        </div>
                    </div>
                </div>

                {/* Scientific Function Grid */}
                <div className="grid grid-cols-6 gap-1.5 mb-4 px-1">
                    {functionKeys.slice(4).map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                if (btn.label === 'S⇔D') toggleSD();
                                else handleAction(btn);
                            }}
                            className="bg-[#cbd5e1] border-b-[3px] border-[#94a3b8] hover:bg-[#e2e8f0] text-slate-900 py-1.5 rounded-lg text-[0.5rem] font-black active:translate-y-[1px] active:border-b-2 transition-all uppercase tracking-tighter"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                {/* Main Number Pads */}
                <div className="grid grid-cols-5 gap-y-2 gap-x-1.5 px-1">
                    {mainKeys.map((btn, i) => (
                        <button
                            key={i}
                            onClick={() => handleAction(btn)}
                            className={cn(
                                "py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-black shadow-lg border-b-[4px] active:translate-y-[2px] active:border-b-[2px] transition-all font-mono",
                                btn.type === 'del' ? "bg-orange-500 border-orange-700 text-white" :
                                btn.type === 'num' ? "bg-[#334155] border-[#1e293b] text-white" :
                                "bg-[#cbd5e1] border-[#94a3b8] text-slate-900" 
                            )}
                        >
                            <span className={cn(btn.label === '×10ˣ' ? "text-[0.6rem]" : "")}>{btn.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const GPACalculator = () => {
    const compulsory = [
        { name: 'English', credit: 4 },
        { name: 'नेपाली', credit: 4 },
        { name: 'Maths', credit: 4 },
        { name: 'Science', credit: 4 },
        { name: 'सामाजिक', credit: 4 }
    ];
    const optional = [
        { name: 'Optional I', credit: 4 },
        { name: 'Optional II', credit: 4 }
    ];

    const [marks, setMarks] = useState<any>(() => {
        const initial: any = {};
        [...compulsory, ...optional].forEach(s => {
            initial[s.name] = { theory: 0, practical: 0 };
        });
        return initial;
    });

    const getGradeInfo = (percentage: number) => {
        if (percentage >= 90) return { gp: 4.0, grade: 'A+', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
        if (percentage >= 80) return { gp: 3.6, grade: 'A', color: 'text-green-600 bg-green-50 border-green-200' };
        if (percentage >= 70) return { gp: 3.2, grade: 'B+', color: 'text-blue-600 bg-blue-50 border-blue-200' };
        if (percentage >= 60) return { gp: 2.8, grade: 'B', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
        if (percentage >= 50) return { gp: 2.4, grade: 'C+', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        if (percentage >= 40) return { gp: 2.0, grade: 'C', color: 'text-orange-600 bg-orange-50 border-orange-200' };
        if (percentage >= 35) return { gp: 1.6, grade: 'D', color: 'text-rose-600 bg-rose-50 border-rose-200' };
        return { gp: 0, grade: 'NG', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    };

    const calculateGPA = () => {
        const totalPoints = [...compulsory, ...optional].reduce((acc, s) => {
            const { theory, practical } = marks[s.name];
            const percentage = (theory + practical);
            return acc + (getGradeInfo(percentage).gp * s.credit);
        }, 0);
        return totalPoints / 28; // Total credits
    };

    const gpa = calculateGPA();
    
    const getGpaColor = (gpaVal: number) => {
        if (gpaVal >= 3.6) return 'from-emerald-400 to-emerald-600 shadow-emerald-500/30';
        if (gpaVal >= 3.2) return 'from-green-400 to-green-600 shadow-green-500/30';
        if (gpaVal >= 2.8) return 'from-blue-400 to-blue-600 shadow-blue-500/30';
        if (gpaVal >= 2.4) return 'from-indigo-400 to-indigo-600 shadow-indigo-500/30';
        if (gpaVal >= 2.0) return 'from-amber-400 to-amber-600 shadow-amber-500/30';
        if (gpaVal >= 1.6) return 'from-orange-400 to-orange-600 shadow-orange-500/30';
        if (gpaVal > 0) return 'from-rose-400 to-rose-600 shadow-rose-500/30';
        return 'from-slate-400 to-slate-600 shadow-slate-500/30';
    };

    return (
        <div className="space-y-6 animate-fade-up">
            <div className={cn("p-10 md:p-14 rounded-[3.5rem] md:rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden transition-all duration-700 bg-linear-to-br", getGpaColor(gpa))}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 mix-blend-overlay pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -ml-10 -mb-10 mix-blend-overlay pointer-events-none" />
                <p className="text-[0.6rem] md:text-[0.7rem] font-black uppercase tracking-[0.4em] mb-3 opacity-80 relative z-10 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" /> Final Grade Point Average
                </p>
                <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter mb-6 relative z-10 drop-shadow-lg">{gpa.toFixed(2)}</h1>
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/20 rounded-full text-[0.65rem] md:text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/20 relative z-10 shadow-inner">
                    <Trophy className="w-3.5 h-3.5 text-amber-300" /> SEE {new Date().getFullYear() + 57} Standard
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden shadow-slate-200/50">
                <div className="bg-[#020617] px-8 py-5 flex justify-between items-center">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-400" /> Subject Grading Grid
                    </h3>
                    <div className="flex gap-4">
                        <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Theory</span>
                        <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Practical</span>
                    </div>
                </div>
                <div className="p-4 space-y-2 relative">
                    <div className="absolute inset-0 bg-slate-50/50 pointer-events-none" />
                    {[...compulsory, ...optional].map((s, i) => {
                        const { theory, practical } = marks[s.name];
                        const percentage = theory + practical;
                        const { grade, color } = getGradeInfo(percentage);
                        return (
                            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all relative z-10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2",
                                        i < compulsory.length 
                                            ? "bg-blue-50 text-blue border-blue-100" 
                                            : "bg-purple-50 text-purple-600 border-purple-100"
                                    )}>
                                        {s.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-bold text-slate-900 text-sm md:text-base leading-none mb-1">{s.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                                {i < compulsory.length ? 'Compulsory' : 'Optional'}
                                            </p>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                            <p className={cn("text-[0.55rem] font-black uppercase tracking-widest", percentage > 0 ? "text-emerald-500" : "text-slate-400")}>{percentage}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:ml-auto">
                                    {percentage > 0 && (
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 shadow-sm", color)}>
                                            {grade}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                                        <div className="flex items-center rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20 transition-all relative group">
                                            <span className="text-[0.5rem] font-black text-slate-300 absolute -top-2 left-2 bg-white px-1">TH</span>
                                            <input 
                                                type="number" 
                                                max="75"
                                                min="0"
                                                value={marks[s.name].theory || ""}
                                                placeholder="0"
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setMarks({...marks, [s.name]: { ...marks[s.name], theory: isNaN(val) ? 0 : Math.min(75, Math.max(0, val)) }});
                                                }}
                                                className="w-10 text-center font-black text-slate-800 outline-none text-sm md:text-base bg-transparent p-0 placeholder:text-slate-200"
                                            />
                                        </div>
                                        <span className="text-slate-300 font-bold px-1">+</span>
                                        <div className="flex items-center rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20 transition-all relative group">
                                            <span className="text-[0.5rem] font-black text-slate-300 absolute -top-2 left-2 bg-white px-1">PR</span>
                                            <input 
                                                type="number" 
                                                max="25"
                                                min="0"
                                                value={marks[s.name].practical || ""}
                                                placeholder="0"
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    setMarks({...marks, [s.name]: { ...marks[s.name], practical: isNaN(val) ? 0 : Math.min(25, Math.max(0, val)) }});
                                                }}
                                                className="w-10 text-center font-black text-slate-800 outline-none text-sm md:text-base bg-transparent p-0 placeholder:text-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CalculatorSuite = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState<'gpa' | 'standard'>((searchParams.get('tab') as any) || 'gpa');

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-linear-to-br from-blue to-indigo rounded-2xl flex items-center justify-center shadow-lg">
                        <Calculator className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Aadhar Desk</h1>
                </div>
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            <div className="flex p-2 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-200 shadow-xl max-w-sm mx-auto">
                <button 
                    onClick={() => setTab('gpa')}
                    className={cn(
                        "flex-1 py-3 md:py-4 rounded-[2rem] font-black text-[0.7rem] uppercase tracking-widest transition-all",
                        tab === 'gpa' ? "bg-white text-blue shadow-lg border border-slate-100" : "text-slate-400"
                    )}
                >GPA CALC</button>
                <button 
                    onClick={() => setTab('standard')}
                    className={cn(
                        "flex-1 py-3 md:py-4 rounded-[2rem] font-black text-[0.7rem] uppercase tracking-widest transition-all",
                        tab === 'standard' ? "bg-white text-blue shadow-lg border border-slate-100" : "text-slate-400"
                    )}
                >SCIENTIFIC</button>
            </div>

            {tab === 'gpa' ? <GPACalculator /> : <StandardCalculator />}
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useApp();

    const bannerColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-blue-500", "bg-pink-500", "bg-teal-500", "bg-cyan-500", "bg-purple-500"];
    const [bannerColorIndex, setBannerColorIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBannerColorIndex(prev => (prev + 1) % bannerColors.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 pb-20 px-1">
            {/* Welcome Banner - Rectangular and Large like Subject Hub */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={bannerColorIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={cn("text-white p-7 rounded-[2.5rem] shadow-2xl relative overflow-hidden transition-colors duration-700 min-h-[150px] flex flex-col justify-center border border-white/10", Object.values(SUBJECTS_CONFIG)[bannerColorIndex].gradient.replace('from-', 'bg-gradient-to-tr from-').replace('to-', 'to-'))}
                >
                    <div className="absolute top-4 right-6 opacity-20 transition-transform duration-700">
                         {React.createElement(Object.values(SUBJECTS_CONFIG)[bannerColorIndex].icon, { className: "w-24 h-24" })}
                    </div>
                    <div className="relative z-10 space-y-1">
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.4em] opacity-80">Sync Status: Peak Performance</p>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight italic leading-tight max-w-[90%]">
                            {["MASTER THE ART OF LEARNING", "PRECISION IN EVERY EQUATION", "UNLOCK YOUR POTENTIAL", "THINK BIG, LEARN BIGGER", "SCIENCE IS EVERYWHERE", "BUILD YOUR FOUNDATION", "ANALYZE, UNDERSTAND, SUCCEED", "COMPUTING THE FUTURE"][bannerColorIndex % 8]}
                        </h1>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 mb-2 shadow-inner">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-black text-slate-800 leading-none tabular-nums">{user?.xp || 0}</div>
                    <div className="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest mt-2">Universe Rank Points</div>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 mb-2 shadow-inner">
                        <Flame className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-black text-slate-800 leading-none tabular-nums">{user?.streak || 1}</div>
                    <div className="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest mt-2">Active Day Streak</div>
                </div>
            </div>
            
            {/* Syllabus Countdown Card */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Target className="w-32 h-32 text-blue group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue shadow-inner">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-[0.7rem] text-slate-800 uppercase tracking-widest leading-none">Exam Countdown</h3>
                                <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest mt-1">SEE 2083 Board Ready</p>
                            </div>
                        </div>
                        <span className="text-[0.6rem] font-black text-blue bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter italic">Batch 2083</span>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-end px-1">
                            <span className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">64 Days Remaining</span>
                            <span className="text-xs font-black text-blue uppercase tracking-widest">82% Mastery</span>
                        </div>
                        <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "82%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-linear-to-r from-blue-400 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)] relative"
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </motion.div>
                        </div>
                    </div>

                    <p className="text-[0.6rem] text-slate-400 font-bold leading-relaxed uppercase tracking-[0.2em] px-1">
                        Syllabus saturation detected. Precision review suggested for final 18%.
                    </p>
                </div>
            </div>

            {/* Aadhar Toolkit - 4 Buttons with Tools Page Design */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><ToolLayout className="w-4 h-4" /></div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight italic">Quick Tools</h2>
                    </div>
                    <Link to="/tools" className="text-blue-600 font-black text-[0.65rem] uppercase tracking-[0.2em] hover:underline">Full Toolkit</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 'dictionary', label: 'Dictionary', icon: Book, path: '/tools/dictionary', color: 'emerald' },
                        { id: 'notepad', label: 'Notepad', icon: Edit3, path: '/tools/notes', color: 'orange' },
                        { id: 'timer', label: 'Focus', icon: Timer, path: '/tools/timer', color: 'rose' },
                        { id: 'formulas', label: 'Formulas', icon: Sigma, path: '/tools/formulas', color: 'purple' },
                    ].map((t) => (
                        <Link 
                            key={t.id} 
                            to={t.path} 
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-blue/20 transition-all active:scale-95 text-center min-h-[140px]"
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform shrink-0 shadow-sm",
                                t.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                t.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                t.color === 'orange' ? "bg-orange-50 text-orange-600" :
                                t.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                "bg-rose-50 text-rose-600"
                            )}>
                                <t.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-slate-800 text-[0.8rem] tracking-tighter uppercase italic">{t.label}</h3>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Quick Access */}
            <div className="space-y-4 pt-2">
                 <div className="flex items-center gap-2 px-2">
                    <div className="bg-rose-100 text-rose-700 p-2 rounded-lg"><Megaphone className="w-4 h-4" /></div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight italic">Board Pulse</h2>
                </div>
                 <Link to="/news" className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-5">
                         <div className="bg-rose-50 text-rose-500 p-4 rounded-2xl shadow-inner"><Megaphone className="w-6 h-6" /></div>
                         <div>
                            <h3 className="font-black text-slate-800 text-base leading-none">Official CDC Updates</h3>
                            <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1">SEE 2083 Live Broadcast</p>
                         </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-200" />
                 </Link>
            </div>

            {/* Notice Board */}
            <NoticeBoard />
        </div>
    );
};

/* ── TOOLKIT DASHBOARD ── */
const AadharToolkit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isToolsPage = location.pathname === '/tools';

    const tools = [
        { id: 'hub', label: 'Study Hub', icon: BookOpen, color: 'indigo', path: '/hub' },
        { id: 'dictionary', label: 'Dictionary', icon: Book, color: 'rose', path: '/tools/dictionary' },
        { id: 'nepali-dictionary', label: 'नेपाली शब्दकोश', icon: Languages, color: 'amber', path: '/tools/nepali-dictionary' },
        { id: 'notepad', label: 'Mind Log', icon: Edit3, color: 'orange', path: '/tools/notes' },
        { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'rose', path: '/tools/timer' },
        { id: 'formulas', label: 'Formula Bank', icon: Sigma, color: 'purple', path: '/tools/formulas' },
        { id: 'calendar', label: 'Exam Calendar', icon: Calendar, color: 'blue', path: '/tools/calendar' },
        ...(isToolsPage ? [
            { id: 'calculator', label: 'Scientific Calc', icon: Calculator, color: 'amber', path: '/tools/calculator?tab=standard' },
            { id: 'periodic', label: 'Periodic Table', icon: Grid3X3, color: 'purple', path: '/tools/periodic-table' },
            { id: 'translate', label: 'Translator', icon: Languages, color: 'blue', path: '/tools/translator' },
            { id: 'gpa', label: 'GPA Estimate', icon: Activity, color: 'rose', path: '/tools/calculator?tab=gpa' },
            { id: 'converter', label: 'Unit Converter', icon: Scale, color: 'teal', path: '/tools/converter' },
            { id: 'todo', label: 'To-Do Pulse', icon: ListChecks, color: 'indigo', path: '/tools/todo' },
            { id: 'attendance', label: 'Attendance', icon: UserCheck, color: 'teal', path: '/tools/attendance' }
        ] : []),
    ];

    return (
        <div className="space-y-6">
            {!isToolsPage && (
                <div className="flex items-center gap-2 px-1">
                    <span className="text-xl font-bold">💼</span>
                    <h2 className="text-xl font-black text-[#1D4ED8] tracking-tight">Aadhar Toolkit</h2>
                    <div className="flex-1 h-[1px] bg-slate-100 ml-2" />
                </div>
            )}
            {isToolsPage && (
                <header className="mb-8 pt-4 flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-[#020617] italic tracking-tighter uppercase leading-none">The Toolkit</h1>
                    </div>
                    <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </header>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => navigate(t.path)}
                            className="bg-white p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-50 shadow-[0_5px_15px_rgba(0,0,0,0.02)] flex items-center md:flex-col md:items-center justify-start md:justify-center gap-3 hover:shadow-md hover:border-blue/20 transition-all group active:scale-95 text-left md:text-center min-h-[0] md:min-h-[140px]"
                        >
                            <div className={cn(
                                "w-9 h-9 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
                                t.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                t.color === 'blue' ? "bg-blue-50 text-blue" :
                                t.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                t.color === 'rose' ? "bg-rose-50 text-rose-500" :
                                t.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                t.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                t.color === 'orange' ? "bg-orange-50 text-orange-600" :
                                "bg-teal-50 text-teal-600"
                            )}>
                                <Icon className="w-5 h-5 md:w-7 md:h-7" strokeWidth={2.5} />
                            </div>
                            <p className="font-extrabold text-[#020617] text-[0.8rem] md:text-[1rem] tracking-tight leading-normal w-full px-1 pb-[2px] group-hover:scale-105 transition-transform">{t.label}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const NoticeBoard = () => {
    const { liveNotices } = useApp();
    const [currentIndex, setCurrentIndex] = useState(0);
    const staticNotices = [
        { id: '1', type: 'alert', text: 'SEE Exam Form deadline extended to Chaitra 5 for all districts.' },
        { id: '2', type: 'info', text: 'New Model Question Sets for Optional Maths 2083 uploaded to the Hub.' },
        { id: '3', type: 'update', text: 'Aadhar Pro AI now supports high-speed Nepali script interaction.' }
    ];

    const displayNotices = (liveNotices && liveNotices.length > 0) ? liveNotices : staticNotices;

    useEffect(() => {
        if (displayNotices.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % displayNotices.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [displayNotices.length]);

    if (displayNotices.length === 0) return null;

    return (
        <div className="mb-4 animate-fade-up">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Megaphone className="w-4 h-4 text-rose-500" />
                <h2 className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-[#020617]">Live Notice Board</h2>
                <div className="flex-1 h-[1.5px] bg-linear-to-r from-slate-100 to-transparent ml-2" />
            </div>
            
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-white/5 group">
                <div className="absolute top-0 right-0 p-3">
                    <Bell className="w-5 h-5 text-white/20 animate-swing origin-top" />
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 min-h-[60px] flex flex-col justify-center"
                    >
                        <div className={cn(
                            "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest mb-3 w-fit",
                            displayNotices[currentIndex].type === 'alert' ? "bg-red text-white" : 
                            displayNotices[currentIndex].type === 'update' ? "bg-emerald-500 text-white" : "bg-blue text-white"
                        )}>
                            <Pin className="w-3 h-3" />
                            {displayNotices[currentIndex].type}
                        </div>
                        <p className="text-xl font-bold text-white leading-tight tracking-tight">
                            {displayNotices[currentIndex].text}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-2">
                    {displayNotices.map((_, i) => (
                        <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === currentIndex ? "w-8 bg-blue" : "w-3 bg-white/10")} />
                    ))}
                </div>
                
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

const NewsPage = () => {
    const { liveNews, fetchLiveNews } = useApp();
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => { fetchLiveNews(); }, []);

    const categories = [
        { id: 'All', icon: Globe, color: 'bg-slate-100 text-slate-600', active: 'bg-linear-to-r from-slate-800 to-slate-900 text-white' },
        { id: 'Exams', icon: GraduationCap, color: 'bg-rose-100 text-rose-600', active: 'bg-linear-to-r from-rose-500 to-rose-600 text-white' },
        { id: 'Results', icon: Trophy, color: 'bg-amber-100 text-amber-600', active: 'bg-linear-to-r from-amber-500 to-amber-600 text-white' },
        { id: 'General', icon: Zap, color: 'bg-emerald-100 text-emerald-600', active: 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white' }
    ];

    const filteredNews = activeTab === 'All' ? liveNews.map(n => ({
        id: n.id,
        title: n.title,
        body: n.content,
        date: new Date(n.created_at).toLocaleDateString('ne-NP'),
        tag: n.category?.toUpperCase() || 'GENERAL',
        tagBg: n.category === 'exam' ? 'bg-rose-500' : n.category === 'result' ? 'bg-indigo-500' : 'bg-emerald-500',
        imageUrl: n.image_url
    })) : liveNews.filter(n => {
        const normalizedTag = n.category?.toLowerCase() || '';
        const normalizedActiveTab = activeTab.toLowerCase().slice(0, -1);
        return normalizedTag.includes(normalizedActiveTab) || normalizedTag === activeTab.toLowerCase();
    }).map(n => ({
        id: n.id,
        title: n.title,
        body: n.content,
        date: new Date(n.created_at).toLocaleDateString('ne-NP'),
        tag: n.category?.toUpperCase() || 'GENERAL',
        tagBg: n.category === 'exam' ? 'bg-rose-500' : n.category === 'result' ? 'bg-indigo-500' : 'bg-emerald-500',
        imageUrl: n.image_url
    }));

    return (
        <div className="space-y-12 animate-fade-up pb-32">
            <header className="relative py-16 md:py-24 overflow-hidden rounded-[4rem] bg-slate-900 text-white border-[10px] border-slate-800 shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-blue-600/30 via-transparent to-rose-600/30 blur-[80px]" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                
                <div className="relative z-10 text-center px-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 mb-8"
                    >
                        <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.4em]">Official Broadcast Channel</span>
                    </motion.div>
                    <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] mb-6 drop-shadow-2xl">
                        Universal <br/> <span className="text-rose-500">Pulse</span>
                    </h1>
                    <p className="text-[0.7rem] md:text-lg font-bold text-slate-300 max-w-2xl mx-auto tracking-wide leading-relaxed italic opacity-80 uppercase">
                        Global SEE 2083 Intelligence • Real-time curriculum updates • National Board Alerts
                    </p>
                </div>
            </header>

            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={cn(
                            "flex items-center gap-4 px-10 py-5 rounded-[2.5rem] font-black text-[0.7rem] uppercase tracking-widest transition-all shrink-0 border-4",
                            activeTab === cat.id 
                                ? cat.active + " border-transparent shadow-2xl scale-105" 
                                : "bg-white text-slate-400 border-white hover:border-slate-100 shadow-sm"
                        )}
                    >
                        <cat.icon className={cn("w-5 h-5", activeTab === cat.id ? "text-white" : "text-slate-300")} />
                        {cat.id}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredNews.length > 0 ? filteredNews.map((n, i) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[3.5rem] border-4 border-slate-50 shadow-2xl overflow-hidden group flex flex-col hover:border-rose-500/20 hover:shadow-rose-500/10 transition-all duration-500"
                        >
                            <div className="relative h-64 overflow-hidden shrink-0">
                                <img src={n.imageUrl || 'https://images.unsplash.com/photo-1588702547324-f176aa5130b0?auto=format&fit=crop&q=80'} alt={n.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent" />
                                <div className="absolute top-6 left-6">
                                    <span className={cn("text-[0.55rem] font-black px-5 py-2 rounded-2xl uppercase tracking-widest shadow-xl border border-white/20", n.tagBg)}>{n.tag}</span>
                                </div>
                            </div>
                            <div className="p-10 flex flex-col flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <Calendar className="w-5 h-5 text-slate-300" />
                                    <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{n.date}</span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight tracking-tighter uppercase italic group-hover:text-rose-500 transition-colors">
                                    {n.title}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-bold mb-10 flex-1 line-clamp-3">
                                    {n.body}
                                </p>
                                <button 
                                    onClick={() => setSelectedNews(n)}
                                    className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center gap-3"
                                >
                                    Access Data Stream
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
                            <Megaphone className="w-20 h-20 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Quiet Frequency</h3>
                            <p className="text-[0.65rem] font-black text-slate-400/60 uppercase tracking-widest mt-2 italic">Broadcast node offline or no data detected.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Read More Modal */}
            <AnimatePresence>
                {selectedNews && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
                        onClick={() => setSelectedNews(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={() => setSelectedNews(null)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 hover:bg-white transition-all">
                                <X className="w-5 h-5" />
                            </button>
                            
                            {selectedNews.imageUrl && (
                                <div className="w-full h-64 overflow-hidden relative">
                                    <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-8 left-10">
                                        <span className={cn("text-[0.6rem] font-black px-4 py-2 rounded-xl uppercase tracking-widest text-white backdrop-blur-md border border-white/20", selectedNews.tagBg)}>
                                            {selectedNews.tag}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="p-10 md:p-14 overflow-y-auto max-h-[60vh] custom-scrollbar">
                                <div className="flex items-center gap-3 mb-6">
                                    <Calendar className="w-5 h-5 text-rose-500" />
                                    <span className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest">{selectedNews.date}</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight tracking-tighter uppercase italic">{selectedNews.title}</h2>
                                <div className="prose prose-slate max-w-none text-slate-600 font-bold leading-relaxed whitespace-pre-wrap">
                                    {selectedNews.body}
                                </div>
                            </div>
                            
                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Official Channel • Aadhar Pathshala</p>
                                <button onClick={() => setSelectedNews(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── PERIODIC TABLE TOOL ── */
const PeriodicTablePage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'modern' | 'mendeleev'>('modern');
    const [zoom, setZoom] = useState(1);
    const [selectedElement, setSelectedElement] = useState<any>(null);

    const elementsData: any[] = [
        { n: 1, s: 'H', name: 'Hydrogen', m: 1.008, x: 1, y: 1, c: 'nonmetal' },
        { n: 2, s: 'He', name: 'Helium', m: 4.0026, x: 18, y: 1, c: 'noble' },
        { n: 3, s: 'Li', name: 'Lithium', m: 6.94, x: 1, y: 2, c: 'alkali' },
        { n: 4, s: 'Be', name: 'Beryllium', m: 9.0122, x: 2, y: 2, c: 'alkaline' },
        { n: 5, s: 'B', name: 'Boron', m: 10.81, x: 13, y: 2, c: 'metalloid' },
        { n: 6, s: 'C', name: 'Carbon', m: 12.011, x: 14, y: 2, c: 'nonmetal' },
        { n: 7, s: 'N', name: 'Nitrogen', m: 14.007, x: 15, y: 2, c: 'nonmetal' },
        { n: 8, s: 'O', name: 'Oxygen', m: 15.999, x: 16, y: 2, c: 'nonmetal' },
        { n: 9, s: 'F', name: 'Fluorine', m: 18.998, x: 17, y: 2, c: 'nonmetal' },
        { n: 10, s: 'Ne', name: 'Neon', m: 20.180, x: 18, y: 2, c: 'noble' },
        { n: 11, s: 'Na', name: 'Sodium', m: 22.990, x: 1, y: 3, c: 'alkali' },
        { n: 12, s: 'Mg', name: 'Magnesium', m: 24.305, x: 2, y: 3, c: 'alkaline' },
        { n: 13, s: 'Al', name: 'Aluminum', m: 26.982, x: 13, y: 3, c: 'post-transition' },
        { n: 14, s: 'Si', name: 'Silicon', m: 28.085, x: 14, y: 3, c: 'metalloid' },
        { n: 15, s: 'P', name: 'Phosphorus', m: 30.974, x: 15, y: 3, c: 'nonmetal' },
        { n: 16, s: 'S', name: 'Sulfur', m: 32.06, x: 16, y: 3, c: 'nonmetal' },
        { n: 17, s: 'Cl', name: 'Chlorine', m: 35.45, x: 17, y: 3, c: 'nonmetal' },
        { n: 18, s: 'Ar', name: 'Argon', m: 39.948, x: 18, y: 3, c: 'noble' },
        { n: 19, s: 'K', name: 'Potassium', m: 39.098, x: 1, y: 4, c: 'alkali' },
        { n: 20, s: 'Ca', name: 'Calcium', m: 40.078, x: 2, y: 4, c: 'alkaline' },
        { n: 21, s: 'Sc', name: 'Scandium', m: 44.956, x: 3, y: 4, c: 'transition' },
        { n: 22, s: 'Ti', name: 'Titanium', m: 47.867, x: 4, y: 4, c: 'transition' },
        { n: 23, s: 'V', name: 'Vanadium', m: 50.942, x: 5, y: 4, c: 'transition' },
        { n: 24, s: 'Cr', name: 'Chromium', m: 51.996, x: 6, y: 4, c: 'transition' },
        { n: 25, s: 'Mn', name: 'Manganese', m: 54.938, x: 7, y: 4, c: 'transition' },
        { n: 26, s: 'Fe', name: 'Iron', m: 55.845, x: 8, y: 4, c: 'transition' },
        { n: 27, s: 'Co', name: 'Cobalt', m: 58.933, x: 9, y: 4, c: 'transition' },
        { n: 28, s: 'Ni', name: 'Nickel', m: 58.693, x: 10, y: 4, c: 'transition' },
        { n: 29, s: 'Cu', name: 'Copper', m: 63.546, x: 11, y: 4, c: 'transition' },
        { n: 30, s: 'Zn', name: 'Zinc', m: 65.38, x: 12, y: 4, c: 'transition' },
        { n: 31, s: 'Ga', name: 'Gallium', m: 69.723, x: 13, y: 4, c: 'post-transition' },
        { n: 32, s: 'Ge', name: 'Germanium', m: 72.630, x: 14, y: 4, c: 'metalloid' },
        { n: 33, s: 'As', name: 'Arsenic', m: 74.922, x: 15, y: 4, c: 'metalloid' },
        { n: 34, s: 'Se', name: 'Selenium', m: 78.971, x: 16, y: 4, c: 'nonmetal' },
        { n: 35, s: 'Br', name: 'Bromine', m: 79.904, x: 17, y: 4, c: 'nonmetal' },
        { n: 36, s: 'Kr', name: 'Krypton', m: 83.798, x: 18, y: 4, c: 'noble' },
        { n: 37, s: 'Rb', name: 'Rubidium', m: 85.468, x: 1, y: 5, c: 'alkali' },
        { n: 38, s: 'Sr', name: 'Strontium', m: 87.62, x: 2, y: 5, c: 'alkaline' },
        { n: 39, s: 'Y', name: 'Yttrium', m: 88.906, x: 3, y: 5, c: 'transition' },
        { n: 40, s: 'Zr', name: 'Zirconium', m: 91.224, x: 4, y: 5, c: 'transition' },
        { n: 41, s: 'Nb', name: 'Niobium', m: 92.906, x: 5, y: 5, c: 'transition' },
        { n: 42, s: 'Mo', name: 'Molybdenum', m: 95.95, x: 6, y: 5, c: 'transition' },
        { n: 43, s: 'Tc', name: 'Technetium', m: (98), x: 7, y: 5, c: 'transition' },
        { n: 44, s: 'Ru', name: 'Ruthenium', m: 101.07, x: 8, y: 5, c: 'transition' },
        { n: 45, s: 'Rh', name: 'Rhodium', m: 102.91, x: 9, y: 5, c: 'transition' },
        { n: 46, s: 'Pd', name: 'Palladium', m: 106.42, x: 10, y: 5, c: 'transition' },
        { n: 47, s: 'Ag', name: 'Silver', m: 107.87, x: 11, y: 5, c: 'transition' },
        { n: 48, s: 'Cd', name: 'Cadmium', m: 112.41, x: 12, y: 5, c: 'transition' },
        { n: 49, s: 'In', name: 'Indium', m: 114.82, x: 13, y: 5, c: 'post-transition' },
        { n: 50, s: 'Sn', name: 'Tin', m: 118.71, x: 14, y: 5, c: 'post-transition' },
        { n: 51, s: 'Sb', name: 'Antimony', m: 121.76, x: 15, y: 5, c: 'metalloid' },
        { n: 52, s: 'Te', name: 'Tellurium', m: 127.60, x: 16, y: 5, c: 'metalloid' },
        { n: 53, s: 'I', name: 'Iodine', m: 126.90, x: 17, y: 5, c: 'nonmetal' },
        { n: 54, s: 'Xe', name: 'Xenon', m: 131.29, x: 18, y: 5, c: 'noble' },
        { n: 55, s: 'Cs', name: 'Cesium', m: 132.91, x: 1, y: 6, c: 'alkali' },
        { n: 56, s: 'Ba', name: 'Barium', m: 137.33, x: 2, y: 6, c: 'alkaline' },
        { n: 57, s: 'La', name: 'Lanthanum', m: 138.91, x: 4, y: 9, c: 'lanthanide' },
        { n: 58, s: 'Ce', name: 'Cerium', m: 140.12, x: 5, y: 9, c: 'lanthanide' },
        { n: 59, s: 'Pr', name: 'Praseodymium', m: 140.91, x: 6, y: 9, c: 'lanthanide' },
        { n: 60, s: 'Nd', name: 'Neodymium', m: 144.24, x: 7, y: 9, c: 'lanthanide' },
        { n: 61, s: 'Pm', name: 'Promethium', m: (145), x: 8, y: 9, c: 'lanthanide' },
        { n: 62, s: 'Sm', name: 'Samarium', m: 150.36, x: 9, y: 9, c: 'lanthanide' },
        { n: 63, s: 'Eu', name: 'Europium', m: 151.96, x: 10, y: 9, c: 'lanthanide' },
        { n: 64, s: 'Gd', name: 'Gadolinium', m: 157.25, x: 11, y: 9, c: 'lanthanide' },
        { n: 65, s: 'Tb', name: 'Terbium', m: 158.93, x: 12, y: 9, c: 'lanthanide' },
        { n: 66, s: 'Dy', name: 'Dysprosium', m: 162.50, x: 13, y: 9, c: 'lanthanide' },
        { n: 67, s: 'Ho', name: 'Holmium', m: 164.93, x: 14, y: 9, c: 'lanthanide' },
        { n: 68, s: 'Er', name: 'Erbium', m: 167.26, x: 15, y: 9, c: 'lanthanide' },
        { n: 69, s: 'Tm', name: 'Thulium', m: 168.93, x: 16, y: 9, c: 'lanthanide' },
        { n: 70, s: 'Yb', name: 'Ytterbium', m: 173.05, x: 17, y: 9, c: 'lanthanide' },
        { n: 71, s: 'Lu', name: 'Lutetium', m: 174.97, x: 18, y: 9, c: 'lanthanide' },
        { n: 72, s: 'Hf', name: 'Hafnium', m: 178.49, x: 4, y: 6, c: 'transition' },
        { n: 73, s: 'Ta', name: 'Tantalum', m: 180.95, x: 5, y: 6, c: 'transition' },
        { n: 74, s: 'W', name: 'Tungsten', m: 183.84, x: 6, y: 6, c: 'transition' },
        { n: 75, s: 'Re', name: 'Rhenium', m: 186.21, x: 7, y: 6, c: 'transition' },
        { n: 76, s: 'Os', name: 'Osmium', m: 190.23, x: 8, y: 6, c: 'transition' },
        { n: 77, s: 'Ir', name: 'Iridium', m: 192.22, x: 9, y: 6, c: 'transition' },
        { n: 78, s: 'Pt', name: 'Platinum', m: 195.08, x: 10, y: 6, c: 'transition' },
        { n: 79, s: 'Au', name: 'Gold', m: 196.97, x: 11, y: 6, c: 'transition' },
        { n: 80, s: 'Hg', name: 'Mercury', m: 200.59, x: 12, y: 6, c: 'transition' },
        { n: 81, s: 'Tl', name: 'Thallium', m: 204.38, x: 13, y: 6, c: 'post-transition' },
        { n: 82, s: 'Pb', name: 'Lead', m: 207.2, x: 14, y: 6, c: 'post-transition' },
        { n: 83, s: 'Bi', name: 'Bismuth', m: 208.98, x: 15, y: 6, c: 'post-transition' },
        { n: 84, s: 'Po', name: 'Polonium', m: (209), x: 16, y: 6, c: 'post-transition' },
        { n: 85, s: 'At', name: 'Astatine', m: (210), x: 17, y: 6, c: 'metalloid' },
        { n: 86, s: 'Rn', name: 'Radon', m: (222), x: 18, y: 6, c: 'noble' },
        { n: 87, s: 'Fr', name: 'Francium', m: (223), x: 1, y: 7, c: 'alkali' },
        { n: 88, s: 'Ra', name: 'Radium', m: (226), x: 2, y: 7, c: 'alkaline' },
        { n: 89, s: 'Ac', name: 'Actinium', m: (227), x: 4, y: 10, c: 'actinide' },
        { n: 90, s: 'Th', name: 'Thorium', m: 232.04, x: 5, y: 10, c: 'actinide' },
        { n: 91, s: 'Pa', name: 'Protactinium', m: 231.04, x: 6, y: 10, c: 'actinide' },
        { n: 92, s: 'U', name: 'Uranium', m: 238.03, x: 7, y: 10, c: 'actinide' },
        { n: 93, s: 'Np', name: 'Neptunium', m: (237), x: 8, y: 10, c: 'actinide' },
        { n: 94, s: 'Pu', name: 'Plutonium', m: (244), x: 9, y: 10, c: 'actinide' },
        { n: 95, s: 'Am', name: 'Americium', m: (243), x: 10, y: 10, c: 'actinide' },
        { n: 96, s: 'Cm', name: 'Curium', m: (247), x: 11, y: 10, c: 'actinide' },
        { n: 97, s: 'Bk', name: 'Berkelium', m: (247), x: 12, y: 10, c: 'actinide' },
        { n: 98, s: 'Cf', name: 'Californium', m: (251), x: 13, y: 10, c: 'actinide' },
        { n: 99, s: 'Es', name: 'Einsteinium', m: (252), x: 14, y: 10, c: 'actinide' },
        { n: 100, s: 'Fm', name: 'Fermium', m: (257), x: 15, y: 10, c: 'actinide' },
        { n: 101, s: 'Md', name: 'Mendelevium', m: (258), x: 16, y: 10, c: 'actinide' },
        { n: 102, s: 'No', name: 'Nobelium', m: (259), x: 17, y: 10, c: 'actinide' },
        { n: 103, s: 'Lr', name: 'Lawrencium', m: (262), x: 18, y: 10, c: 'actinide' },
        { n: 104, s: 'Rf', name: 'Rutherfordium', m: (267), x: 4, y: 7, c: 'transition' },
        { n: 105, s: 'Db', name: 'Dubnium', m: (268), x: 5, y: 7, c: 'transition' },
        { n: 106, s: 'Sg', name: 'Seaborgium', m: (271), x: 6, y: 7, c: 'transition' },
        { n: 107, s: 'Bh', name: 'Bohrium', m: (270), x: 7, y: 7, c: 'transition' },
        { n: 108, s: 'Hs', name: 'Hassium', m: (277), x: 8, y: 7, c: 'transition' },
        { n: 109, s: 'Mt', name: 'Meitnerium', m: (276), x: 9, y: 7, c: 'transition' },
        { n: 110, s: 'Ds', name: 'Darmstadtium', m: (281), x: 10, y: 7, c: 'transition' },
        { n: 111, s: 'Rg', name: 'Roentgenium', m: (280), x: 11, y: 7, c: 'transition' },
        { n: 112, s: 'Cn', name: 'Copernicium', m: (285), x: 12, y: 7, c: 'transition' },
        { n: 113, s: 'Nh', name: 'Nihonium', m: (284), x: 13, y: 7, c: 'post-transition' },
        { n: 114, s: 'Fl', name: 'Flerovium', m: (289), x: 14, y: 7, c: 'post-transition' },
        { n: 115, s: 'Mc', name: 'Moscovium', m: (288), x: 15, y: 7, c: 'post-transition' },
        { n: 116, s: 'Lv', name: 'Livermorium', m: (293), x: 16, y: 7, c: 'post-transition' },
        { n: 117, s: 'Ts', name: 'Tennessine', m: (294), x: 17, y: 7, c: 'nonmetal' },
        { n: 118, s: 'Og', name: 'Oganesson', m: (294), x: 18, y: 7, c: 'noble' },
    ];

    const elementDetails: Record<number, any> = {
        1: { v: 1, ec: '1', p: 1, n: 0, e: 1, f: 'Highly flammable, most abundant element in the universe.' },
        2: { v: 0, ec: '2', p: 2, n: 2, e: 2, f: 'Noble gas, inert, used in balloons and high-tech cryogenics.' },
        3: { v: 1, ec: '2, 1', p: 3, n: 4, e: 3, f: 'Lightest alkali metal, highly reactive with water, used in rechargeable batteries.' },
        4: { v: 2, ec: '2, 2', p: 4, n: 5, e: 4, f: 'Alkaline earth metal, high melting point, very strong yet lightweight.' },
        5: { v: 3, ec: '2, 3', p: 5, n: 6, e: 5, f: 'Metalloid, found in borax, essential for plant growth and fiberglass.' },
        6: { v: 4, ec: '2, 4', p: 6, n: 6, e: 6, f: 'Basis of all life, forms diamonds and graphite. Crucial for carbon dating.' },
        7: { v: 3, ec: '2, 5', p: 7, n: 7, e: 7, f: 'Colorless gas, makes up 78% of the atmosphere, vital for fertilizers.' },
        8: { v: 2, ec: '2, 6', p: 8, n: 8, e: 8, f: 'Highly reactive non-metal, 21% of atmosphere, essential for respiration.' },
        9: { v: 1, ec: '2, 7', p: 9, n: 10, e: 9, f: 'Pale yellow gas, most reactive element, found in toothpaste for tooth security.' },
        10: { v: 0, ec: '2, 8', p: 10, n: 10, e: 10, f: 'Noble gas, completely inert, glows bright orange-red in discharge tubes.' },
        11: { v: 1, ec: '2, 8, 1', p: 11, n: 12, e: 11, f: 'Soft alkali metal, highly reactive, found in table salt (NaCl).' },
        12: { v: 2, ec: '2, 8, 2', p: 12, n: 12, e: 12, f: 'Strong, lightweight metal, burns with a blinding white flame.' },
        13: { v: 3, ec: '2, 8, 3', p: 13, n: 14, e: 13, f: 'Most abundant metal in Earth crust, lightweight and corrosion-resistant.' },
        14: { v: 4, ec: '2, 8, 4', p: 14, n: 14, e: 14, f: 'Semiconductor, used in computer chips and solar cells. 2nd most abundant in crust.' },
        15: { v: '3, 5', ec: '2, 8, 5', p: 15, n: 16, e: 15, f: 'Highly reactive non-metal, found in DNA, bones, and matches.' },
        16: { v: '2, 4, 6', ec: '2, 8, 6', p: 16, n: 16, e: 16, f: 'Bright yellow non-metal, found in volcanic areas, used in sulfuric acid.' },
        17: { v: 1, ec: '2, 8, 7', p: 17, n: 18, e: 17, f: 'Toxic green gas, used for water purification and as a disinfectant.' },
        18: { v: 0, ec: '2, 8, 8', p: 18, n: 22, e: 18, f: 'Noble gas, used as an inert shield in welding and light bulbs.' },
        19: { v: 1, ec: '2, 8, 8, 1', p: 19, n: 20, e: 19, f: 'Highly reactive alkali metal, essential electrolyte for nerve conduction.' },
        20: { v: 2, ec: '2, 8, 8, 2', p: 20, n: 20, e: 20, f: 'Alkaline earth metal, vital for bones, teeth, and muscle movement.' },
    };

    const getCategoryStyles = (c: string) => {
        switch (c) {
            case 'alkali': return 'bg-purple-500 text-white border-purple-600 shadow-purple-500/20';
            case 'alkaline': return 'bg-violet-600 text-white border-violet-700 shadow-violet-600/20';
            case 'transition': return 'bg-rose-500 text-white border-rose-600 shadow-rose-500/20';
            case 'post-transition': return 'bg-sky-400 text-white border-sky-500 shadow-sky-400/20';
            case 'metalloid': return 'bg-indigo-500 text-white border-indigo-600 shadow-indigo-500/20';
            case 'nonmetal': return 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20';
            case 'noble': return 'bg-red-500 text-white border-red-600 shadow-red-500/20';
            case 'lanthanide': return 'bg-emerald-400 text-white border-emerald-500 shadow-emerald-400/20';
            case 'actinide': return 'bg-teal-500 text-white border-teal-600 shadow-teal-500/20';
            default: return 'bg-slate-400 text-white border-slate-500';
        }
    };

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(2, Math.max(0.5, prev + delta)));
    };

    const first20 = elementsData.slice(0, 20);

    return (
        <div className="space-y-8 animate-fade-up pb-24 overflow-hidden min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Periodic Realm</h1>
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Chemical Intelligence Hub</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start">
                    <button 
                        onClick={() => setView('modern')}
                        className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === 'modern' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}
                    >Modern</button>
                    <button 
                        onClick={() => setView('mendeleev')}
                        className={cn("px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", view === 'mendeleev' ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600")}
                    >Mendeleev</button>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm self-start">
                    <button onClick={() => handleZoom(-0.1)} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><Search className="w-4 h-4" />-</button>
                    <span className="text-[0.65rem] font-bold text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => handleZoom(0.1)} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 rounded-xl transition-all"><Search className="w-4 h-4" />+</button>
                </div>
            </header>

            {/* MAIN TABLE AREA */}
            <div className="relative overflow-x-auto bg-slate-950 p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border-[8px] md:border-[12px] border-slate-900 shadow-2xl min-h-[400px] md:min-h-[600px] scrollbar-hide">
                <div 
                    className="origin-top-left transition-transform duration-300 pr-8 pb-8" 
                    style={{ 
                        transform: `scale(${zoom})`, 
                        width: view === 'modern' ? '1200px' : '900px',
                        minWidth: '100%' 
                    }}
                >
                    {view === 'modern' ? (
                        <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-[repeat(10,minmax(0,1fr))] gap-1 md:gap-2.5">
                            {elementsData.map(el => (
                                <motion.div
                                    key={el.n}
                                    layoutId={`el-${el.n}`}
                                    style={{ gridColumn: el.x, gridRow: el.y }}
                                    onClick={() => setSelectedElement(el)}
                                    className={cn(
                                        "aspect-square rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center p-1 md:p-2 cursor-pointer transition-all hover:scale-110 active:scale-95 group relative shadow-md",
                                        getCategoryStyles(el.c)
                                    )}
                                >
                                    <div className="absolute top-0.5 left-1 text-[0.45rem] md:text-[0.6rem] font-black opacity-60 leading-none group-hover:opacity-100">{el.n}</div>
                                    <div className="text-sm md:text-xl font-black leading-none group-hover:scale-110 transition-transform">{el.s}</div>
                                    <div className="text-[0.35rem] md:text-[0.5rem] font-bold truncate w-full text-center mt-0.5 tracking-tighter uppercase opacity-80">{el.name}</div>
                                    <div className="absolute bottom-0.5 right-1 text-[0.35rem] md:text-[0.45rem] font-bold opacity-40 leading-none">{el.m}</div>
                                </motion.div>
                            ))}

                            {/* LABELS FOR MODERN VIEW */}
                            {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(g => (
                                <div key={g} style={{ gridColumn: g, gridRow: 0.5 }} className="text-center text-[0.6rem] font-black text-slate-700">{g}</div>
                            ))}
                        </div>
                    ) : (
                        /* MENDELEEV LAYOUT (Simplified Group/Series) */
                        <div className="grid grid-cols-[100px_repeat(8,minmax(0,1fr))] gap-2">
                            <div className="h-12 border-b border-slate-800 flex items-center justify-center text-[0.7rem] font-black text-slate-500 uppercase italic">Series</div>
                            {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map(g => (
                                <div key={g} className="h-12 border-b border-slate-800 flex items-center justify-center text-sm font-black text-slate-400 italic">Group {g}</div>
                            ))}
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(s => {
                                // Simplified mapping for Mendeleev
                                const seriesElements = elementsData.filter((_, i) => Math.floor(i / 8) + 1 === s);
                                return (
                                    <React.Fragment key={s}>
                                        <div className="h-16 flex items-center justify-center text-2xl font-black text-slate-800 italic">{s}</div>
                                        {seriesElements.map((el, i) => (
                                            <div 
                                                key={el.n}
                                                onClick={() => setSelectedElement(el)}
                                                className={cn(
                                                    "h-16 rounded-xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group relative shadow-md",
                                                    getCategoryStyles(el.c)
                                                )}
                                            >
                                                <div className="absolute top-1 left-2 text-[0.5rem] font-black opacity-60 leading-none">{el.n}</div>
                                                <div className="text-lg font-black leading-none">{el.s}</div>
                                                <div className="text-[0.4rem] font-bold truncate w-full text-center mt-1 uppercase opacity-80">{el.name}</div>
                                            </div>
                                        ))}
                                        {/* Fills empty spots to keep grid aligned */}
                                        {Array.from({ length: 8 - seriesElements.length }).map((_, i) => (
                                            <div key={`empty-${s}-${i}`} className="h-16 border border-slate-900/50 rounded-xl bg-slate-900/20" />
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* LEGEND SECTION */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Alkali Metals', style: 'bg-purple-500' },
                    { label: 'Alkaline Earth', style: 'bg-violet-600' },
                    { label: 'Transition', style: 'bg-rose-500' },
                    { label: 'Metalloids', style: 'bg-indigo-500' },
                    { label: 'Nonmetals', style: 'bg-amber-500' },
                    { label: 'Noble Gas', style: 'bg-red-500' },
                    { label: 'Post-Transition', style: 'bg-sky-400' },
                    { label: 'Lanthanides', style: 'bg-emerald-400' },
                    { label: 'Actinides', style: 'bg-teal-500' }
                ].map(l => (
                    <div key={l.label} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-50 shadow-sm">
                        <div className={cn("w-4 h-4 rounded-full", l.style)} />
                        <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-600">{l.label}</span>
                    </div>
                ))}
            </div>

            {/* ADDITIONAL ELEMENT CARDS (FIRST 20) */}
            <div className="space-y-6 mt-12 bg-white/30 backdrop-blur-md p-8 rounded-[3.5rem] border border-white/50 shadow-inner">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-8 bg-blue-500 rounded-full" />
                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Detailed Element Profiles (First 20)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {first20.map(el => (
                        <div 
                            key={`card-${el.n}`} 
                            onClick={() => setSelectedElement(el)}
                            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue/20 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 rounded-full", getCategoryStyles(el.c))} />
                            <div className="flex items-center gap-4">
                                <div className={cn("w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border-2 border-white shadow-md", getCategoryStyles(el.c))}>
                                    <span className="text-xl font-black">{el.s}</span>
                                    <span className="text-[0.5rem] font-bold opacity-60 leading-none">{el.n}</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-slate-800 uppercase tracking-tight truncate">{el.name}</h4>
                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{el.c}</p>
                                </div>
                            </div>
                            {elementDetails[el.n] && (
                                <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <p className="text-[0.5rem] font-black text-slate-300 uppercase">Valency</p>
                                        <p className="text-sm font-black text-slate-700">{elementDetails[el.n].v}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[0.5rem] font-black text-slate-300 uppercase">Conf.</p>
                                        <p className="text-sm font-black text-slate-700 truncate">{elementDetails[el.n].ec}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <p className="text-center text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.3em] py-4 italic">Analysis powered by Aadhar Scientific Engine</p>
            </div>

            {/* ELEMENT DETAILS DRAWER / SECTION */}
            <AnimatePresence>
                {selectedElement && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="fixed inset-x-0 bottom-0 z-50 p-6 md:p-10 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.1)] rounded-t-[4rem] border-t border-slate-100 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="max-w-4xl mx-auto space-y-8 pb-48">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-8">
                                    <div className={cn(
                                        "w-24 h-24 md:w-32 md:h-32 rounded-3xl md:rounded-[2.5rem] border-[4px] border-white shadow-2xl flex flex-col items-center justify-center relative",
                                        getCategoryStyles(selectedElement.c)
                                    )}>
                                        <span className="absolute top-2 left-3 text-sm md:text-lg font-black opacity-60 leading-none">{selectedElement.n}</span>
                                        <span className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none">{selectedElement.s}</span>
                                        <span className="absolute bottom-2 right-3 text-[0.6rem] md:text-[0.8rem] font-black opacity-40 leading-none">{selectedElement.m}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[0.65rem] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{selectedElement.c.replace('-', ' ')} Model</p>
                                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{selectedElement.name}</h2>
                                        <div className="flex gap-2 pt-2">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Atomic: {selectedElement.n}</span>
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">Mass: {selectedElement.m}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedElement(null)} className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <ArrowLeft className="w-6 h-6 rotate-270" />
                                </button>
                            </div>

                            {/* FIRST 20 DETAILS */}
                            {elementDetails[selectedElement.n] ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue"><Sigma className="w-5 h-5" /></div>
                                            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
                                        </div>
                                        <p className="text-3xl font-black text-slate-800 italic tracking-tighter font-mono">{elementDetails[selectedElement.n].ec}</p>
                                        <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Stable arrangement of orbiting electrons.</p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500"><Zap className="w-5 h-5" /></div>
                                            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Valency</p>
                                        </div>
                                        <p className="text-3xl font-black text-slate-800 italic tracking-tighter">{elementDetails[selectedElement.n].v}</p>
                                        <p className="text-xs font-bold text-slate-400 leading-relaxed uppercase">Combining capacity of the atom.</p>
                                    </div>

                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-shadow lg:col-span-1 md:col-span-2 lg:col-start-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500"><Activity className="w-5 h-5" /></div>
                                            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Nucleus Data</p>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                            <span className="text-[0.6rem] font-black text-emerald-600 uppercase tracking-widest">Protons</span>
                                            <span className="text-xl font-black text-slate-800">{elementDetails[selectedElement.n].p}</span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                                            <span className="text-[0.6rem] font-black text-blue-600 uppercase tracking-widest">Neutrons</span>
                                            <span className="text-xl font-black text-slate-800">{elementDetails[selectedElement.n].n}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-[0.6rem] font-black text-amber-600 uppercase tracking-widest">Electrons</span>
                                            <span className="text-xl font-black text-slate-800">{elementDetails[selectedElement.n].e}</span>
                                        </div>
                                    </div>

                                    <div className="bg-linear-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl md:col-span-2 lg:col-span-3 text-white relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                                                    <p className="text-[0.65rem] font-black text-white/40 uppercase tracking-[0.4em]">Expert Key Features</p>
                                                </div>
                                                <p className="text-xl md:text-2xl font-black italic tracking-tighter leading-snug">
                                                    {elementDetails[selectedElement.n].f}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => navigate('/ai')}
                                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
                                            >
                                                Learn More via AI
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 text-center space-y-4">
                                    <Info className="w-12 h-12 text-slate-300 mx-auto" />
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Atomic Profile Partial</h3>
                                        <p className="text-sm font-bold text-slate-400">Deep structural analysis is available for the first 20 elements. Ask Aadhar Pro for other elements.</p>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/ai')}
                                        className="inline-flex items-center gap-3 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-slate-900/20 mt-4"
                                    >
                                        <Zap className="w-4 h-4 text-amber-400 shadow-[0_0_10px_white]" /> Consult Expert
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/** ── NEPALI DICTIONARY PAGE ── */
const NepaliDictionaryPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    
    const recentTerms = [
        { term: 'शिक्षा', color: 'bg-amber-50 text-amber-600 border-amber-100' },
        { term: 'विद्यार्थी', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
        { term: 'समाज', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        { term: 'प्रविधि', color: 'bg-rose-50 text-rose-600 border-rose-100' }
    ];

    const searchNepaliWord = async (word: string) => {
        if (!word) return;
        setLoading(true);
        setResult(null);
        try {
            const prompt = `You are a high-accuracy Nepali dictionary. Explains the meaning and usage of the Nepali word: "${word}".
            Return the response in strictly JSON format. Provide the meaning, examples, synonyms, and antonyms IN NEPALI language:
            {
                "word": "Nepali word",
                "transliteration": "how to pronounce in english",
                "meaning": "primary meaning IN NEPALI",
                "partOfSpeech": "noun/verb etc IN NEPALI",
                "examples": ["example sentence 1 IN NEPALI", "example sentence 2 IN NEPALI"],
                "synonyms": ["synonym 1 IN NEPALI", "synonym 2 IN NEPALI"],
                "antonyms": ["antonym 1 IN NEPALI", "antonym 2 IN NEPALI"]
            }`;

            const res = await callCerebrasForMomo([{ role: 'user', content: prompt }], true);
            const data = JSON.parse(res || '{}');
            setResult(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 pb-24 bg-slate-50 z-[1001] flex flex-col items-center animate-fade-up overflow-y-auto">
            <ToolHeader 
                title="नेपाली शब्दकोश" 
                subtitle="Nepali Lexicon Matrix" 
                themeColor="amber" 
                onBack={() => navigate(-1)} 
            />

            <div className="w-full max-w-[620px] relative z-20 px-6 -mt-20 space-y-6">
                {!result && !loading && (
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl space-y-6 border border-white">
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest block px-1">शब्द खोजी (Nepali Word Search)</label>
                                <div className="relative border-b-2 border-amber-100 flex items-center py-2 focus-within:border-amber-500 transition-colors group">
                                    <input 
                                        type="text" 
                                        placeholder="Type Nepali word..." 
                                        className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none placeholder:text-slate-100 italic"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchNepaliWord(query)}
                                    />
                                    <button onClick={() => searchNepaliWord(query)} className="text-amber-500 hover:scale-110 transition-transform">
                                        <Search className="w-7 h-7" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">हालका शब्दहरू</h3>
                                <Sparkles className="w-3 h-3 text-amber-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {recentTerms.map((item) => (
                                    <button 
                                        key={item.term} 
                                        onClick={() => { setQuery(item.term); searchNepaliWord(item.term); }}
                                        className={cn("p-5 rounded-[2rem] border shadow-sm text-left group transition-all active:scale-95", item.color)}
                                    >
                                        <h4 className="text-2xl font-black mb-1">{item.term}</h4>
                                        <p className="font-black uppercase text-[0.55rem] tracking-widest opacity-60">अर्थ (Meaning)</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                         <div className="w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-amber-50">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin" />
                         </div>
                         <p className="text-amber-400 font-black uppercase tracking-[0.3em] text-[0.6rem]">शब्दकोश खोजी गर्दै...</p>
                    </div>
                )}

                {result && !loading && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                        <header className="pt-6">
                            <button onClick={() => setResult(null)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-md border border-amber-50">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-amber-50 space-y-6">
                            <div className="space-y-1">
                                <span className="text-amber-600 font-black uppercase tracking-[0.2em] text-[0.6rem]">{result.partOfSpeech}</span>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{result.word}</h2>
                                <p className="text-slate-400 font-mono italic text-sm">[{result.transliteration}]</p>
                            </div>

                            <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-50">
                                <label className="text-[0.6rem] font-black text-amber-600 uppercase tracking-widest block mb-2">अर्थ (Meaning)</label>
                                <p className="text-xl font-bold text-slate-800 leading-tight">{result.meaning}</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">प्रयोगका उदाहरणहरू (Examples)</label>
                                {result.examples?.map((ex: string, i: number) => (
                                    <p key={i} className="text-sm font-bold text-slate-600 italic border-l-2 border-amber-200 pl-4">{ex}</p>
                                ))}
                            </div>

                            {result.synonyms?.length > 0 && (
                                <div className="pt-4 space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">समानार्थी शब्द (Synonyms)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {result.synonyms.map((s: string) => (
                                            <span key={s} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.antonyms?.length > 0 && (
                                <div className="pt-4 space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">विपरीतार्थी शब्द (Antonyms)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {result.antonyms.map((a: string) => (
                                            <span key={a} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

/* ── ATTENDANCE TRACKER ── */
const AttendanceTracker = () => {
    const navigate = useNavigate();
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | null>>({});
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = today.toLocaleString('default', { month: 'long' });

    const toggleAttendance = (day: number) => {
        const key = `${day}`;
        setAttendance(prev => ({
            ...prev,
            [key]: prev[key] === 'present' ? 'absent' : 'present'
        }));
    };

    const presentCount = Object.values(attendance).filter(v => v === 'present').length;

    return (
        <div className="space-y-10 animate-fade-up pb-24">
            <header className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Attendance</h1>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Consistency Log</p>
                </div>
            </header>

            <div className="bg-white p-6 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <UserCheck className="w-48 h-48" />
                </div>
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">{monthName} {year}</h2>
                        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest leading-relaxed">TAP A DATE TO LOG PRESENCE</p>
                    </div>
                    <div className="bg-teal-50 px-6 py-3 rounded-2xl border border-teal-100 text-center">
                        <p className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest">Present</p>
                        <p className="text-2xl font-black text-teal-600 leading-none">{presentCount}</p>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 md:gap-4 max-w-lg mx-auto relative z-10">
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const status = attendance[day.toString()];
                        return (
                            <button 
                                key={i} 
                                onClick={() => toggleAttendance(day)}
                                className={cn(
                                    "aspect-square rounded-xl md:rounded-2xl flex items-center justify-center text-xs md:text-sm font-black transition-all border group",
                                    status === 'present' ? "bg-teal-500 text-white border-teal-600 shadow-lg shadow-teal-500/20" : 
                                    status === 'absent' ? "bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20" : 
                                    "bg-slate-50 text-slate-400 border-slate-100 hover:border-teal-200 shadow-sm"
                                )}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
                
                <div className="mt-10 flex gap-6 justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500 shadow-sm shadow-teal-500/40" />
                        <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/40" />
                        <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── FLASHCARDS APP ── */
const FlashcardApp = () => {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const cards = [
        { q: "Valency of Carbon?", a: "4 (Tetravalent). It forms 4 covalent bonds." },
        { q: "Newton's 2nd Law equation?", a: "F = ma (Force = Mass × Acceleration)." },
        { q: "pH of pure water?", a: "7 (Neutral)." },
        { q: "Mendel's First Law?", a: "Law of Segregation." },
        { q: "Symbol for Iron?", a: "Fe (Ferrum)." },
        { q: "Unit of Voltage?", a: "Volt (V)." }
    ];

    const next = () => {
        setFlipped(false);
        setTimeout(() => setIndex((index + 1) % cards.length), 200);
    };

    const prev = () => {
        setFlipped(false);
        setTimeout(() => setIndex((index - 1 + cards.length) % cards.length), 200);
    };

    return (
        <div className="space-y-10 animate-fade-up pb-24">
            <header className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Flashcards</h1>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Active Recall Desk</p>
                </div>
            </header>

            <div className="flex flex-col items-center gap-8">
                <div 
                    onClick={() => setFlipped(!flipped)}
                    className="w-full max-w-sm aspect-[4/5] perspective-1000 cursor-pointer"
                >
                    <div className={cn(
                        "relative w-full h-full text-center transition-all duration-500 transform-style-3d",
                        flipped ? "rotate-y-180" : ""
                    )}>
                        {/* Front */}
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col items-center justify-center p-12 space-y-8">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-[0.65rem] font-black text-slate-300 uppercase tracking-[0.4em]">Knowledge Spark {index + 1}</h3>
                            <p className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-tight">
                                {cards[index].q}
                            </p>
                            <div className="pt-4 flex flex-col items-center gap-2">
                                <Search className="w-5 h-5 text-slate-200 animate-pulse" />
                                <p className="text-[0.6rem] font-bold text-slate-300 uppercase tracking-widest">Tap to flip</p>
                            </div>
                        </div>
                        
                        {/* Back */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-linear-to-br from-indigo-900 to-slate-900 rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center p-12 space-y-8 text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/5 opacity-20 pointer-events-none" />
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10 relative z-10">
                                <BrainCircuit className="w-7 h-7" />
                            </div>
                            <h3 className="text-[0.65rem] font-black text-white/40 uppercase tracking-[0.4em] relative z-10">Scientific Accuracy</h3>
                            <p className="text-xl md:text-2xl font-black italic tracking-tighter leading-snug relative z-10">
                                {cards[index].a}
                            </p>
                            <div className="pt-4 flex flex-col items-center gap-2 relative z-10">
                                <p className="text-[0.6rem] font-bold text-white/30 uppercase tracking-widest">Tap to return</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button onClick={prev} className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue hover:scale-110 active:scale-95 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="px-6 py-3 bg-slate-900 rounded-2xl text-white font-black text-sm shadow-xl min-w-[100px] text-center">
                        {index + 1} <span className="opacity-40">/</span> {cards.length}
                    </div>
                    <button onClick={next} className="w-16 h-16 bg-white border border-slate-100 rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-blue hover:scale-110 active:scale-95 transition-all">
                        <ArrowLeft className="w-6 h-6 rotate-180" />
                    </button>
                </div>
            </div>
        </div>
    );
};

const WordCounterPage = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const readingTime = Math.ceil(words / 200);

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Word Counter</h1>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] text-center shadow-xs">
                    <div className="text-3xl font-black text-emerald-600 leading-none mb-1">{words}</div>
                    <div className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400">Words</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] text-center shadow-xs">
                    <div className="text-3xl font-black text-blue leading-none mb-1">{chars}</div>
                    <div className="text-[0.6rem] font-black uppercase tracking-widest text-blue-400">Chars</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] text-center shadow-xs">
                    <div className="text-3xl font-black text-amber-600 leading-none mb-1">{readingTime}</div>
                    <div className="text-[0.6rem] font-black uppercase tracking-widest text-amber-400">Min Read</div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste or type your essay here..."
                    className="w-full h-64 p-6 outline-none resize-none text-slate-700 font-medium leading-relaxed bg-transparent"
                />
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400">Real-time analysis</span>
                    <button 
                        onClick={() => setText('')}
                        className="text-xs font-black uppercase tracking-wider text-rose-500 hover:text-rose-600"
                    >
                        Clear Text
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── SUBJECT DETAIL ── */
const SubjectDetail = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];
    const Icon = config.icon;

    const sections = [
        { id: 'chapters', label: 'Study Chapters', icon: Book, color: 'bg-emerald-50 text-emerald-600', count: '12 Units' },
        { id: 'book', label: 'Digital Textbook', icon: Library, color: 'bg-cyan-50 text-cyan-600', count: 'Official PDF' },
        { id: 'videos', label: 'Video Tutorials', icon: PlayCircle, color: 'bg-rose-50 text-rose-600', count: '45+ Videos' },
        { id: 'pdfs', label: 'Note Archives', icon: FileText, color: 'bg-blue-50 text-blue-600', count: '10 PDFs' },
        { id: 'notes', label: 'Shared Notes', icon: Edit3, color: 'bg-amber-50 text-amber-600', count: 'Community' },
        { id: 'model', label: 'Model Questions', icon: ListChecks, color: 'bg-indigo-50 text-indigo-600', count: '2083 Pattern' }
    ];

    const handleSectionClick = (sectionId: string) => {
        navigate(`/hub/${name}/${sectionId === 'book' ? 'textbooks' : sectionId}`);
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24 text-[#020617]">
            <header className="flex items-center justify-between">
                <button onClick={() => navigate('/hub')} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className={cn("px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest", `bg-${config.color}-50 text-${config.color}-600`)}>
                    Active Subject Hub
                </div>
            </header>

            <div className={cn("p-10 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl bg-linear-to-br", config.gradient)}>
                <div className="relative z-10 space-y-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">{name}</h1>
                        <p className="text-[0.7rem] font-black text-white/60 uppercase tracking-widest">Mastery Level: 45%</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Icon className="w-48 h-48 -rotate-12 translate-x-12 -translate-y-12" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {sections.map(Section => (
                    <button 
                        key={Section.id} 
                        onClick={() => handleSectionClick(Section.id)}
                        className="bg-white p-7 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:border-blue hover:shadow-xl"
                    >
                        <div className="flex items-center gap-5">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", Section.color)}>
                                <Section.icon className="w-7 h-7" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-slate-800 text-lg tracking-tight uppercase leading-none">{Section.label}</h3>
                                <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest mt-1">{Section.count}</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                ))}
            </div>
            
            <div className="mt-8">
                <button 
                    onClick={() => navigate(`/hub/${name}/mcq-sets`)}
                    className={cn(
                        "w-full p-8 rounded-[3rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all text-white bg-linear-to-br",
                        config.gradient
                    )}
                >
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                            <PenTool className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">MCQ's Test</h3>
                            <p className="text-[0.65rem] font-black text-white/60 uppercase tracking-widest mt-2">Curated Exam Sets (Admin)</p>
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-blue transition-all">
                        <Zap className="w-6 h-6 text-white group-hover:text-amber-500 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    </div>
                </button>
            </div>
        </div>
    );
};

/* ── MCQ SET SELECTION ── */
const MCQTestSelection = () => {
    const { name } = useParams();
    const { liveMaterials } = useApp();
    const navigate = useNavigate();
    const [useTimer, setUseTimer] = useState(true);
    const [questionCount, setQuestionCount] = useState(30);
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];
    
    const staticSets: any[] = [];
    const dynamicSets = liveMaterials
        .filter(m => m.subject === name && m.type === 'mcq')
        .map(m => {
            try {
                return JSON.parse(m.text_content);
            } catch (e) {
                console.error("Failed to parse MCQ JSON:", e);
                return null;
            }
        })
        .filter(Boolean);

    const sets = [...staticSets, ...dynamicSets];

    return (
        <div className="space-y-10 animate-fade-up pb-24">
            <header className="flex items-center justify-between">
                <button onClick={() => navigate(`/hub/${name}`)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[0.6rem] font-black uppercase tracking-widest">
                    Select MCQ Set
                </div>
            </header>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-tight">{name} Tests</h1>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em]">Verified Official Question Sets</p>
                </div>
                
                <button 
                    onClick={() => setUseTimer(!useTimer)}
                    className={cn(
                        "flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all",
                        useTimer ? "bg-amber-50 text-amber-600 border border-amber-200" : "bg-slate-100 text-slate-400 border border-slate-200"
                    )}
                >
                    <Timer className={cn("w-4 h-4", useTimer ? "animate-pulse" : "")} />
                    Timer: {useTimer ? "Enabled" : "Disabled"}
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <label className="text-[0.65rem] font-black uppercase text-slate-400 block tracking-widest text-center">Select Number of Questions</label>
                <div className="flex gap-3 max-w-sm mx-auto">
                    {[5, 10, 20, 30].map((c) => (
                        <button
                            key={c}
                            onClick={() => setQuestionCount(c)}
                            className={cn(
                                "flex-1 py-3 rounded-2xl border-2 font-black text-xs md:text-sm transition-all",
                                questionCount === c 
                                    ? `text-white border-transparent bg-linear-to-br ${config.gradient} shadow-lg shadow-${config.color}-500/20` 
                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {sets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {sets.map((set, idx) => (
                        <button 
                            key={idx}
                            onClick={() => navigate(`/hub/${name}/mcq-test/${idx}?timer=${useTimer}&count=${questionCount}`)}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center justify-between group hover:border-blue transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl group-hover:scale-110 transition-transform bg-linear-to-br", config.gradient, "text-white")}>
                                    {idx + 1}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{set.setName}</h3>
                                    <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest mt-2">{set.questions.length} Questions • 30 Mins</p>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue group-hover:text-white transition-all">
                                <Play className="w-5 h-5 fill-current" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">Coming Soon</h3>
                        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mt-1 max-w-xs mx-auto">Admin is preparing verified MCQ sets for {name}. Please check back later!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── MCQ TEST PLAYER ── */
const MCQTestPlayer = () => {
    const { name, setIndex } = useParams();
    const { data, liveMaterials } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'quiz' | 'result'>('quiz');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    
    const isTimerEnabled = searchParams.get('timer') !== 'false';
    const countParam = parseInt(searchParams.get('count') || '30');
    
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];

    const staticSets: any[] = STATIC_MCQS[name as string] || [];
    const dynamicSets = liveMaterials
        .filter(m => m.subject === name && m.type === 'mcq')
        .map(m => {
            try { return JSON.parse(m.text_content); } catch (e) { return null; }
        })
        .filter(Boolean);

    const allSets = [...staticSets, ...dynamicSets];
    const setData = allSets[parseInt(setIndex || '0')];

    // 1 minute per question for timer
    const [timer, setTimer] = useState(countParam * 60); 
    const { addTestResult } = useApp();

    // Slice questions array up to the requested count
    const questions = (setData?.questions || []).slice(0, countParam);

    useEffect(() => {
        if (status === 'quiz' && isTimerEnabled && timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else if (isTimerEnabled && timer === 0 && status === 'quiz') {
            setStatus('result');
        }
    }, [status, timer, isTimerEnabled]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!setData) return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
            <Bot className="w-16 h-16 text-blue pb-4 animate-bounce" />
            <h1 className="text-2xl font-black uppercase text-slate-800">Initializing Intelligence Test</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Constructing Query Node...</p>
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Go Back</button>
        </div>
    );

    const score = questions.reduce((acc: number, q: any, idx: number) => {
        return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);

    const timeTaken = (countParam * 60) - timer;

    useEffect(() => {
        if (status === 'result') {
            addTestResult(score, questions.length, timeTaken);
        }
    }, [status]);

    return (
        <div className="animate-fade-up pb-24">
            {status === 'quiz' ? (
                <div className="space-y-6 md:space-y-8">
                    <header className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", config.gradient)}>
                                {isTimerEnabled ? <Timer className="w-5 h-5 animate-pulse" /> : <ClipboardCheck className="w-5 h-5" />}
                            </div>
                            <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-slate-900 tabular-nums">
                                {isTimerEnabled ? formatTime(timer) : "Practice Mode"}
                            </div>
                        </div>
                        <button 
                            onClick={() => { if(confirm("End test?")) setStatus('result'); }}
                            className="px-5 py-2 bg-rose-500 text-white rounded-xl font-black text-[0.6rem] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                        >
                            End Test
                        </button>
                    </header>

                    <div className="grid grid-cols-10 gap-1 overflow-x-auto pb-4 scrollbar-hide">
                        {questions.map((_: any, idx: number) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentIdx(idx)}
                                className={cn(
                                    "w-9 h-9 rounded-lg font-black text-[0.6rem] transition-all border shrink-0",
                                    currentIdx === idx ? "bg-slate-900 text-white border-slate-900 scale-105" : 
                                    answers[idx] ? "bg-blue/10 text-blue border-blue/20" : "bg-white text-slate-400 border-slate-100"
                                )}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white p-5 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-2 md:border-4 border-slate-50 shadow-2xl space-y-6 md:space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <GraduationCap className="w-32 h-32" />
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[0.55rem] font-black uppercase tracking-widest">
                                Q {currentIdx + 1} / {questions.length}
                            </span>
                            <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight italic tracking-tighter uppercase whitespace-pre-wrap">
                                {questions[currentIdx].q}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:gap-4 relative z-10">
                            {['a', 'b', 'c', 'd'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: opt }))}
                                    className={cn(
                                        "p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 text-left transition-all flex items-center gap-4 md:gap-5 group active:scale-95",
                                        answers[currentIdx] === opt ? 
                                        "bg-blue border-blue shadow-lg translate-x-1 md:translate-x-2" : 
                                        "bg-slate-50 border-transparent hover:border-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center font-black uppercase transition-all shadow-sm",
                                        answers[currentIdx] === opt ? "bg-white text-blue" : "bg-white text-slate-400 group-hover:scale-110"
                                    )}>
                                        {opt}
                                    </div>
                                    <span className={cn(
                                        "font-bold text-base md:text-lg",
                                        answers[currentIdx] === opt ? "text-white" : "text-slate-600"
                                    )}>
                                        {questions[currentIdx][opt as 'a'|'b'|'c'|'d']}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3 md:gap-4 pt-6 md:pt-10">
                            <button 
                                disabled={currentIdx === 0}
                                onClick={() => setCurrentIdx(prev => prev - 1)}
                                className="flex-1 py-4 md:py-5 bg-slate-100 text-slate-400 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[0.6rem] disabled:opacity-50"
                            >
                                Back
                            </button>
                            {currentIdx === questions.length - 1 ? (
                                <button 
                                    onClick={() => setStatus('result')}
                                    className="flex-3 py-4 md:py-5 bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[0.6rem] shadow-lg shadow-emerald-500/20"
                                >
                                    Finish
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentIdx(prev => prev + 1)}
                                    className="flex-3 py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[0.6rem] shadow-lg shadow-slate-900/20"
                                >
                                    Continue
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-md mx-auto space-y-8 text-center pt-10">
                    <div className="relative inline-block">
                        <div className={cn("w-32 h-32 rounded-[3rem] p-1 animate-pulse bg-linear-to-br", config.gradient)}>
                            <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center">
                                <Trophy className="w-16 h-16 text-amber-500" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">Evaluation</h1>
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Score Data Synced to Profile</p>
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-6">
                        <div className="flex justify-center items-baseline gap-2">
                            <span className="text-7xl font-black text-slate-900 tracking-tighter italic">{score}</span>
                            <span className="text-2xl font-black text-slate-300">/ {questions.length}</span>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full transition-all duration-1000", config.gradient)} 
                                style={{ width: `${(score / questions.length) * 100}%` }} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-xl font-black text-slate-800 italic tracking-tighter leading-none">{Math.round((score / questions.length) * 100)}%</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time Remaining</p>
                                <p className="text-xl font-black text-slate-800 italic tracking-tighter leading-none">{formatTime(timer)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button onClick={() => setStatus('quiz')} className={cn("w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl", config.gradient)}>Retake Intelligence Test</button>
                        <button onClick={() => navigate(`/hub/${name}`)} className="w-full py-6 bg-linear-to-r from-rose-500 to-pink-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-lg shadow-rose-500/20 group flex items-center justify-center gap-3">
                            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Return to Hub
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── PROFILE PAGE ── */
const ProfilePage = () => {
    const { user } = useApp();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // Local cleanup only
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        } catch (e) {
            console.error("Logout error", e);
        }
    };

    // Admin logic
    const adminEmails = ['admin@aadhar.edu.np', 'subashgautam305@gmail.com', 'gopanigautam96@gmail.com'];
    const isAdmin = user?.email && (
        adminEmails.map(e => e.toLowerCase()).includes(user.email.toLowerCase()) || 
        user.email.toLowerCase().includes('ashish')
    );

    const stats = [
        { val: (user?.xp || 0).toLocaleString(), label: 'Total XP', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        { val: (user?.streak || 0) + ' Days', label: 'Current Streak', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50' },
        { val: user?.testsCompleted || 0, label: 'Tests Done', icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
        { val: (user?.avgScore || 0).toFixed(1) + '%', label: 'Avg. Accuracy', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { val: 'Rank #12', label: 'Global Board', icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { val: user?.completedChapters?.length || 0, label: 'Module Master', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' }
    ];

    return (
        <div className="space-y-10 animate-fade-up pb-32 max-w-4xl mx-auto">
            <header className="flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    {isAdmin && (
                        <button 
                            onClick={() => navigate('/admin-portal')}
                            className="p-3 bg-slate-800 rounded-xl text-white shadow-lg active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Lock className="w-4 h-4" /> Hub Maintenance
                        </button>
                    )}
                    <button className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-blue transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="relative group">
                        <div className="w-40 h-40 rounded-[3rem] p-1.5 bg-linear-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform">
                            <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <UserIcon className="w-16 h-16 text-slate-200" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white rotate-12">
                            <Sparkles className="w-6 h-6" />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{user?.name}</h1>
                        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] font-mono">{user?.email}</p>
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-indigo-100 italic">
                             Grade 10 • SEE 2083 Standard Batch
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12 relative z-10">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center space-y-3 group hover:border-blue transition-all">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", s.bg)}>
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{s.val}</p>
                                <p className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest mt-1.5">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Hall of Badges</h2>
                    <span className="text-[0.55rem] font-black text-blue uppercase tracking-widest">View All</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {user?.badges.map((b: string) => (
                        <div key={b} className="bg-slate-900 rounded-[2.5rem] p-6 text-white flex flex-col items-center text-center gap-3 shadow-xl group hover:scale-[1.03] transition-transform cursor-pointer overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center relative z-10">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-[0.7rem] font-black tracking-tight leading-none mb-1 uppercase italic">{b}</h3>
                                <p className="text-[0.45rem] font-bold text-white/40 uppercase tracking-widest leading-none">Legendary</p>
                            </div>
                        </div>
                    ))}
                    {/* Placeholder for expansion */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-2 text-slate-300">
                        <Plus className="w-6 h-6" />
                        <span className="text-[0.5rem] font-black uppercase tracking-widest">Unlock More</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-6">
                <button 
                    onClick={() => navigate('/hub')}
                    className="w-full flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                            <Bookmark className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Study Planner</p>
                            <p className="text-sm font-black uppercase italic tracking-tighter text-slate-900">Bookmarked Chapters</p>
                        </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-slate-200 group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                    onClick={handleLogout}
                    className="w-full py-6 bg-rose-50 text-rose-500 rounded-[2.5rem] border border-rose-100 font-black uppercase tracking-widest text-[0.6rem] hover:bg-rose-100 transition-colors shadow-sm active:scale-[0.98]"
                >
                    Terminal Session / Log Out
                </button>
            </div>
        </div>
    );
};

/* ── STUDY HUB & SUBJECTS ── */
const StudyHub = () => {
    const { data } = useApp();
    const navigate = useNavigate();

    const compulsory = ['English', 'नेपाली', 'Maths', 'Science', 'सामाजिक'];
    
    const renderSubject = (name: string, sub: any, i: number) => {
        const config = SUBJECTS_CONFIG[name as SubjectType] || { color: 'slate', icon: BookOpen, gradient: 'from-slate-500 to-slate-700' };
        const Icon = config.icon;
        return (
            <motion.button
                key={name}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/hub/${name}`)}
                className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all text-left relative overflow-hidden"
            >
                <div className={cn("absolute -right-8 -top-8 w-32 h-32 bg-linear-to-br opacity-5 rounded-full blur-2xl pointer-events-none group-hover:opacity-10 group-hover:scale-150 transition-all duration-700", config.gradient)} />
                <div className={cn("w-20 h-20 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl group-hover:rotate-6 group-active:scale-95 transition-all duration-500 bg-linear-to-br text-white", config.gradient)}>
                    <Icon className="w-10 h-10 drop-shadow-md" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic mb-2 group-hover:text-slate-900 transition-colors truncate">{name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[0.6rem] font-black uppercase tracking-widest text-slate-500 group-hover:bg-white group-hover:border-slate-200 transition-colors shrink-0">{sub.chapters.length} Units</span>
                        <span className="px-3 py-1 rounded-lg bg-blue-50/50 border border-blue-100/50 text-[0.6rem] font-black uppercase tracking-widest text-blue-600 shrink-0">Updated</span>
                    </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-800 group-hover:shadow-lg group-hover:-rotate-45 transition-all duration-500 shrink-0">
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                </div>
            </motion.button>
        );
    };

    return (
        <div className="space-y-12 animate-fade-up pb-32">
            <header className="space-y-1 px-4 md:px-2">
                <h1 className="text-4xl sm:text-5xl md:text-6xl max-w-full font-black text-[#020617] italic tracking-tighter uppercase leading-none break-keep whitespace-nowrap">Study Hub</h1>
            </header>

            <div className="space-y-10">
                <section className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-[2px] flex-1 bg-linear-to-r from-blue/20 to-transparent" />
                        <h2 className="text-[0.8rem] font-black text-blue uppercase tracking-[0.2em] italic">Anibarya / Compulsory Subjects</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Object.entries(data.subjects)
                            .filter(([name]) => compulsory.includes(name))
                            .map(([name, sub], i) => renderSubject(name, sub, i))}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-4 px-4">
                        <div className="h-[2px] flex-1 bg-linear-to-r from-purple-500/20 to-transparent" />
                        <h2 className="text-[0.7rem] font-black text-purple-500 uppercase tracking-[0.3em]">Optional Subjects</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Object.entries(data.subjects)
                            .filter(([name]) => !compulsory.includes(name))
                            .map(([name, sub], i) => renderSubject(name, sub, i))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const ChapterList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    const dynamicChapters = liveMaterials.filter(m => m.subject === name && m.type === 'chapter');
    const allChapters = [...(sub?.chapters || []), ...dynamicChapters];

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Learning Modules</h1>
            </div>

            <div className="space-y-4">
                {allChapters.map((ch: any, i: number) => (
                    <button
                        key={ch.id}
                        onClick={() => navigate(`/hub/${name}/chapters/${ch.id}`)}
                        className="w-full bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl hover:border-blue transition-all active:scale-95"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 group-hover:bg-blue group-hover:text-white transition-colors">
                                {i + 1}
                            </div>
                    <div className="text-left">
                        <h2 className="font-black text-slate-800 tracking-tight leading-none mb-2 text-lg">{ch.title}</h2>
                        <div className="flex flex-wrap gap-2">
                             {(ch.topics || '').split(',').slice(0, 2).map((t: string) => (
                                 <span key={t} className="text-[0.55rem] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{t.trim()}</span>
                             ))}
                        </div>
                    </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.6rem] font-black text-blue px-3 py-1 bg-blue/5 rounded-full uppercase tracking-widest">{ch.marks || 0} Marks</span>
                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const ChapterDetail = () => {
    const { name, chapterId } = useParams();
    const { data, liveMaterials, user, toggleChapterComplete } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string] || Object.values(data.subjects)[0];
    const chapter = sub?.chapters?.find((c: any) => c.id === chapterId) || liveMaterials?.find(m => m.id === chapterId);

    if (!chapter) return <div className="p-10 text-center font-black uppercase text-slate-400">Module entry not found in active registry</div>;

    const isCompleted = user?.completedChapters?.includes(chapterId || '');

    const topicsList = (chapter.topics || '').split(',').filter(Boolean);

    return (
        <div className="space-y-8 animate-fade-up pb-24 text-slate-800">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 line-clamp-1">{chapter.title}</h1>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                    <p className="text-[0.65rem] font-black uppercase text-blue border-l-2 border-blue pl-4 mb-4 tracking-[0.3em]">Knowledge Module • {chapter.marks || 0} Weightage</p>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-tight mb-6 uppercase">Target Knowledge Nodes</h2>
                    <div className="flex flex-wrap gap-2">
                        {topicsList.length > 0 ? topicsList.map((t: string) => (
                            <span key={t} className="px-5 py-2 bg-white/10 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 italic">
                                {t.trim()}
                            </span>
                        )) : (
                            <span className="text-slate-500 font-black uppercase text-[0.6rem] tracking-widest">General Curriculum Mastery</span>
                        )}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            </div>

            <div className="p-8 sm:p-12 bg-white rounded-[3rem] border border-slate-100 shadow-xl prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:font-bold prose-p:text-slate-500 leading-relaxed min-h-[300px]">
                {chapter.file_url && chapter.file_url.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center shadow-lg border border-rose-100">
                             <FileText className="w-12 h-12" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic mb-2">Rich PDF Asset Ready</h3>
                            <p className="text-[0.7rem] text-slate-400 font-black uppercase tracking-widest mb-6 max-w-xs mx-auto">This module contains a proprietary specification document.</p>
                            <a href={chapter.file_url} target="_blank" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
                                <Download className="w-4 h-4" />
                                Initiate Transfer
                            </a>
                        </div>
                    </div>
                ) : (
                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                        {chapter.text_content || chapter.description || chapter.contentHtml || '# Module Content Pending\nDeep-dive documentation for this unit is being synced. Please check back in a few moments for the complete curriculum roadmap.'}
                    </Markdown>
                )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                <button 
                    onClick={() => navigate('/ai')}
                    className="flex-1 bg-blue text-white p-6 rounded-[2.5rem] shadow-2xl shadow-blue/20 flex items-center justify-between group active:scale-95 transition-all"
                >
                    <div className="text-left">
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Stuck on this module?</p>
                        <p className="text-lg font-black uppercase italic tracking-tighter">Ask Aadhar Pro</p>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <Zap className="w-5 h-5" />
                    </div>
                </button>
                
                <button 
                    onClick={() => toggleChapterComplete(chapterId || '')}
                    className={cn(
                        "flex-1 p-6 rounded-[2.5rem] flex items-center justify-between group active:scale-95 transition-all border-2",
                        isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-100 text-slate-400"
                    )}
                >
                    <div className="text-left">
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">Status</p>
                        <p className="text-lg font-black uppercase italic tracking-tighter">
                            {isCompleted ? 'Module Sync OK' : 'Mark Complete'}
                        </p>
                    </div>
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
                        isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-300 group-hover:scale-110"
                    )}>
                        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                </button>
            </div>
        </div>
    );
};

const VideoList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    const dynamicVideos = liveMaterials.filter(m => m.subject === name && m.type === 'video');

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Explainer TV</h1>
            </div>

            <div className="space-y-6">
                {/* Dynamic Videos */}
                {dynamicVideos.map((v: any) => {
                    const yId = v.youtube_id || extractYoutubeId(v.file_url || v.link_url);
                    const thumbUrl = yId ? `https://img.youtube.com/vi/${yId}/maxresdefault.jpg` : null;
                    
                    return (
                        <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                            <div className="relative aspect-video bg-slate-900 group-hover:scale-105 transition-transform duration-700 overflow-hidden">
                                {yId ? (
                                    <>
                                        <img src={thumbUrl!} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <button onClick={() => window.open(`https://youtube.com/watch?v=${yId}`)} className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                                <PlayCircle className="w-10 h-10 fill-current" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                        <button onClick={() => window.open(v.file_url || v.link_url)} className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                            <PlayCircle className="w-10 h-10 fill-current" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="p-8">
                                <p className="text-[0.6rem] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> New Upload
                                </p>
                                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight italic">{v.title}</h3>
                                <p className="text-[0.75rem] text-slate-400 font-black uppercase tracking-widest">Aadhar Hub • {yId ? 'External Stream' : 'Official Asset'}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Initial Videos */}
                {sub.videos.map((v: any) => (
                    <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden group">
                        <div className="relative aspect-video bg-slate-900 group-hover:scale-105 transition-transform duration-700">
                             <img src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`} className="w-full h-full object-cover opacity-60" referrerPolicy="no-referrer" />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <button onClick={() => window.open(`https://youtube.com/watch?v=${v.youtubeId}`)} className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                     <PlayCircle className="w-10 h-10 fill-current" />
                                 </button>
                             </div>
                             <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[0.65rem] font-black px-3 py-1 rounded-lg tracking-widest">
                                 {v.duration}
                             </div>
                        </div>
                        <div className="p-8">
                             <p className="text-[0.6rem] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                 <TrendingUp className="w-3 h-3" /> Trending Mastery
                             </p>
                             <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight uppercase tracking-tight">{v.title}</h3>
                             <p className="text-[0.75rem] text-slate-400 font-black uppercase tracking-widest">Aadhar Education • Verified Partner</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PdfList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    const dynamicPdfs = liveMaterials.filter(m => m.subject === name && m.type === 'note_archive');

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Archives</h1>
            </div>

            <div className="space-y-4">
                {/* Dynamic Content */}
                {dynamicPdfs.length > 0 ? dynamicPdfs.map((p: any) => (
                    <div 
                        key={p.id} 
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-blue transition-all"
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                            <Archive className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase mb-1 italic">{p.title}</h3>
                            <p className="text-[0.65rem] text-blue-400 font-bold leading-relaxed uppercase tracking-widest">Digital Archive • Vault Node</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => window.open(p.file_url || p.link_url, '_blank')} className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-blue-100 hover:bg-blue-100">
                                <Eye className="w-5 h-5" />
                            </button>
                            <a href={p.file_url || p.link_url} download target="_blank" className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-blue-500/10 hover:bg-blue-600">
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
                        <Archive className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-800 uppercase">Archive Empty</h2>
                        <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Resources will be added soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const NoteList = () => {
    const { name } = useParams();
    const { liveMaterials } = useApp();
    const navigate = useNavigate();

    const sharedNotes = [
        { 
            id: 'master-1', 
            title: 'SEE Board Exam Blueprint', 
            subject: name, 
            type: 'shared_note', 
            text_content: '### Exam Preparation Guide\n1. Focus on high weightage chapters\n2. Practice past year questions\n3. Review experimental diagrams\n4. Manage time effectively during exams\n5. Master diagram-based questions in Science\n6. Focus on Grammar and Creative Writing for English', 
            created_at: new Date().toISOString() 
        },
        ...liveMaterials.filter((m: any) => m.subject === name && m.type === 'shared_note')
    ];
    const simpleNotes = liveMaterials.filter((m: any) => m.subject === name && m.type === 'note');

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Repository</h1>
            </div>

            <div className="space-y-6">
                {/* SHARED MARKDOWN NOTES */}
                {sharedNotes.map((n: any) => (
                    <div key={n.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                        <div className="bg-slate-900 p-6 flex justify-between items-center">
                            <h3 className="text-white font-black uppercase text-sm tracking-widest truncate flex-1">{n.title}</h3>
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="prose prose-slate max-w-none text-sm font-bold leading-relaxed">
                                <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                    {n.text_content}
                                </Markdown>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[0.6rem] font-bold">A</div>
                                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Official Tutor Share</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {n.file_url && (
                                        <a href={n.file_url} download target="_blank" className="text-blue-500 hover:text-blue-600 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                    <span className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* SIMPLE FILE NOTES */}
                {simpleNotes.map((n: any) => (
                    <div 
                        key={n.id} 
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-emerald-500 transition-all"
                    >
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                            <PenTool className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase mb-1">{n.title}</h3>
                            <p className="text-[0.65rem] text-emerald-400 font-bold leading-relaxed uppercase tracking-widest">Handwritten Note • Shared Legacy</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => window.open(n.file_url, '_blank')} className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-blue-100 hover:bg-blue-100">
                                <Eye className="w-5 h-5" />
                            </button>
                            <a href={n.file_url} download target="_blank" className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-emerald-500/10 hover:bg-emerald-600">
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                ))}

                {sharedNotes.length === 0 && simpleNotes.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">No external notes yet</h2>
                        <p className="text-[0.75rem] text-slate-400 font-bold max-w-[240px] mx-auto mt-2 leading-relaxed uppercase tracking-widest">Contribute your notes to earn XP for your district rank.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ModelList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    const dynamicModels = liveMaterials.filter(m => m.subject === name && m.type === 'model_question');

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Model Questions</h1>
            </div>

            <div className="space-y-4">
                {/* Dynamic Content */}
                {dynamicModels.length > 0 ? dynamicModels.map((m: any) => (
                    <div 
                        key={m.id} 
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-indigo-500 transition-all font-sans"
                    >
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 transition-transform">
                            {m.file_url?.toLowerCase().endsWith('.png') || m.file_url?.toLowerCase().endsWith('.jpg') ? <GalleryVertical className="w-8 h-8" /> : <ClipboardCheck className="w-8 h-8" />}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase mb-1">{m.title}</h3>
                            <p className="text-[0.65rem] text-indigo-400 font-black leading-relaxed uppercase tracking-widest">Board Standard • 2083 Blueprint</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <button onClick={() => window.open(m.file_url || m.link_url, '_blank')} className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-indigo-100 hover:bg-indigo-100">
                                <Eye className="w-5 h-5" />
                            </button>
                            <a href={m.file_url || m.link_url} download target="_blank" className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-indigo-500/10 hover:bg-indigo-600">
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
                        <Edit3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-800 uppercase">Bank Empty</h2>
                        <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Model sets are being developed.</p>
                    </div>
                )}

                {/* Static Content removal check */}
            </div>
        </div>
    );
};

/** ── GOOGLE DRIVE UTILITY ── */
const getDirectPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([^\/]+)/);
        if (match && match[1]) {
            // Using a different proxy with a cache buster to avoid 408 timeouts
            const googleUrl = `https://drive.google.com/uc?export=download&id=${match[1]}&t=${Date.now()}`;
            return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(googleUrl)}`;
        }
    }
    return url;
};

const getPreviewUrl = (url: string) => {
    if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([^\/]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
    }
    return url;
};

/** ── BOOK VIEWER COMPONENT ── */
const BookViewer = ({ isOpen, onClose, url, title }: { isOpen: boolean; onClose: () => void; url: string; title: string }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loadError, setLoadError] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setLoadError(false);
    };

    const directUrl = getDirectPdfUrl(url);
    const previewUrl = getPreviewUrl(url);

    const paginate = (newDirection: number) => {
        if (!numPages) return;
        const nextPage = pageNumber + newDirection;
        if (nextPage >= 1 && nextPage <= numPages) {
            setPageNumber(nextPage);
        }
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2001] flex flex-col bg-slate-50 select-none overflow-hidden"
            >
                {/* Immersive Header */}
                <div 
                    className="flex items-center justify-between px-6 py-4 md:px-10 md:py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[120] shrink-0"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Book className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[0.8rem] md:text-lg font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px] md:max-w-2xl italic leading-tight">{title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[0.55rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">
                                    {numPages ? `${numPages} Digital Frames Synchronized` : 'Initiating Optical Stream'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button 
                            onClick={() => window.open(url, '_blank')}
                            className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100 active:scale-95 shadow-sm"
                        >
                            <ExternalLink className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 active:scale-95 group shadow-sm"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar for Loading Entire Document */}
                {!numPages && !loadError && (
                    <div className="w-full h-1 bg-slate-100 overflow-hidden shrink-0">
                        <motion.div 
                            className="h-full bg-indigo-500"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                )}

                {/* Vertical Scroll Viewer Shell */}
                <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-slate-100/50 flex flex-col items-center py-8 md:py-12 scroll-smooth custom-scrollbar">
                    {loadError ? (
                        <div className="w-full h-full max-w-5xl px-6 relative z-10">
                            <iframe 
                                src={previewUrl} 
                                className="w-full h-[85vh] rounded-[2rem] shadow-2xl border-none bg-white"
                                title="Cloud Relay Viewer"
                            />
                        </div>
                    ) : (
                        <Document
                            file={directUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={() => setLoadError(true)}
                            loading={
                                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
                                    <div className="relative">
                                        {/* Aesthetic Loader */}
                                        <div className="w-24 h-24 rounded-full border-2 border-indigo-50 animate-pulse flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full border-t-2 border-indigo-500 animate-spin" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="w-7 h-7 text-indigo-200 animate-bounce" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="text-[0.7rem] font-bold text-slate-800 uppercase tracking-[0.5em] animate-pulse">Syncing Archive</h4>
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Optimizing high-def frames</span>
                                        </div>
                                    </div>
                                </div>
                            }
                            className="flex flex-col items-center gap-8 md:gap-16 w-full"
                        >
                            {numPages && Array.from(new Array(numPages), (_, index) => (
                                <motion.div
                                    key={`page_${index + 1}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ margin: "100px 0px" }}
                                    className="relative px-4"
                                >
                                    <div className="relative group">
                                        <Page 
                                            pageNumber={index + 1} 
                                            width={Math.min(window.innerWidth * 0.92, 850)}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={true}
                                            className="shadow-[0_10px_40px_rgba(30,41,59,0.05)] md:shadow-[0_40px_100px_rgba(30,41,59,0.08)] rounded-xl md:rounded-3xl overflow-hidden border border-white/50 transition-transform duration-700 bg-white"
                                            loading={
                                                <div className="bg-white/50 animate-pulse rounded-xl md:rounded-3xl h-[400px] md:h-[1100px] flex items-center justify-center">
                                                    <div className="w-8 h-8 rounded-full border-b-2 border-indigo-200 animate-spin" />
                                                </div>
                                            }
                                        />
                                        <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none hidden md:flex">
                                            <span className="text-[0.6rem] font-black text-slate-300 vertical-text uppercase tracking-[0.4em] rotate-180">Node Frame {index + 1}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-8 flex justify-center">
                                        <div className="px-5 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
                                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{index + 1} / {numPages}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </Document>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const DigitalTextbookList = () => {
    const { name } = useParams();
    const { liveMaterials } = useApp();
    const navigate = useNavigate();
    const [viewer, setViewer] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });

    const staticLink = BOOK_LINKS[name as string];
    const dynamicBooks = liveMaterials.filter(m => m.subject === name && m.type === 'digital_textbook');
    const subjectConfig = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];

    return (
        <div className="fixed inset-0 z-[1001] bg-slate-50 flex flex-col overflow-y-auto animate-fade-up">
            {/* Immersive Header inspired by Dictionary */}
            <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 space-y-4">
                <div className="flex items-center gap-5">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-tight">{name} Vault</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Curated Educational Archive</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-32">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
                    {/* Main Static Textbook */}
                    {staticLink && (
                        <button 
                            onClick={() => setViewer({ isOpen: true, url: staticLink, title: `${name} Textbook` })}
                            className="group relative flex flex-col items-center justify-center aspect-[4/5] bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:translate-y-[-5px] transition-all duration-500 overflow-hidden text-center"
                        >
                            <div className={`absolute inset-0 bg-linear-to-br opacity-[0.03] group-hover:opacity-[0.1] transition-opacity ${subjectConfig.gradient}`} />
                            
                            <div className={`w-16 h-16 md:w-20 md:h-20 ${
                                subjectConfig.color === 'blue' ? 'bg-[#40C9FF]' : 
                                subjectConfig.color === 'purple' ? 'bg-[#BD7AF5]' :
                                subjectConfig.color === 'red' ? 'bg-[#FF7A8A]' :
                                subjectConfig.color === 'emerald' ? 'bg-[#4ADE80]' :
                                subjectConfig.color === 'amber' ? 'bg-[#FBBF24]' :
                                subjectConfig.color === 'indigo' ? 'bg-[#818CF8]' :
                                subjectConfig.color === 'orange' ? 'bg-[#FB923C]' :
                                'bg-[#22D3EE]'
                            } rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 relative z-10 group-hover:scale-110`}>
                                {React.createElement(subjectConfig.icon, { className: "w-8 h-8 md:w-10 md:h-10 text-white" })}
                            </div>
                            
                            <div className="relative z-10 mt-6 px-4">
                                <h3 className="text-[0.7rem] font-black uppercase tracking-[0.1em] text-slate-400 group-hover:text-slate-900 transition-colors">Vol 1.0</h3>
                                <p className="text-[0.55rem] font-bold text-slate-300 uppercase mt-1">Official Publication</p>
                            </div>
                        </button>
                    )}

                    {/* Secondary Link Books */}
                    {dynamicBooks.map((b) => (
                        <button 
                            key={b.id}
                            onClick={() => setViewer({ isOpen: true, url: b.link_url || b.file_url, title: b.title })}
                            className="group relative flex flex-col items-center justify-center aspect-[4/5] bg-white rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] hover:translate-y-[-5px] transition-all duration-500 overflow-hidden text-center"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-purple-600 opacity-[0.03] group-hover:opacity-[0.1] transition-opacity" />
                            
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-xl transition-all duration-500 relative z-10 group-hover:scale-110">
                                <Library className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            
                            <div className="relative z-10 mt-6 px-4 w-full">
                                <h3 className="text-[0.7rem] font-black uppercase tracking-[0.1em] text-slate-400 group-hover:text-slate-900 transition-colors line-clamp-1">{b.title}</h3>
                                <p className="text-[0.55rem] font-bold text-slate-300 uppercase mt-1">Reference Material</p>
                            </div>
                        </button>
                    ))}
                </div>

                {dynamicBooks.length === 0 && !staticLink && (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20">
                        <BookOpen className="w-20 h-20 text-slate-300 stroke-[1]" />
                        <p className="text-[0.7rem] font-black uppercase tracking-[0.4em] mt-8">Secure Archive Empty</p>
                    </div>
                )}
            </div>

            <BookViewer 
                isOpen={viewer.isOpen}
                onClose={() => setViewer(v => ({ ...v, isOpen: false }))}
                url={viewer.url}
                title={viewer.title}
            />
        </div>
    );
};

/** ── SHARED TOOL HEADER ── */
const ToolHeader = ({ title, subtitle, themeColor = "blue", onBack }: { title: string, subtitle: string, themeColor?: string, onBack: () => void }) => {
    const { user } = useApp();
    return (
        <div className="w-full bg-white pt-8 pb-32 px-6 flex flex-col items-center relative overflow-hidden border-b border-slate-100">
             <div className="w-full max-w-[620px] relative z-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-rose-600 leading-none tracking-tighter">AADHAR</span>
                        <span className="text-2xl font-black text-blue-600 leading-none tracking-tight">PATHSHALA</span>
                    </div>
                    <Link to="/profile" className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex items-center justify-center">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon className="w-6 h-6 text-slate-400" />
                        )}
                    </Link>
                </div>

                <div className="flex items-center justify-between">
                    <button onClick={onBack} className="w-10 h-10 bg-slate-900/5 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-900/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="text-center">
                        <h1 className={cn("text-2xl font-black italic tracking-tighter uppercase leading-none", `text-${themeColor}-600`)}>{title}</h1>
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{subtitle}</p>
                    </div>
                    <div className="w-10" />
                </div>
            </div>
            <div className={cn("absolute bottom-0 left-0 right-0 h-24", `bg-gradient-to-t from-${themeColor}-50/50 to-transparent`)} />
        </div>
    );
};

/* ── TRANSLATOR TOOL ── */
const TranslatorPage = () => {
    const navigate = useNavigate();
    const [text, setText] = useState('');
    const [translated, setTranslated] = useState('');
    const [loading, setLoading] = useState(false);
    const [sourceLang, setSourceLang] = useState('English');
    const [targetLang, setTargetLang] = useState('Nepali');

    const handleTranslate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const prompt = `You are a professional translator for Nepalese students.
            Translate the following text from ${sourceLang} to ${targetLang}.
            Provide only the translation, no extra chatter.
            
            TEXT: "${text}"`;

            const result = await callCerebrasForMomo([{ role: 'user', content: prompt }], false);
            setTranslated(result || "Translation failed.");
        } catch (e) {
            console.error(e);
            setTranslated("Error: Could not connect to translation engine.");
        } finally {
            setLoading(false);
        }
    };

    const swapLangs = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        const oldText = text;
        setText(translated);
        setTranslated(oldText);
    };

    const copyToClipboard = (content: string) => {
        if (!content) return;
        navigator.clipboard.writeText(content);
    };

    const clearAll = () => {
        setText('');
        setTranslated('');
    };

    const speakText = (content: string, lang: string) => {
        if (!content) return;
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = lang === 'Nepali' ? 'ne-NP' : 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 pb-24 bg-slate-50 z-[1001] flex flex-col items-center animate-fade-up overflow-y-auto">
            <ToolHeader 
                title="AI Translator" 
                subtitle="Linguistic Precision V.2" 
                themeColor="blue" 
                onBack={() => navigate(-1)} 
            />

            <div className="w-full max-w-[800px] relative z-20 px-6 mt-[-60px] space-y-6">
                <div className="bg-white p-6 md:p-8 rounded-[3rem] shadow-2xl space-y-6 border border-white relative overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                        <div className="flex-1 text-center bg-white py-3 px-6 rounded-2xl shadow-sm text-lg font-black text-slate-800 uppercase tracking-tighter w-full">
                            {sourceLang}
                        </div>
                        <button onClick={swapLangs} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 hover:rotate-180 transition-all duration-500 shadow-md shrink-0">
                            <ArrowRightLeft className="w-6 h-6" />
                        </button>
                        <div className="flex-1 text-center bg-slate-900 py-3 px-6 rounded-2xl text-lg font-black text-white uppercase tracking-tighter w-full">
                            {targetLang}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-4 flex flex-col">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Source Text</span>
                                <div className="flex gap-2">
                                    <button onClick={() => speakText(text, sourceLang)} className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors" title="Listen">
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => copyToClipboard(text)} className="p-2 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-100 transition-colors" title="Copy">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <textarea 
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Input text segment..."
                                className="w-full min-h-[160px] flex-1 bg-slate-50 p-6 rounded-[2rem] text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-blue-500/10 border border-slate-100 resize-none transition-all shadow-inner"
                            />
                        </div>

                        <div className="space-y-4 flex flex-col">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Translation</span>
                                <div className="flex gap-2">
                                    <button onClick={() => speakText(translated, targetLang)} className="p-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-colors" title="Listen">
                                        <Volume2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => copyToClipboard(translated)} className="p-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 hover:text-white transition-colors" title="Copy">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 w-full bg-slate-900 border border-slate-800 p-6 rounded-[2rem] text-lg font-bold text-white leading-relaxed italic relative overflow-hidden group shadow-lg shadow-slate-900/10">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar flex flex-col">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center h-full flex-1">
                                            <RotateCcw className="w-6 h-6 text-blue-400 animate-spin mb-3" />
                                            <span className="text-xs uppercase tracking-widest font-black text-blue-400">Synthesizing...</span>
                                        </div>
                                    ) : translated ? (
                                        <p className="whitespace-pre-wrap flex-1">{translated}</p>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full flex-1 opacity-30 select-none">
                                            <Globe className="w-10 h-10 mb-3" />
                                            <span className="text-xs uppercase tracking-widest">Output will materialize here</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 relative z-10">
                        <button onClick={clearAll} className="flex-1 py-4 bg-rose-50 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-xs shadow-sm hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95">
                            <Trash2 className="w-4 h-4" /> Clear All
                        </button>
                        <button 
                            onClick={handleTranslate}
                            disabled={loading || !text.trim()}
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-blue-500/20 shadow-blue-500/10"
                        >
                            {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Execute Translation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** ── DICTIONARY PAGE ── */
const DictionaryPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const recentTerms = [
        { term: 'physics', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { term: 'mathematics', color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { term: 'science', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { term: 'biology', color: 'bg-amber-50 text-amber-600 border-amber-100' }
    ];

    const searchWord = async (word: string) => {
        if (!word) return;
        setLoading(true);
        setError("");
        setResult(null);

        const cleanWord = word.trim().toLowerCase();

        try {
            const prompt = `You are a high-accuracy English dictionary. Explain the meaning and usage of the English word: "${cleanWord}".
            Return the response in strictly JSON format. Provide the meaning, exactly 2 examples, synonyms, and antonyms IN ENGLISH:
            {
                "word": "English word",
                "phonetic": "how to pronounce",
                "partOfSpeech": "noun/verb/adjective etc",
                "meaning": "primary meaning in English",
                "examples": ["example sentence 1", "example sentence 2"],
                "synonyms": ["synonym 1", "synonym 2"],
                "antonyms": ["antonym 1", "antonym 2"]
            }`;

            const res = await callCerebrasForMomo([{ role: 'user', content: prompt }], true);
            const data = JSON.parse(res || '{}');
            if (!data.word) throw new Error("Could not parse result.");
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to fetch word. Try another word.");
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (audioUrl: string) => {
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audio.play();
    };

    return (
        <div className="fixed inset-0 pb-24 bg-slate-50 z-[1001] flex flex-col items-center animate-fade-up overflow-y-auto">
            <ToolHeader 
                title="Dictionary Hub" 
                subtitle="Universal Semantic Research" 
                themeColor="rose" 
                onBack={() => navigate(-1)} 
            />

            <div className="w-full max-w-[620px] relative z-20 px-6 -mt-20 space-y-6">
                {!result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

                        <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl space-y-6 border border-white">
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest block px-1">Vocabulary Search</label>
                                <div className="relative border-b-2 border-rose-100 flex items-center py-2 focus-within:border-rose-500 transition-colors group">
                                    <input 
                                        type="text" 
                                        placeholder="Type key term..." 
                                        className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none placeholder:text-slate-100 italic"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchWord(query)}
                                    />
                                    <button onClick={() => searchWord(query)} className="text-rose-500 hover:scale-110 transition-transform">
                                        <Search className="w-7 h-7" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Trending Concepts</h3>
                                <Sparkles className="w-3 h-3 text-rose-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {recentTerms.map((item) => (
                                    <button 
                                        key={item.term} 
                                        onClick={() => { setQuery(item.term); searchWord(item.term); }}
                                        className={cn("p-5 rounded-[2rem] border shadow-sm text-left group transition-all active:scale-95", item.color)}
                                    >
                                        <h4 className="text-lg font-black lowercase italic mb-1">{item.term}</h4>
                                        <p className="font-black uppercase text-[0.55rem] tracking-widest opacity-60">Definition</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-6">
                         <div className="w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center border border-rose-50">
                            <div className="w-10 h-10 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin" />
                         </div>
                         <p className="text-rose-400 font-black uppercase tracking-[0.3em] text-[0.6rem]">Querying Global Lexicon...</p>
                    </div>
                )}

                {result && !loading && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                        <header className="pt-6">
                            <button onClick={() => setResult(null)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-rose-500 shadow-md border border-rose-50">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        </header>

                        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-rose-50 space-y-6">
                            <div className="space-y-1">
                                <span className="text-rose-600 font-black uppercase tracking-[0.2em] text-[0.6rem]">{result.partOfSpeech}</span>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 lowercase">{result.word}</h2>
                                {result.phonetic && <p className="text-slate-400 font-mono italic text-sm">[{result.phonetic}]</p>}
                            </div>

                            <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-50">
                                <label className="text-[0.6rem] font-black text-rose-600 uppercase tracking-widest block mb-2">Definition</label>
                                <p className="text-xl font-bold text-slate-800 leading-tight">{result.meaning}</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">Examples</label>
                                {result.examples?.map((ex: string, i: number) => (
                                    <p key={i} className="text-sm font-bold text-slate-600 italic border-l-2 border-rose-200 pl-4">{ex}</p>
                                ))}
                            </div>

                            {result.synonyms?.length > 0 && (
                                <div className="pt-4 space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">Synonyms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {result.synonyms.map((s: string) => (
                                            <span key={s} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.antonyms?.length > 0 && (
                                <div className="pt-4 space-y-2">
                                    <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest block px-1">Antonyms</label>
                                    <div className="flex flex-wrap gap-2">
                                        {result.antonyms.map((a: string) => (
                                            <span key={a} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {error && !loading && (
                    <div className="text-center py-40 space-y-6">
                         <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto text-rose-500">
                            <SearchX className="w-8 h-8" />
                         </div>
                         <div className="space-y-2">
                            <p className="text-slate-900 font-black text-xl tracking-tighter uppercase italic">{error}</p>
                            <p className="text-slate-400 font-bold text-[0.6rem] uppercase tracking-widest">Entry not found in academic core</p>
                         </div>
                         <button onClick={() => { setError(""); setQuery(""); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[0.6rem] uppercase tracking-widest shadow-xl active:scale-95 transition-all">Re-sync Database</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudyTimer = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'break'>('focus');

    useEffect(() => {
        let interval: any;
        if (isActive && time > 0) {
            interval = setInterval(() => setTime(t => t - 1), 1000);
        } else if (isActive && time === 0) {
            setIsActive(false);
            setMode(mode === 'focus' ? 'break' : 'focus');
            setTime(mode === 'focus' ? 5 * 60 : 25 * 60);
            alert(mode === 'focus' ? "Focus session complete! Take a break." : "Break over! Back to deep work.");
        }
        return () => clearInterval(interval);
    }, [isActive, time, mode]);

    return (
        <div className="space-y-8 animate-fade-up pb-24 text-center">
            <div className="flex items-center gap-3 text-left">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Deep Focus</h1>
            </div>

            <div className={cn(
                "w-72 h-72 mx-auto rounded-full border-8 flex flex-col items-center justify-center shadow-2xl transition-all duration-700 relative",
                mode === 'focus' ? "border-rose-500 bg-rose-500 shadow-rose-500/20" : "border-emerald-500 bg-emerald-500 shadow-emerald-500/20"
            )}>
                <div className="absolute inset-4 rounded-full border border-white/20 border-dashed animate-spin-slow" />
                <p className="text-[0.65rem] font-black text-white/60 uppercase tracking-[0.3em] mb-2">{mode === 'focus' ? 'CONCENTRATING' : 'RECHARGING'}</p>
                <h2 className="text-7xl font-black text-white tracking-tighter leading-none mb-4">
                    {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
                </h2>
            </div>
            
            <div className="flex justify-center gap-6 max-w-sm mx-auto">
                <button onClick={() => { setIsActive(false); setTime(t => Math.max(0, t - 300)); }} className="bg-slate-100 text-slate-600 p-4 rounded-full hover:bg-slate-200 transition-all font-black text-base shadow-sm">- 5m</button>
                <button onClick={() => setIsActive(!isActive)} className="bg-slate-900 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all">
                    {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
                <button onClick={() => { setIsActive(false); setTime(t => t + 300); }} className="bg-slate-100 text-slate-600 p-4 rounded-full hover:bg-slate-200 transition-all font-black text-base shadow-sm">+ 5m</button>
                <button onClick={() => { setIsActive(false); setTime(mode === 'focus' ? 25 * 60 : 5 * 60); }} className="bg-slate-100 text-slate-600 p-4 rounded-full hover:bg-slate-200 transition-all shadow-sm">
                    <RotateCcw className="w-6 h-6" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <button onClick={() => { setMode('focus'); setTime(25*60); }} className={cn("p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border font-black text-xs uppercase tracking-widest transition-all", mode === 'focus' ? "bg-rose-500 text-white border-rose-500" : "bg-white border-slate-100 text-slate-400")}>Focus Sprint</button>
                <button onClick={() => { setMode('break'); setTime(5*60); }} className={cn("p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border font-black text-xs uppercase tracking-widest transition-all", mode === 'break' ? "bg-emerald-500 text-white border-emerald-500" : "bg-white border-slate-100 text-slate-400")}>Brain Rest</button>
            </div>
        </div>
    );
};

const ExamCalendar = () => {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const events = [
        { id: '1', title: 'SEE Form Deadline', date: 'Chaitra 5', type: 'deadline' },
        { id: '2', title: 'Physics Mock Test', date: 'Baisakh 12', type: 'mock' },
        { id: '3', title: 'District Level Exam', date: 'Jestha 20', type: 'exam' },
        { id: '4', title: 'Math Mock Test', date: 'Baisakh 18', type: 'mock' },
        { id: '5', title: 'Revision Week Starts', date: 'Falgun 10', type: 'event' }
    ];

    const months2083 = [
        { name: 'Baisakh', days: 31, offset: 2 },
        { name: 'Jestha', days: 31, offset: 5 },
        { name: 'Ashadh', days: 32, offset: 1 },
        { name: 'Shrawan', days: 32, offset: 5 },
        { name: 'Bhadra', days: 31, offset: 2 },
        { name: 'Ashwin', days: 30, offset: 5 },
        { name: 'Kartik', days: 30, offset: 0 },
        { name: 'Mangsir', days: 29, offset: 2 },
        { name: 'Poush', days: 30, offset: 3 },
        { name: 'Magh', days: 29, offset: 5 },
        { name: 'Falgun', days: 30, offset: 6 },
        { name: 'Chaitra', days: 30, offset: 1 }
    ];

    const [activeMonth, setActiveMonth] = useState('Baisakh');
    const activeMonthData = months2083.find(m => m.name === activeMonth)!;

    const typeColors: Record<string, { bg: string, text: string, border: string, dot: string }> = {
        'deadline': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500' },
        'mock': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', dot: 'bg-indigo-500' },
        'exam': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500' },
        'event': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500' }
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="space-y-0.5">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Board Cal. 2083</h1>
                    <div className="flex items-center gap-2">
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Universal Exam Schedule</p>
                        <div className="w-1 h-1 bg-slate-300 rounded-full" />
                        <span className="text-[0.6rem] font-black text-blue uppercase tabular-nums flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                </div>
            </header>

            <div className="bg-white p-4 md:p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 px-2">
                    <div className="space-y-1">
                        <p className="text-[0.55rem] font-black text-slate-300 uppercase tracking-[0.3em]">Active period</p>
                        <select 
                            value={activeMonth}
                            onChange={(e) => setActiveMonth(e.target.value)}
                            className="bg-transparent border-none text-2xl font-black italic uppercase tracking-tighter text-slate-800 outline-none cursor-pointer hover:text-blue transition-colors appearance-none"
                        >
                            {months2083.map(m => (
                                <option key={m.name} value={m.name}>{m.name} 2083</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className={cn("w-8 h-8 flex items-center justify-center font-black text-[0.6rem]", i === 0 || i === 6 ? "text-rose-500" : "text-slate-400")}>
                                {d}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 relative z-10 p-2">
                    {Array.from({ length: activeMonthData.offset }).map((_, i) => (
                        <div key={`offset-${i}`} className="aspect-square" />
                    ))}
                    {Array.from({ length: activeMonthData.days }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${activeMonth} ${dayNum}`;
                        const event = events.find(e => e.date === dateStr);
                        const isToday = false; // Mock

                        return (
                            <div 
                                key={i} 
                                className={cn(
                                    "aspect-square rounded-2xl flex flex-col items-center justify-center text-sm font-black relative transition-all group border-2",
                                    (i + activeMonthData.offset) % 7 === 0 || (i + activeMonthData.offset) % 7 === 6 ? "text-rose-400 bg-rose-50/20 border-transparent" : "text-slate-600 bg-slate-50/50 border-transparent",
                                    event ? "bg-white border-blue shadow-lg scale-105 z-10" : "hover:border-slate-200 hover:bg-white"
                                )}
                            >
                                {dayNum}
                                {event && (
                                    <div className={cn("absolute bottom-2 w-1.5 h-1.5 rounded-full animate-bounce", typeColors[event.type].dot)} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4 relative z-10 px-2 lg:px-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">Scheduled Actions</h3>
                        <div className="flex gap-2">
                            {Object.entries(typeColors).map(([type, color]) => (
                                <div key={type} className="flex items-center gap-1.5">
                                    <div className={cn("w-2 h-2 rounded-full", color.dot)} />
                                    <span className="text-[0.5rem] font-black text-slate-300 uppercase">{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {events.filter(e => e.date.includes(activeMonth)).length > 0 ? (
                            events.filter(e => e.date.includes(activeMonth)).map(e => (
                                <div key={e.id} className={cn("p-5 rounded-3xl border flex items-center justify-between group hover:scale-[1.02] transition-all", typeColors[e.type].bg, typeColors[e.type].border)}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm", typeColors[e.type].text)}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm leading-tight uppercase tracking-tighter italic">{e.title}</p>
                                            <p className={cn("text-[0.55rem] font-black uppercase tracking-widest mt-0.5", typeColors[e.type].text)}>{e.date} • {e.type}</p>
                                        </div>
                                    </div>
                                    <button className="w-8 h-8 rounded-lg bg-white/50 text-slate-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Bell className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-10 flex flex-col items-center gap-4 text-center">
                                <SearchX className="w-10 h-10 text-slate-200" />
                                <p className="text-[0.65rem] font-black text-slate-300 uppercase tracking-widest">No milestones in {activeMonth}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LeaderboardPage = () => {
    const navigate = useNavigate();
    const students = [
        { name: 'Sameer Koirala', xp: 4500, grade: '10', streak: 22 },
        { name: 'Anjali Sharma', xp: 4200, grade: '10', streak: 18 },
        { name: 'Bibek Dhakal', xp: 3800, grade: '10', streak: 15 },
        { name: 'Priya Thapa', xp: 3500, grade: '10', streak: 12 },
        { name: 'Rajesh Hamal', xp: 3200, grade: '10', streak: 30 }
    ];

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">SEE Board</h1>
            </div>

            <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-blue-900 p-10 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl flex flex-col items-center">
                <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
                <h2 className="text-3xl font-black italic tracking-tighter uppercase mb-6">Universal Leaders</h2>
                <div className="grid grid-cols-3 gap-6 w-full text-center">
                    <div>
                        <p className="text-3xl font-black italic text-slate-400">#2</p>
                        <p className="text-[0.6rem] font-black uppercase text-white/40 mt-1">Regional</p>
                    </div>
                    <div className="scale-125 border-x border-white/10 px-4">
                        <p className="text-4xl font-black italic text-amber-400">#12</p>
                        <p className="text-[0.6rem] font-black uppercase text-white/40 mt-1">National</p>
                    </div>
                    <div>
                        <p className="text-3xl font-black italic text-slate-400">#1</p>
                        <p className="text-[0.6rem] font-black uppercase text-white/40 mt-1">School</p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                {students.map((s, i) => (
                    <div key={i} className={cn("p-6 flex items-center justify-between transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                        <div className="flex items-center gap-5">
                            <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black", 
                                i === 0 ? "bg-amber-400 text-white" : 
                                i === 1 ? "bg-slate-300 text-white" : 
                                i === 2 ? "bg-amber-600 text-white" : "text-slate-400")}>
                                {i + 1}
                            </span>
                            <div>
                                <h4 className="font-black text-slate-800 uppercase tracking-tight">{s.name}</h4>
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{s.streak} Day Streak 🔥</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="font-black text-blue text-lg italic tracking-tighter leading-none">{s.xp.toLocaleString()}</p>
                             <p className="text-[0.55rem] font-black text-slate-300 uppercase tracking-widest mt-1 text-center">XP</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FormulaBankPage = () => {
    const navigate = useNavigate();
    const [activeSubject, setActiveSubject] = useState<'Maths' | 'Opt. Maths' | 'Science'>('Maths');

    const formulasList: Record<'Maths' | 'Opt. Maths' | 'Science', any[]> = {
        'Maths': [
            { title: '(a+b)²', formula: '(a+b)^2 = a^2 + 2ab + b^2' },
            { title: '(a-b)²', formula: '(a-b)^2 = a^2 - 2ab + b^2' },
            { title: 'a² - b²', formula: 'a^2 - b^2 = (a-b)(a+b)' },
            { title: '(a+b)³', formula: '(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3' },
            { title: 'a³ + b³', formula: 'a^3 + b^3 = (a+b)(a^2 - ab + b^2)' },
            { title: 'a³ - b³', formula: 'a^3 - b^3 = (a-b)(a^2 + ab + b^2)' },
            { title: 'Quadratic Equation Roots', formula: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
            { title: 'Product Law of Indices', formula: 'a^m \\times a^n = a^{m+n}' },
            { title: 'Quotient Law of Indices', formula: '\\frac{a^m}{a^n} = a^{m-n}' },
            { title: 'Power Law of Indices', formula: '(a^m)^n = a^{mn}' },
            { title: 'Simple Interest', formula: 'I = \\frac{P \\times T \\times R}{100}' },
            { title: 'Amount', formula: 'A = P + I = P\\left(1 + \\frac{TR}{100}\\right)' },
            { title: 'Compound Interest (Yearly)', formula: 'C.I. = P\\left[\\left(1 + \\frac{R}{100}\\right)^T - 1\\right]' },
            { title: 'Compound Amount (Yearly)', formula: 'C.A. = P\\left(1 + \\frac{R}{100}\\right)^T' },
            { title: 'Compound Interest (Half-Yearly)', formula: 'C.I. = P\\left[\\left(1 + \\frac{R}{200}\\right)^{2T} - 1\\right]' },
            { title: 'Population Growth', formula: 'P_t = P_0\\left(1 + \\frac{R}{100}\\right)^T' },
            { title: 'Depreciation', formula: 'D = V_0\\left(1 - \\frac{R}{100}\\right)^T' },
            { title: 'Area of Triangle (Base & Height)', formula: 'A = \\frac{1}{2} b h' },
            { title: 'Area of Equilateral Triangle', formula: 'A = \\frac{\\sqrt{3}}{4} a^2' },
            { title: 'Area of Scalene Triangle (Heron\'s)', formula: 'A = \\sqrt{s(s-a)(s-b)(s-c)}' },
            { title: 'Area of Isosceles Triangle', formula: 'A = \\frac{b}{4} \\sqrt{4a^2 - b^2}' },
            { title: 'Curved Surface Area of Cylinder', formula: 'C.S.A. = 2\\pi rh' },
            { title: 'Total Surface Area of Cylinder', formula: 'T.S.A. = 2\\pi r(r + h)' },
            { title: 'Volume of Cylinder', formula: 'V = \\pi r^2 h' },
            { title: 'Volume of Cone', formula: 'V = \\frac{1}{3} \\pi r^2 h' },
            { title: 'Curved Surface Area of Cone', formula: 'C.S.A. = \\pi rl' },
            { title: 'Total Surface Area of Cone', formula: 'T.S.A. = \\pi r(r + l)' },
            { title: 'Volume of Sphere', formula: 'V = \\frac{4}{3} \\pi r^3' },
            { title: 'Surface Area of Sphere', formula: 'S.A. = 4\\pi r^2' },
            { title: 'Volume of Hemisphere', formula: 'V = \\frac{2}{3} \\pi r^3' },
            { title: 'Total Surface Area of Hemisphere', formula: 'T.S.A. = 3\\pi r^2' },
            { title: 'Mean (Ungrouped)', formula: '\\overline{X} = \\frac{\\sum x}{N}' },
            { title: 'Mean (Grouped)', formula: '\\overline{X} = \\frac{\\sum fx}{N}' },
            { title: 'Median (Continuous Series)', formula: 'M_d = L + \\frac{\\frac{N}{2} - c.f.}{f} \\times i' },
            { title: 'Mode (Continuous Series)', formula: 'M_o = L + \\frac{f_1 - f_0}{2f_1 - f_0 - f_2} \\times i' }
        ],
        'Opt. Maths': [
            { title: 'Distance between two points', formula: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
            { title: 'Mid-point Formula', formula: 'M(x, y) = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)' },
            { title: 'Section Formula (Internal)', formula: '(x, y) = \\left(\\frac{m_1x_2 + m_2x_1}{m_1 + m_2}, \\frac{m_1y_2 + m_2y_1}{m_1 + m_2}\\right)' },
            { title: 'Section Formula (External)', formula: '(x, y) = \\left(\\frac{m_1x_2 - m_2x_1}{m_1 - m_2}, \\frac{m_1y_2 - m_2y_1}{m_1 - m_2}\\right)' },
            { title: 'Slope of a Line', formula: 'm = \\frac{y_2 - y_1}{x_2 - x_1}' },
            { title: 'Equation of straight line (Slope-intercept)', formula: 'y = mx + c' },
            { title: 'Equation of straight line (Point-slope)', formula: 'y - y_1 = m(x - x_1)' },
            { title: 'Angle between two lines', formula: '\\tan\\theta = \\pm \\frac{m_1 - m_2}{1 + m_1m_2}' },
            { title: 'Sine Rule', formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}' },
            { title: 'Cosine Rule (for cos C)', formula: '\\cos C = \\frac{a^2 + b^2 - c^2}{2ab}' },
            { title: 'Sin(A+B)', formula: '\\sin(A+B) = \\sin A\\cos B + \\cos A\\sin B' },
            { title: 'Cos(A+B)', formula: '\\cos(A+B) = \\cos A\\cos B - \\sin A\\sin B' },
            { title: 'Tan(A+B)', formula: '\\tan(A+B) = \\frac{\\tan A + \\tan B}{1 - \\tan A\\tan B}' },
            { title: 'Sin 2A', formula: '\\sin 2A = 2\\sin A\\cos A = \\frac{2\\tan A}{1 + \\tan^2 A}' },
            { title: 'Cos 2A', formula: '\\cos 2A = \\cos^2 A - \\sin^2 A = 1 - 2\\sin^2 A = 2\\cos^2 A - 1' },
            { title: 'Tan 2A', formula: '\\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}' },
            { title: 'Dot Product', formula: '\\vec{a} \\cdot \\vec{b} = |\\vec{a}||\\vec{b}|\\cos\\theta' },
            { title: 'Magnitude of Vector', formula: '|\\vec{v}| = \\sqrt{x^2 + y^2}' }
        ],
        'Science': [
            { title: 'Newton\'s Law of Gravitation', formula: 'F = G\\frac{m_1 m_2}{d^2}' },
            { title: 'Acceleration Due to Gravity', formula: 'g = \\frac{GM}{R^2}' },
            { title: 'Liquid Pressure', formula: 'P = \\rho g h' },
            { title: 'Upthrust', formula: 'U = v \\rho g' },
            { title: 'Heat Equation', formula: 'Q = ms\\Delta\\theta' },
            { title: 'Lens Formula', formula: '\\frac{1}{f} = \\frac{1}{u} + \\frac{1}{v}' },
            { title: 'Power of Lens', formula: 'P = \\frac{1}{f} \\text{ (in meters)}' },
            { title: 'Ohm\'s Law', formula: 'V = IR' },
            { title: 'Power (Electricity)', formula: 'P = VI = I^2 R = \\frac{V^2}{R}' },
            { title: 'Energy (Electricity)', formula: 'E = Pt = Vit' },
            { title: 'Transformer Formula', formula: '\\frac{N_p}{N_s} = \\frac{V_p}{V_s} = \\frac{I_s}{I_p}' },
            { title: 'Kinetic Energy', formula: 'KE = \\frac{1}{2}mv^2' },
            { title: 'Potential Energy', formula: 'PE = mgh' },
            { title: 'Wave Velocity', formula: 'v = f \\lambda' }
        ]
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Formula Bank</h1>
            </div>

            <div className="flex bg-slate-100 p-2 rounded-[2rem] shadow-inner mb-6">
                {(Object.keys(formulasList) as ('Maths' | 'Opt. Maths' | 'Science')[]).map(subj => (
                    <button 
                        key={subj}
                        onClick={() => setActiveSubject(subj)}
                        className={cn(
                            "flex-1 py-3 px-4 rounded-[1.5rem] font-black text-[0.65rem] md:text-sm uppercase tracking-widest transition-all",
                            activeSubject === subj ? "bg-white text-blue shadow-lg" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {subj}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {formulasList[activeSubject].map(f => (
                    <div key={f.title} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue transition-all">
                        <span className="text-[0.6rem] font-black text-blue uppercase tracking-widest mb-2 block">{activeSubject}</span>
                        <h3 className="font-black text-xl text-slate-900 mb-4">{f.title}</h3>
                        <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-lg overflow-x-auto shadow-inner prose prose-invert prose-p:my-0 max-w-none">
                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                {`$$\n${f.formula}\n$$`}
                            </Markdown>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UnitConverterPage = () => {
    const navigate = useNavigate();
    const [val, setVal] = useState('1');
    const [type, setType] = useState('length');

    const unitsList = ['length', 'mass', 'temp', 'area', 'volume', 'speed', 'time', 'data'];

    const unitMap: Record<string, string[]> = {
        'length': ['meter', 'centimeter', 'kilometer', 'feet', 'inch', 'mile'],
        'mass': ['kilogram', 'gram', 'milligram', 'pound', 'ounce'],
        'temp': ['Celsius', 'Fahrenheit', 'Kelvin'],
        'area': ['sq.meter', 'sq.km', 'sq.feet', 'hectare', 'acre'],
        'volume': ['Liter', 'milliliter', 'gallon', 'cubic.m'],
        'speed': ['m/s', 'km/h', 'mph'],
        'time': ['sec', 'min', 'hour', 'day'],
        'data': ['Byte', 'KB', 'MB', 'GB', 'TB']
    };

    const [fromUnits, setFromUnits] = useState('meter');
    const [toUnits, setToUnits] = useState('feet');

    useEffect(() => {
        setFromUnits(unitMap[type][0]);
        setToUnits(unitMap[type][1]);
    }, [type]);

    const convert = () => {
        const input = parseFloat(val) || 0;
        if (type === 'temp') {
            if (fromUnits === 'Celsius' && toUnits === 'Fahrenheit') return (input * 9/5) + 32;
            if (fromUnits === 'Fahrenheit' && toUnits === 'Celsius') return (input - 32) * 5/9;
            if (fromUnits === 'Celsius' && toUnits === 'Kelvin') return input + 273.15;
            if (fromUnits === 'Kelvin' && toUnits === 'Celsius') return input - 273.15;
            if (fromUnits === 'Fahrenheit' && toUnits === 'Kelvin') return (input - 32) * 5/9 + 273.15;
            if (fromUnits === 'Kelvin' && toUnits === 'Fahrenheit') return (input - 273.15) * 9/5 + 32;
            return input;
        }

        const rates: Record<string, number> = {
            'length_meter': 1, 'length_centimeter': 0.01, 'length_kilometer': 1000, 'length_feet': 0.3048, 'length_inch': 0.0254, 'length_mile': 1609.34,
            'mass_kilogram': 1, 'mass_gram': 0.001, 'mass_milligram': 0.000001, 'mass_pound': 0.453592, 'mass_ounce': 0.0283495,
            'area_sq.meter': 1, 'area_sq.km': 1000000, 'area_sq.feet': 0.092903, 'area_hectare': 10000, 'area_acre': 4046.86,
            'volume_Liter': 1, 'volume_milliliter': 0.001, 'volume_gallon': 3.78541, 'volume_cubic.m': 1000,
            'speed_m/s': 1, 'speed_km/h': 0.277778, 'speed_mph': 0.44704,
            'time_sec': 1, 'time_min': 60, 'time_hour': 3600, 'time_day': 86400,
            'data_Byte': 1, 'data_KB': 1024, 'data_MB': 1048576, 'data_GB': 1073741824, 'data_TB': 1099511627776
        };

        const fromRate = rates[`${type}_${fromUnits}`];
        const toRate = rates[`${type}_${toUnits}`];

        if (!fromRate || !toRate) return input;
        return (input * fromRate) / toRate;
    };

    let result = '';
    const numRes = convert();
    if (type === 'data' || type === 'time') {
        result = parseFloat(numRes.toFixed(4)).toString();
    } else {
        result = parseFloat(numRes.toFixed(4)).toString();
    }

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Smart Converter</h1>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                <div className="grid grid-cols-4 gap-2">
                    {unitsList.map(t => (
                        <button key={t} onClick={() => setType(t)} className={cn("py-3 rounded-[1rem] font-black text-[0.55rem] md:text-[0.65rem] uppercase tracking-widest border transition-all truncate px-1", type === t ? "bg-blue text-white border-blue shadow-md" : "bg-slate-50 text-slate-400 border-slate-100 overflow-hidden")}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4 flex justify-between px-2">
                            <span>From: {fromUnits}</span>
                        </label>
                        <div className="flex bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue/10 transition-all">
                            <input 
                                type="number"
                                value={val}
                                onChange={e => setVal(e.target.value)}
                                className="w-full bg-transparent p-6 font-black text-2xl text-slate-800 outline-none"
                            />
                            <select value={fromUnits} onChange={e => setFromUnits(e.target.value)} className="bg-slate-100 outline-none px-4 font-black uppercase text-slate-600">
                                {unitMap[type].map(u => <option key={`f-${u}`} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                         <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center shadow-lg"><ArrowLeft className="-rotate-90" /></div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4 flex justify-between px-2">
                            <span>To: {toUnits}</span>
                        </label>
                        <div className="flex bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                            <div className="w-full p-6 font-black text-2xl text-white truncate">
                                {result}
                            </div>
                            <select value={toUnits} onChange={e => setToUnits(e.target.value)} className="bg-slate-800 text-white outline-none px-4 font-black uppercase border-l border-white/10">
                                {unitMap[type].map(u => <option key={`t-${u}`} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const PRESET_COLORS = ['#0f172a', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const PRESET_BRUSHES = [2, 5, 10, 20];

const DrawingPad = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#0f172a');
    const [brushSize, setBrushSize] = useState(3);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        if (value && value.startsWith('data:image')) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = value;
        } else if (value === '' || !value) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [value]);

    const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
        if (canvasRef.current) {
            canvasRef.current.setPointerCapture(e.pointerId);
        }
    };

    const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
        setIsDrawing(false);
        if (canvasRef.current) {
            canvasRef.current.releasePointerCapture(e.pointerId);
            canvasRef.current.getContext('2d')?.beginPath();
            onChange(canvasRef.current.toDataURL('image/png'));
        }
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearCanvas = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        onChange(canvas.toDataURL('image/png'));
    };

    const downloadImage = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `Aadhar_Drawing_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map(c => (
                        <button 
                            key={c}
                            onClick={() => setColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-slate-300 shadow-md' : 'border-transparent hover:scale-110'} ${c === '#ffffff' ? 'border-slate-200' : ''}`}
                            title={c === '#ffffff' ? 'Eraser' : c}
                        />
                    ))}
                    <div className="w-px h-8 bg-slate-200 mx-1" />
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-none overflow-hidden" title="Custom Color" />
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                        {PRESET_BRUSHES.map(s => (
                            <button
                                key={s}
                                onClick={() => setBrushSize(s)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${brushSize === s ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                                <div className="bg-current rounded-full" style={{ width: Math.max(s/2, 2), height: Math.max(s/2, 2) }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={downloadImage} className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95" title="Save Image">
                        <Save className="w-4 h-4" /> Save
                    </button>
                    <button onClick={clearCanvas} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest active:scale-95" title="Clear Canvas">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="w-full aspect-[4/3] sm:aspect-video rounded-[2.5rem] overflow-hidden border-2 border-amber-200 shadow-inner bg-white relative group">
                <div className="absolute top-4 right-4 bg-slate-900/50 text-white px-3 py-1 rounded-full text-[0.6rem] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {color === '#ffffff' ? 'Eraser Mode' : 'Drawing Mode'}
                </div>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain cursor-crosshair touch-none"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerOut={stopDrawing}
                />
            </div>
        </div>
    );
};

const NotePadPage = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { user } = useApp();
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mode, setMode] = useState<'editor' | 'library'>('library');
    const [tag, setTag] = useState('General');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [composeType, setComposeType] = useState<'text' | 'draw'>('text'); // New state for draw/text

    const MAX_NOTES = 50;

    useEffect(() => {
        const local = localStorage.getItem(`notes_${user?.id || 'guest'}`);
        if (local) setNotes(JSON.parse(local));
        setIsLoading(false);
    }, [user]);

    const saveNote = async () => {
        if (!title.trim() && !content.trim()) return;

        const noteData: any = { 
            id: editingId || 'note_' + Date.now(),
            user_id: user?.id || 'guest', 
            title: title || 'Brain Dump', 
            content: content, 
            date: new Date().toLocaleDateString(),
            category: tag,
            created_at: new Date().toISOString()
        };

        let updatedList;
        if (editingId) {
            updatedList = notes.map(n => n.id === editingId ? noteData : n);
            addToast("Note updated locally.", "success");
        } else {
            updatedList = [noteData, ...notes];
            addToast("Note saved locally.", "success");
        }
        
        setNotes(updatedList);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updatedList));
        
        setTitle('');
        setContent('');
        setEditingId(null);
        setMode('library');
    };

    const startEdit = (note: any) => {
        setTitle(note.title);
        setContent(note.content);
        setTag(note.category || 'General');
        setEditingId(note.id);
        const isDrawing = note.content && typeof note.content === 'string' && note.content.startsWith('data:image');
        setComposeType(isDrawing ? 'draw' : 'text');
        setMode('editor');
    };

    const deleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this log?")) return;
        const remaining = notes.filter(n => n.id !== id);
        setNotes(remaining);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(remaining));
        addToast("Log deleted locally.", "success");
    };

    const newNote = () => {
        setTitle('');
        setContent('');
        setEditingId(null);
        setMode('editor');
    };

    const tags = ['Science', 'Maths', 'English', 'Nepali', 'Social', 'Personal'];

    return (
        <div className="space-y-10 animate-fade-up pb-32 max-w-4xl mx-auto px-4 md:px-0">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Smart Mind Log</h1>
                        <p className="text-[0.6rem] font-black text-amber-500 uppercase tracking-widest mt-1">Thought Capture Engine</p>
                    </div>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto custom-scrollbar shadow-inner">
                    <button 
                        onClick={() => setMode('library')}
                        className={cn("px-6 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none", mode === 'library' ? "bg-white text-amber-600 shadow-md border border-slate-200" : "text-slate-400 hover:text-slate-600")}
                    >
                        Archives
                    </button>
                    <button 
                        onClick={newNote}
                        className={cn("px-6 py-3 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none", mode === 'editor' ? "bg-white text-amber-600 shadow-md border border-slate-200" : "text-slate-400 hover:text-slate-600")}
                    >
                        Compose
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {mode === 'editor' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-amber-100 shadow-2xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                            
                            <div className="relative z-10 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                     <div className="flex bg-slate-100 p-1 rounded-2xl w-max shadow-inner">
                                        <button 
                                            onClick={() => setComposeType('text')}
                                            className={cn("px-6 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all flex items-center gap-2", composeType === 'text' ? "bg-white text-blue-600 shadow-md border border-slate-200" : "text-slate-400 hover:text-slate-600")}
                                        >
                                            <FileText className="w-4 h-4" /> Write
                                        </button>
                                        <button 
                                            onClick={() => setComposeType('draw')}
                                            className={cn("px-6 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all flex items-center gap-2", composeType === 'draw' ? "bg-white text-purple-600 shadow-md border border-slate-200" : "text-slate-400 hover:text-slate-600")}
                                        >
                                            <Edit3 className="w-4 h-4" /> Draw
                                        </button>
                                    </div>
                                    <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto custom-scrollbar border border-slate-100 shadow-inner">
                                        {tags.map(t => (
                                            <button 
                                                key={t} 
                                                onClick={() => setTag(t)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-[0.55rem] font-black uppercase tracking-widest transition-all shrink-0 border",
                                                    tag === t ? "bg-slate-900 text-white border-slate-800 shadow-md" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-1 focus-within:border-amber-400 transition-all rounded-2xl border-2 border-transparent hover:border-slate-50 focus-within:bg-slate-50/30">
                                    <input 
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Entry Headline..." 
                                        className="w-full bg-transparent p-4 text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-900 placeholder:text-slate-300 outline-none"
                                    />
                                </div>

                                {composeType === 'text' ? (
                                    <textarea 
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Unload your knowledge matrix here..."
                                        rows={12}
                                        className="w-full bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 text-slate-700 font-bold leading-relaxed resize-none outline-none focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all shadow-inner"
                                    />
                                ) : (
                                    <DrawingPad value={content} onChange={setContent} />
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={saveNote}
                            disabled={!title.trim() && !content.trim()}
                            className="w-full bg-linear-to-r from-amber-500 to-orange-600 text-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-amber-500/20 flex items-center justify-center gap-4 group active:scale-95 transition-all disabled:opacity-50 hover:shadow-2xl hover:shadow-amber-500/30"
                        >
                            <span className="text-xl font-black italic uppercase tracking-tighter">Commit to Memory</span>
                            <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                         <button 
                            onClick={newNote}
                            className="w-full md:hidden bg-linear-to-r from-amber-500 to-orange-600 text-white p-5 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest active:scale-95 transition-all mb-4"
                        >
                            <Plus className="w-5 h-5" /> Initiate New Entry
                        </button>

                        {notes.length === 0 && !isLoading && (
                            <div className="text-center py-24 bg-white rounded-[4rem] border border-dashed border-slate-200">
                                <Search className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">No active logs found in memory.</p>
                                <button onClick={newNote} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-colors active:scale-95">Start Writing</button>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {notes.map((n, i) => {
                                const isDrawing = n.content?.startsWith('data:image');
                                return (
                                <motion.div 
                                    key={n.id} 
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => startEdit(n)}
                                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-xl group hover:border-amber-300 transition-all relative overflow-hidden cursor-pointer active:scale-95 flex flex-col h-full"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700 pointer-events-none" />
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[0.55rem] font-black uppercase tracking-widest w-fit mb-3">{n.category}</span>
                                                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight group-hover:text-amber-600 transition-colors line-clamp-2">{n.title}</h3>
                                            </div>
                                            <button 
                                                onClick={(e) => deleteNote(n.id, e)} 
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {isDrawing ? (
                                            <div className="flex-1 w-full bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-2 border border-slate-100 min-h-[150px]">
                                                <img src={n.content} alt={n.title} className="w-full h-full object-contain filter saturate-[0.8] group-hover:saturate-100 transition-all" />
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-4 mb-6 bg-slate-50 p-5 rounded-2xl flex-1 border border-slate-100 shadow-inner group-hover:bg-white transition-colors">{n.content}</p>
                                        )}
                                        
                                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                                            <div className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-amber-500" /> {new Date(n.created_at || Date.now()).toLocaleDateString()}
                                            </div>
                                            <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white group-hover:-rotate-12 transition-all">
                                                <Edit3 className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TodoListPage = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [tasks, setTasks] = useState<{id: string, text: string, done: boolean}[]>([]);
    const [newTask, setNewTask] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const local = localStorage.getItem('tasks_local');
        if (local) setTasks(JSON.parse(local));
        setIsLoading(false);
    }, []);

    const addTask = () => {
        if (!newTask.trim()) return;
        const task = { id: 'task_' + Date.now(), text: newTask, done: false };
        const newList = [task, ...tasks];
        setTasks(newList);
        localStorage.setItem('tasks_local', JSON.stringify(newList));
        setNewTask("");
    };

    const toggleStatus = (id: string) => {
        const newList = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
        setTasks(newList);
        localStorage.setItem('tasks_local', JSON.stringify(newList));
    };

    const deleteStatus = (id: string) => {
        const newList = tasks.filter(t => t.id !== id);
        setTasks(newList);
        localStorage.setItem('tasks_local', JSON.stringify(newList));
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/tools')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">To-Do List</h1>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl max-w-lg mx-auto">
                <div className="flex gap-2 mb-6">
                    <input 
                        value={newTask}
                        onChange={e => setNewTask(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                        placeholder="What needs to be done?"
                        className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue transition-all"
                    />
                    <button onClick={addTask} className="bg-blue text-white px-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors">Add</button>
                </div>

                <div className="space-y-3">
                    {tasks.map(t => (
                        <div key={t.id} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", t.done ? "bg-slate-50 border-transparent opacity-60" : "bg-white border-slate-100 shadow-sm")}>
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleStatus(t.id)}>
                                <div className={cn("w-6 h-6 rounded-md flex items-center justify-center transition-colors shadow-sm", t.done ? "bg-emerald-500 text-white" : "bg-white border-2 border-slate-200")}>
                                    {t.done && <ListChecks className="w-4 h-4" />}
                                </div>
                                <span className={cn("font-bold text-sm", t.done ? "line-through text-slate-400" : "text-slate-700")}>{t.text}</span>
                            </div>
                            <button onClick={() => deleteStatus(t.id)} className="text-slate-300 hover:text-rose-500 transition-colors ml-2">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {tasks.length === 0 && !isLoading && (
                        <p className="text-center text-slate-400 font-bold py-8 text-sm">All caught up! 🎉</p>
                    )}
                    {isLoading && (
                        <p className="text-center text-slate-400 font-bold py-8 text-sm">Loading tasks...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    return null;
};

// ════════════════════════════════════════════
// ADMIN PORTAL
// ════════════════════════════════════════════

/* ── CUSTOM TOAST SYSTEM ── */
const useToast = () => {
    const [toasts, setToasts] = useState<any[]>([]);
    const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    };
    return { toasts, addToast };
};

const ToastContainer = ({ toasts }: { toasts: any[] }) => (
    <div className="fixed top-8 right-8 z-[2000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
            {toasts.map(t => (
                <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className={cn(
                        "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md pointer-events-auto",
                        t.type === 'success' ? "bg-emerald-500/90 text-white border-emerald-400/30" : "bg-rose-500/90 text-white border-rose-400/30"
                    )}
                >
                    {t.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                    <span className="font-black text-xs uppercase tracking-widest">{t.msg}</span>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
);

/* ── ADMIN ANALYTICS ── */
const AdminAnalytics = ({ liveMaterials, liveNews, liveNotices }: any) => {
    const data = [
        { name: 'Study Hub', value: liveMaterials.length },
        { name: 'Broadcasts', value: liveNews.length },
        { name: 'Live Notices', value: liveNotices.length }
    ];

    const chartData = [
        { day: 'Mon', active: 120, syncs: 45 },
        { day: 'Tue', active: 150, syncs: 70 },
        { day: 'Wed', active: 200, syncs: 60 },
        { day: 'Thu', active: 180, syncs: 90 },
        { day: 'Fri', active: 250, syncs: 110 },
        { day: 'Sat', active: 300, syncs: 130 },
        { day: 'Sun', active: 280, syncs: 100 }
    ];

    const COLORS = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    <Users className="w-10 h-10 text-blue-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Active Nodes</h4>
                    <p className="text-4xl font-black text-slate-900 mt-1 relative z-10">1,248</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12% this week</span>
                    </div>
                </div>
                
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    <Zap className="w-10 h-10 text-rose-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Sync Operations</h4>
                    <p className="text-4xl font-black text-slate-900 mt-1 relative z-10">8,902</p>
                    <div className="mt-4 flex items-center gap-2 text-rose-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <Activity className="w-4 h-4" />
                        <span>Real-time Stream OK</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                    <Database className="w-10 h-10 text-emerald-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Vault Storage</h4>
                    <p className="text-4xl font-black text-slate-900 mt-1 relative z-10">1.2 GB</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <Monitor className="w-4 h-4" />
                        <span>42% utilized</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Network Traffic</h3>
                        <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Active</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-rose-500 rounded-full" />
                                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Syncs</span>
                             </div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorSyncs" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}
                                />
                                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" />
                                <Area type="monotone" dataKey="syncs" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorSyncs)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center space-y-6">
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 w-full text-left px-2">Knowledge Matrix</h3>
                    <div className="h-[300px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Total Nodes</span>
                            <span className="text-3xl font-black text-slate-900">{liveMaterials.length + liveNews.length + liveNotices.length}</span>
                        </div>
                    </div>
                    <div className="flex gap-6 pt-4">
                        {data.map((entry, index) => (
                           <div key={entry.name} className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                               <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{entry.name}</span>
                           </div> 
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="bg-linear-to-br from-slate-900 to-indigo-950 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">Intelligence Protocol Active</h3>
                        <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.4em]">Node ID: AP-SYNC-80321 • Status: Operational</p>
                    </div>
                    <button className="px-12 py-5 bg-white text-slate-900 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-white/10 hover:bg-slate-100 transition-all active:scale-95">
                        Download Report
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPortalPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center space-y-6">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
                <ShieldCheck className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-800">Admin Engine Offline</h1>
            <p className="text-slate-500 font-bold max-w-sm uppercase tracking-widest text-xs leading-relaxed">The backend management system is currently undergoing a full reconstruction. Direct database management is suspended.</p>
            <Link to="/" className="px-10 py-4 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl active:scale-95">Back to Home</Link>
        </div>
    );
};

const AppContent = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/hub" element={<StudyHub />} />
                <Route path="/hub/:name" element={<SubjectDetail />} />
                <Route path="/hub/:name/chapters" element={<ChapterList />} />
                <Route path="/hub/:name/chapters/:chapterId" element={<ChapterDetail />} />
                <Route path="/hub/:name/videos" element={<VideoList />} />
                <Route path="/hub/:name/pdfs" element={<PdfList />} />
                <Route path="/hub/:name/notes" element={<NoteList />} />
                <Route path="/hub/:name/textbooks" element={<DigitalTextbookList />} />
                <Route path="/hub/:name/model" element={<ModelList />} />
                <Route path="/hub/:name/mcq-sets" element={<MCQTestSelection />} />
                <Route path="/hub/:name/mcq-test/:setIndex" element={<MCQTestPlayer />} />
                <Route path="/ai" element={<AITutor />} />
                <Route path="/mock" element={<MockTest />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin-portal" element={<AdminPortalPage />} />
                <Route path="/tools" element={<AadharToolkit />} />
                <Route path="/tools/calculator" element={<CalculatorSuite />} />
                <Route path="/tools/notes" element={<NotePadPage />} />
                <Route path="/tools/dictionary" element={<DictionaryPage />} />
                <Route path="/tools/nepali-dictionary" element={<NepaliDictionaryPage />} />
                <Route path="/tools/timer" element={<StudyTimer />} />
                <Route path="/tools/calendar" element={<ExamCalendar />} />
                <Route path="/tools/formulas" element={<FormulaBankPage />} />
                <Route path="/tools/converter" element={<UnitConverterPage />} />
                <Route path="/tools/todo" element={<TodoListPage />} />
                <Route path="/tools/words" element={<WordCounterPage />} />
                <Route path="/tools/periodic-table" element={<PeriodicTablePage />} />
                <Route path="/tools/translator" element={<TranslatorPage />} />
                <Route path="/tools/attendance" element={<AttendanceTracker />} />
                <Route path="/tools/flashcards" element={<FlashcardApp />} />
            </Routes>
        </Layout>
    );
};

const App = () => {
    return (
        <AppProvider>
            <BrowserRouter>
                <ScrollToTop />
                <AppContent />
            </BrowserRouter>
        </AppProvider>
    );
};

// ════════════════════════════════════════════
// PROVIDER & DATA
// ════════════════════════════════════════════

const AppContext = createContext<any>(null);
const useApp = () => useContext(AppContext);

const INITIAL_DATA: AppData = {
    news: [],
    subjects: {
        'Science': { id: 'Science', color: 'emerald', icon: 'Microscope', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'नेपाली': { id: 'नेपाली', color: 'purple', icon: 'Edit3', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'सामाजिक': { id: 'सामाजिक', color: 'amber', icon: 'Globe', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Maths': { id: 'Maths', color: 'red', icon: 'Sigma', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'English': { id: 'English', color: 'blue', icon: 'Languages', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Optional Maths': { id: 'Optional Maths', color: 'indigo', icon: 'Binary', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Account': { id: 'Account', color: 'orange', icon: 'ListChecks', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Computer': { id: 'Computer', color: 'cyan', icon: 'Monitor', chapters: [], videos: [], pdfs: [], modelQuestions: [] }
    },
    calendar: [],
    settings: { welcomeMessage: 'Namaste', registrationOpen: true }
};

const AppProvider = ({ children }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [data] = useState<AppData>(INITIAL_DATA);
    const [liveNews, setLiveNews] = useState<any[]>([
        { id: '1', title: 'Welcome to Aadhar Desk', content: 'Our new platform is now live. Explore study materials and interactive tests.', category: 'general', created_at: new Date().toISOString() },
        { id: '2', title: 'Exam Guidelines 2083', content: 'Important updates regarding the upcoming board examinations.', category: 'exam', created_at: new Date().toISOString() }
    ]);
    const [liveMaterials, setLiveMaterials] = useState<any[]>([
        { id: 'm1', subject: 'Science', type: 'model_question', title: 'Science Board Model 2083', file_url: '#', created_at: new Date().toISOString() },
        { id: 'm2', subject: 'Maths', type: 'note', title: 'Calculus Cheat Sheet', text_content: '### Derivatives\n- d/dx(sin x) = cos x\n- d/dx(cos x) = -sin x', created_at: new Date().toISOString() }
    ]);
    const [liveNotices, setLiveNotices] = useState<any[]>([
        { id: 'n1', text: 'Pre-board results will be published on Sunday.', type: 'info', created_at: new Date().toISOString() }
    ]);
    const [isInitializing, setIsInitializing] = useState(true);

    const fetchLiveNews = async () => {};
    const fetchLiveMaterials = async () => {};
    const fetchLiveNotices = async () => {};

    useEffect(() => {
        const init = async () => {
            const savedUser = localStorage.getItem('logged_user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            } else {
                // Initialize default student profile
                const defaultUser: User = {
                    id: 'guest_' + Math.random().toString(36).substr(2, 9),
                    name: 'Guest Scholar',
                    email: 'guest@aadhar.edu.np',
                    grade: '10',
                    xp: 1250,
                    streak: 5,
                    badges: ['Early Bird'],
                    testsCompleted: 4,
                    avgScore: 85,
                    completedChapters: []
                };
                setUser(defaultUser);
                localStorage.setItem('logged_user', JSON.stringify(defaultUser));
            }
            setIsInitializing(false);
        };
        init();
    }, []);

    const addTestResult = (score: number, total: number = 10, timeSpentSecs: number = 120) => {
        if (!user) return;
        
        let newXp = user.xp + (score * 25);
        let newTests = user.testsCompleted + 1;
        let newAvg = ((user.avgScore * user.testsCompleted) + ((score/total)*100)) / newTests;
        
        let newBadges = [...user.badges];
        
        if (score === total && !newBadges.includes('Perfect Score')) {
            newBadges.push('Perfect Score');
        }
        if (timeSpentSecs < (total * 60) / 2 && score >= total * 0.8 && !newBadges.includes('Speed Demon')) {
            newBadges.push('Speed Demon');
        }
        if (newTests >= 5 && !newBadges.includes('Consistent Performer')) {
            newBadges.push('Consistent Performer');
        }

        const updatedUser = { 
            ...user, 
            xp: newXp, 
            testsCompleted: newTests, 
            avgScore: newAvg,
            badges: newBadges
        };

        setUser(updatedUser);
        localStorage.setItem('logged_user', JSON.stringify(updatedUser));
    };

    const toggleChapterComplete = (chapterId: string) => {
        if (!user || !chapterId) return;
        const isComplete = user.completedChapters?.includes(chapterId) || false;
        const newList = isComplete 
            ? user.completedChapters.filter(id => id !== chapterId)
            : [...(user.completedChapters || []), chapterId];
        
        const updatedUser = { ...user, completedChapters: newList };
        setUser(updatedUser);
        localStorage.setItem('logged_user', JSON.stringify(updatedUser));
    };

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
                <div className="flex gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
                </div>
                <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Authenticating</div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={{ 
            user, setUser, data, 
            liveNews, liveMaterials, liveNotices, 
            fetchLiveNews, fetchLiveMaterials, fetchLiveNotices, 
            addTestResult, toggleChapterComplete,
            isInitializing
        }}>
            {children}
        </AppContext.Provider>
    );
};

export default App;
