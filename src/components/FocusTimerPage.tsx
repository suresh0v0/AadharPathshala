import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Flame, 
    Target, 
    Coffee, 
    Trophy, 
    Play, 
    Pause, 
    Volume2, 
    VolumeX, 
    Music, 
    Maximize2, 
    Minimize2, 
    ChevronRight, 
    Plus, 
    Trash2, 
    Settings, 
    Edit2, 
    Clock, 
    ClipboardList, 
    Check, 
    RotateCcw, 
    Sparkles,
    Calendar,
    CloudRain,
    Binary,
    Activity,
    Info,
    ArrowLeft,
    PlusCircle,
    ListTodo,
    BarChart2,
    Sliders,
    Moon,
    Sun,
    Bell
} from 'lucide-react';

// Persisted Key names
const STORAGE_PREFIX = 'study_timer_';
const KEYS = {
    STREAK: `${STORAGE_PREFIX}streak`,
    STREAK_DAYS: `${STORAGE_PREFIX}streak_days`,
    FOCUS_TIME: `${STORAGE_PREFIX}focus_time`,
    SESSIONS: `${STORAGE_PREFIX}sessions`,
    POINTS: `${STORAGE_PREFIX}points`,
    TASKS: `${STORAGE_PREFIX}tasks`,
    HISTORY: `${STORAGE_PREFIX}history`,
    TIME: `${STORAGE_PREFIX}time`,
    IS_ACTIVE: `${STORAGE_PREFIX}is_active`,
    MODE: `${STORAGE_PREFIX}mode`,
    TOTAL_SECONDS: `${STORAGE_PREFIX}total_seconds`,
    POMODORO_COUNT: `${STORAGE_PREFIX}pomodoro_count`,
    SESSION_TITLE: `${STORAGE_PREFIX}session_title`
};

interface StudyTask {
    id: string;
    text: string;
    completed: boolean;
}

