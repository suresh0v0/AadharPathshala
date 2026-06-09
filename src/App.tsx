import { create, all } from 'mathjs';
const math = create(all);

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  Home, BookOpen, MessageSquare, ListChecks, Newspaper, 
  ChevronRight, ArrowLeft, Send, Sparkles, Trophy, 
  History, Calculator, User as UserIcon,
  PlayCircle, FileText,
  Clock, Plus, FlaskConical, Globe, Divide, TrendingUp, TrendingDown, Activity, Monitor,
  Layout as ToolLayout, GraduationCap, Timer, Book, Zap, Users, Compass,
  Bot, Coffee, Pause, Play, RotateCcw, RotateCw, Flame, Wind, Calendar,
  Dna, Binary, Languages, Microscope, Sigma, Scale, Lightbulb, Bell, Megaphone,
  Pin, Info, AlertTriangle, ChevronDown, ChevronUp, ChevronLeft, CheckCircle2, Search, Download, PenTool, Eye, EyeOff, FileCode,
  Hash, Percent, BadgePercent, BarChart, Banknote, Variable, ArrowUpRight, LineChart, ListOrdered, Move, Triangle, Construction,
  ExternalLink, BarChart3, LogOut, LayoutDashboard, Video, FileJson, MessageSquareQuote, 
  Trash2, Edit3, Check, CheckCircle, X, Filter, Image as ImageIcon, PlusSquare, Radio, Database, Server, Lock, Shield,
  StickyNote, Circle, Cat, Bird, Leaf, Apple, Orbit, Building2, SlidersHorizontal, MoreHorizontal, Grid2X2,
  Mic, Camera, Quote, Pencil,
  BrainCircuit, ClipboardCheck, XCircle, Library, Grid3X3, UserCheck, GalleryVertical, Archive, Loader2,
  ShieldCheck, ArrowRight, SearchX, Target, ClipboardList, Settings, Heart, Bookmark, Volume2, ArrowRightLeft, Copy, Save,
  BookMarked, Layout as LayoutIcon, Star, Share2, MoreVertical, Palette, Tag, AlignLeft, Layers,
  Wrench, BellRing, FileQuestion, Moon, Sun, Youtube, Beaker, LayoutGrid, Type, Box, Film,
  Gamepad2, Brain, LayoutList, BookCopy, ShieldAlert, Link2, VolumeX, Puzzle,
  Eraser, Paperclip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { VisualsPage } from './components/VisualsPage';
import { GraphsPage } from './components/GraphsPage';
import { FocusTimerPage } from './components/FocusTimerPage';

// Set worker for react-pdf (safer loading)
try {
    if (pdfjs?.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
    }
} catch (e) {
    console.error("PDF.js worker initialization error:", e);
}
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { jsPDF } from 'jspdf';
import { supabase, fetchStudyMaterials, saveMindLog, handleUpload, uploadJSON, saveChapterNotes, getUserProfile, saveNews, saveNotice } from './supabaseClient';
import { getAIResponse, getAIJSONResponse, PROVIDERS } from './services/aiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, Line
} from 'recharts';
import { AppData, User, SubjectData, NewsItem, SubjectType, Chapter, LeaderboardEntry, CalendarEvent } from './types.ts';
import { STATIC_MCQS } from './static_mcqs';

const LogoImg = "https://res.cloudinary.com/dtyjlnjjf/image/upload/f_auto,q_auto/9931_fogzow";

/**
 * Utility for Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── LOGO COMPONENT ── */
const AppSymbol = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
    return (
        <div className={cn(
            "relative flex items-center justify-center overflow-hidden bg-white border border-slate-100",
            size === 'sm' ? 'w-10 h-10 rounded-xl' : size === 'md' ? 'w-20 h-20 rounded-[2.5rem]' : 'w-28 h-28 rounded-[3rem]',
            className
        )}>
            <img 
                src={LogoImg} 
                alt="Aadhar Pathshala Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=Aadhar&background=000&color=fff';
                }}
            />
            <div className="absolute inset-0 bg-linear-to-tr from-black/[0.01] to-transparent pointer-events-none" />
        </div>
    );
};

const AnimatedLogo = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("relative flex items-center justify-center", className)}
        >
            <div className="absolute inset-x-0 bottom-0 h-4 bg-slate-200/50 blur-2xl rounded-full translate-y-8" />
            <motion.div
                animate={{ 
                    y: [0, -8, 0],
                }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative z-10"
            >
                <AppSymbol size={size} className="shadow-2xl shadow-slate-200 border-4 border-white" />
            </motion.div>
        </motion.div>
    );
};

const Logo = ({ className = "", size = "md" }: { className?: string, size?: 'sm' | 'md' | 'lg' }) => {
    return (
        <div className={cn("flex items-center gap-3", className)}>
            <AppSymbol size={size === 'lg' ? 'md' : 'sm'} className="border-none shadow-none bg-transparent" />
            <div className="flex flex-col leading-none justify-center -space-y-0.5">
                {/* Branding blue and red as requested */}
                <span className={cn("font-black tracking-tighter text-[#1D4ED8] uppercase", size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl')} style={{ fontFamily: 'Inter, sans-serif' }}>AADHAR</span>
                <span className={cn("font-bold italic uppercase tracking-[0.2em] text-[#EF4444]", size === 'sm' ? 'text-[0.6rem]' : size === 'md' ? 'text-[0.7rem]' : 'text-[0.85rem]')} style={{ fontFamily: 'Inter, sans-serif' }}>PATHSHALA</span>
            </div>
        </div>
    );
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
 * CONSTANTS
 */
const SUBJECTS_CONFIG: Record<SubjectType, { color: string; icon: any; gradient: string }> = {
  'English': { color: 'blue', icon: Languages, gradient: 'from-blue-500 to-indigo-500' },
  'नेपाली': { color: 'purple', icon: Edit3, gradient: 'from-purple-500 to-pink-500' },
  'Maths': { color: 'red', icon: Sigma, gradient: 'from-red-500 to-orange-500' },
  'Science': { color: 'emerald', icon: Microscope, gradient: 'from-emerald-500 to-teal-500' },
  'सामाजिक': { color: 'amber', icon: Globe, gradient: 'from-amber-500 to-orange-500' },
  'Optional Maths': { color: 'indigo', icon: Binary, gradient: 'from-indigo-500 to-violet-500' },
  'Account': { color: 'orange', icon: ListChecks, gradient: 'from-orange-500 to-yellow-500' },
  'Computer': { color: 'cyan', icon: Monitor, gradient: 'from-cyan-500 to-blue-500' },
  'Economics': { color: 'emerald', icon: TrendingUp, gradient: 'from-emerald-500 to-teal-500' },
  'Health': { color: 'rose', icon: Activity, gradient: 'from-rose-500 to-red-500' }
};

const getBrandColors = (color: string) => {
    switch(color) {
        case 'blue': return { bg: 'bg-blue-600', text: 'text-blue-600', paleBg: 'bg-blue-50', paleText: 'text-blue-600', solidBg: 'bg-blue-500', shadow: 'shadow-blue-500/20' };
        case 'purple': return { bg: 'bg-purple-600', text: 'text-purple-600', paleBg: 'bg-purple-50', paleText: 'text-purple-600', solidBg: 'bg-purple-500', shadow: 'shadow-purple-500/20' };
        case 'red': return { bg: 'bg-red-600', text: 'text-red-600', paleBg: 'bg-red-50', paleText: 'text-red-600', solidBg: 'bg-red-500', shadow: 'shadow-red-500/20' };
        case 'emerald': return { bg: 'bg-emerald-600', text: 'text-emerald-600', paleBg: 'bg-emerald-50', paleText: 'text-emerald-600', solidBg: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' };
        case 'amber': return { bg: 'bg-amber-600', text: 'text-amber-600', paleBg: 'bg-amber-50', paleText: 'text-amber-600', solidBg: 'bg-amber-500', shadow: 'shadow-amber-500/20' };
        case 'indigo': return { bg: 'bg-indigo-600', text: 'text-indigo-600', paleBg: 'bg-indigo-50', paleText: 'text-indigo-600', solidBg: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' };
        case 'orange': return { bg: 'bg-orange-600', text: 'text-orange-600', paleBg: 'bg-orange-50', paleText: 'text-orange-600', solidBg: 'bg-orange-500', shadow: 'shadow-orange-500/20' };
        case 'cyan': return { bg: 'bg-cyan-600', text: 'text-cyan-600', paleBg: 'bg-cyan-50', paleText: 'text-cyan-600', solidBg: 'bg-cyan-500', shadow: 'shadow-cyan-500/20' };
        case 'rose': return { bg: 'bg-rose-600', text: 'text-rose-600', paleBg: 'bg-rose-50', paleText: 'text-rose-600', solidBg: 'bg-rose-500', shadow: 'shadow-rose-500/20' };
        case 'teal': return { bg: 'bg-teal-600', text: 'text-teal-600', paleBg: 'bg-teal-50', paleText: 'text-teal-600', solidBg: 'bg-teal-500', shadow: 'shadow-teal-500/20' };
        default: return { bg: 'bg-slate-600', text: 'text-slate-600', paleBg: 'bg-slate-50', paleText: 'text-slate-600', solidBg: 'bg-slate-500', shadow: 'shadow-slate-500/20' };
    }
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

// STATIC_MCQS is imported from static_mcqs.ts above

// ════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, userProfile } = useApp();

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

  const handleLogout = async () => {
      try {
          await supabase.auth.signOut();
          localStorage.removeItem('logged_user');
          navigate('/');
      } catch (err) {
          console.error("Logout error:", err);
          // Force logout in app state anyway
          setUser(null);
          navigate('/');
      }
  };

  const isAdminMode = location.pathname.startsWith('/admin-portal');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {!isAdminMode && (
        <header className="fixed top-0 w-full z-[1000] backdrop-blur-md border-b px-6 py-4 bg-white/80 border-slate-100">
          <div className="max-w-[620px] md:max-w-4xl lg:max-w-6xl mx-auto flex justify-between items-center">
            <div className="logo cursor-pointer flex items-center gap-2 group transition-all duration-500 mt-2" onClick={() => navigate('/')}>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-4">
               {user && location.pathname !== '/profile' && (
                 <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white relative group shadow-lg hover:ring-4 hover:ring-blue/20 transition-all">
                    <UserIcon className="w-5 h-5 fill-current" />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-[#4ADE80] border-2 border-white rounded-full" />
                 </button>
               )}
               {user && location.pathname === '/profile' && (
                 <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white relative group shadow-lg hover:ring-4 hover:ring-blue/20 transition-all">
                    <LogOut className="w-5 h-5 fill-current ml-0.5" />
                 </button>
               )}
            </div>
          </div>
        </header>
      )}

      {isAdminMode ? (
        children
      ) : (
        <main className={cn(
          "max-w-[620px] md:max-w-4xl lg:max-w-6xl mx-auto px-4",
          location.pathname === '/ai' ? "pb-0 pt-0" : "pb-32 min-h-screen pt-24"
        )}>
          {children}
        </main>
      )}

      {!isAdminMode && location.pathname !== '/profile' && (
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
      )}

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
        return saved ? { ...JSON.parse(saved), model: JSON.parse(saved).model || 'lila' } : { subject: 'Science' as SubjectType, count: 5, model: 'lila' as 'lila' | 'subash' };
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
        if (!window.navigator.onLine) {
            alert("No Internet Connection. Board trial preparation requires an active link to our central core for question synthesis.");
            return;
        }
        setLoading(true);
        try {
            const isNepaliSubject = settings.subject === 'नेपाली' || settings.subject === 'सामाजिक';
            
            const systemInstruction = `You are an expert exam paper generator for Grade 10 Nepal Students (SEE). You must return high-quality multiple choice questions. You MUST return ONLY the JSON object. Do NOT include greetings. IMPORTANT: Use LaTeX ($...$) for ALL mathematical symbols, numbers, and formulas. Ensure questions and correct answers are 100% factually accurate.
            RESPONSE SCHEMA:
            {
                "quiz": [
                    {
                        "q": "question text",
                        "a": "choice a",
                        "b": "choice b",
                        "c": "choice c",
                        "d": "choice d",
                        "correct": "a",
                        "explanation": "why this is correct"
                    }
                ]
            }`;

            const data = await getAIJSONResponse(`Generate ${settings.count} accurate multiple-choice questions for Grade 10 SEE preparation in the subject: ${settings.subject}. 
            IMPORTANT: Each option ('a', 'b', 'c', 'd') must be a distinct possible answer.
            ${isNepaliSubject ? 'IMPORTANT: BOTH QUESTIONS AND ANSWERS MUST BE IN NEPALI LANGUAGE.' : 'Use professional English Language.'}`, systemInstruction);
            
            const quizData = data.quiz || [];

            if (quizData.length === 0) throw new Error("No questions generated.");
            
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
                            {(Object.keys(SUBJECTS_CONFIG) as SubjectType[])
                                .filter(sub => sub !== 'Economics' && sub !== 'Health')
                                .map((sub) => {
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
                                { id: 'miso', label: 'MISO', desc: 'Detailed Expert', color: 'rose-500', icon: Bot },
                                { id: 'nova', label: 'NOVA', desc: 'Reliable Backup', color: 'amber-500', icon: Sparkles }
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
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 mb-6 md:mb-12 leading-[1.15] tracking-tighter italic">
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
            const systemInstruction = `You are a professional teacher for Nepalese students. Provide a hint or conceptual explanation as to why the student's choice was wrong and guide them toward the right logic.
            CRITICAL INSTRUCTION: DO NOT explicitly state the correct answer. Guide the student conceptually.
            Use simple "Neplish" (English + Nepali mix). Focus on logic. 
            Use LaTeX ($...$) for mathematical symbols.`;

            const prompt = `Subject: ${subject}
Question: ${question.q}
Options: a: ${question.a}, b: ${question.b}, c: ${question.c}, d: ${question.d}
Correct: ${question.correct}
Student Answered: ${question.userChoice}`;

            const res = await getAIResponse('miso', prompt, systemInstruction);
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

/**
 * Wikimedia Commons API Helper
 */
const fetchWikimediaImages = async (query: string, limit: number = 30, offset: number = 0) => {
    try {
        const cleanQuery = query.replace(/[^\w\s-]/gi, ' ').trim();
        if (!cleanQuery) return [];

        // Enhanced query: Try to find high quality educational diagrams
        const educationalQuery = `${cleanQuery} educational diagram illustration labeled`;
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search&iiprop=url|extmetadata&iiextmetadatafilter=ObjectName|ImageDescription&gsrsearch=${encodeURIComponent(educationalQuery)}&gsrnamespace=6&gsrlimit=${limit}&gsroffset=${offset}&origin=*`;

        const res = await fetch(searchUrl, { mode: 'cors' });
        if (!res.ok) return [];
        
        const data = await res.json();
        let pages = data.query?.pages;

        // Fallback to broader search if specific search fails
        if (!pages) {
            const fallbackUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&generator=search&iiprop=url|extmetadata&iiextmetadatafilter=ObjectName&gsrsearch=${encodeURIComponent(cleanQuery)}&gsrnamespace=6&gsrlimit=${limit}&gsroffset=${offset}&origin=*`;
            const fallbackRes = await fetch(fallbackUrl, { mode: 'cors' });
            const fallbackData = await fallbackRes.json();
            pages = fallbackData.query?.pages;
        }

        if (!pages) return [];
        
        return Object.values(pages).map((page: any) => {
            const info = page.imageinfo?.[0];
            const meta = info?.extmetadata;
            const title = meta?.ObjectName?.value || meta?.ImageDescription?.value || page.title.replace('File:', '').replace(/\.[^/.]+$/, "");
            
            return {
                id: page.pageid,
                webformatURL: info?.url,
                largeImageURL: info?.url,
                previewURL: info?.url,
                tags: title,
                user: "Wikimedia Commons",
                views: Math.floor(Math.random() * 10000) + 1000,
                downloads: Math.floor(Math.random() * 5000) + 500
            };
        }).filter((img: any) => {
            const url = (img.webformatURL || '').toLowerCase();
            return url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/);
        });
    } catch (e) {
        return [];
    }
};
const WikimediaAIImage = ({ query, alt, onImageClick }: { query: string, alt: string, onImageClick?: (url: string) => void }) => {
    const [imgUrl, setImgUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImg = async () => {
            try {
                // Using Pollinations for high-fidelity diagrams
                const prompt = `${query} highly detailed educational scientific diagram, clear labels, colored illustration, clean white background, professional science textbook style`;
                setImgUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=768&nologo=true&seed=${Math.floor(Math.random() * 100000)}`);
            } catch (e) {
                setImgUrl(`https://image.pollinations.ai/prompt/${encodeURIComponent(query + ' diagram')}?width=1024&height=768&nologo=true&seed=42`);
            }
            setLoading(false);
        };
        fetchImg();
    }, [query]);

    if (loading) return (
        <div className="my-10 relative overflow-hidden rounded-[3rem] bg-slate-50 border border-slate-100 min-h-[400px] flex items-center justify-center shadow-inner">
            <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-[0.6rem] font-black text-indigo-600 uppercase tracking-[0.3em]">Synthesizing Diagram</p>
                    <p className="text-[0.5rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Sourcing high-fidelity medical visuals</p>
                </div>
            </motion.div>
        </div>
    );
    
    if (!imgUrl) return null;

    return (
        <div className="my-10 group/wiki animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <AILoadingImage src={imgUrl} alt={alt} i={0} onClick={() => onImageClick?.(imgUrl)} />
            <div className="mt-4 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                        <Brain className="w-2.5 h-2.5 text-slate-500" />
                    </div>
                    <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">AI Scientific Visualization</p>
                </div>
                <div className="h-[1px] flex-1 bg-slate-100 mx-4" />
                <p className="text-[0.5rem] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Precision Core</p>
            </div>
        </div>
    );
};

const TypewriterContent = ({ content, role, activeTutor, isNew = false, onImageClick }: { content: string, role: 'ai' | 'user', activeTutor: string, isNew?: boolean, onImageClick?: (url: string) => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [index, setIndex] = useState(0);
    const words = useMemo(() => content.split(' '), [content]);

    useEffect(() => {
        if (role === 'user' || content === 'Thinking...' || !isNew) {
            setDisplayedText(content);
            return;
        }
        setDisplayedText('');
        setIndex(0);
    }, [content, role, isNew]);

    useEffect(() => {
        if (role === 'user' || content === 'Thinking...' || !isNew) return;
        if (index < words.length) {
            const timer = setTimeout(() => {
                setDisplayedText(prev => prev + (prev ? ' ' : '') + words[index]);
                setIndex(prev => prev + 1);
            }, 25);
            return () => clearTimeout(timer);
        }
    }, [index, words, role, content, isNew]);

    return (
        <div className={cn(
            "prose max-w-none prose-p:mb-4 prose-headings:font-black prose-headings:text-slate-900 prose-img:rounded-[2rem] prose-img:shadow-lg prose-img:border prose-img:border-slate-100",
            role === 'ai' ? "prose-slate font-semibold text-[0.95rem]" : "prose-invert font-medium text-sm"
        )}>
            <Markdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                    h1: ({node, ...props}) => <h1 className={cn("text-3xl font-black uppercase tracking-tighter mt-6 mb-2", activeTutor === 'cannon' ? 'text-indigo-600' : activeTutor === 'nova' ? 'text-purple-600' : activeTutor === 'spark' ? 'text-orange-600' : 'text-emerald-600')} {...props} />,
                    h2: ({node, ...props}) => <h2 className={cn("text-2xl font-black uppercase tracking-tighter mt-5 mb-2", activeTutor === 'cannon' ? 'text-indigo-500' : activeTutor === 'nova' ? 'text-pink-500' : activeTutor === 'spark' ? 'text-amber-500' : 'text-teal-500')} {...props} />,
                    h3: ({node, ...props}) => <h3 className={cn("text-xl font-black uppercase tracking-tight mt-4 mb-2", activeTutor === 'cannon' ? 'text-blue-500' : activeTutor === 'nova' ? 'text-rose-500' : activeTutor === 'spark' ? 'text-yellow-600' : 'text-green-500')} {...props} />,
                    h4: ({node, ...props}) => <h4 className={cn("text-lg font-black uppercase tracking-tight mt-3 mb-1", activeTutor === 'cannon' ? 'text-blue-400' : activeTutor === 'nova' ? 'text-rose-400' : activeTutor === 'spark' ? 'text-yellow-500' : 'text-green-400')} {...props} />,
                    strong: ({node, ...props}) => <strong className="font-black text-indigo-600" {...props} />,
                    p: ({node, children, ...props}) => {
                        const txt = String(children);
                        const visualMatch = txt.match(/\[VISUAL:\s*(.*?)\]/i);
                        if (visualMatch) {
                            const prompt = visualMatch[1].trim();
                            return <WikimediaAIImage query={prompt} alt={prompt} onImageClick={onImageClick} />;
                        }
                        return <p className="mb-4" {...props}>{children}</p>;
                    },
                }}
            >
                {displayedText}
            </Markdown>
        </div>
    );
};

const ImagePreviewModal = ({ url, onClose }: { url: string, onClose: () => void }) => {
    const [zoom, setZoom] = useState(1);
    
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[5000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
        >
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-20"
            >
                <X className="w-6 h-6" />
            </button>
            
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-4 border border-white/10">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="text-white hover:text-blue-400 transition-colors"><SearchX className="w-5 h-5" /></button>
                    <span className="text-white text-xs font-black min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="text-white hover:text-blue-400 transition-colors"><Search className="w-5 h-5" /></button>
                </div>
                
                <a 
                    href={url} 
                    download={`aadhar_ai_${Date.now()}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-10 px-6 bg-blue text-white rounded-2xl flex items-center gap-2 font-black text-[0.65rem] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                >
                    <Download className="w-4 h-4" />
                    Download
                </a>
            </div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative max-w-full max-h-full overflow-auto custom-scrollbar flex items-center justify-center p-4 cursor-zoom-in"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <motion.img 
                    src={url} 
                    alt="Aadhar AI Visual" 
                    className="rounded-3xl shadow-2xl origin-center h-auto max-w-full"
                    style={{ scale: zoom }}
                    layoutId={`image-${url}`}
                />
            </motion.div>
        </motion.div>
    );
};

const AILoadingImage = ({ src, alt, i, onClick }: { src: string, alt: string, i: number, onClick?: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    return (
        <div className="my-10 relative group-visual">
            {/* Immersive Background Glow */}
            <motion.div 
                animate={{ 
                    opacity: [0.05, 0.15, 0.05],
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -inset-10 bg-linear-to-tr from-indigo-500/10 via-purple-500/10 to-blue-500/10 rounded-[5rem] blur-3xl -z-10" 
            />

            <div 
                onClick={onClick}
                className={cn(
                "relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] min-h-[380px] flex items-center justify-center transition-all duration-700 cursor-pointer group",
                loading ? "animate-pulse" : "hover:border-indigo-400 hover:shadow-indigo-500/15"
            )}>
                {/* Advanced Scanning UI */}
                {loading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-[2px]">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Rotating Inner Rings */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-full"
                            />
                            <motion.div 
                                animate={{ rotate: -360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border border-indigo-400/30 rounded-full border-t-indigo-500"
                            />
                            <div className="relative z-10 bg-white p-4 rounded-3xl shadow-lg border border-slate-100 italic font-black text-indigo-600 text-lg">
                                <Search className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Status HUD */}
                        <div className="mt-8 text-center space-y-2">
                            <motion.div 
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="flex items-center gap-2"
                            >
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                <span className="text-[0.65rem] font-black text-slate-800 uppercase tracking-[0.3em]">Synthesizing Data</span>
                            </motion.div>
                            <p className="text-[0.5rem] font-bold text-slate-400 uppercase tracking-widest">Constructing visual representation</p>
                        </div>

                        {/* Scanner Beam */}
                        <motion.div 
                            animate={{ top: ['-10%', '110%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-indigo-400 to-transparent blur-sm z-30"
                        />
                    </div>
                )}

                <img 
                    src={src}
                    alt={alt}
                    className={cn(
                        "w-full h-auto min-h-[380px] object-cover transition-all duration-1000",
                        loading ? "opacity-0 scale-110 blur-2xl" : "opacity-100 scale-100 blur-0 group-hover:scale-[1.02]"
                    )}
                    referrerPolicy="no-referrer"
                    onLoad={() => setLoading(false)}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (retryCount < 3) {
                            setRetryCount(prev => prev + 1);
                            // Fallback to a different seed and simpler prompt
                            const fallbackQuery = alt.replace(/[^\w\s]/gi, ' ').trim() + " science illustration diagram";
                            target.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackQuery)}?width=1024&height=768&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
                        } else if (retryCount === 3) {
                            setRetryCount(prev => prev + 1);
                            // Ultimate fallback: High quality general stock photo from LoremFlickr
                            target.src = `https://loremflickr.com/1024/768/${encodeURIComponent(alt.split(' ')[0] || 'science')}?lock=${Math.floor(Math.random() * 1000)}`;
                        } else {
                            setError(true);
                            setLoading(false);
                        }
                    }}
                />

                {/* Floating Meta Tag */}
                {!loading && !error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white shadow-2xl flex items-center justify-between z-10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Visual Insight</span>
                                <span className="text-[0.7rem] font-bold text-slate-900 line-clamp-1 truncate max-w-[150px]">{alt}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[0.45rem] font-black text-slate-500 uppercase tracking-widest">Verified</span>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mb-4 border border-rose-100">
                            <AlertTriangle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Sync Error</h3>
                        <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest leading-loose">The requested diagram could not be retrieved. Please try rephrasing your question.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AITutor = () => {
    const { user } = useApp();
    const navigate = useNavigate();
    
    const [view, setView] = useState<'selection' | 'chat'>('selection');
    const [activeTutor, setActiveTutor] = useState<'cannon' | 'nova' | 'spark' | 'miso'>('miso');

    const storageKey = `aadhar_chats_${user?.id || 'guest'}_${activeTutor}`;
    
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [limitError, setLimitError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure isNew is false for historical messages
            setMessages(parsed.map((m: any) => ({ ...m, isNew: false })));
        } else {
            setMessages([]);
        }
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
        if (!window.navigator.onLine) {
            alert("Connection Lost. AI Scholars require an active link to respond. Please check your network.");
            return;
        }
        const text = txt || input;
        if (!text.trim()) return;

        const userMsg = { role: 'user', text: text, isNew: true };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const aiMsgIndex = messages.length + 1;
        setMessages(prev => [...prev, { role: 'ai', text: 'Thinking...', isNew: true }]);

        try {
            const sharedFormatting = `
IDENTITY: You are Aadhar AI Tutor. Specifically the ${currentTutor.name} version.
STRICTNESS: No mistakes allowed. Strictly follow the Grade 10 CDC Nepal Syllabus. Think step-by-step for correctness.
FORMATTING:
1. MATH: Use $ for inline and $$ for block LaTeX math. Variables must be italic.
2. VISUALS: Use [VISUAL: DESCRIPTION] for diagrams.
3. EMOJIS: Maximum 3-4 emojis per response.
4. PARAGRAPHS: Keep them concise and focused.`;

            let systemInstruction = "";
            let identity = "";

            if (activeTutor === 'cannon') {
                identity = "CANNON V4.1, the Aadhar AI Curriculum Master. Friendly, encouraging, and focused on Nepal Board Exam preparation.";
            } else if (activeTutor === 'nova') {
                identity = "NOVA V3.4, the Aadhar AI Concept Tutor. Scholarly, deep conceptual dives. Uses 'Concept Dive' headers.";
            } else if (activeTutor === 'miso') {
                identity = "MISO V1.1, the Aadhar AI Instant Helper. Bullet points only, ultra-fast facts, very practical. THINK STEP BY STEP before providing any final answer. Verify each step logic.";
            } else {
                identity = "SPARK V2.3, the Aadhar AI Precise Assistant. Fact-checker, data-driven, accurate and concise.";
            }

            systemInstruction = `Identity: I am Aadhar AI. ${identity}\n${sharedFormatting}`;

            const responseText = await getAIResponse(activeTutor, text, systemInstruction);
            
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[aiMsgIndex]) {
                    newMessages[aiMsgIndex].text = responseText || "Brain freeze! Rebooting...";
                    newMessages[aiMsgIndex].isNew = true;
                }
                return newMessages;
            });
        } catch (e: any) {
            const errMsg = e.message || String(e);
            if (errMsg.includes("429") || errMsg.includes("quota")) {
                setLimitError(true);
            }
            setMessages(prev => {
                const newMessages = [...prev];
                let displayMsg = `Oops! Something went wrong: ${errMsg}`;
                if (errMsg.includes("429") || errMsg.includes("quota")) {
                    displayMsg = "⚡ AI Limit Reached! Our scholar needs a quick rest. Please try again in a few moments!";
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

    const [selectedAiImage, setSelectedAiImage] = useState<string | null>(null);

    const tutorConfig = {
        miso: { name: 'MISO V1.1', sub: 'Instant Helper', color: 'emerald', grad: 'from-emerald-500 to-teal-600', desc: '"Serving it hot!" Formulas and quick facts.' },
        spark: { name: 'SPARK V2.3', sub: 'Precise Assistant', color: 'orange', grad: 'from-amber-400 to-orange-600', desc: '"Stays Factual!" Reliable and accurate factual help.' },
        nova: { name: 'NOVA V3.4', sub: 'Conceptual Guru', color: 'purple', grad: 'from-pink-500 to-rose-600', desc: '"Let\'s dive deep." Deep conceptual explanations.' },
        cannon: { name: 'CANNON V4.1', sub: 'Curriculum Master', color: 'indigo', grad: 'from-indigo-500 to-indigo-700', desc: '"Friendly & Expert." Your main guide for SEE Prep.' }
    };

    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

    if (view === 'selection') {
        return (
            <div className="w-full animate-fade-up space-y-8 pb-32 pt-28">
                <div className="text-center space-y-3 py-10 flex flex-col items-center">
                    <div className="relative group cursor-pointer active:scale-95 transition-transform duration-500">
                        <div className="absolute -inset-6 bg-indigo-500/20 blur-3xl rounded-full animate-pulse group-hover:bg-indigo-500/30" />
                        <motion.div 
                            animate={{ 
                                y: [0, -15, 0],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 bg-linear-to-br from-indigo-500 via-indigo-600 to-purple-700 rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-8 relative z-10 border-4 border-white overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-linear-to-tr from-white/10 to-transparent opacity-50" />
                            <Bot className="w-12 h-12 text-white drop-shadow-xl" />
                        </motion.div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 leading-none tracking-tight">Hello My Friend!</h2>
                    <p className="text-slate-500 font-bold max-w-[320px] mx-auto leading-relaxed mt-2 text-balance">
                        I am Aadhar AI Tutor. Choose one of my versions for your study.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(Object.keys(tutorConfig) as Array<keyof typeof tutorConfig>).map((key) => (
                        <button 
                            key={key}
                            onClick={() => { setActiveTutor(key); setView('chat'); }}
                            className={cn(
                                "bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl text-left flex flex-col items-center text-center group transition-all relative overflow-hidden",
                                key === 'miso' ? "hover:border-emerald-500" : 
                                key === 'spark' ? "hover:border-amber-500" :
                                key === 'nova' ? "hover:border-pink-500" : "hover:border-indigo-500"
                            )}
                        >
                            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2", 
                                key === 'miso' ? "bg-emerald-500/5" : key === 'spark' ? "bg-amber-500/5" : key === 'nova' ? "bg-pink-500/5" : "bg-indigo-500/5")} />
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white group-hover:scale-110 transition-transform bg-linear-to-br", tutorConfig[key].grad)}>
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h3 className={cn("text-xl font-black italic uppercase leading-none mb-1", 
                                key === 'miso' ? "text-emerald-600" : 
                                key === 'spark' ? "text-orange-600" : 
                                key === 'nova' ? "text-pink-600" : "text-indigo-600")} 
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                                {tutorConfig[key].name}
                            </h3>
                            <p className={cn("text-[0.55rem] font-black uppercase tracking-widest mb-3", 
                                key === 'miso' ? "text-emerald-500/60" : 
                                key === 'spark' ? "text-orange-500/60" : 
                                key === 'nova' ? "text-pink-500/60" : "text-indigo-500/60")}>
                                {tutorConfig[key].sub}
                            </p>
                            <p className="text-[0.7rem] font-bold text-slate-400 leading-relaxed italic">{tutorConfig[key].desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const currentTutor = tutorConfig[activeTutor];

    return (
        <div className="fixed inset-0 bg-[#F8FAFC] z-[2000] flex flex-col items-center animate-fade-up">
            <div className="w-full max-w-[620px] md:max-w-4xl lg:max-w-6xl flex flex-col h-full bg-[#F8FAFC]">
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 shrink-0 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setView('selection')} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className={cn(
                            "w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 bg-linear-to-r", 
                            currentTutor.grad
                        )}>
                            <Sparkles className="text-white w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <h1 className={cn("text-lg md:text-xl font-black italic tracking-tighter uppercase leading-none", 
                                activeTutor === 'miso' ? "text-emerald-600" : 
                                activeTutor === 'spark' ? "text-orange-600" : 
                                activeTutor === 'nova' ? "text-pink-600" : "text-indigo-600")}
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                                {currentTutor.name}
                            </h1>
                            <p className="text-[0.5rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {currentTutor.sub}
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
                                    currentTutor.grad.includes('indigo') ? "bg-indigo-500" :
                                    currentTutor.grad.includes('pink') ? "bg-pink-500" : 
                                    currentTutor.grad.includes('amber') ? "bg-amber-500" :
                                    "bg-emerald-500"
                                )} />
                                <div className={cn(
                                    "w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative border-4 border-white transition-all duration-700 text-white shadow-xl bg-linear-to-br", 
                                    currentTutor.grad
                                )}>
                                    <Sparkles className="w-12 h-12" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase shrink-0">
                                    {activeTutor === 'cannon' ? "How can I help with SEE prep today?" :
                                     activeTutor === 'nova' ? "Let's dive deep into concepts." : 
                                     activeTutor === 'spark' ? "Factual accuracy is my priority." :
                                     "Serving facts at lightning speed!"}
                                </h2>
                                <p className="text-[0.85rem] font-bold text-slate-400 max-w-[320px] mx-auto leading-relaxed border-l-4 border-slate-100 pl-4 py-2 italic">
                                    {activeTutor === 'cannon'
                                        ? "Master the Nepal Board Curriculum with clear, curriculum-aligned guidance."
                                        : activeTutor === 'nova' 
                                        ? "Master Grade 10 concepts with conceptual clarity and real Nepali examples."
                                        : activeTutor === 'spark'
                                        ? "Reliable and precise assistance for all your school projects and homework."
                                        : "Fastest tips, formulas, and shortcut methods for your SEE prep."}
                                </p>
                            </div>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <div key={i} className={cn("flex gap-1.5 md:gap-3 w-full", m.role === 'ai' ? "flex-row" : "flex-row-reverse")}>
                            {/* Avatar */}
                            <div className="shrink-0 mt-1">
                                {m.role === 'ai' ? (
                                    <div className={cn("w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white shadow-lg bg-linear-to-br", currentTutor.grad)}>
                                        <Sparkles className="w-3.5 h-3.5 md:w-6 md:h-6" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white overflow-hidden border-2 border-white shadow-xl">
                                        <UserIcon className="w-3.5 h-3.5 md:w-6 md:h-6" />
                                    </div>
                                )}
                            </div>

                            <div className={cn("flex flex-col gap-2 max-w-[95%] md:max-w-[85%]", m.role === 'ai' ? "items-start" : "items-end")}>
                                    <div className={cn("text-[0.95rem] md:text-[1rem] transition-all",
                                    m.role === 'ai' 
                                        ? "bg-transparent text-slate-800 p-1" 
                                        : cn("text-white shadow-2xl rounded-tr-sm border-transparent p-4 md:p-5 rounded-[2rem] shadow-xl border", 
                                            activeTutor === 'miso' ? "bg-emerald-500 shadow-emerald-500/20" : 
                                            activeTutor === 'spark' ? "bg-orange-500 shadow-orange-500/20" : 
                                            activeTutor === 'nova' ? "bg-pink-500 shadow-pink-500/20" : "bg-indigo-600 shadow-indigo-600/20"
                                          )
                                )}>
                                    <TypewriterContent 
                                        content={m.text} 
                                        role={m.role} 
                                        activeTutor={activeTutor} 
                                        isNew={m.isNew} 
                                        onImageClick={(url) => setSelectedAiImage(url)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <AnimatePresence>
                        {selectedAiImage && (
                            <ImagePreviewModal url={selectedAiImage} onClose={() => setSelectedAiImage(null)} />
                        )}
                    </AnimatePresence>

                    {loading && messages[messages.length - 1]?.text === 'Thinking...' && (
                        <div className="flex gap-4 w-full items-start animate-fade-up">
                             <div className={cn("w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg bg-linear-to-br", currentTutor.grad)}>
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex items-center gap-4 py-2">
                                <div className="flex gap-1.5">
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", currentTutor.grad.includes('indigo') ? 'bg-indigo-500' : 'bg-emerald-500')} style={{ animationDelay: '0ms' }} />
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", currentTutor.grad.includes('indigo') ? 'bg-indigo-500' : 'bg-emerald-500')} style={{ animationDelay: '150ms' }} />
                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-bounce", currentTutor.grad.includes('indigo') ? 'bg-indigo-500' : 'bg-emerald-500')} style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={scrollRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-[#F8FAFC] shrink-0 border-t border-slate-100 relative">
                    {isAttachmentMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute bottom-[calc(100%+1rem)] left-4 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 flex flex-col gap-1 w-48 z-20 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full" />
                            {[
                                { icon: ImageIcon, label: 'Image', color: 'bg-emerald-500' },
                                { icon: Monitor, label: 'Camera', color: 'bg-blue-500' },
                                { icon: Mic, label: 'Voice', color: 'bg-orange-500' }
                            ].map((item, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => { alert(`${item.label} Coming Soon!`); setIsAttachmentMenuOpen(false); }}
                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
                                >
                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110", item.color)}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black uppercase text-slate-600 tracking-widest">{item.label}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    <div className="max-w-4xl mx-auto p-1.5 md:p-2 bg-white border-2 border-slate-100 rounded-full shadow-lg flex items-center gap-2 focus-within:border-indigo-500 transition-all">
                        <button 
                            onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                            className={cn(
                                "w-11 h-11 rounded-full flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0",
                                isAttachmentMenuOpen && "bg-indigo-500 text-white rotate-45 hover:bg-indigo-600"
                            )}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                        
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend('')}
                            placeholder={`Message ${currentTutor.name}...`}
                            className="flex-1 bg-transparent border-none outline-none font-bold text-sm md:text-base text-slate-700 px-3"
                        />

                        <button 
                            onClick={loading ? () => setLoading(false) : () => handleSend('')}
                            disabled={(!input.trim() && !loading)}
                            className={cn(
                                "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-20 shrink-0 bg-linear-to-br",
                                loading ? "bg-rose-500 shadow-rose-200" : currentTutor.grad
                            )}
                        >
                            {loading ? <X className="w-5 h-5" /> : <Send className="w-5 h-5" />}
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
            
            // Fix for signs: Use math.format for EVERYTHING to ensure signs are preserved correctly
            // mathjs handled signs internally in all its types (BigNumber, Fraction, Unit, etc)
            resultStr = math.format(result, { 
                precision: 14, 
                fraction: outputMode === 'fraction' ? 'ratio' : 'decimal',
                upperExp: 10,
                lowerExp: -10
            });
            
            // Clean up decimal point if needed
            if (typeof result === 'number' || result.isBigNumber) {
                 resultStr = resultStr.replace(/\.0+$/, '');
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
            if (outputMode === 'fraction' && answer.includes('/')) {
                const dec = math.evaluate(answer).toFixed(8).replace(/\.?0+$/, '');
                setAnswer(dec);
                setOutputMode('decimal');
            } else {
                const fracStr = math.format(math.fraction(parseFloat(answer)), { fraction: 'ratio' });
                setAnswer(fracStr);
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

    const [view, setView] = useState<'input' | 'result'>('input');

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

    if (view === 'result') {
        const totalMarks = [...compulsory, ...optional].reduce((acc, s) => acc + marks[s.name].theory + marks[s.name].practical, 0);
        const maxMarks = [...compulsory, ...optional].length * 100;
        const overallPercentage = (totalMarks / maxMarks) * 100;

        return (
            <div className="space-y-6 animate-fade-up">
                <button onClick={() => setView('input')} className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 hover:text-slate-900 active:scale-90 transition-all mb-4">
                    <ArrowLeft className="w-5 h-5" />
                </button>

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

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-md text-center">
                        <h4 className="text-[0.6rem] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Total Marks</h4>
                        <p className="text-4xl text-slate-800 font-black italic tracking-tighter"><span className="text-blue-500">{totalMarks}</span> <span className="text-xl text-slate-300">/ {maxMarks}</span></p>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-md text-center">
                        <h4 className="text-[0.6rem] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Overall Perf</h4>
                        <p className="text-4xl text-slate-800 font-black italic tracking-tighter"><span className="text-amber-500">{overallPercentage.toFixed(1)}</span><span className="text-xl text-slate-300">%</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-emerald-500" /> Subject Summary
                        </h3>
                    </div>
                    <div className="p-4 space-y-2">
                        {[...compulsory, ...optional].map((s, i) => {
                            const { theory, practical } = marks[s.name];
                            const percentage = theory + practical;
                            const { grade, color } = getGradeInfo(percentage);
                            return (
                                <div key={s.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-[2rem] border border-slate-100 items-center">
                                    <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2",
                                            i < compulsory.length 
                                                ? "bg-blue-100 text-blue-600 border-blue-200" 
                                                : "bg-purple-100 text-purple-600 border-purple-200"
                                        )}>
                                            {s.name.charAt(0)}
                                        </div>
                                        <div className="text-left w-full">
                                            <h4 className="font-bold text-slate-900 leading-none mb-1">{s.name}</h4>
                                            <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
                                                <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest leading-tight">
                                                    {i < compulsory.length ? 'Compulsory' : 'Optional'}
                                                </p>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block" />
                                                <p className={cn("text-[0.55rem] font-black uppercase tracking-widest", percentage > 0 ? "text-emerald-500" : "text-slate-400")}>{percentage}% (T: {theory}, P: {practical})</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("px-6 py-2 rounded-xl font-black text-sm border shadow-sm w-full sm:w-auto text-center shrink-0", color)}>
                                        Grade {grade}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex justify-between items-center">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-500" /> Subject Grading Grid
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
                        return (
                            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all relative z-10 gap-4 group focus-within:ring-2 focus-within:ring-amber-200">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border-2 transition-transform group-focus-within:scale-110",
                                        i < compulsory.length 
                                            ? "bg-blue-50 text-blue-600 border-blue-100" 
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
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 sm:ml-auto">
                                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full justify-between">
                                        <div className="flex items-center rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all relative">
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
                                                className="w-14 text-center font-black text-slate-800 outline-none text-base bg-transparent p-0 placeholder:text-slate-200"
                                            />
                                        </div>
                                        <span className="text-slate-300 font-bold px-1">+</span>
                                        <div className="flex items-center rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all relative">
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
                                                className="w-14 text-center font-black text-slate-800 outline-none text-base bg-transparent p-0 placeholder:text-slate-200"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button 
                onClick={() => setView('result')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-[2.5rem] shadow-lg hover:shadow-xl flex items-center justify-center gap-4 group active:scale-95 transition-all cursor-pointer"
            >
                <span className="text-xl font-black italic uppercase tracking-tighter">Calculate Result</span>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 transition-all">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
            </button>
        </div>
    );
};

const ToolHeader = ({ title, subtitle, icon: Icon, onBack }: { title: string; subtitle: string; icon?: any, onBack?: () => void }) => {
    const navigate = useNavigate();
    return (
        <header className="flex items-center gap-4 mb-8 text-left">
            <button 
                onClick={() => onBack ? onBack() : navigate(-1)} 
                className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:scale-105 active:scale-95"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{title}</h1>
                    {Icon && <Icon className="w-6 h-6 text-indigo-500 shrink-0 hidden sm:block" />}
                </div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
        </header>
    );
};

const SmartCalculatorLogo = () => {
    return (
        <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0 select-none group flex items-center justify-center">
            <div className="absolute inset-0 bg-violet-100 rounded-full blur-md opacity-50 group-hover:opacity-85 transition-opacity duration-300" />
            <div className="relative w-10 h-10 md:w-11 md:h-11 bg-linear-to-tr from-violet-600 to-fuchsia-500 text-white rounded-full flex items-center justify-center shadow-xs">
                <Calculator className="w-5 h-5 md:w-5.5 md:h-5.5 stroke-[2.25]" />
            </div>
        </div>
    );
};

const CalculatorSuite = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'main' | 'gpa'>('main');
    const [comingSoon, setComingSoon] = useState<string | null>(null);

    const calculators = [
        {
            id: 'percentage',
            title: 'Percentage',
            subtitle: 'Marks, discounts, percent change',
            icon: Percent,
            bgColor: 'bg-violet-50',
            iconColor: 'text-violet-600',
        },
        {
            id: 'gpa',
            title: 'GPA Calculator',
            subtitle: 'Calculate your semester GPA',
            icon: GraduationCap,
            bgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            id: 'geometry',
            title: 'Geometry',
            subtitle: 'Area, perimeter & shape solver',
            icon: Triangle,
            bgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            id: 'physics',
            title: 'Physics',
            subtitle: 'Solve physics formulas',
            icon: Orbit,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            id: 'chemistry',
            title: 'Chemistry',
            subtitle: 'Molar mass, dilution & more',
            icon: Beaker,
            bgColor: 'bg-teal-50',
            iconColor: 'text-teal-600',
        },
        {
            id: 'statistics',
            title: 'Statistics',
            subtitle: 'Mean, median, mode & more',
            icon: BarChart3,
            bgColor: 'bg-rose-50',
            iconColor: 'text-rose-600',
        },
        {
            id: 'equation',
            title: 'Equation Solver',
            subtitle: 'Solve linear & quadratic eq.',
            icon: Variable,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600',
        },
        {
            id: 'unit',
            title: 'Unit Converter',
            subtitle: 'Convert between units',
            icon: ArrowRightLeft,
            bgColor: 'bg-sky-50',
            iconColor: 'text-sky-600',
        }
    ];

    const handleCardClick = (id: string, title: string) => {
        if (id === 'gpa') {
            setView('gpa');
        } else {
            setComingSoon(title);
        }
    };

    if (view === 'gpa') {
        return (
            <div className="bg-transparent text-slate-800 pb-20 font-sans">
                <div className="max-w-xl mx-auto space-y-6">
                    {/* Embedded Back Navigation to Main Calculator */}
                    <div className="flex items-center gap-4 text-left">
                        <button 
                            onClick={() => setView('main')}
                            className="w-11 h-11 bg-white border border-slate-200 text-slate-500 rounded-xl flex items-center justify-center hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all cursor-pointer shadow-xs"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-none tracking-tight">GPA Calculator</h1>
                            <p className="text-[0.65rem] font-extrabold text-indigo-650 uppercase tracking-widest mt-1.5">Calculate your academic semester GPA</p>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs">
                        <GPACalculator />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-transparent flex flex-col items-center pb-20 duration-700 text-slate-800 font-sans">
            {/* 1. Header Row */}
            <div className="w-full px-4 py-3 md:py-6 flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-5 leading-tight text-left">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <SmartCalculatorLogo />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                             <h1 className="text-xl md:text-3xl font-black text-slate-900 italic tracking-tight truncate animate-fade-in">Smart Calculator</h1>
                             <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-full text-[0.5rem] md:text-[0.62rem] font-bold uppercase tracking-wider shrink-0 shadow-xs">
                                <Sparkles className="w-2.5 md:w-3.5 h-2.5 md:h-3.5 animate-pulse" /> AI Powered
                             </span>
                        </div>
                        <p className="text-[0.55rem] md:text-[0.7rem] font-black uppercase tracking-widest mt-1 text-indigo-600">Solve academic problems instantly</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    <button className="w-10 h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-655 active:scale-90 transition-all cursor-pointer shadow-xs">
                        <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="w-10 h-10 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-655 active:scale-90 transition-all cursor-pointer shadow-xs">
                        <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* 2. Headline & Overview */}
            <div className="w-full px-4 text-left mt-6 mb-8">
                <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Academic Solvers & Formulae</h2>
                <p className="text-slate-500 text-sm md:text-base mt-2 max-w-2xl font-medium">Select a calculator tool to begin. Get immediate computations with step-by-step logic powered by clean, robust arithmetic algorithms.</p>
            </div>

            {/* 3. Calculators Grid */}
            <div className="w-full px-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12 text-left">
                {calculators.map((calcItems) => (
                    <div 
                        key={calcItems.id}
                        onClick={() => handleCardClick(calcItems.id, calcItems.title)}
                        className="bg-white border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-start gap-4 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer group active:scale-[0.98] duration-300"
                    >
                        <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", calcItems.bgColor, calcItems.iconColor)}>
                            {calcItems.id === 'equation' ? (
                                <span className="font-extrabold italic text-sm md:text-2xl leading-none select-none">x²</span>
                            ) : (
                                React.createElement(calcItems.icon as any, { className: "w-4 h-4 md:w-8 md:h-8" })
                            )}
                        </div>
                        <div className="flex flex-col gap-1 md:gap-2">
                            <span className="text-slate-900 text-sm md:text-lg font-bold tracking-tight group-hover:text-indigo-655 transition-colors">
                                {calcItems.title}
                            </span>
                            <span className="text-slate-400 text-[0.62rem] md:text-xs font-semibold leading-relaxed line-clamp-2">
                                {calcItems.subtitle}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subsections: Full Width Vertical Stack */}
            <div className="w-full px-4 space-y-8 mt-4 text-left">
                {/* AI Problem Solver Banner */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-xs relative overflow-hidden group gap-4">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-11 h-11 md:w-14 md:h-14 bg-indigo-50 border border-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                            <Camera className="w-5.5 h-5.5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-slate-900 text-sm md:text-lg leading-none">AI Problem Solver</h3>
                                <span className="bg-indigo-600 text-white font-bold text-[0.45rem] md:text-[0.55rem] tracking-widest uppercase px-2 py-0.5 rounded-full select-none shadow-xs">NEW</span>
                            </div>
                            <p className="text-[0.62rem] md:text-xs text-slate-500 font-bold leading-relaxed mt-2 max-w-md">
                                Take photo or type question and get instant step-by-step solver logic
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/ai')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl md:rounded-2xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Solve Now</span>
                    </button>
                </div>

                {/* Recent Calculations */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[0.7rem] md:text-xs font-black text-slate-400 tracking-wider uppercase">Recent Calculations</h2>
                        <button className="text-[0.65rem] md:text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800">View All</button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col justify-between hover:border-slate-200 transition-all h-28 shadow-xs relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
                                        <Percent className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[0.55rem] md:text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-wider">Percentage</span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 text-sm">⋮</button>
                            </div>
                            <div className="mt-2 text-left">
                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">91.2%</h3>
                                <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 mt-0.5">456 / 500</p>
                            </div>
                            <p className="text-[0.45rem] md:text-[0.5rem] font-bold text-slate-400 uppercase mt-1">23 May, 9:20 PM</p>
                        </div>

                        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col justify-between hover:border-slate-200 transition-all h-28 shadow-xs relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                                        <Triangle className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[0.55rem] md:text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-wider">Circle Area</span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 text-sm">⋮</button>
                            </div>
                            <div className="mt-2 text-left">
                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">314.16 cm²</h3>
                                <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 mt-0.5">r = 10 cm</p>
                            </div>
                            <p className="text-[0.45rem] md:text-[0.5rem] font-bold text-slate-400 uppercase mt-1">23 May, 7:15 PM</p>
                        </div>

                        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col justify-between hover:border-slate-200 transition-all h-28 shadow-xs relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Activity className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[0.55rem] md:text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-wider">Speed</span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 text-sm">⋮</button>
                            </div>
                            <div className="mt-2 text-left">
                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">25 m/s</h3>
                                <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 mt-0.5">100 m / 4 s</p>
                            </div>
                            <p className="text-[0.45rem] md:text-[0.5rem] font-bold text-slate-400 uppercase mt-1">23 May, 6:45 PM</p>
                        </div>

                        <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl md:rounded-3xl flex flex-col justify-between hover:border-slate-200 transition-all h-28 shadow-xs relative group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                                        <span className="text-[0.55rem] font-extrabold italic">x²</span>
                                    </div>
                                    <span className="text-[0.55rem] md:text-[0.65rem] font-extrabold text-slate-400 uppercase tracking-wider">Quad Eq.</span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 text-sm">⋮</button>
                            </div>
                            <div className="mt-2 text-left">
                                <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">x = 2, 3</h3>
                                <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 mt-0.5">x² - 5x + 6 = 0</p>
                            </div>
                            <p className="text-[0.45rem] md:text-[0.5rem] font-bold text-slate-400 uppercase mt-1">23 May, 6:30 PM</p>
                        </div>
                    </div>
                </div>

                {/* Formula Solver Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[0.7rem] md:text-xs font-black text-slate-400 tracking-wider uppercase">Formula Solver</h2>
                        <button className="text-[0.65rem] md:text-xs font-black text-indigo-650 uppercase tracking-widest hover:text-indigo-800">View All</button>
                    </div>
                    <div className="bg-white border border-slate-100 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-xs hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-14 md:w-16 md:h-16 bg-amber-50 border border-amber-100 rounded-2xl flex flex-col items-center justify-center text-amber-600 shadow-inner shrink-0 select-none">
                                <Zap className="w-5 h-5 text-amber-500" />
                                <span className="text-[0.45rem] md:text-[0.5rem] font-black uppercase mt-1">Speed</span>
                            </div>
                            <div className="space-y-2 min-w-0 text-left">
                                <div>
                                    <span className="text-[0.5rem] md:text-[0.55rem] font-black text-slate-400 uppercase tracking-wider block">Formula</span>
                                    <span className="text-sm md:text-lg font-bold text-slate-800 truncate block">
                                        Speed = <span className="underline decoration-indigo-500 decoration-2 underline-offset-4 font-extrabold">Dist</span> / <span className="underline decoration-violet-500 decoration-2 underline-offset-4 font-extrabold">Time</span>
                                    </span>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <span className="text-[0.45rem] md:text-[0.5rem] font-black text-slate-400 uppercase block leading-none">Distance</span>
                                        <span className="text-[0.65rem] md:text-sm font-bold text-slate-600 leading-none">100 m</span>
                                    </div>
                                    <div>
                                        <span className="text-[0.45rem] md:text-[0.5rem] font-black text-slate-400 uppercase block leading-none">Time</span>
                                        <span className="text-[0.65rem] md:text-sm font-bold text-slate-600 leading-none">20 s</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-105 pt-4 sm:pt-0 sm:pl-6 shrink-0">
                            <span className="text-[0.45rem] md:text-[0.5rem] font-black text-slate-400 uppercase tracking-wider block">Result Speed</span>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-emerald-600 font-black text-[0.6rem] md:text-xs uppercase bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full select-none">5 m/s</span>
                                <button className="text-[0.6rem] md:text-xs font-black text-indigo-650 hover:text-indigo-800 flex items-center gap-0.5 uppercase tracking-wider cursor-pointer">
                                    <span>Steps</span>
                                    <ChevronRight className="w-3 md:w-4 h-3 md:h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coming Soon Popover Dialog */}
            <AnimatePresence>
                {comingSoon && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white border border-slate-100 rounded-[2rem] p-8 max-w-xs w-full text-center shadow-2xl relative"
                        >
                            <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-4">
                                <Sparkles className="w-7 h-7 animate-pulse" />
                            </div>
                            <h3 className="text-base font-extrabold text-slate-950 tracking-tight">
                                {comingSoon} Solver
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">
                                We are crafting an AI-integrated solver for {comingSoon.toLowerCase()} formulas. This feature is releasing shortly! For now, try our fully-interactive GPA Calculator.
                            </p>
                            <div className="mt-6 flex flex-col gap-2">
                                <button 
                                    onClick={() => {
                                        setComingSoon(null);
                                        setView('gpa');
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                                >
                                    Try GPA Calculator
                                </button>
                                <button 
                                    onClick={() => setComingSoon(null)}
                                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const bannerColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-blue-500", "bg-pink-500", "bg-teal-500", "bg-cyan-500", "bg-purple-500"];
    const [bannerColorIndex, setBannerColorIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setBannerColorIndex(prev => (prev + 1) % bannerColors.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 pb-20 px-1 text-slate-800">
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
                <div className="p-5 rounded-[2rem] shadow-sm border flex flex-col items-center bg-white border-slate-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-inner bg-amber-50 text-amber-500">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-black leading-none tabular-nums text-slate-800">{user?.xp || 0}</div>
                    <div className="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest mt-2">{user?.email ? 'Academic Mastery' : 'Academic Standing'}</div>
                </div>
                <div className="p-5 rounded-[2rem] shadow-sm border flex flex-col items-center bg-white border-slate-100">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-inner bg-rose-50 text-rose-500">
                        <Flame className="w-5 h-5" />
                    </div>
                    <div className="text-xl font-black leading-none tabular-nums text-slate-800">{user?.streak || 1}</div>
                    <div className="text-[0.6rem] text-slate-400 font-black uppercase tracking-widest mt-2">Active Day Streak</div>
                </div>
            </div>
            
            {/* Aadhar Toolkit - 4 Buttons with Tools Page Design */}
            <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-blue-100 text-blue-600"><ToolLayout className="w-4 h-4" /></div>
                        <h2 className="text-xl font-black tracking-tight italic text-slate-800">Quick Tools</h2>
                    </div>
                    <Link to="/tools" className="font-black text-[0.65rem] uppercase tracking-[0.2em] hover:underline text-blue-600">Full Toolkit</Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { id: 'timer', label: 'Focus Timer', icon: Timer, path: '/tools/timer', color: 'rose' },
                        { id: 'formulas', label: 'Formula Bank', icon: Sigma, path: '/tools/formulas', color: 'purple' },
                        { id: 'dictionary', label: 'Dictionary', icon: Book, path: '/tools/dictionary', color: 'emerald' },
                        { id: 'nepali-dictionary', label: 'नेपाली शब्दकोश', icon: Languages, path: '/tools/nepali-dictionary', color: 'amber' },
                    ].map((t) => (
                        <Link 
                            key={t.id} 
                            to={t.path} 
                            className="p-6 rounded-[2.5rem] border flex flex-col items-center justify-center gap-4 transition-all active:scale-95 text-center min-h-[140px] group bg-white border-slate-100 shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue/20"
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform shrink-0 shadow-sm group-hover:scale-110",
                                t.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                t.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                t.color === 'orange' ? "bg-orange-50 text-orange-600" :
                                t.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                "bg-rose-50 text-rose-600"
                            )}>
                                <t.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-black text-[0.8rem] tracking-tighter uppercase italic text-slate-800">{t.label}</h3>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Syllabus Countdown Card - Improved with more features and better clock */}
            <div className="bg-white p-7 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                    <Target className="w-48 h-48 text-blue group-hover:rotate-12 transition-transform duration-1000" />
                </div>
                
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner relative">
                                <Clock className="w-6 h-6 animate-spin-slow" />
                                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
                            </div>
                            <div>
                                <h3 className="font-black text-[0.8rem] text-slate-900 uppercase tracking-widest leading-none">Exam Countdown</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">SEE 2083 Live Tracker</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[80px]">
                            <span className="text-[0.5rem] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Live UTC</span>
                            <div className="text-sm font-black text-slate-800 tabular-nums">
                                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-4xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase leading-none block">245 Days</span>
                                <span className="text-[0.65rem] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-3 py-1 rounded-full inline-block mt-2">Active Prep Zone</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-1">Completion</p>
                                <p className="text-xl font-black text-blue-600 italic">32.4%</p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                             <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100 shadow-inner">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "32.4%" }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-rose-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)] relative"
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    <div className="absolute top-0 right-0 h-full w-4 bg-white/40 blur-sm skew-x-12" />
                                </motion.div>
                            </div>
                            <div className="flex justify-between px-1">
                                <span className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest">Beginning</span>
                                <span className="text-[0.5rem] font-black text-slate-400 uppercase tracking-widest italic">Target: SEE 2083</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                             <p className="text-[0.5rem] font-black text-slate-400 uppercase mb-1">Consistency</p>
                             <div className="flex items-end gap-1">
                                <p className="text-lg font-black text-slate-800 leading-none">98</p>
                                <span className="text-[0.6rem] font-bold text-slate-400 mb-0.5">%</span>
                             </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-rose-50 transition-colors">
                             <p className="text-[0.5rem] font-black text-slate-400 uppercase mb-1">Syllabus</p>
                             <div className="flex items-end gap-1">
                                <p className="text-lg font-black text-slate-800 leading-none">42</p>
                                <span className="text-[0.6rem] font-bold text-slate-400 mb-0.5">%</span>
                             </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 group-hover:bg-amber-50 transition-colors">
                             <p className="text-[0.5rem] font-black text-slate-400 uppercase mb-1">Test Given</p>
                             <div className="flex items-end gap-1">
                                <p className="text-lg font-black text-slate-800 leading-none">12</p>
                             </div>
                        </div>
                    </div>
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
        { id: 'visuals', label: 'Visuals', icon: Palette, color: 'pink', path: '/tools/visuals' },
        { id: 'dictionary', label: 'Dictionary', icon: Book, color: 'rose', path: '/tools/dictionary' },
        { id: 'nepali-dictionary', label: 'नेपाली शब्दकोश', icon: Languages, color: 'amber', path: '/tools/nepali-dictionary' },
        { id: 'notepad', label: 'Mind Log', icon: Edit3, color: 'orange', path: '/tools/notes' },
        { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'rose', path: '/tools/timer' },
        { id: 'formulas', label: 'Formula Bank', icon: Sigma, color: 'purple', path: '/tools/formulas' },
        { id: 'graphs', label: 'Graphs', icon: LineChart, color: 'emerald', path: '/tools/graphs' },
        { id: 'calendar', label: 'Exam Calendar', icon: Calendar, color: 'blue', path: '/tools/calendar' },
        ...(isToolsPage ? [
            { id: 'smart-calculator', label: 'Smart Calculator', icon: Calculator, color: 'violet', path: '/tools/calculator' },
            { id: 'periodic', label: 'Periodic Table', icon: Grid3X3, color: 'purple', path: '/tools/periodic-table' },
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
                <header className="mb-8 pt-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-[#020617] italic tracking-tighter uppercase leading-none">The Toolkit</h1>
                    </div>
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
                                t.color === 'pink' ? "bg-pink-50 text-pink-600" :
                                t.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                                t.color === 'blue' ? "bg-blue-50 text-blue" :
                                t.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                                t.color === 'rose' ? "bg-rose-50 text-rose-500" :
                                t.color === 'amber' ? "bg-amber-50 text-amber-600" :
                                t.color === 'purple' ? "bg-purple-50 text-purple-600" :
                                t.color === 'violet' ? "bg-violet-50 text-violet-600" :
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
        { id: '1', title: 'Routine', importance: 'alert', content: 'SEE 2083 Routine Published. Examination timeline released.' },
        { id: '2', title: 'Update', importance: 'update', content: 'System Maintenance: Servers will undergo maintenance at 2 AM NPT.' },
        { id: '3', title: 'Notice', importance: 'info', content: 'Math Model Questions Added to practice sets.' }
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
                    <Bell className="w-5 h-5 text-white/20 animate-bounce origin-top" />
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
                            (displayNotices[currentIndex].type === 'alert' || displayNotices[currentIndex].importance === 'alert') ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]" : 
                            (displayNotices[currentIndex].type === 'update' || displayNotices[currentIndex].importance === 'update') ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]" : "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                        )}>
                            <Pin className="w-3 h-3" />
                            {displayNotices[currentIndex].type || displayNotices[currentIndex].title}
                        </div>
                        <p className="text-lg font-bold text-white leading-tight tracking-tight">
                            {displayNotices[currentIndex].text || displayNotices[currentIndex].content}
                        </p>
                    </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex gap-2">
                    {displayNotices.map((_, i) => (
                        <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === currentIndex ? "w-8 bg-blue-500" : "w-3 bg-white/10")} />
                    ))}
                </div>
                
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
        </div>
    );
};

const SAMPLE_NEWS: any[] = [
    {
        id: 's1',
        title: 'SEE Exam 2083: New Model Question Sets Released by CDC',
        content: `The Curriculum Development Centre (CDC) has released the updated model question sets for the Secondary Education Examination (SEE) 2083. 

The new sets include changes in the marking scheme for Mathematics and Science, focusing more on conceptual understanding rather than rote memorization. This year, the questions are designed to test higher-order thinking skills as part of the ongoing curriculum reform.

Students can download the PDFs from the official Aadhar Hub or visit the National Education Board website. Our AI Tutor, CANNON V4.1, has already been updated with these new patterns to help you prepare better.`,
        category: 'Exams',
        image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop',
        author: 'Aadhar Editorial',
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 's2',
        title: 'Top 10 Tips for Master Grade 10 Science Practicals',
        content: `Practical exams contribute significantly to your final grade. Here are the top 10 tips to master your Science laboratory experiments:

1. Understand the Theory: Before entering the lab, ensure you know the chemical reactions or physical principles behind the experiment.
2. Maintain a Clean Logbook: Clear diagrams and neat observations are key.
3. Safety First: Always wear a lab coat and handle acids with care.
4. Calibration: Check your instruments like pipettes and spring balances for zero errors.

Our expert AI, NOVA V3.4, has a dedicated module for practical simulations and common viva questions used by SEE examiners.`,
        category: 'Study Tips',
        image_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1470&auto=format&fit=crop',
        author: 'Dr. Sameer Pathak',
        created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 's3',
        title: 'Education Minister Announces Digital Transformation in Public Schools',
        content: `In a landmark decision, the Ministry of Education has announced a plan to equip all public secondary schools with high-speed internet and digital learning tools within the next two years.

"The goal is to bridge the digital divide between private and community schools," the minister stated during the press conference. Aadhar Pathshala is proud to be at the forefront of this digital revolution, providing AI-powered learning to students across Nepal.

Initial pilot programs will begin in schools across the Bagmati Province starting next semester.`,
        category: 'Policy',
        image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1470&auto=format&fit=crop',
        author: 'EduWeekly Nepal',
        created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 's4',
        title: 'How to Manage Board Exam Stress: A Student Perspective',
        content: `The pressure of the SEE can be overwhelming. We interviewed several toppers from last year to see how they managed their mental health.

- Consistent Breaks: "I followed the Pomodoro technique, studying for 50 minutes and resting for 10," says Ravi, who scored 4.0 GPA.
- Physical Activity: A quick walk or 20 minutes of exercise helps recharge the brain.
- Adequate Sleep: Sacrificing sleep for studies often leads to lower retention rates.

Remember, the Board Exam is just a milestone, not the destination. Stay calm and trust your preparation.`,
        category: 'Wellness',
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1470&auto=format&fit=crop',
        author: 'Priya Sharma',
        created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 's5',
        title: 'New Vocational Courses Introduced in Grade 9 and 10 Curriculum',
        content: `The CDC has introduced three new vocational courses: Artificial Intelligence, Tourism Management, and Sustainable Agriculture, as optional subjects for Grade 9 and 10.

These subjects aim to provide practical skills that are relevant to the modern economy. "We want students to not only be academic experts but also skill-ready for the real world," said the curriculum coordinator.

Aadhar AI will soon launch specific tutors and hub materials for these new subjects. Stay tuned!`,
        category: 'Updates',
        image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1470&auto=format&fit=crop',
        author: 'Aadhar News Desk',
        created_at: new Date(Date.now() - 345600000).toISOString()
    }
];

const NewsPage = () => {
    const { liveNews, fetchLiveNews } = useApp();
    const [selectedNews, setSelectedNews] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('For You');

    useEffect(() => { if (fetchLiveNews) fetchLiveNews(); }, []);

    const tabs = ['For You', 'Featured', 'Top stories', 'Trending'];

    const allNews = liveNews.map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        created_at: n.created_at,
        category: n.category || 'General',
        image_url: n.image_url,
        author: n.author || 'Admin'
    })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const filteredNews = activeTab === 'For You' ? allNews : allNews.filter(n => {
        if (activeTab === 'Featured') return n.category === 'Exams' || n.category === 'Updates';
        if (activeTab === 'Top stories') return true;
        return true;
    });

    if (selectedNews) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[3000] bg-white overflow-y-auto"
            >
                <div className="relative h-80 md:h-[30rem]">
                    <img 
                        src={selectedNews.image_url || 'https://images.unsplash.com/photo-1504711432869-5d39a1103c0e?q=80&w=1470&auto=format&fit=crop'} 
                        className="w-full h-full object-cover" 
                        alt="" 
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                    <button 
                        onClick={() => setSelectedNews(null)}
                        className="absolute top-6 left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    
                    <div className="absolute bottom-10 left-10 right-10 max-w-4xl mx-auto">
                        <span className="px-5 py-2 bg-rose-500 text-white text-[0.7rem] font-black uppercase tracking-widest rounded-2xl mb-4 inline-block shadow-2xl">
                            {selectedNews.category}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tighter drop-shadow-2xl italic uppercase">
                            {selectedNews.title}
                        </h2>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="bg-white rounded-[3rem] p-6 md:p-8 shadow-2xl border border-slate-50 mb-12 -mt-24 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl rotate-3 shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${selectedNews.author}&background=000&color=fff`} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase italic leading-tight truncate">{selectedNews.author}</h3>
                                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1 truncate">{new Date(selectedNews.created_at).toLocaleDateString()} · Official Metadata</p>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
                             <button className="flex-1 md:flex-none h-14 px-4 sm:px-8 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center gap-2 sm:gap-3 font-black text-[0.65rem] sm:text-[0.7rem] uppercase tracking-widest shadow-xl transition-all active:scale-95 whitespace-nowrap">
                                 <Bookmark className="w-4 h-4 shrink-0" />
                                 Track Report
                             </button>
                             <button className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-400 border border-slate-100 active:rotate-12 transition-transform shrink-0"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="prose prose-lg prose-slate max-w-none prose-p:text-slate-600 prose-p:font-bold prose-p:leading-relaxed prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter">
                        <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>{selectedNews.content}</Markdown>
                    </div>

                    <div className="mt-20 pt-10 border-t border-slate-100 space-y-8">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[0.8rem] font-black text-slate-900 uppercase tracking-[0.4em] italic">Visual Intelligence</h4>
                            <div className="flex-1 h-px bg-linear-to-r from-transparent via-slate-100 to-transparent mx-4" />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                                 <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800" className="w-full h-full object-cover" alt="" />
                             </div>
                             <div className="aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
                                 <img src="https://images.unsplash.com/photo-1523050335456-c384474b3353?q=80&w=800" className="w-full h-full object-cover" alt="" />
                             </div>
                         </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-up pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between px-1 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <span className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xs italic">A</span>
                         <span className="text-[0.65rem] font-black uppercase tracking-[0.5em] text-slate-400">Intelligence Feed</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">The Pulse</h1>
                </div>
                <div className="flex gap-3">
                     <div className="h-14 px-6 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-3 text-slate-400 group focus-within:ring-2 focus-within:ring-slate-900 transition-all">
                         <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         <input type="text" placeholder="Search Intel..." className="bg-transparent border-none outline-none text-xs font-black uppercase tracking-widest text-slate-900 placeholder:text-slate-300 w-32 md:w-48" />
                     </div>
                </div>
            </header>

            <div className="flex items-center gap-8 overflow-x-auto px-1 no-scrollbar pb-2">
                {tabs.map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "text-[0.7rem] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap relative pb-4",
                            activeTab === tab ? "text-slate-900 scale-110" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {tab}
                        {activeTab === tab && (
                            <motion.div layoutId="news-tab" className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredNews.map((news, i) => (
                    <motion.div 
                        key={news.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setSelectedNews(news)}
                        className="group bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden cursor-pointer hover:shadow-slate-200/50 transition-all relative active:scale-[0.98]"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <img 
                                src={news.image_url || 'https://images.unsplash.com/photo-1504711432869-5d39a1103c0e?q=80&w=1470&auto=format&fit=crop'} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                                alt="" 
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                            
                            <div className="absolute top-8 left-8">
                                <span className={cn(
                                    "px-5 py-2 text-white text-[0.65rem] font-black uppercase tracking-widest rounded-2xl shadow-2xl backdrop-blur-md",
                                    news.category === 'Exams' ? "bg-rose-500" : news.category === 'Study Tips' ? "bg-indigo-500" : "bg-emerald-500"
                                )}>
                                    {news.category}
                                </span>
                            </div>

                            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
                                <h3 className="text-xl md:text-3xl font-black text-white leading-tight tracking-tighter italic uppercase drop-shadow-xl mb-4 md:mb-6 group-hover:translate-x-3 transition-transform line-clamp-3">
                                    {news.title}
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <div className="w-10 h-10 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg rotate-2 shrink-0">
                                            <img src={`https://ui-avatars.com/api/?name=${news.author}&background=fff&color=000`} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[0.65rem] font-black text-white uppercase tracking-widest leading-none truncate">{news.author}</span>
                                            <span className="text-[0.55rem] font-bold text-white/50 uppercase tracking-widest mt-1 truncate">{new Date(news.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all shrink-0">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
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
        1: { v: 1, ec: '1', spdf: '1s¹', p: 1, n: 0, e: 1, f: 'Highly flammable, most abundant element in the universe.' },
        2: { v: 0, ec: '2', spdf: '1s²', p: 2, n: 2, e: 2, f: 'Noble gas, inert, used in balloons and high-tech cryogenics.' },
        3: { v: 1, ec: '2, 1', spdf: '1s² 2s¹', p: 3, n: 4, e: 3, f: 'Lightest alkali metal, highly reactive with water, used in rechargeable batteries.' },
        4: { v: 2, ec: '2, 2', spdf: '1s² 2s²', p: 4, n: 5, e: 4, f: 'Alkaline earth metal, high melting point, very strong yet lightweight.' },
        5: { v: 3, ec: '2, 3', spdf: '1s² 2s² 2p¹', p: 5, n: 6, e: 5, f: 'Metalloid, found in borax, essential for plant growth and fiberglass.' },
        6: { v: 4, ec: '2, 4', spdf: '1s² 2s² 2p²', p: 6, n: 6, e: 6, f: 'Basis of all life, forms diamonds and graphite. Crucial for carbon dating.' },
        7: { v: 3, ec: '2, 5', spdf: '1s² 2s² 2p³', p: 7, n: 7, e: 7, f: 'Colorless gas, makes up 78% of the atmosphere, vital for fertilizers.' },
        8: { v: 2, ec: '2, 6', spdf: '1s² 2s² 2p⁴', p: 8, n: 8, e: 8, f: 'Highly reactive non-metal, 21% of atmosphere, essential for respiration.' },
        9: { v: 1, ec: '2, 7', spdf: '1s² 2s² 2p⁵', p: 9, n: 10, e: 9, f: 'Pale yellow gas, most reactive element, found in toothpaste for tooth security.' },
        10: { v: 0, ec: '2, 8', spdf: '1s² 2s² 2p⁶', p: 10, n: 10, e: 10, f: 'Noble gas, completely inert, glows bright orange-red in discharge tubes.' },
        11: { v: 1, ec: '2, 8, 1', spdf: '1s² 2s² 2p⁶ 3s¹', p: 11, n: 12, e: 11, f: 'Soft alkali metal, highly reactive, found in table salt (NaCl).' },
        12: { v: 2, ec: '2, 8, 2', spdf: '1s² 2s² 2p⁶ 3s²', p: 12, n: 12, e: 12, f: 'Strong, lightweight metal, burns with a blinding white flame.' },
        13: { v: 3, ec: '2, 8, 3', spdf: '1s² 2s² 2p⁶ 3s² 3p¹', p: 13, n: 14, e: 13, f: 'Most abundant metal in Earth crust, lightweight and corrosion-resistant.' },
        14: { v: 4, ec: '2, 8, 4', spdf: '1s² 2s² 2p⁶ 3s² 3p²', p: 14, n: 14, e: 14, f: 'Semiconductor, used in computer chips and solar cells. 2nd most abundant in crust.' },
        15: { v: '3, 5', ec: '2, 8, 5', spdf: '1s² 2s² 2p⁶ 3s² 3p³', p: 15, n: 16, e: 15, f: 'Highly reactive non-metal, found in DNA, bones, and matches.' },
        16: { v: '2, 4, 6', ec: '2, 8, 6', spdf: '1s² 2s² 2p⁶ 3s² 3p⁴', p: 16, n: 16, e: 16, f: 'Bright yellow non-metal, found in volcanic areas, used in sulfuric acid.' },
        17: { v: 1, ec: '2, 8, 7', spdf: '1s² 2s² 2p⁶ 3s² 3p⁵', p: 17, n: 18, e: 17, f: 'Toxic green gas, used for water purification and as a disinfectant.' },
        18: { v: 0, ec: '2, 8, 8', spdf: '1s² 2s² 2p⁶ 3s² 3p⁶', p: 18, n: 22, e: 18, f: 'Noble gas, used as an inert shield in welding and light bulbs.' },
        19: { v: 1, ec: '2, 8, 8, 1', spdf: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹', p: 19, n: 20, e: 19, f: 'Highly reactive alkali metal, essential electrolyte for nerve conduction.' },
        20: { v: 2, ec: '2, 8, 8, 2', spdf: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²', p: 20, n: 20, e: 20, f: 'Alkaline earth metal, vital for bones, teeth, and muscle movement.' },
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

    if (selectedElement) {
        return (
            <div className="space-y-8 animate-fade-up pb-24 overflow-hidden min-h-screen">
                <div className="max-w-4xl mx-auto flex items-center gap-4 py-2 mt-4 px-4">
                    <button onClick={() => setSelectedElement(null)} className="w-12 h-12 bg-white shadow-sm border border-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors shrink-0">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">{selectedElement.name}</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedElement.c.replace('-', ' ')} Model</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
                    <div className="flex items-start justify-between flex-wrap gap-8">
                        <div className="flex items-center gap-8">
                            <div className={cn(
                                "w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] border-[4px] border-white shadow-2xl flex flex-col items-center justify-center relative",
                                getCategoryStyles(selectedElement.c)
                            )}>
                                <span className="absolute top-3 left-4 text-sm md:text-lg font-black opacity-60 leading-none">{selectedElement.n}</span>
                                <span className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">{selectedElement.s}</span>
                                <span className="absolute bottom-3 right-4 text-[0.7rem] md:text-[0.9rem] font-black opacity-40 leading-none">{selectedElement.m}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">{selectedElement.name}</h2>
                                    <button 
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(selectedElement.name);
                                            window.speechSynthesis.speak(utterance);
                                        }}
                                        className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 transition-colors shadow-sm ml-2 active:scale-95"
                                        title="Pronounce"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                                    </button>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">Atomic: {selectedElement.n}</span>
                                    <span className="px-4 py-1.5 bg-slate-100 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">Mass: {selectedElement.m}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FIRST 20 DETAILS */}
                    {elementDetails[selectedElement.n] ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up w-full">
                            {/* ELECTRONIC CONFIGURATION CARD */}
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
                                <div className="absolute top-4 right-4 text-[5rem] font-black italic opacity-5 -z-10 group-hover:scale-110 transition-transform">K</div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500"><Sigma className="w-5 h-5" /></div>
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Configuration</p>
                                </div>
                                <div className="space-y-4 relative z-10 w-full overflow-hidden">
                                    {/* Main Orbits */}
                                    <div>
                                        <p className="text-2xl font-black text-slate-800 italic tracking-tighter font-mono truncate">{elementDetails[selectedElement.n].ec}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {elementDetails[selectedElement.n].ec.split(',').map((_: any, i: number) => (
                                                <span key={i} className="text-[0.55rem] font-black text-white bg-slate-800 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                                    {['K', 'L', 'M', 'N', 'O'][i]} Shell
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full h-[1px] bg-slate-200" />
                                    {/* Subshell Configuration */}
                                    <div>
                                        <p className="text-xl font-black text-indigo-600 italic tracking-tighter font-mono pb-1 break-words">{elementDetails[selectedElement.n].spdf}</p>
                                        <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Subshell Notation</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* ATOM 3D FIGURE CARD */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group flex flex-col items-center justify-center min-h-[400px]">
                                <div className="absolute top-4 left-4 flex items-center gap-3 z-10">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl shadow-sm flex items-center justify-center text-blue-500"><Compass className="w-5 h-5" /></div>
                                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Atomic Structure</p>
                                </div>
                                
                                {/* Upgraded Bohr Model Visualizer using SVG */}
                                <div className="relative w-full aspect-square max-w-[360px] mt-6 shrink-0 flex items-center justify-center">
                                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible drop-shadow-xl">
                                        {/* Nucleus */}
                                        <circle cx="50" cy="50" r="10" fill="white" stroke="black" strokeWidth="0.5" />
                                        <text x="50" y="48" fontSize="4" fill="black" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                                            {elementDetails[selectedElement.n].p} p⁺
                                        </text>
                                        <text x="50" y="53" fontSize="4" fill="black" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">
                                            {elementDetails[selectedElement.n].n} n⁰
                                        </text>
                                        {elementDetails[selectedElement.n].ec.split(',').map((shell: string, i: number) => {
                                            const radius = 18 + (i * 11);
                                            const dots = parseInt(shell.trim());
                                            const categoryColorsHex: Record<string, string> = {
                                                'alkali': '#a855f7',
                                                'alkaline': '#7c3aed',
                                                'transition': '#f43f5e',
                                                'post-transition': '#38bdf8',
                                                'metalloid': '#6366f1',
                                                'nonmetal': '#f59e0b',
                                                'noble': '#ef4444',
                                                'lanthanide': '#34d399',
                                                'actinide': '#14b8a6',
                                            };
                                            const eColor = categoryColorsHex[selectedElement.c] || '#94a3b8';
                                            return (
                                                <g key={i}>
                                                    <circle 
                                                        cx="50" 
                                                        cy="50" 
                                                        r={radius} 
                                                        fill="none" 
                                                        stroke="black" 
                                                        strokeWidth="0.5" 
                                                    />
                                                    <g style={{ 
                                                        transformOrigin: '50px 50px',
                                                        animation: `spin ${10 + i * 8}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}` 
                                                    }}>
                                                        {Array.from({ length: dots }).map((_, j) => {
                                                            const angle = (360 / dots) * j;
                                                            const rad = (angle * Math.PI) / 180;
                                                            const cx = 50 + radius * Math.cos(rad);
                                                            const cy = 50 + radius * Math.sin(rad);
                                                            return (
                                                                <circle 
                                                                    key={j}
                                                                    cx={cx}
                                                                    cy={cy}
                                                                    r="2"
                                                                    fill={eColor}
                                                                    stroke="black"
                                                                    strokeWidth="0.5"
                                                                />
                                                            );

                                                        })}
                                                    </g>
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-rose-500"><Zap className="w-5 h-5" /></div>
                                        <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Properties</p>
                                    </div>
                                    <div className="flex items-end gap-3">
                                        <p className="text-3xl font-black text-slate-800 italic tracking-tighter">{elementDetails[selectedElement.n].v}</p>
                                        <p className="text-[0.65rem] font-bold text-slate-400 leading-relaxed uppercase pb-1">Valency</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-1">State</p>
                                        <p className="text-sm font-bold text-slate-700">{['H','N','O','F','Cl','He','Ne','Ar','Kr','Xe','Rn'].includes(selectedElement.s) ? 'Gas' : ['Hg','Br'].includes(selectedElement.s) ? 'Liquid' : 'Solid'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest mb-1">Group / Period</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedElement.x} / {selectedElement.y}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-sm hover:shadow-md transition-shadow md:col-span-2 relative overflow-hidden group">
                                <div className="absolute top-4 right-4 text-[5rem] font-black italic opacity-5 -z-10 group-hover:scale-110 transition-transform">N</div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-500"><Activity className="w-5 h-5" /></div>
                                        <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Nucleus Data</p>
                                    </div>
                                    <span className="text-[0.55rem] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md uppercase tracking-widest">{selectedElement.n === 1 ? '3 Isotopes' : 'Isotopes'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div className="flex flex-col border-r border-slate-200">
                                        <span className="text-[0.6rem] font-black text-emerald-600 uppercase tracking-widest">Protons</span>
                                        <span className="text-3xl font-black text-slate-800">{elementDetails[selectedElement.n].p}</span>
                                    </div>
                                    <div className="flex flex-col border-r border-slate-200 px-2">
                                        <span className="text-[0.6rem] font-black text-blue-600 uppercase tracking-widest">Neutrons</span>
                                        <span className="text-3xl font-black text-slate-800">{elementDetails[selectedElement.n].n}</span>
                                    </div>
                                    <div className="flex flex-col px-2">
                                        <span className="text-[0.6rem] font-black text-amber-600 uppercase tracking-widest">Electrons</span>
                                        <span className="text-3xl font-black text-slate-800">{elementDetails[selectedElement.n].e}</span>
                                    </div>
                                </div>
                                <div className="pt-4 mt-2 border-t border-slate-200">
                                    <details className="group/details">
                                        <summary className="text-[0.65rem] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors flex items-center gap-1">
                                            View Known Isotopes <ChevronRight className="w-3 h-3 group-open/details:rotate-90 transition-transform" />
                                        </summary>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {selectedElement.n === 1 ? (
                                                <>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Protium [¹H]</span>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Deuterium [²H]</span>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Tritium [³H]</span>
                                                </>
                                            ) : selectedElement.n === 6 ? (
                                                <>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Carbon-12</span>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Carbon-13</span>
                                                    <span className="text-xs font-bold text-slate-700 bg-white border border-rose-200 px-2.5 py-1 rounded-lg text-rose-700">Carbon-14 (Radioactive)</span>
                                                </>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">Standard isotopic mix</span>
                                            )}
                                        </div>
                                    </details>
                                </div>
                            </div>

                            <div className="bg-linear-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl md:col-span-2 lg:col-span-3 text-white relative overflow-hidden group mt-4">
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
                        <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 text-center space-y-6 max-w-2xl mx-auto shadow-sm mt-8">
                            <Info className="w-16 h-16 text-slate-300 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Atomic Profile Partial</h3>
                                <p className="text-base font-bold text-slate-400">Deep structural analysis is available for the first 20 elements. Ask Aadhar Pro for other elements.</p>
                            </div>
                            <button 
                                onClick={() => navigate('/ai')}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-slate-900/20 active:scale-95 transition-all"
                            >
                                <Zap className="w-5 h-5 text-amber-400 shadow-[0_0_10px_white]" /> Consult Expert
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-up pb-24 overflow-hidden min-h-screen">
            <ToolHeader title="Periodic Realm" subtitle="Chemical Intelligence Hub" icon={Beaker} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mt-4">
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
            </div>

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

            <div className="mt-16 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col items-center text-center gap-4 mb-12">
                    <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0 rotate-3">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-800">Periodic Insights 🔄</h2>
                        <p className="text-[0.65rem] md:text-sm font-bold uppercase tracking-widest text-slate-400 mt-2">Core Concepts & Elemental Trends</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Groups and Periods */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                                <Activity className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Groups & Periods</h3>
                        </div>
                        <ul className="space-y-4 text-slate-600 text-sm font-medium">
                            <li className="flex gap-3">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span><strong>Groups (Columns)</strong>: Elements in the same group share identical valence electron counts, leading to similar chemical behavior.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span><strong>Periods (Rows)</strong>: Moving left to right across a period adds protons and electrons, sequentially filling the valence shell.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span><strong>Alkali Metals (Group 1)</strong>: Highly reactive, especially with water. Includes Lithium, Sodium, Potassium.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span><strong>Noble Gases (Group 18)</strong>: Completely inert and stable due to full valence electron shells.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Periodic Trends */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Periodic Trends</h3>
                        </div>
                        <ul className="space-y-4 text-slate-600 text-sm font-medium">
                            <li className="flex gap-3">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span><strong>Atomic Radius</strong>: Decreases from left to right across a period, and increases moving down a group.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span><strong>Electronegativity</strong>: The ability of an atom to attract electrons. It increases across a period and decreases down a group (Fluorine is highest).</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span><strong>Ionization Energy</strong>: Energy required to remove an electron. Higher on the top right of the table (Helium is highest).</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-rose-500 mt-0.5">•</span>
                                <span><strong>Metallic Character</strong>: Strongest at the bottom left (Francium), weakest at top right.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Block Elements */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                                <Box className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">Electron Blocks</h3>
                        </div>
                        <ul className="space-y-4 text-slate-600 text-sm font-medium">
                            <li className="flex gap-3">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span><strong>s-block</strong>: The first two columns (Alkali & Alkaline Earth Metals) plus Helium. Their outermost electrons are in the s-orbital.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span><strong>p-block</strong>: The right six columns. Contains non-metals, halogens, noble gases, and metalloids.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span><strong>d-block</strong>: The central transition metals. Known for colorful compounds and variable oxidation states.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span><strong>f-block</strong>: Lanthanides and Actinides, usually placed below to save space. Mostly radioactive or synthetic.</span>
                            </li>
                        </ul>
                    </div>

                    {/* History & Facts */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:scale-[1.02] transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                <Book className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">History & Evolution</h3>
                        </div>
                        <ul className="space-y-4 text-slate-600 text-sm font-medium">
                            <li className="flex gap-3">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span><strong>Mendeleev's Genius</strong>: Dmitri Mendeleev organized it by atomic mass and vividly predicted properties of undiscovered elements like Gallium & Germanium.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span><strong>Modern Table</strong>: Henry Moseley rearranged it by <strong>Atomic Number</strong> (protons), fixing mass irregularities.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span><strong>Synthetic Elements</strong>: Elements past Uranium (92) are almost exclusively created in laboratories via particle accelerators.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                <span><strong>J is Missing</strong>: The letter &quot;J&quot; is the only letter not present on the periodic table anywhere!</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** ── NEPALI DICTIONARY PAGE ── */
const NepaliDictionaryPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [colorIdx, setColorIdx] = useState(0);

    const currentColor = COLOR_CYCLE[colorIdx % COLOR_CYCLE.length];
    const currentText = TEXT_COLOR_CYCLE[colorIdx % TEXT_COLOR_CYCLE.length];

    const searchNepaliWord = async (word: string) => {
        if (!word) return;
        setLoading(true);
        setError("");
        try {
            const systemInstruction = `You are a world-class Nepali dictionary. Provide detailed info for: "${word}".
            Return strictly JSON in NEPALI language where applicable.
            SCHEMA: { 
                "word": string, 
                "transliteration": string,
                "partOfSpeech": string, 
                "meaning": string, 
                "examples": string[], 
                "synonyms": string[], 
                "antonyms": string[], 
                "usageTip": string, 
                "didYouKnow": string
            }`;

            const data = await getAIJSONResponse(`Word: "${word}"`, systemInstruction);
            setResult(data);
            setColorIdx(prev => prev + 1);
        } catch (err) {
            console.error(err);
            setError("खोज्न असफल भयो। फेरि प्रयास गर्नुहोस्।");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("min-h-screen bg-slate-50 flex flex-col items-center pt-2 md:pt-4 pb-32 transition-all duration-700", loading && "blur-sm opacity-60")}>
            {/* Header Area */}
            <div className="w-full max-w-6xl px-4 py-3 md:py-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4 leading-tight">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"><ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1 md:gap-2">
                             <h1 className="text-lg md:text-2xl font-black text-slate-800 italic tracking-tight truncate">नेपाली शब्दकोश</h1>
                             <button className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-[0.45rem] md:text-[0.6rem] font-black uppercase tracking-tighter shrink-0">
                                <BookOpen className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" /> LEXICON
                             </button>
                        </div>
                        <p className={cn("text-[0.5rem] md:text-[0.65rem] font-bold uppercase tracking-widest mt-0 md:mt-0.5 truncate transition-colors", currentText)}>शब्द सिक्नुहोस्। नयाँ विश्व बनाउनुहोस्।</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-3">
                    <button className={cn("w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90", currentText)}><Clock className="w-4 h-4 md:w-5 md:h-5" /></button>
                    <button className={cn("w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90", currentText)}><Bookmark className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-6xl px-4 py-1.5 flex items-center gap-1.5 md:gap-4 mb-3 md:mb-6">
                <div className="flex-1 bg-white rounded-xl md:rounded-[2rem] h-10 md:h-16 px-3 md:px-6 flex items-center gap-2 md:gap-4 shadow-lg border border-slate-100 group focus-within:ring-4 focus-within:ring-slate-100 transition-all">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-focus-within:text-slate-500" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchNepaliWord(query)}
                        placeholder="शब्द खोज्नुहोस्..."
                        className="flex-1 text-xs md:text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300"
                    />
                     <div className="flex items-center gap-1.5 md:gap-3 border-l border-slate-100 pl-1.5 md:pl-4">
                        <button className={cn("hover:scale-110 transition-all p-1", currentText)}><Mic className="w-3.5 h-3.5 md:w-5 md:h-5" /></button>
                        <button className={cn("hover:scale-110 transition-all p-1", currentText)}><Camera className="w-3.5 h-3.5 md:w-5 md:h-5" /></button>
                    </div>
                </div>
                <button 
                    onClick={() => searchNepaliWord(query)}
                    disabled={loading}
                    className={cn("h-10 md:h-16 w-10 md:w-16 flex items-center justify-center text-white rounded-xl md:rounded-[2rem] font-black shadow-xl active:scale-95 transition-all disabled:opacity-50", currentColor)}
                >
                    {loading ? <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5 animate-spin" /> : <Search className="w-4 h-4 md:w-6 md:h-6" />}
                </button>
            </div>

            <div className="w-full max-w-6xl px-4 space-y-4 md:space-y-6">
                {/* Feature Cards */}
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {[
                        { label: 'शब्द खेल', icon: Gamepad2, color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'आजको शब्द', icon: Star, color: 'bg-blue-50 text-blue-600' },
                        { label: 'मेरा शब्दहरू', icon: LayoutList, color: 'bg-orange-50 text-orange-600' },
                        { label: 'पहेली', icon: Puzzle, color: 'bg-emerald-50 text-emerald-600' }
                    ].map((card, i) => (
                        <div key={i} className={cn(card.color, "p-2 md:p-5 rounded-xl md:rounded-3xl flex flex-col items-center text-center gap-1 shadow-sm border border-transparent hover:border-white transition-all cursor-pointer group active:scale-95")}>
                            <div className="w-7 h-7 md:w-11 md:h-11 rounded-lg md:rounded-2xl bg-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-sm">
                                <card.icon className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                            <h4 className="text-[0.45rem] md:text-[0.7rem] font-black uppercase tracking-tight line-clamp-1">{card.label}</h4>
                        </div>
                    ))}
                </div>

                {/* Animated Pre-Search Cards */}
                {!result && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
                        <motion.div 
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                <Quote className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-black text-slate-800 italic leading-tight">
                                "तपाईंको सपनाहरूको साकारता मात्र आजको शंकाद्वारा सीमित हुनेछ।"
                            </h3>
                            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">— फ्र्याङ्कलिन डी. रूजवेल्ट</p>
                        </motion.div>

                        <motion.div 
                            animate={{ x: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-indigo-600 p-6 md:p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col gap-4 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rotate-12">
                                <Zap className="w-full h-full" />
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner">
                                <Languages className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-black italic leading-tight">
                                हाम्रो एआई टूलको मद्दतले नेपाली नोटहरूलाई अङ्ग्रेजीमा सहजै अनुवाद गर्नुहोस्।
                            </h3>
                            <div className="flex items-center gap-2 mt-auto">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-[0.6rem] font-black uppercase tracking-widest">अनुवाद प्रो</span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Main Content Box */}
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
                    >
                        <div className={cn("p-6 md:p-10 text-white relative overflow-hidden transition-colors duration-500", currentColor)}>
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                <Book className="w-full h-full rotate-12 translate-x-1/4" />
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                <div>
                                    <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-2 drop-shadow-lg">{result.word}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/80 font-mono text-base md:text-xl">[{result.transliteration}]</span>
                                        <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[0.6rem] md:text-xs font-black uppercase tracking-widest border border-white/20">{result.partOfSpeech}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 space-y-6 md:space-y-8 bg-gradient-to-b from-white to-slate-50/30">
                            <div className="space-y-4">
                                <h3 className={cn("text-[0.6rem] md:text-xs font-black uppercase tracking-widest", currentText)}>परिभाषा (Definition)</h3>
                                <p className="text-lg md:text-2xl font-bold text-slate-800 leading-snug">{result.meaning}</p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] border border-slate-200/50 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
                                <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60", currentColor)} />
                                <Quote className="absolute top-6 right-6 w-8 h-8 md:w-12 md:h-12 text-slate-100 group-hover:scale-110 transition-transform" />
                                <div className="pl-4 md:pl-6 space-y-4">
                                    <h5 className={cn("text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-widest opacity-80", currentText)}>उदाहरण (Example Sentence)</h5>
                                    {result.examples?.map((ex: string, i: number) => (
                                        <p key={i} className="text-sm md:text-xl font-bold text-slate-900 leading-relaxed italic relative z-10">"{ex}"</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {result && !loading && (
                    <div className="space-y-6 md:space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                            >
                                <div className="bg-emerald-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><BookCopy className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">समानार्थी (Synonyms)</h3>
                                </div>
                                <div className="p-6 md:p-10 flex flex-wrap gap-2 md:gap-3">
                                    {result.synonyms?.map((s: string, idx: number) => (
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            key={idx} 
                                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[0.65rem] md:text-sm font-bold text-slate-600 uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-100 transition-colors"
                                        >
                                            {s}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                            >
                                <div className="bg-rose-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><ShieldAlert className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">विपरीतार्थी (Antonyms)</h3>
                                </div>
                                <div className="p-6 md:p-10 flex flex-wrap gap-2 md:gap-3">
                                    {result.antonyms?.map((a: string, idx: number) => (
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            key={idx} 
                                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[0.65rem] md:text-sm font-bold text-slate-600 uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-colors"
                                        >
                                            {a}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                             >
                                <div className="bg-amber-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><Lightbulb className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">के तपाईंलाई थाहा छ?</h3>
                                </div>
                                <div className="p-8 md:p-12">
                                    <p className="text-base md:text-2xl text-slate-700 font-bold leading-relaxed italic">
                                        "{result.didYouKnow || "नेपाली भाषा संसारकै समृद्ध भाषाहरू मध्ये एक हो।"}"
                                    </p>
                                </div>
                             </motion.div>

                             <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                             >
                                <div className="bg-blue-600 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><Info className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">प्रयोग टिप</h3>
                                </div>
                                <div className="p-8 md:p-12">
                                    <p className="text-base md:text-2xl text-slate-700 font-bold leading-relaxed italic">
                                        "{result.usageTip || "शब्दको सही अर्थ र सन्दर्भ बुझेर प्रयोग गर्दा भाषा अझ प्रभावकारी हुन्छ।"}"
                                    </p>
                                </div>
                             </motion.div>
                        </div>

                        <div className="text-center pt-10">
                            <button onClick={() => navigate(-1)} className="px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Learning Hub मा फर्कनुहोस्</button>
                        </div>
                    </div>
                )}

                {(!result || error) && !loading && (
                    <div className="text-center py-20">
                         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <Search className="w-10 h-10" />
                         </div>
                         <h3 className="text-slate-800 font-black text-xl mb-2">नेपाली शब्द खोज्नुहोस्</h3>
                         <p className="text-slate-400 font-bold text-sm">अर्थ, उदाहरण र अन्य जानकारी पत्ता लगाउनुहोस्।</p>
                         {error && <p className="text-rose-500 font-bold text-sm mt-4">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};



/* ── FLASHCARDS APP ── */
const FlashcardApp = () => {
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
            <ToolHeader title="Flashcards" subtitle="Active Recall Desk" icon={LayoutGrid} />

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
            <ToolHeader title="Lexical Engine" subtitle="Real-time Semantic Analytics" icon={Type} />

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

            <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your text here for processing..."
                    className="w-full min-h-[300px] p-8 text-slate-800 font-bold placeholder:text-slate-300 focus:outline-hidden resize-none leading-relaxed"
                />
            </div>
        </div>
    );
};

const SubjectDetail = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const decodedName = decodeURIComponent(name || '');
    const config = SUBJECTS_CONFIG[decodedName as SubjectType] || SUBJECTS_CONFIG['English'];
    const Icon = config.icon;
    const brand = getBrandColors(config.color);

    const sections = [
        { id: 'chapters', label: 'Study Chapters', icon: BookOpen, color: 'bg-emerald-50 text-emerald-600', count: 'Core Specification' },
        { id: 'textbooks', label: 'Digital Library', icon: Library, color: 'bg-cyan-50 text-cyan-600', count: 'Official Books' },
        { id: 'videos', label: 'Video Classes', icon: PlayCircle, color: 'bg-rose-50 text-rose-600', count: 'Smart Tutorials' },
        { id: 'pdfs', label: 'Note Archive', icon: FileText, color: 'bg-blue-50 text-blue-600', count: 'Exam Materials' },
        { id: 'model', label: 'Board Trial', icon: ListChecks, color: 'bg-indigo-50 text-indigo-600', count: '2083 Pattern' }
    ];

    return (
        <div className="space-y-6 animate-fade-up pb-32 text-slate-900 px-1">
            <header className="flex items-center justify-between">
                <button 
                    onClick={() => navigate('/hub')} 
                    className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={cn("px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest", brand.paleBg, brand.text)}>
                    Verified Module
                </div>
            </header>

            <div className={cn("p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-xl min-h-[180px] flex flex-col justify-end border-2 border-white/30 bg-linear-to-br", config.gradient)}>
                <div className="relative z-10">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-1">{decodedName}</h1>
                    <p className="text-[0.6rem] font-black text-white/70 uppercase tracking-[0.2em]">Syllabus Synchronization: Active</p>
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icon className="w-32 h-32 -rotate-12 translate-x-8 -translate-y-8" />
                </div>
                <div className="absolute top-4 left-4">
                     <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {sections.map(section => (
                    <button 
                        key={section.id} 
                        onClick={() => navigate(`/hub/${name}/${section.id}`)}
                        className="bg-white p-4 px-5 rounded-[1.75rem] border border-slate-50 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:border-slate-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform", section.color)}>
                                <section.icon className="w-6 h-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-black text-slate-900 text-base tracking-tight uppercase italic leading-none">{section.label}</h3>
                                <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{section.count}</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                ))}
            </div>
            
            <button 
                onClick={() => navigate(`/hub/${name}/mcq-sets`)}
                className={cn(
                    "w-full p-6 rounded-[2rem] shadow-xl flex items-center justify-between group active:scale-[0.98] transition-all text-white bg-linear-to-br",
                    config.gradient
                )}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                        <PenTool className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-black italic tracking-tighter uppercase leading-none">MCQ's Battle</h3>
                        <p className="text-[0.55rem] font-black text-white/70 uppercase tracking-widest mt-1">Official Test Protocol</p>
                    </div>
                </div>
                <Zap className="w-5 h-5 text-white animate-pulse" />
            </button>
        </div>
    );
};

/* ── MCQ SET SELECTION ── */
const MCQTestSelection = () => {
    const { name } = useParams();
    const { liveMaterials, liveMcqs } = useApp();
    const navigate = useNavigate();
    const [useTimer, setUseTimer] = useState(true);
    const [questionCount, setQuestionCount] = useState(30);
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];
    
    const staticSets: any[] = STATIC_MCQS[name as string] || [];
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

    const adminSets = liveMcqs
        .filter(m => m.subject === name)
        .map(m => ({
            setName: m.title,
            questions: m.questions || []
        }));

    const sets = [...staticSets, ...dynamicSets, ...adminSets];

    // Animation variants for staggering sets list
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 260, damping: 20 }
        }
    };

    return (
        <div className="space-y-10 pb-24 max-w-4xl mx-auto px-4 relative overflow-hidden min-h-screen">
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
                <motion.div 
                    animate={{ 
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-10 left-5 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ 
                        y: [20, -20, 20],
                        x: [10, -10, 10],
                        scale: [1.1, 0.9, 1.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ 
                        rotate: 360
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-20 left-12 w-64 h-64 bg-cyan-450/10 rounded-full blur-3xl opacity-60"
                />
            </div>

            {/* Header section with back navigation and page badge */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between relative z-10"
            >
                <button 
                    onClick={() => navigate(`/hub/${name}`)} 
                    className="w-12 h-12 bg-white rounded-2xl border border-slate-150 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:shadow-lg transition-all duration-300 pointer-events-auto"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="px-5 py-2 bg-gradient-to-r from-pink-550 via-purple-650 to-indigo-650 text-white rounded-full text-[0.65rem] font-black uppercase tracking-widest shadow-lg shadow-purple-500/30 animate-pulse">
                    ✨ Advanced MCQ Arena
                </div>
            </motion.header>

            {/* Quick stats & welcome box */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 p-8 rounded-[2.5rem] text-white border-2 border-white/20 shadow-2xl shadow-indigo-950/40 relative z-10"
            >
                {/* Background ambient glowing spheres */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/25 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl -ml-24 -mb-24" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase bg-white/20 text-indigo-200 px-3 py-1 rounded-full tracking-wider border border-white/10 animate-bounce">
                                {name} Subject MCQ
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none bg-gradient-to-r from-cyan-300 via-pink-200 to-amber-300 bg-clip-text text-transparent">
                            {name} Tests
                        </h1>
                        <p className="text-[0.7rem] font-bold text-slate-300 uppercase tracking-[0.25em]">
                            Challenge yourself with official model question sets
                        </p>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setUseTimer(!useTimer)}
                        className={cn(
                            "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shrink-0 border-2",
                            useTimer 
                                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white border-transparent shadow-orange-500/30" 
                                : "bg-white/10 border-white/10 text-slate-300 hover:bg-white/15"
                        )}
                    >
                        <Timer className={cn("w-5 h-5", useTimer ? "animate-spin" : "")} />
                        Timer: {useTimer ? "Enabled (1 min/q)": "Disabled"}
                    </motion.button>
                </div>
            </motion.div>

            {/* Questions count selector */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/70 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl space-y-5 relative z-10"
            >
                <div className="text-center space-y-1">
                    <label className="text-xs font-black uppercase bg-linear-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent block tracking-widest">
                        Choose Session Length
                    </label>
                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider">
                        Tailor testing parameters to match your schedule
                    </p>
                </div>
                
                <div className="flex gap-4 max-w-md mx-auto">
                    {[5, 10, 20, 30].map((c) => (
                        <motion.button
                            key={c}
                            whileHover={{ scale: 1.1, y: -4, rotate: [0, -1, 1, 0] }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setQuestionCount(c)}
                            className={cn(
                                "flex-1 py-4 rounded-2xl border-2 font-black text-sm md:text-base transition-all shadow-md",
                                questionCount === c 
                                    ? "text-white border-transparent bg-gradient-to-br from-indigo-500 via-purple-500 via-pink-500 to-orange-500 shadow-pink-500/30 shadow-xl scale-105"
                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                            )}
                        >
                            {c} <span className="text-[10px] md:text-xs font-extrabold opacity-85 block md:inline md:ml-0.5">Q</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Set Lists Grid */}
            {sets.length > 0 ? (
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-6 relative z-10"
                >
                    {sets.map((set, idx) => {
                        // Cycling visually beautiful theme cards
                        const themes = [
                            {
                                bg: "bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-650",
                                shadow: "hover:shadow-cyan-500/25",
                                text: "text-white",
                                badgeBg: "bg-white/15 border border-white/10 text-cyan-100",
                                badgeSpecial: "bg-pink-500/20 border border-pink-500/30 text-pink-200",
                                indicatorBg: "bg-white/10 text-cyan-200 border border-white/10",
                                playBtn: "bg-white text-indigo-600 hover:bg-cyan-50"
                            },
                            {
                                bg: "bg-gradient-to-tr from-rose-500 via-pink-600 to-purple-650",
                                shadow: "hover:shadow-rose-500/25",
                                text: "text-white",
                                badgeBg: "bg-white/15 border border-white/10 text-rose-100",
                                badgeSpecial: "bg-amber-500/20 border border-amber-500/30 text-amber-200",
                                indicatorBg: "bg-white/10 text-rose-200 border border-white/10",
                                playBtn: "bg-white text-rose-600 hover:bg-rose-50"
                            },
                            {
                                bg: "bg-gradient-to-tr from-amber-500 via-orange-550 to-rose-600",
                                shadow: "hover:shadow-orange-500/25",
                                text: "text-white",
                                badgeBg: "bg-white/15 border border-white/10 text-amber-100",
                                badgeSpecial: "bg-cyan-500/20 border border-cyan-500/30 text-cyan-200",
                                indicatorBg: "bg-white/10 text-amber-200 border border-white/10",
                                playBtn: "bg-white text-orange-600 hover:bg-amber-50"
                            },
                            {
                                bg: "bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-indigo-700",
                                shadow: "hover:shadow-fuchsia-500/25",
                                text: "text-white",
                                badgeBg: "bg-white/15 border border-white/10 text-fuchsia-100",
                                badgeSpecial: "bg-emerald-500/20 border border-emerald-500/30 text-emerald-200",
                                indicatorBg: "bg-white/10 text-fuchsia-200 border border-white/10",
                                playBtn: "bg-white text-purple-600 hover:bg-fuchsia-10"
                            }
                        ];
                        const theme = themes[idx % themes.length];

                        return (
                            <motion.button 
                                key={idx}
                                variants={cardVariants}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => navigate(`/hub/${name}/mcq-test/${idx}?timer=${useTimer}&count=${questionCount}`)}
                                className={cn(
                                    "p-8 rounded-[3rem] border border-transparent shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 group transition-all text-left",
                                    theme.bg,
                                    theme.shadow
                                )}
                            >
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-lg transition-transform duration-500 shrink-0 group-hover:rotate-12 group-hover:scale-110",
                                        theme.indicatorBg
                                    )}>
                                        {idx + 1}
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-2.5 py-0.5 text-[0.55rem] font-black uppercase rounded-md tracking-wider", theme.badgeBg)}>
                                                SET {idx + 1}
                                            </span>
                                            {set.questions.length >= 20 ? (
                                                <span className={cn("px-2.5 py-0.5 text-[0.55rem] font-black uppercase rounded-md tracking-wider animate-pulse", theme.badgeSpecial)}>
                                                    🔥 Full Length
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-0.5 bg-white/10 text-white border border-white/15 text-[0.55rem] font-black uppercase rounded-md tracking-wider">
                                                    ⭐ Concept Booster
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
                                            {set.setName}
                                        </h3>
                                        <p className="text-[0.68rem] font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                                            <span>📋 {set.questions.length} Questions Available</span>
                                            <span>•</span>
                                            <span>⏱️ 1 Min / Question</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className={cn(
                                    "w-full sm:w-14 sm:h-14 py-4 sm:py-0 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 shrink-0 group-hover:scale-115 active:scale-95",
                                    theme.playBtn
                                )}>
                                    <Play className="w-6 h-6 fill-current animate-bounce" />
                                </div>
                            </motion.button>
                        );
                    })}
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-50 p-12 rounded-[3.5rem] border-2 border-dashed border-slate-200 text-center space-y-4 shadow-inner relative z-10"
                >
                    <div className="w-20 h-20 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-lg animate-bounce">
                        <AlertTriangle className="w-10 h-10 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Coming Soon</h3>
                        <p className="text-slate-400 font-bold text-[0.7rem] uppercase tracking-widest mt-1 max-w-xs mx-auto">Admin is preparing verified MCQ sets for {name}. Please check back later!</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

/* ── MCQ TEST PLAYER ── */
const MCQTestPlayer = () => {
    const { name, setIndex } = useParams();
    const { data, liveMaterials, addTestResult } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'quiz' | 'result'>('quiz');
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showExplanation, setShowExplanation] = useState(false);
    
    // Practice Mode switcher inside the active test! Let's allow study vs test mode
    const [testMode, setTestMode] = useState<'exam' | 'practice'>('practice');
    
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
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin pb-4" />
            <h1 className="text-2xl font-black uppercase text-slate-800">Initializing Intelligence Test</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Constructing Query Node...</p>
            <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Go Back</button>
        </div>
    );

    const score = questions.reduce((acc: number, q: any, idx: number) => {
        return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);

    const timeTaken = (countParam * 60) - timer;

    // Trigger saving of results exactly once
    const hasSaved = useRef(false);
    useEffect(() => {
        if (status === 'result' && !hasSaved.current) {
            addTestResult(score, questions.length, timeTaken);
            hasSaved.current = true;
        }
    }, [status, score, questions.length, timeTaken, addTestResult]);

    // Track state of current question feedback for practice mode
    const selectedOption = answers[currentIdx];
    const currentQuestion = questions[currentIdx];
    const isCorrectInPractice = selectedOption === currentQuestion?.correct;

    // Performance criteria for results screen
    const accuracy = Math.round((score / questions.length) * 100);
    
    let rankTitle = "📖 Smart Learner";
    let rankColor = "text-blue-500 bg-blue-50 border-blue-150";
    let scoreColor = "from-blue-500 via-indigo-550 to-indigo-600";
    if (accuracy === 100) {
        rankTitle = "👑 Ultimate Grandmaster";
        rankColor = "text-amber-650 bg-amber-50 border-amber-200";
        scoreColor = "from-amber-400 via-orange-500 to-yellow-500";
    } else if (accuracy >= 85) {
        rankTitle = "🔥 Elite High-Flyer";
        rankColor = "text-rose-600 bg-rose-50 border-rose-200";
        scoreColor = "from-rose-500 via-pink-600 to-violet-600";
    } else if (accuracy >= 65) {
        rankTitle = "⚡ Specialized Solver";
        rankColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
        scoreColor = "from-emerald-500 via-teal-600 to-cyan-600";
    }

    const progressPercent = ((currentIdx + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24 relative overflow-hidden min-h-screen">
            {/* Ambient Background Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
                <motion.div 
                    animate={{ 
                        y: [20, -20, 20],
                        scale: [1, 1.15, 1],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ 
                        x: [10, -15, 10],
                        scale: [1.1, 0.9, 1.1],
                        rotate: [0, -90, 0]
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 -right-20 w-80 h-80 bg-fuchsia-500/10 rounded-full blur-3xl"
                />
                <motion.div 
                    animate={{ 
                        y: [-30, 30, -30],
                        scale: [0.95, 1.1, 0.95]
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"
                />
            </div>

            {status === 'quiz' ? (
                <div className="space-y-6 md:space-y-10 relative z-10">
                    {/* Header bar controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border border-slate-200/60 shadow-xl">
                        <div className="flex items-center justify-between md:justify-start gap-4 w-full md:w-auto">
                            {/* Mode controls */}
                            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/40">
                                <button 
                                    onClick={() => setTestMode('practice')}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[0.62rem] font-black uppercase tracking-wider transition-all",
                                        testMode === 'practice' 
                                            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                                            : "text-slate-400 hover:text-slate-705"
                                    )}
                                >
                                    🎓 Study Mode
                                </button>
                                <button 
                                    onClick={() => setTestMode('exam')}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[0.62rem] font-black uppercase tracking-wider transition-all",
                                        testMode === 'exam' 
                                            ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20" 
                                            : "text-slate-400 hover:text-slate-705"
                                    )}
                                >
                                    🔥 Exam Mode
                                </button>
                            </div>

                            {/* Timer badge */}
                            <div className="flex items-center gap-2">
                                <motion.div 
                                    animate={isTimerEnabled && timer <= 20 ? { scale: [1, 1.05, 1], rotate: [-1, 1, -1] } : {}}
                                    transition={{ repeat: Infinity, duration: 0.5 }}
                                    className={cn(
                                        "px-4 py-2 rounded-2xl flex items-center gap-2 font-black tracking-widest text-[#020617] text-sm tabular-nums shadow-md border",
                                        !isTimerEnabled ? "bg-slate-50 text-slate-400 border-slate-100" :
                                        timer > 60 ? "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/30" :
                                        timer > 20 ? "bg-amber-50 text-amber-605 border-amber-200 animate-pulse shadow-amber-100/30" :
                                        "bg-rose-50 text-rose-600 border-rose-205 shadow-rose-100/30 text-rose-700 font-extrabold"
                                    )}
                                >
                                    <Timer className={cn("w-4 h-4", isTimerEnabled ? "animate-spin" : "")} />
                                    {isTimerEnabled ? formatTime(timer) : "No Limit"}
                                </motion.div>
                            </div>
                        </div>

                        {/* End Test Button */}
                        <motion.button 
                            whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => { if(confirm("Are you sure you want to grade and submit this test?")) setStatus('result'); }}
                            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-650 to-red-650 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-500/30 border border-white/15"
                        >
                            End Session
                        </motion.button>
                    </div>

                    {/* Progress strip */}
                    <div className="space-y-3 bg-white/60 p-4 rounded-3xl border border-slate-200/40">
                        <div className="flex items-center justify-between text-[0.65rem] font-black text-slate-500 uppercase tracking-widest px-2">
                            <span className="flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5 text-indigo-500 inline" /> {name} Progress Tracker</span>
                            <span className="bg-slate-200/80 px-2 py-0.5 rounded-md text-[10px] text-slate-700 font-extrabold">Q {currentIdx + 1} of {questions.length} ({Math.round(progressPercent)}%)</span>
                        </div>
                        {/* Dynamic Neon Progress bar */}
                        <div className="h-5 bg-slate-100/90 rounded-full border border-slate-200/50 overflow-hidden p-[3px] shadow-inner relative">
                            <motion.div 
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 via-pink-500 to-orange-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ type: "spring", stiffness: 90, damping: 14 }}
                            />
                        </div>
                    </div>

                    {/* Quick navigation slide */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-3.5 scrollbar-hide py-1.5 px-1 bg-white/40 rounded-3xl border border-slate-105">
                        {questions.map((_: any, idx: number) => (
                            <motion.button 
                                key={idx}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setCurrentIdx(idx);
                                    setShowExplanation(false);
                                }}
                                className={cn(
                                    "w-11 h-11 rounded-xl font-black text-xs transition-all border shrink-0 flex items-center justify-center shadow-md active:scale-95",
                                    currentIdx === idx ? "bg-gradient-to-br from-indigo-900 to-slate-950 text-white border-indigo-900 scale-110 shadow-indigo-950/20" : 
                                    answers[idx] ? "bg-gradient-to-tr from-cyan-50 to-indigo-50 text-indigo-605 border-indigo-200/50" : "bg-white text-slate-400 border-slate-150 hover:bg-slate-50"
                                )}
                            >
                                {idx + 1}
                            </motion.button>
                        ))}
                    </div>

                    {/* Main Question Card with sliding deck */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIdx}
                            initial={{ opacity: 0, x: 50, scale: 0.97, y: 15 }}
                            animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50, scale: 0.97, y: -15 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white/90 backdrop-blur-sm p-6 md:p-12 rounded-[3.5rem] border-3 border-transparent shadow-2xl space-y-8 relative overflow-hidden"
                            style={{
                                borderImage: 'linear-gradient(to bottom right, rgba(239, 68, 68, 0.2), rgba(124, 58, 237, 0.2), rgba(6, 182, 212, 0.2)) 1'
                            }}
                        >
                            {/* Decorative background details */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                                <GraduationCap className="w-48 h-48 text-indigo-900" />
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-650 text-white rounded-full text-[0.62rem] font-black uppercase tracking-widest shadow-md">
                                        Question {currentIdx + 1}
                                    </span>
                                    {testMode === 'practice' && answers[currentIdx] && (
                                        <span className={cn(
                                            "px-4 py-1.5 text-[0.62rem] font-black uppercase tracking-widest rounded-full shadow-md",
                                            isCorrectInPractice ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                        )}>
                                            {isCorrectInPractice ? "🎯 Correct Answer!" : "❌ Incorrect"}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-tight italic tracking-tight uppercase whitespace-pre-wrap">
                                    {currentQuestion.q}
                                </h2>
                            </div>

                            {/* Option buttons with vibrant neon specific colors */}
                            <div className="grid grid-cols-1 gap-4 text-left">
                                {['a', 'b', 'c', 'd'].map((opt, optIdx) => {
                                    const optionValue = currentQuestion[opt as 'a'|'b'|'c'|'d'];
                                    const isSelected = selectedOption === opt;
                                    const isThisCorrect = currentQuestion.correct === opt;

                                    // Custom color profiles for active selections
                                    const selectThemes = [
                                        { bg: "from-purple-500 to-indigo-600", border: "border-purple-300", shadow: "shadow-purple-500/20", bubble: "bg-purple-100 text-purple-600" },
                                        { bg: "from-cyan-500 to-sky-600", border: "border-cyan-300", shadow: "shadow-cyan-500/20", bubble: "bg-cyan-100 text-cyan-600" },
                                        { bg: "from-pink-500 to-rose-600", border: "border-pink-300", shadow: "shadow-pink-500/20", bubble: "bg-pink-100 text-pink-600" },
                                        { bg: "from-amber-500 to-orange-600", border: "border-amber-300", shadow: "shadow-orange-500/20", bubble: "bg-amber-100 text-amber-600" }
                                    ];
                                    const selectTheme = selectThemes[optIdx % selectThemes.length];

                                    // Idle outline styling: vibrant gradients on hover
                                    const idleThemes = [
                                        "bg-white hover:bg-purple-50/40 border-slate-100 hover:border-purple-200 text-slate-700",
                                        "bg-white hover:bg-cyan-50/40 border-slate-100 hover:border-cyan-200 text-slate-700",
                                        "bg-white hover:bg-pink-50/40 border-slate-100 hover:border-pink-200 text-slate-700",
                                        "bg-white hover:bg-amber-50/40 border-slate-100 hover:border-amber-200 text-slate-700"
                                    ];
                                    const idleTheme = idleThemes[optIdx % idleThemes.length];

                                    let optionClass = idleTheme;
                                    let numberClass = "bg-slate-100 text-slate-400 group-hover:scale-110";
                                    let textClass = "text-slate-700";

                                    if (isSelected) {
                                        if (testMode === 'practice') {
                                            if (isCorrectInPractice) {
                                                optionClass = "bg-gradient-to-r from-emerald-500 to-teal-600 border-transparent text-white shadow-xl shadow-emerald-500/30 scale-[1.015]";
                                                numberClass = "bg-white text-emerald-600";
                                                textClass = "text-white";
                                            } else {
                                                optionClass = "bg-gradient-to-r from-rose-500 to-pink-600 border-transparent text-white shadow-xl shadow-rose-500/30 scale-[1.015]";
                                                numberClass = "bg-white text-rose-600";
                                                textClass = "text-white";
                                            }
                                        } else {
                                            // Exam Mode active selection (no immediate checking)
                                            optionClass = `bg-gradient-to-r ${selectTheme.bg} border-transparent text-white shadow-xl ${selectTheme.shadow} scale-[1.015]`;
                                            numberClass = "bg-white text-indigo-705";
                                            textClass = "text-white";
                                        }
                                    } else {
                                        // Show correct target option in Practice mode if user made an incorrect selection
                                        if (testMode === 'practice' && selectedOption && isThisCorrect) {
                                            optionClass = "bg-emerald-50/90 border-2 border-emerald-400 text-emerald-900 shadow-md";
                                            numberClass = "bg-emerald-500 text-white";
                                            textClass = "text-emerald-950 font-black";
                                        }
                                    }

                                    return (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: selectedOption && testMode === 'practice' ? 1 : 1.03, y: -2 }}
                                            whileTap={{ scale: selectedOption && testMode === 'practice' ? 1 : 0.98 }}
                                            disabled={testMode === 'practice' && !!selectedOption}
                                            onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: opt }))}
                                            className={cn(
                                                "p-5 md:p-6 rounded-[2.25rem] border-2 text-left transition-all flex items-center gap-4 md:gap-6 group relative overflow-hidden active:scale-95",
                                                optionClass
                                            )}
                                        >
                                            {/* Beautiful circle design */}
                                            <div className={cn(
                                                "w-11 h-11 rounded-2xl flex items-center justify-center font-black uppercase transition-transform duration-300 shadow-inner shrink-0 text-base md:text-lg",
                                                numberClass
                                            )}>
                                                {opt}
                                            </div>
                                            <span className={cn(
                                                "font-black text-sm md:text-lg leading-snug w-full tracking-tight text-left select-none uppercase italic",
                                                textClass
                                            )}>
                                                {optionValue}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Accordion explanation for Practice Mode */}
                            {testMode === 'practice' && selectedOption && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-6 border-t border-slate-100 text-left"
                                >
                                    <button 
                                        onClick={() => setShowExplanation(!showExplanation)}
                                        className="flex items-center justify-between w-full py-2 text-slate-500 hover:text-slate-850 transition-colors"
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                            <Sparkles className="w-4.5 h-4.5 text-amber-500 inline animate-bounce" /> Learn Core Conception
                                        </span>
                                        {showExplanation ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </button>

                                    {showExplanation && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-4 p-6 bg-amber-50/60 border border-amber-200/50 rounded-3xl space-y-2 shadow-inner"
                                        >
                                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest">Aadhar Explanation Protocol</p>
                                            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-bold">
                                                {currentQuestion.explanation || "No explanation provided for this question."}
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Continue / Back deck navigation controls */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            disabled={currentIdx === 0}
                            onClick={() => {
                                    setCurrentIdx(prev => prev - 1);
                                    setShowExplanation(false);
                            }}
                            className="flex-1 py-4 bg-slate-100/90 hover:bg-slate-200 border border-slate-200/50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                        >
                            Previous
                        </button>
                        {currentIdx === questions.length - 1 ? (
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setStatus('result')}
                                className="flex-[2.5] py-4 bg-gradient-to-r from-emerald-500 via-teal-650 to-indigo-650 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/25 border border-white/15 active:scale-95 transition-all text-center"
                            >
                                Finish & Grade Exam
                            </motion.button>
                        ) : (
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setCurrentIdx(prev => prev + 1);
                                    setShowExplanation(false);
                                }}
                                className="flex-[2.5] py-4 bg-slate-900 border border-slate-950 text-white hover:bg-indigo-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 active:scale-95 transition-all text-center"
                            >
                                Next Question
                            </motion.button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto space-y-10 text-center pt-8 relative z-10">
                    {/* CONFETTI FLUTTER (various floating star particles) */}
                    <div className="absolute inset-x-0 top-0 bottom-24 overflow-hidden pointer-events-none z-10">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ 
                                    opacity: 1, 
                                    y: "110%", 
                                    x: `${Math.random() * 100}%`,
                                    scale: Math.random() * 0.5 + 0.5,
                                    rotate: 0 
                                }}
                                animate={{ 
                                    opacity: 0, 
                                    y: "-10%", 
                                    rotate: 360,
                                    x: `${Math.random() * 100}%`
                                }}
                                transition={{ 
                                    duration: Math.random() * 4 + i * 0.15, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    delay: Math.random() * 2.5 
                                }}
                                className="absolute text-2xl"
                            >
                                {['✨', '⭐', '🎈', '🎉', '🌟', '🧁', '🌸', '🦖'][i % 8]}
                            </motion.div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="relative inline-block">
                            {/* Colorful glow wrapper */}
                            <motion.div 
                                animate={{ rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className={cn("w-36 h-36 rounded-[3.5rem] p-1.5 bg-gradient-to-tr shadow-2xl relative z-10 flex items-center justify-center", scoreColor)}
                            >
                                <div className="w-full h-full bg-white rounded-[3.15rem] flex items-center justify-center">
                                    <Trophy className="w-16 h-16 text-amber-500 animate-bounce" />
                                </div>
                            </motion.div>
                        </div>
                        
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase leading-none bg-gradient-to-r from-violet-600 via-pink-600 to-amber-500 bg-clip-text text-transparent">
                                Evaluation Finished
                            </h1>
                            <div className="flex justify-center">
                                <span className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 shadow-md animate-pulse", rankColor)}>
                                    {rankTitle}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Analytical Scoreboard */}
                    <div className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-slate-205/60 shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-purple-650 via-pink-500 to-orange-400 animate-pulse" />
                        
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[0.62rem] font-black text-slate-400 uppercase tracking-[0.25em]">Accuracy Register</span>
                            <div className="flex justify-center items-baseline gap-2">
                                <span className="text-8xl font-black text-slate-950 tracking-tighter italic tabular-nums leading-none">{score}</span>
                                <span className="text-3xl font-black text-slate-300">/ {questions.length}</span>
                            </div>
                        </div>

                        {/* Ring Progress Indicator */}
                        <div className="h-6 bg-slate-100 p-1 rounded-full overflow-hidden shadow-inner relative">
                            <motion.div 
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 via-pink-500 to-orange-400" 
                                initial={{ width: 0 }}
                                animate={{ width: `${accuracy}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-tr from-purple-50 to-indigo-50/50 p-5 rounded-2xl border-2 border-purple-100/50 flex flex-col justify-center text-center shadow-sm">
                                <p className="text-[0.6rem] font-black text-purple-400 uppercase tracking-widest mb-1.5">Statistical Accuracy</p>
                                <p className="text-2xl font-black text-purple-900 italic tracking-tighter leading-none">{accuracy}%</p>
                            </div>
                            <div className="bg-gradient-to-tr from-rose-50 to-pink-50/50 p-5 rounded-2xl border-2 border-rose-100/50 flex flex-col justify-center text-center shadow-sm">
                                <p className="text-[0.6rem] font-black text-rose-450 uppercase tracking-widest mb-1.5">Elapsed Duration</p>
                                <p className="text-2xl font-black text-rose-905 italic tracking-tighter leading-none">{formatTime(timeTaken)}</p>
                            </div>
                        </div>
                    </div>

                    {/* QUESTIONS REVIEW SECTION */}
                    <div className="bg-white p-6 md:p-8 rounded-[3rem] border border-slate-200/60 shadow-xl text-left space-y-6">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-xl font-black uppercase text-slate-950 italic tracking-tight flex items-center gap-2">
                                📑 Comprehensive Exam Review
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                                Double check your detailed selected options and explanations
                            </p>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.map((q: any, qIdx: number) => {
                                const selected = answers[qIdx];
                                const isCorrect = selected === q.correct;

                                return (
                                    <div key={qIdx} className="p-5 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1 text-left">
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-900 text-white uppercase tracking-wider">
                                                    Q {qIdx + 1}
                                                </span>
                                                <h4 className="text-sm font-black text-slate-800 leading-snug whitespace-pre-wrap">
                                                    {q.q}
                                                </h4>
                                            </div>
                                            <span className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm text-white",
                                                isCorrect ? "bg-emerald-500" : "bg-rose-500"
                                            )}>
                                                {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                                            <div className={cn("p-2.5 rounded-lg border", isCorrect ? "bg-emerald-50/80 border-emerald-100 text-emerald-850" : "bg-rose-50/80 border-rose-100 text-rose-850")}>
                                                <p className="text-[8px] uppercase tracking-widest font-black text-slate-400">Your Choice</p>
                                                <p className="font-bold">{selected ? `${selected.toUpperCase()}: ${q[selected as 'a'|'b'|'c'|'d']}` : "Skipped"}</p>
                                            </div>
                                            <div className="p-2.5 rounded-lg border bg-emerald-50/80 border-emerald-100 text-emerald-800">
                                                <p className="text-[8px] uppercase tracking-widest font-black text-emerald-600">Correct Target</p>
                                                <p className="font-bold">{q.correct.toUpperCase()}: {q[q.correct as 'a'|'b'|'c'|'d']}</p>
                                            </div>
                                        </div>

                                        {q.explanation && (
                                            <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs leading-relaxed text-slate-705 font-medium italic">
                                                <strong>Focus Concept:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="space-y-4">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                                hasSaved.current = false;
                                setAnswers({});
                                setCurrentIdx(0);
                                setTimer(countParam * 60);
                                setStatus('quiz');
                            }} 
                            className="w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl bg-gradient-to-r from-violet-600 via-indigo-650 to-indigo-755 hover:shadow-indigo-500/20 active:scale-95"
                        >
                            Retake Intelligence Test
                        </motion.button>
                        
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/hub/${name}`)} 
                            className="w-full py-6 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-lg shadow-rose-500/20 group flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Home className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                            Return to Hub
                        </motion.button>
                    </div>
                </div>
            )}
        </div>
    );
};

const BANNER_GRADIENTS = [
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-indigo-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-blue-500 to-indigo-600',
    'from-indigo-500 to-violet-600',
    'from-orange-500 to-amber-600',
    'from-cyan-500 to-blue-600'
];

/* ── LOGIN PAGE ── */
const LoginPage = () => {
    const { setUser } = useApp();
    const navigate = useNavigate();
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    const handleAuth = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        if (view === 'signup' && !fullName) {
            setError("Full Name is required");
            return;
        }

        setLoading(true);
        try {
            if (view === 'signup') {
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match");
                }
                const { data, error: signupError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                });
                if (signupError) throw signupError;
                
                if (data.session) {
                    const newUser: User = {
                        id: data.user!.id,
                        name: fullName || email.split('@')[0],
                        email: email,
                        grade: '10',
                        streak: 1,
                        completedChapters: [],
                        xp: 100,
                    };
                    setUser(newUser);
                    localStorage.setItem('logged_user', JSON.stringify(newUser));
                    navigate('/');
                } else {
                    setSuccessMessage("Account created! Please check your email to verify your account before logging in.");
                    setView('login');
                    setPassword('');
                }
            } else {
                const { data, error: signinError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signinError) throw signinError;
                
                if (data.user) {
                    const loggedUser: User = {
                        id: data.user.id,
                        name: data.user.user_metadata?.full_name || email.split('@')[0],
                        email: data.user.email || email,
                        grade: '10',
                        streak: 5,
                        completedChapters: [],
                        xp: 1250,
                    };
                    setUser(loggedUser);
                    localStorage.setItem('logged_user', JSON.stringify(loggedUser));
                    navigate('/');
                }
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });
            if (oauthError) throw oauthError;
        } catch (err: any) {
            setError(err.message || 'Failed to initialize Google login');
        }
    };

    return (
        <div className="fixed inset-0 z-[3000] overflow-hidden flex flex-col bg-[#F0F9FF]">
            {/* Soft Blue Gradient Background */}
            <div className="absolute inset-0 bg-linear-to-br from-sky-100/50 via-white to-blue-50/50" />
            
            {/* Header Area */}
            <div className="relative pt-8 sm:pt-16 px-10 pb-4 sm:pb-8 flex flex-col items-start z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <AppSymbol size="lg" className="mb-2 border-none bg-transparent shadow-none" />
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-none mb-1"
                >
                    Hello!
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-500 font-bold text-base sm:text-lg"
                >
                    Welcome Student
                </motion.p>
            </div>
            
            {/* Login/Signup Card */}
            <motion.div 
                key={view}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="relative z-20 flex-1 bg-white rounded-t-[3rem] sm:rounded-t-[4rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] px-6 sm:px-8 pt-8 sm:pt-12 flex flex-col overflow-hidden"
            >
                <div className="max-w-md mx-auto w-full flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center justify-between mb-6 sm:mb-8"
                    >
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{view === 'login' ? 'Login' : 'Sign Up'}</h2>
                        {view === 'signup' && (
                            <button 
                                onClick={() => {
                                    setView('login');
                                    setError(null);
                                    setSuccessMessage(null);
                                }} 
                                className="flex items-center gap-2 text-[0.6rem] sm:text-[0.7rem] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to login
                            </button>
                        )}
                    </motion.div>
                    
                    <div className="space-y-4 sm:space-y-6 flex-1">
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3 sm:space-y-4"
                        >
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-black"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl text-xs font-black"
                                >
                                    {successMessage}
                                </motion.div>
                            )}
                            {view === 'signup' && (
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><UserIcon className="w-5 h-5" /></span>
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            )}
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Languages className="w-5 h-5" /></span>
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-base"
                                />
                            </div>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="w-5 h-5" /></span>
                                <input 
                                    type="password" 
                                    placeholder="Password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-base"
                                />
                            </div>
                            {view === 'signup' && (
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"><ShieldCheck className="w-5 h-5" /></span>
                                    <input 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl py-4 sm:py-5 pl-14 sm:pl-16 pr-6 text-slate-800 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-base"
                                    />
                                </div>
                            )}
                            {view === 'login' && (
                                <div className="flex justify-between items-center px-2">
                                    <button 
                                        onClick={() => {
                                            setView('signup');
                                            setError(null);
                                            setSuccessMessage(null);
                                        }} 
                                        className="text-[0.6rem] sm:text-[0.7rem] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
                                    >
                                        New here? Sign Up
                                    </button>
                                    <button className="text-[0.6rem] sm:text-[0.7rem] font-black uppercase tracking-widest text-[#1D4ED8]">Forgot Password?</button>
                                </div>
                            )}
                        </motion.div>

                        <motion.button 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            onClick={() => handleAuth()}
                            disabled={loading}
                            className="w-full py-5 sm:py-6 bg-[#16423C] text-white rounded-[1.5rem] sm:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[0.65rem] sm:text-xs shadow-xl shadow-[#16423C]/20 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {view === 'login' ? 'Logging in...' : 'Signing up...'}
                                </span>
                            ) : (
                                view === 'login' ? 'Login' : 'Sign Up'
                            )}
                        </motion.button>

                        <button 
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.href = '/';
                            }}
                            className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest hover:text-[#16423C] transition-colors mt-2 text-center w-full"
                        >
                            Stuck? Reset Session
                        </button>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="relative flex items-center gap-4 py-2 sm:py-4"
                        >
                            <div className="flex-1 h-[1px] bg-slate-100" />
                            <span className="text-[0.55rem] sm:text-[0.6rem] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Or {view === 'login' ? 'login' : 'sign up'} with</span>
                            <div className="flex-1 h-[1px] bg-slate-100" />
                        </motion.div>

                        {/* Social Icons */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="flex justify-center"
                        >
                            <button 
                                onClick={handleGoogleLogin}
                                className="w-full sm:max-w-xs h-14 sm:h-16 bg-white border border-slate-100 rounded-2xl sm:rounded-3xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95 group"
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.823l-4.04 3.067C3.186 21.302 7.275 24 12 24c3.11 0 5.924-1.006 8.054-2.813l-4.014-3.174z"/><path fill="#4285F4" d="M23.49 12.275c0-.868-.079-1.53-.236-2.25H12v4.526h6.488c-.133.864-.813 2.146-2.054 2.997l4.013 3.174c2.338-2.157 3.682-5.335 3.682-8.447z"/><path fill="#FBBC05" d="M5.277 14.268a7.12 7.12 0 000-4.503L1.24 6.65a11.962 11.962 0 000 10.7l4.037-3.082z"/></svg>
                                <span className="text-slate-600 font-black uppercase tracking-widest text-[0.65rem] sm:text-xs">Continue with Google</span>
                            </button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ── PROFILE PAGE ── */
const ProfilePage = () => {
    const { user, setUser, userProfile } = useApp();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [updating, setUpdating] = useState(false);
    
    const handleUpdateName = async () => {
        if (!newName.trim()) return;
        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: newName }
            });
            if (error) throw error;
            if (user) {
                const updated = { ...user, name: newName };
                setUser(updated);
                localStorage.setItem('logged_user', JSON.stringify(updated));
            }
            setIsEditing(false);
        } catch (e) {
            alert("Failed to update name");
        } finally {
            setUpdating(false);
        }
    };
    
    const stats = [
        { label: 'Total XP', value: user?.xp || 0, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Day Streak', value: user?.streak || 0, icon: Zap, color: 'text-rose-500', bg: 'bg-rose-50' },
        { label: 'Chapters', value: user?.completedChapters?.length || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Test Given', value: '12', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' }
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen pb-24 animate-fade-up bg-[#F8FAFC]">
            <div className="relative h-48 bg-linear-to-br from-[#1D4ED8] to-[#1E40AF] overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-[#F8FAFC] to-transparent" />
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="max-w-md mx-auto px-6 -mt-24 relative z-10">
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 text-center border border-slate-100 mb-6">
                    <div className="relative inline-block mb-4">
                        <div className="w-28 h-28 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden bg-slate-50 mx-auto">
                            <img 
                                src={LogoImg} 
                                alt="Profile" 
                                className="w-full h-full object-cover p-2"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + (user?.name || 'Scholar') + '&background=random';
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-emerald-500 text-white rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <input 
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full max-w-xs p-3 border-2 border-indigo-100 rounded-2xl text-center font-black text-xl outline-none focus:border-indigo-500"
                                placeholder="Enter Name"
                            />
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</button>
                                <button onClick={handleUpdateName} disabled={updating} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200">
                                    {updating ? 'Saving...' : 'Save Name'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-black tracking-tight mb-1 text-slate-900">{user?.name || 'Scholar'}</h1>
                            <button onClick={() => setIsEditing(true)} className="text-[0.6rem] font-black text-indigo-500 uppercase tracking-widest mb-4 hover:underline">Edit Name</button>
                        </>
                    )}
                    <p className="text-sm font-semibold text-slate-500 mb-6 truncate px-4">{user?.email || 'student@aadhar.edu.np'}</p>

                    <div className="grid grid-cols-2 gap-3">
                        {stats.map((stat) => (
                            <div key={stat.label} className={cn("p-4 rounded-3xl border flex flex-col items-center bg-slate-50 border-slate-100", stat.bg)}>
                                <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                                <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</span>
                                <span className={cn("text-lg font-black", stat.color)}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.3em] px-4 mb-2">Learning Profile</h2>
                    
                    <div className="rounded-[2rem] border shadow-sm overflow-hidden bg-white border-slate-100">
                        {[
                            { label: 'Academic Year', value: '2083 BS', icon: Calendar },
                            { label: 'Current Grade', value: user?.grade || 'Class 10', icon: GraduationCap },
                            { label: 'Account Identity', value: 'Verified Student', icon: UserCheck },
                            { label: 'School Network', value: 'Aadhar Pathshala', icon: Globe },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 transition-colors border-b last:border-0 group border-slate-50 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-slate-50 text-slate-400 group-hover:text-blue group-hover:bg-blue/5">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <span className="text-[0.75rem] font-black text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>

                        <div className="flex flex-col gap-3 pt-6">
                        {userProfile?.role === 'admin' && (
                            <button 
                                onClick={() => navigate('/admin-portal')} 
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[0.7rem] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                Admin Dashboard
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[0.7rem] shadow-xl shadow-rose-200 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── STUDY HUB & SUBJECTS ── */
const StudyHub = () => {
    const { data, userProfile } = useApp();
    const navigate = useNavigate();

    const compulsory = ['English', 'नेपाली', 'Maths', 'Science', 'सामाजिक'];
    
    const renderSubject = (name: string, sub: any, i: number) => {
        const config = SUBJECTS_CONFIG[name as SubjectType] || { color: 'slate', icon: BookOpen, gradient: 'from-slate-500 to-slate-700' };
        const Icon = config.icon;
        const brand = getBrandColors(config.color);
        return (
            <motion.button
                key={name}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/hub/${name}`)}
                className="bg-white p-4 rounded-[1.75rem] border border-slate-100 shadow-xs flex items-center gap-4 group hover:shadow-lg transition-all text-left relative overflow-hidden active:scale-[0.98]"
            >
                <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:rotate-3 transition-all duration-500 bg-linear-to-br text-white", config.gradient)}>
                    <Icon className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div className="flex-1 min-w-0 pr-1">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none truncate mb-1">{name}</h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[0.5rem] font-bold uppercase tracking-widest text-slate-400">{sub.chapters.length} Units</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className={cn("text-[0.45rem] font-black uppercase tracking-widest", brand.text)}>Archive</span>
                    </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-900 transition-colors shrink-0" />
            </motion.button>
        );
    };

    return (
        <div className="space-y-6 animate-fade-up pb-32 px-1">
            <header className="space-y-0.5 pt-4">
                <p className="text-[0.55rem] font-black text-blue uppercase tracking-[0.5em] italic opacity-60">Aadhar Ecosystem</p>
                <h1 className="text-4xl md:text-5xl font-black text-black italic tracking-tighter uppercase leading-none">Learning Hub</h1>
            </header>

            <div className="space-y-6">
                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest italic whitespace-nowrap">Compulsory Subjects</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {compulsory.map((name, i) => {
                            const sub = data.subjects[name];
                            if (!sub) return null;
                            return renderSubject(name, sub, i);
                        })}
                    </div>
                </section>

                <section className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest italic whitespace-nowrap">Optional Subjects</h2>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    const decodedName = decodeURIComponent(name || '');
    const sub = data.subjects[decodedName];
    const config = SUBJECTS_CONFIG[decodedName as SubjectType] || SUBJECTS_CONFIG['English'];

    const dynamicChapters = liveMaterials.filter(m => m.subject === decodedName && m.type === 'chapter');
    const allChapters = [...(sub?.chapters || []), ...dynamicChapters];

    const brand = getBrandColors(config.color);
    const accentBg = brand.bg;
    const accentText = brand.text;

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const toNepaliDigits = (num: number) => {
        const nepalidigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        return String(num).split('').map(digit => nepalidigits[parseInt(digit)] || digit).join('');
    };

    const displayNum = (i: number) => {
        const num = i + 1;
        const formatted = String(num).padStart(2, '0');
        if (decodedName === 'नेपाली' || decodedName === 'सामाजिक') {
            return toNepaliDigits(num).padStart(2, '०');
        }
        return formatted;
    };

    return (
        <div className="space-y-8 animate-fade-up pb-32">
            <header className="flex flex-col gap-2 px-1">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-[0.6rem] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1">Unit Repository</span>
                </div>
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                        Module <span className={accentText}>Vault</span>
                    </h1>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                        <Archive className="w-6 h-6" />
                    </div>
                </div>
            </header>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
            >
                {allChapters.map((ch: any, i: number) => {
                    const topics = ch.topics ? ch.topics.split(',').filter(Boolean) : [];
                    return (
                        <motion.button 
                            variants={item}
                            key={`${ch.id}-${i}`}
                            onClick={() => navigate(`/hub/${name}/chapters/${ch.id}`)}
                            className={cn(
                                "bg-white p-5 rounded-3xl border-2 shadow-sm hover:shadow-xl transition-all text-left flex items-center gap-5 group relative overflow-hidden active:scale-[0.98]",
                                "border-slate-50 hover:border-slate-100"
                            )}
                        >
                            <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full -mr-12 -mt-12 bg-current pointer-events-none", accentText)} />
                            
                            <div className={cn("w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shrink-0 relative z-10 transition-transform group-hover:scale-110", accentBg)}>
                                <span className="text-[0.5rem] uppercase tracking-widest opacity-60 leading-none mb-0.5">Unit</span>
                                <span className="text-xl leading-none italic">{displayNum(i)}</span>
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    {ch.contentType && (
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[0.55rem] font-black uppercase tracking-widest border",
                                            ch.contentType === 'Answer' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            ch.contentType === 'Sub Topic' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-indigo-50 text-indigo-600 border-indigo-100"
                                        )}>
                                            {ch.contentType}
                                        </span>
                                    )}
                                    {ch.marks && ch.marks !== "0" && !ch.hideMarks && (
                                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded-lg text-[0.55rem] font-black uppercase tracking-widest border border-slate-800">
                                            {ch.marks} Marks
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase italic leading-tight truncate">
                                    {ch.title}
                                </h2>
                            </div>

                            <div className="flex items-center justify-center w-10 h-10 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                <ArrowRight className="w-5 h-5" />
                            </div>
                        </motion.button>
                    );
                })}

                {allChapters.length === 0 && (
                    <div className="py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-50 space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xl font-black text-slate-300 uppercase italic tracking-widest leading-none">Curriculum Null</p>
                            <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Awaiting Module Synchronization from Admin</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

const ChapterDetail = () => {
    const { name, chapterId } = useParams();
    const { data, liveMaterials, user, toggleChapterComplete } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[decodeURIComponent(name || '')] || Object.values(data.subjects)[0];
    const chapter = sub?.chapters?.find((c: any) => c.id === chapterId) || liveMaterials?.find(m => m.id === chapterId);
    const [viewer, setViewer] = useState({ isOpen: false, url: '', title: '', docxUrl: '' });

    if (!chapter) return <div className="p-10 text-center font-black uppercase text-slate-400">Entry Missing</div>;

    const isCompleted = user?.completedChapters?.includes(chapterId || '');
    const topicsList = (chapter.topics || '').split(',').filter(Boolean);
    const config = SUBJECTS_CONFIG[decodeURIComponent(name || '') as SubjectType] || SUBJECTS_CONFIG['English'];
    const Icon = config.icon;

    const brand = getBrandColors(config.color);
    const accentBg = brand.bg;
    const accentText = brand.text;

    // Marks handling
    const marksValue = chapter.marks || 0;
    const hideMarks = chapter.hideMarks || false;

    return (
        <div className="animate-fade-up pb-32">
            <header className="mb-6 md:mb-8 space-y-6 px-3 sm:px-0">
                <div className="flex items-center justify-between px-1">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                            <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                            <span className="text-[0.7rem] font-bold text-emerald-500 uppercase tracking-tighter">Verified Module</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl min-h-[200px] flex flex-col justify-end border-2 md:border-4 border-white/20 bg-linear-to-br", config.gradient)}
                >
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10 blur-[2px] transition-transform duration-700 hover:blur-none hover:opacity-20 hover:scale-110">
                        <Icon className="w-32 h-32 md:w-48 md:h-48 -rotate-12 translate-x-8 md:translate-x-12 -translate-y-8 md:-translate-y-12" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-white/10 shrink-0">
                                    {decodeURIComponent(name || '')} Curriculum Node
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-tight md:leading-none max-w-2xl drop-shadow-lg">
                                {chapter.title}
                            </h1>
                        </div>
                        
                        {!hideMarks && marksValue !== 0 && (
                            <div className="px-4 py-2 md:px-5 md:py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] flex flex-col items-start sm:items-end shadow-xl self-start sm:self-auto shrink-0">
                                <span className="text-[0.55rem] font-black uppercase tracking-[0.2em] opacity-80 mb-0.5">Board Weightage</span>
                                <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
                                    {marksValue} Marks
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-3 sm:px-0">
                    {/* Content Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-xl min-h-[500px]">
                            {chapter.file_url?.toLowerCase().endsWith('.pdf') ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                                    <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center shadow-lg border border-indigo-100">
                                        <FileCode className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Digital Asset Ready</h3>
                                        <p className="text-[0.7rem] text-slate-400 font-black uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                            This learning module contains attached reference materials. Initialize view layer to interact.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setViewer({ isOpen: true, url: chapter.file_url!, title: chapter.title, docxUrl: chapter.file_url_docx || '' })}
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[1.75rem] font-black uppercase tracking-widest text-[0.7rem] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
                                    >
                                        <Eye className="w-5 h-5" /> Open Material Center
                                    </button>
                                </div>
                            ) : (
                                <div className="markdown-body text-slate-800 font-medium prose-headings:text-slate-900 prose-strong:text-indigo-600 prose-p:leading-relaxed text-lg">
                                     <div className="mb-10 border-b border-slate-100 pb-6">
                                        <div className="flex flex-col gap-1 mb-4">
                                            <div className={cn(
                                                "px-4 py-1.5 rounded-xl inline-flex self-start text-[0.65rem] font-black uppercase tracking-widest border shadow-sm",
                                                chapter.contentType === 'Answer' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                chapter.contentType === 'Sub Topic' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                "bg-indigo-50 text-indigo-600 border-indigo-100"
                                            )}>
                                                {chapter.contentType || 'Curriculum Notes'}
                                            </div>
                                        </div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none mb-2">
                                            {chapter.contentType === 'Sub Topic' ? 'Topic Deep-Dive' : 
                                             chapter.contentType === 'Answer' ? 'Solution Repository' : 
                                             'Authenticated Notes'}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                                            <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest">Active Content Synchronization</p>
                                        </div>
                                    </div>
                                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                        {chapter.notes || chapter.text_content || chapter.description || chapter.contentHtml || '# Module Synchronization Error\nDeep-dive documentation for this unit is being synced. Please check back in a few moments for the complete curriculum roadmap.'}
                                    </Markdown>
                                </div>
                            )}
                        </div>

                        {/* Extra Note Cards */}
                        {liveMaterials.filter(m => (m.subject === name) && (m.type === 'note' || m.type === 'shared_note') && (m.title?.toLowerCase().includes(chapter.title.toLowerCase()))).map((material, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                key={material.id}
                                className="bg-white border-2 border-slate-50 p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400"><StickyNote className="w-16 h-16 rotate-12" /></div>
                                <div className="relative z-10">
                                    <span className="inline-flex items-center px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[0.65rem] font-black uppercase tracking-widest mb-6 border border-emerald-100">
                                        Module Supplement #{idx + 1}
                                    </span>
                                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-6">{material.title}</h3>
                                    <div className="markdown-body text-slate-700 font-medium text-lg leading-relaxed">
                                        <Markdown>{material.text_content || material.content || ''}</Markdown>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sidebar / Roadmap */}
                    <div className="lg:col-span-4 space-y-6">
                        {topicsList.length > 0 && (
                            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-8 border-b border-slate-50 pb-5 flex items-center gap-3">
                                    <Target className="w-5 h-5 text-indigo-500" /> Syllabus Roadmap
                                </h3>
                                <div className="space-y-8 relative z-10">
                                    {topicsList.map((t, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            key={idx} 
                                            className="flex gap-6 group/item"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div className={cn("w-4 h-4 rounded-full shrink-0 mt-1.5 border-2 border-white shadow-md transition-all group-hover/item:scale-125", idx === 0 ? accentBg : "bg-slate-200")} />
                                                {idx !== topicsList.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-2" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest opacity-60">Objective {idx + 1}</p>
                                                <p className="text-sm font-black uppercase italic tracking-tight text-slate-700 leading-tight group-hover/item:text-indigo-600 transition-colors cursor-default">
                                                    {t.trim()}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-900 p-8 rounded-[3rem] border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700" />
                            <div className="relative z-10 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[0.6rem] font-black text-indigo-400 uppercase tracking-widest italic">Module Finalization</p>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Mark Completion</h4>
                                </div>
                                <button 
                                    onClick={() => toggleChapterComplete(chapterId || '')}
                                    className={cn(
                                        "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[0.7rem] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95",
                                        isCompleted 
                                            ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                                            : "bg-white text-slate-900 hover:bg-slate-100"
                                    )}
                                >
                                    {isCompleted ? <Check className="w-5 h-5 stroke-[4px]" /> : <Circle className="w-5 h-5" />}
                                    {isCompleted ? "Unit Synchronized" : "Confirm Mastery"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            <BookViewer 
                isOpen={viewer.isOpen} 
                onClose={() => setViewer({ ...viewer, isOpen: false })} 
                url={viewer.url} 
                title={viewer.title} 
                docxUrl={viewer.docxUrl}
            />
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
        <div className="space-y-8 animate-fade-up pb-24 px-4 md:px-8 max-w-7xl mx-auto mt-4">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-12 h-12 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all z-20 group shrink-0"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Explainer TV</h1>
                    <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1 hidden md:block">Master concepts with high-quality visual lessons</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                {/* Dynamic Videos */}
                {dynamicVideos.map((v: any) => {
                    const yId = v.youtube_id || extractYoutubeId(v.file_url || v.link_url);
                    const thumbUrl = yId ? `https://img.youtube.com/vi/${yId}/maxresdefault.jpg` : null;
                    
                    return (
                        <div key={v.id} onClick={() => window.open(yId ? `https://youtube.com/watch?v=${yId}` : (v.file_url || v.link_url))} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
                            <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden shrink-0">
                                {yId ? (
                                    <>
                                        <img 
                                          src={thumbUrl!} 
                                          className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" 
                                          referrerPolicy="no-referrer" 
                                          onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              if (!target.src.includes('hqdefault')) {
                                                  target.src = `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
                                              }
                                          }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-50" />
                                                <div className="absolute inset-0 bg-white/30 rounded-full backdrop-blur-sm" />
                                                <Play className="w-7 h-7 text-white fill-white relative z-10 translate-x-0.5" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800 group-hover:bg-slate-700 transition-colors duration-500">
                                        <div className="relative w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-50" />
                                            <div className="absolute inset-0 bg-rose-600 rounded-full shadow-xl shadow-rose-600/30" />
                                            <Play className="w-7 h-7 text-white fill-white relative z-10 translate-x-0.5" />
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-rose-500 text-white text-[0.55rem] font-black uppercase tracking-widest rounded-lg shadow-lg backdrop-blur-md flex items-center gap-1.5">
                                        <TrendingUp className="w-3 h-3" /> New Upload
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg md:text-xl font-black text-slate-800 mb-3 leading-tight uppercase tracking-tight italic line-clamp-2 flex-1 group-hover:text-indigo-600 transition-colors">{v.title}</h3>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                            <Youtube className="w-3 h-3 text-slate-400" />
                                        </div>
                                        <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest truncate">{yId ? 'YouTube Stream' : 'Official Asset'}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        <ArrowRight className="w-4 h-4 -rotate-45" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Initial Videos */}
                {sub.videos.map((v: any) => (
                    <div key={v.id} onClick={() => window.open(`https://youtube.com/watch?v=${v.youtubeId}`)} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer flex flex-col h-full transform hover:-translate-y-1">
                        <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden shrink-0">
                             <img 
                               src={`https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg`} 
                               className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700" 
                               referrerPolicy="no-referrer" 
                               onError={(e) => {
                                   const target = e.target as HTMLImageElement;
                                   if (!target.src.includes('hqdefault')) {
                                       target.src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
                                   }
                               }}
                             />
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="relative w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                     <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-50" />
                                     <div className="absolute inset-0 bg-white/30 rounded-full backdrop-blur-sm shadow-[0_0_30px_rgba(0,0,0,0.3)]" />
                                     <Play className="w-7 h-7 text-white fill-white relative z-10 translate-x-0.5" />
                                 </div>
                             </div>
                             <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white text-[0.6rem] font-bold px-3 py-1.5 rounded-lg tracking-widest shadow-lg flex items-center gap-1.5">
                                 <Clock className="w-3 h-3 text-slate-300" /> {v.duration}
                             </div>
                             <div className="absolute top-4 left-4">
                                <span className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white text-[0.55rem] font-black uppercase tracking-widest rounded-lg shadow-lg border border-white/10 flex items-center gap-1.5">
                                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Featured
                                </span>
                             </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                             <h3 className="text-lg md:text-xl font-black text-slate-800 mb-3 leading-tight uppercase tracking-tight line-clamp-2 flex-1 group-hover:text-indigo-600 transition-colors">{v.title}</h3>
                             <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                 <div className="flex items-center gap-2">
                                     <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                         <ShieldCheck className="w-3 h-3 text-slate-400" />
                                     </div>
                                     <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest truncate">Aadhar Hub Partner</p>
                                 </div>
                                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                     <ArrowRight className="w-4 h-4 -rotate-45" />
                                 </div>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DownloadOptionsDropdown = ({ pdfUrl, docxUrl, fileName }: { pdfUrl?: string, docxUrl?: string, fileName: string }) => {
    const [open, setOpen] = useState(false);
    
    if(!pdfUrl && !docxUrl) return null;

    if(pdfUrl && !docxUrl) {
         return (
             <a 
                 href={pdfUrl} 
                 download={fileName} 
                 className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-indigo-100 hover:bg-indigo-600 hover:text-white"
                 title="Download PDF"
             >
                 <Download className="w-5 h-5" />
             </a>
         );
    }

    if(!pdfUrl && docxUrl) {
         return (
             <a 
                 href={docxUrl} 
                 download={fileName} 
                 className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-indigo-100 hover:bg-indigo-600 hover:text-white"
                 title="Download Word Document"
             >
                 <Download className="w-5 h-5" />
             </a>
         );
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setOpen(!open)} 
                className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-indigo-100 hover:bg-indigo-600 hover:text-white"
                title="Download Options"
            >
                <Download className="w-5 h-5" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-12 right-0 bg-white shadow-xl rounded-xl border border-slate-100 p-2 z-50 w-48 flex flex-col gap-1">
                        <a 
                            href={pdfUrl} 
                            download={`${fileName}.pdf`}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 transition-colors"
                        >
                            <FileText className="w-4 h-4 text-rose-500" /> Download PDF
                        </a>
                        <a 
                            href={docxUrl} 
                            download={`${fileName}.docx`}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 transition-colors"
                        >
                            <FileCode className="w-4 h-4 text-blue-500" /> Download Word
                        </a>
                    </div>
                </>
            )}
        </div>
    );
};

const PdfList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];
    const [viewer, setViewer] = useState<{ isOpen: boolean; url: string; title: string, docxUrl?: string }>({ isOpen: false, url: '', title: '' });
    const [selectionModal, setSelectionModal] = useState<any>(null);

    const dynamicPdfs = liveMaterials.filter(m => m.subject === name && m.type === 'note_archive');
    const allPdfs = [...(sub?.pdfs || []), ...dynamicPdfs];

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
            <StudyPdfViewer 
                isOpen={viewer.isOpen} 
                onClose={() => setViewer({ ...viewer, isOpen: false })} 
                url={viewer.url} 
                title={viewer.title} 
            />
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center active:scale-95 transition-all z-20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Archives</h1>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {allPdfs.length > 0 ? allPdfs.map((p: any, i: number) => (
                    <div 
                        key={`${p.id}-${i}`} 
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl hover:border-blue transition-all"
                    >
                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex flex-col items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue group-hover:text-white transition-all overflow-hidden relative">
                            <FileText className="w-8 h-8 z-10" />
                            <span className="text-[0.45rem] font-bold uppercase mt-1 z-10">ARCHIVE</span>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 group-hover:bg-white/20 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase mb-1 truncate">{p.name || p.title}</h3>
                            <p className="text-[0.6rem] text-slate-400 font-bold leading-relaxed uppercase tracking-widest line-clamp-1">{p.desc || 'Comprehensive Study Resource'}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-500 text-[0.5rem] font-black uppercase tracking-tighter">Verified</span>
                                <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 text-[0.5rem] font-black uppercase tracking-tighter">Node 4.2</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <DownloadOptionsDropdown 
                                pdfUrl={(p.url || p.file_url || p.link_url) !== '#' ? (p.url || p.file_url || p.link_url) : undefined}
                                docxUrl={p.file_url_docx}
                                fileName={p.name || p.title || 'Archive'}
                            />
                             <button 
                                onClick={() => {
                                    const pdf = p.url || p.file_url || p.link_url || '#';
                                    if (pdf !== '#') setViewer({ isOpen: true, url: pdf, title: p.name || p.title });
                                }} 
                                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all hover:scale-105 shadow-md"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
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
        ...liveMaterials.filter((m: any) => m.subject === name && m.type === 'shared_note')
    ];
    const simpleNotes = liveMaterials.filter((m: any) => m.subject === name && m.type === 'note');

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 active:scale-95 transition-all z-20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Note Repository</h1>
            </div>

            <div className="space-y-6">
                {/* SHARED MARKDOWN NOTES */}
                {sharedNotes.map((n: any, i: number) => (
                    <div key={`${n.id}-${i}`} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
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
                {simpleNotes.map((n: any, i: number) => (
                    <div 
                        key={`${n.id}-${i}`} 
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
                        <p className="text-[0.65rem] font-bold text-slate-400 max-w-[240px] mx-auto mt-2 leading-relaxed uppercase tracking-widest leading-relaxed italic">Be the first to share notes and help your classmates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const StudyPdfViewer = ({ isOpen, onClose, url, title }: { isOpen: boolean; onClose: () => void; url: string; title: string }) => {
    if (!isOpen || !url) return null;
    
    // Pass Google Drive view URLs to preview URLs for embedding
    const getPreviewUrl = (raw: string) => {
        if (!raw) return '';
        // Try to detect google drive links and transform them
        if (raw.includes('drive.google.com/file/d/')) {
            const id = raw.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1];
            if (id) return `https://drive.google.com/file/d/${id}/preview`;
        }
        // Always try to use gview for PDFs / general URL embedding
        return `https://docs.google.com/gview?url=${encodeURIComponent(raw)}&embedded=true`;
    };
    
    const embedUrl = getPreviewUrl(url);

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[5000] bg-slate-950/90 backdrop-blur-xl flex flex-col font-sans"
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                            <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-white font-black uppercase italic tracking-tight">{title || 'Document Viewer'}</h2>
                            <p className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">Protected Study Material</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <a 
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all border border-white/20 flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span className="text-[0.6rem] font-bold uppercase tracking-wider">Open in new tab if preview fails</span>
                        </a>
                        <button 
                            onClick={onClose}
                            className="bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white p-3 rounded-xl transition-all border border-rose-500/20 active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-6 lg:p-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center -z-10">
                        <div className="flex flex-col items-center opacity-50">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-4" />
                            <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-400">Loading Document Stream</p>
                        </div>
                    </div>
                    <iframe 
                        src={embedUrl}
                        className="w-full h-full rounded-[2rem] bg-white shadow-2xl border border-white/10"
                        allow="autoplay"
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

const ModelList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const sub = data.subjects[name as string];
    const [viewer, setViewer] = useState<{ isOpen: boolean; url: string; title: string, docxUrl?: string }>({ isOpen: false, url: '', title: '' });
    const [selectionModal, setSelectionModal] = useState<any>(null);

    const dynamicModels = liveMaterials.filter(m => m.subject === name && m.type === 'model_question');
    const allModels = [...(sub?.modelQuestions || []), ...dynamicModels];

    return (
        <div className="space-y-6 animate-fade-up pb-24 text-[#020617]">
             <StudyPdfViewer 
                isOpen={viewer.isOpen} 
                onClose={() => setViewer({ ...viewer, isOpen: false })} 
                url={viewer.url} 
                title={viewer.title} 
            />
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 active:scale-95 transition-all z-20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800">Model Set Vault</h1>
            </div>

            <div className="grid grid-cols-1 gap-5">
                {allModels.length > 0 ? allModels.map((m: any, i: number) => (
                    <div 
                        key={`${m.id}-${i}`} 
                        className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-2xl hover:border-indigo-500 transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-20 h-20 rotate-12" />
                        </div>

                        <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex flex-col items-center justify-center shrink-0 border border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <ClipboardCheck className="w-8 h-8" />
                            <span className="text-[0.4rem] font-black uppercase mt-1">SET</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[0.5rem] font-black uppercase tracking-widest">Board Standard</span>
                            </div>
                            <h3 className="font-black text-slate-800 text-lg leading-tight uppercase truncate group-hover:text-indigo-600 transition-colors">{m.title || m.q || 'Model Question Set'}</h3>
                            <p className="text-[0.6rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Blueprint 2083 • Aadhar Certified</p>
                        </div>

                        <div className="flex items-center gap-2 relative z-10">
                            <DownloadOptionsDropdown 
                                pdfUrl={(m.url || m.file_url || m.link_url) !== '#' ? (m.url || m.file_url || m.link_url) : undefined}
                                docxUrl={m.file_url_docx}
                                fileName={m.title || m.q || 'Model Set'}
                            />
                            <button 
                                onClick={() => {
                                    const pdf = m.file_url || m.url || m.link_url || '#';
                                    if (pdf !== '#') setViewer({ isOpen: true, url: pdf, title: m.title || m.q || 'Model Set' });
                                }} 
                                className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center active:scale-90 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                            >
                                <Eye className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
                        <Edit3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h2 className="text-xl font-black text-slate-800 uppercase">Bank Empty</h2>
                        <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Model sets are being developed.</p>
                    </div>
                )}
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
            // Raw Google Drive download link - we'll wrap it in a proxy during fetch for better control
            return `https://drive.google.com/uc?export=download&id=${match[1]}&t=${Date.now()}`;
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

const BookViewer = ({ isOpen, onClose, url, title, docxUrl }: { isOpen: boolean; onClose: () => void; url: string; title: string; docxUrl?: string }) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [loadError, setLoadError] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoadError(false);
    };

    const directUrl = getDirectPdfUrl(url);
    const previewUrl = getPreviewUrl(url);

    // High-Speed Data Streaming & Real-time Progress Tracking
    useEffect(() => {
        if (!isOpen || !url) return;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const fetchPdf = async () => {
            setDownloadProgress(0);
            setLoadError(false);
            setPdfData(null);

            try {
                // Using corsproxy.io as the primary node - it's generally more stable for GDrive redirects
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(directUrl)}`;
                const response = await fetch(proxyUrl, { signal: controller.signal });
                
                if (!response.ok) throw new Error('CORS Handshake Rejected');
                
                const contentLength = response.headers.get('content-length');
                const total = contentLength ? parseInt(contentLength, 10) : 0;
                
                const reader = response.body?.getReader();
                if (!reader) throw new Error('Data Stream Unreadable');
                
                let loaded = 0;
                const chunks = [];
                
                while(true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    loaded += value.length;
                    
                    if (total) {
                        setDownloadProgress(Math.floor((loaded / total) * 100));
                    } else {
                        setDownloadProgress(p => Math.min(p + 1, 99));
                    }
                }
                
                const blob = new Blob(chunks, { type: 'application/pdf' });
                const arrayBuffer = await blob.arrayBuffer();
                setPdfData(new Uint8Array(arrayBuffer));
                setDownloadProgress(100);
            } catch (err) {
                console.warn("Switching to Cloud Relay Mode:", err);
                // On failure, we don't treat it as "Broken" but as "Switching mode"
                setLoadError(true);
            } finally {
                clearTimeout(timeoutId);
            }
        };
        
        fetchPdf();
        return () => controller.abort();
    }, [isOpen, directUrl, url]);

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
                            {pdfData ? <Book className="w-5 h-5 md:w-6 md:h-6" /> : <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[0.8rem] md:text-lg font-black text-slate-800 uppercase tracking-tighter truncate max-w-[150px] md:max-w-2xl italic leading-tight">{title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${pdfData ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                <p className="text-[0.5rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                                    {pdfData ? `${numPages} Frames Online` : `Synchronizing: ${downloadProgress}%`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative">
                            <button 
                                onClick={() => docxUrl ? setShowDownloadOptions(!showDownloadOptions) : window.open(url, '_blank')}
                                className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                            >
                                <Download className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                            
                            {showDownloadOptions && docxUrl && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[130] animate-fade-down">
                                    <button 
                                        onClick={() => { window.open(url, '_blank'); setShowDownloadOptions(false); }}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3"
                                    >
                                        <FileText className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs font-black uppercase text-slate-700">PDF Version</span>
                                    </button>
                                    <a 
                                        href={docxUrl}
                                        download
                                        onClick={() => setShowDownloadOptions(false)}
                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 no-underline"
                                    >
                                        <FileCode className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs font-black uppercase text-slate-700">Word Version</span>
                                    </a>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100 active:scale-95 group shadow-sm"
                        >
                            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Vertical Scroll Viewer Shell */}
                <div className="flex-1 relative overflow-y-auto overflow-x-hidden bg-slate-50 flex flex-col items-center py-6 md:py-16 scroll-smooth custom-scrollbar">
                    {loadError ? (
                        <div className="w-full h-full max-w-5xl px-4 md:px-10 relative z-10">
                            <iframe 
                                src={previewUrl} 
                                className="w-full h-[88vh] rounded-3xl shadow-2xl border-none bg-white"
                                title="Fallback Data Stream"
                            />
                        </div>
                    ) : ( pdfData ? (
                        <Document
                            file={pdfData as any}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={() => setLoadError(true)}
                            className="flex flex-col items-center gap-6 md:gap-12 w-full"
                        >
                            {numPages && Array.from(new Array(numPages), (_, index) => (
                                <motion.div
                                    key={`page_${index + 1}`}
                                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ margin: "150px 0px", once: true }}
                                    className="relative px-3 md:px-6 w-full flex flex-col items-center"
                                >
                                    <div className="relative group max-w-full">
                                        <Page 
                                            pageNumber={index + 1} 
                                            width={Math.min(window.innerWidth * 0.94, index === 0 ? 900 : 850)}
                                            renderAnnotationLayer={false}
                                            renderTextLayer={false}
                                            className="shadow-[0_15px_45px_rgba(30,41,59,0.06)] md:shadow-[0_50px_100px_rgba(30,41,59,0.1)] rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/60 bg-white"
                                            loading={
                                                <div className="bg-white/80 rounded-2xl md:rounded-[2.5rem] h-[550px] md:h-[1100px] w-full max-w-[850px] flex items-center justify-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full border-2 border-indigo-50 border-t-indigo-500 animate-spin" />
                                                        <span className="text-[0.5rem] font-black text-slate-300 uppercase tracking-widest">Decoding Node</span>
                                                    </div>
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
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-10 gap-12">
                            <div className="relative">
                                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-[3px] border-slate-100 flex items-center justify-center">
                                    <motion.div
                                        animate={{ 
                                            rotate: 360, 
                                            borderColor: ['#6366f1', '#a855f7', '#ec4899', '#6366f1']
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-t-[3px] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                    />
                                    <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-indigo-500/80 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="w-full max-w-xs space-y-5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse italic">Hyper-Sync Active</span>
                                    <span className="text-[0.55rem] font-bold text-indigo-500 uppercase tracking-widest">{downloadProgress}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                                    <motion.div 
                                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${downloadProgress}%` }}
                                        transition={{ type: "spring", stiffness: 50, damping: 20 }}
                                    />
                                </div>
                                <p className="text-center text-[0.5rem] font-bold text-slate-300 uppercase tracking-[0.3em] font-mono">Streaming digital assets from encrypted node...</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

/** ── BOOK ILLUSTRATION COMPONENT ── */
const IsometricBook = ({ color, subject }: { color: string; subject: string }) => {
    const coverColors: Record<string, { top: string; front: string; side: string }> = {
        blue: { top: '#3b82f6', front: '#2563eb', side: '#1d4ed8' },
        purple: { top: '#a855f7', front: '#9333ea', side: '#7e22ce' },
        red: { top: '#f43f5e', front: '#e11d48', side: '#be123c' },
        emerald: { top: '#10b981', front: '#059669', side: '#047857' },
        amber: { top: '#f59e0b', front: '#d97706', side: '#b45309' },
        indigo: { top: '#6366f1', front: '#4f46e5', side: '#4338ca' },
        orange: { top: '#f97316', front: '#ea580c', side: '#c2410c' },
        cyan: { top: '#06b6d4', front: '#0891b2', side: '#0e7490' },
        rose: { top: '#f43f5e', front: '#e11d48', side: '#be123c' },
    };

    const c = coverColors[color] || coverColors.blue;

    return (
        <div className="relative w-32 h-40 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2">
            <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
                <path d="M40 80 L160 130 L160 210 L40 160 Z" fill="#F8FAFC" />
                <path d="M160 130 L190 110 L190 190 L160 210 Z" fill="#E2E8F0" />
                <path d="M30 75 L150 125 L185 105 L65 55 Z" fill={c.top} />
                <path d="M30 75 L30 85 L150 135 L150 125 Z" fill={c.side} />
                <path d="M150 135 L185 115 L185 105 L150 125 Z" fill={c.front} />
                <path d="M50 78 L140 115" stroke="white" strokeWidth="2" strokeOpacity="0.2" />
                <text x="75" y="95" transform="rotate(22, 75, 95)" fill="white" className="text-[14px] font-black uppercase tracking-tighter opacity-80">
                    {subject.slice(0, 10)}
                </text>
            </svg>
        </div>
    );
};

const DigitalTextbookList = () => {
    const { name } = useParams();
    const { data, liveMaterials } = useApp();
    const navigate = useNavigate();
    const [viewer, setViewer] = useState<{ isOpen: boolean; url: string; title: string }>({ isOpen: false, url: '', title: '' });
    const [selectionModal, setSelectionModal] = useState<any>(null);

    const staticLink = BOOK_LINKS[name as string];
    const dynamicBooks = liveMaterials.filter(m => m.subject === name && m.type === 'textbook' || m.type === 'digital_textbook');
    const config = SUBJECTS_CONFIG[name as SubjectType] || SUBJECTS_CONFIG['English'];
    const brand = getBrandColors(config.color);

    const renderBookCard = (url: string, title: string, isOfficial: boolean, docxUrl?: string) => {
        const Icon = config.icon;
        return (
            <div 
                key={url} 
                className={cn(
                    "p-4 rounded-[2rem] border border-slate-100 flex items-center gap-4 group transition-all active:scale-[0.98]",
                    brand.paleBg,
                    brand.shadow,
                    "shadow-sm hover:shadow-lg hover:border-slate-200"
                )}
            >
                <div className={cn("w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md group-hover:rotate-6 transition-all text-white border-4 border-white/20", brand.solidBg)}>
                    <Icon className="w-7 h-7 mb-0.5" />
                    <div className="bg-white/20 px-1.5 py-0.5 rounded-sm text-center">
                        <span className="text-[0.4rem] font-black uppercase tracking-[0.2em]" style={{ fontFamily: 'monospace' }}>BOOK</span>
                    </div>
                </div>
                
                <div className="flex-1 min-w-0 px-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("px-2 py-0.5 rounded-md bg-white text-[0.55rem] font-black uppercase tracking-widest shadow-xs", isOfficial ? brand.text : "text-slate-400")}>
                            {isOfficial ? 'Council Ed.' : 'Ref Node'}
                        </span>
                        {isOfficial && <Zap className="w-3 h-3 text-amber-500 fill-current" />}
                    </div>
                    <h3 className="font-black text-slate-900 text-base leading-tight uppercase italic truncate">{title}</h3>
                    <p className="text-[0.55rem] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Grade 10 • {name}</p>
                </div>
    
                <div className="flex items-center gap-2">
                    {docxUrl && (
                        <a 
                            href={docxUrl}
                            download
                            className="w-10 h-10 bg-white text-indigo-500 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-slate-100 hover:bg-slate-900 hover:text-white shadow-xs"
                        >
                            <FileCode className="w-4 h-4" />
                        </a>
                    )}
                     <button 
                        onClick={() => {
                            setViewer({ isOpen: true, url, title });
                        }}
                        className="w-10 h-10 bg-white text-slate-400 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-slate-100 hover:bg-slate-900 hover:text-white shadow-xs"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <a 
                        href={url} 
                        download 
                        target="_blank" 
                        className={cn("w-10 h-10 text-white rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-md", brand.solidBg)}
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[1001] bg-[#F8FAFC] flex flex-col overflow-y-auto animate-fade-up">
            <div className="w-full max-w-2xl mx-auto px-4 py-8 md:py-12">
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-slate-800 leading-tight">{name} Library</h1>
                        <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Official Resource Archive • Grade X</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {staticLink && renderBookCard(staticLink, `${name} Official Textbook`, true)}
                    {dynamicBooks.map((b: any) => renderBookCard(b.file_url || b.link_url, b.title, false))}
                    
                    {(!staticLink && dynamicBooks.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-24 opacity-20">
                            <Library className="w-16 h-16 text-slate-300 stroke-[1]" />
                            <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] mt-6 text-center">Library Empty</p>
                        </div>
                    )}
                </div>
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





const TranslatorPage_old = () => {
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
            const systemInstruction = `You are a professional translator for Nepalese students. Provide only the translation, no extra chatter.`;
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
            TEXT: "${text}"`;

            const result = await getAIResponse('miso', prompt, systemInstruction);
            setTranslated(result || "Translation failed.");
        } catch (e) {
            console.error(e);
            setTranslated("Error: Could not connect to translation engine.");
        } finally {
            setLoading(false);
        }
    };

    const swapLangs = () => {
        const oldSource = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(oldSource);
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
        utterance.lang = lang === 'English' ? 'en-US' : 'ne-NP';
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="fixed inset-0 pb-24 bg-slate-50 z-[1001] flex flex-col items-center animate-fade-up overflow-y-auto">
            <div className="w-full max-w-[800px] px-6 py-6">
                <ToolHeader title="AI Translator" subtitle="Linguistic Precision V.2" icon={Languages} />
            </div>

            <div className="w-full max-w-[800px] relative z-20 px-6 mt-[-20px] space-y-6">
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

const COLOR_CYCLE = [
    'bg-blue-600', 'bg-rose-600', 'bg-amber-500', 'bg-emerald-600', 
    'bg-indigo-600', 'bg-violet-600', 'bg-orange-500', 'bg-pink-600', 
    'bg-teal-600', 'bg-cyan-600', 'bg-red-600', 'bg-fuchsia-600', 
    'bg-lime-600', 'bg-sky-600', 'bg-yellow-500'
];

const TEXT_COLOR_CYCLE = [
    'text-blue-600', 'text-rose-600', 'text-amber-500', 'text-emerald-600', 
    'text-indigo-600', 'text-violet-600', 'text-orange-500', 'text-pink-600', 
    'text-teal-600', 'text-cyan-600', 'text-red-600', 'text-fuchsia-600', 
    'text-lime-600', 'text-sky-600', 'text-yellow-500'
];

const DictionaryPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [colorIdx, setColorIdx] = useState(0);

    const currentColor = COLOR_CYCLE[colorIdx % COLOR_CYCLE.length];
    const currentText = TEXT_COLOR_CYCLE[colorIdx % TEXT_COLOR_CYCLE.length];

    const speakWord = (text: string, rate = 0.9) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const searchWord = async (word: string) => {
        if (!word) return;
        setLoading(true);
        setError("");

        const cleanWord = word.trim().toLowerCase();

        try {
            const systemInstruction = `You are a world-class educational dictionary. Provide detailed info for: "${cleanWord}".
            Return strictly JSON. 
            SCHEMA: { 
                "word": string, 
                "phonetic": string, 
                "partOfSpeech": string, 
                "meaning": string, 
                "examples": string[], 
                "synonyms": string[], 
                "antonyms": string[], 
                "usageTip": string, 
                "didYouKnow": string,
                "wordBuilder": { "noun": string, "verb": string, "adjective": string },
                "relatedWords": string[]
            }`;

            const response = await getAIJSONResponse(systemInstruction, word);
            setResult(response);
            setColorIdx(prev => prev + 1);
        } catch (err) {
            console.error("Dictionary error:", err);
            setError("Failed to fetch dictionary data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("min-h-screen bg-slate-50 flex flex-col items-center pt-2 md:pt-4 pb-32 transition-all duration-700", loading && "blur-sm opacity-60")}>
            {/* Header Area */}
            <div className="w-full max-w-6xl px-4 py-3 md:py-6 flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-4 leading-tight">
                    <button onClick={() => navigate(-1)} className="w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"><ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1 md:gap-2">
                             <h1 className="text-lg md:text-2xl font-black text-slate-800 italic tracking-tight truncate">English Dictionary</h1>
                             <button className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[0.45rem] md:text-[0.6rem] font-black uppercase tracking-tighter shrink-0">
                                <GraduationCap className="w-2.5 md:w-3.5 h-2.5 md:h-3.5" /> PRO
                             </button>
                        </div>
                        <p className={cn("text-[0.5rem] md:text-[0.65rem] font-bold uppercase tracking-widest mt-0 md:mt-0.5 truncate transition-colors", currentText)}>Learn words. Boost your world.</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 md:gap-3">
                    <button className={cn("w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90", currentText)}><Clock className="w-4 h-4 md:w-5 md:h-5" /></button>
                    <button className={cn("w-8 h-8 md:w-11 md:h-11 bg-white rounded-lg md:rounded-xl flex items-center justify-center shadow-sm border border-slate-100 transition-all active:scale-90", currentText)}><Bookmark className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>
            </div>

            {/* Search Section */}
            <div className="w-full max-w-6xl px-4 py-1.5 flex items-center gap-1.5 md:gap-4 mb-3 md:mb-6">
                <div className="flex-1 bg-white rounded-xl md:rounded-[2rem] h-10 md:h-16 px-3 md:px-6 flex items-center gap-2 md:gap-4 shadow-lg border border-slate-100 group focus-within:ring-4 focus-within:ring-slate-100 transition-all">
                    <Search className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-focus-within:text-slate-500" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchWord(query)}
                        placeholder="Search a word..."
                        className="flex-1 text-xs md:text-lg font-bold text-slate-800 outline-none placeholder:text-slate-300"
                    />
                    <div className="flex items-center gap-1.5 md:gap-3 border-l border-slate-100 pl-1.5 md:pl-4">
                        <button className={cn("hover:scale-110 transition-all p-1", currentText)}><Mic className="w-3.5 h-3.5 md:w-5 md:h-5" /></button>
                        <button className={cn("hover:scale-110 transition-all p-1", currentText)}><Camera className="w-3.5 h-3.5 md:w-5 md:h-5" /></button>
                    </div>
                </div>
                <button 
                    onClick={() => searchWord(query)}
                    disabled={loading}
                    className={cn("h-10 md:h-16 w-10 md:w-16 flex items-center justify-center text-white rounded-xl md:rounded-[2rem] font-black shadow-xl active:scale-95 transition-all disabled:opacity-50", currentColor)}
                >
                    {loading ? <RotateCcw className="w-3.5 h-3.5 md:w-5 md:h-5 animate-spin" /> : <Search className="w-4 h-4 md:w-6 md:h-6" />}
                </button>
            </div>

            <div className="w-full max-w-6xl px-4 space-y-4 md:space-y-6">
                {/* Feature Cards - 4 cards */}
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {[
                        { label: 'Word Game', icon: Gamepad2, color: 'bg-indigo-50 text-indigo-600' },
                        { label: 'Day Word', icon: Star, color: 'bg-blue-50 text-blue-600' },
                        { label: 'My Words', icon: LayoutList, color: 'bg-orange-50 text-orange-600' },
                        { label: 'Puzzles', icon: Puzzle, color: 'bg-emerald-50 text-emerald-600' }
                    ].map((card, i) => (
                        <div key={i} className={cn(card.color, "p-2 md:p-5 rounded-xl md:rounded-3xl flex flex-col items-center text-center gap-1 shadow-sm border border-transparent hover:border-white transition-all cursor-pointer group active:scale-95")}>
                            <div className="w-7 h-7 md:w-11 md:h-11 rounded-lg md:rounded-2xl bg-white flex items-center justify-center mb-1 group-hover:scale-110 transition-transform shadow-sm">
                                <card.icon className="w-4 h-4 md:w-6 md:h-6" />
                            </div>
                            <h4 className="text-[0.45rem] md:text-[0.7rem] font-black uppercase tracking-tight line-clamp-1">{card.label}</h4>
                        </div>
                    ))}
                </div>

                {/* Animated Pre-Search Cards */}
                {!result && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
                        <motion.div 
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                                <Quote className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-black text-slate-800 italic leading-tight">
                                "The only limit to our realization of tomorrow will be our doubts of today."
                            </h3>
                            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">— Franklin D. Roosevelt</p>
                        </motion.div>

                        <motion.div 
                            animate={{ x: [0, -10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-gradient-to-tr from-purple-600 to-indigo-700 p-6 md:p-10 rounded-[2.5rem] shadow-xl text-white flex flex-col gap-4 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-15 rotate-12">
                                <Trophy className="w-full h-full" />
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg md:text-2xl font-black italic leading-tight">
                                Challenge yourself with our brand new vibrant MCQ Tests! Overhaul your test prep now.
                            </h3>
                            <div className="flex items-center gap-2 mt-auto">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-[0.6rem] font-black uppercase tracking-widest">Aadhar MCQs</span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Main Content Box (Word, Meaning, Example) */}
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="bg-white rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
                    >
                        {/* Box Header */}
                        <div className={cn("p-6 md:p-10 text-white relative overflow-hidden transition-colors duration-500", currentColor)}>
                            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 opacity-20 pointer-events-none">
                                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                <Book className="w-full h-full rotate-12 translate-x-1/4" />
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 md:gap-4 mb-2">
                                        <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter drop-shadow-lg">{result.word}</h2>
                                        <button 
                                            onClick={() => speakWord(result.word)} 
                                            className="w-10 h-10 md:w-14 md:h-14 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all shrink-0 active:scale-90 border border-white/20"
                                        >
                                            <Volume2 className="w-5 h-5 md:w-7 md:h-7" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/80 font-mono text-base md:text-xl">/{result.phonetic}/</span>
                                        <span className="px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-[0.6rem] md:text-xs font-black uppercase tracking-widest border border-white/20">{result.partOfSpeech}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Meaning & Example Area */}
                        <div className="p-6 md:p-10 space-y-6 md:space-y-8 bg-gradient-to-b from-white to-slate-50/30">
                            <div className="space-y-4">
                                <h3 className={cn("text-[0.6rem] md:text-xs font-black uppercase tracking-widest", currentText)}>Definition</h3>
                                <p className="text-lg md:text-2xl font-bold text-slate-800 leading-snug">{result.meaning}</p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] border border-slate-200/50 flex flex-col gap-3 shadow-sm relative overflow-hidden group">
                                <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60", currentColor)} />
                                <Quote className="absolute top-6 right-6 w-8 h-8 md:w-12 md:h-12 text-slate-100 group-hover:scale-110 transition-transform" />
                                <div className="pl-4 md:pl-6 space-y-4">
                                    <h5 className={cn("text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-widest opacity-80", currentText)}>Example Sentence</h5>
                                    <p className="text-sm md:text-xl font-bold text-slate-900 leading-relaxed italic relative z-10">
                                        "{result.examples?.[0] || `The ${result.word} process is highly engaging.`}"
                                    </p>
                                    <div className="flex items-center gap-2 relative z-10">
                                        <button onClick={() => speakWord(result.examples?.[0] || result.word)} className={cn("p-2 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all", currentText)}><Volume2 className="w-4 h-4" /></button>
                                        <span className="text-[0.55rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Speak Example</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Vertical Panels Stack */}
                {result && !loading && (
                    <div className="space-y-6 md:space-y-10">
                        {/* Synonyms & Antonyms */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                            >
                                <div className="bg-emerald-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><BookCopy className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">Synonyms</h3>
                                </div>
                                <div className="p-6 md:p-10 flex flex-wrap gap-2 md:gap-3">
                                    {result.synonyms?.slice(0, 8).map((s: string) => (
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            key={s} 
                                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[0.65rem] md:text-sm font-bold text-slate-600 uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-100 transition-colors"
                                        >
                                            {s}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                            >
                                <div className="bg-rose-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><ShieldAlert className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">Antonyms</h3>
                                </div>
                                <div className="p-6 md:p-10 flex flex-wrap gap-2 md:gap-3">
                                    {result.antonyms?.slice(0, 8).map((s: string) => (
                                        <motion.span 
                                            whileHover={{ scale: 1.05 }}
                                            key={s} 
                                            className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[0.65rem] md:text-sm font-bold text-slate-600 uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 transition-colors"
                                        >
                                            {s}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        {/* Usage & Did You Know */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                             <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                             >
                                <div className="bg-amber-500 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><Lightbulb className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">Did You Know?</h3>
                                </div>
                                <div className="p-8 md:p-12">
                                    <p className="text-base md:text-2xl text-slate-700 font-bold leading-relaxed italic">"{result.didYouKnow}"</p>
                                </div>
                             </motion.div>

                             <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 flex flex-col group"
                             >
                                <div className="bg-blue-600 p-5 md:p-7 flex items-center gap-4 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><Info className="w-5 h-5" /></div>
                                    <h3 className="text-base md:text-xl font-black italic uppercase tracking-tight relative z-10">Usage Tip</h3>
                                </div>
                                <div className="p-8 md:p-12">
                                    <p className="text-base md:text-2xl text-slate-700 font-bold leading-relaxed italic">"{result.usageTip}"</p>
                                </div>
                             </motion.div>
                        </div>

                        <div className="text-center pt-10">
                            <button onClick={() => navigate(-1)} className="px-8 py-4 bg-slate-900 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Back to Learning Hub</button>
                        </div>
                    </div>
                )}

                {(!result || error) && !loading && (
                    <div className="text-center py-20">
                         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                             <Search className="w-10 h-10" />
                         </div>
                         <h3 className="text-slate-800 font-black text-xl mb-2">Search for a word</h3>
                         <p className="text-slate-400 font-bold text-sm">Discover meanings, examples, and more.</p>
                         {error && <p className="text-rose-500 font-bold text-sm mt-4">{error}</p>}
                    </div>
                )}
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

    const defaultEvents: any[] = [];

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

    // Dynamic Nepali Date Calculation for 2083 BS
    const getTodayNepaliDate = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 3, 14); // Approx April 14 for 2083 BS
        startOfYear.setHours(0, 0, 0, 0);
        
        // Calculate days difference correctly ignoring time of day
        const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let daysLeft = Math.round((todayAtMidnight.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
            // Rough approximation for days before the start of the year
            return { month: 'Chaitra', day: 30 + daysLeft };
        }
        
        for (const m of months2083) {
            if (daysLeft < m.days) {
                return { month: m.name, day: daysLeft + 1 };
            }
            daysLeft -= m.days;
        }
        return { month: 'Chaitra', day: 30 };
    };

    const todayNepali = getTodayNepaliDate();
    const todayStr_dynamic = `${todayNepali.month} ${todayNepali.day}`;

    const [activeMonth, setActiveMonth] = useState(todayNepali.month);
    const [customTasks, setCustomTasks] = useState<{ id: string, title: string, date: string, type: 'exam' | 'deadline' | 'mock' | 'event' }[]>([]);
    
    // Initialize state with today's dynamically calculated date
    const [selectedDate, setSelectedDate] = useState<string | null>(todayStr_dynamic);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskType, setNewTaskType] = useState<'exam' | 'deadline' | 'mock' | 'event'>('event');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const local = localStorage.getItem('calendar_events_v3');
        if (local) {
            setCustomTasks(JSON.parse(local));
        } else {
            const oldLocal = localStorage.getItem('calendar_events_v2');
            if (oldLocal) {
                setCustomTasks(JSON.parse(oldLocal));
                localStorage.setItem('calendar_events_v3', oldLocal);
            }
        }
    }, []);

    const saveEvents = (events: any[]) => {
        setCustomTasks(events);
        localStorage.setItem('calendar_events_v3', JSON.stringify(events));
    };

    const activeMonthData = months2083.find(m => m.name === activeMonth)!;
    const allEvents = [...defaultEvents, ...customTasks];

    const typeColors: Record<string, { bg: string, text: string, border: string, dot: string, icon: any }> = {
        'deadline': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-500', icon: Clock },
        'mock': { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', dot: 'bg-indigo-500', icon: GraduationCap },
        'exam': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-500', icon: BookOpen },
        'event': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: Star }
    };

    const handlePrevMonth = () => {
        const idx = months2083.findIndex(m => m.name === activeMonth);
        if (idx > 0) setActiveMonth(months2083[idx - 1].name);
    };

    const handleNextMonth = () => {
        const idx = months2083.findIndex(m => m.name === activeMonth);
        if (idx < months2083.length - 1) setActiveMonth(months2083[idx + 1].name);
    };

    const handleAddTask = () => {
        if (newTaskTitle.trim() && selectedDate) {
            const newEvent = { id: 'evt_' + Date.now(), title: newTaskTitle, date: selectedDate, type: newTaskType };
            saveEvents([...customTasks, newEvent]);
            setNewTaskTitle('');
            setShowAddModal(false);
        }
    };

    const handleDeleteTask = (id: string) => {
        saveEvents(customTasks.filter(t => t.id !== id));
    };

    const selectedDateEvents = selectedDate ? allEvents.filter(e => e.date === selectedDate) : [];
    const todayStr = todayStr_dynamic;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative pb-32 overflow-hidden">
            {/* Header */}
            <header className="pt-6 pb-4 px-6 sticky top-0 bg-slate-50/90 backdrop-blur-md z-30 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 shadow-sm active:scale-95 transition-transform shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center flex-1 pr-10">
                    <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase italic flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-rose-500" /> Agenda
                    </h1>
                </div>
            </header>

            <div className="px-4 md:px-6 flex-1 flex flex-col pt-2 max-w-lg mx-auto w-full gap-5">
                
                {/* Calendar View */}
                <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={handlePrevMonth} 
                            disabled={activeMonth === months2083[0].name}
                            className="w-10 h-10 flex items-center justify-center rounded-[1rem] bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all active:scale-95 shrink-0 border border-slate-100"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <div className="relative flex-1 flex justify-center">
                            <select 
                                value={activeMonth}
                                onChange={(e) => setActiveMonth(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            >
                                {months2083.map(m => (
                                    <option key={m.name} value={m.name}>{m.name} 2083</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-1">
                                <span className="text-[1.3rem] font-black italic uppercase tracking-tighter text-slate-800 whitespace-nowrap">
                                    {activeMonth} <span className="opacity-40">2083</span>
                                </span>
                                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90 shrink-0" />
                            </div>
                        </div>

                        <button 
                            onClick={handleNextMonth} 
                            disabled={activeMonth === months2083[months2083.length - 1].name}
                            className="w-10 h-10 flex items-center justify-center rounded-[1rem] bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 transition-all active:scale-95 shrink-0 border border-slate-100"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className={cn("text-center font-black text-[0.65rem] py-2", i === 6 ? "text-rose-400" : "text-slate-400")}>
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {Array.from({ length: activeMonthData.offset }).map((_, i) => (
                            <div key={`offset-${i}`} className="opacity-0 pointer-events-none aspect-square" />
                        ))}
                        {Array.from({ length: activeMonthData.days }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `${activeMonth} ${dayNum}`;
                            const dayEvents = allEvents.filter(e => e.date === dateStr);
                            const isSelected = selectedDate === dateStr;
                            const isToday = todayStr === dateStr;
                            const isSat = (dayNum + activeMonthData.offset - 1) % 7 === 6;

                            return (
                                <button 
                                    key={i} 
                                    onClick={() => setSelectedDate(dateStr)}
                                    className={cn(
                                        "aspect-square rounded-[1rem] flex flex-col items-center justify-center relative transition-all group overflow-hidden border-2 outline-none",
                                        isSelected ? "bg-slate-900 text-white border-slate-900 scale-[1.05] shadow-lg z-10" : 
                                        isToday ? "bg-indigo-50 border-indigo-200 text-indigo-600" :
                                        "bg-transparent border-transparent hover:border-slate-100 text-slate-700",
                                        isSat && !isSelected && !isToday && "text-rose-500"
                                    )}
                                >
                                    <span className={cn("font-bold text-sm leading-none", isSelected ? "text-white" : "")}>{dayNum}</span>
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {dayEvents.slice(0, 3).map((e, idx) => (
                                                <div key={idx} className={cn("w-1 h-1 rounded-full border border-white/30", typeColors[e.type].dot)} />
                                            ))}
                                            {dayEvents.length > 3 && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Selected Day View */}
                <div className="flex flex-col flex-1 pb-10">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <div className="flex-1">
                            <h3 className="font-black text-xl text-slate-800 tracking-tight italic uppercase">
                                {selectedDate ? selectedDate : "Select a Date"}
                            </h3>
                            {selectedDate === todayStr && <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Today</p>}
                        </div>
                        {selectedDate && (
                            <button 
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-black uppercase text-[0.65rem] tracking-widest border border-indigo-100 flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" /> Log Event
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {selectedDate && selectedDateEvents.length > 0 ? (
                                selectedDateEvents.map(evt => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={evt.id}
                                        className={cn("p-4 rounded-[1.75rem] border relative group flex items-start gap-4 shadow-sm", typeColors[evt.type].bg, typeColors[evt.type].border)}
                                    >
                                        <div className={cn("w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 bg-white shadow-sm border border-black/5", typeColors[evt.type].text)}>
                                            {React.createElement(typeColors[evt.type].icon, { className: "w-5 h-5" })}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className={cn("text-[0.55rem] font-black uppercase tracking-widest mb-1", typeColors[evt.type].text)}>
                                                {evt.type}
                                            </p>
                                            <p className="font-bold text-slate-800 text-sm leading-snug pr-8">{evt.title}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteTask(evt.id)}
                                            className="w-10 h-10 rounded-[1rem] bg-white/60 text-rose-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-rose-100/50 hover:bg-rose-50 absolute right-2 top-1/2 -translate-y-1/2 active:scale-90"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-slate-400 bg-white rounded-[2rem] border border-slate-100 border-dashed">
                                    <Coffee className="w-10 h-10 opacity-20 mb-3" />
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Clear Agenda</p>
                                    <p className="text-[0.65rem] font-medium mt-1">No milestones on this date.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Quick Add FAB globally */}
            <div className="fixed bottom-6 right-6 z-40">
                 {selectedDate && (
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="w-16 h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-slate-900/30"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                 )}
            </div>

            {/* Add Event Bottom Sheet */}
            <AnimatePresence>
                {showAddModal && selectedDate && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] z-50 p-6 shadow-2xl flex flex-col max-h-[90vh] pb-8 max-w-2xl mx-auto"
                        >
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">New Milestone</h2>
                                <p className="text-[0.65rem] font-bold text-indigo-500 uppercase tracking-widest mt-1 bg-indigo-50 inline-block px-3 py-1 rounded-full">{selectedDate}</p>
                            </div>
                            
                            <div className="bg-slate-50 rounded-[2rem] p-3 border border-slate-100 mb-6 flex-1 overflow-y-auto w-full">
                                <div className="p-2 space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 pl-1">Event Title</label>
                                        <input 
                                            type="text" 
                                            autoFocus
                                            value={newTaskTitle}
                                            onChange={e => setNewTaskTitle(e.target.value)}
                                            placeholder="E.g., Science Final Prep"
                                            className="w-full bg-white border border-slate-200/60 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:border-indigo-400 transition-all placeholder:text-slate-300 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3 pt-2">
                                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 pl-1">Classification</label>
                                        <div className="flex flex-wrap gap-2">
                                            {(['exam', 'deadline', 'mock', 'event'] as const).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setNewTaskType(t)}
                                                    className={cn(
                                                        "flex-1 py-3.5 rounded-2xl text-[0.65rem] font-bold uppercase tracking-widest transition-all border flex items-center justify-center gap-2",
                                                        newTaskType === t ? typeColors[t].bg + " " + typeColors[t].border + " " + typeColors[t].text + " shadow-sm" : "bg-white border-slate-200/60 text-slate-500 hover:bg-slate-100"
                                                    )}
                                                >
                                                    {React.createElement(typeColors[t].icon, { className: "w-4 h-4" })}
                                                    <span className="hidden sm:inline">{t}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleAddTask}
                                disabled={!newTaskTitle.trim()}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[0.75rem] disabled:opacity-50 active:scale-95 transition-all mb-safe shadow-xl shadow-slate-900/20"
                            >
                                Schedule Event
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

import { TriangleFigure, RightTriangleFigure, CircleFigure, CylinderFigure, ConeFigure, SphereFigure, ParallelogramFigure, SetVennFigure } from './components/MathFigures';

const FormulaBankPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'subjects' | 'chapters' | 'formulas'>('subjects');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<any | null>(null);

    const subjects = [
        { 
            id: 'cmaths', 
            name: 'C. Maths', 
            icon: Calculator, 
            gradient: 'from-blue-400 to-indigo-500', 
            description: 'Core Mathematics',
            progress: 70,
            subIcons: [Percent, Hash, Box, Sigma],
            accentColor: 'text-indigo-600'
        },
        { 
            id: 'science', 
            name: 'Science', 
            icon: FlaskConical, 
            gradient: 'from-emerald-400 to-teal-500', 
            description: 'Physics & Chem',
            progress: 45,
            subIcons: [FlaskConical, Microscope, Zap, Wind],
            accentColor: 'text-teal-600'
        },
        { 
            id: 'omaths', 
            name: 'O. Maths', 
            icon: Sigma, 
            gradient: 'from-rose-400 to-pink-500', 
            description: 'Advanced Maths',
            progress: 90,
            subIcons: [Variable, Triangle, Move, Activity],
            accentColor: 'text-rose-600'
        },
        { 
            id: 'grammar', 
            name: 'English', 
            icon: Languages, 
            gradient: 'from-amber-400 to-orange-500', 
            description: 'Grammar Hub',
            progress: 20,
            subIcons: [BookOpen, PenTool, Languages, MessageSquareQuote],
            accentColor: 'text-orange-600'
        },
        { 
            id: 'byakaran', 
            name: 'Nepali', 
            icon: BookOpen, 
            gradient: 'from-purple-400 to-violet-500', 
            description: 'Byakaran',
            progress: 35,
            subIcons: [BookOpen, PenTool, ClipboardList, Languages],
            accentColor: 'text-violet-600'
        },
        { 
            id: 'account', 
            name: 'Account', 
            icon: ClipboardList, 
            gradient: 'from-cyan-400 to-blue-500', 
            description: 'Finance',
            progress: 60,
            subIcons: [Banknote, BarChart, Scale, Calculator],
            accentColor: 'text-blue-600'
        }
    ];

    const cmathsChapters = [
        { id: 'sets', title: 'Sets', icon: Box, color: 'blue' },
        { id: 'number', title: 'Number System', icon: Hash, color: 'slate' },
        { id: 'percent', title: 'Percentage', icon: Percent, color: 'sky' },
        { id: 'profit', title: 'Profit & Loss', icon: BadgePercent, color: 'rose' },
        { id: 'si', title: 'Simple Interest', icon: TrendingUp, color: 'emerald' },
        { id: 'compound', title: 'Compound Interest', icon: BarChart, color: 'indigo' },
        { id: 'ratio', title: 'Ratio & Prop.', icon: Scale, color: 'cyan' },
        { id: 'variation', title: 'Variation', icon: Zap, color: 'lime' },
        { id: 'money', title: 'Money Exchange', icon: Banknote, color: 'amber' },
        { id: 'algebra', title: 'Algebra', icon: Variable, color: 'purple' },
        { id: 'indices', title: 'Indices', icon: ArrowUpRight, color: 'orange' },
        { id: 'linear', title: 'Linear Eq.', icon: LineChart, color: 'blue' },
        { id: 'quadratic', title: 'Quadratic Eq.', icon: Activity, color: 'red' },
        { id: 'sequence', title: 'Sequence', icon: ListOrdered, color: 'teal' },
        { id: 'angles', title: 'Lines & Angles', icon: Move, color: 'slate' },
        { id: 'triangles', title: 'Triangles', icon: Triangle, color: 'indigo' }
    ];

    const omathsChapters = [
        { id: 'algebra_om', title: 'Algebra', icon: Variable, color: 'rose' },
        { id: 'limit', title: 'Limit & Cont.', icon: Activity, color: 'indigo' },
        { id: 'matrix', title: 'Matrices', icon: Grid3X3, color: 'purple' },
        { id: 'coord', title: 'Coordinate Geo.', icon: Move, color: 'emerald' },
        { id: 'trig', title: 'Trigonometry', icon: Triangle, color: 'orange' },
        { id: 'vectors', title: 'Vectors', icon: ArrowUpRight, color: 'blue' },
        { id: 'trans', title: 'Transformation', icon: Zap, color: 'cyan' },
        { id: 'stats_om', title: 'Statistics', icon: BarChart, color: 'slate' }
    ];

    const scienceChapters = [
        { id: 'force', title: 'Force', icon: Zap, color: 'emerald' },
        { id: 'pressure', title: 'Pressure', icon: Wind, color: 'blue' },
        { id: 'energy', title: 'Energy', icon: Flame, color: 'orange' },
        { id: 'heat', title: 'Heat', icon: Coffee, color: 'red' },
        { id: 'science_matter', title: 'Materials', icon: FlaskConical, color: 'purple' },
        { id: 'life_process', title: 'Life Process', icon: Dna, color: 'emerald' },
        { id: 'heredity', title: 'Heredity', icon: Microscope, color: 'teal' },
        { id: 'universe', title: 'The Universe', icon: Globe, color: 'slate' }
    ];

    const allFormulas: Record<string, any[]> = {
        'sets': [
            { title: 'Union of Two Sets', formula: 'n(A \\cup B) = n(A) + n(B) - n(A \\cap B)', figure: SetVennFigure, topic: 'Basic Operations' },
            { title: 'Three Sets Union', formula: 'n(A\\cup B\\cup C) = n(A)+n(B)+n(C) - n(A\\cap B) - n(B\\cap C) - n(A\\cap C) + n(A\\cap B\\cap C)', topic: 'Basic Operations' },
            { title: 'Complement of A', formula: 'n(A\') = n(U) - n(A)', topic: 'Set Identities' },
            { title: 'De Morgan\'s Law 1', formula: '(A \\cup B)\' = A\' \\cap B\'', topic: 'Set Identities' },
            { title: 'De Morgan\'s Law 2', formula: '(A \\cap B)\' = A\' \\cup B\'', topic: 'Set Identities' }
        ],
        'number': [
            { title: 'HCF and LCM', formula: 'HCF(a, b) \\times LCM(a, b) = a \\times b', description: 'The product of two numbers is equal to the product of their HCF and LCM.' },
            { title: 'Fractions', formula: '\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}', description: 'Simple multiplication of numerators and denominators.' },
            { title: 'Divisibility by 3', formula: '\\sum digits \\div 3', description: 'Sum of digits must be divisible by 3.' },
            { title: 'Divisibility by 9', formula: '\\sum digits \\div 9', description: 'Sum of digits must be divisible by 9.' }
        ],
        'percent': [
            { title: 'Percentage', formula: '\\text{Percentage} = \\frac{\\text{Part}}{\\text{Whole}} \\times 100' },
            { title: 'Percent Increase', formula: '\\% \\text{Increase} = \\frac{\\text{Increase}}{\\text{Original}} \\times 100' },
            { title: 'New Value after Inc.', formula: 'V = \\text{Original} \\times \\frac{100 + r}{100}' }
        ],
        'profit': [
            { title: 'Profit Amount', formula: '\\text{Profit} = SP - CP', description: 'When Selling Price is greater than Cost Price.' },
            { title: 'Loss Amount', formula: '\\text{Loss} = CP - SP', description: 'When Cost Price is greater than Selling Price.' },
            { title: 'Profit Percentage', formula: '\\text{Profit}\\% = \\frac{\\text{Profit}}{CP} \\times 100' },
            { title: 'VAT Amount', formula: '\\text{VAT} = SP \\times \\frac{\\text{VAT}\\%}{100}' }
        ],
        'si': [
            { title: 'Simple Interest', formula: 'SI = \\frac{P \\times T \\times R}{100}' },
            { title: 'Amount', formula: 'A = P + SI = P(1 + \\frac{TR}{100})' },
            { title: 'Rate of Interest', formula: 'R = \\frac{SI \\times 100}{P \\times T}' }
        ],
        'compound': [
            { title: 'Compound Amount', formula: 'CA = P(1 + \\frac{R}{100})^T', description: 'Yearly compounding.' },
            { title: 'Compound Interest', formula: 'CI = P\\left[(1 + \\frac{R}{100})^T - 1\\right]' },
            { title: 'Population Growth', formula: 'P_T = P_0(1 + \\frac{R}{100})^T' },
            { title: 'Depreciation', formula: 'V_T = V_0(1 - \\frac{R}{100})^T' }
        ],
        'ratio': [
            { title: 'Proportion', formula: 'a:b = c:d \\implies ad = bc', description: 'Product of Extremes = Product of Means.' },
            { title: 'Mean Proportion', formula: 'b = \\sqrt{ac}', description: 'If a:b = b:c, then b is mean proportion.' },
            { title: 'Componendo-Dividendo', formula: '\\frac{a+b}{a-b} = \\frac{c+d}{c-d}' }
        ],
        'variation': [
            { title: 'Direct Variation', formula: 'y = kx \\implies \\frac{y}{x} = k', description: 'Both increase or decrease proportionally.' },
            { title: 'Inverse Variation', formula: 'y = \\frac{k}{x} \\implies xy = k', description: 'One increases as the other decreases proportionally.' }
        ],
        'money': [
            { title: 'Currency Exchange', formula: '\\text{Foreign Amt} = \\frac{\\text{Local Amt}}{\\text{Exch Rate}}' },
            { title: 'Chain Rule', formula: 'a \\times \\frac{b}{a} \\times \\frac{c}{b} = c', description: 'Multi-currency conversion factor.' }
        ],
        'algebra': [
            { title: 'Square Identity (Sum)', formula: '(a + b)^2 = a^2 + 2ab + b^2', topic: 'Quadratic Identities' },
            { title: 'Square Identity (Diff)', formula: '(a - b)^2 = a^2 - 2ab + b^2', topic: 'Quadratic Identities' },
            { title: 'Difference of Squares', formula: 'a^2 - b^2 = (a-b)(a+b)', topic: 'Quadratic Identities' },
            { title: 'Cube Identity (Sum)', formula: '(a + b)^3 = a^3 + 3a^2b + 3ab^2 + b^3', topic: 'Cubic Identities' },
            { title: 'Sum of Cubes', formula: 'a^3 + b^3 = (a+b)(a^2 - ab + b^2)', topic: 'Cubic Identities' }
        ],
        'indices': [
            { title: 'Product Law', formula: 'a^m \\times a^n = a^{m+n}' },
            { title: 'Quotient Law', formula: '\\frac{a^m}{a^n} = a^{m-n}' },
            { title: 'Power Law', formula: '(a^m)^n = a^{mn}' },
            { title: 'Zero Power Law', formula: 'a^0 = 1' },
            { title: 'Negative Index', formula: 'a^{-n} = \\frac{1}{a^n}' }
        ],
        'linear': [
            { title: 'Simultaneous Eq.', formula: 'ax + by = c \\ \\& \\ dx + ey = f', description: 'Can be solved by elimination, substitution, or matrices.' },
            { title: 'Linear Relation', formula: 'y = mx + c', description: 'Equation of a straight line.' }
        ],
        'quadratic': [
            { title: 'Standard Form', formula: 'ax^2 + bx + c = 0' },
            { title: 'Quadratic Formula', formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
            { title: 'Discriminant', formula: 'D = b^2 - 4ac' },
            { title: 'Sum of Roots', formula: '\\alpha + \\beta = -b/a' },
            { title: 'Product of Roots', formula: '\\alpha\\beta = c/a' }
        ],
        'sequence': [
            { title: 'Arithmetic nth Term', formula: 't_n = a + (n-1)d' },
            { title: 'Arithmetic Sum', formula: 'S_n = \\frac{n}{2}[2a + (n-1)d]' },
            { title: 'Geometric nth Term', formula: 't_n = ar^{n-1}' },
            { title: 'Geometric Sum', formula: 'S_n = \\frac{a(r^n - 1)}{r - 1} \\ (r > 1)' }
        ],
        'angles': [
            { title: 'Straight Line Sum', formula: '\\angle a + \\angle b = 180^\\circ' },
            { title: 'Angles at a Point', formula: '\\sum \\angle = 360^\\circ' },
            { title: 'Complementary Angles', formula: '\\angle 1 + \\angle 2 = 90^\\circ' },
            { title: 'Supplementary Angles', formula: '\\angle 1 + \\angle 2 = 180^\\circ' }
        ],
        'triangles': [
            { title: 'Area of Triangle', formula: 'A = \\frac{1}{2} \\times b \\times h', figure: TriangleFigure },
            { title: 'Heron\'s Formula', formula: 'A = \\sqrt{s(s-a)(s-b)(s-c)}', figure: TriangleFigure },
            { title: 'Pythagoras Theorem', formula: 'h^2 = p^2 + b^2', figure: RightTriangleFigure },
            { title: 'Similar Triangles', formula: '\\frac{A_1}{A_2} = (\\frac{s_1}{s_2})^2', description: 'Ratio of areas equals ratio of squares of sides.' }
        ],
        'algebra_om': [
            { title: 'Partial Fractions', formula: '\\frac{px+q}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}' },
            { title: 'Polynomial Division', formula: 'P(x) = Q(x)D(x) + R(x)' }
        ],
        'limit': [
            { title: 'Standard Limit', formula: '\\lim_{x \\to a} \\frac{x^n - a^n}{x - a} = na^{n-1}' }
        ],
        'matrix': [
            { title: 'Determinant (2x2)', formula: '|A| = ad - bc' },
            { title: 'Inverse Matrix', formula: 'A^{-1} = \\frac{1}{|A|} \\text{adj } A' }
        ],
        'trig': [
            { title: 'Compound Angles', formula: '\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B' },
            { title: 'Multiple Angles', formula: '\\cos 2A = \\cos^2 A - \\sin^2 A' }
        ],
        'force': [
            { title: 'Newton\'s Law of Gravitation', formula: 'F = G \\frac{m_1 m_2}{d^2}' },
            { title: 'Acceleration due to Gravity', formula: 'g = \\frac{GM}{R^2}' }
        ],
        'pressure': [
            { title: 'Liquid Pressure', formula: 'P = h \\rho g', description: 'Pressure depends on depth, density, and gravity.' },
            { title: 'Pascal\'s Law', formula: '\\frac{F_1}{A_1} = \\frac{F_2}{A_2}' }
        ]
    };

    const handleSubjectClick = (sub: any) => {
        if (sub.id === 'cmaths') {
            setSelectedSubject(sub.name);
            setView('chapters');
        } else {
            // Placeholder for other subjects
            setSelectedSubject(sub.name);
            setView('chapters');
        }
    };

    const handleChapterClick = (chapter: any) => {
        setSelectedChapter(chapter);
        setView('formulas');
    };

    const goBack = () => {
        if (view === 'formulas') setView('chapters');
        else if (view === 'chapters') setView('subjects');
        else navigate('/tools');
    };

    return (
        <div className="space-y-8 animate-fade-up pb-24 min-h-screen">
            <ToolHeader 
                title={view === 'formulas' ? selectedChapter?.title : view === 'chapters' ? selectedSubject : "Formula Bank"} 
                subtitle={view === 'formulas' ? "Detailed Reference" : view === 'chapters' ? "Select a chapter" : "Choose a subject to begin"} 
                icon={Sigma} 
                onBack={goBack}
            />

            {view === 'subjects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((sub, i) => (
                        <motion.button
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ 
                                delay: i * 0.05,
                                duration: 0.5,
                                ease: [0.23, 1, 0.32, 1]
                            }}
                            key={sub.id}
                            onClick={() => handleSubjectClick(sub)}
                            className={cn(
                                "group relative min-h-[220px] p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col justify-between overflow-hidden transition-all text-left"
                            )}
                        >
                            {/* Accent Background */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.12] transition-opacity rounded-full translate-x-1/3 -translate-y-1/3",
                                sub.gradient
                            )} />

                            <div className="flex gap-5 relative z-10">
                                <div className={cn(
                                    "w-14 h-14 bg-gradient-to-br rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-500",
                                    sub.gradient
                                )}>
                                    <sub.icon className="w-7 h-7" strokeWidth={2} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-tight italic">{sub.name}</h3>
                                    <p className="text-slate-400 font-bold text-[0.65rem] tracking-widest uppercase italic">{sub.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 w-full">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {sub.subIcons.map((Icon, idx) => (
                                        <div key={idx} className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 transition-all">
                                            <Icon className="w-4 h-4" />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-tighter italic">Progress</span>
                                        <span className={cn("text-sm font-black italic", sub.accentColor)}>{sub.progress}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sub.progress}%` }}
                                            transition={{ duration: 1, delay: 0.4 }}
                                            className={cn("h-full rounded-full bg-gradient-to-r shadow-sm", sub.gradient)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {view === 'chapters' && (
                <div className="space-y-4">
                    {(selectedSubject === 'C. Maths' ? cmathsChapters : 
                      selectedSubject === 'O. Maths' ? omathsChapters :
                      selectedSubject === 'Science' ? scienceChapters :
                      []).map((chapter, i) => {
                        const currentSub = subjects.find(s => s.name === selectedSubject);
                        const subGradient = currentSub?.gradient || 'from-slate-400 to-slate-600';
                        const subAccent = currentSub?.accentColor || 'text-slate-600';

                        return (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                whileTap={{ scale: 0.99 }}
                                transition={{ delay: i * 0.05 }}
                                key={chapter.id}
                                onClick={() => handleChapterClick(chapter)}
                                className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all text-left flex items-center gap-5 group relative overflow-hidden active:scale-[0.98]"
                            >
                                <div className={cn("absolute top-0 right-0 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rounded-full -mr-12 -mt-12 bg-current pointer-events-none", subAccent)} />
                                
                                <div className={cn(
                                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-black shadow-lg shrink-0 relative z-10 transition-transform group-hover:rotate-3 bg-gradient-to-br",
                                    subGradient
                                )}>
                                    <span className="text-[0.5rem] uppercase tracking-widest opacity-60 leading-none mb-0.5">Unit</span>
                                    <span className="text-xl leading-none italic">{String(i + 1).padStart(2, '0')}</span>
                                </div>

                                <div className="flex-1 min-w-0 relative z-10">
                                    <h4 className="text-lg font-black text-slate-800 tracking-tighter uppercase italic leading-tight truncate">
                                        {chapter.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest italic">Chapter {i + 1}</span>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className={cn("text-[0.6rem] font-bold uppercase tracking-widest italic", subAccent)}>Formulas Inside</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center w-10 h-10 bg-slate-50 rounded-xl text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shrink-0">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </motion.button>
                        );
                    })}
                    {(!['C. Maths', 'O. Maths', 'Science'].includes(selectedSubject || '')) && (
                         <div className="py-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100 border-dashed animate-fade-in">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <Construction className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Coming Soon!</h3>
                            <p className="text-slate-500 font-medium">Chapters for {selectedSubject} are currently being added.</p>
                        </div>
                    )}
                </div>
            )}

            {view === 'formulas' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {(() => {
                        const formulas = allFormulas[selectedChapter?.id] || [];
                        const grouped: Record<string, any[]> = {};
                        
                        formulas.forEach(f => {
                            const topic = f.topic || "General References";
                            if (!grouped[topic]) grouped[topic] = [];
                            grouped[topic].push(f);
                        });

                        return Object.entries(grouped).map(([topic, items], i) => (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ 
                                    delay: i * 0.1,
                                    duration: 0.6,
                                    ease: [0.23, 1, 0.32, 1]
                                }}
                                key={topic}
                                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_50px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col hover:shadow-[0_30px_80px_rgba(0,0,0,0.08)] transition-all duration-500"
                            >
                                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                        <h3 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">{topic}</h3>
                                    </div>
                                    <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider">{items.length} Units</span>
                                </div>
                                <div className="p-8 space-y-10">
                                    {items.map((f, idx) => (
                                        <div key={idx} className="space-y-4 group">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="space-y-1">
                                                    <h4 className="font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[0.6rem] flex items-center justify-center font-black group-hover:bg-indigo-500 group-hover:text-white transition-colors">{idx + 1}</span>
                                                        {f.title}
                                                    </h4>
                                                    {f.description && (
                                                        <p className="text-[0.65rem] font-bold text-slate-400 leading-relaxed max-w-md italic uppercase tracking-widest">{f.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="relative p-6 bg-slate-900 rounded-3xl shadow-inner group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-500 group-hover:-translate-y-1 overflow-x-auto scrollbar-hide">
                                                <div className="absolute top-0 right-0 p-3 flex gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                </div>
                                                <div className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                                    <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeRaw]}>
                                                        {`$$\n${f.formula}\n$$`}
                                                    </Markdown>
                                                </div>
                                            </div>

                                            {f.figure && (
                                                <div className="p-6 bg-slate-50/30 border border-slate-100 rounded-3xl flex justify-center items-center group-hover:bg-white transition-colors">
                                                    <f.figure className="w-full max-w-[180px] h-auto text-slate-500" />
                                                </div>
                                            )}
                                            
                                            {idx < items.length - 1 && <div className="h-px bg-slate-100 w-full pt-4" />}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ));
                    })()}
                    {(!allFormulas[selectedChapter?.id] || allFormulas[selectedChapter?.id].length === 0) && (
                        <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <Construction className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Coming Soon!</h3>
                            <p className="text-slate-500 font-medium">Formulas for this chapter are currently being added.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const VideoSectionPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('For You');
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeVideo, setActiveVideo] = useState<any | null>(null);

    const API_KEY = '55653734-9bcb53c51c27b0c301beab7dc';
    const DEFAULT_QUERY = 'education learning science student';

    const CATEGORIES = [
        { name: 'Science', icon: Microscope, color: 'bg-emerald-50 text-emerald-500', borderColor: 'border-emerald-100', query: 'science' },
        { name: 'Maths', icon: Sigma, color: 'bg-rose-50 text-rose-500', borderColor: 'border-rose-100', query: 'mathematics' },
        { name: 'Tech', icon: Monitor, color: 'bg-blue-50 text-blue-500', borderColor: 'border-blue-100', query: 'technology' },
        { name: 'Nature', icon: Leaf, color: 'bg-orange-50 text-orange-500', borderColor: 'border-orange-100', query: 'nature' },
    ];

    const TABS = ['For You', 'Trending', 'New', 'Collection'];

    const fetchVideos = async (searchQuery: string, pageNum: number, category: string, isNewSearch: boolean = false) => {
        if (!window.navigator.onLine) {
            setLoading(false); setLoadingMore(false); return;
        }
        if (isNewSearch) { setLoading(true); setVideos([]); } 
        else { setLoadingMore(true); }
        
        try {
            let currentQ = searchQuery.trim();
            const pixabayCategory = (!category || category === 'All') ? '' : category.toLowerCase();
            
            const res = await fetch(`https://pixabay.com/api/videos/?key=${API_KEY}&q=${encodeURIComponent(currentQ || pixabayCategory || DEFAULT_QUERY)}&per_page=30&page=${pageNum}&safesearch=true`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                setVideos(prev => isNewSearch ? data.hits : [...prev, ...data.hits]);
                setHasMore(data.hits.length === 30);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch videos", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchVideos('', 1, 'All', true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setHasMore(true);
        fetchVideos(query, 1, activeCategory, true);
    };

    const handleCategoryClick = (catName: string) => {
        const newCat = activeCategory === catName ? 'All' : catName;
        setActiveCategory(newCat);
        setPage(1);
        setHasMore(true);
        fetchVideos(query, 1, newCat, true);
    };

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchVideos(query, nextPage, activeCategory, false);
        }
    }, [loadingMore, hasMore, page, query, activeCategory]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) loadMore();
        }, { threshold: 0.1 });
        const sentinel = document.getElementById('sentinel-videos');
        if (sentinel) observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMore]);

    return (
        <div className="min-h-screen bg-[#FDFDFF] pb-32">
            {/* Header */}
            <header className="p-2 pt-4 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0 pr-2">
                        <h1 className="text-lg font-black text-slate-800 tracking-tight italic uppercase whitespace-nowrap overflow-hidden text-ellipsis">Video Library</h1>
                        <p className="text-blue-500 font-bold text-[0.5rem] tracking-widest uppercase truncate">Visual learnings for everyone. 🎥</p>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-2 mb-4 flex gap-2">
                <form onSubmit={handleSearch} className="flex-1 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center px-3 relative group transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-300 mr-2" />
                    <input 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search videos..."
                        className="w-full bg-transparent py-2.5 text-[0.7rem] font-bold text-slate-700 placeholder:text-slate-300 outline-none"
                    />
                </form>
                <button 
                    onClick={handleSearch}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>

            {/* Categories */}
            <div className="px-2 mb-6 grid grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                            activeCategory === cat.name 
                                ? "bg-white shadow-md border-slate-200" 
                                : cn(cat.color, cat.borderColor)
                        )}
                    >
                        <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shadow-sm bg-white",
                        )}>
                            <cat.icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-black text-[0.5rem] uppercase tracking-widest text-center truncate w-full">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tabs Header */}
            <div className="px-1 flex items-center justify-between border-b border-slate-100 mb-4 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                <div className="flex gap-4 px-2">
                    {TABS.slice(0, 2).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-3 text-[0.6rem] font-black uppercase tracking-widest italic transition-all relative px-1",
                                activeTab === tab ? "text-slate-900" : "text-slate-400"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="vid-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 px-2 mb-2">
                    <button className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[0.5rem] font-bold text-slate-600">
                        More <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="px-1.5">
                {loading && videos.length === 0 ? (
                    <div className="w-full py-32 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-[0.6rem] uppercase tracking-[0.2em] animate-pulse italic">Scanning library...</p>
                    </div>
                ) : (
                    <div className="columns-2 lg:columns-4 gap-1.5 space-y-1.5 px-1">
                        {videos.map(video => (
                                <motion.div 
                                    key={video.id} 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="break-inside-avoid group relative rounded-xl overflow-hidden cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-300 bg-white" 
                                    onClick={() => setActiveVideo(video)}
                                >
                                    <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                                        <img 
                                            src={video.picture_id ? `https://i.vimeocdn.com/video/${video.picture_id}_640x360.jpg` : `https://images.pixabay.com/video/thumbnail/${video.id}_640x360.jpg`} 
                                            alt={video.tags} 
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" 
                                            loading="lazy"
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                // Fallback sequence for video thumbnails
                                                if (target.src.includes('vimeocdn')) {
                                                    // Fallback 1: Pixabay CDN with ID
                                                    target.src = `https://cdn.pixabay.com/video/thumbnail/${video.id}_640x360.jpg`;
                                                } else if (target.src.includes('cdn.pixabay.com')) {
                                                    // Fallback 2: Direct thumb path
                                                    target.src = `https://i.pixabay.com/video/${video.id}/thumb.jpg`;
                                                } else if (!target.src.includes('images.pixabay.com')) {
                                                     // Fallback 3: Standard image thumb
                                                    target.src = `https://images.pixabay.com/video/thumbnail/${video.id}_640x360.jpg`;
                                                } else {
                                                    // Ultimate fallback: LoremFlickr with topic-relevant keyword
                                                    const tag = video.tags.split(',')[0] || 'education';
                                                    target.src = `https://loremflickr.com/640/360/${encodeURIComponent(tag)}?lock=${video.id}`;
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-white font-bold text-[0.65rem] truncate">{video.tags.split(',')[0]}</p>
                                        </div>
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[0.5rem] font-black px-1.5 py-0.5 rounded-lg z-10 uppercase tracking-widest">
                                            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {hasMore && videos.length > 0 && (
                <div id="sentinel-videos" className="h-40 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            )}

            <AnimatePresence>
                {activeVideo && (
                    <ImageVideoModal 
                        item={activeVideo} 
                        type="video" 
                        onClose={() => setActiveVideo(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const [activeFormats, setActiveFormats] = useState<Record<string, any>>({});

    const applyFormat = (command: string, value?: string) => {
        if (!editorRef.current) return;
        document.execCommand(command, false, value);
        onChange(editorRef.current.innerHTML);
        editorRef.current.focus();

        // Update active states
        const newActiveFormats = { ...activeFormats };
        if (command === 'bold') newActiveFormats.bold = !activeFormats.bold;
        else if (command === 'italic') newActiveFormats.italic = !activeFormats.italic;
        else if (command === 'underline') newActiveFormats.underline = !activeFormats.underline;
        else if (command === 'foreColor') newActiveFormats.foreColor = value;
        
        setActiveFormats(newActiveFormats);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2 rounded-2xl shadow-inner border border-slate-200">
                <button type="button" onClick={() => applyFormat('bold')} className={cn("w-10 h-10 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-colors font-serif font-bold active:scale-95", activeFormats.bold && "bg-slate-800 text-white")}>B</button>
                <button type="button" onClick={() => applyFormat('italic')} className={cn("w-10 h-10 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-colors font-serif italic active:scale-95", activeFormats.italic && "bg-slate-800 text-white")}>I</button>
                <button type="button" onClick={() => applyFormat('underline')} className={cn("w-10 h-10 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-colors font-serif underline active:scale-95", activeFormats.underline && "bg-slate-800 text-white")}>U</button>
                
                <div className="w-px h-6 bg-slate-300 mx-2" />
                
                <button type="button" onClick={() => applyFormat('justifyLeft')} className="w-10 h-10 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-colors active:scale-95"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" onClick={() => applyFormat('justifyCenter')} className="w-10 h-10 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm text-slate-700 hover:text-blue-600 transition-colors active:scale-95"><div className="w-4 h-4 flex flex-col justify-between items-center"><div className="w-full h-0.5 bg-current rounded"/><div className="w-2/3 h-0.5 bg-current rounded"/><div className="w-full h-0.5 bg-current rounded"/></div></button>
                
                <div className="w-px h-6 bg-slate-300 mx-2" />

                <button type="button" onClick={() => applyFormat('foreColor', '#ef4444')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#ef4444' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-red-500" /></button>
                <button type="button" onClick={() => applyFormat('foreColor', '#3b82f6')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#3b82f6' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-blue-500" /></button>
                <button type="button" onClick={() => applyFormat('foreColor', '#10b981')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#10b981' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-emerald-500" /></button>
                <button type="button" onClick={() => applyFormat('foreColor', '#f59e0b')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#f59e0b' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-amber-500" /></button>
                <button type="button" onClick={() => applyFormat('foreColor', '#8b5cf6')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#8b5cf6' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-purple-500" /></button>
                <button type="button" onClick={() => applyFormat('foreColor', '#1e293b')} className={cn("w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm active:scale-95", activeFormats.foreColor === '#1e293b' && "bg-slate-800")}><div className="w-4 h-4 rounded-full bg-slate-800" /></button>
            </div>
            <div 
                ref={editorRef}
                contentEditable
                className="w-full min-h-[400px] bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 text-slate-700 font-medium leading-relaxed outline-none focus:bg-white focus:border-amber-200 focus:ring-4 focus:ring-amber-50 transition-all shadow-inner overflow-y-auto touch-manipulation"
                style={{ WebkitOverflowScrolling: 'touch' }}
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
            />
        </div>
    );
};

const NotePadPage = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { user } = useApp();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result as string;
            
            // Create a new note with this uploaded drawing/diagram!
            const noteData = {
                id: 'upload_' + Date.now(),
                user_id: user?.id || 'guest',
                title: 'Diagram',
                content: 'User-uploaded sketch/notes diagram.',
                imageUrl: dataUrl,
                date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                category: 'Notes',
                pin: false,
                created_at: new Date().toISOString()
            };

            const updated = [noteData, ...notes];
            setNotes(updated);
            localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updated));
            addToast("Diagram uploaded successfully!", "success");
        };
        reader.readAsDataURL(file);
    };

    // Default initial template data matching the visual screenshot
    const defaultTemplates = [
        {
            id: 'note_physics',
            title: 'Physics Notes',
            content: 'Key points about Newton\'s laws of motion:\n1. Law of Inertia: Body remains at rest unless acted on by external force.\n2. F = ma: Force is proportional to acceleration.\n3. Action & Reaction: Equal and opposite reactions act on opposite bodies.',
            date: 'Today, 9:20 AM',
            category: 'Physics',
            pin: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'note_math',
            title: 'Math Formula',
            content: 'Quadratic Equation Standard Form: ax² + bx + c = 0.\nRoots are solved via quadratic formula:\nx = [-b ± √(b² - 4ac)] / 2a.\nIf discriminant D = b² - 4ac > 0, roots are real and distinct.',
            date: 'Yesterday, 6:45 PM',
            category: 'Math',
            pin: true,
            created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 'note_diagram',
            title: 'Diagram',
            content: 'Free body vector diagram of mechanical block slide.',
            imageUrl: 'https://images.unsplash.com/photo-1453733190148-c44698c26588?w=500&auto=format&fit=crop',
            date: 'Yesterday, 4:30 PM',
            category: 'Notes',
            pin: false,
            created_at: new Date(Date.now() - 120000000).toISOString()
        },
        {
            id: 'note_important',
            title: 'Important Note',
            content: 'SEE 2083 board exam preparation: Ensure focusing 2 model paper questions per week. Complete Science physical science numericals and Maths trigonometry modules.',
            date: '2 May, 10:15 AM',
            category: 'Important',
            pin: false,
            created_at: new Date(Date.now() - 250000000).toISOString()
        }
    ];

    // State initialization
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form and Interactive states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tag, setTag] = useState('Physics');
    const [activeMood, setActiveMood] = useState<'motivated' | 'calm' | 'thoughtful' | 'tired' | 'stressed'>('motivated');
    
    // Interactive Features Overlay Toggles
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSecs, setRecordingSecs] = useState(0);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toLocaleDateString());
    const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [viewingNote, setViewingNote] = useState<any | null>(null);
    const [isTagPickerOpen, setIsTagPickerOpen] = useState(false);
    const [noteIdToDelete, setNoteIdToDelete] = useState<string | null>(null);

    // Canvas drawing states
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCanvasDrawing, setIsCanvasDrawing] = useState(false);
    const [canvasColor, setCanvasColor] = useState('#8B5CF6');
    const [brushSize, setBrushSize] = useState(4);
    const [isEraserMode, setIsEraserMode] = useState(false);

    // Sync from localstorage or initialize default templates
    useEffect(() => {
        const key = `notes_${user?.id || 'guest'}`;
        const local = localStorage.getItem(key);
        if (local) {
            setNotes(JSON.parse(local));
        } else {
            setNotes(defaultTemplates);
            localStorage.setItem(key, JSON.stringify(defaultTemplates));
        }
        setIsLoading(false);
    }, [user]);

    // Timer effect for simulated voice transcriber recorder
    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingSecs(s => s + 1);
            }, 1000);
        } else {
            setRecordingSecs(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Save notes
    const handleSaveNote = (customContent?: string, customTitle?: string, customTag?: string) => {
        const textToSave = customContent ?? content;
        const noteTitle = customTitle ?? title;
        const noteTag = customTag ?? tag;

        if (!textToSave.trim() && !noteTitle.trim()) {
            addToast("Please fill standard reflection details or text.", "error");
            return;
        }

        const cleanTitle = noteTitle.trim() || (textToSave.length > 25 ? textToSave.slice(0, 22) + "..." : "Reflections");
        
        const noteData: any = {
            id: editingNoteId || 'note_' + Date.now(),
            user_id: user?.id || 'guest',
            title: cleanTitle,
            content: textToSave,
            isSvg: textToSave.includes('<svg') || textToSave.includes('<div') ? true : false,
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: noteTag,
            pin: false,
            created_at: new Date().toISOString()
        };

        let updatedList;
        if (editingNoteId) {
            updatedList = notes.map(n => n.id === editingNoteId ? noteData : n);
            addToast("Log updated successfully.", "success");
        } else {
            updatedList = [noteData, ...notes];
            addToast("Thought memory successfully committed.", "success");
        }

        setNotes(updatedList);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updatedList));

        // Reset
        setTitle('');
        setContent('');
        setEditingNoteId(null);
    };

    // Quick Action Triggers
    const triggerQuickNote = () => {
        const textElem = document.getElementById('composer-textarea');
        if (textElem) {
            textElem.focus();
            textElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        addToast("Write your thoughts down!", "success");
    };

    const triggerVoiceNote = () => {
        setIsRecording(true);
        addToast("Started high-fidelity voice log simulation...", "success");
        
        // Auto transcribe simulation
        setTimeout(() => {
            setContent(prev => {
                const text = "Voice recording: Key physics concept verified. Sound waves represent longitudinal mechanical propagation in material medium.";
                return prev ? prev + "\n" + text : text;
            });
            setIsRecording(false);
            addToast("Voice transcribed successfully!", "success");
        }, 5000);
    };

    const handleUploadMock = () => {
        fileInputRef.current?.click();
    };

    // Canvas drawing handler methods
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            if (e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsCanvasDrawing(true);

        // Prevent window scrolling on touch devices
        if ('touches' in e) {
            e.preventDefault();
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isCanvasDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if ('touches' in e) {
            if (e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        ctx.strokeStyle = isEraserMode ? '#FFFFFF' : canvasColor;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();

        if ('touches' in e) {
            e.preventDefault();
        }
    };

    const stopDrawing = () => {
        setIsCanvasDrawing(false);
    };

    const handleSaveDrawing = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL();

        const noteData = {
            id: 'draw_' + Date.now(),
            user_id: user?.id || 'guest',
            title: 'Diagram Sketch',
            content: 'Handwritten diagram sketch on whiteboard.',
            imageUrl: dataUrl,
            date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: 'Notes',
            pin: false,
            created_at: new Date().toISOString()
        };

        const updated = [noteData, ...notes];
        setNotes(updated);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updated));
        addToast("Canvas drawing saved successfully!", "success");
        setIsWhiteboardOpen(false);
    };

    const handleDeleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNoteIdToDelete(id);
    };

    const executeDeleteNote = () => {
        if (!noteIdToDelete) return;
        const updated = notes.filter(n => n.id !== noteIdToDelete);
        setNotes(updated);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updated));
        addToast("Thought log deleted.", "success");
        setNoteIdToDelete(null);
    };

    const togglePinNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = notes.map(n => n.id === id ? { ...n, pin: !n.pin } : n);
        setNotes(updated);
        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(updated));
        addToast("Pin toggled successfully.", "success");
    };

    // Tags details
    const tagsList = ['Physics', 'Math', 'Science', 'Important', 'Personal'];

    // Moods config for score updates
    const moodsConfig = {
        motivated: { label: 'Motivated!', score: 92, emoji: '😀', text: 'You\'re feeling', gradient: 'bg-gradient-to-br from-[#8E51FF] via-[#7B3FE4] to-[#6366F1]' },
        calm: { label: 'Calm & Mindful', score: 85, emoji: '😌', text: 'You\'re feeling', gradient: 'bg-gradient-to-br from-[#6366F1] via-[#4F46E5] to-[#3B82F6]' },
        thoughtful: { label: 'Philosophical', score: 75, emoji: '🤔', text: 'You\'re feeling', gradient: 'bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E40AF]' },
        tired: { label: 'Low Energy', score: 45, emoji: '😔', text: 'You\'re feeling', gradient: 'bg-gradient-to-br from-[#EAB308] via-[#D97706] to-[#B45309]' },
        stressed: { label: 'Overwhelmed', score: 30, emoji: '😡', text: 'You\'re feeling', gradient: 'bg-gradient-to-br from-[#EF4444] via-[#DC2626] to-[#991B1B]' },
    };

    const currentMoodConfig = moodsConfig[activeMood];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-800">
            {/* Header top section exactly like the photo */}
            <header className="px-4 py-5 max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/tools')}
                        className="w-10 h-10 border border-slate-200 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                            Mind Log
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-400 font-bold tracking-tight">
                            Capture your thoughts, ideas & learning
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 relative">
                    <button 
                        onClick={() => setIsCalendarOpen(true)}
                        className="w-10 h-10 border border-slate-150 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none shrink-0"
                        title="Calendar Dates"
                    >
                        <Calendar className="w-4 h-4 text-slate-600" />
                    </button>
                    <button 
                        onClick={() => setIsOptionsMenuOpen(!isOptionsMenuOpen)}
                        className="w-10 h-10 border border-slate-150 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none shrink-0"
                    >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* Pop options menu option exact */}
                    <AnimatePresence>
                        {isOptionsMenuOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 top-12 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                            >
                                <button 
                                    onClick={() => {
                                        setNotes(defaultTemplates);
                                        localStorage.setItem(`notes_${user?.id || 'guest'}`, JSON.stringify(defaultTemplates));
                                        addToast("Reset logs to template mocks.", "success");
                                        setIsOptionsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4 text-slate-400" /> Reset Templates
                                </button>
                                <button 
                                    onClick={() => {
                                        setNotes([]);
                                        localStorage.removeItem(`notes_${user?.id || 'guest'}`);
                                        addToast("Cleared all active logs.", "success");
                                        setIsOptionsMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-50"
                                >
                                    <Trash2 className="w-4 h-4" /> Clear All Data
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <main className="px-3 sm:px-4 max-w-5xl mx-auto space-y-6">
                
                {/* 1. Today's Mood Grid Area */}
                <div className="bg-white border border-slate-100/90 rounded-[2.5rem] p-5 sm:p-6 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                        {/* Left part Mood selection */}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                                    Today's Mood
                                </h3>
                                <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                    How are you feeling?
                                </p>
                            </div>

                            {/* 5 click Emojis list */}
                            <div className="flex items-center gap-2.5 sm:gap-4 py-2">
                                {Object.entries(moodsConfig).map(([key, item]) => {
                                    const active = activeMood === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => {
                                                setActiveMood(key as any);
                                                addToast(`Mood updated: ${item.label}`, "success");
                                            }}
                                            className={`w-11 h-11 sm:w-13 sm:h-13 text-2xl sm:text-3xl rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-90 border-2 select-none hover:scale-105 duration-200 ${
                                                active 
                                                    ? 'bg-slate-50 border-indigo-500 shadow-sm scale-105' 
                                                    : 'bg-white border-slate-100 hover:border-slate-300'
                                            }`}
                                        >
                                            {item.emoji}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right part: Feeling Card gradient exactly matched to mockup description */}
                        <div className="md:col-span-5">
                            <motion.div 
                                layout
                                className={`h-full min-h-[120px] rounded-3xl p-5 text-white flex items-center justify-between shadow-md transition-all duration-300 relative overflow-hidden group ${currentMoodConfig.gradient}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-all pointer-events-none" />
                                
                                <div className="space-y-1.5 z-10">
                                    <span className="text-[10px] font-black uppercase text-white/70 tracking-widest block font-sans">
                                        {currentMoodConfig.text}
                                    </span>
                                    <h4 className="text-xl font-black tracking-tight leading-none drop-shadow-xs">
                                        {activeMood === 'motivated' ? '🔥 ' : ''}{currentMoodConfig.label}
                                    </h4>
                                    <span className="text-[10px] font-bold text-white/80 block pt-1.5 font-mono">
                                        Focus Score
                                    </span>
                                </div>

                                {/* Donut Progress Chart Circular layout representing focus score */}
                                <div className="relative w-20 h-20 flex items-center justify-center shrink-0 z-10">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            className="fill-none stroke-white/20 stroke-[3.5px]"
                                        />
                                        <circle
                                            cx="18"
                                            cy="18"
                                            r="15"
                                            className="fill-none stroke-white stroke-[3.5px] transition-all duration-500 ease-out"
                                            strokeDasharray="94.25"
                                            strokeDashoffset={(94.25 - (currentMoodConfig.score * 94.25 / 100)).toString()}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="absolute text-xs font-black tracking-tight font-mono">
                                        {currentMoodConfig.score}%
                                    </span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* 2. Composer Core box: "What's on your mind today?" */}
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-5 sm:p-6 shadow-xs relative">
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs font-black text-indigo-500 uppercase tracking-widest block mb-0.5">
                                What's on your mind today?
                            </span>
                            <p className="text-[11px] font-semibold text-slate-400">
                                Write your thoughts, ideas or daily reflections...
                            </p>
                        </div>

                        {/* Title Optional bar */}
                        <div className="flex gap-2 bg-slate-50 rounded-xl p-1.5 border border-slate-100/50">
                            <input
                                type="text"
                                value={title}
                                placeholder="Logs Title (e.g. Physics Revision, Math Problem)"
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-transparent px-3 py-1.5 border-0 text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"
                            />
                            <div className="flex items-center gap-1 shrink-0 px-2">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Tag:</span>
                                <button
                                    onClick={() => setIsTagPickerOpen(true)}
                                    className="bg-white border border-slate-150 rounded-lg text-[10px] font-black text-slate-600 px-2 py-0.5 outline-none cursor-pointer flex items-center gap-1 hover:border-indigo-300 hover:text-indigo-600 transition-all font-mono"
                                >
                                    <span>{tag}</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Text reflections canvas area */}
                        <textarea
                            id="composer-textarea"
                            rows={4}
                            maxLength={1000}
                            value={content}
                            placeholder="Write down notes, code snippets, formula outlines, or sketch diagrams to keep track..."
                            onChange={e => setContent(e.target.value)}
                            className="w-full bg-[#fcfdfe] p-4 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed outline-none focus:bg-white focus:border-indigo-200 transition-all shadow-inner placeholder:text-slate-300 resize-none"
                        />

                        {/* Composer actions banner bar */}
                        <div className="flex items-center justify-between pt-2">
                            {/* Char counts display indicator */}
                            <span className="text-[10px] font-mono font-black text-slate-400">
                                {content.length}/1000
                            </span>

                            {/* Icons array */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={triggerVoiceNote}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                                        isRecording 
                                            ? 'bg-rose-50 border-rose-100 text-rose-600 animate-pulse' 
                                            : 'bg-indigo-50/50 border-indigo-100/40 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700'
                                    }`}
                                    title="Voice Notes simulated"
                                >
                                    <Mic className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleUploadMock}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50/50 border border-indigo-100/40 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer"
                                    title="Mock attach diagrams"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={triggerQuickNote}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50/50 border border-indigo-100/40 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer"
                                    title="Focus details"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        addToast("AI analysis running on thoughts...", "success");
                                        setTimeout(() => {
                                            addToast("AI Insight updated successfully based on your composed log!", "success");
                                        }, 1000);
                                    }}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-605/10 border border-violet-100 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer"
                                    title="AI spline analyser"
                                >
                                    <Brain className="w-4 h-4" />
                                </button>

                                {/* Save Button */}
                                <button
                                    onClick={() => handleSaveNote()}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs active:scale-95 transition-all cursor-pointer border-0 flex items-center gap-1.5"
                                >
                                    <span>Save Entry</span>
                                    <Check className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Your Mind Space Slider/Grid exact */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                            Your Mind Space
                        </h3>
                        <button
                            onClick={() => {
                                addToast("Opening Mind Log Archives Space", "success");
                            }}
                            className="text-xs font-bold text-indigo-605 text-indigo-600 hover:underline cursor-pointer"
                        >
                            View all
                        </button>
                    </div>

                    {/* Responsive Horizon Scroll layout for Mind Space nodes card matching the mobile-friendly mockup height and sizes */}
                    <div 
                        className="flex overflow-x-auto gap-3.5 py-2 pb-4 px-1 scrollbar-none -mx-4 px-4 snap-x snap-mandatory touch-pan-x"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                    >
                        {notes.slice(0, 4).map((item) => {
                            // Find card layout color values based on tags
                            let cardTheme = {
                                bg: 'bg-[#EEF1FF] border-slate-100',
                                bgHover: 'hover:bg-[#E2E6FF]',
                                badge: 'bg-[#DCE3FF] text-[#4f46e5]',
                                text: 'text-slate-800',
                                iconColor: 'text-[#4f46e5]',
                                icon: StickyNote
                            };

                            const checkTag = item.category?.toLowerCase() || '';
                            if (checkTag.includes('physics')) {
                                cardTheme = {
                                    bg: 'bg-[#EEF1FF] border-indigo-100/50',
                                    bgHover: 'hover:bg-[#e0e4ff]',
                                    badge: 'bg-[#DCE3FF] text-indigo-700 font-extrabold',
                                    text: 'text-indigo-950',
                                    iconColor: 'text-indigo-600',
                                    icon: StickyNote
                                };
                            } else if (checkTag.includes('math')) {
                                cardTheme = {
                                    bg: 'bg-[#FFF5EE] border-orange-100/50',
                                    bgHover: 'hover:bg-[#ffe3d1]',
                                    badge: 'bg-[#FFEAD2] text-orange-700 font-extrabold',
                                    text: 'text-orange-950',
                                    iconColor: 'text-orange-500',
                                    icon: BookMarked
                                };
                            } else if (checkTag.includes('notes') || checkTag.includes('science')) {
                                cardTheme = {
                                    bg: 'bg-[#E8FAF4] border-emerald-100/40',
                                    bgHover: 'hover:bg-[#d5f5ea]',
                                    badge: 'bg-[#CCFBF1] text-emerald-800 font-extrabold',
                                    text: 'text-[#064E3B]',
                                    iconColor: 'text-emerald-500',
                                    icon: ImageIcon
                                };
                            } else if (checkTag.includes('important') || checkTag.includes('personal')) {
                                cardTheme = {
                                    bg: 'bg-[#FFF0F4] border-rose-100/40',
                                    bgHover: 'hover:bg-[#ffdce5]',
                                    badge: 'bg-[#FFE4E6] text-rose-700 font-extrabold',
                                    text: 'text-rose-950',
                                    iconColor: 'text-rose-500',
                                    icon: ShieldAlert
                                };
                            }

                            return (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    onClick={() => setViewingNote(item)}
                                    className={`w-[145px] sm:w-[165px] min-w-[145px] sm:min-w-[165px] h-[205px] sm:h-[220px] rounded-[1.8rem] p-4 border shadow-xs hover:shadow-md transition-all relative overflow-hidden group cursor-pointer flex flex-col justify-between shrink-0 snap-start ${cardTheme.bg} ${cardTheme.bgHover}`}
                                >
                                    {/* Top row with tag icon and pin action */}
                                    <div className="flex items-center justify-between w-full">
                                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center bg-white/70 ${cardTheme.iconColor} shadow-3xs`}>
                                            <cardTheme.icon className="w-3.5 h-3.5" />
                                        </div>
                                        <button
                                            onClick={(e) => togglePinNote(item.id, e)}
                                            className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                                                item.pin ? 'bg-transparent scale-105' : 'bg-transparent opacity-0 group-hover:opacity-100 hover:opacity-100'
                                            } ${cardTheme.iconColor}`}
                                        >
                                            <Pin className={`w-3.5 h-3.5 ${item.pin ? 'fill-current rotate-45' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Card main text or thumbnail area */}
                                    <div className="flex-1 flex flex-col justify-start mt-2.5 overflow-hidden">
                                        {item.imageUrl ? (
                                            <div className="w-full h-[68px] sm:h-[75px] rounded-xl overflow-hidden mb-1.5 border border-slate-100 bg-slate-50 shadow-2xs shrink-0">
                                                <img 
                                                    src={item.imageUrl} 
                                                    alt={item.title} 
                                                    className="w-full h-full object-cover filter saturate-[0.8] group-hover:saturate-100 group-hover:scale-105 transition-all duration-300"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                        ) : null}

                                        <div className="space-y-0.5">
                                            <h4 className="text-[11px] sm:text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-snug truncate">
                                                {item.title}
                                            </h4>
                                            <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tight leading-none">
                                                {item.date || 'Today, 9:00 AM'}
                                            </p>
                                        </div>

                                        {/* Brief body summary (only shown for non-image items to keep clean structure) */}
                                        {!item.imageUrl && (
                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-3 mt-1.5 overflow-hidden">
                                                {item.content || 'Notes detail snippet.'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Card Footer badges */}
                                    <div className="flex justify-between items-center mt-1">
                                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${cardTheme.badge}`}>
                                            #{item.category || 'General'}
                                        </span>
                                        
                                        {/* Hidden edit actions that reveal on hover */}
                                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-10">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingNoteId(item.id);
                                                    setTitle(item.title);
                                                    setContent(item.content);
                                                    setTag(item.category);
                                                    triggerQuickNote();
                                                }}
                                                className="w-5 h-5 rounded bg-white text-slate-600 hover:text-indigo-600 flex items-center justify-center shadow-3xs"
                                                title="Edit note"
                                            >
                                                <Edit3 className="w-3 h-3" />
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteNote(item.id, e)}
                                                className="w-5 h-5 rounded bg-white text-rose-500 hover:text-rose-700 flex items-center justify-center shadow-3xs"
                                                title="Delete note"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* 4. Quick Selection Pill Buttons list exactly */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                    <button 
                        onClick={triggerQuickNote}
                        className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-xs font-black uppercase text-slate-700 shadow-2xs group cursor-pointer"
                    >
                        <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">📝</span>
                        Quick Note
                    </button>
                    <button 
                        onClick={triggerVoiceNote}
                        className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-xs font-black uppercase text-slate-700 shadow-2xs group cursor-pointer"
                    >
                        <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">🎙️</span>
                        Voice Note
                    </button>
                    <button 
                        onClick={handleUploadMock}
                        className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-xs font-black uppercase text-slate-700 shadow-2xs group cursor-pointer"
                    >
                        <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">☁️</span>
                        Upload
                    </button>
                    <button 
                        onClick={() => setIsWhiteboardOpen(true)}
                        className="bg-white border border-slate-100 p-3 sm:p-4 rounded-2xl flex items-center justify-center gap-2 hover:border-indigo-400 active:scale-95 transition-all text-xs font-black uppercase text-slate-700 shadow-2xs group cursor-pointer"
                    >
                        <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">🎨</span>
                        Draw
                    </button>
                </div>

                {/* 5. Split Row Analytics: Streak & This Week */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    
                    {/* Mind Log Streak segment bar */}
                    <div className="md:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-3">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                                <span className="text-sm">🔥</span> Mind Log Streak
                            </h4>
                            <ArrowRight className="w-4 h-4 text-slate-350 hover:translate-x-0.5 transition-transform cursor-pointer" />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                                    12 Days
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 font-serif italic">
                                    Keep going strong!
                                </p>
                            </div>

                            {/* Streak indicator segmented block element exactly like photo */}
                            <div className="grid grid-cols-10 gap-1 sm:gap-1.5 py-1.5">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div 
                                        key={i}
                                        className={`h-2 sm:h-2.5 rounded-full ${
                                            i < 7 
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.2)]' 
                                                : 'bg-slate-100 border border-slate-50'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Weekly progress entries and CSS bar chart */}
                    <div className="md:col-span-6 bg-white border border-slate-100 rounded-[2.5rem] p-5 shadow-xs flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                This Week
                            </h4>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Value left */}
                            <div className="col-span-4">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                                    6 Entries
                                </h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                    Active Study Logs
                                </p>
                            </div>

                            {/* Mini 3D aesthetic column charts right */}
                            <div className="col-span-8 flex items-end justify-between h-20 px-2">
                                {[
                                    { day: 'M', entries: 3, h: '45%' },
                                    { day: 'T', entries: 5, h: '75%' },
                                    { day: 'W', entries: 2, h: '30%' },
                                    { day: 'T', entries: 4, h: '60%' },
                                    { day: 'F', entries: 6, h: '90%' },
                                    { day: 'S', entries: 1, h: '15%' },
                                    { day: 'S', entries: 0, h: '5%' }
                                ].map((col, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 group relative">
                                        
                                        {/* CSS Tooltip */}
                                        <div className="absolute -top-10 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[9px] px-2 py-1 rounded-md font-mono z-25 transition-all whitespace-nowrap pointer-events-none shadow-md">
                                            {col.entries} logs
                                        </div>

                                        {/* Active pillar bar */}
                                        <div className="w-2.5 sm:w-3 bg-slate-100 rounded-full h-14 flex items-end overflow-hidden cursor-pointer">
                                            <div 
                                                className={`w-full rounded-full transition-all duration-700 bg-gradient-to-t ${
                                                    col.entries > 4 
                                                        ? 'from-emerald-500 to-teal-400' 
                                                        : col.entries > 1 
                                                            ? 'from-indigo-500 to-indigo-400' 
                                                            : 'from-orange-500 to-amber-400'
                                                }`}
                                                style={{ height: col.h }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                            {col.day}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. AI Insight Banner exactly like photo with premium companion robot vector */}
                <div className="bg-[#EEF2FF]/80 border border-slate-100 rounded-[2.5rem] p-5.5 sm:p-6 shadow-xs relative overflow-hidden flex items-center justify-between group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-200/20 rounded-full -mr-24 -mt-24 blur-2xl pointer-events-none" />
                    
                    <div className="space-y-3 z-10 max-w-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center text-indigo-600">
                                <Brain className="w-4.5 h-4.5 animate-pulse text-[#8B5CF6]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-indigo-950 uppercase tracking-tight leading-none">
                                    AI Insight
                                </h4>
                                <span className="text-[10px] font-bold text-indigo-400 block pt-0.5">
                                    Based on your logs this week
                                </span>
                            </div>
                        </div>

                        {/* Bullets lists layout exact */}
                        <ul className="space-y-2 pl-1">
                            <li className="text-xs font-semibold text-slate-75 *0 text-slate-600 flex items-start gap-2">
                                <span className="text-slate-450">•</span>
                                You studied Physics 3 times this week.
                            </li>
                            <li className="text-xs font-semibold text-slate-75 *0 text-slate-600 flex items-start gap-2">
                                <span className="text-slate-450">•</span>
                                Your focus time increased by 15%.
                            </li>
                            <li className="text-xs font-semibold text-slate-75 *0 text-slate-600 flex items-start gap-2">
                                <span className="text-indigo-600">•</span>
                                Suggested next topic: <span className="text-indigo-600 font-extrabold underline decoration-dashed select-all">Work, Energy & Power</span>
                            </li>
                        </ul>
                    </div>

                    {/* Cute floating animated robot 3D Vector illustration on the right */}
                    <div className="hidden sm:flex flex-col items-center justify-center select-none pl-4 relative shrink-0">
                        <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-xl animate-bounce duration-[3500ms]">
                            {/* head chassis scale */}
                            <rect x="35" y="32" width="50" height="36" rx="12" fill="#EEF2FF" stroke="#818CF8" strokeWidth="2" />
                            {/* ears node */}
                            <circle cx="32" cy="50" r="4" fill="#818CF8" />
                            <circle cx="88" cy="50" r="4" fill="#818CF8" />
                            {/* screen plate */}
                            <rect x="42" y="38" width="36" height="23" rx="7" fill="#1E1B4B" />
                            {/* glowing neon cyan lights eyes */}
                            <ellipse cx="51" cy="49" r="3" fill="#38BDF8" className="animate-pulse" />
                            <ellipse cx="69" cy="49" r="3" fill="#38BDF8" className="animate-pulse" />
                            {/* antenna and top crown */}
                            <line x1="60" y1="32" x2="60" y2="18" stroke="#818CF8" strokeWidth="2" />
                            <circle cx="60" cy="16" r="3.5" fill="#6366F1" />
                            {/* body plate link */}
                            <rect x="40" y="73" width="40" height="32" rx="9" fill="#EEF2FF" stroke="#818CF8" strokeWidth="2" />
                            {/* core energy reactor chest */}
                            <circle cx="60" cy="89" r="6" fill="#6366F1" stroke="#38BDF8" strokeWidth="1" />
                            <circle cx="60" cy="89" r="2.5" fill="#38BDF8" className="animate-ping" />
                            {/* robot micro hands joint outlines */}
                            <path d="M35,80 Q24,84 25,92" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" />
                            <path d="M85,80 Q96,84 95,92" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                    </div>
                </div>

                {/* 7. Recent Entries listing exact visual */}
                <div className="space-y-3 pt-2">
                    <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                        Recent Entries
                    </h3>

                    <div className="space-y-3">
                        {notes.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-3xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">No active study logs yet.</p>
                            </div>
                        ) : (
                            notes.map((item) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setViewingNote(item)}
                                    className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-indigo-200 active:scale-98 transition-all shadow-2xs group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-lg">
                                            {item.isSvg ? '📐' : item.category === 'Physics' ? '⚛️' : item.category === 'Math' ? '📐' : '📝'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs sm:text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                {item.title}
                                            </h4>
                                            <p className="text-[10px] font-extrabold text-slate-400 font-mono mt-0.5">
                                                {item.date || 'Today, 8:50 PM'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {item.category || 'General'}
                                        </span>
                                        <button 
                                            onClick={(e) => handleDeleteNote(item.id, e)}
                                            className="w-8 h-8 rounded-lg text-slate-450 hover:text-rose-500 hover:bg-rose-50/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Delete entry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <ArrowRight className="w-4 h-4 text-slate-350" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>

            {/* Premium WHITEBOARD INTERACTIVE CANVAS popup modal exactly */}
            <AnimatePresence>
                {isWhiteboardOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] border border-slate-100 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Modal Header bar options */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🎨</span>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase">Interactive Whiteboard Studio</h3>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Draw diagrams or notes on custom canvas</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsWhiteboardOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white border border-slate-150 text-slate-500 hover:text-slate-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Main canvas viewport frame */}
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center relative touch-none min-h-[280px]">
                                    <canvas
                                        ref={canvasRef}
                                        width={560}
                                        height={320}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="bg-white w-full h-[280px] cursor-crosshair block"
                                    />
                                    {isEraserMode && (
                                        <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest pointer-events-none animate-pulse">
                                            🧽 ERASER ENABLED
                                        </div>
                                    )}
                                </div>

                                {/* Controls tool belt options */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                    {/* Left segment colors and brush slider */}
                                    <div className="flex items-center gap-3.5 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            {['#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#0F172A'].map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setCanvasColor(c);
                                                        setIsEraserMode(false);
                                                    }}
                                                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer hover:scale-110 active:scale-95 ${
                                                        canvasColor === c && !isEraserMode ? 'border-indigo-600 scale-105' : 'border-white'
                                                    }`}
                                                    style={{ backgroundColor: c }}
                                                />
                                            ))}
                                        </div>

                                        <div className="w-px h-6 bg-slate-200" />

                                        {/* Size slider bar */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Brush: {brushSize}px</span>
                                            <input 
                                                type="range" 
                                                min="2" 
                                                max="12" 
                                                step="1"
                                                value={brushSize}
                                                onChange={e => setBrushSize(parseInt(e.target.value))}
                                                className="w-16 sm:w-24 h-1 accent-indigo-505 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    {/* Right segment brush actions button */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setIsEraserMode(!isEraserMode)}
                                            className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                                isEraserMode 
                                                    ? 'bg-rose-100 border-rose-200 text-rose-700 shadow-inner' 
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            <Eraser className="w-3.5 h-3.5" /> Eraser
                                        </button>
                                        <button
                                            onClick={() => {
                                                const canvas = canvasRef.current;
                                                if (canvas) {
                                                    const ctx = canvas.getContext('2d');
                                                    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                                                }
                                                addToast("Canvas cleared.", "success");
                                            }}
                                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
                                        >
                                            ✕ Clear
                                        </button>
                                        <button
                                            onClick={handleSaveDrawing}
                                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1.5 active:scale-95 transition-all border-0"
                                        >
                                            Save Diagram <Check className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Note viewing modal detail popup */}
            <AnimatePresence>
                {viewingNote && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl border border-slate-100 w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider">
                                    {viewingNote.category}
                                </span>
                                <button 
                                    onClick={() => setViewingNote(null)}
                                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center text-xs hover:text-slate-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                                    {viewingNote.title}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    Recorded on: {viewingNote.date}
                                </p>
                            </div>

                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex-1 overflow-y-auto max-h-[300px]">
                                {viewingNote.imageUrl && (
                                    <div className="w-full h-44 overflow-hidden rounded-xl mb-3 border border-slate-200">
                                        <img src={viewingNote.imageUrl} alt={viewingNote.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    </div>
                                )}
                                {viewingNote.isSvg ? (
                                    <div dangerouslySetInnerHTML={{ __html: viewingNote.content }} />
                                ) : (
                                    <p className="text-sm font-medium text-slate-650 leading-relaxed whitespace-pre-wrap select-all">
                                        {viewingNote.content}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                                <button
                                    onClick={() => {
                                        setEditingNoteId(viewingNote.id);
                                        setTitle(viewingNote.title);
                                        setContent(viewingNote.content);
                                        setTag(viewingNote.category);
                                        setViewingNote(null);
                                        triggerQuickNote();
                                    }}
                                    className="px-4 py-2 text-xs font-black uppercase border border-slate-200 rounded-xl bg-white text-slate-700 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                                >
                                    Edit Log
                                </button>
                                <button
                                    onClick={() => setViewingNote(null)}
                                    className="px-4 py-2 text-xs font-black uppercase text-white rounded-xl bg-indigo-600 hover:bg-indigo-700 cursor-pointer border-0 active:scale-95 transition-all"
                                >
                                    Close Window
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Interactive calendar popup dates */}
            <AnimatePresence>
                {isCalendarOpen && (
                    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 15, opacity: 0 }}
                            className="bg-white rounded-3xl border border-slate-100 p-6 w-full max-w-sm shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-1">
                                    🗓️ Log Calendar History
                                </h3>
                                <button 
                                    onClick={() => setIsCalendarOpen(false)}
                                    className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 rounded-lg flex items-center justify-center text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-400 font-medium">Verify study history slots or pick custom schedule dates:</p>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200/50">
                                    {['M','T','W','T','F','S','S'].map((dl, i) => <span key={i}>{dl}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-bold font-mono">
                                    {Array.from({ length: 31 }).map((_, i) => {
                                        const dayNum = i + 1;
                                        const active = dayNum === 1 || dayNum === 2 || dayNum === 12 || dayNum === 15 || dayNum === 26 || dayNum === 28;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setSelectedDate(`2026-06-${dayNum.toString().padStart(2, '0')}`);
                                                    addToast(`History view selected: Day ${dayNum}`, "success");
                                                    setIsCalendarOpen(false);
                                                }}
                                                className={`py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                                                    active 
                                                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-650 text-white shadow-xs scale-102' 
                                                        : 'hover:bg-indigo-50/50 text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                {dayNum}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={() => setIsCalendarOpen(false)}
                                className="w-full py-2.5 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs active:scale-95 border-0"
                            >
                                Apply Dates filter
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Category Picker Overlay */}
            <AnimatePresence>
                {isTagPickerOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsTagPickerOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                        />
                        <motion.div 
                            initial={{ y: "100%", opacity: 0.5 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0.5 }}
                            transition={{ type: "spring", damping: 25, stiffness: 350 }}
                            className="bg-white w-full sm:max-w-md rounded-t-[2.2rem] sm:rounded-b-[2.2rem] sm:rounded-[2.2rem] overflow-hidden shadow-2xl relative z-10 p-5 pb-8 sm:pb-5 space-y-4"
                        >
                            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-2 sm:hidden" />
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans">
                                    Select Subject Tag
                                </h3>
                                <button 
                                    onClick={() => setIsTagPickerOpen(false)}
                                    className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-450 hover:text-slate-705 text-slate-400 hover:text-slate-700 active:scale-90"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                {tagsList.map((t) => {
                                    const isSelected = tag === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setTag(t);
                                                addToast(`Tag changed to ${t}`, "success");
                                                setIsTagPickerOpen(false);
                                            }}
                                            className={`w-full flex items-center justify-between py-3.5 px-3 rounded-2xl transition-all cursor-pointer text-left border-0 ${
                                                isSelected ? 'bg-slate-50 font-bold' : 'bg-transparent hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <span className={`text-[15px] ${isSelected ? 'text-indigo-650 font-extrabold text-slate-900' : 'text-slate-700 font-medium'}`}>
                                                {t}
                                            </span>
                                            <div className="flex items-center justify-center shrink-0">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    isSelected ? 'border-[#EF4444]' : 'border-slate-300'
                                                }`}>
                                                    {isSelected && (
                                                        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Deletion Confirmation Popup */}
            <AnimatePresence>
                {noteIdToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setNoteIdToDelete(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-sm rounded-[2.2rem] p-6 text-center space-y-4 shadow-2xl relative z-10 border border-slate-100"
                        >
                            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-500">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <div className="space-y-1.5">
                                <h3 className="text-base font-black text-slate-900">
                                    Delete This Log?
                                </h3>
                                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                    Are you sure you want to permanently erase this thought log? This action is absolute and cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-2.5 pt-2">
                                <button
                                    onClick={() => setNoteIdToDelete(null)}
                                    className="flex-1 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 border-0"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeDeleteNote}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 border-0"
                                >
                                    Delete Log
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Giant floating action button exact */}
            <div className="fixed bottom-24 right-5 sm:right-8 z-40">
                <button
                    onClick={triggerQuickNote}
                    className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-75 *0 text-white shadow-xl hover:shadow-2xl flex items-center justify-center text-2xl active:scale-95 duration-200 cursor-pointer border-0 float-right group"
                    title="Draft Entry reflections"
                >
                    <Plus className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
            />
        </div>
    );
};



const TodoListPage_old = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState<{id: string, text: string, done: boolean, priority: 'low' | 'medium' | 'high', category: string}[]>([]);
    const [newTask, setNewTask] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [selectedCategory, setSelectedCategory] = useState('Study');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const categories = ['Study', 'Personal', 'School', 'Project', 'Health'];
    const priorities = [
        { id: 'low', color: 'bg-emerald-500', text: 'Low' },
        { id: 'medium', color: 'bg-amber-500', text: 'Medium' },
        { id: 'high', color: 'bg-rose-500', text: 'High' }
    ];

    useEffect(() => {
        const local = localStorage.getItem('aadhar_tasks_v4');
        if (local) {
            setTasks(JSON.parse(local));
        } else {
            const old = localStorage.getItem('tasks_local_v3');
            if (old) {
                setTasks(JSON.parse(old));
            }
        }
        setIsLoading(false);
    }, []);

    const saveTasks = (newTasks: any[]) => {
        setTasks(newTasks);
        localStorage.setItem('aadhar_tasks_v4', JSON.stringify(newTasks));
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        const task = { 
            id: 'task_' + Date.now(), 
            text: newTask, 
            done: false, 
            priority: selectedPriority,
            category: selectedCategory
        };
        saveTasks([task, ...tasks]);
        setNewTask("");
        setIsMenuOpen(false);
    };

    const toggleTask = (id: string) => {
        saveTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
    };

    const deleteTask = (id: string) => {
        saveTasks(tasks.filter(t => t.id !== id));
    };

    const filteredTasks = tasks.filter(t => activeTab === 'completed' ? t.done : !t.done);
    const completionRate = tasks.length ? Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pb-40 font-sans selection:bg-indigo-500/30">
            <header className="px-4 md:px-8 py-6 md:py-10 flex flex-col gap-6 relative overflow-hidden bg-white rounded-b-[3rem] shadow-sm mb-6 pb-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 border pointer-events-none" />
                <div className="flex items-center justify-between relative z-10 w-full max-w-4xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all z-20 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] shadow-inner relative z-20">
                        <motion.div 
                            animate={{ x: activeTab === 'pending' ? 0 : '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                            className="absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-md"
                        />
                        <button 
                            onClick={() => setActiveTab('pending')}
                            className={cn("px-6 py-2.5 text-[0.65rem] md:text-sm font-black uppercase tracking-widest relative z-10 transition-colors duration-300", activeTab === 'pending' ? "text-indigo-600" : "text-slate-400")}
                        >
                            Pending
                        </button>
                        <button 
                            onClick={() => setActiveTab('completed')}
                            className={cn("px-6 py-2.5 text-[0.65rem] md:text-sm font-black uppercase tracking-widest relative z-10 transition-colors duration-300", activeTab === 'completed' ? "text-slate-900" : "text-slate-400")}
                        >
                            Success
                        </button>
                    </div>
                </div>
                
                <div className="text-center relative z-10 mt-2 max-w-4xl mx-auto w-full">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase italic flex flex-col gap-1 items-center justify-center">
                        Task Fusion <Sparkles className="w-8 h-8 text-indigo-500 ml-2 inline-block animate-pulse" />
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center shadow-sm z-30"><Check className="w-4 h-4 text-emerald-600" /></div>
                            <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center shadow-sm z-20"><Activity className="w-4 h-4 text-indigo-600" /></div>
                            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center shadow-sm z-10 text-[0.6rem] font-black text-slate-500">{tasks.length}</div>
                        </div>
                        <div className="flex flex-col items-start bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                            <span className="text-[0.55rem] font-black uppercase tracking-widest text-slate-400">Completion</span>
                            <span className="text-lg font-black text-indigo-500">{completionRate}%</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-4 md:px-8 flex-1 max-w-4xl mx-auto w-full">
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredTasks.length > 0 ? filteredTasks.map((task, i) => (
                            <motion.div 
                                layoutId={task.id} key={task.id}
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -100 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200, delay: i * 0.05 }}
                                className={cn(
                                    "p-5 md:p-6 rounded-[2rem] bg-white border shadow-sm group relative overflow-hidden transition-all duration-500 hover:shadow-lg",
                                    task.done ? "opacity-70 border-slate-100 bg-slate-50/50" : "border-slate-100 hover:border-indigo-200"
                                )}
                            >
                                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] transition-colors", task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500')} />
                                
                                <div className="flex items-start gap-4 md:gap-6 relative z-10 pl-2">
                                    <button 
                                        onClick={() => toggleTask(task.id)}
                                        className={cn("w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 mt-1 shrink-0", task.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 bg-white hover:border-indigo-400 hover:scale-110")}
                                    >
                                        <Check className={cn("w-4 h-4 transition-all duration-500", task.done ? "opacity-100 scale-100" : "opacity-0 scale-50")} />
                                    </button>

                                    <div className="flex-1 flex flex-col gap-2 cursor-pointer min-w-0" onClick={() => toggleTask(task.id)}>
                                        <h3 className={cn("text-base md:text-lg font-bold leading-snug transition-all break-words pr-8", task.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800")}>{task.text}</h3>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-[0.6rem] font-black uppercase tracking-widest text-slate-500">
                                                <Tag className="w-3 h-3" /> {task.category}
                                            </span>
                                            <span className={cn("px-3 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-widest", task.priority === 'high' ? 'bg-rose-50 text-rose-600' : task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
                                                {task.priority} Priority
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => deleteTask(task.id)} className="absolute right-4 top-4 md:relative md:right-0 md:top-0 w-10 h-10 bg-slate-50 text-slate-300 rounded-[1.2rem] flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-90 shrink-0">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )) : (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-20 text-center space-y-6 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-200 rotate-12 transition-transform hover:rotate-0"><ListChecks className="w-10 h-10" /></div>
                                <div className="space-y-2">
                                    <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Everything Clear</h2>
                                    <p className="text-[0.65rem] md:text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto">Ready for your next set of objectives</p>
                                </div>
                                <button onClick={() => setIsMenuOpen(true)} className="px-8 py-3 bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-100 transition-colors">Start Planning</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-[1050] w-full max-w-sm px-4 md:px-0">
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="w-full h-16 bg-slate-900 text-white rounded-[2rem] shadow-2xl flex items-center justify-between px-8 group active:scale-95 transition-all shadow-slate-900/30 overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                    <span className="text-[0.7rem] md:text-xs font-black uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform italic z-10 flex items-center gap-2 border-r border-white/20 pr-4">Add Objective</span>
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center z-10 group-hover:bg-white group-hover:text-slate-900 transition-colors">
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                </button>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000]" onClick={() => setIsMenuOpen(false)} />
                        <motion.div 
                            initial={{ y: '100%', scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: '100%', scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3.5rem] p-6 pt-8 md:p-10 z-[2001] shadow-2xl max-w-2xl mx-auto flex flex-col gap-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto shrink-0 mb-2" />
                            
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-800">New Objective</h2>
                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Detail your next move</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">What needs attention?</label>
                                    <div className="bg-slate-50 p-3 rounded-[2rem] border-2 border-transparent focus-within:bg-white focus-within:border-indigo-400 transition-all shadow-inner relative">
                                        <textarea 
                                            autoFocus 
                                            value={newTask} 
                                            onChange={e => setNewTask(e.target.value)} 
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    addTask();
                                                }
                                            }}
                                            placeholder="Write your task here..." 
                                            className="w-full bg-transparent outline-none font-medium text-slate-800 placeholder:text-slate-300 resize-none px-3 py-2 min-h-[80px]" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2"><Flame className="w-3 h-3 text-rose-500" /> Urgency Level</label>
                                        <div className="flex gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
                                            {priorities.map(p => (
                                                <button 
                                                    key={p.id} 
                                                    onClick={() => setSelectedPriority(p.id as any)} 
                                                    className={cn(
                                                        "flex-1 py-3 px-2 rounded-xl transition-all border flex flex-col items-center gap-1", 
                                                        selectedPriority === p.id ? "bg-white text-slate-900 shadow-md border-indigo-100 scale-105" : "text-slate-400 border-transparent hover:bg-slate-100"
                                                    )}
                                                >
                                                    <div className={cn("w-3 h-3 rounded-full", p.color)} />
                                                    <span className="text-[0.55rem] font-black uppercase tracking-widest">{p.text}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-slate-500 ml-2 flex items-center gap-2"><LayoutGrid className="w-3 h-3 text-blue-500" /> Category</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => setSelectedCategory(c)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest transition-all",
                                                        selectedCategory === c ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    )}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={addTask} 
                                    disabled={!newTask.trim()} 
                                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest disabled:opacity-50 active:scale-95 transition-all shadow-xl shadow-slate-900/20 italic flex items-center justify-center gap-3 hover:bg-indigo-600"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Establish Mission
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
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
    const isDarkMode = true;
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
                <div className={cn("p-8 rounded-[3rem] border shadow-xl relative overflow-hidden group transition-colors", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform", isDarkMode ? "bg-blue-500/10" : "bg-blue-50")} />
                    <Users className="w-10 h-10 text-blue-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Active Nodes</h4>
                    <p className={cn("text-4xl font-black mt-1 relative z-10", isDarkMode ? "text-white" : "text-slate-900")}>1,248</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12% this week</span>
                    </div>
                </div>
                
                <div className={cn("p-8 rounded-[3rem] border shadow-xl relative overflow-hidden group transition-colors", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform", isDarkMode ? "bg-rose-500/10" : "bg-rose-50")} />
                    <Zap className="w-10 h-10 text-rose-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Sync Operations</h4>
                    <p className={cn("text-4xl font-black mt-1 relative z-10", isDarkMode ? "text-white" : "text-slate-900")}>8,902</p>
                    <div className="mt-4 flex items-center gap-2 text-rose-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <Activity className="w-4 h-4" />
                        <span>Real-time Stream OK</span>
                    </div>
                </div>

                <div className={cn("p-8 rounded-[3rem] border shadow-xl relative overflow-hidden group transition-colors", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                    <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform", isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50")} />
                    <Database className="w-10 h-10 text-emerald-500 mb-4 relative z-10" />
                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest relative z-10">Vault Storage</h4>
                    <p className={cn("text-4xl font-black mt-1 relative z-10", isDarkMode ? "text-white" : "text-slate-900")}>1.2 GB</p>
                    <div className="mt-4 flex items-center gap-2 text-blue-500 font-bold text-xs relative z-10 uppercase tracking-widest">
                        <Monitor className="w-4 h-4" />
                        <span>42% utilized</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className={cn("p-10 rounded-[4rem] border shadow-2xl space-y-6 transition-colors", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                    <div className="flex items-center justify-between px-2">
                        <h3 className={cn("text-2xl font-black italic tracking-tighter uppercase transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>Network Traffic</h3>
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

                <div className={cn("p-10 rounded-[4rem] border shadow-2xl flex flex-col items-center justify-center space-y-6 transition-colors", isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100")}>
                    <h3 className={cn("text-2xl font-black italic tracking-tighter uppercase w-full text-left px-2 transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>Knowledge Matrix</h3>
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
                            <span className={cn("text-3xl font-black transition-colors", isDarkMode ? "text-white" : "text-slate-900")}>{liveMaterials.length + liveNews.length + liveNotices.length}</span>
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
    const navigate = useNavigate();
    const { 
        data, liveNews, addNews, deleteNews, 
        liveNotices, addNotice, deleteNotice,
        liveMaterials, addMaterial, deleteMaterial,
        liveMcqs, addMcqSet, deleteMcqSet,
        addChapter, deleteChapter, updateData,
        fetchLiveNews, fetchLiveMaterials
    } = useApp();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const isDarkMode = true; // Match app theme
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Derived stats
    const totalChapters = (Object.values(data.subjects) as any[]).reduce((acc: number, sub: any) => acc + (sub.chapters?.length || 0), 0);
    const totalPdfs = (Object.values(data.subjects) as any[]).reduce((acc: number, sub: any) => acc + (sub.pdfs?.length || 0), 0);
    const totalVideos = (Object.values(data.subjects) as any[]).reduce((acc: number, sub: any) => acc + (sub.videos?.length || 0), 0);

    const userActivityData = [
        { name: 'Mon', active: 2400, new: 400 },
        { name: 'Tue', active: 1398, new: 300 },
        { name: 'Wed', active: 9800, new: 2000 },
        { name: 'Thu', active: 3908, new: 2780 },
        { name: 'Fri', active: 4800, new: 1890 },
        { name: 'Sat', active: 3800, new: 2390 },
        { name: 'Sun', active: 4300, new: 3490 },
    ];

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Chapters', icon: BookOpen },
        { name: 'Books', icon: Book },
        { name: 'Videos', icon: Video },
        { name: 'Note Archives', icon: Archive },
        { name: 'Model Questions', icon: FileQuestion },
        { name: 'MCQs', icon: ListChecks },
        { name: 'News', icon: Newspaper },
        { name: 'Notice', icon: BellRing },
        { name: 'Users', icon: Users },
        { name: 'Support', icon: MessageSquareQuote },
        { name: 'System Logs', icon: Database },
        { name: 'Settings', icon: Settings },
    ];

    const mockUsers = [
        { id: '1', name: 'Subash Gautam', email: 'subash@aadhar.edu.np', xp: 4500, grade: 'Class 12', joinDate: '2025-01-10' },
        { id: '2', name: 'Scholar Doe', email: 'scholar@edu.np', xp: 2100, grade: 'Class 10', joinDate: '2025-02-15' },
        { id: '3', name: 'Nita Sharma', email: 'nita@edu.np', xp: 3200, grade: 'Class 11', joinDate: '2025-01-20' },
    ];

    const mockFeedback = [
        { id: 'f1', user: 'Scholar Doe', subject: 'Bug Report', content: 'The MCQ timer is too fast on Science quiz.', status: 'open' },
        { id: 'f2', user: 'Subash Gautam', subject: 'Feature Request', content: 'Dark mode for main app would be nice!', status: 'closed' },
    ];

    const contentData = [
        { name: 'PDFs', value: totalPdfs, color: '#8884d8' },
        { name: 'YouTube', value: totalVideos, color: '#ff4d4d' },
        { name: 'Chapters', value: totalChapters, color: '#00C49F' },
        { name: 'News', value: liveNews.length, color: '#FFBB28' },
    ];

    const recentActivities = [
        { type: 'pdf', title: 'Grade 10 Maths Set Theory.pdf', time: '2 mins ago', icon: FileText, color: 'text-blue-400' },
        { type: 'video', title: 'Science: Chemical Bonding Lecture', time: '15 mins ago', icon: Video, color: 'text-red-400' },
        { type: 'note', title: 'English Grammar Summary', time: '1 hour ago', icon: PenTool, color: 'text-emerald-400' },
        { type: 'user', title: 'System Notice: Maintenance tomorrow', time: '3 hours ago', icon: Bell, color: 'text-amber-400' },
    ];

    const [editingChapter, setEditingChapter] = useState<{ subId: SubjectType, chapter: Chapter } | null>(null);
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [chapterForm, setChapterForm] = useState<Partial<Chapter>>({ 
        title: '', 
        marks: 5, 
        topics: '', 
        notes: '',
        hideMarks: false
    });
    const [selectedSub, setSelectedSub] = useState<SubjectType>('Science');
    const [selectedManagerSubject, setSelectedManagerSubject] = useState<SubjectType | null>(null);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [resourceForm, setResourceForm] = useState({
        title: '',
        content: '',
        subject: 'Science' as string,
        file_url: '',
        file_url_docx: '',
        mcq_json: '',
        actual_file: null as File | null,
        actual_docx_file: null as File | null,
        news_image: null as File | null
    });

    const handleResourceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (activeTab === 'MCQs') {
                await uploadJSON(resourceForm.mcq_json);
                alert("MCQs synchronized successfully!");
            } else if (activeTab === 'News') {
                await saveNews({
                    title: resourceForm.title,
                    content: resourceForm.content,
                    file: resourceForm.news_image
                });
                alert("News synchronized successfully!");
                fetchLiveNews(); // Refresh news
            } else if (activeTab === 'Notice') {
                await saveNotice({
                    title: resourceForm.title,
                    content: resourceForm.content
                });
                alert("Notice synchronized successfully!");
                fetchLiveNews(); // Refresh notices
            } else if (['Books', 'Videos', 'Note Archives', 'Model Questions'].includes(activeTab)) {
                const categoryMap: any = {
                    'Books': 'Book',
                    'Videos': 'Video',
                    'Note Archives': 'Notes',
                    'Model Questions': 'Model Question'
                };
                
                const category = categoryMap[activeTab];
                const payload: any = {
                    title: resourceForm.title,
                    subject: resourceForm.subject,
                    description: resourceForm.content
                };

                if (category === 'Video') {
                    payload.youtube_url = resourceForm.file_url;
                } else if (category === 'Book') {
                    payload.google_drive_url = resourceForm.file_url;
                } else {
                    payload.file = resourceForm.actual_file;
                }
                
                await handleUpload(category, payload);
                alert(`${activeTab} synchronized successfully!`);
                fetchLiveMaterials(); // Refresh materials
            }
        } catch (err: any) {
            alert(`Synchronization error: ${err.message}`);
            return;
        }

        setIsResourceModalOpen(false);
        setResourceForm({
            title: '',
            content: '',
            subject: 'Science' as string,
            file_url: '',
            file_url_docx: '',
            mcq_json: '',
            actual_file: null,
            actual_docx_file: null,
            news_image: null
        });
    };

    const handleChapterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const targetSub = selectedManagerSubject || selectedSub;
        if (!chapterForm.title || !targetSub) return;
        
        try {
            // Save to Supabase
            await saveChapterNotes(chapterForm.title, targetSub, chapterForm.notes || '');
        } catch (err: any) {
            alert(`Failed to save chapter notes to Supabase: ${err.message}`);
        }

        const isEditing = !!editingChapter;
        const chapterId = isEditing ? editingChapter.chapter.id : Math.random().toString(36).substring(2, 9);
        const finalChapter = { 
            ...chapterForm, 
            id: chapterId,
            updatedAt: new Date().toISOString() 
        } as Chapter;

        let updatedSubjects = { ...data.subjects };
        if (updatedSubjects[targetSub]) {
            const chapters = [...(updatedSubjects[targetSub].chapters || [])];
            const index = chapters.findIndex(c => c.id === chapterId);
            
            if (index !== -1) {
                chapters[index] = finalChapter;
            } else if (!isEditing) {
                chapters.push(finalChapter);
            }
            
            updatedSubjects[targetSub] = {
                ...updatedSubjects[targetSub],
                chapters
            };
        }
        updateData({ ...data, subjects: updatedSubjects });
        
        setIsChapterModalOpen(false);
        setEditingChapter(null);
        setChapterForm({ title: '', marks: 5, topics: '', notes: '', hideMarks: false, contentType: 'Note' });
    };

    const renderDashboard = () => (
        <div className="space-y-10 animate-fade-up px-1">
            {/* Dynamic Welcome Heading */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                        System <span className="text-indigo-400">Zenith</span>
                    </h2>
                    <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-[0.4em]">ADMINISTRATION NEURAL LINK ACTIVE</p>
                </motion.div>
                
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                        <span className="text-[0.55rem] font-black text-slate-500 uppercase">Synchronized with</span>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Mainframe Cloud</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                        <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Scholar Nodes', value: '12.5k', change: '+12%', icon: Users, color: 'blue', detail: 'Active Registrations' },
                    { label: 'Curriculum Units', value: totalChapters, change: '+5', icon: BookOpen, color: 'indigo', detail: 'Across all subjects' },
                    { label: 'Cloud Assets', value: totalPdfs, change: 'Sync: OK', icon: FileText, color: 'emerald', detail: 'PDF Specifications' },
                    { label: 'Neural Feeds', value: liveNews.length, change: 'Latest', icon: Newspaper, color: 'rose', detail: 'Live Announcements' },
                ].map((stat: any, i) => (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-6 rounded-[2.5rem] hover:border-white/10 transition-all group relative overflow-hidden shadow-2xl"
                    >
                        <div className={cn("absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -mr-8 -mt-8", `bg-${stat.color}-500`)} />
                        
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg", `bg-${stat.color}-500/20 text-${stat.color}-400`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={cn("text-[0.6rem] font-black px-2 py-1 rounded-lg bg-white/5 border border-white/10 uppercase tracking-widest", stat.change.toString().includes('+') ? 'text-emerald-400' : 'text-slate-400')}>
                                {stat.change}
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-black text-white italic tracking-tighter">{stat.value as React.ReactNode}</span>
                            </div>
                            <p className="text-[0.5rem] font-bold text-slate-600 uppercase tracking-widest mt-2">{stat.detail}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Traffic Analytics */}
                <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-1">Knowledge Flux</h3>
                                <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Global engagement metrics across time nodes</p>
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-white/5 rounded-lg text-[0.55rem] font-black text-slate-400 uppercase border border-white/5">Weekly Phase</span>
                            </div>
                        </div>
                        
                        <div className="h-64 sm:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userActivityData}>
                                    <defs>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 900 }} 
                                        dy={10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="active" 
                                        stroke="#818cf8" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorActive)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* System Integrity & Distribution */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-2xl flex-1 flex flex-col text-center">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest italic mb-6">Asset Distribution</h3>
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={contentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {contentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-white italic">{totalChapters + totalPdfs + totalVideos}</span>
                                <span className="text-[0.4rem] font-black text-slate-500 uppercase tracking-widest">Assets</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-3">
                            {contentData.map((item, i) => (
                                <div key={i} className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[0.55rem] font-black text-slate-400 uppercase truncate">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl"><ShieldCheck className="w-5 h-5 text-white" /></div>
                                <span className="text-[0.6rem] font-black uppercase tracking-widest">System Health</span>
                            </div>
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Infrastructure Nominal</h4>
                            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: '98%' }}
                                    className="h-full bg-emerald-400"
                                />
                            </div>
                            <p className="text-[0.5rem] font-bold text-white/60 uppercase tracking-widest">All content gateways are operational.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Deploy Module', icon: PlusSquare, action: () => { setActiveTab('Chapters'); setIsChapterModalOpen(true); }, color: 'indigo' },
                    { label: 'Global Alert', icon: Megaphone, action: () => {}, color: 'rose' },
                    { label: 'Audit Logs', icon: Database, action: () => setActiveTab('System Logs'), color: 'amber' },
                    { label: 'Cloud Sync', icon: Server, action: () => {}, color: 'emerald' },
                ].map((act, i) => (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={i}
                        onClick={act.action}
                        className={cn("p-5 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center gap-3 transition-all hover:bg-white/10 hover:border-white/20 group", `text-${act.color}-400`)}
                    >
                        <act.icon className="w-6 h-6" />
                        <span className="text-[0.55rem] font-black text-white uppercase tracking-widest">{act.label}</span>
                    </motion.button>
                ))}
            </div>

            {/* Enhanced Activity Stream & System Health */}
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Live Feed</h3>
                            <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Real-time system event telemetry</p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { event: 'Content Sync', desc: 'Chapter "Molecule Structures" updated in Science', time: '2m ago', icon: RotateCw, color: 'text-indigo-400' },
                            { event: 'New Shard', desc: 'Added 12.5MB PDF to Mathematics archive', time: '12m ago', icon: Database, color: 'text-blue-400' },
                            { event: 'Security Alert', desc: 'Multi-factor auth sequence initialized from Root', time: '45m ago', icon: Shield, color: 'text-amber-400' },
                            { event: 'Traffic Surge', desc: '14.2k requests detected from Regional Hub-01', time: '1h ago', icon: BarChart3, color: 'text-rose-400' },
                        ].map((log, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i} 
                                className="flex items-start gap-5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-default group"
                            >
                                <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0", log.color)}>
                                    <log.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[0.65rem] font-black text-white uppercase tracking-widest">{log.event}</span>
                                        <span className="text-[0.6rem] font-bold text-slate-500">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium">{log.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">Active Clusters</h3>
                            <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Regional node engagement monitoring</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { hub: 'Kathmandu-01', load: '82%', users: 420, trend: 'up' },
                            { hub: 'Pokhara-04', load: '45%', users: 185, trend: 'down' },
                            { hub: 'Lalitpur-02', load: '68%', users: 310, trend: 'up' },
                            { hub: 'Bhaktapur-03', load: '22%', users: 95, trend: 'up' },
                        ].map((hub, i) => (
                            <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{hub.hub}</span>
                                    {hub.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-400" />}
                                </div>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-black text-white italic">{hub.load}</span>
                                    <span className="text-[0.55rem] font-black text-indigo-400 uppercase">{hub.users} Active</span>
                                </div>
                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: hub.load }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-indigo-400" />
                            <span className="text-[0.6rem] font-black text-white uppercase tracking-[0.2em]">Cluster Load Optimizer</span>
                        </div>
                        <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[0.55rem] font-black text-white uppercase tracking-widest">Auto-Scale ON</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderChapters = () => {
        const subId = selectedManagerSubject || 'Science';
        const sub = data.subjects[subId];
        
        return (
            <div className="space-y-6 animate-fade-up px-1 pb-32">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSelectedManagerSubject(null)}
                            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1 line-clamp-1">
                                <span className="text-indigo-400">{subId}</span> Unit Vault
                            </h2>
                            <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest">Resource Management Stream</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingChapter(null);
                            setChapterForm({ title: '', marks: 5, topics: '', notes: '', hideMarks: false, contentType: 'Note' });
                            setIsChapterModalOpen(true);
                        }}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Plus className="w-5 h-5" /> Initialize Shard
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sub.chapters?.map((chap: Chapter, i: number) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={`${chap.id}-${i}`}
                            className={cn(
                                "p-6 rounded-[2.5rem] group relative bg-slate-950 border transition-all flex flex-col justify-between min-h-[200px]",
                                chap.contentType === 'Answer' ? "border-emerald-500/20 hover:border-emerald-500/40" :
                                chap.contentType === 'Sub Topic' ? "border-amber-500/20 hover:border-amber-500/40" :
                                "border-slate-800 hover:border-indigo-500/30"
                            )}
                        >
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-[0.55rem] font-black uppercase tracking-widest border whitespace-nowrap",
                                    chap.contentType === 'Answer' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                    chap.contentType === 'Sub Topic' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                )}>
                                    {chap.contentType || 'Unit'} {i + 1}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            setEditingChapter({ subId: subId as SubjectType, chapter: chap });
                                            setChapterForm({ ...chap });
                                            setSelectedSub(subId as SubjectType);
                                            setIsChapterModalOpen(true);
                                        }}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChapter(subId as SubjectType, chap.id);
                                        }}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">
                                {chap.title}
                            </h3>
                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                                <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{chap.marks || 0} Marks</span>
                                {chap.hideMarks && <Shield className="w-3.5 h-3.5 text-amber-500 opacity-50" />}
                            </div>
                        </motion.div>
                    ))}
                    {(!sub.chapters || sub.chapters.length === 0) && (
                        <div className="col-span-full py-32 text-center bg-slate-900/20 border-4 border-dashed border-slate-800 rounded-[4rem]">
                            <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600">
                                <Archive className="w-10 h-10" />
                            </div>
                            <p className="text-xl font-black text-slate-500 uppercase italic tracking-[0.2em]">Curriculum Database Empty</p>
                            <p className="text-[0.65rem] font-bold text-slate-700 uppercase tracking-widest mt-2">Initialize modules to begin synchronization</p>
                        </div>
                    )}
                </div>

            {/* Chapter Modal */}
            <AnimatePresence>
                {isChapterModalOpen && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsChapterModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            
                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
                                {editingChapter ? 'Optimize Core Module' : 'Synthesize New Module'}
                            </h2>

                            <form onSubmit={handleChapterSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Subject Shard</label>
                                    <select 
                                        value={selectedSub}
                                        onChange={(e) => setSelectedSub(e.target.value as SubjectType)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                    >
                                        {Object.values(data.subjects).map((s: any) => <option key={s.id} value={s.id}>{s.id}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Module Designation</label>
                                        <input 
                                            type="text"
                                            placeholder="e.g., Quantum Mechanics"
                                            value={chapterForm.title}
                                            onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Content Categorization</label>
                                        <select 
                                            value={chapterForm.contentType || 'Note'}
                                            onChange={(e) => setChapterForm({ ...chapterForm, contentType: e.target.value as any })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                        >
                                            <option value="Note">Notes</option>
                                            <option value="Answer">Answers</option>
                                            <option value="Sub Topic">Sub Topics</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Weightage (Marks)</label>
                                        <input 
                                            type="number"
                                            value={chapterForm.marks}
                                            onChange={(e) => setChapterForm({ ...chapterForm, marks: Number(e.target.value) })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Complexity Index</label>
                                        <div className="flex items-center gap-2 h-full pt-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={cn("flex-1 h-1.5 rounded-full", i <= 2 ? 'bg-indigo-500' : 'bg-slate-800')} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Module Notes</label>
                                    <RichTextEditor 
                                        value={chapterForm.notes || ''}
                                        onChange={(v) => setChapterForm({ ...chapterForm, notes: v })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Topics Neural Map</label>
                                    <textarea 
                                        placeholder="e.g., Atoms, Molecules, Radiation..."
                                        value={chapterForm.topics}
                                        onChange={(e) => setChapterForm({ ...chapterForm, topics: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                                    />
                                </div>

                                <div className="flex items-center gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/80 group/toggle cursor-pointer" onClick={() => setChapterForm({ ...chapterForm, hideMarks: !chapterForm.hideMarks })}>
                                    <div className={cn("w-12 h-6 rounded-full transition-all relative shrink-0", chapterForm.hideMarks ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-800')}>
                                        <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md", chapterForm.hideMarks ? 'left-7 px-1' : 'left-1')} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[0.65rem] font-black text-white uppercase tracking-widest leading-none mb-1 group-hover/toggle:text-amber-400 transition-colors">Stealth Protocol</span>
                                        <span className="text-[0.55rem] font-bold text-slate-500 uppercase">Hide Weightage Marks from UI</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[0.7rem] shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all active:scale-95 outline-none"
                                    >
                                        {editingChapter ? 'Authorize Synchronization' : 'Initialize Shard'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
    };

    const renderResourceManager = (title: string, items: any[], icon: any) => {
        const Icon = icon;
        const filteredItems = items.filter(m => m.subject === selectedManagerSubject);
        
        return (
            <div className="space-y-8 animate-fade-up px-1 pb-32">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <button 
                            onClick={() => setSelectedManagerSubject(null)}
                            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">
                                <span className="text-indigo-400">{selectedManagerSubject}</span> • {title}
                            </h2>
                            <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.4em]">Resource Synchronization Protocol</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setResourceForm({ 
                                title: '', 
                                content: '', 
                                subject: selectedManagerSubject || 'Science', 
                                file_url: '', 
                                file_url_docx: '', 
                                mcq_json: '',
                                actual_file: null,
                                actual_docx_file: null,
                                news_image: null
                            });
                            setIsResourceModalOpen(true);
                        }}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-[0.7rem] uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Zap className="w-5 h-5" /> Integrate Data
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.length === 0 && (
                        <div className="col-span-full py-32 text-center bg-slate-900/20 border-4 border-dashed border-slate-800 rounded-[4rem]">
                             <Archive className="w-16 h-16 text-slate-600 mx-auto mb-6 opacity-40" />
                             <p className="text-xl font-black text-slate-500 uppercase italic tracking-[0.2em]">Sector Offline</p>
                             <p className="text-[0.65rem] font-bold text-slate-700 uppercase tracking-widest mt-2">No active assets in this subject matrix</p>
                        </div>
                    )}
                    {filteredItems.map((n: any, i: number) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            key={`${n.id}-${i}`} 
                            className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-7 rounded-[3rem] group relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-2xl"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => {
                                            if (activeTab === 'News') deleteNews(n.id);
                                            else if (activeTab === 'Notice') deleteNotice(n.id);
                                            else if (activeTab === 'MCQs') deleteMcqSet(n.id);
                                            else deleteMaterial(n.id);
                                        }}
                                        className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-lg border border-rose-500/10"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-2">
                                    {n.title || n.text || "Segment Unit"}
                                </h3>
                                
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-slate-500" />
                                        <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest">
                                            {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                        <span className="text-[0.55rem] font-black text-indigo-400 uppercase tracking-widest leading-none">
                                            {n.type === 'note_archive' ? 'Notes' : n.type === 'model_question' ? 'Exam' : n.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <a 
                                    href={n.file_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[0.65rem] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
                                >
                                    <Eye className="w-4 h-4" /> View Node
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    };

    const renderSubjectSelector = () => (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col gap-2">
                <h2 className={cn("text-2xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>Global Archive Sector</h2>
                <p className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Select specialized shard for {activeTab} protocol</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {(Object.keys(data.subjects) as SubjectType[]).map((subId) => {
                    const cfg = SUBJECTS_CONFIG[subId] || SUBJECTS_CONFIG['English'];
                    const subData = data.subjects[subId];
                    const itemCount = activeTab === 'Chapters' ? (subData.chapters?.length || 0) : 
                                     activeTab === 'Videos' ? (subData.videos?.length || 0) :
                                     liveMaterials.filter(m => m.subject === subId && 
                                        (activeTab === 'Books' ? m.type === 'textbook' :
                                         activeTab === 'Note Archives' ? m.type === 'note_archive' :
                                         activeTab === 'Model Questions' ? m.type === 'model_question' : false)
                                     ).length;

                    return (
                        <button
                            key={subId}
                            onClick={() => setSelectedManagerSubject(subId)}
                            className={cn("backdrop-blur-xl border p-8 rounded-[2.5rem] transition-all group text-left relative overflow-hidden", isDarkMode ? "bg-slate-900/40 border-slate-800 hover:border-indigo-500" : "bg-white border-slate-100 shadow-sm hover:border-indigo-500 hover:shadow-lg")}
                        >
                            <div className={cn("absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -translate-y-1/2 translate-x-1/2", `bg-${cfg.color}-500`)} />
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg bg-linear-to-br text-white", cfg.gradient)}>
                                <cfg.icon className="w-6 h-6" />
                            </div>
                            <h3 className={cn("text-lg font-black uppercase italic mb-1", isDarkMode ? "text-white" : "text-slate-900")}>{subId}</h3>
                            <p className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">{itemCount} Active Units</p>
                            <div className="mt-6 flex items-center gap-2 group-hover:gap-3 transition-all duration-500">
                                <span className={cn("text-[0.6rem] font-black uppercase tracking-[0.25em]", `text-${cfg.color}-500`)}>Initialize Segment</span>
                                <ArrowRight className={cn("w-3.5 h-3.5", `text-${cfg.color}-500`)} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className={cn("flex min-h-screen font-sans transition-colors", isDarkMode ? "bg-slate-950 text-white" : "bg-[#F8FAFC] text-slate-900")}>
            {/* Resource Modal */}
            <AnimatePresence>
                {isResourceModalOpen && (
                    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 text-slate-300">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setIsResourceModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 bg-linear-to-r from-white to-slate-500 bg-clip-text text-transparent">
                                Add {activeTab?.slice(0, -1)}
                            </h2>
                            <form onSubmit={handleResourceSubmit} className="space-y-6 text-left">
                                {['Books', 'Videos', 'Note Archives', 'Model Questions', 'MCQs'].includes(activeTab) && (
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Subject Shard</label>
                                        <select 
                                            value={resourceForm.subject}
                                            onChange={(e) => setResourceForm({ ...resourceForm, subject: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 outline-none"
                                        >
                                            {Object.keys(data.subjects).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Title / Header</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter unit descriptor..."
                                        value={resourceForm.title}
                                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                        required
                                    />
                                </div>
                                {activeTab === 'MCQs' ? (
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Questions (JSON Array)</label>
                                        <textarea 
                                            placeholder='[{"question": "...", "options": ["...", "..."], "correct": 0}]'
                                            value={resourceForm.mcq_json}
                                            onChange={(e) => setResourceForm({ ...resourceForm, mcq_json: e.target.value })}
                                            rows={6}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none font-mono"
                                            required
                                        />
                                    </div>
                                ) : activeTab === 'Videos' ? (
                                    <div className="space-y-2">
                                        <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">YouTube Link</label>
                                        <input 
                                            type="text"
                                            placeholder="https://youtube.com/watch?v=..."
                                            value={resourceForm.file_url}
                                            onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                            required
                                        />
                                    </div>
                                ) : (activeTab === 'News' || activeTab === 'Notice') ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Content Stream</label>
                                            <textarea 
                                                placeholder="Write detailed information..."
                                                value={resourceForm.content}
                                                onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })}
                                                rows={4}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                                                required
                                            />
                                        </div>
                                        {activeTab === 'News' && (
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">News Photo (Optional)</label>
                                                <input 
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setResourceForm({ ...resourceForm, news_image: file });
                                                        }
                                                    }}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-[0.6rem] file:font-black file:uppercase file:bg-indigo-600 file:text-white"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">
                                                {['Note Archives', 'Model Questions'].includes(activeTab) ? 'Select PDF File' : 'Primary Path (PDF URL)'}
                                            </label>
                                            {['Note Archives', 'Model Questions'].includes(activeTab) ? (
                                                <input 
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setResourceForm({ ...resourceForm, actual_file: file, file_url: file.name });
                                                        }
                                                    }}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-[0.6rem] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                                                    required
                                                />
                                            ) : (
                                                <input 
                                                    type="text" 
                                                    placeholder="Drive link, PDF URL, etc..."
                                                    value={resourceForm.file_url}
                                                    onChange={(e) => setResourceForm({ ...resourceForm, file_url: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                                />
                                            )}
                                        </div>
                                        {['Note Archives', 'Model Questions'].includes(activeTab) && (
                                            <div className="space-y-2">
                                                <label className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-[0.3em]">Select WORD File (Optional)</label>
                                                <input 
                                                    type="file"
                                                    accept=".doc,.docx"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setResourceForm({ ...resourceForm, actual_docx_file: file, file_url_docx: file.name });
                                                        }
                                                    }}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500/50 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:text-[0.6rem] file:font-black file:uppercase file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="submit"
                                        className="w-full py-5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[0.7rem] shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all active:scale-95 outline-none"
                                    >
                                        Execute Synchronization
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        {/* Sidebar for Desktop */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/50 backdrop-blur-3xl border-r border-slate-800 transition-transform lg:relative lg:translate-x-0 pt-8 flex flex-col",
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="absolute top-4 right-4 lg:hidden p-2 text-slate-500 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="px-8 mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white font-black text-xl italic">A</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white italic tracking-tighter leading-none">AADHAR</h2>
                            <p className="text-[0.55rem] font-black text-slate-500 uppercase tracking-[0.4em]">Pathshala Admin</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => {
                                setActiveTab(item.name);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative",
                                activeTab === item.name 
                                    ? "bg-indigo-600/10 text-indigo-400" 
                                    : "hover:bg-slate-900/50 text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform group-hover:scale-110",
                                    activeTab === item.name ? "text-indigo-500" : "text-slate-600"
                                )} />
                                <span className="text-[0.7rem] font-black uppercase tracking-widest italic">{item.name}</span>
                            </div>
                            {activeTab === item.name && (
                                <motion.div 
                                    layoutId="active-tab"
                                    className="absolute inset-0 border border-indigo-500/30 rounded-2xl bg-indigo-500/5"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[0.65rem] border border-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        Exit Terminal
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className={cn("flex-1 overflow-y-auto flex flex-col transition-colors min-h-screen", isDarkMode ? "bg-linear-to-br from-[#020617] via-[#0f172a] to-[#020617]" : "bg-[#F8FAFC]")}>
                {/* Navbar */}
                <header className={cn("h-20 backdrop-blur-md border-b flex items-center justify-between px-6 md:px-8 sticky top-0 z-40 transition-colors", isDarkMode ? "bg-slate-950/20 border-slate-800/50" : "bg-white/80 border-slate-200")}>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <ToolLayout className="w-6 h-6" />
                        </button>
                        <div className="relative hidden md:block md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="text" 
                                placeholder="Search system resources..."
                                className={cn("w-full border rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-indigo-500/50 transition-all", isDarkMode ? "bg-slate-900/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700")}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <button onClick={() => navigate('/')} className={cn("px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all", isDarkMode ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
                            Exit Dashboard
                        </button>
                        <div className="flex items-center gap-1 md:gap-2">
                            <button className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all relative", isDarkMode ? "hover:bg-slate-900 text-slate-500" : "hover:bg-slate-100 text-slate-400")}>
                                <BellRing className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />
                            </button>
                        </div>

                        <div className={cn("h-8 w-px hidden sm:block", isDarkMode ? "bg-slate-800" : "bg-slate-200")} />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className={cn("text-xs font-black uppercase italic", isDarkMode ? "text-white" : "text-slate-900")}>Administrator</p>
                                <p className="text-[0.6rem] font-bold text-indigo-400 uppercase tracking-widest">Master Root</p>
                            </div>
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-linear-to-tr from-indigo-500/20 to-purple-500/20 p-0.5 rounded-xl border border-indigo-500/30">
                                <div className={cn("w-full h-full rounded-[10px] flex items-center justify-center overflow-hidden", isDarkMode ? "bg-slate-900" : "bg-white")}>
                                    <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 space-y-8 w-full">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={cn("text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-none mb-1", isDarkMode ? "text-white" : "text-slate-900")}>{activeTab}</h1>
                            <p className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-500 uppercase tracking-[0.4em]">Aadhar Neural Terminal • v2.0-Alpha</p>
                        </div>
                        <div className="hidden sm:flex gap-3">
                            <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[0.65rem] shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:bg-indigo-500 transition-all">
                                <Plus className="w-4 h-4" />
                                New Operation
                            </button>
                        </div>
                    </div>

                    {activeTab === 'Dashboard' && renderDashboard()}
                    {activeTab === 'News' && renderResourceManager('Live News Stream', liveNews, Newspaper)}
                    {activeTab === 'Notice' && renderResourceManager('Official Notices', liveNotices, BellRing)}
                    {activeTab === 'Chapters' && (selectedManagerSubject ? renderChapters() : renderSubjectSelector())}
                    {activeTab === 'Books' && (selectedManagerSubject ? renderResourceManager('Digital Bookshelf', liveMaterials.filter(m => m.type === 'textbook'), Book) : renderSubjectSelector())}
                    {activeTab === 'Videos' && (selectedManagerSubject ? renderResourceManager('Video Lectures', liveMaterials.filter(m => m.type === 'video'), Video) : renderSubjectSelector())}
                    {activeTab === 'Note Archives' && (selectedManagerSubject ? renderResourceManager('Study Note Repository', liveMaterials.filter(m => m.type === 'note_archive'), Archive) : renderSubjectSelector())}
                    {activeTab === 'Model Questions' && (selectedManagerSubject ? renderResourceManager('Model Question Sets', liveMaterials.filter(m => m.type === 'model_question'), FileQuestion) : renderSubjectSelector())}
                    {activeTab === 'MCQs' && (selectedManagerSubject ? renderResourceManager('MCQ Assessment Nodes', liveMcqs, ListChecks) : renderSubjectSelector())}
                    {activeTab === 'Feedback' && (
                        <div className="space-y-6 animate-fade-up">
                            <h2 className={cn("text-2xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>Scholars Voice</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {mockFeedback.map((f, i) => (
                                    <div key={`${f.id}-${i}`} className={cn("p-6 border rounded-[2rem] flex items-center justify-between", isDarkMode ? "bg-slate-900/40 border-slate-800 text-white" : "bg-white border-slate-100 shadow-sm text-slate-900")}>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[0.55rem] font-black text-indigo-500 uppercase tracking-widest">{f.subject}</span>
                                                <span className="text-[0.55rem] text-slate-300">•</span>
                                                <span className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">{f.user}</span>
                                            </div>
                                            <p className={cn("text-xs font-medium", isDarkMode ? "text-white" : "text-slate-700")}>{f.content}</p>
                                        </div>
                                        <button className="text-[0.6rem] font-black uppercase text-slate-400 hover:text-indigo-600 transition-all">Resolve</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'Users' && (
                        <div className="space-y-6 animate-fade-up">
                            <div className="flex items-center justify-between">
                                <h2 className={cn("text-2xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>Scholar Database</h2>
                                <button className={cn("px-6 py-3 rounded-xl font-black text-[0.65rem] uppercase tracking-widest border transition-all", isDarkMode ? "bg-white/5 text-slate-400 border-slate-800" : "bg-white text-slate-400 border-slate-200 shadow-sm hover:text-slate-900")}>Export CSV</button>
                            </div>
                            <div className={cn("rounded-[2.5rem] border overflow-hidden", isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                                <table className="w-full text-left">
                                    <thead className={cn("border-b", isDarkMode ? "bg-slate-950/50 border-slate-800" : "bg-slate-50 border-slate-100")}>
                                        <tr>
                                            <th className="px-6 py-4 text-[0.6rem] font-black uppercase text-slate-500 tracking-widest text-[#1D4ED8]">Scholar</th>
                                            <th className="px-6 py-4 text-[0.6rem] font-black uppercase text-slate-500 tracking-widest">Grade</th>
                                            <th className="px-6 py-4 text-[0.6rem] font-black uppercase text-slate-500 tracking-widest text-[#EF4444]">XP</th>
                                            <th className="px-6 py-4 text-[0.6rem] font-black uppercase text-slate-500 tracking-widest">Join Date</th>
                                            <th className="px-6 py-4 text-[0.6rem] font-black uppercase text-slate-500 tracking-widest">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={cn("divide-y", isDarkMode ? "divide-slate-800/50" : "divide-slate-50")}>
                                        {mockUsers.map(u => (
                                            <tr key={u.id} className={cn("transition-colors", isDarkMode ? "hover:bg-slate-800/20" : "hover:bg-slate-50/50")}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 font-black">
                                                            {u.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className={cn("text-sm font-black italic", isDarkMode ? "text-white" : "text-slate-900")}>{u.name}</div>
                                                            <div className="text-[0.6rem] text-slate-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">{u.grade}</td>
                                                <td className="px-6 py-4 text-xs font-black text-indigo-600">{u.xp}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-400">{u.joinDate}</td>
                                                <td className="px-6 py-4">
                                                    <button className="text-[0.6rem] font-black uppercase tracking-widest text-indigo-600 hover:underline">Manage</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'Support' && (
                        <div className="space-y-6 animate-fade-up">
                            <h2 className={cn("text-2xl font-black italic uppercase tracking-tighter", isDarkMode ? "text-white" : "text-slate-900")}>Support & Feedback</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {mockFeedback.map(f => (
                                    <div key={f.id} className={cn("p-6 border rounded-[2rem] flex items-center justify-between", isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                                        <div className="flex items-start gap-4">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDarkMode ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-400")}>
                                                <MessageSquareQuote className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className={cn("text-[0.7rem] font-black uppercase italic", isDarkMode ? "text-white" : "text-slate-900")}>{f.subject}</h3>
                                                    <span className={cn("text-[0.5rem] font-black px-2 py-0.5 rounded border uppercase tracking-widest", f.status === 'open' ? 'border-amber-500/50 text-amber-500 bg-amber-500/5' : 'border-emerald-500/50 text-emerald-500 bg-emerald-500/5')}>
                                                        {f.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-2 max-w-lg">{f.content}</p>
                                                <div className="text-[0.55rem] font-black text-slate-400 uppercase tracking-widest">Scholar: {f.user}</div>
                                            </div>
                                        </div>
                                        <button className={cn("px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors border", isDarkMode ? "bg-slate-950 text-slate-400 border-slate-800" : "bg-white text-slate-400 border-slate-100 shadow-sm")}>Resolve</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'System Logs' && (
                        <div className={cn("p-12 text-center rounded-[3rem] border", isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-100 shadow-sm")}>
                             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <Database className="w-10 h-10" />
                             </div>
                             <h2 className={cn("text-xl font-black uppercase italic mb-2", isDarkMode ? "text-white" : "text-slate-900")}>System Diagnostics</h2>
                             <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest italic">Logs streaming suspended due to high traffic</p>
                         </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const OldImageCard = ({ img, onClick }: { img: any, onClick: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    return (
        <div 
            onClick={onClick}
            className="w-full break-inside-avoid rounded-2xl overflow-hidden cursor-pointer relative group bg-slate-100 shadow-sm inline-block"
        >
            {!isLoaded && (
                <div className="w-full h-64 animate-pulse bg-slate-200" />
            )}
            <img 
                src={img.webformatURL} 
                alt="Student related" 
                onLoad={() => setIsLoaded(true)}
                className={`w-full h-auto transform group-hover:scale-105 transition-all duration-700 block ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />
        </div>
    );
};

const OldPicturesPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [similarImages, setSimilarImages] = useState<any[]>([]);
    const [similarLoading, setSimilarLoading] = useState(false);
    const [hasAttemptedSimilar, setHasAttemptedSimilar] = useState(false);

    // Using provided client-side API key for prototyping
    const API_KEY = '55653734-9bcb53c51c27b0c301beab7dc';
    const DEFAULT_QUERY = 'education student learning handwritten diagram school';

    const fetchImages = async (searchQuery: string, pageNum: number, isNewSearch: boolean = false) => {
        if (!window.navigator.onLine) {
            setLoading(false);
            setLoadingMore(false);
            return;
        }
        if (isNewSearch) {
            setLoading(true);
            setImages([]);
        } else {
            setLoadingMore(true);
        }
        
        try {
            const currentQ = searchQuery.trim() || DEFAULT_QUERY;
            const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(currentQ)}&image_type=photo&per_page=30&page=${pageNum}`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                setImages(prev => isNewSearch ? data.hits : [...prev, ...data.hits]);
                setHasMore(data.hits.length === 30);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchImages(query, 1, true);
        // eslint-disable-next-line
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.navigator.onLine) return alert("External imagery requires an active link.");
        setPage(1);
        setHasMore(true);
        fetchImages(query, 1, true);
        setSelectedImage(null);
    };

    if (!window.navigator.onLine && images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                 <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <SearchX className="w-10 h-10 text-slate-300" />
                 </div>
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Network Link Severed</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem] max-w-xs mt-3">Image synchronization requires an active uplink to our repositories.</p>
                 <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[0.6rem]">Back to Core</button>
            </div>
        );
    }

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchImages(query, nextPage, false);
        }
    }, [loadingMore, hasMore, page, query]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );
        const sentinel = document.getElementById('sentinel');
        if (sentinel) observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMore]);

    const openImage = (img: any) => {
        setSelectedImage(img);
        setSimilarLoading(false);
        setHasAttemptedSimilar(false);
        setSimilarImages([]);
        // Auto-load similar images for a seamless discovery experience
        setTimeout(() => {
            const firstTag = img.tags.split(',')[0].trim();
            const searchTag = firstTag || 'study';
            fetchSimilar(searchTag, img.id);
        }, 300);
    };

    const fetchSimilar = async (tag: string, currentId: number) => {
        setSimilarLoading(true);
        setHasAttemptedSimilar(true);
        try {
            const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(tag)}&image_type=photo&per_page=12`);
            const data = await res.json();
            setSimilarImages(data.hits?.filter((h: any) => h.id !== currentId) || []);
        } catch (error) {
            console.error("Discovery error", error);
        } finally {
            setSimilarLoading(false);
        }
    };

    const handleDownload = async (url: string, id: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `student-pic-${id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
            window.open(url, '_blank');
        }
    };

    return (
        <div className="pt-4 pb-20 relative">
            <header className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-[#020617] italic tracking-tighter uppercase leading-none">Pictures</h1>
                </div>
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </header>

            <div className="mb-6">
                <form onSubmit={handleSearch}>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search topics (e.g. math diagram, essay notes)..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] shadow-sm"
                        />
                    </div>
                </form>
            </div>
            
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {images.map((img, idx) => (
                    <NewImageCard key={`${img.id}-${idx}`} img={img} onClick={() => openImage(img)} onDownload={handleDownload} onLike={() => {}} />
                ))}
            </div>

            {loading || loadingMore ? (
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 mt-4">
                    {[...Array(6)].map((_, i) => (
                        <div 
                            key={i} 
                            className="w-full bg-slate-200 animate-pulse rounded-2xl break-inside-avoid shadow-sm inline-block"
                            style={{ height: `${Math.floor(Math.random() * (400 - 150 + 1) + 150)}px` }}
                        />
                    ))}
                </div>
            ) : null}

            {/* Sentinel for infinite scroll */}
            <div id="sentinel" className="h-10 mt-4" />

            {/* Full-Screen Image Workspace */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 150 }}
                        id="pictures-modal"
                        className="fixed inset-0 z-[2000] bg-white overflow-y-auto custom-scrollbar"
                    >
                        {/* Immersive Header */}
                        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedImage(null)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-800 hover:bg-slate-200 transition-all active:scale-90">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-blue-600">Image Workspace</span>
                                    <span className="text-[0.8rem] font-bold text-slate-400 line-clamp-1 max-w-[120px] sm:max-w-xs">{selectedImage.tags}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => handleDownload(selectedImage.largeImageURL, selectedImage.id)}
                                    className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest hidden sm:block">Full Resolution</span>
                                </button>
                                <button className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all">
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="max-w-4xl mx-auto px-6 pt-10 pb-32">
                            {/* Cinematic Projection */}
                            <motion.div 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="relative rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] border-2 border-slate-50 bg-slate-50 group mb-12"
                            >
                                <img 
                                    src={selectedImage.largeImageURL} 
                                    alt="Academic Asset" 
                                    className="w-full h-auto block transform group-hover:scale-[1.02] transition-transform duration-1000" 
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-2">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />
                                            ))}
                                        </div>
                                        <span className="text-white text-[0.7rem] font-bold">Recommended for Science & Graphics</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Intelligent Action Panel */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(selectedImage.largeImageURL);
                                        alert("Direct link copied to clipboard!");
                                    }}
                                    className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:border-blue-500 hover:shadow-xl transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                        <Copy className="w-5 h-5" />
                                    </div>
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900">Copy Link</span>
                                </button>
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                                        <Heart className="w-5 h-5 fill-emerald-500" />
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{selectedImage.likes}</span>
                                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Endorsed</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
                                        <Tag className="w-5 h-5" />
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    </div>
                                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-2">Palettes</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-3">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-slate-900">Enhanced</span>
                                    <span className="text-[0.55rem] font-bold text-slate-400 uppercase tracking-widest">AI Upscaled</span>
                                </div>
                            </div>

                            {/* Related Discovery Stream */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <h4 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase leading-none">The <span className="text-blue-600">Discovery</span> Stream</h4>
                                        <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-2">Contextually synchronized assets for your projects</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[0.6rem] font-black uppercase tracking-widest">Live Sync</span>
                                    </div>
                                </div>

                                {similarLoading ? (
                                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-[3rem] border border-slate-100 italic transition-all">
                                        <RotateCw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                        <span className="text-[0.7rem] font-black uppercase tracking-widest text-slate-400">Synthesizing Related Content...</span>
                                    </div>
                                ) : (
                                    <div className="columns-2 md:columns-3 gap-6 space-y-6">
                                        {similarImages.map((img, idx) => (
                                            <motion.div
                                                key={`${img.id}-${idx}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <OldImageCard 
                                                    img={img} 
                                                    onClick={() => {
                                                        const modalScroll = document.getElementById('pictures-modal');
                                                        if (modalScroll) modalScroll.scrollTo({ top: 0, behavior: 'smooth' });
                                                        openImage(img);
                                                    }} 
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NewImageCard = ({ img, onClick, onDownload, onLike }: { img: any, onClick: () => void, onDownload: (url:string, id:string) => void, onLike: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [liked, setLiked] = useState(false);
    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 border border-slate-50 flex flex-col"
        >
            <div className="relative overflow-hidden cursor-pointer" onClick={onClick}>
                {!isLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-slate-50 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-slate-200" />
                    </div>
                )}
                <img 
                    src={img.webformatURL} 
                    alt={img.tags}
                    onLoad={() => setIsLoaded(true)}
                    className={cn(
                        "w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700",
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-2 left-2 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/10">
                    <ImageIcon className="w-3 h-3 text-white/80" />
                    <span className="text-[0.55rem] font-bold text-white tracking-wide">
                        {Math.floor(Math.random() * 50) + 10}
                    </span>
                </div>
            </div>

            <div className="p-3">
                <div className="mb-2">
                    <h3 className="font-bold text-slate-800 text-[0.85rem] line-clamp-1 leading-tight tracking-tight capitalize">
                        {img.tags.split(',')[0]}
                    </h3>
                    <p className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {img.tags.split(',')[1] || 'General'}
                    </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setLiked(!liked); onLike(); }}
                            className={cn("transition-colors p-1", liked ? "text-rose-500" : "text-slate-300 hover:text-rose-500")}
                        >
                            <Heart className={cn("w-4 h-4", liked ? "fill-current" : "")} />
                        </button>
                        <button className="text-slate-300 hover:text-blue-500 transition-colors p-1">
                            <Bookmark className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="text-slate-300 hover:text-slate-900 transition-colors p-1">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * Universal Modal for Image and Video viewing
 */
const ImageVideoModal = ({ item, type, onClose }: { item: any, type: 'image' | 'video', onClose: () => void }) => {
    const [showActions, setShowActions] = useState(false);
    
    // Download logic moved inside
    const handleDownload = async () => {
        const url = type === 'image' ? (item.largeImageURL || item.webformatURL) : (item.videos?.large?.url || item.videos?.medium?.url);
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `Aadhar_${type}_${item.id}.${type === 'image' ? 'jpg' : 'mp4'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex flex-col bg-slate-900/95 backdrop-blur-xl touch-none"
            onClick={onClose}
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between p-4 z-20" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setShowActions(true)} 
                    className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all border border-white/10"
                >
                    <AlignLeft className="w-6 h-6" />
                </button>
                <div className="flex-1 px-4 text-center">
                    <h4 className="text-white font-black text-[0.6rem] uppercase tracking-widest opacity-40">Preview Mode</h4>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all border border-white/10"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative" onClick={e => e.stopPropagation()}>
                {type === 'image' ? (
                    <motion.img 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        src={item.largeImageURL || item.webformatURL} 
                        alt={item.tags}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black"
                    >
                        <video 
                            src={item.videos?.large?.url || item.videos?.medium?.url || item.videos?.small?.url} 
                            className="w-full h-full object-contain" 
                            controls 
                            autoPlay 
                            playsInline
                            crossOrigin="anonymous"
                        />
                    </motion.div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="p-8 text-center" onClick={e => e.stopPropagation()}>
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-1">{item.tags.split(',')[0]}</h3>
                 <p className="text-white/40 font-bold text-[0.6rem] uppercase tracking-widest mt-1">
                    {item.user === "Wikimedia Commons" ? "Free Media • Wikimedia Commons" : "High Quality Asset • Pixabay Archive"}
                 </p>
            </div>

            {/* Action Popup Screen */}
            <AnimatePresence>
                {showActions && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-white/10 backdrop-blur-3xl flex flex-col items-center justify-center gap-12"
                        onClick={e => { e.stopPropagation(); setShowActions(false); }}
                    >
                        <div className="flex flex-col items-center gap-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(); setShowActions(false); }}
                                className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
                            >
                                <Download className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-xs tracking-widest">Download</span>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                                className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
                            >
                                <Share2 className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-xs tracking-widest">Share</span>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                                className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-amber-500/20 active:scale-95 transition-all"
                            >
                                <Save className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-xs tracking-widest">Save</span>
                        </div>

                        <button 
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white"
                            onClick={() => setShowActions(false)}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PicturesPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('For You');
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isHD, setIsHD] = useState(false);
    
    const [selectedImage, setSelectedImage] = useState<any | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    const API_KEY = '55653734-9bcb53c51c27b0c301beab7dc';
    const DEFAULT_QUERY = 'nature wallpaper learning';

    const CATEGORIES = [
        { name: 'Animals', icon: Cat, color: 'bg-orange-50 text-orange-500', borderColor: 'border-orange-100', query: 'wild animals' },
        { name: 'Birds', icon: Bird, color: 'bg-blue-50 text-blue-500', borderColor: 'border-blue-100', query: 'birds' },
        { name: 'Flowers', icon: Leaf, color: 'bg-emerald-50 text-emerald-500', borderColor: 'border-emerald-100', query: 'flowers' },
        { name: 'Drawing', icon: Pencil, color: 'bg-rose-50 text-rose-500', borderColor: 'border-rose-100', query: 'sketch drawing' },
    ];

    const TABS = ['For You', 'Trending', 'New', 'Collection'];

    const fetchImages = async (searchQuery: string, pageNum: number, category: string, isNewSearch: boolean = false) => {
        if (!window.navigator.onLine) {
            setLoading(false); setLoadingMore(false); return;
        }
        if (isNewSearch) { setLoading(true); setImages([]); } 
        else { setLoadingMore(true); }
        
        try {
            let currentQ = searchQuery.trim();
            const pixabayCategory = (!category || category === 'All') ? '' : category.toLowerCase();
            
            const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(currentQ || pixabayCategory || DEFAULT_QUERY)}&image_type=photo&per_page=30&page=${pageNum}&safesearch=true&orientation=vertical`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                setImages(prev => isNewSearch ? data.hits : [...prev, ...data.hits]);
                setHasMore(data.hits.length === 30);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchImages('', 1, 'All', true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setHasMore(true);
        fetchImages(query, 1, activeCategory, true);
    };

    const handleCategoryClick = (cat: string) => {
        const newCat = activeCategory === cat ? 'All' : cat;
        setActiveCategory(newCat);
        setPage(1);
        setHasMore(true);
        fetchImages(query, 1, newCat, true);
    };

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchImages(query, nextPage, activeCategory, false);
        }
    }, [loadingMore, hasMore, page, query, activeCategory]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) loadMore();
        }, { threshold: 0.1 });
        const sentinel = document.getElementById('sentinel-pics');
        if (sentinel) observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMore]);

    const handleDownload = async (url: string, id: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `Aadhar_Image_${id}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            window.open(url, '_blank');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] pb-32">
            {/* Header */}
            <header className="p-2 pt-4 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-600"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0 pr-2">
                        <h1 className="text-lg font-black text-slate-800 tracking-tight italic uppercase whitespace-nowrap overflow-hidden text-ellipsis">Pictures Library</h1>
                        <p className="text-blue-500 font-bold text-[0.5rem] tracking-widest uppercase truncate">Explore. Learn. Remember forever. ✨</p>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="px-2 mb-4 flex gap-2">
                <div className="flex-1 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center px-3 relative group transition-all">
                    <Search className="w-3.5 h-3.5 text-slate-300 mr-2" />
                    <input 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search pictures..."
                        className="w-full bg-transparent py-2.5 text-[0.7rem] font-bold text-slate-700 placeholder:text-slate-300 outline-none"
                    />
                </div>
                <button 
                    onClick={handleSearch}
                    className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-100"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>

            {/* Categories */}
            <div className="px-2 mb-6 grid grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
                            activeCategory === cat.name 
                                ? "bg-white shadow-md border-slate-200" 
                                : cn(cat.color, cat.borderColor)
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-sm bg-white",
                        )}>
                            <cat.icon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-[0.5rem] uppercase tracking-widest text-center truncate w-full">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tabs Header */}
            <div className="px-1 flex items-center justify-between border-b border-slate-100 mb-4 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                <div className="flex gap-4 px-2">
                    {TABS.slice(0, 2).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-3 text-[0.6rem] font-black uppercase tracking-widest italic transition-all relative px-1",
                                activeTab === tab ? "text-slate-900" : "text-slate-400"
                            )}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div layoutId="pic-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 px-2 mb-2">
                    <button className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg text-[0.5rem] font-bold text-slate-600">
                        More <ChevronDown className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Masonry Grid */}
            <div className="px-1.5">
                {loading && images.length === 0 ? (
                    <div className="w-full py-32 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-bold text-[0.6rem] uppercase tracking-[0.2em] animate-pulse italic">Scanning library...</p>
                    </div>
                ) : (
                    <div className="columns-2 lg:columns-4 gap-1.5 space-y-1.5">
                        {images.map((img, idx) => (
                            <div key={`${img.id}-${idx}`} className="break-inside-avoid">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (idx % 10) * 0.05 }}
                                    className="group relative rounded-xl overflow-hidden cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
                                    onClick={() => setSelectedImage(img)}
                                >
                                    <img 
                                        src={img.webformatURL} 
                                        alt={img.tags}
                                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            // Fallback to LoremFlickr if Pixabay image fails
                                            if (!target.src.includes('loremflickr')) {
                                                const tag = img.tags.split(',')[0] || 'nature';
                                                target.src = `https://loremflickr.com/400/600/${encodeURIComponent(tag)}?lock=${img.id}`;
                                            }
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                        <p className="text-white font-bold text-[0.65rem] truncate">{img.tags.split(',')[0]}</p>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {hasMore && images.length > 0 && (
                <div id="sentinel-pics" className="h-40 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
            )}

            {/* Expanded Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <ImageVideoModal 
                        item={selectedImage} 
                        type="image" 
                        onClose={() => setSelectedImage(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
const AppContent = () => {
    const { user, isInitializing } = useApp();

    if (isInitializing) {
        return (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F0F9FF] z-[4000]">
                <Loader2 className="w-12 h-12 text-[#16423C] animate-spin mb-4" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs animate-pulse">Initializing Aadhar...</p>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
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
                <Route path="/hub/:name/textbooks" element={<DigitalTextbookList />} />
                <Route path="/hub/:name/model" element={<ModelList />} />
                <Route path="/hub/:name/mcq-sets" element={<MCQTestSelection />} />
                <Route path="/hub/:name/mcq-test/:setIndex" element={<MCQTestPlayer />} />
                <Route path="/ai" element={<AITutor />} />
                <Route path="/mock" element={<MockTest />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/admin-portal" element={<AdminPortalPage />} />
                <Route path="/tools" element={<AadharToolkit />} />
                <Route path="/tools/calculator" element={<CalculatorSuite />} />
                <Route path="/tools/notes" element={<NotePadPage />} />
                <Route path="/tools/dictionary" element={<DictionaryPage />} />
                <Route path="/tools/nepali-dictionary" element={<NepaliDictionaryPage />} />
                <Route path="/tools/timer" element={<FocusTimerPage />} />
                <Route path="/tools/timer/fullscreen" element={<FocusTimerPage />} />
                <Route path="/tools/calendar" element={<ExamCalendar />} />
                <Route path="/tools/formulas" element={<FormulaBankPage />} />
                <Route path="/tools/videos" element={<VisualsPage />} />
                <Route path="/tools/words" element={<WordCounterPage />} />
                <Route path="/tools/periodic-table" element={<PeriodicTablePage />} />
                <Route path="/tools/flashcards" element={<FlashcardApp />} />
                <Route path="/tools/pictures" element={<VisualsPage />} />
                <Route path="/tools/visuals" element={<VisualsPage />} />
                <Route path="/tools/graphs" element={<GraphsPage />} />
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
        'English': { id: 'English', color: 'blue', icon: 'Languages', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'नेपाली': { id: 'नेपाली', color: 'purple', icon: 'Edit3', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Maths': { id: 'Maths', color: 'red', icon: 'Sigma', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Science': { id: 'Science', color: 'emerald', icon: 'Microscope', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'सामाजिक': { id: 'सामाजिक', color: 'amber', icon: 'Globe', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Optional Maths': { id: 'Optional Maths', color: 'indigo', icon: 'Binary', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Account': { id: 'Account', color: 'orange', icon: 'ListChecks', chapters: [], videos: [], pdfs: [], modelQuestions: [] },
        'Computer': { id: 'Computer', color: 'cyan', icon: 'Monitor', chapters: [], videos: [], pdfs: [], modelQuestions: [] }
    },
    calendar: [],
    settings: { welcomeMessage: 'Namaste', registrationOpen: true }
};

const AppProvider = ({ children }: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [data, setData] = useState<AppData>(() => {
        try {
            const saved = localStorage.getItem('aadhar_app_data_v3');
            return saved ? JSON.parse(saved) : INITIAL_DATA;
        } catch (e) {
            console.error("Error loading app data from localStorage:", e);
            return INITIAL_DATA;
        }
    });
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [liveNews, setLiveNews] = useState<any[]>(() => {
        const saved = localStorage.getItem('aadhar_live_news_v4');
        if (saved) return JSON.parse(saved);
        return [
            { id: 's1', title: 'SEE Exam 2083: New Model Question Sets Released by CDC', content: 'The Curriculum Development Centre (CDC) has released updated model question sets for SEE 2083. Science and Maths exams focus on conceptual understanding.', created_at: new Date().toISOString(), category: 'Exams', image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop', author: 'Aadhar Editorial' },
            { id: 'n1', title: 'SEE 2083 Examination Schedule Released', content: 'The Official schedule is out. Prepare for high-intensity sessions.', created_at: new Date().toISOString(), category: 'Updates', image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop', author: 'Aadhar Admin' },
            { id: 'n2', title: 'Digital Learning Transformation in Nepal', content: 'Bridging the divide with AI-powered tutoring systems.', created_at: new Date().toISOString(), category: 'Policy', image_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1474&auto=format&fit=crop', author: 'EduWeekly' },
            { id: 'n3', title: 'Mental Wellness During Board Trials', content: 'Techniques from toppers to manage stress and peak performance.', created_at: new Date().toISOString(), category: 'Wellness', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1470&auto=format&fit=crop', author: 'Dr. Sameer' },
            { id: 'n4', title: 'National Mock Battle Ground - Live Now', content: 'Compete with 5000+ students in real-time MCQ simulations.', created_at: new Date().toISOString(), category: 'Events', image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop', author: 'Admin Console' }
        ];
    });
    const [liveNotices, setLiveNotices] = useState<any[]>([]);
    const [liveMaterials, setLiveMaterials] = useState<any[]>(() => {
        const saved = localStorage.getItem('aadhar_live_materials_v4');
        if (saved) return JSON.parse(saved);
        return [
            { id: 'm1', subject: 'Science', type: 'chapter', title: 'Chapter 1: Force and Motion', content: 'Detailed conceptual notes covering Newton laws and gravitational force.', date: new Date().toISOString(), created_at: new Date().toISOString() },
            { id: 'm2', subject: 'Maths', type: 'model_question', title: 'Trigonometry Challenge Pack 2083', file_url: '#', date: new Date().toISOString(), created_at: new Date().toISOString() },
            { id: 'm3', subject: 'English', type: 'note_archive', title: 'Unit 5: Sustainable Development', content: 'Key definitions and sample essay prompts for Unit 5.', date: new Date().toISOString(), created_at: new Date().toISOString() },
            { id: 'm4', subject: 'नेपाली', type: 'chapter', title: 'पाठ १: सामाजिक न्याय', content: 'प्रमुख बुँदाहरू र अभ्यासका प्रश्नहरू।', date: new Date().toISOString(), created_at: new Date().toISOString() },
            { id: 'm5', subject: 'Computer', type: 'model_question', title: 'C Programming Syntax Sheet', file_url: '#', date: new Date().toISOString(), created_at: new Date().toISOString() }
        ];
    });
    const [liveMcqs, setLiveMcqs] = useState<any[]>([]);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        localStorage.setItem('aadhar_app_data_v3', JSON.stringify(data));
    }, [data]);

    const updateData = (newData: AppData) => setData(newData);

    const addChapter = (subjectId: SubjectType, chapter: Chapter) => {
        setData(prev => {
            const subjects = { ...prev.subjects };
            if (subjects[subjectId]) {
                subjects[subjectId].chapters = [...(subjects[subjectId].chapters || []), chapter];
            }
            return { ...prev, subjects };
        });
    };

    const deleteChapter = (subjectId: SubjectType, chapterId: string) => {
        if (!subjectId || !chapterId) return;
        setData(prev => {
            const subjects = { ...prev.subjects };
            if (subjects[subjectId] && subjects[subjectId].chapters) {
                subjects[subjectId].chapters = subjects[subjectId].chapters.filter(c => c.id !== chapterId);
            }
            return { ...prev, subjects };
        });
    };

    const addNews = (item: any) => setLiveNews(prev => [item, ...prev]);
    const deleteNews = (id: string) => {
        setLiveNews(prev => {
            const up = prev.filter(n => n.id !== id);
            localStorage.setItem('aadhar_live_news_v4', JSON.stringify(up));
            return up;
        });
    };
    
    const addNotice = (item: any) => setLiveNotices(prev => [item, ...prev]);
    const deleteNotice = (id: string) => setLiveNotices(prev => prev.filter(n => n.id !== id));

    const addMaterial = (item: any) => {
        setLiveMaterials(prev => {
            const up = [item, ...prev];
            localStorage.setItem('aadhar_live_materials_v4', JSON.stringify(up));
            return up;
        });
    };
    const deleteMaterial = (id: string) => {
        setLiveMaterials(prev => {
            const up = prev.filter(m => m.id !== id);
            localStorage.setItem('aadhar_live_materials_v4', JSON.stringify(up));
            return up;
        });
    };

    const addMcqSet = (item: any) => setLiveMcqs(prev => [item, ...prev]);
    const deleteMcqSet = (id: string) => setLiveMcqs(prev => prev.filter(m => m.id !== id));

    const [isMcqModalOpen, setIsMcqModalOpen] = useState(false);
    const [mcqJson, setMcqJson] = useState('');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Supabase Auth Listener
        let authSubscription: any;
        
        const initAuth = async () => {
            // Safety timeout to prevent hanging on loading screen
            const timeout = setTimeout(() => {
                console.warn("Auth initialization timed out. Proceeding to login.");
                setIsInitializing(false);
            }, 8000);

            try {
                if (supabase?.auth) {
                    // 1. Check initial session
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    
                    if (sessionError) {
                        console.error("Session retrieval error:", sessionError);
                    }

                    if (session?.user) {
                        const loggedUser: User = {
                            id: session.user.id,
                            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Aadhar Student',
                            email: session.user.email || '',
                            grade: '10',
                            streak: 5,
                            completedChapters: [],
                            xp: 1250,
                        };
                        setUser(loggedUser);
                        localStorage.setItem('logged_user', JSON.stringify(loggedUser));
                        
                        try {
                            const profile = await getUserProfile(session.user.id);
                            if (profile) setUserProfile(profile);
                        } catch (pErr) {
                            console.warn("Profile fetch failed:", pErr);
                        }
                    } else {
                        // Check if we have a locally cached user as a fallback (for smoother UI)
                        const cached = localStorage.getItem('logged_user');
                        if (cached && !isOnline) {
                            setUser(JSON.parse(cached));
                        } else {
                            setUser(null);
                            setUserProfile(null);
                        }
                    }

                    // 2. Set up listener for subsequent changes
                    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                        if (session?.user) {
                            const loggedUser: User = {
                                id: session.user.id,
                                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Aadhar Student',
                                email: session.user.email || '',
                                grade: '10',
                                streak: 5,
                                completedChapters: [],
                                xp: 1250,
                            };
                            setUser(loggedUser);
                            localStorage.setItem('logged_user', JSON.stringify(loggedUser));
                        } else {
                            setUser(null);
                            setUserProfile(null);
                            localStorage.removeItem('logged_user');
                        }
                        setIsInitializing(false);
                        clearTimeout(timeout);
                    });
                    authSubscription = subscription;
                } else {
                    console.error("Supabase auth engine not detected");
                    setIsInitializing(false);
                    clearTimeout(timeout);
                }
            } catch (err) {
                console.error("Critical auth error:", err);
                setIsInitializing(false);
                clearTimeout(timeout);
            }
        };

        initAuth();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (authSubscription) authSubscription.unsubscribe();
        };
    }, []);

    const addTestResult = (score: number, total: number = 10, timeSpentSecs: number = 120) => {
        if (!user) return;
        const updatedUser = { 
            ...user, 
            streak: user.streak + 1,
            lastStudyDate: new Date().toISOString()
        };
        setUser(updatedUser);
        localStorage.setItem('logged_user', JSON.stringify(updatedUser));
    };

    const fetchLiveNews = async () => {
        try {
            const { data: newsData, error: newsError } = await supabase.from('news').select('*').order('created_at', { ascending: false });
            const { data: noticeData, error: noticeError } = await supabase.from('notices').select('*').order('created_at', { ascending: false });
            
            if (newsError) console.error("News fetch error:", newsError);
            else if (newsData) setLiveNews(newsData);
            
            if (noticeError) console.error("Notice fetch error:", noticeError);
            else if (noticeData) setLiveNotices(noticeData);
        } catch (e) {
            console.error("Live news/notices fetch error:", e);
        }
    };

    const fetchLiveMaterials = async () => {
        try {
            const materials = await fetchStudyMaterials();
            if (materials) {
                // Map category to type for compatibility with frontend components
                const mappedMaterials = materials.map((m: any) => {
                    let type = m.category?.toLowerCase();
                    if (type === 'notes') {
                        // If it has a file_url and no notes content, it's likely an archive
                        type = (m.file_url && !m.notes) ? 'note_archive' : 'note';
                    } else if (type === 'video') {
                        type = 'video';
                    } else if (type === 'book') {
                        type = 'textbook';
                    } else if (type === 'chapter') {
                        type = 'chapter';
                    } else if (type === 'model question') {
                        type = 'model_question';
                    }
                    return { ...m, type };
                });
                setLiveMaterials(mappedMaterials);
            }
            
            const { data: mcqs, error: mcqError } = await supabase.from('mcq_bank').select('*');
            if (mcqError) console.error("MCQ fetch error:", mcqError);
            else if (mcqs) setLiveMcqs(mcqs);
        } catch (e) {
            console.error("Live materials fetch error:", e);
        }
    };

    useEffect(() => {
        if (user) {
            fetchLiveNews();
            fetchLiveMaterials();
        }
    }, [user]);

    if (isInitializing) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <AnimatedLogo size="lg" className="mb-12" />
                
                <div className="space-y-4 max-w-xs mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-black italic tracking-tighter uppercase text-black"
                    >
                        Aadhar Pathshala
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed"
                    >
                        Initializing Neural Learning Systems
                    </motion.p>
                    
                    <div className="flex justify-center gap-1.5 pt-4">
                        {[0, 1, 2].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 1.5, 
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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

    return (
        <AppContext.Provider value={{
            user, setUser, userProfile, data, setData, updateData,
            addChapter, deleteChapter,
            liveNews, liveMaterials, liveNotices, liveMcqs,
            setLiveNews, addNews, deleteNews, fetchLiveNews,
            addNotice, deleteNotice,
            addMaterial, deleteMaterial, fetchLiveMaterials,
            addMcqSet, deleteMcqSet,
            addTestResult, toggleChapterComplete,
            isInitializing, isOnline
        }}>
            {children}
            {!isOnline && (
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-50 bg-slate-900/90 backdrop-blur-lg text-white px-6 py-4 rounded-[2rem] flex items-center justify-between shadow-2xl border border-white/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Offline Mode Active</span>
                    </div>
                    <span className="text-[0.6rem] font-bold text-slate-400 uppercase italic">Limited Sync Capability</span>
                </motion.div>
            )}
        </AppContext.Provider>
    );
};

export default App;
