import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Download, Palette, LayoutGrid, Image as ImageIcon, Video, 
  Volume2, FlaskConical, Pencil, ChevronRight, X, Trash2, Info, Plus, Play, Pause,
  Cat, Bird, Leaf, Sigma, Monitor, Microscope, VolumeX, Headphones, Music, Sparkles, Network, 
  Trophy, AlignLeft, Share2, Save, ChevronDown, Check, RotateCcw, HelpCircle, AlertCircle,
  Globe, Radio, XSquare, EyeOff, Square, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Help mapping unique linking system icon
const Link2Id = ({ className = "" }: { className?: string }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
        </svg>
    );
};

const ImageVideoModal = ({ item, type, onClose }: { item: any, type: 'image' | 'video', onClose: () => void }) => {
    const [showActions, setShowActions] = useState(false);
    
    const handleDownload = async () => {
        const url = type === 'image' ? (item.largeImageURL || item.webformatURL) : (item.videos?.large?.url || item.videos?.medium?.url || item.videos?.small?.url);
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
                    className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all border border-white/10 cursor-pointer"
                >
                    <AlignLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 px-4 text-center">
                    <h4 className="text-white font-black text-[0.62rem] uppercase tracking-widest opacity-50">Visual Preview</h4>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-all border border-white/10 cursor-pointer"
                >
                    <X className="w-5 h-5" />
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
                        className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
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
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-1">{item.tags?.split(',')[0] || "Stock Asset"}</h3>
                 <p className="text-white/40 font-bold text-[0.62rem] uppercase tracking-widest mt-1">
                    {item.user === "Wikimedia Commons" ? "Free Media • Wikimedia Commons" : "High Quality Educational Resource"}
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
                        className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-3xl flex flex-col items-center justify-center gap-12"
                        onClick={e => { e.stopPropagation(); setShowActions(false); }}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDownload(); setShowActions(false); }}
                                className="w-20 h-20 bg-blue-600 hover:bg-blue-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                                <Download className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-[0.62rem] tracking-widest">Download Asset</span>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                                className="w-20 h-20 bg-emerald-500 hover:bg-emerald-400 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                                <Share2 className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-[0.62rem] tracking-widest">Share with class</span>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
                                className="w-20 h-20 bg-amber-500 hover:bg-amber-400 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                            >
                                <Save className="w-8 h-8" />
                            </button>
                            <span className="text-white font-black uppercase text-[0.62rem] tracking-widest">Save to kit</span>
                        </div>

                        <button 
                            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
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

const getVideoThumbnail = (vid: { id: number; picture_id?: string; tags?: string }) => {
    const tags = (vid.tags || '').toLowerCase();
    
    // Check tags or topics
    if (tags.includes('space') || tags.includes('galaxy') || tags.includes('astronomy') || tags.includes('star') || tags.includes('planet') || tags.includes('nebula') || tags.includes('cosmos') || tags.includes('rocket')) {
        return `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('chemistry') || tags.includes('lab') || tags.includes('experiment') || tags.includes('liquid') || tags.includes('chemical') || tags.includes('reaction') || tags.includes('flask') || tags.includes('acid')) {
        return `https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('math') || tags.includes('geometry') || tags.includes('calculus') || tags.includes('equation') || tags.includes('numbers') || tags.includes('matrix') || tags.includes('algebra') || tags.includes('formula')) {
        return `https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('nature') || tags.includes('forest') || tags.includes('tree') || tags.includes('landscape') || tags.includes('river') || tags.includes('waterfall') || tags.includes('mountain') || tags.includes('sea') || tags.includes('ocean')) {
        return `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('city') || tags.includes('street') || tags.includes('building') || tags.includes('traffic') || tags.includes('bridge')) {
        return `https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('tech') || tags.includes('computer') || tags.includes('coding') || tags.includes('program') || tags.includes('microchip') || tags.includes('ai') || tags.includes('code') || tags.includes('development')) {
        return `https://images.unsplash.com/photo-1518770660439-4636190af475?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('book') || tags.includes('library') || tags.includes('read') || tags.includes('school') || tags.includes('study') || tags.includes('education') || tags.includes('classroom')) {
        return `https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('gear') || tags.includes('mechanic') || tags.includes('physics') || tags.includes('wave') || tags.includes('laser') || tags.includes('force') || tags.includes('gravity') || tags.includes('atom') || tags.includes('atomics') || tags.includes('quantum')) {
        return `https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=640&auto=format&fit=crop&q=80`; 
    }
    if (tags.includes('cell') || tags.includes('microscope') || tags.includes('biology') || tags.includes('dna') || tags.includes('bacteria') || tags.includes('organism') || tags.includes('virus') || tags.includes('medical') || tags.includes('health')) {
        return `https://images.unsplash.com/photo-1576086213369-97a306d36557?w=640&auto=format&fit=crop&q=80`; 
    }

    if (vid.picture_id) {
        return `https://i.vimeocdn.com/video/${vid.picture_id}_640x360.jpg`;
    }

    return `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&auto=format&fit=crop&q=80`;
};

