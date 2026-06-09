import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Eye, 
    EyeOff, 
    ZoomIn, 
    ZoomOut, 
    RefreshCw, 
    Activity, 
    Info, 
    Check, 
    Sliders,
    Sparkles
} from 'lucide-react';

interface Equation {
    id: string;
    type: 'linear' | 'quadratic' | 'cubic' | 'sine' | 'cosine' | 'exponential' | 'logarithmic';
    visible: boolean;
    color: string;
    // coefficients: y = a_3*x^3 + a_2*x^2 + a_1*x + a_0 etc. or other meanings
    a: number; // e.g. m for linear, a for quadratic, amplitude for sine
    b: number; // e.g. c for linear, b for quadratic, frequency for sine, base for exp
    c: number; // e.g. c for quadratic, phase shift for sine, scale for exp
    d: number; // e.g. d for cubic, vertical translation
    sign?: '=' | '<=' | '>='; // inequality signs!
}

const PRESETS = [
    {
        name: 'Linear Programming System',
        eqs: [
            { id: '1', type: 'linear', visible: true, color: '#06b6d4', a: 3, b: 0, c: 0, d: 0, sign: '<=' },
            { id: '2', type: 'linear', visible: true, color: '#10b981', a: 1, b: -2, c: 0, d: 0, sign: '>=' },
            { id: '3', type: 'linear', visible: true, color: '#ec4899', a: -0.5, b: 7, c: 0, d: 0, sign: '<=' }
        ] as Equation[]
    },
    {
        name: 'Standard Parabola',
        eqs: [
            { id: '1', type: 'quadratic', visible: true, color: '#ec4899', a: 1, b: 0, c: 0, d: 0, sign: '=' }
        ] as Equation[]
    },
    {
        name: 'Harmonic Waves',
        eqs: [
            { id: '1', type: 'sine', visible: true, color: '#3b82f6', a: 2, b: 1, c: 0, d: 0, sign: '=' },
            { id: '2', type: 'cosine', visible: true, color: '#10b981', a: 1.5, b: 2, c: 0, d: 1, sign: '=' }
        ] as Equation[]
    },
    {
        name: 'Polynomial Intersection',
        eqs: [
            { id: '1', type: 'cubic', visible: true, color: '#8b5cf6', a: 0.5, b: 0, c: -3, d: 0, sign: '=' },
            { id: '2', type: 'linear', visible: true, color: '#f59e0b', a: 1.5, b: -2, c: 0, d: 0, sign: '=' }
        ] as Equation[]
    }
];

const COLORS = [
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // emerald
    '#8b5cf6', // violet
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
];

