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
  BrainCircuit, Check, ClipboardCheck, XCircle, Library, Grid3X3, UserCheck, GalleryVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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
    const navigate = useNavigate();
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
                        <button onClick={() => navigate(`/hub/${settings.subject}`)} className="w-full py-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-500/20 group flex items-center justify-center gap-3">
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
1. MATH: Use $ for inline and $$ for block math.
2. VISUALS (MANDATORY): You MUST include a visual for Science, History, or Geography.
   - USE THE TAG: [VISUAL: DESCRIPTION]
   - DESCRIPTION: 5 specific keywords for a scientific diagram (e.g., [VISUAL: human heart internal anatomy labeled]).
   - Put this on its own line with empty lines around it.
3. VIBRANCY: Use ### for section headers to ensure colourful output.
   - MOMO: Use "### 🧬 Concept Core" and "### 💡 Expert Insight".
   - MANGO: Use "### 📊 Case Data" and "### 🔍 Reliable Check".
   - ACHAR: Use "### ⚡ Quick Facts".
4. NO GREETINGS: Start answering immediately.
5. PARAGRAPHS: Max 2 sentences each. Use **bold** for key concepts.`;

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
                                                // DETECT AND RENDER [VISUAL: ...] TOKENS
                                                const visualMatch = content.match(/\[VISUAL:\s*(.*?)\]/i);
                                                if (visualMatch) {
                                                    const prompt = visualMatch[1].trim();
                                                    const cleanPrompt = prompt.replace(/\s+/g, '_').toLowerCase();
                                                    // Track 1: Precision Educational Illustration
                                                    const primaryUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' highly detailed scientific labeled educational diagram white background')}?width=1024&height=768&nologo=true&seed=${i}`;
                                                    
                                                    return (
                                                        <div className="my-10 relative group-visual">
                                                            <div className="absolute -inset-2 bg-linear-to-r from-blue-500 to-cyan-400 rounded-[3.5rem] blur-2xl opacity-10" />
                                                            <div className="relative overflow-hidden rounded-[3rem] bg-slate-50 border-[8px] border-white shadow-2xl">
                                                                <img 
                                                                    src={primaryUrl}
                                                                    alt={prompt}
                                                                    className="w-full h-auto min-h-[300px] object-cover transition-all duration-700 hover:scale-[1.05]"
                                                                    referrerPolicy="no-referrer"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        if (!target.src.includes('fallback=true')) {
                                                                            // Track 2: Robust Realistic Schema fallback
                                                                            target.src = `https://pollinations.ai/p/${encodeURIComponent(prompt + ' realistic science schema')}?width=800&height=600&nologo=true&fallback=true`;
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-5 py-2 rounded-2xl shadow-xl border border-blue/5">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 bg-blue rounded-full animate-ping" />
                                                                        <span className="text-[0.65rem] font-black text-blue uppercase tracking-widest">Visual Core 3.0</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return <p className="mb-4" {...props}>{children}</p>;
                                            },
                                            img: ({node, ...props}) => {
                                                const altText = props.alt || "educational_visual";
                                                const prompt = altText.replace(/_/g, ' ');
                                                const stableUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ' educational scientific diagram')}?width=1024&height=768&nologo=true&seed=${i}`;
                                                
                                                return (
                                                    <div className="my-10 relative group-visual">
                                                        <div className="absolute -inset-2 bg-linear-to-r from-emerald-500 to-cyan-400 rounded-[3.5rem] blur-2xl opacity-10" />
                                                        <div className="relative overflow-hidden rounded-[3rem] bg-slate-50 border-[8px] border-white shadow-2xl">
                                                            <img 
                                                                src={stableUrl}
                                                                alt={altText}
                                                                className="w-full h-auto min-h-[300px] object-cover transition-all duration-700 hover:scale-[1.05]"
                                                                referrerPolicy="no-referrer"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    if (!target.src.includes('retry=true')) {
                                                                        target.src = `https://pollinations.ai/p/${encodeURIComponent(prompt + ' schema')}?width=800&height=600&nologo=true&retry=true`;
                                                                    }
                                                                }}
                                                            />
                                                            <div className="absolute bottom-6 right-6 bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full text-[0.55rem] font-black text-white uppercase tracking-widest border border-white/20">
                                                                Scientific Overlay
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
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
        'sin', 'cos', 'tan', 'log',
        'C', 'DEL', '%', '/',
        '7', '8', '9', '*',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', '=', '√',
        'π', 'e', '^', '('
    ];

    const handleClick = (val: string) => {
        if (val === 'C') { setDisplay('0'); setEquation(''); }
        else if (val === 'DEL') {
            setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0');
            setEquation(e => e.slice(0, -1));
        }
        else if (val === '=') {
            try { 
                let expr = equation || display;
                expr = expr.replace(/sin/g, 'Math.sin');
                expr = expr.replace(/cos/g, 'Math.cos');
                expr = expr.replace(/tan/g, 'Math.tan');
                expr = expr.replace(/log/g, 'Math.log10');
                expr = expr.replace(/π/g, 'Math.PI');
                expr = expr.replace(/e/g, 'Math.E');
                expr = expr.replace(/\^/g, '**');
                
                const res = Function(`"use strict"; return (${expr})`)();
                setDisplay(parseFloat(res.toFixed(8)).toString()); 
                setEquation(''); 
            } catch { setDisplay('Error'); }
        } else if (val === '√') {
            try {
                const res = Math.sqrt(eval(equation || display));
                setDisplay(res.toString());
                setEquation(`sqrt(${equation || display})`);
            } catch { setDisplay('Error'); }
        } else if (['sin', 'cos', 'tan', 'log'].includes(val)) {
            setEquation(e => e + val + '(');
            setDisplay(val + '(');
        } else if (val === 'π') {
            setEquation(e => e + 'π');
            setDisplay('π');
        } else if (val === 'e') {
            setEquation(e => e + 'e');
            setDisplay('e');
        } else {
            (document.activeElement as HTMLElement)?.blur();
            setDisplay(d => d === '0' && !isNaN(Number(val)) ? val : d + val);
            setEquation(e => e + val);
        }
    };

    return (
        <div className="bg-slate-900 p-6 md:p-8 rounded-[3rem] shadow-2xl border border-white/5 max-w-[450px] mx-auto overflow-hidden relative">
            <div className="text-right mb-6 h-32 flex flex-col justify-end px-4">
                <p className="text-blue font-mono text-xs mb-2 opacity-60 tracking-widest uppercase truncate">{equation || 'Scientific Mode'}</p>
                <p className="text-4xl md:text-5xl font-black text-white tracking-tighter truncate leading-none">{display}</p>
            </div>
            <div className="grid grid-cols-4 gap-2 md:gap-3 relative z-10">
                {btns.map(b => (
                    <button
                        key={b}
                        onClick={() => handleClick(b)}
                        className={cn(
                            "h-12 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[0.7rem] md:text-base transition-all active:scale-90",
                            ['/', '*', '-', '+', '=', '√', '^'].includes(b) ? "bg-blue text-white shadow-lg shadow-blue/20" :
                            ['C', 'DEL'].includes(b) ? "bg-rose-50 text-white" : 
                            ['sin', 'cos', 'tan', 'log'].includes(b) ? "bg-white/10 text-blue font-mono text-[0.6rem] md:text-xs" :
                            "bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                    >
                        {b}
                    </button>
                ))}
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue/10 rounded-full blur-3xl pointer-events-none" />
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
    
    const getGpaColor = (gpaVal: number) => {
        if (gpaVal >= 3.6) return 'from-emerald-400 to-emerald-600'; // A+
        if (gpaVal >= 3.2) return 'from-green-400 to-green-600'; // A
        if (gpaVal >= 2.8) return 'from-blue-400 to-blue-600'; // B+
        if (gpaVal >= 2.4) return 'from-indigo-400 to-indigo-600'; // B
        if (gpaVal >= 2.0) return 'from-amber-400 to-amber-600'; // C+
        if (gpaVal >= 1.6) return 'from-orange-400 to-orange-600'; // C
        if (gpaVal > 0) return 'from-rose-400 to-rose-600'; // D
        return 'from-slate-400 to-slate-600'; // NG or 0
    };

    return (
        <div className="space-y-6">
            <div className={cn("p-10 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden transition-colors duration-500 bg-linear-to-br", getGpaColor(gpa))}>
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
        { id: 'notepad', label: 'Notepad & Files', icon: Edit3, color: 'orange', path: '/tools/notes' },
        { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'rose', path: '/tools/timer' },
        { id: 'formulas', label: 'Formulas', icon: Sigma, color: 'purple', path: '/tools/formulas' },
        { id: 'calendar', label: 'Exam Calendar', icon: Calendar, color: 'blue', path: '/tools/calendar' },
        ...(isToolsPage ? [
            { id: 'calculator', label: 'Sci-Calculator', icon: Calculator, color: 'amber', path: '/tools/calculator?tab=standard' },
            { id: 'periodic', label: 'Periodic Table', icon: Grid3X3, color: 'purple', path: '/tools/periodic-table' },
            { id: 'translate', label: 'Translator', icon: Languages, color: 'blue', path: '/tools/translator' },
            { id: 'gpa', label: 'GPA Calculator', icon: Activity, color: 'rose', path: '/tools/calculator?tab=gpa' },
            { id: 'converter', label: 'Unit Converter', icon: Scale, color: 'teal', path: '/tools/converter' },
            { id: 'todo', label: 'To-Do List', icon: ListChecks, color: 'indigo', path: '/tools/todo' },
            { id: 'words', label: 'Word Counter', icon: FileText, color: 'emerald', path: '/tools/words' },
            { id: 'attendance', label: 'Attendance', icon: UserCheck, color: 'teal', path: '/tools/attendance' },
            { id: 'flashcards', label: 'Flashcards', icon: GalleryVertical, color: 'orange', path: '/tools/flashcards' }
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
    const [activeTab, setActiveTab] = useState<'All' | 'Exams' | 'Results' | 'General'>('All');

    const filteredNews = data.news.filter(n => {
        if (activeTab === 'All') return true;
        return n.tag === activeTab;
    });

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <header className="space-y-2 mb-10">
                <h1 className="text-5xl md:text-6xl font-black text-[#020617] italic tracking-tighter uppercase leading-none">The Pulse</h1>
                <p className="text-xs text-rose-500 font-bold uppercase tracking-[0.3em] ml-1">Official NEB & Board Updates</p>
            </header>

            <NoticeBoard />

            <div className="flex bg-slate-100 p-2 rounded-[2rem] shadow-inner mt-8 overflow-x-auto custom-scrollbar">
                {['All', 'Exams', 'Results', 'General'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                            "flex-1 min-w-[80px] py-3 px-4 rounded-[1.5rem] font-black text-[0.65rem] md:text-sm uppercase tracking-widest transition-all",
                            activeTab === tab ? "bg-white text-blue shadow-lg" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <AnimatePresence mode="popLayout">
                    {filteredNews.length > 0 ? filteredNews.map((n, i) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative group flex flex-col h-full"
                        >
                            {n.imageUrl && (
                                <div className="w-full h-56 overflow-hidden relative shrink-0">
                                    <img 
                                        src={n.imageUrl} 
                                        alt={n.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-5 left-6 flex gap-2">
                                        <span className={cn("text-[0.55rem] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest text-white border border-white/20 backdrop-blur-md", n.tagBg || 'bg-blue/80')}>
                                            {n.tag}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-6 md:p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{n.date}</span>
                                </div>
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-3 leading-tight tracking-tight uppercase group-hover:text-blue transition-colors">{n.title}</h2>
                                <p className="text-[0.8rem] text-slate-500 leading-relaxed font-bold mb-6 flex-1 line-clamp-3">{n.body}</p>
                                
                                <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-auto">
                                    <div className="flex items-center gap-2 text-rose-500 text-[0.65rem] font-black uppercase tracking-widest group-hover:gap-3 transition-all cursor-pointer">
                                        <span>Read Full Report</span>
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full py-12 text-center text-slate-400 font-black italic uppercase tracking-widest">
                            No news found in this category.
                        </div>
                    )}
                </AnimatePresence>
            </div>
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
    const [questionCount, setQuestionCount] = useState(30);
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
    
    const isTimerEnabled = searchParams.get('timer') !== 'false';
    const countParam = parseInt(searchParams.get('count') || '30');
    
    // 1 minute per question for timer
    const [timer, setTimer] = useState(countParam * 60); 
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];

    const setData = STATIC_MCQS[name as string]?.[parseInt(setIndex || '0')];
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
        setText(translated);
        setTranslated(text);
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <header className="flex items-center gap-3 px-1">
                <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">Translator</h1>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-Lingual Bridge</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOURCE AREA */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs font-black text-blue uppercase tracking-widest">{sourceLang}</span>
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue">
                             <Languages className="w-5 h-5" />
                        </div>
                    </div>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type text to translate..."
                        className="w-full h-48 bg-slate-50 border-none rounded-3xl p-6 text-lg font-bold text-slate-800 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue/10 resize-none transition-all"
                    />
                </div>

                {/* TARGET AREA */}
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                         <Globe className="w-32 h-32 text-white" />
                    </div>
                    <div className="flex items-center justify-between px-2 relative z-10">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{targetLang}</span>
                        <button 
                            onClick={swapLangs}
                            className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                             <RotateCcw className="w-5 h-5 rotate-90" />
                        </button>
                    </div>
                    <div className="w-full h-48 bg-white/5 rounded-3xl p-6 text-lg font-bold text-white relative z-10 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
                                <Sparkles className="w-8 h-8 animate-pulse" />
                                <p className="text-xs uppercase tracking-widest font-black">AI Translating...</p>
                            </div>
                        ) : translated || (
                            <p className="text-white/20 italic">Translation results appear here...</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleTranslate}
                    disabled={loading || !text.trim()}
                    className="px-12 py-5 bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-4"
                >
                    <Languages className="w-5 h-5" />
                    {loading ? 'Synthesizing...' : 'Execute Translation'}
                </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue shrink-0 shadow-sm">
                    <Info className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-blue-800 leading-relaxed uppercase">
                    Our AI model is specialized in English-to-Nepali academic translations, perfect for science and social studies homework.
                </p>
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
                                            <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
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
                                                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
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

    const monthColors: Record<string, string> = {
        'Baisakh': 'bg-rose-50 text-rose-800 border-rose-200',
        'Jestha': 'bg-orange-50 text-orange-800 border-orange-200',
        'Ashadh': 'bg-amber-50 text-amber-800 border-amber-200',
        'Shrawan': 'bg-emerald-50 text-emerald-800 border-emerald-200',
        'Bhadra': 'bg-teal-50 text-teal-800 border-teal-200',
        'Ashwin': 'bg-cyan-50 text-cyan-800 border-cyan-200',
        'Kartik': 'bg-blue-50 text-blue-800 border-blue-200',
        'Mangsir': 'bg-indigo-50 text-indigo-800 border-indigo-200',
        'Poush': 'bg-violet-50 text-violet-800 border-violet-200',
        'Magh': 'bg-purple-50 text-purple-800 border-purple-200',
        'Falgun': 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
        'Chaitra': 'bg-pink-50 text-pink-800 border-pink-200',
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Board Cal. 2083</h1>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                <select 
                    value={activeMonth}
                    onChange={(e) => setActiveMonth(e.target.value)}
                    className={cn("w-full p-4 rounded-2xl font-black text-lg outline-none transition-colors border", monthColors[activeMonth])}
                >
                    {months2083.map(m => (
                        <option key={m.name} value={m.name}>{m.name} 2083</option>
                    ))}
                </select>

                <div className="grid grid-cols-7 gap-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className={cn("text-center font-black text-[0.6rem] py-2", i === 6 ? "text-red-500" : "text-slate-400")}>{d}</div>
                    ))}
                    {Array.from({ length: activeMonthData.offset }).map((_, i) => (
                        <div key={`offset-${i}`} className="p-2" />
                    ))}
                    {Array.from({ length: activeMonthData.days }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${activeMonth} ${dayNum}`;
                        const event = events.find(e => e.date === dateStr);
                        
                        return (
                            <div 
                                key={i} 
                                className={cn(
                                    "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold relative transition-all",
                                    (i + activeMonthData.offset) % 7 === 6 ? "text-red-500" : "text-slate-700",
                                    event ? "bg-blue/10 border border-blue/20 shadow-sm font-black" : "bg-slate-50 hover:bg-slate-100"
                                )}
                            >
                                {dayNum}
                                {event && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue animate-pulse" />}
                            </div>
                        );
                    })}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Events this month</h3>
                    <div className="space-y-2">
                        {events.filter(e => e.date.includes(activeMonth)).length > 0 ? (
                            events.filter(e => e.date.includes(activeMonth)).map(e => (
                                <div key={e.id} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center border border-slate-100">
                                    <div>
                                        <p className="font-black text-slate-800 text-sm leading-tight">{e.title}</p>
                                        <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest mt-1">{e.date} • {e.type}</p>
                                    </div>
                                    <Bell className="w-4 h-4 text-slate-300" />
                                </div>
                            ))
                        ) : (
                            <p className="text-sm font-medium text-slate-400 italic bg-slate-50 p-4 rounded-2xl">No events scheduled.</p>
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
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="w-6 h-6" /></button>
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