export const VisualsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'overview' | 'pictures' | 'videos' | 'audio' | 'diagrams' | 'mindmap'>('overview');

    // State for Pictures
    const [picsQuery, setPicsQuery] = useState('');
    const [picsCategory, setPicsCategory] = useState('All');
    const [pictures, setPictures] = useState<any[]>([]);
    const [picsLoading, setPicsLoading] = useState(false);
    const [picsLoadingMore, setPicsLoadingMore] = useState(false);
    const [picsPage, setPicsPage] = useState(1);
    const [picsHasMore, setPicsHasMore] = useState(true);
    const [selectedPic, setSelectedPic] = useState<any | null>(null);
    const [picActiveTab, setPicActiveTab] = useState('For You');

    // State for Videos
    const [vidsQuery, setVidsQuery] = useState('');
    const [vidsCategory, setVidsCategory] = useState('All');
    const [videos, setVideos] = useState<any[]>([]);
    const [vidsLoading, setVidsLoading] = useState(false);
    const [vidsLoadingMore, setVidsLoadingMore] = useState(false);
    const [vidsPage, setVidsPage] = useState(1);
    const [vidsHasMore, setVidsHasMore] = useState(true);
    const [selectedVid, setSelectedVid] = useState<any | null>(null);
    const [vidActiveTab, setVidActiveTab] = useState('For You');

    // Pixabay Credentials
    const API_KEY = '55653734-9bcb53c51c27b0c301beab7dc';

    // State for Audio study frequencies
    const [focusSounds, setFocusSounds] = useState({
        rain: { playing: false, volume: 50 },
        birds: { playing: false, volume: 40 },
        lofi: { playing: false, volume: 30 },
        cafe: { playing: false, volume: 20 }
    });

    // Podcast Study Lessons
    const PODCASTS = [
        {
            id: 'mnemonic',
            title: 'Visual Mnemonic Tricks',
            speaker: 'Dr. Sameer Gautam',
            duration: '03:15',
            summary: 'How to overlay complex science steps atop house diagrams or location paths.',
            transcript: [
                'Welcome back to Aadhar Voice Guides. Today, we focus on Visual Mnemonic Association.',
                'The human brain is optimized to store environmental landmarks far better than logical strings.',
                'When memorizing formulas or biochemistry steps (like the Krebs Cycle), associate each milestone with a room in your childhood house.',
                'By taking a mental walk through this memory palace, complex visual details are recalled effortlessly.',
                'Practise this today by mapping your science curriculum items into 5 distinct zones of your study room!'
            ]
        },
        {
            id: 'recall',
            title: 'Feynman Visual Map Method',
            speaker: 'Prof. Anjana Thapa',
            duration: '04:00',
            summary: 'Deconstruct engineering definitions into simple kids-illustration cards.',
            transcript: [
                'In today’s block, let’s explore the Feynman Visual Map technique.',
                'Many students make the mistake of using purely abstract keywords on flashcards.',
                'True mastery requires translating complex mechanical laws into a comic sketch that a 10-year old can enjoy.',
                'If you cannot outline a force action or heat transfer on a 3-step sketch, you do not fully grasp it.',
                'Grab a sheet, draw standard everyday analogies (like water pumps for battery currents), and watch your analytical grades spike!'
            ]
        }
    ];
    const [activePodcast, setActivePodcast] = useState<any>(PODCASTS[0]);
    const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
    const [podProgress, setPodProgress] = useState(15);
    const [podPlaybackSpeed, setPodPlaybackSpeed] = useState<number>(1);

    // Dynamic Study Music States
    const STUDY_TRACKS = [
        {
            title: "Alpha Brainwave Stream",
            description: "14Hz Focus Waves generated dynamically as deep background humming",
            vibe: "Focus Frequency",
            duration: "05:00",
            color: "from-blue-600 via-indigo-600 to-violet-600",
            bgPulse: "bg-indigo-500/10",
            genre: "Binaural Study"
        },
        {
            title: "Lofi Rain & Piano Library",
            description: "Cozy background warm coffee beats to ease revision anxiety",
            vibe: "Rainy Cozy Cafe",
            duration: "04:30",
            color: "from-rose-500 via-pink-500 to-amber-500",
            bgPulse: "bg-pink-500/10",
            genre: "Lofi Beats"
        },
        {
            title: "Mozart Spatial Sonata",
            description: "Instrumental strings to stimulate cognitive spatial association",
            vibe: "Vienna Royal Hall",
            duration: "06:15",
            color: "from-emerald-500 via-teal-500 to-cyan-500",
            bgPulse: "bg-emerald-500/10",
            genre: "Classical Focus"
        },
        {
            title: "Deep Mountain Creek",
            description: "White noise water flow with melodic wind chimes",
            vibe: "Active Forest Mind",
            duration: "07:00",
            color: "from-amber-500 via-orange-500 to-red-500",
            bgPulse: "bg-amber-500/10",
            genre: "Nature Ambient"
        }
    ];

    const [activeTrackIndex, setActiveTrackIndex] = useState(0);
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const [musicProgress, setMusicProgress] = useState(30);
    const [musicVolume, setMusicVolume] = useState(70);

    // Audio Listening Quiz state
    const LISTENING_QUIZ_QUESTIONS = [
        {
            id: 'q1',
            question: "Why does the human brain store childhood rooms better than abstract formula lists?",
            options: [
                "Because our brain treats text coordinates like pixels",
                "Because the human brain is evolutionarily optimized to capture spatial landmarks",
                "Because childhood rooms retain chemical properties of chlorophyll",
                "Because memory palaces do not require sleep"
            ],
            correct: 1,
            explanation: "As explained in Dr. Sameer's podcast, evolutionary biology customizes the brain to retain physical landmarks and locations far better than simple text coordinates."
        },
        {
            id: 'q2',
            question: "What physical mechanism is used as an analogy for battery currents in Feynman maps?",
            options: [
                "Evapo-transpiration chambers",
                "Water pump flow pipelines",
                "Linear algebra graphs with slope m",
                "Solar wind collectors"
            ],
            correct: 1,
            explanation: "The Feynman Method promotes simple everyday visualizations (like plumbing/water pump systems representing electric charge rates) to capture pure understanding."
        },
        {
            id: 'q3',
            question: "How many zones of your study room should you map your curriculum items into?",
            options: [
                "Exactly 12 quadrants",
                "2 lateral sectors",
                "5 distinct zones",
                "No zones are recommended"
            ],
            correct: 2,
            explanation: "The Mnemonics podcast advises beginners to choose exactly 5 distinct zones of their immediate study room to practice anchoring terms."
        }
    ];

    const [listeningSubTab, setListeningSubTab] = useState<'lecture' | 'quiz'>('lecture');
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [blindListeningMode, setBlindListeningMode] = useState(false);

    // Speech Synthesis controller
    const speakText = (text: string) => {
        if (!('speechSynthesis' in window)) {
            alert("Speech synthesis not supported in this browser.");
            return;
        }
        window.speechSynthesis.cancel();
        const textToSpeak = text.replace(/[•#]/g, ' ');
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.pitch = 1.02;

        const voices = window.speechSynthesis.getVoices();
        const chosenVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                            voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('natural')) ||
                            voices.find(v => v.lang.startsWith('en'));
        if (chosenVoice) {
            utterance.voice = chosenVoice;
        }

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeakingText = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    };

    // Diagrams Tab State
    const [diagramType, setDiagramType] = useState<'water' | 'photosynthesis' | 'geometry'>('water');
    const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

    // Geometry Linear Graph parameters
    const [geoM, setGeoM] = useState<number>(1);
    const [geoC, setGeoC] = useState<number>(2);

    // Mind-Map Interactive Creator state
    const [nodes, setNodes] = useState<any[]>([
        { id: '1', x: 220, y: 130, text: 'Aadhar Visual Hub', color: 'indigo', shape: 'rect' },
        { id: '2', x: 100, y: 240, text: 'Brain Diagrams', color: 'emerald', shape: 'circle' },
        { id: '3', x: 340, y: 240, text: 'Creative Canvas', color: 'rose', shape: 'diamond' }
    ]);
    const [edges, setEdges] = useState<any[]>([
        { from: '1', to: '2' },
        { from: '1', to: '3' }
    ]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
    const [nodeText, setNodeText] = useState('');
    const [nodeColor, setNodeColor] = useState('indigo');
    const [nodeShape, setNodeShape] = useState<'rect' | 'circle' | 'diamond'>('rect');
    const [dragNodeId, setDragNodeId] = useState<string | null>(null);
    const canvasRef = useRef<SVGSVGElement | null>(null);

    // Methods for fetching visuals content
    const fetchPictures = async (searchQuery: string, pageNum: number, category: string, isNewSearch: boolean = false) => {
        if (!window.navigator.onLine) {
            setPicsLoading(false); setPicsLoadingMore(false); return;
        }
        if (isNewSearch) {
            setPicsLoading(true);
            setPictures([]);
        } else {
            setPicsLoadingMore(true);
        }
        
        try {
            let currentQ = searchQuery.trim();
            const pixabayCategory = (!category || category === 'All') ? '' : category.toLowerCase();
            
            let queryParam = currentQ;
            if (!queryParam && category !== 'All') {
                const found = [
                    { name: 'Animals', query: 'wild animals' },
                    { name: 'Birds', query: 'birds' },
                    { name: 'Flowers', query: 'flowers' },
                    { name: 'Drawing', query: 'sketch drawing' }
                ].find(c => c.name === category);
                queryParam = found ? found.query : pixabayCategory;
            }
            if (!queryParam && !pixabayCategory) {
                queryParam = 'nature forest science physics';
            }

            const res = await fetch(`https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(queryParam)}&image_type=photo&per_page=30&page=${pageNum}&safesearch=true&orientation=vertical`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                setPictures(prev => {
                    const nextList = isNewSearch ? data.hits : [...prev, ...data.hits];
                    const seen = new Set();
                    return nextList.filter(item => {
                        if (!item || item.id === undefined) return false;
                        if (seen.has(item.id)) return false;
                        seen.add(item.id);
                        return true;
                    });
                });
                setPicsHasMore(data.hits.length === 30);
            } else {
                setPicsHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setPicsLoading(false);
            setPicsLoadingMore(false);
        }
    };

    const fetchVideos = async (searchQuery: string, pageNum: number, category: string, isNewSearch: boolean = false) => {
        if (!window.navigator.onLine) {
            setVidsLoading(false); setVidsLoadingMore(false); return;
        }
        if (isNewSearch) {
            setVidsLoading(true);
            setVideos([]);
        } else {
            setVidsLoadingMore(true);
        }
        
        try {
            let currentQ = searchQuery.trim();
            const pixabayCategory = (!category || category === 'All') ? '' : category.toLowerCase();
            
            let queryParam = currentQ;
            if (!queryParam && category !== 'All') {
                const found = [
                    { name: 'Science', query: 'science' },
                    { name: 'Maths', query: 'mathematics' },
                    { name: 'Tech', query: 'technology' },
                    { name: 'Nature', query: 'nature' }
                ].find(c => c.name === category);
                queryParam = found ? found.query : pixabayCategory;
            }
            if (!queryParam && !pixabayCategory) {
                queryParam = 'educational technology science learning';
            }

            const res = await fetch(`https://pixabay.com/api/videos/?key=${API_KEY}&q=${encodeURIComponent(queryParam)}&per_page=30&page=${pageNum}&safesearch=true`);
            const data = await res.json();
            
            if (data.hits && data.hits.length > 0) {
                setVideos(prev => {
                    const nextList = isNewSearch ? data.hits : [...prev, ...data.hits];
                    const seen = new Set();
                    return nextList.filter(item => {
                        if (!item || item.id === undefined) return false;
                        if (seen.has(item.id)) return false;
                        seen.add(item.id);
                        return true;
                    });
                });
                setVidsHasMore(data.hits.length === 30);
            } else {
                setVidsHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setVidsLoading(false);
            setVidsLoadingMore(false);
        }
    };

    // Infinite Scroll Handlers
    const loadMorePics = useCallback(() => {
        if (!picsLoadingMore && picsHasMore) {
            const nextP = picsPage + 1;
            setPicsPage(nextP);
            fetchPictures(picsQuery, nextP, picsCategory, false);
        }
    }, [picsLoadingMore, picsHasMore, picsPage, picsQuery, picsCategory]);

    const loadMoreVids = useCallback(() => {
        if (!vidsLoadingMore && vidsHasMore) {
            const nextP = vidsPage + 1;
            setVidsPage(nextP);
            fetchVideos(vidsQuery, nextP, vidsCategory, false);
        }
    }, [vidsLoadingMore, vidsHasMore, vidsPage, vidsQuery, vidsCategory]);

    useEffect(() => {
        if (activeTab === 'pictures') {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && picsHasMore && !picsLoading && !picsLoadingMore) {
                    loadMorePics();
                }
            }, { threshold: 0.1 });
            const sentinel = document.getElementById('sentinel-pics-visuals');
            if (sentinel) observer.observe(sentinel);
            return () => observer.disconnect();
        }
    }, [activeTab, picsHasMore, picsLoading, picsLoadingMore, loadMorePics]);

    useEffect(() => {
        if (activeTab === 'videos') {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && vidsHasMore && !vidsLoading && !vidsLoadingMore) {
                    loadMoreVids();
                }
            }, { threshold: 0.1 });
            const sentinel = document.getElementById('sentinel-vids-visuals');
            if (sentinel) observer.observe(sentinel);
            return () => observer.disconnect();
        }
    }, [activeTab, vidsHasMore, vidsLoading, vidsLoadingMore, loadMoreVids]);

    useEffect(() => {
        fetchPictures('', 1, 'All', true);
        fetchVideos('', 1, 'All', true);

        const saved = localStorage.getItem('aadhar_mindmap_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.nodes && parsed.edges) {
                    setNodes(parsed.nodes);
                    setEdges(parsed.edges);
                }
            } catch (err) {
                console.error(err);
            }
        }
    }, []);

    const saveMindMap = (newNodes = nodes, newEdges = edges) => {
        localStorage.setItem('aadhar_mindmap_data', JSON.stringify({ nodes: newNodes, edges: newEdges }));
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        const target = e.target as SVGElement;
        const nodeId = target.getAttribute('data-node-id');
        if (nodeId) {
            setDragNodeId(nodeId);
            setSelectedNode(nodeId);
            const nd = nodes.find(n => n.id === nodeId);
            if (nd) {
                setNodeText(nd.text);
                setNodeColor(nd.color);
                setNodeShape(nd.shape);
            }
        } else {
            if (target === canvasRef.current) {
                setSelectedNode(null);
                setConnectingFromId(null);
            }
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!dragNodeId || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const mouseX = Math.round(e.clientX - rect.left);
        const mouseY = Math.round(e.clientY - rect.top);

        const boundedX = Math.max(30, Math.min(rect.width - 30, mouseX));
        const boundedY = Math.max(30, Math.min(rect.height - 30, mouseY));

        setNodes(prev => {
            const updated = prev.map(node => {
                if (node.id === dragNodeId) {
                    return { ...node, x: boundedX, y: boundedY };
                }
                return node;
            });
            saveMindMap(updated, edges);
            return updated;
        });
    };

    const handleCanvasMouseUpOrLeave = () => {
        setDragNodeId(null);
    };

    const addNewNode = () => {
        const canvasW = canvasRef.current ? canvasRef.current.getBoundingClientRect().width : 400;
        const newId = (Date.now()).toString();
        const newNode = {
            id: newId,
            x: Math.round(Math.random() * (canvasW - 120) + 60),
            y: Math.round(Math.random() * 150 + 60),
            text: 'New Topic',
            color: 'indigo',
            shape: 'rect'
        };
        const updated = [...nodes, newNode];
        setNodes(updated);
        setSelectedNode(newId);
        setNodeText('New Topic');
        setNodeColor('indigo');
        setNodeShape('rect');
        saveMindMap(updated, edges);
    };

    const deleteSelectedNode = () => {
        if (!selectedNode) return;
        const updatedNodes = nodes.filter(n => n.id !== selectedNode);
        const updatedEdges = edges.filter(e => e.from !== selectedNode && e.to !== selectedNode);
        setNodes(updatedNodes);
        setEdges(updatedEdges);
        setSelectedNode(null);
        setConnectingFromId(null);
        saveMindMap(updatedNodes, updatedEdges);
    };

    const handleNodeUpdate = (updates: any) => {
        if (!selectedNode) return;
        const updated = nodes.map(n => {
            if (n.id === selectedNode) {
                return { ...n, ...updates };
            }
            return n;
        });
        setNodes(updated);
        saveMindMap(updated, edges);
    };

    const startNodeConnection = () => {
        if (!selectedNode) return;
        setConnectingFromId(selectedNode);
    };

    const completeNodeConnection = (targetId: string) => {
        if (!connectingFromId || connectingFromId === targetId) return;
        const exists = edges.some(e => (e.from === connectingFromId && e.to === targetId) || (e.from === targetId && e.to === connectingFromId));
        if (!exists) {
            const updatedEdges = [...edges, { from: connectingFromId, to: targetId }];
            setEdges(updatedEdges);
            saveMindMap(nodes, updatedEdges);
        }
        setConnectingFromId(null);
    };

    const clearMindMap = () => {
        const initial = [
            { id: '1', x: 220, y: 130, text: 'Aadhar Visual Hub', color: 'indigo', shape: 'rect' }
        ];
        setNodes(initial);
        setEdges([]);
        setSelectedNode(null);
        setConnectingFromId(null);
        saveMindMap(initial, []);
    };

    const downloadAsset = async (url: string, id: string, fileType: 'jpg' | 'mp4') => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const bUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = bUrl;
            a.download = `VisualsHub_${id}.${fileType}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(bUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    const getHotspotDetails = () => {
        if (diagramType === 'water') {
            switch (activeHotspot) {
                case 'evaporation': return { title: 'Evaporation', text: 'Solar heat warms oceans, lakes and rivers, turning liquid water into vapor, rising high into the troposphere.' };
                case 'condensation': return { title: 'Condensation', text: 'As temperature drops in altitude, evaporated water vapor cools off and condenses into cloud droplets and dense fog.' };
                case 'precipitation': return { title: 'Precipitation', text: 'Cloud vapor droplets compile together until heavy enough. Gravity pulls them back as rain showers, ice sleet, or snow crystals.' };
                case 'infiltration': return { title: 'Infiltration & Subsoil Runoff', text: 'Precipitated rain seeps down through gravel beds, feeding subterranean aquifers and flowing slowly back into lake reservoirs.' };
                default: return { title: 'Select a hotspot', text: 'Hover or click the interactive tags on the diagram above to analyze specific steps in detail.' };
            }
        } else {
            switch (activeHotspot) {
                case 'sun': return { title: 'Sunlight Capture', text: 'The plant leaves containing chlorophyll pigment drink sunlight, stimulating chemical activity.' };
                case 'co2': return { title: 'Carbon Dioxide Intake', text: 'Stomata pores on the lower leaves drink atmospheric CO2 molecules directly.' };
                case 'glucose': return { title: 'Glucose Synthesis', text: 'Chemical potential splits hydrogen and oxygen to manufacture sugar-starch food chains for development.' };
                case 'o2': return { title: 'Oxygen Release', text: 'A byproduct of molecular split is released from stomata cells, restoring ambient atmospheric breathing oxygen.' };
                default: return { title: 'Select a leaf landmark', text: 'Hover or click the interactive hotspots in the plant leaf diagram above to study photosynthesis.' };
            }
        }
    };

    const hotspotDetails = getHotspotDetails();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-24 text-slate-800 font-sans">
            {/* Redesigned Premium Header matching the photo */}
            <header className="px-5 py-5 flex items-center gap-4 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 font-sans">
                <button 
                    onClick={() => {
                        if (activeTab === 'overview') {
                            navigate('/tools');
                        } else {
                            setActiveTab('overview');
                        }
                    }}
                    className="text-slate-800 hover:text-slate-950 active:scale-95 transition-all cursor-pointer focus:outline-none bg-transparent border-0 -ml-1 pr-1"
                >
                    <ArrowLeft className="w-6 h-6 stroke-[2.25]" />
                </button>
                
                <div className="flex items-center gap-2.5">
                    {activeTab === 'overview' && (
                        <div className="w-9 h-9 rounded-full bg-linear-to-tr from-pink-500 to-rose-450 text-white flex items-center justify-center shadow-xs">
                            <Palette className="w-5 h-5 stroke-[2.25]" />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                             {activeTab === 'pictures' && <ImageIcon className="w-5 h-5 text-pink-500" />}
                             {activeTab === 'videos' && <Video className="w-5 h-5 text-blue-500" />}
                             {activeTab === 'audio' && <Volume2 className="w-5 h-5 text-violet-500" />}
                             {activeTab === 'diagrams' && <FlaskConical className="w-5 h-5 text-emerald-500" />}
                             {activeTab === 'mindmap' && <Network className="w-5 h-5 text-indigo-500" />}
                             
                             <div>
                                 <h1 className="text-xl md:text-2xl font-black text-slate-950 leading-none tracking-tight">
                                     {activeTab === 'overview' && 'Visual Hub'}
                                     {activeTab === 'pictures' && 'Image Gallery'}
                                     {activeTab === 'videos' && 'Video Hub'}
                                     {activeTab === 'audio' && 'Audio Hub'}
                                     {activeTab === 'diagrams' && 'Interactive Labs'}
                                     {activeTab === 'mindmap' && 'Mind Map'}
                                 </h1>
                                 <p className="text-[11px] md:text-xs text-slate-400 font-bold tracking-tight mt-0.5">Explore. Learn. Visualize.</p>
                             </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Scrollable Workspace Containers */}
            <main className="px-3.5 py-4 w-full max-w-4xl mx-auto">
                <AnimatePresence mode="wait">
                    {/* 1. OVERVIEW HUB */}
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-4 animate-fade-in py-1"
                        >
                            {[
                                {
                                    id: 'pictures',
                                    title: 'Visual Library',
                                    desc: 'Discover and download thousands of educational images, biology sketches, and vector layouts.',
                                    icon: ImageIcon,
                                    iconColor: 'bg-linear-to-b from-[#FE2E93] to-[#FE5E82]',
                                    cardBg: 'bg-[#FFF0F2]',
                                    borderColor: 'border-[#FFE3E8]',
                                    watermark: (
                                        <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-pink-500/5 stroke-current fill-none pointer-events-none stroke-1 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 24 24">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'videos',
                                    title: 'Video Guides',
                                    desc: 'High quality real-time demonstrations of concepts and experiments.',
                                    icon: Video,
                                    iconColor: 'bg-linear-to-b from-[#1E80FE] to-[#5EA6FE]',
                                    cardBg: 'bg-[#EDF5FF]',
                                    borderColor: 'border-[#D9EAFF]',
                                    watermark: (
                                        <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-blue-500/5 stroke-current fill-none pointer-events-none stroke-1 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 24 24">
                                            <path d="M23 7l-7 5 7 5V7z" />
                                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'audio',
                                    title: 'Audio Focus',
                                    desc: 'Listen to concept-based audios and improve your focus while learning.',
                                    icon: Headphones,
                                    iconColor: 'bg-linear-to-b from-[#10B981] to-[#34D399]',
                                    cardBg: 'bg-[#F0FDF4]',
                                    borderColor: 'border-[#DCFCE7]',
                                    watermark: (
                                        <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-emerald-500/5 fill-current pointer-events-none group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 100 100">
                                            <rect x="10" y="40" width="6" height="20" rx="3" />
                                            <rect x="25" y="30" width="6" height="40" rx="3" />
                                            <rect x="40" y="20" width="6" height="60" rx="3" />
                                            <rect x="55" y="35" width="6" height="30" rx="3" />
                                            <rect x="70" y="25" width="6" height="50" rx="3" />
                                            <rect x="85" y="42" width="6" height="16" rx="3" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'diagrams',
                                    title: 'Lab Plots',
                                    desc: 'Explore laboratory graphs, charts, and scientific plot explanations.',
                                    icon: FlaskConical,
                                    iconColor: 'bg-linear-to-b from-[#F97316] to-[#FB923C]',
                                    cardBg: 'bg-[#FFF7ED]',
                                    borderColor: 'border-[#FFEDD5]',
                                    watermark: (
                                        <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-orange-500/5 stroke-current fill-none pointer-events-none stroke-1.5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 24 24">
                                            <path d="M3 3v18h18" />
                                            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                                        </svg>
                                    )
                                },
                                {
                                    id: 'mindmap',
                                    title: 'Mind Maps',
                                    desc: 'Visualize important topics with structured mind maps and diagrams.',
                                    icon: Network,
                                    iconColor: 'bg-linear-to-b from-[#8B5CF6] to-[#A78BFA]',
                                    cardBg: 'bg-[#F5F3FF]',
                                    borderColor: 'border-[#EDE9FE]',
                                    watermark: (
                                        <svg className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 text-purple-500/5 stroke-current fill-none pointer-events-none stroke-1.25 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500" viewBox="0 0 24 24">
                                            <rect x="9" y="1" width="6" height="4" rx="1" />
                                            <rect x="2" y="18" width="6" height="4" rx="1" />
                                            <rect x="16" y="18" width="6" height="4" rx="1" />
                                            <path d="M12 5v8M12 13H5v5M12 13h7v5" />
                                        </svg>
                                    )
                                }
                            ].map((card) => {
                                const CardIcon = card.icon;
                                return (
                                    <div 
                                        key={card.id}
                                        onClick={() => setActiveTab(card.id as any)}
                                        className={`flex items-center justify-between p-5 md:p-6 min-h-[128px] gap-4 md:gap-6 relative overflow-hidden rounded-3xl border transition-all duration-300 cursor-pointer group hover:shadow-xs hover:scale-[1.01] active:scale-99 ${card.cardBg} ${card.borderColor}`}
                                    >
                                        {card.watermark}
                                        
                                        <div className="flex items-center gap-4 relative z-10 w-full pr-10">
                                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] ${card.iconColor} text-white flex items-center justify-center p-3.5 shadow-md shadow-slate-900/5 shrink-0`}>
                                                <CardIcon className="w-7 h-7 md:w-8 md:h-8" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-extrabold text-slate-950 text-base md:text-lg leading-snug group-hover:text-indigo-600 transition-colors">{card.title}</h3>
                                                <p className="text-slate-500 text-xs md:text-sm leading-normal md:leading-relaxed mt-1.5 max-w-xl font-medium opacity-90">
                                                    {card.desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all shrink-0 absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-10 group-hover:translate-x-1 duration-300">
                                            <ChevronRight className="w-5 h-5 text-slate-400 stroke-[2.5]" />
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                                {/* 2. PICTURES GALLERY */}
                    {activeTab === 'pictures' && (
                        <motion.div
                            key="pictures"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Search bar */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 bg-white border border-slate-100 focus-within:border-pink-200 focus-within:ring-2 focus-within:ring-pink-150 rounded-2xl shadow-xs transition-all flex items-center px-4">
                                    <Search className="w-4 h-4 text-slate-300 mr-2.5" />
                                    <input 
                                        type="text"
                                        placeholder="Search visual illustrations (e.g., cell structure, physics lab, sketch)..."
                                        value={picsQuery}
                                        onChange={(e) => setPicsQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') fetchPictures(picsQuery, 1, picsCategory, true); }}
                                        className="w-full py-4 text-xs font-bold text-slate-700 placeholder:text-slate-350 outline-none"
                                    />
                                    {picsQuery && (
                                        <button onClick={() => { setPicsQuery(''); fetchPictures('', 1, picsCategory, true); }} className="text-xs text-slate-400 hover:text-slate-600 p-1 font-bold">Clear</button>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setPicsPage(1); fetchPictures(picsQuery, 1, picsCategory, true); }}
                                    className="px-8 py-4 bg-linear-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-pink-500/10 cursor-pointer"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Fast Category Filter pills */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                                {[
                                    { name: 'All', icon: LayoutGrid, query: '' },
                                    { name: 'Animals', icon: Cat, query: 'wild animals' },
                                    { name: 'Birds', icon: Bird, query: 'birds' },
                                    { name: 'Flowers', icon: Leaf, query: 'flowers' },
                                    { name: 'Drawing', icon: Pencil, query: 'sketch drawing' }
                                ].map((cat) => {
                                    const isSel = picsCategory === cat.name;
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => {
                                                setPicsCategory(cat.name);
                                                setPicsPage(1);
                                                fetchPictures(picsQuery, 1, cat.name, true);
                                            }}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[0.68rem] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border",
                                                isSel 
                                                    ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/10" 
                                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pictures Grid section */}
                            {picsLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-pink-500 rounded-full animate-spin" />
                                    <p className="text-[0.62rem] font-black uppercase tracking-widest text-slate-400">Fetching visual charts...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="columns-2 sm:columns-3 lg:columns-4 gap-1.5 space-y-1.5">
                                        {pictures.map((pic) => (
                                            <div 
                                                key={pic.id}
                                                className="break-inside-avoid relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 group cursor-pointer mb-1.5"
                                                onClick={() => setSelectedPic(pic)}
                                            >
                                                <img 
                                                    src={pic.webformatURL} 
                                                    alt={pic.tags} 
                                                    className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="absolute top-2 right-2 flex items-center justify-center bg-slate-900/40 hover:bg-slate-900/60 transition-colors rounded-full w-7 h-7 opacity-0 group-hover:opacity-100 z-10 transition-opacity">
                                                    <Download 
                                                        className="w-3.5 h-3.5 text-white cursor-pointer" 
                                                        onClick={(e) => { e.stopPropagation(); downloadAsset(pic.largeImageURL || pic.webformatURL, pic.id, 'jpg'); }} 
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {pictures.length === 0 && (
                                        <div className="py-20 text-center text-slate-400 space-y-2">
                                            <p className="text-xs font-bold uppercase tracking-widest">No pictures matching filter</p>
                                            <p className="text-[10px]">Verify your internet connectivity or key terms like "atom", "biology sketches", "botany".</p>
                                        </div>
                                    )}

                                    {/* Sentinel scroll trigger */}
                                    <div id="sentinel-pics-visuals" className="h-10 flex items-center justify-center">
                                        {picsLoadingMore && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-slate-100 border-t-pink-500 rounded-full animate-spin" />
                                                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Loading next plates...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Full-screen high-fidelity popup modal */}
                            <AnimatePresence>
                                {selectedPic && (
                                    <ImageVideoModal 
                                        item={selectedPic} 
                                        type="image" 
                                        onClose={() => setSelectedPic(null)} 
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* 3. VIDEOS CORNER */}
                    {activeTab === 'videos' && (
                        <motion.div
                            key="videos"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            {/* Search parameters */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 bg-white border border-slate-100 focus-within:border-blue-200 focus-within:ring-2 focus-within:ring-blue-150 rounded-2xl shadow-xs transition-all flex items-center px-4">
                                    <Search className="w-4 h-4 text-slate-300 mr-2.5" />
                                    <input 
                                        type="text"
                                        placeholder="Search class definitions (e.g., cell division, chemistry reaction, galaxy mechanics)..."
                                        value={vidsQuery}
                                        onChange={(e) => setVidsQuery(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') fetchVideos(vidsQuery, 1, vidsCategory, true); }}
                                        className="w-full py-4 text-xs font-bold text-slate-705 placeholder:text-slate-350 outline-none"
                                    />
                                    {vidsQuery && (
                                        <button onClick={() => { setVidsQuery(''); fetchVideos('', 1, vidsCategory, true); }} className="text-xs text-slate-400 hover:text-slate-650 p-1 font-bold">Clear</button>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setVidsPage(1); fetchVideos(vidsQuery, 1, vidsCategory, true); }}
                                    className="px-8 py-4 bg-linear-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Fast Category Filter pills */}
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                                {[
                                    { name: 'All', icon: LayoutGrid },
                                    { name: 'Science', icon: FlaskConical },
                                    { name: 'Astronomy', icon: Globe },
                                    { name: 'Nature', icon: Leaf },
                                    { name: 'City', icon: Monitor }
                                ].map((cat) => {
                                    const isSel = vidsCategory === cat.name;
                                    const Icon = cat.icon;
                                    return (
                                        <button
                                            key={cat.name}
                                            onClick={() => {
                                                setVidsCategory(cat.name);
                                                setVidsPage(1);
                                                fetchVideos(vidsQuery, 1, cat.name, true);
                                            }}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[0.68rem] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border",
                                                isSel 
                                                    ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/10" 
                                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <Icon className="w-3.5 h-3.5" />
                                            <span>{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {vidsLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center gap-3">
                                    <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
                                    <p className="text-[0.62rem] font-black uppercase tracking-widest text-slate-400">Loading learning reels...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {videos.map((vid) => {
                                            const thumbUrl = getVideoThumbnail(vid);
                                            return (
                                                <div 
                                                    key={vid.id}
                                                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:border-blue-200 hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                                                >
                                                    <div 
                                                        className="aspect-[16/9] bg-slate-200 relative group cursor-pointer overflow-hidden"
                                                        onClick={() => setSelectedVid(vid)}
                                                    >
                                                        <img src={thumbUrl} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" />
                                                        <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xs border border-white/45 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                                            </div>
                                                        </div>
                                                        <span className="absolute bottom-2 right-2 bg-slate-900/60 text-white font-mono text-[0.65rem] font-bold px-1.5 py-0.5 rounded-md">{vid.duration}s</span>
                                                    </div>
                                                    <div className="p-4 bg-linear-to-b from-transparent to-slate-50 border-t border-slate-50 space-y-2">
                                                        <p className="text-[0.65rem] font-extrabold text-slate-600 uppercase tracking-widest truncate">#{vid.tags.split(',')[0]} Classroom clip</p>
                                                        <div className="flex items-center justify-between text-[0.60rem] text-slate-400 font-bold">
                                                            <span>Resolution: {vid.videos?.medium?.width}p</span>
                                                            <span>Views: {vid.views}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {videos.length === 0 && (
                                        <div className="py-20 text-center text-slate-400 space-y-2">
                                            <p className="text-xs font-bold uppercase tracking-widest">No educational clips matching filter</p>
                                            <p className="text-[10px]">Ensure connectivity or modify search parameters like "molecular kinetic model", "gravity orbital".</p>
                                        </div>
                                    )}

                                    {/* Sentinel scroll trigger */}
                                    <div id="sentinel-vids-visuals" className="h-10 flex items-center justify-center">
                                        {vidsLoadingMore && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-slate-100 border-t-blue-500 rounded-full animate-spin" />
                                                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">Loading next clips...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Cinema video player modal */}
                            <AnimatePresence>
                                {selectedVid && (
                                    <ImageVideoModal 
                                        item={selectedVid} 
                                        type="video" 
                                        onClose={() => setSelectedVid(null)} 
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* 4. AUDIO & SOUNDSCAPES */}
                    {activeTab === 'audio' && (
                        <motion.div
                            key="audio"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="space-y-8"
                        >
                            {/* Color Header & Vibe indicator */}
                            <div className="bg-linear-to-r from-violet-600 via-fuchsia-600 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
                                    <Volume2 className="w-8 h-8 text-yellow-300 animate-bounce" /> Aadhar Audio Learning Suite
                                </h2>
                                <p className="text-xs md:text-sm text-fuchsia-100 font-semibold mt-1">
                                    Maximize your auditory memory! Mix custom binaural focus wave layers, listen to expert podcasts with highlighted transcripts, or take the spoken oral comprehension exercises.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* Column 1: Ambient Focus Mixer & Study Tracks Music (lg:col-span-4) */}
                                <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-left shadow-xs hover:border-violet-100 transition-all duration-300">
                                    <div>
                                        <span className="text-[0.62rem] font-black uppercase text-violet-600 tracking-widest bg-violet-50 px-2.5 py-0.5 rounded-full">Atmospheres</span>
                                        <h3 className="font-black text-slate-800 text-lg mt-1.5 flex items-center gap-1.5">
                                            <Sparkles className="w-4.5 h-4.5 text-violet-500" /> Focus Ambiences
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-semibold mt-0.5">Blend ambient sounds to cover distracting background chatters.</p>
                                    </div>

                                    {/* Focus soundscape mixer list */}
                                    <div className="space-y-4">
                                        {[
                                            { id: 'rain', label: '🌧️ Rain Showers', desc: 'Blocks high-pitched noises' },
                                            { id: 'birds', label: '🌲 Woodland Birds', desc: 'Alerts mental fatigue' },
                                            { id: 'lofi', label: '🎹 Deep Study Beat', desc: 'Provides rhythmic draft flow' },
                                            { id: 'cafe', label: '☕ Cozy Library Hum', desc: 'Ambient white-chatter murmur' }
                                        ].map((s) => {
                                            const key = s.id as 'rain' | 'birds' | 'lofi' | 'cafe';
                                            const soundNode = focusSounds[key];
                                            return (
                                                <div key={s.id} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-extrabold text-slate-700 text-xs">{s.label}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.desc}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setFocusSounds(prev => {
                                                                    const fresh = { ...prev };
                                                                    fresh[key].playing = !fresh[key].playing;
                                                                    return fresh;
                                                                });
                                                            }}
                                                            className={cn(
                                                                "px-3 py-1.5 rounded-xl text-[0.65rem] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs",
                                                                soundNode.playing 
                                                                    ? "bg-violet-600 text-white hover:bg-violet-750" 
                                                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {soundNode.playing ? 'Active' : 'Mute'}
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-400 w-12 text-right">{soundNode.volume}%</span>
                                                        <input 
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={soundNode.volume}
                                                            onChange={(e) => {
                                                                setFocusSounds(prev => {
                                                                    const fresh = { ...prev };
                                                                    fresh[key].volume = parseInt(e.target.value);
                                                                    return fresh;
                                                                });
                                                            }}
                                                            className="flex-1 accent-violet-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Stop buttons */}
                                    <button
                                        onClick={() => {
                                            setFocusSounds({
                                                rain: { ...focusSounds.rain, playing: false },
                                                birds: { ...focusSounds.birds, playing: false },
                                                lofi: { ...focusSounds.lofi, playing: false },
                                                cafe: { ...focusSounds.cafe, playing: false }
                                            });
                                        }}
                                        className="w-full py-3 bg-linear-to-r from-slate-900 to-slate-800 hover:opacity-90 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-100 transition-all cursor-pointer shadow-md"
                                    >
                                        Silence All Ambience
                                    </button>
                                </div>

                                {/* Column 2: Podcasts study guide reviews (lg:col-span-8) */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-left shadow-xs hover:border-fuchsia-100 transition-all duration-300">
                                        <div>
                                            <span className="text-[0.62rem] font-black uppercase text-fuchsia-600 tracking-widest bg-fuchsia-50 px-2.5 py-0.5 rounded-full">2. Study Coaches Pods</span>
                                            <h3 className="font-black text-slate-800 text-lg mt-1.5 flex items-center gap-1.5">
                                                <Radio className="w-5 h-5 text-fuchsia-500 animate-pulse" /> Active Learning Podcasts
                                            </h3>
                                            <p className="text-slate-400 text-xs font-semibold">Select and play coaching masterclasses from Dr. Sameer or Prof. Anjana.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {PODCASTS.map((pod) => (
                                                <div 
                                                    key={pod.id}
                                                    onClick={() => { 
                                                        setActivePodcast(pod); 
                                                        setIsPlayingPodcast(false); 
                                                        setPodProgress(0); 
                                                        stopSpeakingText();
                                                    }}
                                                    className={cn(
                                                        "p-4 rounded-2.5xl border cursor-pointer transition-all duration-300 space-y-3 relative overflow-hidden",
                                                        activePodcast.id === pod.id 
                                                            ? "bg-fuchsia-50/50 border-fuchsia-250 shadow-md shadow-fuchsia-500/5 scale-[1.01]" 
                                                            : "bg-white hover:border-slate-200 border-slate-100"
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn(
                                                            "text-[0.6rem] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider",
                                                            activePodcast.id === pod.id ? "bg-fuchsia-500 text-white" : "bg-slate-100 text-slate-500"
                                                        )}>
                                                            {pod.speaker}
                                                        </span>
                                                        <span className="text-[0.65rem] font-mono text-slate-400 font-bold">{pod.duration}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-extrabold text-slate-800 text-xs">{pod.title}</h4>
                                                        <p className="text-slate-405 font-bold text-[10px] leading-relaxed mt-1 line-clamp-2">{pod.summary}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Player Panel with speed dial widget */}
                                        <div className="bg-linear-to-b from-slate-50 to-slate-100/40 rounded-2.5xl p-5 border border-slate-100 space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 bg-fuchsia-500 text-white rounded-2xl flex items-center justify-center shadow-md animate-pulse">
                                                        <Volume2 className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-800 text-xs">{activePodcast.title}</h4>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{activePodcast.speaker}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2自 justify-end">
                                                    {/* Speed multipliers */}
                                                    <div className="bg-white border border-slate-200 rounded-xl p-0.5 flex items-center gap-1">
                                                        {[1, 1.25, 1.5, 2].map((sp) => (
                                                            <button 
                                                                key={sp}
                                                                onClick={() => setPodPlaybackSpeed(sp)}
                                                                className={cn(
                                                                    "px-2.5 py-1 text-[9px] font-black uppercase rounded-lg transition-all cursor-pointer",
                                                                    podPlaybackSpeed === sp ? "bg-fuchsia-500 text-white" : "text-slate-450 hover:bg-slate-50"
                                                                )}
                                                            >
                                                                {sp}x
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <button 
                                                        onClick={() => {
                                                            setIsPlayingPodcast(!isPlayingPodcast);
                                                            if (!isPlayingPodcast) {
                                                                const rateFactor = 1500 / podPlaybackSpeed;
                                                                const interval = setInterval(() => {
                                                                    setPodProgress(p => {
                                                                        if (p >= 100) { clearInterval(interval); return 100; }
                                                                        return p + 1;
                                                                    });
                                                                }, rateFactor);
                                                            }
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-md shadow-fuchsia-100"
                                                    >
                                                        {isPlayingPodcast ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Playback Seek Seekbar */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono font-bold text-slate-400">01:05</span>
                                                <div className="flex-1 bg-slate-200 h-1.5 rounded-full relative overflow-hidden">
                                                    <div className="bg-fuchsia-600 h-full rounded-full transition-all duration-300" style={{ width: `${podProgress}%` }} />
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">{activePodcast.duration}</span>
                                            </div>

                                            {/* Scrolling Highlights Transcript */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase text-fuchsia-500 tracking-wider">
                                                    <span>Synchronized text highlights</span>
                                                    <span className="text-slate-400">Click lines to seek</span>
                                                </div>
                                                <div className="h-28 overflow-y-auto space-y-2 pr-1 ml-0.5 scrollbar-thin">
                                                    {activePodcast.transcript.map((line: string, idx: number) => {
                                                        const isActive = idx === Math.floor(podProgress / 20) % activePodcast.transcript.length;
                                                        return (
                                                            <p 
                                                                key={idx}
                                                                onClick={() => setPodProgress(idx * 20)}
                                                                className={cn(
                                                                    "text-[11px] font-semibold leading-relaxed p-2 rounded-xl transition-all cursor-pointer border",
                                                                    isActive 
                                                                        ? "bg-fuchsia-50/50 border-fuchsia-100 text-slate-800 shadow-xs" 
                                                                        : "text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-100/30"
                                                                )}
                                                            >
                                                                {line}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spoken Oral Listening Comprehension Test Segment */}
                                    <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-6 text-left shadow-xs hover:border-pink-100 transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
                                            <div>
                                                <span className="text-[0.62rem] font-black uppercase text-pink-500 tracking-widest bg-pink-50 px-2.5 py-0.5 rounded-full">3. Oral Auditing Drill</span>
                                                <h3 className="font-black text-slate-800 text-lg mt-1.5 flex items-center gap-1.5">
                                                    <Sparkles className="w-4.5 h-4.5 text-pink-500 animate-pulse" /> Oral Comprehension Exercise
                                                </h3>
                                                <p className="text-slate-400 text-xs font-semibold">Test your focus under auditory blind conditions.</p>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1 flex items-center gap-1">
                                                <button 
                                                    onClick={() => setListeningSubTab('lecture')}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all",
                                                        listeningSubTab === 'lecture' ? "bg-white text-slate-800 shadow-xs border border-slate-100" : "text-slate-450 hover:text-slate-600"
                                                    )}
                                                >
                                                    Spoken Text
                                                </button>
                                                <button 
                                                    onClick={() => setListeningSubTab('quiz')}
                                                    className={cn(
                                                        "px-4 py-2 rounded-xl text-xs font-bold uppercase cursor-pointer transition-all",
                                                        listeningSubTab === 'quiz' ? "bg-white text-slate-800 shadow-xs border border-slate-100" : "text-slate-450 hover:text-slate-600"
                                                    )}
                                                >
                                                    Comprehension Quiz
                                                </button>
                                            </div>
                                        </div>

                                        {listeningSubTab === 'lecture' ? (
                                            <div className="space-y-4">
                                                <div className="bg-linear-to-r from-slate-50 to-slate-100/50 p-5 rounded-2.5xl space-y-4 border border-slate-100 relative">
                                                    
                                                    {/* Custom synthesis control strip */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black uppercase text-slate-500">Speaking Synthesizer Offline Engine</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <button 
                                                                onClick={() => setBlindListeningMode(!blindListeningMode)}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer border flex items-center gap-1",
                                                                    blindListeningMode 
                                                                        ? "bg-rose-50 border-rose-250 text-rose-600 shadow-xs" 
                                                                        : "bg-white border-slate-200 text-slate-500"
                                                                )}
                                                            >
                                                                {blindListeningMode ? <XSquare className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                                <span>{blindListeningMode ? 'Open Text' : 'Blind Listen'}</span>
                                                            </button>

                                                            {isSpeaking ? (
                                                                <button 
                                                                    onClick={stopSpeakingText}
                                                                    className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-md"
                                                                >
                                                                    <Square className="w-3.5 h-3.5 fill-white" />
                                                                    <span>Stop</span>
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => speakText(activePodcast.transcript.join(' '))}
                                                                    className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-md"
                                                                >
                                                                    <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                                                                    <span>Read Speech</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Text panel with blind listening blurs */}
                                                    <div className="relative rounded-2xl p-4 bg-white border border-slate-100 min-h-[140px] flex flex-col justify-center">
                                                        <div className={cn(
                                                            "transition-all duration-300 select-text",
                                                            blindListeningMode 
                                                                ? "blur-md pointer-events-none select-none opacity-40 selection:bg-transparent" 
                                                                : "opacity-100"
                                                        )}>
                                                            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide border-b border-slate-50 pb-2 mb-2">Speech script:</h4>
                                                            <p className="text-slate-600 font-medium text-xs leading-relaxed">
                                                                {activePodcast.transcript.join(' ')}
                                                            </p>
                                                        </div>

                                                        {blindListeningMode && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/10 rounded-2xl p-4 text-center z-10 backdrop-blur-xs">
                                                                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-md animate-bounce mb-2">
                                                                    <VolumeX className="w-5 h-5" />
                                                                </div>
                                                                <p className="font-black text-rose-600 text-xs uppercase tracking-widest leading-none">Blind Listening Active!</p>
                                                                <p className="text-slate-550 font-bold text-[10px] mt-1 pr-1.5 max-w-[340px] leading-relaxed">Text masked to challenge your ears. Click "Read Speech" and try answering the quiz using memory alone!</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => setListeningSubTab('quiz')}
                                                    className="w-full py-3.5 bg-linear-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-pink-500/10"
                                                >
                                                    Go to Comprehension Quiz <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            /* Comprehension Quiz tab answers selection */
                                            <div className="space-y-6">
                                                {quizSubmitted ? (
                                                    /* Celebratory quiz score card */
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="bg-emerald-50 border border-emerald-150 rounded-2.5xl p-6 text-center space-y-4 relative overflow-hidden"
                                                    >
                                                        {/* Animated particles */}
                                                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                                                        
                                                        <div className="w-16 h-16 rounded-full bg-linear-to-tr from-yellow-400 to-amber-500 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-500/10 animate-pulse">
                                                            <Award className="w-9 h-9" />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Comprehension Drill Report!</h4>
                                                            <p className="text-xs font-bold text-slate-450 uppercase tracking-widest">Auditory Reception Index Score</p>
                                                        </div>

                                                        {/* Score visualization circular pill */}
                                                        <div className="inline-flex bg-white px-6 py-2.5 rounded-full border border-emerald-250 shadow-xs font-mono">
                                                            <span className="text-lg font-black text-emerald-600">{quizScore}</span>
                                                            <span className="text-slate-400 mx-1 font-semibold">/</span>
                                                            <span className="text-lg font-black text-slate-550">{LISTENING_QUIZ_QUESTIONS.length} Correct</span>
                                                        </div>

                                                        <p className="text-slate-600 font-medium text-xs leading-relaxed max-w-md mx-auto">
                                                            {quizScore === LISTENING_QUIZ_QUESTIONS.length 
                                                                ? "Flawless score! Your subconscious auditive map registers coordinates and landmarks with masterclass levels." 
                                                                : "Excellent effort. Focus on practicing blind spatial mappings to heighten structural memory indices."}
                                                        </p>

                                                        {/* Question evaluations list */}
                                                        <div className="space-y-3 pt-4 border-t border-emerald-150 text-left">
                                                            {LISTENING_QUIZ_QUESTIONS.map((q) => {
                                                                const userSel = quizAnswers[q.id];
                                                                const isCorrect = userSel === q.correct;
                                                                return (
                                                                    <div key={q.id} className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-1">
                                                                        <div className="flex items-start gap-2">
                                                                            <span className={cn(
                                                                                "w-4 h-4 rounded-full flex items-center justify-center mt-0.5 shrink-0 text-[10px] font-bold text-white",
                                                                                isCorrect ? "bg-emerald-500" : "bg-red-400"
                                                                            )}>
                                                                                {isCorrect ? '✓' : '✗'}
                                                                            </span>
                                                                            <p className="text-slate-850 font-bold text-xs leading-normal">{q.question}</p>
                                                                        </div>
                                                                        <p className="text-[10px] font-black text-slate-400 ml-6 uppercase">Your Select: {q.options[userSel] || "Unanswered"}</p>
                                                                        <p className="text-[10px] font-bold text-slate-500 ml-6 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1.5">{q.explanation}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>

                                                        <div className="flex gap-2 justify-center pt-2">
                                                            <button 
                                                                onClick={() => {
                                                                    setQuizAnswers({});
                                                                    setQuizSubmitted(false);
                                                                    setQuizScore(0);
                                                                }}
                                                                className="px-6 py-3 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-800 active:scale-95 transition-all"
                                                            >
                                                                Retake Drill
                                                            </button>
                                                            <button 
                                                                onClick={() => setListeningSubTab('lecture')}
                                                                className="px-6 py-3 bg-white border border-slate-205 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer active:scale-95 transition-all"
                                                            >
                                                                Read Transcript
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    /* Active comprehension questionnaire */
                                                    <div className="space-y-5">
                                                        {LISTENING_QUIZ_QUESTIONS.map((q, qIdx) => (
                                                            <div key={q.id} className="space-y-2.5">
                                                                <h4 className="font-extrabold text-slate-800 text-xs flex gap-1.5 leading-relaxed">
                                                                    <span className="text-pink-500 font-black">Q{qIdx+1}.</span> {q.question}
                                                                </h4>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {q.options.map((opt, oIdx) => {
                                                                        const isSel = quizAnswers[q.id] === oIdx;
                                                                        return (
                                                                            <button
                                                                                key={oIdx}
                                                                                onClick={() => {
                                                                                    setQuizAnswers(prev => ({ ...prev, [q.id]: oIdx }));
                                                                                }}
                                                                                className={cn(
                                                                                    "p-3 rounded-xl text-left text-[11px] font-bold leading-normal transition-all border",
                                                                                    isSel 
                                                                                        ? "bg-pink-50 border-pink-500 text-pink-700 shadow-xs" 
                                                                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-250 hover:bg-slate-50/50"
                                                                                )}
                                                                            >
                                                                                {opt}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <button 
                                                            onClick={() => {
                                                                let calculatedScore = 0;
                                                                LISTENING_QUIZ_QUESTIONS.forEach(q => {
                                                                    if (quizAnswers[q.id] === q.correct) {
                                                                        calculatedScore += 1;
                                                                    }
                                                                });
                                                                setQuizScore(calculatedScore);
                                                                setQuizSubmitted(true);
                                                            }}
                                                            className="w-full py-4 bg-linear-to-r from-pink-500 via-rose-500 to-orange-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-98 shadow-md shadow-pink-500/10 cursor-pointer"
                                                        >
                                                            Submit Audit Comprehension Answers <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 5. INTERACTIVE DIAGRAMS */}
                    {activeTab === 'diagrams' && (
                        <motion.div
                            key="diagrams"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
                        >
                            {/* Simulator category selector */}
                            <div className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 space-y-4 text-left">
                                <h3 className="font-extrabold text-slate-800 text-sm">Interactive Studies Lab</h3>
                                <p className="text-slate-400 text-[0.62rem] font-semibold leading-normal">
                                    Click hot components or sliders to visually experiment step-by-step.
                                </p>

                                <div className="space-y-2">
                                    {[
                                        { id: 'water', label: '💧 The Water Cycle', desc: 'Precipitation & Collection' },
                                        { id: 'photosynthesis', label: '🌿 Photosynthesis process', desc: 'Stomata gas outputs' },
                                        { id: 'geometry', label: '📈 Linear formula Graph', desc: 'y = mx + c Coordinate equation representation' }
                                    ].map((d) => (
                                        <button
                                            key={d.id}
                                            onClick={() => { setDiagramType(d.id as any); setActiveHotspot(null); }}
                                            className={cn(
                                                "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer block",
                                                diagramType === d.id 
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                                                    : "bg-white border-slate-100 hover:border-slate-200 text-slate-700"
                                            )}
                                        >
                                            <p className="font-extrabold text-xs">{d.label}</p>
                                            <p className="text-[0.6rem] font-bold text-slate-400 mt-1 uppercase">{d.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {/* Active hotspot metadata card */}
                                <div className="bg-slate-50 p-4 rounded-2.5xl border border-slate-100 space-y-2 text-left">
                                    <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>{hotspotDetails.title}</span>
                                    </h4>
                                    <p className="text-slate-550 font-semibold text-[0.68rem] leading-relaxed select-text">{hotspotDetails.text}</p>
                                </div>
                            </div>

                            {/* Vector Canvas Simulator Panel */}
                            <div className="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-5 md:p-8 flex items-center justify-center min-h-[360px] relative">
                                {diagramType === 'water' && (
                                    <div className="w-full max-w-md space-y-4 text-left">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[0.62rem] font-black text-[#10B981] uppercase tracking-widest">Water Cycle Interactive Diagram</h4>
                                            <span className="text-[0.55rem] font-black bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded-md uppercase">Vapor particles</span>
                                        </div>
                                        <svg viewBox="0 0 400 280" className="w-full h-auto bg-slate-50 border border-slate-100 rounded-2.5xl overflow-hidden shadow-inner">
                                            <circle cx="50" cy="50" r="24" fill="#F59E0B" className="animate-pulse" />
                                            <circle cx="50" cy="50" r="18" fill="#FBBF24" />

                                            {/* Mountains highlands */}
                                            <polygon points="260,180 320,80 390,180" fill="#94A3B8" />
                                            <polygon points="320,180 360,120 400,180" fill="#64748B" />
                                            <polygon points="302,110 320,80 338,110" fill="#F8FAFC" />

                                            {/* River Sea level reservoir */}
                                            <ellipse cx="140" cy="220" rx="90" ry="24" fill="#3B82F6" />
                                            <path d="M 320,140 Q 240,160 200,210" stroke="#60A5FA" strokeWidth="6" fill="none" />

                                            {/* Vapor cloud */}
                                            <path d="M 180,80 Q 200,60 220,80 Q 240,60 260,80 Q 280,85 270,105 L 170,105 Z" fill="#E2E8F0" />

                                            {/* Rain droplets */}
                                            <line x1="210" y1="115" x2="210" y2="135" stroke="#93C5FD" strokeWidth="2.5" strokeDasharray="4 2" />
                                            <line x1="235" y1="115" x2="235" y2="135" stroke="#93C5FD" strokeWidth="2.5" strokeDasharray="4 2" />

                                            {/* Water Vapor arrows */}
                                            <path d="M 80,180 C 85,140 110,130 115,90" stroke="#FBBF24" strokeWidth="3" strokeDasharray="3 3" fill="none" />

                                            {/* Hotspot triggers overlay */}
                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('evaporation')}>
                                                <circle cx="95" cy="150" r="12" fill={activeHotspot === 'evaporation' ? '#EF4444' : '#10B981'} fillOpacity="0.85" />
                                                <text x="95" y="153" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">1</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('condensation')}>
                                                <circle cx="220" cy="80" r="12" fill={activeHotspot === 'condensation' ? '#EF4444' : '#10B981'} fillOpacity="0.85" />
                                                <text x="220" y="83" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">2</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('precipitation')}>
                                                <circle cx="250" cy="130" r="12" fill={activeHotspot === 'precipitation' ? '#EF4444' : '#10B981'} fillOpacity="0.85" />
                                                <text x="250" y="133" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">3</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('infiltration')}>
                                                <circle cx="330" cy="210" r="12" fill={activeHotspot === 'infiltration' ? '#EF4444' : '#10B981'} fillOpacity="0.85" />
                                                <text x="330" y="213" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">4</text>
                                            </g>
                                        </svg>
                                    </div>
                                )}

                                {diagramType === 'photosynthesis' && (
                                    <div className="w-full max-w-md space-y-4 text-left">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[0.62rem] font-black text-[#10B981] uppercase tracking-widest">Photosynthesis Cycle Interactive Leaflet</h4>
                                            <span className="text-[0.55rem] font-black bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded-md uppercase">Leaf Chloroplasts</span>
                                        </div>
                                        <svg viewBox="0 0 400 280" className="w-full h-auto bg-slate-50 border border-slate-100 rounded-2.5xl overflow-hidden shadow-inner">
                                            <path d="M 40,140 C 120,40 280,40 360,140 C 280,240 120,240 40,140 Z" fill="#10B981" />
                                            <path d="M 40,140 L 360,140" stroke="#047857" strokeWidth="4" />
                                            <path d="M 120,140 Q 150,110 180,90" stroke="#059669" strokeWidth="2.5" />
                                            <path d="M 200,140 Q 230,110 260,95" stroke="#059669" strokeWidth="2.5" />
                                            <path d="M 120,140 Q 150,170 180,190" stroke="#059669" strokeWidth="2.5" />
                                            <path d="M 200,140 Q 230,170 260,185" stroke="#059669" strokeWidth="2.5" />

                                            <path d="M 100,20 L 160,80" stroke="#F59E0B" strokeWidth="3" />
                                            <text x="75" y="30" fill="#F59E0B" fontSize="9" fontWeight="bold">Sunlight</text>

                                            <path d="M 80,250 Q 140,210 160,170" stroke="#3B82F6" strokeWidth="3" />
                                            <text x="45" y="255" fill="#3B82F6" fontSize="9" fontWeight="bold">CO2 Intake</text>

                                            <path d="M 240,110 Q 280,70 330,50" stroke="#EF4444" strokeWidth="3" />
                                            <text x="325" y="40" fill="#EF4444" fontSize="9" fontWeight="bold">Oxygen Out</text>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('sun')}>
                                                <circle cx="150" cy="90" r="12" fill={activeHotspot === 'sun' ? '#F59E0B' : '#047857'} fillOpacity="0.9" />
                                                <text x="150" y="93" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">S</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('co2')}>
                                                <circle cx="160" cy="180" r="12" fill={activeHotspot === 'co2' ? '#3B82F6' : '#047857'} fillOpacity="0.9" />
                                                <text x="160" y="183" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">C</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('o2')}>
                                                <circle cx="260" cy="100" r="12" fill={activeHotspot === 'o2' ? '#EF4444' : '#047857'} fillOpacity="0.9" />
                                                <text x="260" y="103" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">O</text>
                                            </g>

                                            <g className="cursor-pointer" onClick={() => setActiveHotspot('glucose')}>
                                                <circle cx="310" cy="140" r="12" fill={activeHotspot === 'glucose' ? '#8B5CF6' : '#047857'} fillOpacity="0.9" />
                                                <text x="310" y="143" fill="white" fontSize="9" fontWeight="black" textAnchor="middle">G</text>
                                            </g>
                                        </svg>
                                    </div>
                                )}

                                {diagramType === 'geometry' && (
                                    <div className="w-full max-w-md space-y-4 text-left">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[0.62rem] font-black text-[#6366F1] uppercase tracking-widest">Coordinated Linear Graph Solver</h4>
                                            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">y = {geoM.toFixed(1)}x + {geoC.toFixed(1)}</span>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[0.68rem] font-bold text-slate-550">
                                                    <span>Adjust Slope (slope m):</span>
                                                    <span className="text-violet-600 font-extrabold">{geoM}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[-2, -1, -0.5, 0, 0.5, 1, 2].map((v) => (
                                                        <button 
                                                            key={v} 
                                                            onClick={() => setGeoM(v)} 
                                                            className={cn("flex-1 py-1 rounded text-[0.6rem] font-mono font-bold tracking-tight border cursor-pointer", geoM === v ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 hover:bg-slate-100")}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[0.68rem] font-bold text-slate-550">
                                                    <span>Adjust Intercept (intercept c):</span>
                                                    <span className="text-violet-600 font-extrabold">{geoC}</span>
                                                </div>
                                                <div className="flex gap-2 font-semibold">
                                                    {[-4, -2, 0, 2, 4].map((v) => (
                                                        <button 
                                                            key={v} 
                                                            onClick={() => setGeoC(v)} 
                                                            className={cn("flex-1 py-1 rounded text-[0.6rem] font-mono font-bold tracking-tight border cursor-pointer", geoC === v ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 hover:bg-slate-100")}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <svg viewBox="0 0 300 300" className="w-full h-auto bg-slate-950 border border-slate-800 rounded-2.5xl overflow-hidden shadow-inner">
                                            {Array.from({ length: 15 }).map((_, idx) => {
                                                const pos = idx * 20;
                                                return (
                                                    <g key={idx}>
                                                        <line x1={pos} y1="0" x2={pos} y2="300" stroke="#1E293B" strokeWidth="0.5" />
                                                        <line x1="0" y1={pos} x2="300" y2={pos} stroke="#1E293B" strokeWidth="0.5" />
                                                    </g>
                                                );
                                            })}

                                            <line x1="150" y1="0" x2="150" y2="300" stroke="#475569" strokeWidth="1.5" />
                                            <line x1="0" y1="150" x2="300" y2="150" stroke="#475569" strokeWidth="1.5" />

                                            <polygon points="150,0 146,10 154,10" fill="#475569" />
                                            <polygon points="300,150 290,146 290,154" fill="#475569" />

                                            <text x="288" y="142" fill="#64748B" fontSize="9" fontWeight="black">X</text>
                                            <text x="156" y="10" fill="#64748B" fontSize="9" fontWeight="black">Y</text>

                                            {(() => {
                                                const x1 = -8;
                                                const y1 = geoM * x1 + geoC;
                                                const x2 = 8;
                                                const y2 = geoM * x2 + geoC;

                                                const svgX1 = 150 + x1 * 20;
                                                const svgY1 = 150 - y1 * 20;
                                                const svgX2 = 150 + x2 * 20;
                                                const svgY2 = 150 - y2 * 20;

                                                const yInterceptY = 150 - geoC * 20;
                                                const xInterceptX = geoM !== 0 ? 150 + (-geoC / geoM) * 20 : -999;

                                                return (
                                                    <g>
                                                        <line 
                                                            x1={svgX1} 
                                                            y1={svgY1} 
                                                            x2={svgX2} 
                                                            y2={svgY2} 
                                                            stroke="#EC4899" 
                                                            strokeWidth="3.5" 
                                                            strokeLinecap="round" 
                                                        />
                                                        <circle cx="150" cy={yInterceptY} r="5" fill="#EF4444" className="animate-ping" />
                                                        <circle cx="150" cy={yInterceptY} r="5" fill="#EF4444" />
                                                        
                                                        {xInterceptX !== -999 && (
                                                            <circle cx={xInterceptX} cy="150" r="5" fill="#3B82F6" />
                                                        )}
                                                    </g>
                                                );
                                            })()}
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* 6. MIND-MAP STUDY CANVAS */}
                    {activeTab === 'mindmap' && (
                        <motion.div
                            key="mindmap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start animate-fade-in"
                        >
                            <div className="md:col-span-4 bg-white border border-slate-100 rounded-3xl p-5 space-y-4 text-left">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-slate-800 text-sm">Interactive Study Canvas</h3>
                                    <p className="text-slate-400 text-[0.62rem] font-semibold leading-normal">
                                        Map, connect & dragging nodes smoothly. Builds spatial study revision trees easily.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                                    <button 
                                        onClick={addNewNode}
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold text-[0.68rem] uppercase tracking-wide flex items-center gap-1 hover:bg-indigo-700 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Add Concept</span>
                                    </button>
                                    <button 
                                        onClick={clearMindMap}
                                        className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold text-[0.68rem] uppercase tracking-wide hover:bg-slate-100 cursor-pointer"
                                    >
                                        Reset Canvas
                                    </button>
                                </div>

                                {selectedNode ? (
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Edit Selected Item</span>
                                            <button onClick={deleteSelectedNode} className="p-1 text-rose-500 hover:bg-rose-105 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[0.65rem] font-black text-slate-500 uppercase">Text / Topic Label:</label>
                                            <input 
                                                type="text"
                                                value={nodeText}
                                                onChange={(e) => {
                                                    setNodeText(e.target.value);
                                                    handleNodeUpdate({ text: e.target.value });
                                                }}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs outline-none focus:border-indigo-500 font-bold"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[0.65rem] font-black text-slate-500 uppercase">Accent Theme Color:</label>
                                            <div className="flex gap-2">
                                                {['indigo', 'emerald', 'rose', 'amber'].map((col) => {
                                                    let bgHex = "bg-indigo-600";
                                                    if (col === 'emerald') bgHex = "bg-emerald-500";
                                                    if (col === 'rose') bgHex = "bg-rose-500";
                                                    if (col === 'amber') bgHex = "bg-amber-500";
                                                    return (
                                                        <button 
                                                            key={col} 
                                                            onClick={() => { setNodeColor(col); handleNodeUpdate({ color: col }); }}
                                                            className={cn(
                                                                "w-7 h-7 rounded-full transition-all border-2 cursor-pointer",
                                                                bgHex,
                                                                nodeColor === col ? "border-slate-800 scale-110" : "border-transparent"
                                                            )}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-1 pt-1 border-t border-slate-150">
                                            <label className="text-[0.65rem] font-black text-slate-500 uppercase">Interactive shape:</label>
                                            <div className="flex gap-2 mt-1">
                                                {['rect', 'circle', 'diamond'].map((shp) => (
                                                    <button 
                                                        key={shp} 
                                                        onClick={() => { setNodeShape(shp as any); handleNodeUpdate({ shape: shp }); }}
                                                        className={cn(
                                                            "flex-1 py-1 px-2 border rounded-lg text-[0.62rem] font-bold text-center uppercase cursor-pointer",
                                                            nodeShape === shp ? "bg-slate-900 border-slate-900 text-white" : "bg-white text-slate-650 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        {shp}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {connectingFromId === selectedNode ? (
                                                <div className="text-[0.62rem] font-bold text-orange-600 bg-orange-50 p-2 rounded-lg text-center animate-pulse">
                                                    Click another node on canvas to link them!
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={startNodeConnection}
                                                    className="w-full py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    <Link2Id className="w-3.5 h-3.5" />
                                                    <span>Connect To Topic...</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 p-6 rounded-2.5xl border border-slate-100 text-center text-slate-400 font-semibold text-xs py-10">
                                        Click any mapped node circle/box on the board grid to open inspector tools. Drag nodes smoothly to align coordinates.
                                    </div>
                                )}
                            </div>

                            {/* Main Canvas SVG workspace area */}
                            <div className="md:col-span-8 bg-white border border-slate-105 rounded-3xl p-4 overflow-hidden relative shadow-inner">
                                <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-slate-100 text-[0.62rem] font-bold text-slate-400 uppercase select-none pointer-events-none">
                                    Drag nodes to organize • Connect concepts
                                </div>

                                <svg 
                                    ref={canvasRef}
                                    width="100%"
                                    height="380"
                                    onMouseDown={handleCanvasMouseDown}
                                    onMouseMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUpOrLeave}
                                    onMouseLeave={handleCanvasMouseUpOrLeave}
                                    className="bg-slate-50 rounded-2.5xl cursor-default overflow-hidden border border-slate-100"
                                >
                                    {edges.map((edge, index) => {
                                        const fromNode = nodes.find(n => n.id === edge.from);
                                        const toNode = nodes.find(n => n.id === edge.to);
                                        if (!fromNode || !toNode) return null;
                                        return (
                                            <line 
                                                key={index}
                                                x1={fromNode.x}
                                                y1={fromNode.y}
                                                x2={toNode.x}
                                                y2={toNode.y}
                                                stroke="#CBD5E1"
                                                strokeWidth="3.5"
                                                strokeLinecap="round"
                                            />
                                        );
                                    })}

                                    {nodes.map((node) => {
                                        const isSel = selectedNode === node.id;
                                        const isParentConnect = connectingFromId === node.id;
                                        let fillColor = '#6366F1';
                                        if (node.color === 'emerald') fillColor = '#10B981';
                                        if (node.color === 'rose') fillColor = '#F43F5E';
                                        if (node.color === 'amber') fillColor = '#F59E0B';

                                        return (
                                            <g 
                                                key={node.id}
                                                transform={`translate(${node.x}, ${node.y})`}
                                                className="cursor-pointer group"
                                                onClick={() => {
                                                    if (connectingFromId && connectingFromId !== node.id) {
                                                        completeNodeConnection(node.id);
                                                    }
                                                }}
                                            >
                                                {node.shape === 'circle' ? (
                                                    <circle 
                                                        r="34"
                                                        fill={fillColor}
                                                        stroke={isSel ? '#000000' : isParentConnect ? '#FF9900' : 'transparent'}
                                                        strokeWidth={isSel || isParentConnect ? "3" : "0"}
                                                        data-node-id={node.id}
                                                    />
                                                ) : node.shape === 'diamond' ? (
                                                    <polygon
                                                        points="-40,0 0,-40 40,0 0,40"
                                                        fill={fillColor}
                                                        stroke={isSel ? '#000000' : isParentConnect ? '#FF9900' : 'transparent'}
                                                        strokeWidth={isSel || isParentConnect ? "3" : "0"}
                                                        data-node-id={node.id}
                                                    />
                                                ) : (
                                                    <rect 
                                                        x="-50"
                                                        y="-20"
                                                        width="100"
                                                        height="40"
                                                        rx="12"
                                                        fill={fillColor}
                                                        stroke={isSel ? '#000000' : isParentConnect ? '#FF9900' : 'transparent'}
                                                        strokeWidth={isSel || isParentConnect ? "3" : "0"}
                                                        data-node-id={node.id}
                                                    />
                                                )}

                                                <text 
                                                    x="0"
                                                    y="4"
                                                    fill="white"
                                                    fontSize="9"
                                                    fontWeight="bold"
                                                    textAnchor="middle"
                                                    pointerEvents="none"
                                                    className="select-none font-sans"
                                                >
                                                    {node.text.length > 15 ? `${node.text.substring(0, 13)}...` : node.text}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
