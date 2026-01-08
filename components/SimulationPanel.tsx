import React from 'react';
import { LogEntry, MachineStats } from '../types';

interface SimulationPanelProps {
    logs: LogEntry[];
    currentInput: number;
    currentAmbient: number;
    machineStats: MachineStats;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ logs, currentInput, currentAmbient, machineStats }) => {
    
    // Calculate potential output for display
    const potentialAbsorbed = Math.floor(currentAmbient * machineStats.thermalCoupling * (currentInput / 100));
    const potentialOutput = Math.max(0, currentInput + potentialAbsorbed - machineStats.frictionLoss);

    return (
        <div className="bg-slate-800 border-2 border-slate-600 p-4 rounded-lg shadow-xl font-mono text-sm">
            <h3 className="text-amber-500 font-bold mb-4 medieval-font text-lg border-b border-slate-600 pb-2">
                热力学逻辑引擎
            </h3>

            {/* Live Equation Visualization */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 p-4 rounded mb-6 gap-2">
                <div className="text-center">
                    <div className="text-cyan-400 font-bold text-xl">{currentInput} J</div>
                    <div className="text-xs text-slate-400">输入 (火花)</div>
                </div>
                <div className="text-slate-500 text-xl font-bold">+</div>
                <div className="text-center relative group cursor-help">
                    <div className="text-red-400 font-bold text-xl">{potentialAbsorbed} J</div>
                    <div className="text-xs text-slate-400">环境 (热能)</div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black text-white text-xs p-2 rounded hidden group-hover:block z-10">
                        基于以太耦合从背景场吸收能量。
                    </div>
                </div>
                <div className="text-slate-500 text-xl font-bold">-</div>
                 <div className="text-center">
                    <div className="text-gray-400 font-bold text-xl">{machineStats.frictionLoss} J</div>
                    <div className="text-xs text-slate-400">熵增 (损耗)</div>
                </div>
                <div className="text-slate-500 text-xl font-bold">=</div>
                <div className="text-center border-2 border-green-500/50 p-2 rounded bg-green-900/20">
                    <div className="text-green-400 font-bold text-2xl">{potentialOutput} J</div>
                    <div className="text-xs text-slate-400">做功输出</div>
                </div>
            </div>

            {/* Logs */}
            <div className="h-48 overflow-y-auto space-y-2 pr-2">
                {logs.length === 0 && <div className="text-slate-500 italic text-center mt-10">系统待机。请启动起重机。</div>}
                {logs.map((log) => (
                    <div key={log.id} className="flex justify-between items-center text-xs border-b border-slate-700 pb-1 animate-pulse">
                        <span className="text-slate-400 w-12">{new Date(log.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                        <span className="text-cyan-600">入: {log.input}</span>
                        <span className="text-red-600">环境: +{log.absorbed}</span>
                        <span className="text-green-500 font-bold">出: {log.output}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 text-xs text-slate-400 text-center">
                “在开放系统中，机械是环境能量的杠杆。”
            </div>
        </div>
    );
};