export const GraphsPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Grid boundary states
    const [minX, setMinX] = useState(-10);
    const [maxX, setMaxX] = useState(10);
    const [minY, setMinY] = useState(-10);
    const [maxY, setMaxY] = useState(10);

    // Dimension states
    const [dimensions, setDimensions] = useState({ width: 600, height: 500 });

    // Equations state array
    const [equations, setEquations] = useState<Equation[]>([]);

    // Active equation index to show sliders for in details panel
    const [selectedEqId, setSelectedEqId] = useState<string>('');

    // Coordinate tracker on hover
    const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);
    const [snappedCoords, setSnappedCoords] = useState<{ [eqId: string]: { x: number; y: number } }>({});

    // Observe size for fluid responsive canvas
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width } = entry.contentRect;
                // Height can adapt or be bounded
                const height = Math.max(350, Math.min(500, window.innerHeight * 0.5));
                setDimensions({ width, height });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Helper functions for plotting
    const evaluateEq = (eq: Equation, x: number): number => {
        switch (eq.type) {
            case 'linear':
                // y = a*x + b
                return eq.a * x + eq.b;
            case 'quadratic':
                // y = a*x^2 + b*x + c
                return eq.a * (x * x) + eq.b * x + eq.c;
            case 'cubic':
                // y = a*x^3 + b*x^2 + c*x + d
                return eq.a * (x * x * x) + eq.b * (x * x) + eq.c * x + eq.d;
            case 'sine':
                // y = a * sin(b*x + c) + d
                return eq.a * Math.sin(eq.b * x + eq.c) + eq.d;
            case 'cosine':
                // y = a * cos(b*x + c) + d
                return eq.a * Math.cos(eq.b * x + eq.c) + eq.d;
            case 'exponential':
                // y = a * e^(b*x) + c
                // Limit range to prevent Infinity rendering
                const power = Math.max(-10, Math.min(10, eq.b * x));
                return eq.a * Math.exp(power) + eq.c;
            case 'logarithmic':
                // y = a * ln(b*x) + c
                if (eq.b * x <= 0) return NaN;
                return eq.a * Math.log(eq.b * x) + eq.c;
            default:
                return 0;
        }
    };

    // Scale mapping coordinate helpers
    const toSvgX = (x: number) => {
        return ((x - minX) / (maxX - minX)) * dimensions.width;
    };

    const toSvgY = (y: number) => {
        return dimensions.height - (((y - minY) / (maxY - minY)) * dimensions.height);
    };

    const toCartesianX = (svgX: number) => {
        return minX + (svgX / dimensions.width) * (maxX - minX);
    };

    const toCartesianY = (svgY: number) => {
        return minY + ((dimensions.height - svgY) / dimensions.height) * (maxY - minY);
    };

    // Calculate paths for active visible equations
    const getSvgPathForEquation = (eq: Equation) => {
        const steps = 300;
        let path = '';
        let isFirst = true;

        for (let i = 0; i <= steps; i++) {
            const svgX = (i / steps) * dimensions.width;
            const x = toCartesianX(svgX);
            const y = evaluateEq(eq, x);

            if (isNaN(y) || !isFinite(y)) {
                isFirst = true; 
                continue;
            }

            const svgY = toSvgY(y);

            // Avoid crazy line drawings when outside rendering bounds
            if (svgY < -500 || svgY > dimensions.height + 500) {
                isFirst = true;
                continue;
            }

            if (isFirst) {
                path += `M ${svgX} ${svgY}`;
                isFirst = false;
            } else {
                path += ` L ${svgX} ${svgY}`;
            }
        }
        return path;
    };

    const getFeasibleRegionPath = () => {
        const inequalities = equations.filter(eq => eq.visible && eq.sign && eq.sign !== '=');
        if (inequalities.length === 0) return '';

        const steps = 300;
        const pointsUpper: {x: number, y: number}[] = [];
        const pointsLower: {x: number, y: number}[] = [];

        for (let i = 0; i <= steps; i++) {
            const svgX = (i / steps) * dimensions.width;
            const x = toCartesianX(svgX);

            let lowerLimit = minY;
            let upperLimit = maxY;

            for (const eq of inequalities) {
                const y = evaluateEq(eq, x);
                if (isNaN(y) || !isFinite(y)) continue;

                if (eq.sign === '<=') {
                    upperLimit = Math.min(upperLimit, y);
                } else if (eq.sign === '>=') {
                    lowerLimit = Math.max(lowerLimit, y);
                }
            }

            if (lowerLimit <= upperLimit) {
                pointsUpper.push({ x: svgX, y: toSvgY(upperLimit) });
                pointsLower.push({ x: svgX, y: toSvgY(lowerLimit) });
            }
        }

        if (pointsUpper.length === 0) return '';

        let pathStr = `M ${pointsUpper[0].x} ${pointsUpper[0].y}`;
        for (let i = 1; i < pointsUpper.length; i++) {
            pathStr += ` L ${pointsUpper[i].x} ${pointsUpper[i].y}`;
        }
        for (let i = pointsLower.length - 1; i >= 0; i--) {
            pathStr += ` L ${pointsLower[i].x} ${pointsLower[i].y}`;
        }
        pathStr += ' Z';
        return pathStr;
    };

    // Zoom and pan triggers
    const handleZoom = (factor: number) => {
        const rx = (maxX - minX) * factor;
        const ry = (maxY - minY) * factor;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        setMinX(centerX - rx / 2);
        setMaxX(centerX + rx / 2);
        setMinY(centerY - ry / 2);
        setMaxY(centerY + ry / 2);
    };

    const handleReset = () => {
        setMinX(-10);
        setMaxX(10);
        setMinY(-10);
        setMaxY(10);
    };

    // Mouse interactive tracker move handler
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = e.clientX - rect.left;
        const svgY = e.clientY - rect.top;

        const cartX = toCartesianX(svgX);
        const cartY = toCartesianY(svgY);

        setMouseCoord({ x: cartX, y: cartY });

        // Calculate actual y position snap coordinates for all visible equations
        const snaps: { [eqId: string]: { x: number; y: number } } = {};
        equations.forEach(eq => {
            if (eq.visible) {
                const eqY = evaluateEq(eq, cartX);
                if (!isNaN(eqY) && isFinite(eqY)) {
                    snaps[eq.id] = { x: cartX, y: eqY };
                }
            }
        });
        setSnappedCoords(snaps);
    };

    const handleMouseLeave = () => {
        setMouseCoord(null);
        setSnappedCoords({});
    };

    // Add and customize functions helpers
    const addEquation = () => {
        if (equations.length >= 6) return;
        const nextCol = COLORS[equations.length % COLORS.length];
        const newId = (Date.now() + Math.random()).toString();
        const newEq: Equation = {
            id: newId,
            type: 'linear',
            visible: true,
            color: nextCol,
            a: 1,
            b: 0,
            c: 0,
            d: 0,
            sign: '='
        };
        setEquations([...equations, newEq]);
        setSelectedEqId(newId);
    };

    const deleteEquation = (id: string) => {
        const filtered = equations.filter(eq => eq.id !== id);
        setEquations(filtered);
        if (selectedEqId === id) {
            setSelectedEqId(filtered.length > 0 ? filtered[0].id : '');
        }
    };

    const updateEqType = (id: string, type: Equation['type']) => {
        setEquations(equations.map(eq => {
            if (eq.id === id) {
                // Initialize clean default coefficients according to type
                let defaultsValue = { a: 1, b: 0, c: 0, d: 0 };
                if (type === 'linear') defaultsValue = { a: 1, b: 2, c: 0, d: 0 };
                if (type === 'quadratic') defaultsValue = { a: 0.5, b: 0, c: -2, d: 0 };
                if (type === 'sine' || type === 'cosine') defaultsValue = { a: 2, b: 1, c: 0, d: 0 };
                if (type === 'exponential') defaultsValue = { a: 1, b: 0.5, c: 0, d: 0 };
                if (type === 'logarithmic') defaultsValue = { a: 2, b: 1, c: 0, d: 0 };
                return { ...eq, type, ...defaultsValue };
            }
            return eq;
        }));
    };

    const updateEqSign = (id: string, sign: '=' | '<=' | '>=') => {
        setEquations(equations.map(eq => {
            if (eq.id === id) {
                return { ...eq, sign };
            }
            return eq;
        }));
    };

    const updateCoef = (id: string, key: 'a' | 'b' | 'c' | 'd', val: number) => {
        setEquations(equations.map(eq => {
            if (eq.id === id) {
                return { ...eq, [key]: Number(val.toFixed(2)) };
            }
            return eq;
        }));
    };

    const toggleVisible = (id: string) => {
        setEquations(equations.map(eq => {
            if (eq.id === id) {
                return { ...eq, visible: !eq.visible };
            }
            return eq;
        }));
    };

    const applyPreset = (presetEqs: Equation[]) => {
        const withUniqueIds = presetEqs.map((e, index) => ({
            ...e,
            id: (index + 1).toString()
        }));
        setEquations(withUniqueIds);
        setSelectedEqId('1');
        handleReset();
    };

    // Math text formatter for visual layout display
    const renderEqFormula = (eq: Equation) => {
        const signSymbol = eq.sign || '=';

        const formatNum = (n: number) => {
            if (n === 0) return '0';
            return n > 0 ? `+${n}` : `${n}`;
        };

        const formatFirstNum = (n: number, sub: string = '') => {
            if (n === 1) return sub;
            if (n === -1) return `-${sub}`;
            return `${n}${sub}`;
        };

        switch (eq.type) {
            case 'linear':
                const bStr = eq.b !== 0 ? ` ${formatNum(eq.b)}` : '';
                return `y ${signSymbol} ${formatFirstNum(eq.a, 'x')}${bStr}` || `y ${signSymbol} 0`;
            case 'quadratic':
                const qbStr = eq.b !== 0 ? ` ${formatNum(eq.b)}x` : '';
                const qcStr = eq.c !== 0 ? ` ${formatNum(eq.c)}` : '';
                return `y ${signSymbol} ${formatFirstNum(eq.a, 'x²')}${qbStr}${qcStr}`;
            case 'cubic':
                const caStr = formatFirstNum(eq.a, 'x³');
                const cbStr = eq.b !== 0 ? ` ${formatNum(eq.b)}x²` : '';
                const ccStr = eq.c !== 0 ? ` ${formatNum(eq.c)}x` : '';
                const cdStr = eq.d !== 0 ? ` ${formatNum(eq.d)}` : '';
                return `y ${signSymbol} ${caStr}${cbStr}${ccStr}${cdStr}`;
            case 'sine':
                const sShift = eq.c !== 0 ? ` ${formatNum(eq.c)}` : '';
                const sVert = eq.d !== 0 ? ` ${formatNum(eq.d)}` : '';
                return `y ${signSymbol} ${eq.a} sin(${eq.b}x${sShift})${sVert}`;
            case 'cosine':
                const cShift = eq.c !== 0 ? ` ${formatNum(eq.c)}` : '';
                const cVert = eq.d !== 0 ? ` ${formatNum(eq.d)}` : '';
                return `y ${signSymbol} ${eq.a} cos(${eq.b}x${cShift})${cVert}`;
            case 'exponential':
                const eVert = eq.c !== 0 ? ` ${formatNum(eq.c)}` : '';
                return `y ${signSymbol} ${eq.a} e^(${eq.b}x)${eVert}`;
            case 'logarithmic':
                const lVert = eq.c !== 0 ? ` ${formatNum(eq.c)}` : '';
                return `y ${signSymbol} ${eq.a} ln(${eq.b}x)${lVert}`;
            default:
                return 'y = 0';
        }
    };

    // Calculate critical points to display in helper guide
    const getCriticalPoints = (eq: Equation) => {
        const pointsList = [];

        // Y intercept: where x = 0
        const yInt = evaluateEq(eq, 0);
        if (!isNaN(yInt) && isFinite(yInt)) {
            pointsList.push({ name: 'Y-Intercept', x: 0, y: Number(yInt.toFixed(2)) });
        }

        // Turning points or intercepts based on types
        if (eq.type === 'linear') {
            // Root where a*x + b = 0 => x = -b/a
            if (eq.a !== 0) {
                const root = -eq.b / eq.a;
                pointsList.push({ name: 'Root (X-Int)', x: Number(root.toFixed(2)), y: 0 });
            }
        } else if (eq.type === 'quadratic') {
            // Vertex where x = -b / 2a
            if (eq.a !== 0) {
                const vertX = -eq.b / (2 * eq.a);
                const vertY = evaluateEq(eq, vertX);
                pointsList.push({ name: 'Vertex (Extrema)', x: Number(vertX.toFixed(2)), y: Number(vertY.toFixed(2)) });

                // Roots using discriminant
                const d = eq.b * eq.b - 4 * eq.a * eq.c;
                if (d >= 0) {
                    const r1 = (-eq.b + Math.sqrt(d)) / (2 * eq.a);
                    const r2 = (-eq.b - Math.sqrt(d)) / (2 * eq.a);
                    pointsList.push({ name: 'Root 1', x: Number(r1.toFixed(2)), y: 0 });
                    if (d > 0) {
                        pointsList.push({ name: 'Root 2', x: Number(r2.toFixed(2)), y: 0 });
                    }
                }
            }
        } else if (eq.type === 'sine' || eq.type === 'cosine') {
            pointsList.push({ name: 'Peak Amplitude', x: 0, y: eq.a + eq.d });
            pointsList.push({ name: 'Trough Amplitude', x: 0, y: -eq.a + eq.d });
        }

        return pointsList;
    };

    const selectedEq = equations.find(e => e.id === selectedEqId) || equations[0];

    // Grid ticks calculation standard spacing
    const getGridTicks = (min: number, max: number) => {
        const range = max - min;
        let spacing = 1;
        if (range > 15) spacing = 2;
        if (range > 30) spacing = 5;
        if (range > 80) spacing = 10;
        if (range > 200) spacing = 50;

        const ticks = [];
        const start = Math.ceil(min / spacing) * spacing;
        for (let t = start; t <= max; t += spacing) {
            ticks.push(t);
        }
        return { ticks, spacing };
    };

    const xTicksInfo = getGridTicks(minX, maxX);
    const yTicksInfo = getGridTicks(minY, maxY);

    // Grid reduction gap flag: remove margins to be Snug on screen edge
    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 text-slate-800 font-sans">
            {/* Short Header - No auxiliary text as requested! */}
            <header className="px-3 sm:px-4 py-4 flex items-center justify-between border-b border-slate-100 bg-white/85 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/tools')}
                        className="w-9 h-9 border border-slate-200 bg-white rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all shadow-xs cursor-pointer focus:outline-none shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-500" />
                            <h1 className="text-xl md:text-2xl font-black text-slate-900 leading-none tracking-tight">
                                Graphs
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={() => handleZoom(0.7)} 
                        title="Zoom In"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleZoom(1.35)} 
                        title="Zoom Out"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={handleReset} 
                        title="Center Grid"
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-100 active:scale-95 transition-all cursor-pointer shadow-xs"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main content body with very snug padding based on user request! */}
            <main className="px-1.5 md:px-3 py-4 max-w-7.5xl mx-auto space-y-4">
                {/* Visual Preset Bar */}
                <div className="bg-white border border-slate-100 rounded-2xl p-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shadow-xs">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2.5 shrink-0 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Graph Presets:</span>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => applyPreset(preset.eqs)}
                            className="px-3.5 py-1.5 bg-slate-50 border border-slate-100 hover:bg-indigo-50/40 hover:border-indigo-100 rounded-xl text-xs font-bold text-slate-600 hover:text-indigo-700 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Graph Plot viewport container */}
                    <div className="lg:col-span-8 space-y-3">
                        <div 
                            ref={containerRef} 
                            className="bg-white border border-slate-200 rounded-3xl overflow-hidden relative shadow-md select-none"
                            style={{ height: dimensions.height }}
                        >
                            {/* SVG Coordinate Grid Plotter */}
                            <svg 
                                ref={svgRef}
                                width={dimensions.width}
                                height={dimensions.height}
                                onMouseMove={handleMouseMove}
                                onMouseLeave={handleMouseLeave}
                                className="w-full h-full cursor-crosshair block"
                            >
                                <defs>
                                    <pattern id="origin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6B21A8" strokeWidth="0.5" strokeOpacity="0.2" />
                                    </pattern>
                                    <marker id="arrow-right" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6B21A8" />
                                    </marker>
                                    <marker id="arrow-up" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#6B21A8" />
                                    </marker>
                                </defs>
                                <rect width="100%" height="100%" fill="#ffffff" />

                                {/* Subtle grid cells background pattern */}
                                <g opacity="0.85">
                                    {/* Major/Minor vertical grid lines */}
                                    {xTicksInfo.ticks.map(tick => {
                                        const xPos = toSvgX(tick);
                                        const isYAxis = tick === 0;
                                        return (
                                            <line 
                                                key={`vl-${tick}`} 
                                                x1={xPos} 
                                                y1={isYAxis ? dimensions.height : 0} 
                                                x2={xPos} 
                                                y2={0} 
                                                stroke={isYAxis ? "#6B21A8" : "#f1e9fe"} 
                                                strokeWidth={isYAxis ? 2.5 : 1} 
                                                strokeOpacity={isYAxis ? 1 : 0.8}
                                                strokeDasharray={isYAxis ? "none" : "2,2"}
                                                markerEnd={isYAxis ? "url(#arrow-up)" : undefined}
                                            />
                                        );
                                    })}

                                    {/* Major/Minor horizontal grid lines */}
                                    {yTicksInfo.ticks.map(tick => {
                                        const yPos = toSvgY(tick);
                                        const isXAxis = tick === 0;
                                        return (
                                            <line 
                                                key={`hl-${tick}`} 
                                                x1={0} 
                                                y1={yPos} 
                                                x2={dimensions.width} 
                                                y2={yPos} 
                                                stroke={isXAxis ? "#6B21A8" : "#f1e9fe"} 
                                                strokeWidth={isXAxis ? 2.5 : 1} 
                                                strokeOpacity={isXAxis ? 1 : 0.8}
                                                strokeDasharray={isXAxis ? "none" : "2,2"}
                                                markerEnd={isXAxis ? "url(#arrow-right)" : undefined}
                                            />
                                        );
                                    })}
                                </g>

                                {/* FEASIBLE REGION SHADER */}
                                {(() => {
                                    const pathD = getFeasibleRegionPath();
                                    if (!pathD) return null;
                                    return (
                                        <path 
                                            d={pathD}
                                            fill="#FCD34D" 
                                            fillOpacity="0.45"
                                            stroke="#F59E0B"
                                            strokeWidth={1.5}
                                            className="transition-all duration-300"
                                        />
                                    );
                                })()}

                                {/* Axes Numbers ticks */}
                                <g className="text-[10px] font-sans font-black fill-[#6B21A8] select-none pointer-events-none">
                                    {/* X axis numbers */}
                                    {xTicksInfo.ticks.map(tick => {
                                        if (tick === 0) return null;
                                        const xPos = toSvgX(tick);
                                        const yPos = toSvgY(0);
                                        return (
                                            <text 
                                                key={`txtx-${tick}`} 
                                                x={xPos} 
                                                y={Math.max(15, Math.min(dimensions.height - 10, yPos + 18))} 
                                                textAnchor="middle" 
                                            >
                                                {tick}
                                            </text>
                                        );
                                    })}

                                    {/* Y axis numbers */}
                                    {yTicksInfo.ticks.map(tick => {
                                        if (tick === 0) return null;
                                        const xPos = toSvgX(0);
                                        const yPos = toSvgY(tick);
                                        return (
                                            <text 
                                                key={`txty-${tick}`} 
                                                x={Math.max(10, Math.min(dimensions.width - 25, xPos - 12))} 
                                                y={yPos + 4} 
                                                textAnchor="end" 
                                            >
                                                {tick}
                                            </text>
                                        );
                                    })}
                                    <text x={toSvgX(0) - 10} y={toSvgY(0) + 14} className="fill-[#581C87] font-black">0</text>
                                </g>

                                {/* Labels for graph boundaries */}
                                <g className="text-[11px] font-black tracking-widest fill-[#581C87] uppercase pointer-events-none">
                                    <text x={dimensions.width - 20} y={toSvgY(0) - 10} textAnchor="end">X</text>
                                    <text x={toSvgX(0) + 15} y={20}>Y</text>
                                </g>

                                {/* RENDER ACTIVE EQUATIONS PATH */}
                                {equations.map((eq) => {
                                    if (!eq.visible) return null;
                                    const pathStr = getSvgPathForEquation(eq);
                                    if (!pathStr) return null;
                                    const isHighlighted = eq.id === selectedEqId;
                                    return (
                                        <g key={eq.id}>
                                            {/* Glow path shadow */}
                                            <path 
                                                d={pathStr}
                                                fill="none"
                                                stroke={eq.color}
                                                strokeWidth={isHighlighted ? 4.5 : 2}
                                                strokeOpacity="0.15"
                                                className="transition-all duration-300"
                                            />
                                            {/* Sharp foreground path line */}
                                            <path 
                                                d={pathStr}
                                                fill="none"
                                                stroke={eq.color}
                                                strokeWidth={isHighlighted ? 3 : 2}
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="transition-all duration-300"
                                            />
                                        </g>
                                    );
                                })}

                                {/* BEAUTIFIED EQUATION PILL ANNOTATIONS SLANTED ON TOP */}
                                {(() => {
                                    return equations.map((eq, index) => {
                                        if (!eq.visible) return null;
                                        const pathStr = getSvgPathForEquation(eq);
                                        if (!pathStr) return null;

                                        // Choose custom staggered placements along X to prevent overlaps
                                        const t = 0.25 + (index * 0.22) % 0.55; 
                                        const xLabelVal = minX + (maxX - minX) * t;
                                        const yLabelVal = evaluateEq(eq, xLabelVal);

                                        if (isNaN(yLabelVal) || !isFinite(yLabelVal)) return null;
                                        if (yLabelVal < minY + 1 || yLabelVal > maxY - 1) return null;

                                        const sX = toSvgX(xLabelVal);
                                        const sY = toSvgY(yLabelVal);

                                        let rotate = 0;
                                        if (eq.type === 'linear') {
                                            const hSpan = maxX - minX;
                                            const vSpan = maxY - minY;
                                            const slopePxl = -eq.a * (dimensions.height / vSpan) / (dimensions.width / hSpan);
                                            rotate = Math.atan(slopePxl) * (180 / Math.PI);
                                        }

                                        return (
                                            <g 
                                                key={`taglbl-${eq.id}`} 
                                                transform={`translate(${sX}, ${sY - 14}) rotate(${rotate})`} 
                                                className="pointer-events-none select-none"
                                            >
                                                {/* Text block placeholder padding */}
                                                <rect 
                                                    x={-42} 
                                                    y={-9} 
                                                    width={84} 
                                                    height={13} 
                                                    fill="#ffffff" 
                                                    fillOpacity="0.95" 
                                                    stroke={eq.color} 
                                                    strokeWidth={0.5} 
                                                    strokeOpacity={0.6} 
                                                    rx={4} 
                                                />
                                                <text
                                                    textAnchor="middle"
                                                    y={1}
                                                    className="text-[9px] font-black font-sans leading-none tracking-tight select-none"
                                                    fill={eq.color}
                                                >
                                                    {renderEqFormula(eq)}
                                                </text>
                                            </g>
                                        );
                                    });
                                })()}

                                {/* Snap points of hover intersection tracking */}
                                {mouseCoord && Object.entries(snappedCoords).map(([eqId, coord]) => {
                                    const eq = equations.find(e => e.id === eqId);
                                    if (!eq || !eq.visible) return null;
                                    const sX = toSvgX(coord.x);
                                    const sY = toSvgY(coord.y);

                                    // Check if snapped point lies within the visible rendering grid
                                    if (sX < 0 || sX > dimensions.width || sY < 0 || sY > dimensions.height) {
                                        return null;
                                    }

                                    return (
                                        <g key={`snap-${eqId}`} className="pointer-events-none">
                                            <circle 
                                                cx={sX} 
                                                cy={sY} 
                                                r={6} 
                                                fill={eq.color} 
                                                stroke="#0a0f1d" 
                                                strokeWidth={2} 
                                                className="animate-pulse"
                                            />
                                            <circle 
                                                cx={sX} 
                                                cy={sY} 
                                                r={10} 
                                                fill="none" 
                                                stroke={eq.color} 
                                                strokeWidth={1} 
                                                opacity="0.5"
                                            />
                                        </g>
                                    );
                                })}

                                {/* Crosshairs tracking guides */}
                                {mouseCoord && (
                                    <g stroke="#475569" strokeWidth="0.5" strokeOpacity="0.55" strokeDasharray="3,3" className="pointer-events-none">
                                        <line x1={toSvgX(mouseCoord.x)} y1={0} x2={toSvgX(mouseCoord.x)} y2={dimensions.height} />
                                        <line x1={0} y1={toSvgY(mouseCoord.y)} x2={dimensions.width} y2={toSvgY(mouseCoord.y)} />
                                    </g>
                                )}
                            </svg>

                            {/* Floating coordinate dynamic readout values */}
                            {mouseCoord && (
                                <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-100 rounded-xl px-2.5 py-1.5 text-[10px] font-mono shadow-xl pointer-events-none space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-slate-400 font-extrabold uppercase tracking-wider text-[8px]">
                                        <Activity className="w-3 h-3 text-emerald-400" /> Cursor Coordinates
                                    </div>
                                    <div>X: <span className="font-bold text-emerald-400">{mouseCoord.x.toFixed(3)}</span></div>
                                    <div>Y: <span className="font-bold text-emerald-400">{mouseCoord.y.toFixed(3)}</span></div>
                                </div>
                            )}

                            {/* Dynamic Intersect snaps box right under curve hover */}
                            {mouseCoord && Object.keys(snappedCoords).length > 0 && (
                                <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-slate-200 rounded-xl p-2.5 max-h-[140px] overflow-y-auto scrollbar-none text-[9px] font-mono shadow-xl pointer-events-none space-y-1.5 min-w-[140px]">
                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-1">Snap Analysis</span>
                                    {equations.map(eq => {
                                        const snap = snappedCoords[eq.id];
                                        if (!snap) return null;
                                        return (
                                            <div key={`snbox-${eq.id}`} className="flex items-start gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: eq.color }} />
                                                <div className="truncate">
                                                    <span className="font-bold opacity-75 capitalize block text-[8px]">{eq.type}</span>
                                                    <span className="text-slate-300">({snap.x.toFixed(2)}, <span className="font-bold" style={{ color: eq.color }}>{snap.y.toFixed(2)}</span>)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Interactive analytical info of selected equations */}
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-slate-50 rounded-full" />
                            <h3 className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5 mb-3">
                                <Info className="w-4 h-4 text-indigo-500" /> Math Landmark Analysis
                            </h3>

                            {selectedEq ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-xs text-slate-400 font-semibold uppercase">Active Form</div>
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black font-mono tracking-tight text-indigo-700 w-max max-w-full">
                                            {renderEqFormula(selectedEq)}
                                        </div>
                                        <span className="text-[10px] text-slate-400 inline-block mt-1 font-semibold leading-relaxed">
                                            Adjust sliders on the right panel to shift variables instantly and evaluate physical properties in real-time.
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="text-xs text-slate-400 font-semibold uppercase">Crucial Coordinates</div>
                                        <div className="space-y-1.5">
                                            {getCriticalPoints(selectedEq).map((pt, idx) => (
                                                <div key={idx} className="flex items-center justify-between py-1 border-b border-dashed border-slate-100 last:border-0">
                                                    <span className="text-[10px] font-bold text-slate-600">{pt.name}</span>
                                                    <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                                        ({pt.x}, {pt.y})
                                                    </span>
                                                </div>
                                            ))}
                                            {getCriticalPoints(selectedEq).length === 0 && (
                                                <span className="text-[10px] text-slate-400 italic block">No real properties calculated.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Select or configure an equation above to display landmarks.</p>
                            )}
                        </div>
                    </div>

                    {/* Equations controller list panel */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-105">
                                <h3 className="font-black text-xs text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                                    <Sliders className="w-4 h-4 text-pink-500" /> Equations List
                                </h3>
                                <button
                                    onClick={addEquation}
                                    disabled={equations.length >= 6}
                                    className="px-3 py-1.5 bg-linear-to-r from-indigo-500 to-blue-500 hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Eq
                                </button>
                            </div>

                            {/* Scrollable list of active slots */}
                            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                                {equations.map((eq) => {
                                    const isSel = eq.id === selectedEqId;
                                    return (
                                        <div 
                                            key={eq.id}
                                            onClick={() => setSelectedEqId(eq.id)}
                                            className={`p-2.5 border rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-1.5 ${
                                                isSel 
                                                    ? 'border-indigo-500/50 bg-indigo-50/20 shadow-xs' 
                                                    : 'border-slate-100 hover:border-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                {/* Color circle Indicator */}
                                                <span className="w-3 h-3 rounded-full shrink-0 flex items-center justify-center text-[7px]" style={{ backgroundColor: eq.color }}>
                                                    {isSel && <Check className="w-2.5 h-2.5 text-white stroke-[3.5]" />}
                                                </span>
                                                <div className="min-w-0">
                                                    <span className="text-[10px] uppercase font-extrabold text-slate-400 capitalize block leading-none">{eq.type}</span>
                                                    <span className="font-mono text-xs font-bold text-slate-700 truncate block mt-0.5">{renderEqFormula(eq)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleVisible(eq.id)}
                                                    className={`p-1.5 rounded-lg active:scale-90 transition-all ${eq.visible ? 'text-slate-500 hover:text-slate-800' : 'text-slate-300'}`}
                                                    title={eq.visible ? "Hide on grid" : "Show on grid"}
                                                >
                                                    {eq.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteEquation(eq.id)}
                                                    disabled={false}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg active:scale-95 transition-all"
                                                    title="Delete equation"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
 
                             {/* Adjust sliders section for Selected Equation */}
                             {selectedEq && (
                                 <div className="border-t border-slate-50 pt-4 space-y-4">
                                     <div>
                                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Equation Type</label>
                                         <select
                                             value={selectedEq.type}
                                             onChange={(e) => updateEqType(selectedEq.id, e.target.value as Equation['type'])}
                                             className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-150 cursor-pointer"
                                         >
                                             <option value="linear">Linear: y = mx + c</option>
                                             <option value="quadratic">Quadratic: y = ax² + bx + c</option>
                                             <option value="cubic">Cubic: y = ax³ + bx² + cx + d</option>
                                             <option value="sine">Trig Sine: y = a sin(bx + c) + d</option>
                                             <option value="cosine">Trig Cosine: y = a cos(bx + c) + d</option>
                                             <option value="exponential">Exponential: y = a e^(bx) + c</option>
                                             <option value="logarithmic">Logarithmic: y = a ln(bx) + c</option>
                                         </select>
                                     </div>

                                     <div>
                                         <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1.5">Inequality / Relation Sign</label>
                                         <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                                             {(['=', '<=', '>='] as const).map((sig) => {
                                                 const isActive = (selectedEq.sign || '=') === sig;
                                                 return (
                                                     <button
                                                         key={sig}
                                                         type="button"
                                                         onClick={() => updateEqSign(selectedEq.id, sig)}
                                                         className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                                             isActive 
                                                                 ? 'bg-white text-indigo-700 shadow-xs border border-indigo-100/50' 
                                                                 : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                                                         }`}
                                                     >
                                                         {sig === '=' && 'y = f(x)'}
                                                         {sig === '<=' && 'y ≤ f(x)'}
                                                         {sig === '>=' && 'y ≥ f(x)'}
                                                     </button>
                                                 );
                                             })}
                                         </div>
                                     </div>

                                    {/* Sliders panel based on current function variables */}
                                    <div className="space-y-3 bg-slate-50/50 p-2.5 border border-slate-100 rounded-2xl">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">Shift Variables</span>
                                        
                                        {/* Slider 1: Variable A */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-slate-500">
                                                    {selectedEq.type === 'linear' && 'Slope (m)'}
                                                    {selectedEq.type === 'quadratic' && 'A (ax²)'}
                                                    {selectedEq.type === 'cubic' && 'A (ax³)'}
                                                    {(selectedEq.type === 'sine' || selectedEq.type === 'cosine') && 'Amplitude (a)'}
                                                    {(selectedEq.type === 'exponential' || selectedEq.type === 'logarithmic') && 'Scale (a)'}
                                                </span>
                                                <span className="text-indigo-600 font-mono font-bold">{selectedEq.a}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min={selectedEq.type === 'exponential' ? -5 : -5}
                                                max={5}
                                                step="0.05"
                                                value={selectedEq.a}
                                                onChange={(e) => updateCoef(selectedEq.id, 'a', Number(e.target.value))}
                                                className="w-full accent-indigo-500 cursor-pointer h-1.5"
                                            />
                                        </div>

                                        {/* Slider 2: Variable B */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold">
                                                <span className="text-slate-500">
                                                    {selectedEq.type === 'linear' && 'Intercept (c)'}
                                                    {selectedEq.type === 'quadratic' && 'B (bx)'}
                                                    {selectedEq.type === 'cubic' && 'B (bx²)'}
                                                    {(selectedEq.type === 'sine' || selectedEq.type === 'cosine') && 'Freq (b)'}
                                                    {(selectedEq.type === 'exponential' || selectedEq.type === 'logarithmic') && 'Base (b)'}
                                                </span>
                                                <span className="text-indigo-600 font-mono font-bold">{selectedEq.b}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min={-5}
                                                max={5}
                                                step="0.05"
                                                value={selectedEq.b}
                                                onChange={(e) => updateCoef(selectedEq.id, 'b', Number(e.target.value))}
                                                className="w-full accent-indigo-500 cursor-pointer h-1.5"
                                            />
                                        </div>

                                        {/* Slider 3: Variable C */}
                                        {['quadratic', 'cubic', 'sine', 'cosine', 'exponential', 'logarithmic'].includes(selectedEq.type) && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-500">
                                                        {selectedEq.type === 'quadratic' && 'C (c)'}
                                                        {selectedEq.type === 'cubic' && 'C (cx)'}
                                                        {(selectedEq.type === 'sine' || selectedEq.type === 'cosine') && 'Phase (c)'}
                                                        {(selectedEq.type === 'exponential' || selectedEq.type === 'logarithmic') && 'Shift (c)'}
                                                    </span>
                                                    <span className="text-indigo-600 font-mono font-bold">{selectedEq.c}</span>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min={-5}
                                                    max={5}
                                                    step="0.05"
                                                    value={selectedEq.c}
                                                    onChange={(e) => updateCoef(selectedEq.id, 'c', Number(e.target.value))}
                                                    className="w-full accent-indigo-500 cursor-pointer h-1.5"
                                                />
                                            </div>
                                        )}

                                        {/* Slider 4: Variable D */}
                                        {['cubic', 'sine', 'cosine'].includes(selectedEq.type) && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-slate-500">
                                                        {selectedEq.type === 'cubic' && 'D (d)'}
                                                        {(selectedEq.type === 'sine' || selectedEq.type === 'cosine') && 'Offset (d)'}
                                                    </span>
                                                    <span className="text-indigo-600 font-mono font-bold">{selectedEq.d}</span>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min={-5}
                                                    max={5}
                                                    step="0.1"
                                                    value={selectedEq.d}
                                                    onChange={(e) => updateCoef(selectedEq.id, 'd', Number(e.target.value))}
                                                    className="w-full accent-indigo-500 cursor-pointer h-1.5"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
