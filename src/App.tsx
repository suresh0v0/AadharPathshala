import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  Home, BookOpen, MessageSquare, ListChecks, Newspaper, 
  ChevronRight, ArrowLeft, Send, Sparkles, Trophy, 
  History, Calculator, User as UserIcon,
  PlayCircle, FileText, Trash2, Edit3,
  Clock, Plus, FlaskConical, Globe, Divide, TrendingUp, Activity, Monitor,
  Layout as ToolLayout, GraduationCap, Timer, Book, Zap, Users,
  Bot, Coffee, Pause, Play, RotateCcw, Flame, Wind, Calendar,
  Dna, Binary, Languages, Microscope, Sigma, Scale, Lightbulb, Bell, Megaphone,
  Pin, Info, AlertTriangle, ChevronDown, CheckCircle2, Search, Download, PenTool, Eye,
  ClipboardCheck, XCircle, Library
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Groq from "groq-sdk";
import { AppData, User, SubjectData, NewsItem, SubjectType, Chapter, LeaderboardEntry, CalendarEvent } from './types.ts';
import { supabase } from './supabaseClient.js';

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
            model: "llama3.1-70b",
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
            model: "llama-3.1-70b-versatile",
            messages: formattedMessages as any,
            response_format: isJson ? { type: "json_object" } : undefined
        });
        return response.choices[0]?.message?.content || "";
    }
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
            model: "Meta-Llama-3.1-70B-Instruct",
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
            model: "llama-3.1-70b-versatile",
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
  'Economics': { color: 'green', icon: TrendingUp, gradient: 'from-green-500 to-emerald-600' },
  'Health': { color: 'rose', icon: Activity, gradient: 'from-rose-400 to-red-500' }
};

const BOOK_LINKS: Record<string, string> = {
    'Maths': 'https://drive.google.com/file/d/1QEgiAKkKofFFAxDyVoFD40LgBWe0s8n9/view?usp=drivesdk',
    'Optional Maths': 'https://drive.google.com/file/d/1vJS4bY7fkLs5QbrLXFNKmvFFhrznzGrg/view?usp=drivesdk',
    'Science': 'https://drive.google.com/file/d/1lwcVyKC2tZyzScya7Qfw1p-9CWdVfkKm/view?usp=drivesdk',
    'सामाजिक': 'https://drive.google.com/file/d/1t3hbvuPC2CgPGvdwmKRbrCVOHPiKSAhl/view?usp=drivesdk',
    'English': 'https://drive.google.com/file/d/1kmRslmTG3vzXFGwjE5xsdE0SzAPi75bt/view?usp=drivesdk',
    'नेपाली': 'https://drive.google.com/file/d/1aaVFJKXRRIrW4UriLQaaopVpkaA9AQZY/view?usp=drivesdk',
    'Computer': 'https://drive.google.com/file/d/1XL9dSK7Vjvxo888E4Thlxbb5yQSIjUdb/view?usp=drivesdk',
    'Account': 'https://drive.google.com/file/d/1QEgiAKkKofFFAxDyVoFD40LgBWe0s8n9/view?usp=drivesdk',
    'Economics': 'https://drive.google.com/file/d/1UEAYMTbPv1zSKzBKjwwBVEa3-UeiSz0E/view?usp=drivesdk'
};

const STATIC_MCQS: Record<string, any[]> = {
    'Science': [
        {
            setName: 'MCQ SET 1',
            questions: [
                { q: "What is the SI unit of force?", a: "Joule", b: "Newton", c: "Watt", d: "Pascal", correct: "b", explanation: "Newton is the SI unit of force, named after Sir Isaac Newton." },
                { q: "What is the SI unit of power?", a: "Volt", b: "Ohm", c: "Watt", d: "Ampere", correct: "c", explanation: "Watt (W) is the unit of power, defined as one joule per second." },
                { q: "Which gas is filled in electric bulbs?", a: "Oxygen", b: "Hydrogen", c: "Argon", d: "Carbon dioxide", correct: "c", explanation: "Argon is an inert gas used to prevent the filament from oxidizing." },
                { q: "What is the chemical formula of common salt?", a: "KCl", b: "NaCl", c: "MgCl2", d: "NaOH", correct: "b", explanation: "Sodium Chloride (NaCl) is known as table salt." },
                { q: "What is the acceleration due to gravity on Earth's surface?", a: "8.9 m/s²", b: "9.8 m/s²", c: "10.8 m/s²", d: "7.8 m/s²", correct: "b", explanation: "Standard gravity is approximately 9.80665 m/s²." },
                { q: "Which lens is used to correct short-sightedness (Myopia)?", a: "Convex", b: "Concave", c: "Bifocal", d: "Cylindrical", correct: "b", explanation: "Concave lenses are used to diverge light rays before they enter the eye." },
                { q: "What is the power of a lens with focal length 20 cm?", a: "2D", b: "4D", c: "5D", d: "10D", correct: "c", explanation: "Power = 1/f(m). 1/0.2 = 5D." },
                { q: "Which part of the eye controls the amount of light entering?", a: "Retina", b: "Cornea", c: "Iris", d: "Lens", correct: "c", explanation: "The iris regulates the size of the pupil." },
                { q: "What is the primary cause of global warming?", a: "Acid rain", b: "Greenhouse effect", c: "Ozone depletion", d: "Volcanic eruptions", correct: "b", explanation: "Increased concentration of greenhouse gases traps more heat." },
                { q: "Which element has atomic number 10?", a: "Fluorine", b: "Neon", c: "Sodium", d: "Magnesium", correct: "b", explanation: "Neon is a noble gas with atomic number 10." },
                { q: "What is the valency of Carbon?", a: "2", b: "3", c: "4", d: "1", correct: "c", explanation: "Carbon has 4 electrons in its outer shell." },
                { q: "Which indicator turns red in an acidic solution?", a: "Red litmus", b: "Blue litmus", c: "Phenolphthalein", d: "Turmeric", correct: "b", explanation: "Acid turns blue litmus red." },
                { q: "Which metal is liquid at room temperature?", a: "Sodium", b: "Mercury", c: "Lead", d: "Iron", correct: "b", explanation: "Mercury is the only common metal liquid at standard temperature." },
                { q: "What is the electronic configuration of Sodium (Na)?", a: "2, 8", b: "2, 8, 1", c: "2, 7", d: "2, 8, 2", correct: "b", explanation: "Sodium has atomic number 11." },
                { q: "Which device converts electrical energy into mechanical energy?", a: "Generator", b: "Transformer", c: "Electric Motor", d: "Battery", correct: "c", explanation: "Motors use electromagnetism to create motion." },
                { q: "What is the chemical name of Vitamin C?", a: "Citric acid", b: "Ascorbic acid", c: "Folic acid", d: "Acetic acid", correct: "b", explanation: "Ascorbic acid is necessary for collagen synthesis." },
                { q: "Which tissue transports water in plants?", a: "Phloem", b: "Xylem", c: "Parenchyma", d: "Cambium", correct: "b", explanation: "Xylem carries water/minerals; Phloem carries food." },
                { q: "How many chromosomes are in a normal human cell?", a: "23", b: "44", c: "46", d: "48", correct: "c", explanation: "Humans have 23 pairs of chromosomes." },
                { q: "Which hormone is known as the emergency hormone?", a: "Insulin", b: "Adrenaline", c: "Thyroxine", d: "Estrogen", correct: "b", explanation: "Adrenaline prepares the body for fight or flight." },
                { q: "Which element is a semiconductor?", a: "Copper", b: "Silicon", c: "Aluminum", d: "Gold", correct: "b", explanation: "Silicon is widely used in electronics as a semiconductor." },
                { q: "What is the focal length of a plane mirror?", a: "Zero", b: "10 cm", c: "Infinity", d: "20 cm", correct: "c", explanation: "The radius of curvature of a plane mirror is infinite." },
                { q: "Which blood group is known as the universal donor?", a: "AB positive", b: "O negative", c: "A positive", d: "B negative", correct: "b", explanation: "O- can be given to patients of any blood type." },
                { q: "What is the main component of natural gas?", a: "Ethane", b: "Propane", c: "Methane", d: "Butane", correct: "c", explanation: "Natural gas is mostly Methane (CH4)." },
                { q: "What is the symbol of Silver?", a: "Si", b: "Ag", c: "Au", d: "Pb", correct: "b", explanation: "From Latin 'Argentum'." },
                { q: "What is the unit of frequency?", a: "Hertz", b: "Joule", c: "Newton", d: "Watt", correct: "a", explanation: "One hertz (Hz) is one cycle per second." },
                { q: "Which process occurs in the sun to produce energy?", a: "Nuclear fission", b: "Nuclear fusion", c: "Chemical burning", d: "Oxidation", correct: "b", explanation: "Hydrogen nuclei fuse to form Helium." },
                { q: "What is the functional unit of the kidney?", a: "Neuron", b: "Nephron", c: "Alveoli", d: "Capillary", correct: "b", explanation: "Nephrons filter blood and produce urine." },
                { q: "Which part of the brain controls body balance?", a: "Cerebrum", b: "Cerebellum", c: "Medulla", d: "Pons", correct: "b", explanation: "The cerebellum coordinates movement and balance." },
                { q: "Which base is commonly used in antacids?", a: "Sodium hydroxide", b: "Magnesium hydroxide", c: "Calcium oxide", d: "Ammonium hydroxide", correct: "b", explanation: "It neutralizes excess stomach acid." },
                { q: "Which acid is present in an ant's sting?", a: "Oxalic acid", b: "Methanoic acid", c: "Citric acid", d: "Lactic acid", correct: "b", explanation: "Also known as Formic acid." }
            ]
        }
    ]
};

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
          <div className="logo cursor-pointer flex items-center gap-2 group" onClick={() => navigate('/')}>
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
    </div>
  );
};

