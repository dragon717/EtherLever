import React, { useState, useEffect, useCallback } from 'react';
import { 
    GameState, 
    MachineStats, 
    WeatherState, 
    LogEntry 
} from './types';
import { 
    BASE_MACHINE_INPUT, 
    BASE_FRICTION_LOSS, 
    BASE_THERMAL_COUPLING, 
    INITIAL_ENERGY, 
    MAX_ENERGY_BASE, 
    WEATHER_MODIFIERS,
    CASTLE_GOAL_HEIGHT,
    UPGRADE_COSTS,
    ENERGY_REGEN_RATE
} from './constants';
import { SimulationPanel } from './components/SimulationPanel';
import { SageDialog } from './components/SageDialog';

// SVGs as components for cleaner code
const CraneIcon = ({ active }: { active: boolean }) => (
    <svg viewBox="0 0 24 24" className={`w-32 h-32 ${active ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 22h20M12 2v20M8 6l4-4 4 4" className="text-slate-600" />
        <rect x="10" y="10" width="4" height="12" className="text-amber-700" fill="currentColor" />
        <circle cx="12" cy="6" r="2" className={active ? "text-cyan-400 fill-cyan-400" : "text-slate-500"} />
        {active && <path d="M4 14l-2 2m18-2l2 2m-8-12l2-2" className="animate-ping text-cyan-500" />}
    </svg>
);

const App: React.FC = () => {
    // --- State ---
    const [gameState, setGameState] = useState<GameState>({
        energy: INITIAL_ENERGY,
        maxEnergy: MAX_ENERGY_BASE,
        gold: 0,
        castleProgress: 0,
        ambientHeat: 100, // Arbitrary units of ambient energy density
        totalWorkDone: 0
    });

    const [machineStats, setMachineStats] = useState<MachineStats>({
        baseInput: BASE_MACHINE_INPUT,
        thermalCoupling: BASE_THERMAL_COUPLING,
        frictionLoss: BASE_FRICTION_LOSS,
        level: 1
    });

    const [weather, setWeather] = useState<WeatherState>(WeatherState.CALM);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLifting, setIsLifting] = useState(false);
    const [isSageOpen, setIsSageOpen] = useState(false);

    // --- Game Loop (Weather & Regen) ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Regenerate Energy
            setGameState(prev => ({
                ...prev,
                energy: Math.min(prev.energy + ENERGY_REGEN_RATE, prev.maxEnergy)
            }));

            // Change Weather Randomly (10% chance per tick)
            if (Math.random() < 0.05) {
                const weathers = Object.values(WeatherState);
                const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
                setWeather(newWeather);
            }

            // Fluency Ambient Heat based on weather
            const baseAmbient = 100;
            const variance = Math.floor(Math.random() * 20) - 10;
            const modifier = WEATHER_MODIFIERS[weather as keyof typeof WEATHER_MODIFIERS];
            
            setGameState(prev => ({
                ...prev,
                ambientHeat: Math.floor((baseAmbient + variance) * modifier)
            }));

        }, 1000);
        return () => clearInterval(interval);
    }, [weather]);


    // --- Actions ---

    const handleLift = useCallback(() => {
        if (gameState.energy < machineStats.baseInput || isLifting) return;

        setIsLifting(true);

        // Core Physics Logic
        const inputWork = machineStats.baseInput; // 100J
        
        // The Environment Lever Effect:
        // Absorbed = Ambient Energy Density * Coupling Factor
        // In the prompt example: 100J input triggers 200J absorption.
        // We scale this by our game's "AmbientHeat" value.
        // Let's say Ambient Heat 100 = 100J potential.
        
        const absorptionPotential = gameState.ambientHeat; 
        const absorbedEnergy = Math.floor(absorptionPotential * machineStats.thermalCoupling * (inputWork / 100));
        
        // Total Work = Input + Absorbed - Loss
        const totalWork = Math.max(0, inputWork + absorbedEnergy - machineStats.frictionLoss);

        // Update State
        setGameState(prev => ({
            ...prev,
            energy: prev.energy - inputWork,
            gold: prev.gold + Math.floor(totalWork / 10), // 10J = 1 Gold
            castleProgress: Math.min(CASTLE_GOAL_HEIGHT, prev.castleProgress + totalWork),
            totalWorkDone: prev.totalWorkDone + totalWork
        }));

        // Log it
        const newLog: LogEntry = {
            id: Date.now().toString(),
            input: inputWork,
            absorbed: absorbedEnergy,
            output: totalWork,
            message: `从环境中汲取了 ${absorbedEnergy}J 能量！`,
            timestamp: Date.now()
        };

        setLogs(prev => [newLog, ...prev].slice(0, 10));

        // Reset Animation
        setTimeout(() => setIsLifting(false), 500);

    }, [gameState.energy, gameState.ambientHeat, isLifting, machineStats]);

    const buyUpgrade = (type: 'COUPLING' | 'CAPACITY' | 'INSULATION') => {
        const cost = UPGRADE_COSTS[type];
        if (gameState.gold < cost) return;

        setGameState(prev => ({ ...prev, gold: prev.gold - cost }));

        if (type === 'COUPLING') {
            setMachineStats(prev => ({ ...prev, thermalCoupling: prev.thermalCoupling + 0.5, level: prev.level + 1 }));
        } else if (type === 'CAPACITY') {
            setGameState(prev => ({ ...prev, maxEnergy: prev.maxEnergy + 500 }));
        } else if (type === 'INSULATION') {
            setMachineStats(prev => ({ ...prev, frictionLoss: Math.max(0, prev.frictionLoss - 5) }));
        }
    };

    // --- Render ---

    const progressPercentage = (gameState.castleProgress / CASTLE_GOAL_HEIGHT) * 100;

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center pb-12">
            
            {/* Header */}
            <header className="w-full bg-slate-800 p-4 border-b border-slate-700 shadow-lg flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-amber-950 font-bold medieval-font">A</div>
                    <h1 className="text-xl md:text-2xl font-bold medieval-font text-amber-500">The Aether Lever</h1>
                </div>
                <div className="flex gap-4 text-sm font-mono">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400">金币</span>
                        <span className="text-amber-400 font-bold">{gameState.gold}</span>
                    </div>
                     <div className="flex flex-col items-end">
                        <span className="text-slate-400">输入能量</span>
                        <div className="w-32 bg-slate-700 h-2 rounded mt-1 overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(gameState.energy / gameState.maxEnergy) * 100}%` }}></div>
                        </div>
                        <span className="text-cyan-400 font-bold text-xs">{Math.floor(gameState.energy)} / {gameState.maxEnergy}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full max-w-5xl p-4 grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Left Column: Visuals & Controls */}
                <div className="space-y-6">
                    
                    {/* Environment Monitor */}
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none text-9xl">
                            {weather === WeatherState.HEATWAVE ? '☀' : weather === WeatherState.WINDY ? '༄' : '☁'}
                        </div>
                        <h2 className="text-xl medieval-font mb-4 text-cyan-300">背景场状态</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-slate-400 text-sm">大气状况</div>
                                <div className="text-lg font-bold text-white">{weather}</div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-sm">环境能量密度</div>
                                <div className="text-2xl font-bold text-red-400">{gameState.ambientHeat} J/m³</div>
                                <div className="text-xs text-slate-500">每次激活的潜在增益</div>
                            </div>
                        </div>
                    </div>

                    {/* The Machine Control */}
                    <div className="bg-slate-800 p-8 rounded-lg border-2 border-amber-700/50 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col items-center text-center">
                        <CraneIcon active={isLifting} />
                        
                        <h2 className="text-2xl medieval-font text-amber-500 mt-4 mb-2">气动以太起重机</h2>
                        <p className="text-slate-400 text-sm mb-6 max-w-sm">
                            投入 <span className="text-cyan-400 font-bold">{machineStats.baseInput}J</span> 火花以汲取环境热能并做功。
                        </p>

                        <button 
                            onClick={handleLift}
                            disabled={gameState.energy < machineStats.baseInput}
                            className={`
                                group relative w-full max-w-xs py-4 px-6 rounded-lg font-bold text-lg tracking-wider
                                transition-all duration-100 uppercase medieval-font
                                ${gameState.energy < machineStats.baseInput 
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-lg active:scale-95'}
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                启动杠杆
                                {isLifting && <span className="animate-spin">⚙</span>}
                            </span>
                        </button>

                        <div className="mt-4 text-xs text-slate-500">
                           当前效率 (COP): <span className="text-green-400">{((100 + (gameState.ambientHeat * machineStats.thermalCoupling)) / 100).toFixed(1)}x</span>
                        </div>
                    </div>

                    {/* Upgrades */}
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <h3 className="medieval-font text-slate-300 mb-3 border-b border-slate-700 pb-1">工坊</h3>
                        <div className="space-y-2">
                            <button 
                                onClick={() => buyUpgrade('COUPLING')}
                                disabled={gameState.gold < UPGRADE_COSTS.COUPLING}
                                className="w-full flex justify-between items-center p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded transition-colors disabled:opacity-50"
                            >
                                <div className="text-left">
                                    <div className="text-cyan-300 font-bold">以太耦合器 (+0.5 效率)</div>
                                    <div className="text-xs text-slate-500">吸收更多环境热能</div>
                                </div>
                                <div className="text-amber-400 font-mono">{UPGRADE_COSTS.COUPLING} G</div>
                            </button>

                            <button 
                                onClick={() => buyUpgrade('INSULATION')}
                                disabled={gameState.gold < UPGRADE_COSTS.INSULATION}
                                className="w-full flex justify-between items-center p-3 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded transition-colors disabled:opacity-50"
                            >
                                <div className="text-left">
                                    <div className="text-green-300 font-bold">密封修补 (-5 损耗)</div>
                                    <div className="text-xs text-slate-500">减少摩擦/熵增</div>
                                </div>
                                <div className="text-amber-400 font-mono">{UPGRADE_COSTS.INSULATION} G</div>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Simulation & Progress */}
                <div className="space-y-6 flex flex-col h-full">
                    
                    {/* The Principle Visualization */}
                    <SimulationPanel 
                        logs={logs} 
                        currentInput={machineStats.baseInput}
                        currentAmbient={gameState.ambientHeat}
                        machineStats={machineStats}
                    />

                    {/* Goal Progress */}
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-600 flex-1 flex flex-col">
                        <h3 className="medieval-font text-xl text-slate-200 mb-4">堡垒修复</h3>
                        
                        <div className="relative flex-1 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden flex flex-col justify-end min-h-[200px]">
                            {/* Background Sky */}
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-slate-900/50"></div>
                            
                            {/* Castle Silhouette building up */}
                            <div 
                                className="w-full bg-slate-700 transition-all duration-1000 ease-out relative"
                                style={{ height: `${progressPercentage}%` }}
                            >
                                <div className="absolute -top-4 left-0 w-full flex justify-center gap-4 opacity-50">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="w-8 h-4 bg-slate-600"></div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-brick-wall.png')] opacity-50"></div>
                            </div>

                            {/* Goal Line */}
                            <div className="absolute top-0 left-0 w-full border-t border-dashed border-amber-500 opacity-50 p-1">
                                <span className="text-xs text-amber-500 uppercase">目标高度</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 text-center">
                            <div className="text-3xl font-bold text-white mb-1">{Math.floor(progressPercentage)}%</div>
                            <div className="text-xs text-slate-400">修复进度</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating FAB for Sage */}
            <button 
                onClick={() => setIsSageOpen(true)}
                className="fixed bottom-6 right-6 bg-cyan-900 hover:bg-cyan-800 text-cyan-200 p-4 rounded-full shadow-2xl border-2 border-cyan-500 transition-transform hover:scale-105 group z-40"
            >
                <div className="text-2xl">📜</div>
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-900 text-slate-200 text-xs p-2 rounded shadow-lg hidden group-hover:block text-center">
                    咨询阿拉里克大师
                </div>
            </button>

            {/* Sage Modal */}
            <SageDialog 
                isOpen={isSageOpen} 
                onClose={() => setIsSageOpen(false)} 
                context={`Game State: Input=${machineStats.baseInput}, Ambient=${gameState.ambientHeat}, Efficiency=${machineStats.thermalCoupling}, Weather=${weather}`}
            />
            
        </div>
    );
};

export default App;