export const FocusTimerPage = () => {
    const navigate = useNavigate();

    // 1. Core Timer States
    const [time, setTime] = useState<number>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}time`);
        return val ? parseInt(val) : 25 * 60;
    });
    const [isActive, setIsActive] = useState<boolean>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}is_active`);
        return val === 'true';
    });
    const [mode, setMode] = useState<'focus' | 'break' | 'long_break'>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}mode`);
        return (val as any) || 'focus';
    });
    const [totalSeconds, setTotalSeconds] = useState<number>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}total_seconds`);
        return val ? parseInt(val) : 25 * 60;
    });
    const [pomodoroCount, setPomodoroCount] = useState<number>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}pomodoro_count`);
        return val ? parseInt(val) : 1;
    });
    const [sessionTitle, setSessionTitle] = useState<string>(() => {
        const val = localStorage.getItem(`${STORAGE_PREFIX}session_title`);
        return val || 'Deep Focus';
    });
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitleInput, setEditedTitleInput] = useState('Deep Focus');
    const [customTitleInput, setCustomTitleInput] = useState('Deep Focus');

    // 2. Stats & Streak States (initialized from localStorage with beautiful defaults)
    const [streak, setStreak] = useState<number>(() => {
        const val = localStorage.getItem(KEYS.STREAK);
        return val ? parseInt(val) : 7; // Default 7 standard day streak as shown in screenshot
    });
    
    const [streakDays, setStreakDays] = useState<boolean[]>(() => {
        const val = localStorage.getItem(KEYS.STREAK_DAYS);
        if (val) {
            try { return JSON.parse(val); } catch (e) { }
        }
        return [true, true, true, true, true, false, false]; // Default: Mon to Fri done, Sat / Sun pending
    });

    const [todayFocusSeconds, setTodayFocusSeconds] = useState<number>(() => {
        const val = localStorage.getItem(KEYS.FOCUS_TIME);
        return val ? parseInt(val) : 105 * 60; // Default 1 hour 45 minutes (105 mins) as in screenshot
    });

    const [todaySessions, setTodaySessions] = useState<number>(() => {
        const val = localStorage.getItem(KEYS.SESSIONS);
        return val ? parseInt(val) : 3; // Default 3 sessions completed
    });

    const [points, setPoints] = useState<number>(() => {
        const val = localStorage.getItem(KEYS.POINTS);
        return val ? parseInt(val) : 120; // Default 120 points from mockups
    });

    const [weeklyHistory, setWeeklyHistory] = useState<number[]>(() => {
        const val = localStorage.getItem(KEYS.HISTORY);
        if (val) {
            try { return JSON.parse(val); } catch (e) { }
        }
        return [45, 90, 120, 75, 105, 0, 0]; // minutes focus time per weekday
    });

    // 3. Audio & Focus Soundscape States
    const [isSoundMuted, setIsSoundMuted] = useState(false);
    const [soundVol, setSoundVol] = useState(0.5);
    const [currentSoundType, setCurrentSoundType] = useState<'none' | 'lofi' | 'rain' | 'forest' | 'space'>('lofi');
    const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
    const [isNoiseActive, setIsNoiseActive] = useState(false);

    // Audio Context refs for real synthesized Focus Audio
    const audioCtxRef = useRef<AudioContext | null>(null);
    const noiseNodeRef = useRef<AudioNode | null>(null);
    const oscNode1Ref = useRef<OscillatorNode | null>(null);
    const oscNode2Ref = useRef<OscillatorNode | null>(null);
    const bufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // 4. Tasks & Goals (Goal Planner)
    const [tasks, setTasks] = useState<StudyTask[]>(() => {
        const val = localStorage.getItem(KEYS.TASKS);
        if (val) {
            try { return JSON.parse(val); } catch (e) { }
        }
        return [
            { id: 't1', text: 'Structure physics formulas', completed: true },
            { id: 't2', text: 'Complete trigonometry worksheet', completed: false },
            { id: 't3', text: 'Revise Nepali terms glossary', completed: false }
        ];
    });
    const [newTaskText, setNewTaskText] = useState('');
    const [isGoalPlannerOpen, setIsGoalPlannerOpen] = useState(false);

    // 5. Applet Extras
    const isFullscreenRoute = window.location.pathname.includes('/fullscreen');
    const [isFullscreen, setIsFullscreen] = useState(isFullscreenRoute);

    useEffect(() => {
        const checkFullscreen = window.location.pathname.includes('/fullscreen');
        if (isFullscreen !== checkFullscreen) {
            setIsFullscreen(checkFullscreen);
        }
    }, [window.location.pathname]);
    const [fsDarkMode, setFsDarkMode] = useState(false);
    const [fsTheme, setFsTheme] = useState<'rainbow' | 'aurora' | 'sunset' | 'neon-pink'>('rainbow');
    const [isCustomTimerOpen, setIsCustomTimerOpen] = useState(false);
    const [customMins, setCustomMins] = useState(25);
    const [isStatsOpen, setIsStatsOpen] = useState(false);

    // Save states to local storage
    useEffect(() => {
        localStorage.setItem(KEYS.STREAK, streak.toString());
        localStorage.setItem(KEYS.STREAK_DAYS, JSON.stringify(streakDays));
        localStorage.setItem(KEYS.SESSIONS, todaySessions.toString());
        localStorage.setItem(KEYS.FOCUS_TIME, todayFocusSeconds.toString());
        localStorage.setItem(KEYS.POINTS, points.toString());
        localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
        localStorage.setItem(KEYS.HISTORY, JSON.stringify(weeklyHistory));
        localStorage.setItem(KEYS.TIME, time.toString());
        localStorage.setItem(KEYS.IS_ACTIVE, isActive.toString());
        localStorage.setItem(KEYS.MODE, mode);
        localStorage.setItem(KEYS.TOTAL_SECONDS, totalSeconds.toString());
        localStorage.setItem(KEYS.POMODORO_COUNT, pomodoroCount.toString());
        localStorage.setItem(KEYS.SESSION_TITLE, sessionTitle);
    }, [streak, streakDays, todayFocusSeconds, todaySessions, points, tasks, weeklyHistory, time, isActive, mode, totalSeconds, pomodoroCount, sessionTitle]);

    // Timer Modes Constant
    const MODES = {
        focus: { 
            name: 'Deep Focus', 
            defaultTime: 25 * 60, 
            gradient: 'from-violet-500 via-indigo-600 to-blue-500',
            bg: 'bg-indigo-600',
            textColor: 'text-indigo-600',
            icon: Target,
            label: 'Focus'
        },
        break: { 
            name: 'Short Break', 
            defaultTime: 5 * 60, 
            gradient: 'from-amber-400 to-orange-500',
            bg: 'bg-amber-500',
            textColor: 'text-amber-600',
            icon: Coffee,
            label: 'Break'
        },
        long_break: { 
            name: 'Long Break', 
            defaultTime: 15 * 60, 
            gradient: 'from-emerald-400 to-teal-500',
            bg: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            icon: Sparkles,
            label: 'Long Break'
        }
    };

    // Keep Page title update
    useEffect(() => {
        const minStr = Math.floor(time / 60).toString().padStart(2, '0');
        const secStr = (time % 60).toString().padStart(2, '0');
        document.title = `${minStr}:${secStr} | ${sessionTitle}`;
    }, [time, sessionTitle]);

    // Main Timer Interval hook
    useEffect(() => {
        let interval: any = null;
        if (isActive && time > 0) {
            interval = setInterval(() => {
                setTime(t => t - 1);
                // Increment active session time if Focus mode
                if (mode === 'focus') {
                    setTodayFocusSeconds(prev => prev + 1);
                }
            }, 1000);
        } else if (isActive && time === 0) {
            clearInterval(interval);
            setIsActive(false);
            handleSoundStop();

            // When Focus Session concludes
            if (mode === 'focus') {
                const nextSess = todaySessions + 1;
                setTodaySessions(nextSess);
                const earnedPoints = 40;
                setPoints(prev => prev + earnedPoints);

                // Update weekly history
                const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday ...
                const historyIdx = dayIndex === 0 ? 6 : dayIndex - 1; // Map Sunday to 6, Mon-Sat to 0-5
                const updatedHist = [...weeklyHistory];
                updatedHist[historyIdx] = (updatedHist[historyIdx] || 0) + Math.floor(totalSeconds / 60);
                setWeeklyHistory(updatedHist);

                // Increment Pomodoro cycle counts
                if (pomodoroCount < 4) {
                    setPomodoroCount(c => c + 1);
                    setMode('break');
                    setTime(MODES.break.defaultTime);
                    setTotalSeconds(MODES.break.defaultTime);
                } else {
                    setPomodoroCount(1);
                    setMode('long_break');
                    setTime(MODES.long_break.defaultTime);
                    setTotalSeconds(MODES.long_break.defaultTime);
                }
                
                // Set today streak checked
                const updatedStreakDays = [...streakDays];
                const currentDayNameIdx = historyIdx;
                if (!updatedStreakDays[currentDayNameIdx]) {
                    updatedStreakDays[currentDayNameIdx] = true;
                    setStreakDays(updatedStreakDays);
                    setStreak(s => s + 1);
                }

                // Simple chime native synthesizer trigger!
                playChimeSound();
                alert(`Phenomenal Job! You completed the "${sessionTitle}" session! +${earnedPoints} Study Points! Next phase started.`);
            } else {
                // Break is finished
                setMode('focus');
                setTime(MODES.focus.defaultTime);
                setTotalSeconds(MODES.focus.defaultTime);
                playChimeSound();
                alert("Rest over! Ready to return to Deep Focus?");
            }
        }
        return () => clearInterval(interval);
    }, [isActive, time, mode]);

    // Handle audio changes based on play/pause
    useEffect(() => {
        if (isActive && currentSoundType !== 'none' && !isSoundMuted) {
            handleSoundStart(currentSoundType);
        } else {
            handleSoundStop();
        }
    }, [isActive, currentSoundType, isSoundMuted]);

    // Synced coefficients & progress percentages
    const timerProgress = totalSeconds > 0 ? ((totalSeconds - time) / totalSeconds) * 100 : 0;
    const progressRadianAngle = (timerProgress / 100) * 360;
    const angleRad = (progressRadianAngle - 90) * Math.PI / 180;
    const handleX = 100 + 85 * Math.cos(angleRad);
    const handleY = 100 + 85 * Math.sin(angleRad);

    const handleModeChange = (newMode: 'focus' | 'break' | 'long_break') => {
        setIsActive(false);
        setMode(newMode);
        const nextTime = MODES[newMode].defaultTime;
        setTime(nextTime);
        setTotalSeconds(nextTime);
        handleSoundStop();
    };

    const togglePlayPause = () => {
        if (!isActive) {
            // Lazy Audio context unlock
            initAudioContext();
        }
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        const defTime = MODES[mode].defaultTime;
        setTime(defTime);
        setTotalSeconds(defTime);
        handleSoundStop();
    };

    // Calculate goals checklist fraction accomplished
    const activeTasksChecked = tasks.filter(t => t.completed).length;
    const tasksTotal = tasks.length;
    const tasksProgressPct = tasksTotal > 0 ? Math.round((activeTasksChecked / tasksTotal) * 100) : 0;

    // --- AUDIO SYNTHESIS ENGINE (No mock assets! HTML5 Web Audio API gives high purity) ---
    const initAudioContext = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const playChimeSound = () => {
        try {
            initAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, now); // D5 chime
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.15); // A5 chime

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 1.6);
        } catch (e) {
            console.error('Audio synthesis chime error:', e);
        }
    };

    const handleSoundStart = (type: typeof currentSoundType) => {
        try {
            initAudioContext();
            const ctx = audioCtxRef.current;
            if (!ctx) return;

            handleSoundStop(); // Clear previous any synth notes

            const masterGain = ctx.createGain();
            masterGain.gain.setValueAtTime(soundVol * 0.15, ctx.currentTime);
            gainNodeRef.current = masterGain;
            masterGain.connect(ctx.destination);

            if (type === 'lofi') {
                // Chill Lofi Rhodes ambient chords simulator synthesized live!
                // We create a low gentle background synth swell
                const osc1 = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const filter = ctx.createBiquadFilter();

                osc1.type = 'triangle';
                osc2.type = 'sine';

                // Gentle beautiful F Major 7th/9th frequencies swell notes
                osc1.frequency.setValueAtTime(174.61, ctx.currentTime); // F3
                osc2.frequency.setValueAtTime(220.00, ctx.currentTime); // A3

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(320, ctx.currentTime);

                osc1.connect(filter);
                osc2.connect(filter);
                filter.connect(masterGain);

                osc1.start();
                osc2.start();

                oscNode1Ref.current = osc1;
                oscNode2Ref.current = osc2;
            } else if (type === 'rain') {
                // Synthesizing high-density pristine Rain noise
                const bufferSize = ctx.sampleRate * 2;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);

                // Populate with white/pink ambient noise variables
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const whiteNoise = Math.random() * 2 - 1;
                    // Pink / brown noise filter integration
                    lastOut = (lastOut * 0.95) + (whiteNoise * 0.05);
                    data[i] = lastOut;
                }

                const noiseSrc = ctx.createBufferSource();
                noiseSrc.buffer = buffer;
                noiseSrc.loop = true;

                const filter = ctx.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.setValueAtTime(450, ctx.currentTime);
                filter.Q.setValueAtTime(1.2, ctx.currentTime);

                noiseSrc.connect(filter);
                filter.connect(masterGain);
                noiseSrc.start();

                bufferSourceRef.current = noiseSrc;
            } else if (type === 'forest') {
                // Nature wind and bird chirp simulator synthesis
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, ctx.currentTime);

                // Modulator LFO to simulate gentle waving trees/wind
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
                lfoGain.gain.setValueAtTime(12, ctx.currentTime);

                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                osc.connect(masterGain);

                lfo.start();
                osc.start();

                oscNode1Ref.current = osc;
                oscNode2Ref.current = lfo;
            } else if (type === 'space') {
                // Binaural beats Alpha frequency 10Hz spacer focus (140Hz and 150Hz)
                const oscLeft = ctx.createOscillator();
                const oscRight = ctx.createOscillator();

                oscLeft.type = 'sine';
                oscLeft.frequency.setValueAtTime(140, ctx.currentTime);
                
                oscRight.type = 'sine';
                oscRight.frequency.setValueAtTime(150, ctx.currentTime);

                // Create stereo panning
                const panLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
                const panRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

                if (panLeft && panRight) {
                    panLeft.pan.setValueAtTime(-1, ctx.currentTime);
                    panRight.pan.setValueAtTime(1, ctx.currentTime);
                    oscLeft.connect(panLeft).connect(masterGain);
                    oscRight.connect(panRight).connect(masterGain);
                } else {
                    oscLeft.connect(masterGain);
                    oscRight.connect(masterGain);
                }

                oscLeft.start();
                oscRight.start();

                oscNode1Ref.current = oscLeft;
                oscNode2Ref.current = oscRight;
            }
        } catch (err) {
            console.error('Audio synthesizer error startup:', err);
        }
    };

    const handleSoundStop = () => {
        try {
            if (oscNode1Ref.current) {
                oscNode1Ref.current.stop();
                oscNode1Ref.current.disconnect();
                oscNode1Ref.current = null;
            }
            if (oscNode2Ref.current) {
                oscNode2Ref.current.stop();
                oscNode2Ref.current.disconnect();
                oscNode2Ref.current = null;
            }
            if (bufferSourceRef.current) {
                bufferSourceRef.current.stop();
                bufferSourceRef.current.disconnect();
                bufferSourceRef.current = null;
            }
            if (gainNodeRef.current) {
                gainNodeRef.current.disconnect();
                gainNodeRef.current = null;
            }
        } catch (e) { }
    };

    // Keep volume responsive to controls
    const handleVolumeChange = (newVol: number) => {
        setSoundVol(newVol);
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(newVol * 0.15, audioCtxRef.current.currentTime);
        }
    };

    const handleSoundTypeToggle = (type: typeof currentSoundType) => {
        initAudioContext();
        if (currentSoundType === type) {
            setCurrentSoundType('none');
        } else {
            setCurrentSoundType(type);
        }
    };

    // --- TASK GOALS / PLANNER HELPERS ---
    const handleAddTask = () => {
        if (!newTaskText.trim()) return;
        const newTask: StudyTask = {
            id: Date.now().toString(),
            text: newTaskText.trim(),
            completed: false
        };
        setTasks([...tasks, newTask]);
        setNewTaskText('');
    };

    const toggleTaskCompleted = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                const updatedStatus = !t.completed;
                if (updatedStatus) {
                    setPoints(p => p + 10); // Reward completing task planner checklist elements!
                }
                return { ...t, completed: updatedStatus };
            }
            return t;
        }));
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    // --- QUICK TIMERS SELECTORS ---
    const startQuickTimer = (minutes: number, titleName: string = 'Pomodoro') => {
        setIsActive(false);
        setMode('focus');
        setSessionTitle(titleName);
        setEditedTitleInput(titleName);
        setCustomTitleInput(titleName);
        const secs = minutes * 60;
        setTime(secs);
        setTotalSeconds(secs);
    };

    // Formatting focus minutes helper
    const formatTimeDurationStr = (secs: number) => {
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }
        return `${mins}m`;
    };

    // Standard weekday labels mapping
    const DAYS_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    return (
        <div className={`min-h-screen transition-all duration-705 bg-slate-50/65 ${isFullscreen ? 'p-0 overflow-hidden' : 'pb-16 text-slate-800'}`}>
            
            {/* Distraction Free Fullscreen Overlay (Landscape view by design) */}
            {isFullscreen && (
                <div className={`fixed inset-0 z-[9999] transition-colors duration-500 flex flex-col justify-between p-6 select-none shadow-2xl relative overflow-hidden ${
                    fsDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
                }`}>
                    
                    {/* Interactive Drifting Zen Particles Background */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden animate-fade-in">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`absolute w-4 h-4 md:w-6 md:h-6 rounded-full blur-xs opacity-25 ${
                                    fsTheme === 'rainbow' ? 'bg-indigo-400' :
                                    fsTheme === 'aurora' ? 'bg-emerald-400' :
                                    fsTheme === 'sunset' ? 'bg-amber-400' : 'bg-pink-400'
                                }`}
                                initial={{ 
                                    x: Math.random() * 1200 - 405, 
                                    y: Math.random() * 1000 - 305,
                                    scale: Math.random() * 0.6 + 0.4
                                }}
                                animate={{ 
                                    y: [null, Math.random() * -400 - 200],
                                    x: [null, Math.random() * 600 - 300],
                                    opacity: [0.1, 0.35, 0.1]
                                }}
                                transition={{ 
                                    repeat: Infinity, 
                                    duration: 10 + Math.random() * 15, 
                                    ease: 'easeInOut' 
                                }}
                            />
                        ))}
                    </div>

                    {/* Top Toolbar Row */}
                    <div className="flex items-center justify-between w-full relative z-10 font-sans">
                        <div className="flex items-center gap-2">
                            <span className="px-5 py-2 bg-indigo-505/10 border border-indigo-500/20 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block animate-pulse">
                                {mode === 'focus' ? '🎯 Study Session Active' : '☕ Relax & Recharge'}
                            </span>
                        </div>

                        {/* Fullscreen config controls */}
                        <div className="flex items-center gap-3">
                            {/* Colorful Theme Selector Buttons */}
                            <div className={`p-1 flex items-center gap-1.5 rounded-full border ${fsDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xs'}`}>
                                {(['rainbow', 'aurora', 'sunset', 'neon-pink'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFsTheme(t)}
                                        className={`w-6 h-6 rounded-full border transition-all ${
                                            fsTheme === t ? 'scale-115 ring-2 ring-indigo-500/20 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                                        }`}
                                        style={{
                                            background: 
                                                t === 'rainbow' ? 'linear-gradient(135deg, #ef4444, #3b82f6)' :
                                                t === 'aurora' ? 'linear-gradient(135deg, #10b981, #06b6d4)' :
                                                t === 'sunset' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' :
                                                'linear-gradient(135deg, #ec4899, #6366f1)'
                                        }}
                                        title={`${t.charAt(0).toUpperCase() + t.slice(1)} Theme`}
                                    />
                                ))}
                            </div>

                            {/* Light/Dark Mode Toggle */}
                            <button
                                onClick={() => setFsDarkMode(!fsDarkMode)}
                                className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                                    fsDarkMode 
                                        ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300' 
                                        : 'bg-white border-slate-100 text-slate-700 hover:text-slate-900 shadow-xs'
                                }`}
                                title={fsDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            >
                                {fsDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            </button>

                            {/* Exit Fullscreen */}
                            <button 
                                onClick={() => {
                                    setIsFullscreen(false);
                                    navigate('/tools/timer');
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 cursor-pointer border ${
                                    fsDarkMode 
                                        ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' 
                                        : 'bg-white border-slate-100 text-slate-700 hover:text-slate-955 shadow-xs'
                                }`}
                                id="exit_fullscreen_btn"
                            >
                                <Minimize2 className="w-4 h-4 inline mr-1.5" /> Exit Fullscreen
                            </button>
                        </div>
                    </div>

                    {/* Central Area: Side-by-side Landscape Row */}
                    <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 max-w-7xl mx-auto w-full relative z-10 my-4 font-sans">
                        
                        {/* LEFT LANDSCAPE COLUMN: Giant Timer trimmer dial */}
                        <div className="relative flex items-center justify-center shrink-0">
                            {/* Interactive Glowing backdrop wave */}
                            {isActive && (
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0.15 }}
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0, 0.15] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                    className={`absolute inset-0 rounded-full blur-2xl ${
                                        fsTheme === 'rainbow' ? 'bg-pink-500/10' :
                                        fsTheme === 'aurora' ? 'bg-emerald-500/10' :
                                        fsTheme === 'sunset' ? 'bg-amber-500/10' :
                                        'bg-fuchsia-500/10'
                                    }`}
                                />
                            )}

                            {/* Giant Circular progress ring trimmer */}
                            <div className={`w-80 h-80 sm:w-96 sm:h-96 md:w-[410px] md:h-[410px] rounded-full flex flex-col items-center justify-center relative z-20 transition-all duration-500 border shadow-2xl ${
                                fsDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100/80 shadow-indigo-100/30'
                            }`}>
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-[1.015]" viewBox="0 0 200 200">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="85"
                                        className={`fill-none stroke-[5px] ${
                                            fsDarkMode ? 'stroke-slate-800/40' : 'stroke-indigo-50/40'
                                        }`}
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="85"
                                        className="fill-none stroke-[5.5px] transition-all ease-linear"
                                        stroke={
                                            fsTheme === 'rainbow' ? 'url(#fsGradRainbow)' :
                                            fsTheme === 'aurora' ? 'url(#fsGradAurora)' :
                                            fsTheme === 'sunset' ? 'url(#fsGradSunset)' :
                                            'url(#fsGradNeonPink)'
                                        }
                                        strokeDasharray="534.07"
                                        strokeDashoffset={(534.07 - (timerProgress * 534.07 / 100)).toString()}
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx={100 + 85 * Math.cos((timerProgress * 3.6 - 90) * Math.PI / 180)}
                                        cy={100 + 85 * Math.sin((timerProgress * 3.6 - 90) * Math.PI / 180)}
                                        r="4"
                                        className={`${fsDarkMode ? 'fill-slate-900 border-indigo-400' : 'fill-white stroke-indigo-555'} stroke-[2px]`}
                                    />

                                    {/* Definitions for all premium glow gradients */}
                                    <defs>
                                        <linearGradient id="fsGradRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fc2d62" />
                                            <stop offset="50%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#2563eb" />
                                        </linearGradient>
                                        <linearGradient id="fsGradAurora" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#2dd4bf" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                        <linearGradient id="fsGradSunset" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#f43f5e" />
                                        </linearGradient>
                                        <linearGradient id="fsGradNeonPink" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#db2777" />
                                            <stop offset="100%" stopColor="#818cf8" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Giant numeric display */}
                                <div className="text-center">
                                    <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest block mb-1 opacity-60`}>
                                        {mode === 'focus' ? '🎯 Focus session' : '☕ Rest Period'}
                                    </span>
                                    <div className={`text-6xl sm:text-7xl md:text-8xl font-black font-mono leading-none tracking-tight tabular-nums transition-colors duration-450 ${
                                        fsDarkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {Math.floor(time / 60).toString().padStart(2, '0')}
                                        <span className="animate-pulse">:</span>
                                        {(time % 60).toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest block mt-3 opacity-50">
                                        Pomodoro Cycle {pomodoroCount}/4
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT LANDSCAPE COLUMN: Session Info & Control Hub */}
                        <div className="flex-1 max-w-md w-full space-y-6 text-center md:text-left flex flex-col justify-center">
                            <div>
                                <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                                    fsDarkMode ? 'text-slate-205' : 'text-slate-800'
                                }`}>
                                     {sessionTitle}
                                </h3>
                                <p className={`text-xs mt-1 font-semibold ${
                                    fsDarkMode ? 'text-slate-500' : 'text-slate-400'
                                }`}>
                                    Discipline today, success tomorrow.
                                </p>
                            </div>

                            {/* Soundwave equalizer indicator */}
                            {isActive && (
                                <div className="flex justify-center md:justify-start items-center gap-1.5 h-12 pt-2">
                                    {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((val, key) => (
                                        <motion.div 
                                            key={key}
                                            animate={{ height: [12, 44, 12] }}
                                            transition={{ repeat: Infinity, duration: 0.5 + (key * 0.08), ease: "easeInOut" }}
                                            className={`w-1.5 rounded-full ${
                                                fsTheme === 'rainbow' ? 'bg-indigo-555' :
                                                fsTheme === 'aurora' ? 'bg-teal-505' :
                                                fsTheme === 'sunset' ? 'bg-orange-505' : 'bg-pink-505'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Action controllers */}
                            <div className="flex items-center justify-center md:justify-start gap-4 pt-3">
                                <button
                                    onClick={togglePlayPause}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                                        isActive 
                                            ? 'bg-slate-900 border border-slate-800 text-white' 
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10'
                                    }`}
                                >
                                    {isActive ? <Pause className="w-7 h-7 text-white fill-white" /> : <Play className="w-7 h-7 text-white ml-1 fill-white" />}
                                </button>
                                
                                <button
                                    onClick={handleReset}
                                    className={`w-16 h-16 rounded-full border flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                                        fsDarkMode 
                                            ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white' 
                                            : 'bg-white border-slate-150 text-slate-500 hover:text-slate-800'
                                    }`}
                                    title="Reset Study clock"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Ambient background soundtrack toggle summary inside fullscreen */}
                            <div className="space-y-2 pt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest block opacity-50`}>
                                    Selected soundscape: {currentSoundType === 'none' ? 'None (Silent)' : currentSoundType.toUpperCase()}
                                </span>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {(['space', 'lofi', 'rain'] as const).map((snd) => (
                                        <button
                                            key={snd}
                                            onClick={() => handleSoundTypeToggle(snd)}
                                            className={`px-4 py-2 text-xs rounded-xl border transition-all cursor-pointer font-bold ${
                                                currentSoundType === snd
                                                    ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm'
                                                    : fsDarkMode
                                                        ? 'bg-slate-900 border-slate-800 text-slate-401 hover:text-white'
                                                        : 'bg-white border-slate-205 text-slate-600 hover:text-slate-800 shadow-xs'
                                            }`}
                                        >
                                            {snd === 'space' ? '🎧 Beats' : snd === 'lofi' ? '🎹 Music' : '🌧️ Rain'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom visual footer */}
                    <div className="text-center text-[10px] opacity-30 font-black uppercase tracking-widest relative z-10 font-sans">
                        Discipline study room • Distraction-free landscape hub
                    </div>
                </div>
            )}

            {/* Main grid setup matching the beautiful photo elements layout */}
            <main className="px-3 py-4 sm:px-4 sm:py-6 max-w-3xl mx-auto space-y-6 font-sans">
                
                {/* UPGRADED TEXT & SELECTORS POSITIONING */}
                {/* Deep focus title is ABOVE the selectors, with the back button directly to its left */}
                <div className="flex gap-4 w-full">
                    <button 
                        onClick={() => navigate('/tools')}
                        className="w-11 h-11 border border-slate-200 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none shrink-0 self-center"
                        title="Back to Tools"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-555" />
                    </button>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            {sessionTitle}
                        </h1>
                        <p className="text-xs text-slate-400 font-bold tracking-tight">
                            Discipline today, success tomorrow.
                        </p>
                    </div>
                </div>

                {/* Focus Mode Selector Pills underneath the title */}
                <div className="flex items-center gap-1 p-1 bg-white border border-slate-100 rounded-3xl shadow-xs w-full">
                        <button
                            onClick={() => handleModeChange('focus')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                mode === 'focus' 
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-505 hover:text-slate-800'
                            }`}
                        >
                            <Target className="w-3.5 h-3.5" /> Focus
                        </button>
                        <button
                            onClick={() => handleModeChange('break')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                mode === 'break' 
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-505 hover:text-slate-800'
                            }`}
                        >
                            <Coffee className="w-3.5 h-3.5" /> Break
                        </button>
                        <button
                            onClick={() => handleModeChange('long_break')}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                mode === 'long_break' 
                                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs' 
                                    : 'text-slate-505 hover:text-slate-800'
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Long Break
                    </button>
                </div>

                {/* Core interactive Timer Display centered layout */}
                <div className="flex flex-col items-center justify-center py-6 relative w-full">
                    <div className="relative group">
                        {/* Larger centered trimmer dial */}
                        <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex flex-col items-center justify-center shadow-[0_24px_50px_-8px_rgba(30,27,75,0.08)] relative z-10 bg-white border border-slate-50/50">
                            
                            {/* SVG Circular arc dashboard and slider with responsive viewBox */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-[1.015]" viewBox="0 0 200 200">
                                {/* background path */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    className="fill-none stroke-indigo-50/50 stroke-[6px]"
                                />
                                {/* active filled progress ring path */}
                                <circle
                                    cx="100"
                                    cy="100"
                                    r="85"
                                    className="fill-none stroke-[6.5px] transition-all ease-linear"
                                    stroke={mode === 'focus' ? 'url(#focusGrad)' : mode === 'break' ? 'url(#breakGrad)' : 'url(#longBreakGrad)'}
                                    strokeDasharray="534.07"
                                    strokeDashoffset={(534.07 - (timerProgress * 534.07 / 100)).toString()}
                                    strokeLinecap="round"
                                />

                                {/* Drag-or-slider active circle handle dot */}
                                <circle
                                    cx={handleX}
                                    cy={handleY}
                                    r="5.5"
                                    className="fill-white stroke-indigo-500 stroke-[2.5px] transition-all duration-150 shadow-md animate-pulse"
                                    style={{ filter: 'drop-shadow(0px 2px 3px rgba(79, 70, 229, 0.25))' }}
                                />

                                {/* Gradients configurations */}
                                <defs>
                                    <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                    <linearGradient id="breakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#fbbf24" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                    <linearGradient id="longBreakGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#34d399" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* SVG Ticks indicators decoration scaled to perfect coordinates */}
                            <svg className="absolute inset-5 w-[calc(100%-2.5rem)] h-[calc(100%-2.5rem)] opacity-35 pointer-events-none" viewBox="0 0 200 200">
                                {Array.from({ length: 60 }).map((_, i) => {
                                    const angle = (i * 360) / 60;
                                    const isMajor = i % 5 === 0;
                                    return (
                                        <line 
                                            key={i}
                                            x1="100"
                                            y1={isMajor ? "10" : "14"}
                                            x2="100"
                                            y2="19"
                                            stroke="#4f46e5"
                                            strokeWidth={isMajor ? 1.5 : 0.75}
                                            transform={`rotate(${angle} 100 100)`}
                                            className="origin-center"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Clock content items */}
                            <div className="relative z-20 flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2.5 font-bold">
                                     🧠
                                </div>
                                
                                <h2 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">
                                    {Math.floor(time / 60).toString().padStart(2, '0')}
                                    <span className={isActive ? "animate-pulse" : ""}>:</span>
                                    {(time % 60).toString().padStart(2, '0')}
                                </h2>

                                {/* Edit session duration launcher trigged via pencil/title click */}
                                <button 
                                    onClick={() => {
                                        setCustomTitleInput(sessionTitle);
                                        setCustomMins(Math.round(totalSeconds / 60));
                                        setIsCustomTimerOpen(true);
                                    }}
                                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest mt-3 px-2.5 py-1 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/40 rounded-full flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all outline-none"
                                    title="Edit Session Timer"
                                >
                                    <span>{sessionTitle}</span>
                                    <Edit2 className="w-3 h-3 text-indigo-500 stroke-[2.5]" />
                                </button>

                                {/* Small indicator dots mapping progress count loops */}
                                <div className="flex gap-1.5 mt-3">
                                    {[1, 2, 3, 4].map((j) => (
                                        <span 
                                            key={j} 
                                            onClick={() => setPomodoroCount(j)}
                                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                                                pomodoroCount === j ? 'bg-indigo-600 scale-115' : 'bg-indigo-100 hover:bg-indigo-200'
                                            }`} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Floating capsule status indicator beneath circle */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-slate-100 px-5 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all z-20">
                            ⌛ Pomodoro {pomodoroCount}/4
                        </div>
                    </div>
                </div>

                {/* FIVE CONTROL BUTTONS ROW Under circle as shown on mockups */}
                <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto py-2">
                    <button 
                        onClick={() => handleSoundTypeToggle('space')}
                        className={`py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold tracking-tight border active:scale-95 transition-all text-center cursor-pointer ${
                            currentSoundType === 'space' 
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-xs' 
                                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800 hover:border-slate-200'
                        }`}
                    >
                        <Volume2 className="w-5 h-5 text-indigo-505" />
                        <span className="text-[10px]">Sound</span>
                    </button>

                    <button 
                        onClick={() => handleSoundTypeToggle('lofi')}
                        className={`py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold tracking-tight border active:scale-95 transition-all text-center cursor-pointer ${
                            currentSoundType === 'lofi' 
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-xs' 
                                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Music className="w-5 h-5 text-indigo-505" />
                        <span className="text-[10px]">Music</span>
                    </button>

                    {/* HUGE FLOATING CENTER PLAY/PAUSE TRIGGER */}
                    <div className="flex justify-center items-center">
                        <button 
                            onClick={togglePlayPause}
                            className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center hover:scale-108 active:scale-90 transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer relative"
                        >
                            {/* Visual outer glowing circle pulse */}
                            <span className="absolute inset-0 rounded-full bg-pink-500/20 scale-120 animate-ping opacity-35" />
                            {isActive ? (
                                <Pause className="w-6 h-6 fill-white text-white" />
                            ) : (
                                <Play className="w-6 h-6 fill-white text-white ml-1" />
                            )}
                        </button>
                    </div>

                    <button 
                        onClick={() => handleSoundTypeToggle('rain')}
                        className={`py-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 font-bold tracking-tight border active:scale-95 transition-all text-center cursor-pointer ${
                            currentSoundType === 'rain' 
                                ? 'bg-indigo-50 border-indigo-400 text-indigo-600 shadow-xs' 
                                : 'bg-white border-slate-100 text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <CloudRain className="w-5 h-5 text-indigo-505" />
                        <span className="text-[10px]">White Noise</span>
                    </button>

                    <button 
                        onClick={() => {
                            setIsFullscreen(true);
                            navigate('/tools/timer/fullscreen');
                        }}
                        className="py-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800 flex flex-col items-center justify-center gap-1 font-bold tracking-tight active:scale-95 transition-all text-center cursor-pointer"
                        id="enter_fullscreen_btn"
                    >
                        <Maximize2 className="w-5 h-5" />
                        <span className="text-[10px]">Full Screen</span>
                    </button>
                </div>

                {/* Bottom Bento Box Grid Section matching photograph detail views */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    
                    {/* LEFT CELL: TODAY OVERVIEW BOX */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-violet-500" /> Today Overview
                            </h3>
                            <button 
                                onClick={() => setIsStatsOpen(!isStatsOpen)}
                                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer border-0 bg-transparent"
                            >
                                View stats <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Four grid column visual metrics as shown in photo */}
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="bg-slate-50/50 p-2.5 border border-slate-50 rounded-2xl">
                                <Clock className="w-4 h-4 text-indigo-500 mx-auto mb-2" />
                                <span className="block text-xs font-bold font-mono text-slate-800">{formatTimeDurationStr(todayFocusSeconds)}</span>
                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Focus Time</span>
                            </div>

                            <div className="bg-slate-50/50 p-2.5 border border-slate-50 rounded-2xl">
                                <ClipboardList className="w-4 h-4 text-indigo-500 mx-auto mb-2" />
                                <span className="block text-xs font-bold font-mono text-slate-800">{todaySessions}</span>
                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Sessions</span>
                            </div>

                            <div className="bg-slate-50/50 p-2.5 border border-slate-50 rounded-2xl">
                                <Target className="w-4 h-4 text-orange-500 mx-auto mb-2" />
                                <span className="block text-xs font-bold font-mono text-slate-800">{tasksProgressPct}%</span>
                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Goal Progress</span>
                            </div>

                            <div className="bg-slate-50/50 p-2.5 border border-slate-50 rounded-2xl">
                                <Trophy className="w-4 h-4 text-purple-500 mx-auto mb-2" />
                                <span className="block text-xs font-bold font-mono text-slate-800">{points}</span>
                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Points</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CELL: CURRENT STREAK CALENDAR & BOARDS */}
                    <div className="bg-indigo-950 text-white rounded-3xl p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                        {/* Background subtle glowing ball graphics */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-500/15 rounded-full blur-xl pointer-events-none" />

                        <div className="space-y-3 relative z-10">
                            <span className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block">Focus Tracker</span>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">
                                Current Streak <Flame className="w-5 h-5 text-orange-400" />
                            </h3>
                            <p className="text-xs text-indigo-200">Keep it up! 🔥 Complete focus block sessions to gain progress points.</p>
                        </div>

                        {/* Middle streak giant layout indicator */}
                        <div className="my-3 flex items-center justify-between text-left relative z-10">
                            <div>
                                <span className="text-3xl font-black text-white">{streak}</span>
                                <span className="text-sm text-indigo-300 font-extrabold block">Consecutive Days</span>
                            </div>
                            <div className="text-4xl">🔥</div>
                        </div>

                        {/* Grid row of week days labels capsule indicator */}
                        <div className="flex justify-between items-center bg-indigo-900/50 border border-indigo-800/35 p-2 rounded-2xl relative z-10 gap-1.5">
                            {streakDays.map((checked, i) => {
                                const currentDay = new Date().getDay();
                                const currentDayIdx = currentDay === 0 ? 6 : currentDay - 1;
                                const isToday = currentDayIdx === i;
                                return (
                                    <div 
                                        key={i} 
                                        onClick={() => {
                                            // Toggle status manually if desired
                                            const nextDays = [...streakDays];
                                            nextDays[i] = !nextDays[i];
                                            setStreakDays(nextDays);
                                        }}
                                        className={`flex-1 text-center py-1.5 rounded-xl transition-all cursor-pointer ${
                                            checked 
                                                ? 'bg-indigo-600 border border-indigo-500 text-white' 
                                                : isToday
                                                    ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                                                    : 'bg-indigo-950/40 text-indigo-400 border border-transparent hover:border-indigo-800/30'
                                        }`}
                                    >
                                        <span className="block text-[8px] font-black text-indigo-200 uppercase">{DAYS_NAMES[i]}</span>
                                        <span className="block text-xs mt-0.5">{checked ? '✓' : '○'}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* LOWER BENTO BOX SECTION - Music playlists, Goal Planner list etc. */}
                <div className="grid grid-cols-1 gap-6 pt-2">
                    
                    {/* PLAYLIST FOCUS MUSIC SELECTION */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-4 w-full">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                <Music className="w-4 h-4 text-indigo-505" /> Focus Music & Sounds
                            </h3>
                            <button 
                                onClick={() => setIsAudioModalOpen(true)}
                                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 cursor-pointer border-0 bg-transparent"
                            >
                                Playlist <ChevronRight className="w-3.5 h-3.5 inline" />
                            </button>
                        </div>

                        {/* Main playlist detail active layout item */}
                        <div className="bg-linear-to-r from-violet-55 to-indigo-55 p-4 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-xl overflow-hidden relative group shrink-0">
                                    <img 
                                        src="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=120&auto=format&fit=crop&q=80" 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer"
                                    />
                                    <button 
                                        onClick={() => handleSoundTypeToggle('lofi')}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                    >
                                        {currentSoundType === 'lofi' && isActive ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
                                    </button>
                                </div>
                                <div>
                                    <span className="text-sm font-black text-slate-800 block">Lo-Fi Beats</span>
                                    <span className="text-[10px] font-bold text-slate-400 capitalize block mt-0.5">Chill & Study • Live Synthesizer</span>
                                </div>
                            </div>

                            {/* Audio active animated bar chart */}
                            {currentSoundType === 'lofi' && isActive && (
                                <div className="flex items-end gap-0.5 w-6 h-5">
                                    <span className="w-0.5 bg-indigo-600 rounded-full animate-pulse h-3.5" />
                                    <span className="w-0.5 bg-indigo-600 rounded-full animate-pulse h-5" />
                                    <span className="w-0.5 bg-indigo-600 rounded-full animate-pulse h-2.5" />
                                </div>
                            )}
                        </div>

                        {/* Row slider gallery of alternative quick playlists/sounds */}
                        <div className="grid grid-cols-4 gap-2 pt-1">
                            {[
                                { id: 'rain', label: 'Rain Wood', img: 'https://images.unsplash.com/photo-1437419764061-2473afe69fc2?w=100&auto=format&fit=crop&q=80' },
                                { id: 'forest', label: 'Bird Glade', img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&auto=format&fit=crop&q=80' },
                                { id: 'space', label: 'Theta Cosmic', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop&q=80' },
                            ].map((snd) => (
                                <div 
                                    key={snd.id}
                                    onClick={() => handleSoundTypeToggle(snd.id as any)}
                                    className={`relative rounded-xl overflow-hidden cursor-pointer h-14 border transition-all ${
                                        currentSoundType === snd.id ? 'border-indigo-500 scale-102 ring-2 ring-indigo-500/10' : 'border-transparent hover:scale-101'
                                    }`}
                                >
                                    <img src={snd.img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-black/35 hover:bg-black/25 flex flex-col justify-end p-1 text-[8px] font-bold text-white tracking-tight">
                                        {snd.label}
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => setIsAudioModalOpen(true)}
                                className="h-14 rounded-xl border border-dashed border-slate-200 hover:border-slate-400 bg-slate-50 flex items-center justify-center text-slate-400 active:scale-95 transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>

            </main>

            {/* --- GOAL PLANNER MODAL SIDE PANEL --- */}
            <AnimatePresence>
                {isGoalPlannerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Overlay backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsGoalPlannerOpen(false)}
                            className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                        />

                        {/* Modal Frame paper container */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 15 }}
                            className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
                                    <ListTodo className="w-5 h-5 text-indigo-500" /> Goal Planner Checklist
                                </h3>
                                <button 
                                    onClick={() => setIsGoalPlannerOpen(false)}
                                    className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-450 hover:text-slate-800 rounded-lg flex items-center justify-center text-xs cursor-pointer font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-xs text-slate-400">
                                State target learning checkpoints below. Every goal completed adds <span className="font-bold text-indigo-600">+10 Points</span>!
                            </p>

                            {/* Add checklist item */}
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newTaskText}
                                    placeholder="e.g. Study Chemistry formulas"
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-100 outline-none rounded-xl text-xs font-semibold focus:ring-1 focus:ring-indigo-300"
                                />
                                <button
                                    onClick={handleAddTask}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
                                >
                                    Add Goal
                                </button>
                            </div>

                            {/* Goals checklist scroll layout */}
                            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                {tasks.map((task) => (
                                    <div 
                                        key={task.id}
                                        className="p-2.5 bg-slate-50/50 border border-slate-100 rounded-xl flex items-center justify-between gap-1.5"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <button
                                                onClick={() => toggleTaskCompleted(task.id)}
                                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                                    task.completed 
                                                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                                                        : 'border-slate-200 bg-white hover:border-indigo-400'
                                                }`}
                                            >
                                                {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                            </button>
                                            <span className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                                                {task.text}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleDeleteTask(task.id)}
                                            className="p-1 text-slate-350 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}

                                {tasks.length === 0 && (
                                    <p className="text-xs text-slate-400 italic text-center py-4">No agendas declared. Define customized target goals above!</p>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- CUSTOM TIMERS SETTINGS PICKER MODAL --- */}
            <AnimatePresence>
                {isCustomTimerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCustomTimerOpen(false)}
                            className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                        />

                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 w-full max-w-sm relative z-10 shadow-2xl space-y-4 text-left"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                                    ⚙ Custom Timer Setup
                                </h3>
                                <button 
                                    onClick={() => setIsCustomTimerOpen(false)}
                                    className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-450 rounded-lg flex items-center justify-center text-xs font-bold"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Session Title Input field */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">Session Name</label>
                                <input 
                                    type="text" 
                                    value={customTitleInput}
                                    placeholder="e.g. Science Revision, Logic, Break"
                                    onChange={(e) => setCustomTitleInput(e.target.value)}
                                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 select-all"
                                />
                            </div>

                            {/* Focus Duration Range range scale bar slider */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Focus Duration</span>
                                    <span className="text-indigo-600 font-black">{customMins} Minutes</span>
                                </div>
                                <input 
                                    type="range"
                                    min="1"
                                    max="180"
                                    step="1"
                                    value={customMins}
                                    onChange={(e) => setCustomMins(parseInt(e.target.value))}
                                    className="w-full accent-indigo-500 h-1.5 cursor-pointer"
                                />
                            </div>

                            {/* Selectable grid multipliers presets */}
                            <div className="grid grid-cols-5 gap-1.5">
                                {[10, 15, 25, 45, 60].map((pr) => (
                                    <button
                                        key={pr}
                                        onClick={() => setCustomMins(pr)}
                                        className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                            customMins === pr ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-indigo-50'
                                        }`}
                                    >
                                        {pr}m
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        const cleanName = customTitleInput.trim() || 'Custom Session';
                                        startQuickTimer(customMins, cleanName);
                                        setIsCustomTimerOpen(false);
                                    }}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer border-0"
                                >
                                    Apply & Launch Session <Check className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- FOCUS STATS HISTORY INTERACTIVE PANEL --- */}
            <AnimatePresence>
                {isStatsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsStatsOpen(false)}
                            className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                        />

                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                                    <BarChart2 className="w-5 h-5 text-emerald-500" /> Focus Analytics
                                </h3>
                                <button 
                                    onClick={() => setIsStatsOpen(false)}
                                    className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-450 rounded-lg flex items-center justify-center text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* SVG Column Chart graph presentation details */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Weekly Performance Tracker</span>
                                    <p className="text-xs text-slate-600">Represented in active focus minutes spent per day.</p>
                                </div>

                                <div className="h-40 bg-slate-50 border border-slate-100 rounded-2xl flex items-end justify-between p-4 relative">
                                    {/* Y axis helpers lines decoration */}
                                    <div className="absolute inset-x-0 top-1/4 border-t border-slate-100 border-dashed" />
                                    <div className="absolute inset-x-0 top-2/4 border-t border-slate-100 border-dashed" />
                                    <div className="absolute inset-x-0 top-3/4 border-t border-slate-100 border-dashed" />

                                    {weeklyHistory.map((val, idx) => {
                                        // Max scale 120 minutes focus
                                        const maxScaleHeight = 120;
                                        const pctRatio = Math.min(100, Math.max(8, (val / maxScaleHeight) * 100));
                                        return (
                                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 relative z-10">
                                                <span className="text-[9px] font-mono font-bold text-indigo-600 block">{val}m</span>
                                                <div 
                                                    className="w-4 bg-linear-to-t from-violet-500 to-indigo-600 rounded-t-sm transition-all duration-1000 ease-out" 
                                                    style={{ height: `${pctRatio}px` }} 
                                                />
                                                <span className="text-[9px] font-bold text-slate-400 block">{DAYS_NAMES[idx]}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border border-slate-100">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Focus Time</span>
                                        <span className="text-base font-black text-slate-800">{formatTimeDurationStr(todayFocusSeconds)}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to reset focus stats records?')) {
                                                setTodayFocusSeconds(0);
                                                setTodaySessions(0);
                                                setPoints(0);
                                                setWeeklyHistory([0, 0, 0, 0, 0, 0, 0]);
                                                alert('Focus stats telemetry reset.');
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-xs font-bold"
                                    >
                                        Clear History
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- AUDIO SELECTION SOUNDS MODAL DIALOG --- */}
            <AnimatePresence>
                {isAudioModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAudioModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/45 backdrop-blur-xs"
                        />

                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 w-full max-w-md relative z-10 shadow-2xl space-y-4 text-left"
                        >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                                    🎵 Focus Audio Playlists
                                </h3>
                                <button 
                                    onClick={() => setIsAudioModalOpen(false)}
                                    className="w-7 h-7 bg-slate-50 border border-slate-100 text-slate-450 rounded-lg flex items-center justify-center text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            <p className="text-[11px] text-slate-400">Select standard browser synthesized audio environments designed to lock in focus.</p>

                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {[
                                    { id: 'lofi', title: 'Lofi Swell Vibrations', label: 'Ethereal organic keyboard synth pads', icon: '🎹' },
                                    { id: 'rain', title: 'Cosmic Rain storm', label: 'High-density brown noise generated drop simulator', icon: '🌧️' },
                                    { id: 'forest', title: 'Natural Bird Whispers', label: 'Wind swells modulated oscillators', icon: '🌲' },
                                    { id: 'space', title: 'Binaural Theta Beats', label: 'detuned oscillators generating focus waves', icon: '🌌' },
                                ].map((item) => (
                                    <div 
                                        key={item.id}
                                        onClick={() => handleSoundTypeToggle(item.id as any)}
                                        className={`p-3 border rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                                            currentSoundType === item.id 
                                                ? 'border-indigo-500 bg-indigo-50/20' 
                                                : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <span className="font-black text-slate-800 block text-xs truncate">{item.title}</span>
                                                <span className="text-[10px] text-slate-400 block truncate">{item.label}</span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {currentSoundType === item.id ? (
                                                <span className="px-2.5 py-1 bg-indigo-500 text-white rounded-md text-[8px] font-black uppercase tracking-wider">Active</span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800 rounded-md text-[8px] font-black uppercase tracking-wider">Listen</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