// --- MOCK TEST ---
const MockTest = () => {
    const { addTestResult, user } = useApp();
    const storageKey = `aadhar_mock_${user?.id || 'guest'}`;

    const [status, setStatus] = useState<'setup' | 'quiz' | 'result' | 'review'>(() => {
        const saved = localStorage.getItem(`${storageKey}_status`);
        return saved ? saved as any : 'setup';
    });
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem(`${storageKey}_settings`);
        return saved ? { ...JSON.parse(saved), model: JSON.parse(saved).model || 'momo' } : { subject: 'Science' as SubjectType, count: 5, model: 'momo' as 'momo' | 'achar' };
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
                    { role: "system", content: "You are an expert exam paper generator for Grade 10 Nepal Students (SEE). You must return high-quality multiple choice questions. You MUST return ONLY the JSON object, NO other text. Do NOT include greetings. IMPORTANT: Use LaTeX ($...$) for ALL mathematical symbols, numbers, and formulas. Avoid mistakes in correct answers." },
                    { role: "user", content: `Generate ${settings.count} accurate multiple-choice questions for Grade 10 SEE preparation in the subject: ${settings.subject}. 
                    IMPORTANT: Each option ('a', 'b', 'c', 'd') must be a distinct possible answer. NEVER include the question text in the options.
                    Ensure that 'correct' field is one of 'a', 'b', 'c', 'd'.
                    ${isNepaliSubject ? 'IMPORTANT: BOTH QUESTIONS AND ANSWERS MUST BE IN NEPALI LANGUAGE.' : 'Use professional English Language.'}
                    Return JSON format: { "quiz": [{ "q": "...", "a": "...", "b": "...", "c": "...", "d": "...", "correct": "a", "explanation": "..." }] }` }
                ],
                model: "llama-3.1-8b-instant",
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
                                { id: 'achar', label: 'ACHAR', desc: 'Fast Analysis', color: 'emerald-500', icon: Zap }
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
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-6 md:mb-12 leading-[1.15] tracking-tighter uppercase italic">{questions[currentIdx].q}</h2>
                        <div className="grid grid-cols-1 gap-2 md:gap-4">
                            {['a', 'b', 'c', 'd'].map((c, i) => (
                                <button
                                    key={c}
                                    onClick={() => handleAnswer(c)}
                                    className="w-full text-left p-4 md:p-8 border-2 border-slate-50 rounded-[1.5rem] md:rounded-[2.5rem] font-bold text-[0.85rem] md:text-lg hover:border-blue hover:bg-blue/5 active:scale-[0.97] transition-all flex items-center gap-4 md:gap-6 group relative"
                                >
                                    <span className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl flex items-center justify-center text-sm font-black transition-all uppercase border-2",
                                        "bg-slate-50 text-slate-400 border-slate-100 group-hover:border-blue group-hover:text-blue"
                                    )}>
                                        {c}
                                    </span>
                                    <span className="text-slate-700 leading-tight">{questions[currentIdx][c]}</span>
                                </button>
                            ))}
                        </div>
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

                    <div className="mb-10 text-left bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 relative z-10">
                         <div className="flex justify-between items-center mb-6">
                              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                  <Users className="w-5 h-5 text-blue" />
                                  Global Rank (Mock Tests)
                              </h3>
                              <span className="text-[0.6rem] bg-blue text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Live</span>
                         </div>
                         <div className="space-y-3">
                              {[
                                  { name: "Prashant K.", score: score >= questions.length ? score - 1 : Math.min(questions.length, score + 2), xp: 1450 },
                                  { name: user?.name || "You", score: score, xp: (user?.xp || 0) + (score * 25), isUser: true },
                                  { name: "Sita R.", score: Math.max(0, score - 1), xp: 1120 }
                              ].sort((a,b) => b.score - a.score || b.xp - a.xp).map((entry, idx) => (
                                  <div key={idx} className={cn("flex items-center justify-between p-4 rounded-2xl border", entry.isUser ? "bg-white border-emerald-500 shadow-md shadow-emerald-500/10" : "bg-white border-slate-100")}>
                                       <div className="flex items-center gap-4">
                                            <span className={cn("w-6 font-black text-sm", idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : "text-amber-700")}>#{idx + 1}</span>
                                            <span className={cn("font-black text-sm uppercase tracking-tight", entry.isUser ? "text-emerald-600" : "text-slate-700")}>{entry.name}</span>
                                       </div>
                                       <div className="flex gap-4">
                                            <span className="text-xs font-bold text-slate-400">{entry.xp} XP</span>
                                            <span className="text-xs font-black text-slate-800">{entry.score}/{questions.length}</span>
                                       </div>
                                  </div>
                              ))}
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

                    <div className="space-y-3 relative z-10">
                        <button onClick={() => setStatus('review')} className="w-full py-6 bg-[#020617] text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest">Review Protocol</button>
                        <button onClick={clearMockTest} className={cn("w-full py-6 text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest", currentSubjectConfig.gradient)}>Initiate New Trial</button>
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
                        <button onClick={() => setStatus('result')} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest">Back</button>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, i) => (
                            <ReviewCard key={i} question={q} index={i} subject={settings.subject} />
                        ))}
                    </div>

                    <button onClick={clearMockTest} className={cn("w-full py-6 text-white rounded-[2rem] font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest", currentSubjectConfig.gradient)}>Initiate New Trial</button>
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
            // @ts-ignore
            const viteGroqKey = import.meta.env.VITE_GROQ_API_KEY || "";
            const processGroqKey = typeof process !== 'undefined' && process.env ? process.env.GROQ_API_KEY : "";
            const groqKey = processGroqKey || viteGroqKey;
            
            const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
            const prompt = `Student performed a Grade 10 Nepal SEE ${subject} Exam.
Question: ${question.q}
Options: a: ${question.a}, b: ${question.b}, c: ${question.c}, d: ${question.d}
Correct: ${question.correct}
Student Answered: ${question.userChoice}

Explain WHY the correct answer is ${question.correct} and why student's choice was wrong.
Be extremely direct and brief. Use bullet points if needed. No greetings, no catchphrases.
Use simple "Neplish" (English + Nepali mix). Focus on logic. 
Keep it under 50 words.`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
            });
            setExplanation(completion.choices[0]?.message?.content || "Could not generate review.");
        } catch (e) {
            setExplanation("Brain freeze! Groq API is acting up.");
        } finally {
            setLoading(false);
        }
    };

    const isCorrect = question.userChoice === question.correct;

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                    <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-slate-400 text-sm">{index + 1}</span>
                    <h3 className="text-lg font-black text-slate-800 leading-tight uppercase italic">{question.q}</h3>
                </div>
                {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" /> : <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['a', 'b', 'c', 'd'].map(key => (
                    <div key={key} className={cn(
                        "p-4 rounded-2xl border-2 text-sm font-bold flex items-center gap-3",
                        key === question.correct ? "bg-emerald-50 border-emerald-500 text-emerald-700" : 
                        (key === question.userChoice && !isCorrect) ? "bg-rose-50 border-rose-500 text-rose-700" :
                        "bg-slate-50 border-transparent text-slate-400"
                    )}>
                        <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center text-[0.65rem] shrink-0 uppercase">{key}</span>
                        {question[key]}
                    </div>
                ))}
            </div>

            {explanation ? (
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-fade-up">
                    <div className="flex items-center gap-2 mb-3 text-blue">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-[0.6rem] font-black uppercase tracking-widest">ACHAR AI ANALYSIS</span>
                    </div>
                    <div className="prose prose-sm max-w-none text-slate-600 font-medium">
                        <Markdown>{explanation}</Markdown>
                    </div>
                </div>
            ) : (
                <button 
                    onClick={getAIReview}
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
                >
                    {loading ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                    {loading ? 'Analyzing...' : 'AI Deep Insight'}
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
1. MATH & LATEX: ALWAYS use standard LaTeX. Wrap inline math with $. CRITICAL: For block math, you MUST put double dollar signs $$ on their own separate lines. Example:
$$
E = mc^2
$$
2. IMAGES: When explaining a concept, always include a relevant diagram using markdown in this EXACT format ON A SEPARATE DOUBLE NEWLINE:

![Image](https://image.pollinations.ai/prompt/{DESCRIPTION}?width=800&height=450&nologo=true)

Replace {DESCRIPTION} with a highly detailed, URL-encoded English description (e.g. detailed%20diagram%20of%20a%20plant%20cell). DO NOT append this to the same line as math equations. Always put double newlines before the image.
3. NO GREETINGS: Answer the questions directly. No "Hello", "Sure", or "I can help".
4. PARAGRAPHS: Max 2 sentences each. Keep it clean.`;

            if (activeTutor === 'achar') {
                // GROQ (ACHAR) Implementation
                const systemPrompt = `You are ACHAR, the Instant Helper. 
IDENTITY: Fast and efficient. 
PERSONALITY: No greetings, no greetings, no unnecessary words.
STYLE: Short bullet points.
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
IDENTITY: Academic, specialized in Grade 10 concepts.
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
IDENTITY: Reliable, steady, factual.
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

                    <div className="text-center space-y-3 py-10">
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
                            "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg", 
                            activeTutor === 'momo' ? "bg-linear-to-r from-pink-500 to-rose-600 shadow-rose-500/20" : 
                            activeTutor === 'mango' ? "bg-linear-to-r from-amber-400 to-orange-600 shadow-orange-500/20" :
                            "bg-linear-to-r from-slate-700 to-slate-900 shadow-slate-900/20"
                        )}>
                            {activeTutor === 'momo' ? <Bot className="text-white w-5 h-5 md:w-6 md:h-6" /> : 
                             activeTutor === 'mango' ? <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" /> :
                             <Zap className="text-emerald-400 w-5 h-5 md:w-6 md:h-6" />}
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
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {m.text}
                                    </Markdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex flex-col gap-4 self-start">
                            <div className="flex items-center gap-3 p-6 bg-white border border-slate-100 rounded-[2.5rem] rounded-tl-none shadow-sm animate-pulse">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-2 h-2 bg-blue rounded-full animate-bounce" />
                                </div>
                                <span className="text-[0.6rem] font-black uppercase text-slate-400 tracking-[0.2em]">{activeTutor === 'momo' ? 'Momo is thinking deep...' : 'Achar is serving fast...'}</span>
                            </div>
                        </div>
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
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');

    const btns = [
        'C', 'DEL', '%', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '=', '√'
    ];

    const handleClick = (val: string) => {
        if (val === 'C') { setDisplay('0'); setEquation(''); }
        else if (val === 'DEL') setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
        else if (val === '=') {
            try { 
                // Using a safer alternative to eval for a simple calculator
                const res = Function(`"use strict"; return (${equation || display})`)();
                setDisplay(res.toString()); 
                setEquation(''); 
            } catch { setDisplay('Error'); }
        } else if (val === '√') setDisplay(Math.sqrt(parseFloat(display)).toString());
        else {
            setDisplay(d => d === '0' && !isNaN(Number(val)) ? val : d + val);
            setEquation(e => e + val);
        }
    };

    return (
        <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl border border-white/5 max-w-[400px] mx-auto overflow-hidden relative">
            <div className="text-right mb-6 h-28 flex flex-col justify-end px-4">
                <p className="text-blue font-mono text-sm mb-2 opacity-60 tracking-widest uppercase">{equation || 'Input Value'}</p>
                <p className="text-5xl font-black text-white tracking-tighter truncate leading-none">{display}</p>
            </div>
            <div className="grid grid-cols-4 gap-3 relative z-10">
                {btns.map(b => (
                    <button
                        key={b}
                        onClick={() => handleClick(b)}
                        className={cn(
                            "h-16 rounded-2xl flex items-center justify-center font-black text-lg transition-all active:scale-90",
                            ['/', '*', '-', '+', '=', '√'].includes(b) ? "bg-blue text-white shadow-lg shadow-blue/20" :
                            ['C', 'DEL'].includes(b) ? "bg-rose-500 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                    >
                        {b}
                    </button>
                ))}
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue/10 rounded-full blur-3xl" />
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

    const calculateGPA = () => {
        const totalPoints = [...compulsory, ...optional].reduce((acc, s) => {
            const { theory, practical } = marks[s.name];
            const total = (theory / 75 * 75) + (practical / 25 * 25);
            const percentage = (theory + practical); // Max 100
            let gp = 0;
            if (percentage >= 90) gp = 4.0;
            else if (percentage >= 80) gp = 3.6;
            else if (percentage >= 70) gp = 3.2;
            else if (percentage >= 60) gp = 2.8;
            else if (percentage >= 50) gp = 2.4;
            else if (percentage >= 40) gp = 2.0;
            else if (percentage >= 35) gp = 1.6;
            else gp = 0;
            return acc + (gp * s.credit);
        }, 0);
        return totalPoints / 28; // Total credits
    };

    const gpa = calculateGPA();

    return (
        <div className="space-y-6">
            <div className="bg-linear-to-br from-indigo-500 to-blue-600 p-10 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden">
                <p className="text-[0.7rem] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Composite GPA Estimate</p>
                <h1 className="text-8xl font-black italic tracking-tighter mb-6">{gpa.toFixed(2)}</h1>
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full text-[0.7rem] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                    <Trophy className="w-4 h-4 text-amber-400" /> SEE 2083 Standard
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Subject Grading Grid</h3>
                {[...compulsory, ...optional].map((s, i) => (
                    <div key={s.name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6 group hover:border-blue transition-all">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border border-slate-100 uppercase", i < 5 ? "bg-blue-50 text-blue" : "bg-purple-50 text-purple-600")}>
                                {s.name.charAt(0)}
                            </div>
                            <div className="text-left">
                                <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none mb-1">{s.name}</h4>
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{i < 5 ? 'Compulsory' : 'Optional'}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="space-y-1 text-center">
                                <p className="text-[0.55rem] font-black text-slate-300 uppercase">Theory (75)</p>
                                <input 
                                    type="number" 
                                    max="75"
                                    value={marks[s.name].theory}
                                    onChange={e => setMarks({...marks, [s.name]: { ...marks[s.name], theory: Math.min(75, parseInt(e.target.value) || 0) }})}
                                    className="w-20 bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-center text-slate-800 outline-none focus:ring-2 focus:ring-blue/10"
                                />
                            </div>
                            <div className="space-y-1 text-center">
                                <p className="text-[0.55rem] font-black text-slate-300 uppercase">Prac (25)</p>
                                <input 
                                    type="number" 
                                    max="25"
                                    value={marks[s.name].practical}
                                    onChange={e => setMarks({...marks, [s.name]: { ...marks[s.name], practical: Math.min(25, parseInt(e.target.value) || 0) }})}
                                    className="w-20 bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-center text-slate-800 outline-none focus:ring-2 focus:ring-blue/10"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CalculatorSuite = () => {
    const [searchParams] = useSearchParams();
    const [tab, setTab] = useState<'gpa' | 'standard'>((searchParams.get('tab') as any) || 'gpa');

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-blue to-indigo rounded-2xl flex items-center justify-center shadow-lg">
                    <Calculator className="text-white w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 leading-none">Aadhar Desk</h1>
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

/* ── TOOLKIT DASHBOARD ── */
const HomePage = () => {
    const { user } = useApp();
    const navigate = useNavigate();

    const cycleColors = ['bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-indigo-500', 'bg-orange-500', 'bg-cyan-500', 'bg-purple-500'];
    const [colorIndex, setColorIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setColorIndex(prev => (prev + 1) % cycleColors.length);
        }, 3000); // changes every 3 seconds
        return () => clearInterval(interval);
    }, [cycleColors.length]);

    return (
        <div className="space-y-6 pb-24">
            {/* HERO SECTION - GRADIENT ANIMATED BOX */}
            <div className="relative h-[180px] md:h-[220px]">
                <div 
                    className={cn(
                        "absolute inset-0 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 text-white flex flex-col justify-center overflow-hidden transition-colors duration-1000 shadow-xl", 
                        cycleColors[colorIndex]
                    )}
                >
                    <div className="relative z-10 space-y-2">
                        <p className="text-sm md:text-lg font-medium opacity-90">
                            Namaste{user?.name ? `, ${user.name}` : ''}! 🙏
                        </p>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-none uppercase italic drop-shadow-lg">
                            Ready to excel today?
                        </h1>
                        <p className="text-xs md:text-sm font-bold opacity-80 uppercase tracking-widest mt-2">
                            Aadhar Pathshala SEE 2083
                        </p>
                    </div>
                    
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            </div>

            {/* DASHBOARD WIDGETS */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center">
                    <Trophy className="w-8 h-8 text-amber-500 mb-2" />
                    <span className="text-2xl font-black text-slate-800 leading-none">{user?.xp || 0}</span>
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Total XP</span>
                </div>
                <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center text-center">
                    <Flame className="w-8 h-8 text-rose-500 mb-2" />
                    <span className="text-2xl font-black text-slate-800 leading-none">{user?.streakDays || 1}</span>
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Day Streak</span>
                </div>
            </div>

            {/* PROGRESS SECTION */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Syllabus Progress</h3>
                    <span className="text-xl font-black text-rose-500">42%</span>
                </div>
                <div className="space-y-3">
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '42%' }}
                            className="h-full bg-blue rounded-full"
                        />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Next: Complete Science Chapter 4 - Light</p>
                </div>
            </div>

            {/* TOOLKIT SECTION */}
            <AadharToolkit />

            {/* QUICK ACCESS SECTION */}
            <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 px-1">
                    <span role="img" aria-label="horn" className="text-xl">📢</span>
                    <h2 className="text-xl font-black text-[#1D4ED8] tracking-tight">Quick Access</h2>
                    <div className="flex-1 h-[1px] bg-slate-100 ml-2" />
                </div>

                <div 
                    onClick={() => navigate('/news')}
                    className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-xl md:rounded-2xl flex shrink-0 items-center justify-center border border-rose-100">
                             <Megaphone className="w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-black text-slate-800 tracking-tight leading-none mb-1">CDC Board Updates</p>
                            <p className="text-xs md:text-sm font-bold text-slate-400 font-sans tracking-normal">Latest SEE 2083 notices</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>

                <div className="mt-4">
                    <NoticeBoard />
                </div>
            </div>

            {/* AI RECOMMENDATION / NEXT BEST STEP */}
            <div className="bg-linear-to-br from-indigo-50 to-blue-50 p-6 md:p-8 rounded-[2rem] shadow-sm border border-indigo-100 flex flex-col md:flex-row items-center gap-5 md:gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/50 rounded-full blur-[40px] -translate-y-10 translate-x-10" />
                <div className="w-16 h-16 shrink-0 bg-white shadow-md rounded-2xl flex items-center justify-center relative z-10 text-indigo-600">
                    <Sparkles className="w-8 h-8" />
                </div>
                <div className="flex-1 relative z-10 text-center md:text-left">
                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">Aadhar Pro Suggests</h3>
                    <p className="text-slate-800 font-bold text-[0.95rem] md:text-lg leading-tight mb-4">
                        Based on your low score in the last Science Mock Test, you should review the <span className="text-indigo-600">Light and Magnification</span> module.
                    </p>
                    <button onClick={() => navigate('/hub/science')} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-colors">
                        Review Module
                    </button>
                </div>
            </div>
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
        { id: 'dictionary', label: 'Dictionary', icon: Book, color: 'emerald', path: '/tools/dictionary' },
        { id: 'calculator', label: 'Calculator', icon: Calculator, color: 'amber', path: '/tools/calculator?tab=standard' },
        ...(isToolsPage ? [
            { id: 'gpa', label: 'GPA Calculator', icon: Activity, color: 'rose', path: '/tools/calculator?tab=gpa' },
            { id: 'converter', label: 'Unit Converter', icon: Scale, color: 'blue', path: '/tools/converter' },
            { id: 'calendar', label: 'Exam Calendar', icon: Calendar, color: 'purple', path: '/tools/calendar' },
            { id: 'todo', label: 'To-Do List', icon: ListChecks, color: 'teal', path: '/tools/todo' }
        ] : []),
        { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'rose', path: '/tools/timer' },
        { id: 'formulas', label: 'Formulas', icon: Sigma, color: 'purple', path: '/tools/formulas' },
        { id: 'notepad', label: 'Notepad & Files', icon: Edit3, color: 'orange', path: '/tools/notes' }
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
                <header className="space-y-1 mb-8 pt-4">
                    <h1 className="text-4xl font-black text-[#020617] italic tracking-tighter uppercase leading-none">The Toolkit</h1>
                    <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-[0.3em] ml-1">Universal Core Curriculum V.22</p>
                </header>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tools.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button
                            key={t.id}
                            onClick={() => navigate(t.path)}
                            className="bg-white p-4 md:p-6 rounded-[1.2rem] md:rounded-[2rem] border border-slate-50 shadow-[0_5px_15px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-blue/20 transition-all group active:scale-95 text-center min-h-[100px] md:min-h-[140px]"
                        >
                            <div className={cn(
                                "w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0",
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
    const [currentIndex, setCurrentIndex] = useState(0);
    const notices = [
        { id: '1', type: 'alert', text: 'SEE Exam Form deadline extended to Chaitra 5 for all districts.' },
        { id: '2', type: 'info', text: 'New Model Question Sets for Optional Maths 2083 uploaded to the Hub.' },
        { id: '3', type: 'update', text: 'Aadhar Pro AI now supports high-speed Nepali script interaction.' }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % notices.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [notices.length]);

    return (
        <div className="mb-10 animate-fade-up">
            <div className="flex items-center gap-2 mb-4 px-1">
                <Megaphone className="w-5 h-5 text-rose-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#020617]">Live Notice Board</h2>
                <div className="flex-1 h-[2px] bg-linear-to-r from-slate-100 to-transparent ml-2" />
            </div>
            
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5 group">
                <div className="absolute top-0 right-0 p-4">
                    <Bell className="w-6 h-6 text-white/20 animate-swing origin-top" />
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative z-10 min-h-[80px] flex flex-col justify-center"
                    >
                        <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest mb-4",
                            notices[currentIndex].type === 'alert' ? "bg-red text-white" : "bg-blue text-white"
                        )}>
                            <Pin className="w-3 h-3" />
                            {notices[currentIndex].type}
                        </div>
                        <p className="text-xl font-bold text-white leading-tight tracking-tight">
                            {notices[currentIndex].text}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-2">
                    {notices.map((_, i) => (
                        <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === currentIndex ? "w-8 bg-blue" : "w-3 bg-white/10")} />
                    ))}
                </div>
                
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

const NewsPage = () => {
    const { data } = useApp();

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="space-y-1 mb-10">
                <h1 className="text-5xl font-black text-[#020617] italic tracking-tighter uppercase">the pulse</h1>
                <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-[0.3em] ml-1">Official NEB & Board Updates</p>
            </div>

            <NoticeBoard />

            <div className="space-y-12">
                <div className="flex items-center gap-3 px-1">
                    <History className="w-5 h-5 text-slate-300" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Bulletin Archive</h2>
                    <div className="flex-1 h-[1px] bg-slate-100" />
                </div>

                {data.news.map((n, i) => (
                    <motion.div
                        key={n.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.03)] overflow-hidden relative group active:scale-[0.98] transition-transform"
                    >
                        {n.imageUrl && (
                            <div className="w-full h-72 overflow-hidden relative">
                                <img 
                                    src={n.imageUrl} 
                                    alt={n.title} 
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-[#020617]/90 via-[#020617]/20 to-transparent" />
                                <div className="absolute bottom-6 left-8 flex gap-2">
                                    <span className={cn("text-[0.6rem] font-black px-4 py-2 rounded-2xl uppercase tracking-widest text-white border border-white/20 backdrop-blur-xl", n.tagBg || 'bg-blue/80')}>
                                        {n.tag}
                                    </span>
                                </div>
                            </div>
                        )}
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date Published</p>
                                    <span className="text-[0.75rem] font-black text-slate-800 uppercase tracking-tight">{n.date}</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-4 leading-[1.1] tracking-tight uppercase group-hover:text-blue transition-colors">{n.title}</h2>
                            <p className="text-[0.92rem] text-slate-500 leading-relaxed font-bold mb-8">{n.body}</p>
                            
                            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                                <div className="flex items-center gap-2 text-blue text-[0.7rem] font-black uppercase tracking-widest">
                                    <span>Read Full Report</span>
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
        if (sectionId === 'book') {
            const link = BOOK_LINKS[name as string];
            if (link) {
                window.open(link, '_blank');
            } else {
                alert("Note: This book section is currently being updated for the 2083 session. Please check back in a few hours!");
            }
        } else {
            navigate(`/hub/${name}/${sectionId}`);
        }
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
    const navigate = useNavigate();
    const [useTimer, setUseTimer] = useState(true);
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];
    
    const sets = STATIC_MCQS[name as string] || [];

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

            {sets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {sets.map((set, idx) => (
                        <button 
                            key={idx}
                            onClick={() => navigate(`/hub/${name}/mcq-test/${idx}?timer=${useTimer}`)}
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
                        <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mt-1max-w-xs mx-auto">Admin is preparing verified MCQ sets for {name}. Please check back later!</p>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ── MCQ TEST PLAYER ── */
const MCQTestPlayer = () => {
    const { name, setIndex } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'quiz' | 'result'>('quiz');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timer, setTimer] = useState(1800); // 30 minutes
    const isTimerEnabled = searchParams.get('timer') !== 'false';
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];

    const setData = STATIC_MCQS[name as string]?.[parseInt(setIndex || '0')];
    const questions = setData?.questions || [];

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

    if (!setData) return <div>Set not found.</div>;

    const score = questions.reduce((acc: number, q: any, idx: number) => {
        return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);

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
                        <button onClick={() => navigate(`/hub/${name}`)} className="w-full py-6 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase tracking-widest text-sm">Return to Hub</button>
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
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="space-y-10 animate-fade-up pb-24">
            <header className="flex items-center justify-between">
                <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-indigo-100 flex items-center">
                        Student Profile
                    </div>
                </div>
            </header>

            <div className="text-center space-y-4">
                <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-[3rem] bg-linear-to-br from-indigo-500 to-purple-600 p-1">
                        <div className="w-full h-full bg-white rounded-[2.8rem] flex items-center justify-center overflow-hidden">
                            <UserIcon className="w-16 h-16 text-slate-200" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl border-4 border-[#F8FAFC] flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 shadow-[0_0_10px_white]" />
                    </div>
                </div>
                <div className="space-y-1">
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{user?.name}</h1>
                    <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { val: user?.xp.toLocaleString(), label: 'Total XP', icon: Zap, color: 'text-amber-500' },
                    { val: user?.streak + ' Days', label: 'Streak', icon: Flame, color: 'text-rose-500' },
                    { val: 'Rank #12', label: 'Global', icon: Trophy, color: 'text-indigo-500' }
                ].map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center space-y-2">
                        <s.icon className={cn("w-6 h-6", s.color)} />
                        <div className="text-center">
                            <p className="text-xl font-black text-slate-800 tracking-tighter leading-none">{s.val}</p>
                            <p className="text-[0.5rem] font-black text-slate-300 uppercase tracking-widest mt-1">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Achievements Unlocked</h2>
                <div className="grid grid-cols-2 gap-4">
                    {user?.badges.map((b: string) => (
                        <div key={b} className="bg-indigo-900 rounded-[2.5rem] p-6 text-white flex items-center gap-4 shadow-xl">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black tracking-tight leading-none mb-1 uppercase italic">{b}</h3>
                                <p className="text-[0.5rem] font-bold text-white/50 uppercase tracking-widest">Achiever</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={handleLogout}
                className="w-full py-5 border-2 border-rose-100 text-rose-500 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-rose-50 transition-colors"
            >
                Log Out Securely
            </button>
        </div>
    );
};

/* ── STUDY HUB & SUBJECTS ── */
const StudyHub = () => {
    const { data } = useApp();
    const navigate = useNavigate();

    return (
        <div className="space-y-12 animate-fade-up pb-24">
            <div className="space-y-1">
                <h1 className="text-5xl font-black text-[#020617] italic tracking-tighter uppercase">Subject Hub</h1>
                <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-[0.3em] ml-1">Universal Core Curriculum V.22</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(data.subjects).map(([name, sub]: [string, any], i) => {
                    const config = SUBJECTS_CONFIG[name as SubjectType] || { color: 'slate', icon: BookOpen, gradient: 'from-slate-500 to-slate-700' };
                    const Icon = config.icon;
                    return (
                        <motion.button
                            key={name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => navigate(`/hub/${name}`)}
                            className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex items-center gap-8 group active:scale-95 transition-all text-left relative overflow-hidden"
                        >
                            <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform bg-linear-to-br text-white", config.gradient)}>
                                <Icon className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2 tracking-tight uppercase">{name}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-slate-400">{sub.chapters.length} Modules</span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-blue">Curriculum Sync: 2083</span>
                                </div>
                            </div>
                            <ChevronRight className="text-slate-200 w-8 h-8 group-hover:text-blue group-hover:translate-x-1 transition-all" />
                            <div className={cn("absolute bottom-0 left-20 right-20 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-transparent via-blue-500 to-transparent", config.gradient)} />
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

const ChapterList = () => {
    const { name } = useParams();
    const { data } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Learning Modules</h1>
            </div>

            <div className="space-y-4">
                {sub.chapters.map((ch: any, i: number) => (
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
                                <h3 className="font-black text-slate-800 tracking-tight leading-none mb-1">{ch.title}</h3>
                                <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest">{ch.topics?.split(',')[0] || 'Unit Context'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[0.6rem] font-black text-blue px-3 py-1 bg-blue/5 rounded-full uppercase tracking-widest">{ch.marks} Marks</span>
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
    const { data } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];
    const chapter = sub.chapters.find((c: any) => c.id === chapterId);

    if (!chapter) return <div>Module not found</div>;

    return (
        <div className="space-y-8 animate-fade-up pb-24 text-slate-800">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}/chapters`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900 line-clamp-1">{chapter.title}</h1>
            </div>

            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl">
                <div className="relative z-10">
                    <p className="text-[0.65rem] font-black uppercase text-blue border-l-2 border-blue pl-4 mb-4 tracking-[0.3em]">Knowledge Module {chapterId}</p>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-tight mb-6 uppercase">Key Performance Targets</h2>
                    <div className="flex flex-wrap gap-2">
                        {chapter.topics?.split(',').map((t: string) => (
                            <span key={t} className="px-3 py-1 bg-white/10 rounded-xl text-[0.6rem] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                {t.trim()}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            </div>

            <div className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-xl prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:font-bold prose-p:text-slate-500 leading-relaxed">
                <Markdown>{chapter.contentHtml || '# Content Loading...\nDetailed study notes for this module are being processed by Aadhar Pro. Check back soon for the complete syllabus deep-dive.'}</Markdown>
            </div>
            
            <button 
                onClick={() => navigate('/ai')}
                className="w-full bg-blue text-white p-8 rounded-[3rem] shadow-2xl shadow-blue/20 flex items-center justify-between group active:scale-95 transition-all"
            >
                <div className="text-left">
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Stuck on this module?</p>
                    <p className="text-xl font-black uppercase italic tracking-tighter">Ask Aadhar Pro</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <Zap className="w-6 h-6" />
                </div>
            </button>
        </div>
    );
};

const VideoList = () => {
    const { name } = useParams();
    const { data } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Explainer TV</h1>
            </div>

            <div className="space-y-6">
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
    const { data } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Knowledge Base</h1>
            </div>

            <div className="space-y-4">
                {sub.pdfs.map((p: any) => (
                    <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:border-blue transition-all">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100 group-hover:scale-110 transition-transform">
                            <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase mb-1">{p.name}</h3>
                            <p className="text-[0.75rem] text-slate-400 font-bold leading-relaxed">{p.desc}</p>
                        </div>
                        <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-slate-900/10">
                            <ArrowLeft className="w-5 h-5 rotate-180" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NoteList = () => {
    const { name } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Repository</h1>
            </div>
            <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">No external notes yet</h2>
                <p className="text-[0.75rem] text-slate-400 font-bold max-w-[240px] mx-auto mt-2 leading-relaxed uppercase tracking-widest">Contribute your notes to earn XP for your district rank.</p>
            </div>
        </div>
    );
};

const ModelList = () => {
    const { name } = useParams();
    const { data } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];

    return (
        <div className="space-y-6 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(`/hub/${name}`)} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Question Bank</h1>
            </div>

            <div className="space-y-4">
                {sub.modelQuestions?.length > 0 ? sub.modelQuestions.map((q: any) => (
                    <div key={q.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden">
                        <span className="text-[0.6rem] font-black text-indigo-500 uppercase tracking-widest mb-3 block">Board Perspective</span>
                        <h3 className="font-black text-slate-900 text-lg mb-4">{q.q}</h3>
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic font-bold text-slate-500 text-[0.85rem]">
                            <Markdown>{q.answerHtml || '_Answer draft in progress..._'}</Markdown>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <Edit3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Questions Incoming</h2>
                        <p className="text-[0.75rem] text-slate-400 font-bold max-w-[240px] mx-auto mt-2 leading-relaxed uppercase tracking-widest">Processing latest NEB specification grids for 2083.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DictionaryPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const { user } = useApp();

    const terms = [
        { word: 'Gravity', def: 'Attraction between two masses. It is the force that keeps the planets in orbit around the sun and the moon in orbit around the Earth.', sub: 'Science', detail: 'Formula: F = G(m1m2)/d²' },
        { word: 'Algorithm', def: 'Step-by-step procedure for calculations. A set of rules to be followed in calculations or other problem-solving operations, especially by a computer.', sub: 'Computer', detail: 'Properties: Finiteness, Input, Output, Efficiency.' },
        { word: 'Democracy', def: 'Government by the people. A system of government by the whole population or all the eligible members of a state, typically through elected representatives.', sub: 'Social', detail: 'Types: Direct, Representative, Constitutional.' },
        { word: 'Cell', def: 'The basic unit of life. All living organisms are made up of one or more cells.', sub: 'Science', detail: 'Parts: Nucleus, Mitochondria, Ribosomes, Cell Membrane.' },
        { word: 'Triangle', def: 'A polygon with three edges and three vertices.', sub: 'Maths', detail: 'Area = ½ × base × height.' }
    ];

    const findWord = async () => {
        if (!search) return;
        setLoading(true);
        setResult(null);

        try {
            // Priority 1: Local Knowledge Base
            const localFound = terms.find(t => t.word.toLowerCase() === search.toLowerCase());
            if (localFound) {
                setResult(localFound);
                setLoading(false);
                return;
            }

            // Priority 2: Free Dictionary API
            try {
                const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${search.trim()}`);
                if (res.ok) {
                    const data = await res.json();
                    const meaning = data[0]?.meanings[0];
                    const definition = meaning?.definitions[0]?.definition || "Definition not found.";
                    const synonym = meaning?.synonyms?.[0] || meaning?.definitions[0]?.example || "";
                    
                    setResult({
                        word: data[0]?.word || search,
                        def: definition,
                        sub: meaning?.partOfSpeech || 'Noun',
                        detail: synonym ? `Example/Synonym: ${synonym}` : undefined,
                        source: 'Global Lexicon'
                    });
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.warn("Dictionary API failed, falling back to MOMO");
            }

            // Priority 3: MOMO AI Fallback (Cerebras with SambaNova Fallback)
            try {
                const persona = `You are MOMO, the Detailed Tutor for Grade 10 Nepal Students. Provide a simple, student-friendly definition for the word: "${search}". 
                Explain it in MOMO's persona (warm, patient, like a big sibling). 
                Include a relatable example if possible. Keep it concise but helpful. 
                Format JSON: { "word": "${search}", "def": "definition here", "sub": "Subject category", "detail": "MOMO's special tip or insight" }`;

                try {
                    const responseText = await callCerebrasForMomo([{ role: 'user', content: persona }], true);
                    const aiData = JSON.parse(responseText || "{}");
                    setResult({ ...aiData, source: 'MOMO AI' });
                } catch (cerebrasErr) {
                    console.warn("Cerebras Dictionary failed, trying SambaNova...", cerebrasErr);
                    try {
                        const fallbackJson = await callSambaNovaForMomo([{ role: 'user', content: persona }], true);
                        const aiData = JSON.parse(fallbackJson || "{}");
                        setResult({ ...aiData, source: 'MOMO AI (Fallback)' });
                    } catch (sambaErr) {
                        console.warn("SambaNova also failed for Dictionary, trying Groq...", sambaErr);
                        // Tertiary Fallback: Groq for JSON definitions
                        // @ts-ignore
                        const groqKey = import.meta.env.VITE_GROQ_API_KEY || "";
                        
                        if (!groqKey) throw sambaErr;

                        const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
                        const groqRes = await groq.chat.completions.create({
                            messages: [
                                { role: "system", content: "You are a Grade 10 Dictionary. Output ONLY valid JSON." },
                                { role: "user", content: persona }
                            ],
                            model: "llama-3.3-70b-versatile", 
                            response_format: { type: "json_object" }
                        });

                        const groqText = groqRes.choices[0]?.message?.content || "{}";
                        const aiData = JSON.parse(groqText);
                        setResult({ ...aiData, source: 'MOMO AI (Survival Mode)' });
                    }
                }
            } catch (aiErr: any) {
                const isQuotaVal = (aiErr.message || "").toLowerCase().includes("quota") || (aiErr.message || "").includes("429");
                setResult({ 
                    word: search, 
                    def: isQuotaVal ? "MOMO is resting briefly (Limit Reached). Please check back in a few seconds!" : "MOMO is having a little brain freeze! Try again in a moment, Sathi.", 
                    sub: "Notice",
                    source: 'System'
                });
            }

        } catch (error) {
            setResult({ 
                word: search, 
                def: "Dictionary Link Broken. Please check your internet connection.", 
                sub: "Offline",
                source: 'System'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-up pb-32 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 active:scale-95 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Lexicon Pro</h1>
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Master every term</p>
                    </div>
                </div>
                <Book className="w-8 h-8 text-blue/20" />
            </div>

            <div className="relative group">
                <div className="absolute inset-0 bg-blue/5 rounded-[3rem] blur-2xl group-focus-within:bg-blue/10 transition-all" />
                <div className="relative bg-white border-4 border-slate-100 rounded-[3rem] p-4 flex gap-2 shadow-2xl focus-within:border-blue transition-all">
                    <div className="flex-1 flex items-center pl-6">
                        <Search className="text-blue w-6 h-6 shrink-0" />
                        <input 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && findWord()}
                            placeholder="Enter any word or concept..."
                            className="w-full bg-transparent p-4 font-black text-xl outline-none placeholder:text-slate-300"
                        />
                    </div>
                    <button 
                        onClick={findWord}
                        className="bg-blue text-white px-10 rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all hover:bg-blue-600"
                    >
                        Search
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-24"
                    >
                        <div className="relative inline-block">
                            <Zap className="w-20 h-20 text-blue mx-auto mb-6 animate-pulse" />
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-blue/20 border-t-blue rounded-full"
                            />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Consulting MOMO & Matrix...</p>
                    </motion.div>
                ) : result ? (
                    <motion.div 
                        key={result.word}
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="group"
                    >
                        <div className="bg-white rounded-[4rem] border-4 border-slate-100 p-12 shadow-2xl relative overflow-hidden transition-all hover:border-blue/20">
                            {/* Decorative background element */}
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue/5 rounded-full blur-3xl opacity-50 transition-all group-hover:scale-125" />
                            
                            <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[0.65rem] font-black text-blue px-3 py-1 bg-blue/5 rounded-full uppercase tracking-widest border border-blue/10 shrink-0">{result.source || 'Verified'}</span>
                                            <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest truncate">{result.sub}</span>
                                        </div>
                                        <h2 className={cn(
                                            "font-black text-slate-900 italic tracking-tighter uppercase leading-tight break-words overflow-hidden [hyphens:auto]",
                                            result.word.length > 20 ? "text-xl md:text-2xl lg:text-3xl" :
                                            result.word.length > 15 ? "text-2xl md:text-3xl lg:text-4xl" : 
                                            result.word.length > 10 ? "text-4xl md:text-5xl lg:text-6xl" : "text-6xl md:text-7xl lg:text-8xl"
                                        )}>
                                            {result.word}
                                        </h2>
                                    </div>
                                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl">
                                        {result.source === 'MOMO AI' ? <Bot className="w-10 h-10 text-pink-500" /> : <BookOpen className="w-10 h-10 text-blue" />}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-blue pl-4">Definition</h3>
                                        <div className="text-3xl font-black text-slate-800 leading-tight tracking-tight">
                                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {result.def}
                                            </Markdown>
                                        </div>
                                    </div>

                                    {result.detail && (
                                        <div className={cn(
                                            "p-10 rounded-[3rem] border shadow-sm relative overflow-hidden",
                                            result.source === 'MOMO AI' ? "bg-pink-50/50 border-pink-100" : "bg-slate-50 border-slate-100"
                                        )}>
                                            <div className="relative z-10">
                                                <h3 className="text-[0.6rem] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    {result.source === 'MOMO AI' ? (
                                                        <><Sparkles className="w-4 h-4 text-pink-500 line-clamp-1" /> MOMO'S EXPLANATION</>
                                                    ) : (
                                                        <><Zap className="w-4 h-4 text-blue" /> QUICK CONTEXT</>
                                                    )}
                                                </h3>
                                                <div className={cn(
                                                    "text-xl font-bold italic tracking-tight leading-relaxed",
                                                    result.source === 'MOMO AI' ? "text-pink-600" : "text-slate-600"
                                                )}>
                                                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                        {result.detail}
                                                    </Markdown>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => {
                                navigate('/ai');
                                // Could pass the word to AI tutor state here if needed
                            }}
                            className="w-full mt-8 bg-[#020617] text-white p-8 rounded-[3rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                                    <Bot className="w-8 h-8 text-pink-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-pink-400 mb-1">Deep Dive Needed?</p>
                                    <p className="text-xl font-black uppercase italic tracking-tighter">Discuss with MOMO Tutor</p>
                                </div>
                            </div>
                            <ChevronRight className="w-8 h-8 opacity-40 group-hover:translate-x-2 transition-all" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Trending Flashcards</h3>
                            <TrendingUp className="w-4 h-4 text-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {terms.map(t => (
                                <button 
                                    key={t.word} 
                                    onClick={() => {
                                        setSearch(t.word);
                                        setResult(t);
                                    }} 
                                    className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-blue hover:shadow-xl transition-all text-left"
                                >
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase group-hover:text-blue transition-colors leading-none">{t.word}</h4>
                                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">{t.sub} Portal</p>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue/5 group-hover:text-blue transition-all">
                                        <ChevronRight className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
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
    const events = [
        { id: '1', title: 'SEE Form Deadline', date: 'Chaitra 5', type: 'deadline' },
        { id: '2', title: 'Physics Mock Test', date: 'Baisakh 12', type: 'mock' },
        { id: '3', title: 'District Level Exam', date: 'Jestha 20', type: 'exam' }
    ];

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Board Cal.</h1>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-8">
                {['Chaitra', 'Baisakh', 'Jestha'].map(month => (
                    <div key={month} className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#020617] ml-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue rounded-full" />
                            {month} 2083
                        </h2>
                        <div className="space-y-3">
                            {events.filter(e => e.date.includes(month)).map(e => (
                                <div key={e.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex flex-col items-center justify-center">
                                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-tight">Day</span>
                                            <span className="text-lg font-black text-slate-800 leading-none">{e.date.split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 tracking-tight uppercase leading-none mb-1">{e.title}</h3>
                                            <p className={cn(
                                                "text-[0.6rem] font-black uppercase tracking-widest",
                                                e.type === 'deadline' ? 'text-rose-500' : 
                                                e.type === 'mock' ? 'text-blue' : 'text-indigo-600'
                                            )}>{e.type}</p>
                                        </div>
                                    </div>
                                    <Bell className="w-5 h-5 text-slate-200 group-hover:text-blue transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
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
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
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
    const formulas = [
        { title: 'Ohm\'s Law', formula: 'V = I × R', sub: 'Physics' },
        { title: 'Quadratic', formula: 'x = (-b ± √(b²-4ac)) / 2a', sub: 'Maths' },
        { title: 'Photosynthesis', formula: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', sub: 'Science' }
    ];

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Formula Bank</h1>
            </div>

            <div className="space-y-4">
                {formulas.map(f => (
                    <div key={f.title} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue transition-all">
                        <span className="text-[0.6rem] font-black text-blue uppercase tracking-widest mb-2 block">{f.sub}</span>
                        <h3 className="font-black text-xl text-slate-900 mb-4">{f.title}</h3>
                        <div className="bg-slate-900 text-white p-6 rounded-2xl font-mono text-lg overflow-x-auto shadow-inner">
                            {f.formula}
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

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Smart Converter</h1>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                <div className="grid grid-cols-3 gap-2">
                    {['length', 'mass', 'temp'].map(t => (
                        <button key={t} onClick={() => setType(t)} className={cn("py-4 rounded-xl font-black text-[0.6rem] uppercase tracking-widest border transition-all", type === t ? "bg-blue text-white border-blue" : "bg-slate-50 text-slate-400 border-slate-100")}>
                            {t}
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Input Magnitude</label>
                        <input 
                            type="number"
                            value={val}
                            onChange={e => setVal(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-black text-2xl text-slate-800 outline-none focus:ring-4 focus:ring-blue/10 transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                         <div className="w-10 h-10 rounded-full bg-blue text-white flex items-center justify-center shadow-lg"><ArrowLeft className="-rotate-90" /></div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Conversion Result</label>
                        <div className="w-full bg-slate-900 border border-white/5 p-6 rounded-2xl font-black text-2xl text-white shadow-inner">
                            {type === 'length' ? (parseFloat(val) * 3.28).toFixed(2) + ' Feet' : 
                             type === 'mass' ? (parseFloat(val) * 2.20).toFixed(2) + ' Lbs' : 
                             ((parseFloat(val) * 9/5) + 32).toFixed(2) + ' °F'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const NotePadPage = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mode, setMode] = useState<'write' | 'upload' | 'files'>('write');
    const [uploadedFile, setUploadedFile] = useState<any>(null); // { name, type, data }

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveNote = async () => {
        if (mode === 'write' && !title.trim() && !content.trim()) return;
        if (mode === 'upload' && !uploadedFile) return;

        let finalContent = content;
        if (mode === 'upload') {
            finalContent = JSON.stringify({
                isFile: true,
                fileName: uploadedFile.name,
                fileType: uploadedFile.type,
                data: uploadedFile.data
            });
        }

        const newNoteData = { 
            user_id: user.id, 
            title: title || (mode === 'upload' ? uploadedFile.name : 'Untitled'), 
            content: finalContent, 
            date: new Date().toLocaleDateString() 
        };

        try {
            const { data, error } = await supabase
                .from('notes')
                .insert([newNoteData])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setNotes([data, ...notes]);
                setTitle('');
                setContent('');
                setUploadedFile(null);
            }
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedFile({
                name: file.name,
                type: file.type || file.name.split('.').pop(),
                data: event.target?.result
            });
            if (!title) setTitle(file.name);
        };
        reader.readAsDataURL(file);
    };

    const deleteNote = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotes(notes.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const downloadPDF = (note: any) => {
        if (note.content.startsWith('{"isFile"')) {
            const fileObj = JSON.parse(note.content);
            downloadFileObj(fileObj);
            return;
        }

        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.text(note.title, 10, 10);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${note.date}`, 10, 20);
        doc.line(10, 25, 200, 25);
        doc.text(note.content, 10, 35, { maxWidth: 180 });
        doc.save(`${note.title.replace(/\s+/g, '_')}.pdf`);
    };

    const downloadText = (note: any) => {
        if (note.content.startsWith('{"isFile"')) {
            const fileObj = JSON.parse(note.content);
            downloadFileObj(fileObj);
            return;
        }

        const element = document.createElement("a");
        const file = new Blob([`Title: ${note.title}\nDate: ${note.date}\n\n${note.content}`], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `${note.title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const downloadFileObj = (fileObj: any) => {
        const element = document.createElement("a");
        element.href = fileObj.data;
        element.download = fileObj.fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const viewFileObj = (fileObj: any) => {
        if (fileObj.type === 'application/pdf' || fileObj.data.startsWith('data:image')) {
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`<iframe src="${fileObj.data}" width="100%" height="100%" style="border:none; margin:0; padding:0;"></iframe>`);
            }
        } else {
            // Fallback to download if it's docx/txt which browser might not preview easily
            downloadFileObj(fileObj);
        }
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate('/')} className="text-slate-400"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Pad</h1>
            </div>

            <div className="flex gap-4 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
                <button 
                    onClick={() => setMode('write')} 
                    className={cn("text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all whitespace-nowrap", mode === 'write' ? "text-emerald-500 border-emerald-500" : "text-slate-400 border-transparent hover:text-emerald-400")}
                >
                    Write Custom Note
                </button>
                <button 
                    onClick={() => setMode('upload')} 
                    className={cn("text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all whitespace-nowrap", mode === 'upload' ? "text-blue border-blue" : "text-slate-400 border-transparent hover:text-blue")}
                >
                    Upload Note File
                </button>
                <button 
                    onClick={() => setMode('files')} 
                    className={cn("text-xs font-black uppercase tracking-widest pb-2 border-b-2 transition-all whitespace-nowrap", mode === 'files' ? "text-purple-500 border-purple-500" : "text-slate-400 border-transparent hover:text-purple-500")}
                >
                    My Uploaded Files
                </button>
            </div>

            {mode !== 'files' && (
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-6">
                    <input 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={mode === 'upload' ? "File Note Title" : "Note Title (e.g. Physics Ch 1 Revision)"}
                        className="w-full bg-slate-50 border border-slate-100 p-6 rounded-2xl font-black text-xl outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300"
                    />
                    
                    {mode === 'write' ? (
                        <textarea 
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Write your study notes here..."
                            rows={8}
                            className="w-full bg-slate-50 border border-slate-100 p-8 rounded-[2rem] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-300 leading-relaxed"
                        />
                    ) : (
                        <div className="w-full border-2 border-dashed border-slate-200 p-10 rounded-[2rem] text-center bg-slate-50 relative group hover:border-blue transition-colors">
                            <input 
                                type="file" 
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-blue-50 text-blue rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                    <Download className="w-8 h-8 rotate-180" />
                                </div>
                                <div>
                                    <p className="font-black text-slate-700">{uploadedFile ? uploadedFile.name : "Tap or Drag to Upload"}</p>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, DOCX, TXT</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={saveNote}
                        className={cn(
                            "w-full text-white py-6 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all uppercase tracking-widest",
                            mode === 'write' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-blue shadow-blue/20"
                        )}
                    >
                        {mode === 'write' ? 'Save Study Note' : 'Save Uploaded Note'}
                    </button>
                </div>
            )}

            <div className="space-y-4">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 ml-2">
                    {mode === 'files' ? "My Uploaded Files" : "Recent Archives"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes
                        .filter(n => mode === 'files' ? n.content.startsWith('{"isFile"') : true)
                        .map(n => {
                        const isFileJSON = n.content.startsWith('{"isFile"');
                        const noteContent = isFileJSON ? JSON.parse(n.content) : { isFile: false };
                        
                        return (
                        <div key={n.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group overflow-hidden flex flex-col h-full">
                            <div className="flex-1">
                                <p className={cn("text-[0.6rem] font-black uppercase tracking-widest mb-2", noteContent.isFile ? "text-blue" : "text-emerald-500")}>
                                    {n.date} {noteContent.isFile && '• FILE ARCHIVE'}
                                </p>
                                <h3 className="font-black text-slate-900 text-xl mb-4 leading-tight uppercase tracking-tight">{n.title}</h3>
                                <p className="text-[0.85rem] text-slate-400 font-bold leading-relaxed line-clamp-3 italic mb-4">
                                    "{noteContent.isFile ? "Encrypted File Data. Click Eye or Download to access." : n.content}"
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50 mt-auto">
                                {noteContent.isFile ? (
                                    <>
                                        <button onClick={() => viewFileObj(noteContent)} title="View File" className="flex-1 py-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 flex items-center justify-center gap-2 font-black text-[0.65rem] uppercase tracking-widest">
                                            <Eye className="w-4 h-4" /> View
                                        </button>
                                        <button onClick={() => downloadFileObj(noteContent)} title="Download File" className="flex-1 py-3 bg-blue-50 text-blue rounded-xl hover:bg-blue-100 flex items-center justify-center gap-2 font-black text-[0.65rem] uppercase tracking-widest">
                                            <Download className="w-4 h-4" /> Save
                                        </button>
                                        <button onClick={() => deleteNote(n.id)} title="Delete File" className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 flex items-center justify-center">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => downloadPDF(n)} title="Export PDF" className="flex-1 py-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 flex items-center justify-center gap-2 font-black text-[0.65rem] uppercase tracking-widest">
                                            <FileText className="w-4 h-4" /> PDF
                                        </button>
                                        <button onClick={() => downloadText(n)} title="Export Text" className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 flex items-center justify-center gap-2 font-black text-[0.65rem] uppercase tracking-widest">
                                            <Download className="w-4 h-4" /> Text
                                        </button>
                                        <button onClick={() => deleteNote(n.id)} title="Delete Note" className="p-3 bg-slate-50 text-rose-300 hover:text-rose-500 rounded-xl flex items-center justify-center">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
                    {notes.length === 0 && !isLoading && (
                        <div className="text-center py-20 opacity-25">
                            <PenTool className="w-16 h-16 mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">No historical records found</p>
                        </div>
                    )}
                    {isLoading && (
                        <div className="col-span-full text-center py-10 opacity-50">
                            <p className="font-bold tracking-widest text-sm uppercase">Loading Notes...</p>
                        </div>
                    )}
                </div>
            </div>
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
        if (user) {
            fetchTasks();
        }
    }, [user]);

    const fetchTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            if (data) setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        const newTaskData = { text: newTask, done: false, user_id: user.id };
        
        try {
            const { data, error } = await supabase
                .from('tasks')
                .insert([newTaskData])
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setTasks([data, ...tasks]);
                setNewTask("");
            }
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const toggleStatus = async (id: string) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        try {
            const { error } = await supabase
                .from('tasks')
                .update({ done: !taskToToggle.done })
                .eq('id', id);

            if (error) throw error;
            setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteStatus = async (id: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setTasks(tasks.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
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

const AuthPage = () => {
    const { setUser } = useApp();
    const [isSignIn, setIsSignIn] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!email || !password || (!isSignIn && !name)) return;
        setLoading(true);
        
        try {
            if (isSignIn) {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                if (signInError) throw signInError;
                
                // Note: user state gets set securely via the onAuthStateChange listener on successful sign in
            } else {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name
                        }
                    }
                });

                if (signUpError) throw signUpError;
                
                if (!data.session) {
                    setSuccessMsg('Your account has been created. Please check your email and verify your address before logging in.');
                    setIsSignIn(true);
                    setPassword(''); // Clear password for security, leave email for convenience
                }
                // if data.session exists, the listener inside AppProvider will pick it up
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsSignIn(!isSignIn);
        setError('');
        setSuccessMsg('');
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'An error occurred during Google Sign In.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 relative z-10 border border-slate-100 animate-fade-up">
                <div className="text-center mb-8">
                    <div className="flex flex-col leading-none items-center justify-center mb-4">
                        <span className="text-[#E11D48] font-black text-3xl tracking-tighter uppercase italic">Aadhar</span>
                        <span className="text-[#1D4ED8] font-black text-3xl tracking-tighter uppercase italic">Pathshala</span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        {isSignIn ? 'Welcome Back!' : 'Create your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isSignIn && (
                        <div className="space-y-1">
                            <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue/10 transition-all"
                            />
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                        <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="student@aadhar.edu.np"
                            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue/10 transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest ml-4">Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-50 border border-slate-100 px-5 py-4 rounded-2xl font-bold text-xl outline-none focus:ring-4 focus:ring-blue/10 transition-all"
                        />
                    </div>
                    
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-500 text-xs font-bold rounded-xl text-center">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold rounded-xl text-center">
                            {successMsg}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-8 bg-[linear-gradient(135deg,_#3b82f6_0%,_#8b5cf6_50%,_#f43f5e_100%)] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                    >
                        {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
                    </button>
                    
                    <div className="relative mt-6 mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-widest">Or</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-sm hover:bg-slate-50 hover:border-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button 
                        type="button"
                        onClick={toggleMode}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                    >
                        {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AppContent = () => {
    const { user } = useApp();
    if (!user) {
        return <AuthPage />;
    }
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
                <Route path="/hub/:name/model" element={<ModelList />} />
                <Route path="/hub/:name/mcq-sets" element={<MCQTestSelection />} />
                <Route path="/hub/:name/mcq-test/:setIndex" element={<MCQTestPlayer />} />
                <Route path="/ai" element={<AITutor />} />
                <Route path="/mock" element={<MockTest />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tools" element={<AadharToolkit />} />
                <Route path="/tools/calculator" element={<CalculatorSuite />} />
                <Route path="/tools/notes" element={<NotePadPage />} />
                <Route path="/tools/dictionary" element={<DictionaryPage />} />
                <Route path="/tools/timer" element={<StudyTimer />} />
                <Route path="/tools/calendar" element={<ExamCalendar />} />
                <Route path="/tools/formulas" element={<FormulaBankPage />} />
                <Route path="/tools/converter" element={<UnitConverterPage />} />
                <Route path="/tools/todo" element={<TodoListPage />} />
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
    news: [
        { id: '1', title: 'NEB Postpones SEE Practical Exams in 5 Districts', body: 'Due to local conditions, practical exams in Taplejung and Solukhumbu are rescheduled for Jestha 15. Check official NEB portal.', date: '2081/01/22', tag: 'URGENT', tagBg: 'bg-rose-500', tagColor: 'text-white', imageUrl: 'https://picsum.photos/seed/nepalnews/800/400' },
        { id: '2', title: 'HSEB Scholarships for Bagmati Province', body: 'Bagmati Province Education Directorate announces 150 more scholarship seats for Class 10 graduates.', date: '2081/01/18', tag: 'SCHOLARSHIP', tagBg: 'bg-indigo-500', tagColor: 'text-white', imageUrl: 'https://picsum.photos/seed/k Kathmandu/800/400' },
        { id: '3', title: 'Digital Literacy Campaign in Rural Schools', body: 'MoEST launches Tablet-based learning pilot program in 50 community schools across Gandaki.', date: '2081/01/12', tag: 'TECH', tagBg: 'bg-emerald-500', tagColor: 'text-white', imageUrl: 'https://picsum.photos/seed/laptop/800/400' }
    ],
    subjects: {
        'Science': {
            id: 'Science',
            color: 'emerald',
            icon: 'Microscope',
            chapters: [
                { id: '1', title: 'Force and Motion', topics: 'Gravity, Weight, Free-fall', marks: 5, contentHtml: '### 1. Gravitational Force\nGravity is the force that pulls objects toward the center of a planet or other body...\n\n#### Key Equations\nF = G(m1m2)/d²' },
                { id: '2', title: 'Pressure', topics: 'Pascals Law, Archimedes Principle', marks: 4, contentHtml: '### Pressure Concepts\nPressure is defined as force per unit area...' }
            ],
            videos: [
                { id: 'v1', title: 'Universal Law of Gravitation', channel: 'NEB Official', youtubeId: 'kx7896', duration: '12:45' }
            ],
            pdfs: [
                { id: 'p1', name: 'Science Unit 1 Notes', desc: 'Comprehensive guide for Force', url: '#' }
            ],
            modelQuestions: [
                { id: 'm1', q: 'State Newton\'s Universal Law of Gravitation.', answerHtml: 'Every particle of matter in the universe attracts every other particle with a force that is directly proportional to the product of their masses and inversely proportional to the square of the distance between them.' }
            ]
        },
        'नेपाली': {
            id: 'नेपाली', color: 'purple', icon: 'Edit3',
            chapters: [
                { id: '1', title: 'यस्तै रहेछ जनम', topics: 'कविता, व्याख्या', marks: 4, contentHtml: 'यस अध्यायमा कविले जनमको मर्म र यथार्थलाई प्रस्तुत गरेका छन् ।' }
            ],
            videos: [], pdfs: [], modelQuestions: []
        },
        'सामाजिक': {
            id: 'सामाजिक', color: 'amber', icon: 'Globe',
            chapters: [
                { id: '1', title: 'हाम्रो प्रदेश', topics: 'भूगोल, जनजीवन', marks: 5, contentHtml: 'नेपालका सात प्रदेशहरूका विविधता र विशेषताहरू यहाँ व्याख्या गरिएको छ ।' }
            ],
            videos: [], pdfs: [], modelQuestions: []
        },
        'Maths': { id: 'Maths', color: 'red', icon: 'Sigma', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'English': { id: 'English', color: 'blue', icon: 'Languages', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Optional Maths': { id: 'Optional Maths', color: 'indigo', icon: 'Binary', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Account': { id: 'Account', color: 'orange', icon: 'ListChecks', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Computer': { id: 'Computer', color: 'cyan', icon: 'Monitor', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Economics': { id: 'Economics', color: 'green', icon: 'TrendingUp', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Health': { id: 'Health', color: 'rose', icon: 'Activity', chapters: [], videos: [], pdfs: [], modelQuestions: [] }
    },
    calendar: [],
    settings: { welcomeMessage: 'Namaste', registrationOpen: true }
};

const AppProvider = ({ children }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [data] = useState<AppData>(INITIAL_DATA);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || 'Adhyeta Nepal',
                    email: session.user.email || '',
                    grade: '10',
                    xp: 1250, 
                    streak: 5, 
                    badges: ['Early Bird', 'Quiz Master'],
                    testsCompleted: 0, 
                    avgScore: 0, 
                    completedChapters: []
                });
            }
            setIsInitializing(false);
        };
        initAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || 'Adhyeta Nepal',
                    email: session.user.email || '',
                    grade: '10',
                    xp: 1250, 
                    streak: 5, 
                    badges: ['Early Bird', 'Quiz Master'],
                    testsCompleted: 0, 
                    avgScore: 0, 
                    completedChapters: []
                });
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
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

        setUser({ 
            ...user, 
            xp: newXp, 
            testsCompleted: newTests, 
            avgScore: newAvg,
            badges: newBadges
        });
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
        <AppContext.Provider value={{ user, setUser, data, addTestResult }}>
            {children}
        </AppContext.Provider>
    );
};

export default App;
