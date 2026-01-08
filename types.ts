export enum GamePhase {
    IDLE = 'IDLE',
    LIFTING = 'LIFTING',
    COMPLETED = 'COMPLETED'
}

export interface GameState {
    energy: number;       // Input Energy (Player Resource)
    maxEnergy: number;
    gold: number;         // Currency
    castleProgress: number; // 0 to 100%
    ambientHeat: number;  // The "Background Field" (Environment Energy)
    totalWorkDone: number;
}

export interface MachineStats {
    baseInput: number;    // Cost to activate (J)
    thermalCoupling: number; // Efficiency of absorbing environment (multiplier)
    frictionLoss: number; // Fixed loss (J)
    level: number;
}

export interface LogEntry {
    id: string;
    input: number;
    absorbed: number;
    output: number;
    message: string;
    timestamp: number;
}

export enum WeatherState {
    CALM = "风平浪静",
    WINDY = "狂风骤雨",
    HEATWAVE = "烈日炎炎",
    COLD = "天寒地冻"
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}