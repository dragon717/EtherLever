export const INITIAL_ENERGY = 1000;
export const MAX_ENERGY_BASE = 1000;
export const ENERGY_REGEN_RATE = 5; // per tick

// The physics simulation constants based on the prompt
export const BASE_MACHINE_INPUT = 100; // 100J Input
export const BASE_FRICTION_LOSS = 20;  // 20J Loss
export const BASE_THERMAL_COUPLING = 2.0; // Absorb 2x environment relative to input potential

export const CASTLE_GOAL_HEIGHT = 5000; // Total Joules needed to win MVP level

export const WEATHER_MODIFIERS = {
    "风平浪静": 1.0,
    "狂风骤雨": 1.5,
    "烈日炎炎": 2.5, // Best for thermal expansion
    "天寒地冻": 0.5
};

export const UPGRADE_COSTS = {
    COUPLING: 150,
    CAPACITY: 200,
    INSULATION: 100
};