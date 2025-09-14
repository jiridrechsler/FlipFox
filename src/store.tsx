import React, { createContext, useContext, useMemo, useRef, useState } from "react";

// ===== DATA (English only; add more categories as needed) =====
type Category = {
    ordered?: boolean;
    en: string[];
    emoji?: string[];
};

export const data: Record<string, Category> = {
    days: {
        ordered: true,
        en: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    },
    months: {
        ordered: true,
        en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    },
    seasons: {
        ordered: true,
        en: ["Spring","Summer","Autumn","Winter"],
        emoji: ["🌱","☀️","🍂","❄️"],
    },
    colors: {
        en: ["red","blue","green","yellow","black","white","orange","purple","pink","brown","gray"],
        emoji: ["🔴","🔵","🟢","🟡","⚫","⚪","🟠","🟣","🌸","🤎","⬜"],
    },
    animals: {
        en: ["dog","cat","horse","cow","sheep","pig","chicken","duck","bird","fish"],
        emoji: ["🐶","🐱","🐴","🐮","🐑","🐷","🐔","🦆","🐦","🐟"],
    },
    food: {
        en: ["apple","banana","carrot","bread","cheese","egg","rice","pizza","burger","milk"],
        emoji: ["🍎","🍌","🥕","🍞","🧀","🥚","🍚","🍕","🍔","🥛"],
    },
};

// ===== HELPERS =====
const shuffle = (a: number[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// ===== STATE =====
type Mode = "num-to-word" | "word-to-num" | "emoji-to-word" | "word-to-emoji";

function modesForCategory(catKey: string): Mode[] {
    const cat = data[catKey];
    const out: Mode[] = [];
    if (cat.ordered) {
        out.push("num-to-word", "word-to-num");
    }
    if (cat.emoji) {
        out.push("emoji-to-word", "word-to-emoji");
    }
    // if neither, fallback to word↔num using index (still usable)
    if (out.length === 0) out.push("num-to-word", "word-to-num");
    return out;
}

type Config = {
    category: keyof typeof data;
    delaySec: number;
    count: number;
};

type GameState = Config & {
    order: number[];
    currentIndex: number; // pointer into order
    seen: number;
    correct: number;
    showing: boolean;
    barPct: number;
    mode: Mode;
    paused: boolean;
    finished: boolean;
    prompt: string;
    answer: string;
    accuracy: number;
};

type Ctx = {
    state: GameState;
    actions: {
        configure(p: Partial<Config>): void;
        startNewRound(): void;
        startTimer(): void;
        stopTimer(): void;
        togglePause(): void;
        mark(good: boolean): void;
    };
};

const GameContext = createContext<Ctx | null>(null);

// Provider
export function GameProvider({ children }: { children: React.ReactNode }) {
    const [cfg, setCfg] = useState<Config>({
        category: "days",
        delaySec: 2,
        count: Math.min(7, data["days"].en.length),
    });

    const [state, setState] = useState<GameState>(() => buildInitialState(cfg));
    const timerRef = useRef<NodeJS.Timer | null>(null);
    const t0 = useRef<number>(0);

    function buildInitialState(c: Config): GameState {
        const len = data[c.category].en.length;
        const n = Math.max(1, Math.min(c.count, len));
        const order = shuffle(Array.from({ length: len }, (_, i) => i)).slice(0, n);

        return {
            ...c,
            order,
            currentIndex: 0,
            seen: 0,
            correct: 0,
            showing: c.delaySec === 0, // if 0s, show immediately
            barPct: 0,
            mode: modesForCategory(c.category)[0],
            paused: false,
            finished: false,
            ...buildCard(c, order, 0),
            accuracy: 0,
        };
    }

    function buildCard(c: Config, order: number[], pointer: number) {
        const cat = data[c.category];
        const idx = order[pointer];
        const en = cat.en[idx];
        const emoji = cat.emoji?.[idx] ?? "";
        const num = idx + 1;
        const mode = modesForCategory(c.category)[0]; // lock first valid mode for simplicity

        let prompt = "—";
        let answer = "";
        switch (mode) {
            case "num-to-word":
                prompt = String(num);
                answer = en;
                break;
            case "word-to-num":
                prompt = en;
                answer = String(num);
                break;
            case "emoji-to-word":
                prompt = emoji || "—";
                answer = en;
                break;
            case "word-to-emoji":
                prompt = en;
                answer = emoji || "—";
                break;
        }
        return { prompt, answer, mode };
    }

    const actions: Ctx["actions"] = {
        configure(p) {
            setCfg((prev) => {
                const merged = { ...prev, ...p };
                // clamp count to category length
                const len = data[merged.category].en.length;
                merged.count = Math.max(1, Math.min(merged.count, len));
                return merged;
            });
        },
        startNewRound() {
            setState(buildInitialState({ ...cfg }));
        },
        startTimer() {
            actions.stopTimer();
            if (state.delaySec <= 0 || state.paused || state.finished) return;
            const total = state.delaySec * 1000;
            t0.current = Date.now();
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - t0.current;
                const pct = Math.min(100, (elapsed / total) * 100);
                setState((s) => ({ ...s, barPct: pct, showing: elapsed >= total ? true : s.showing }));
                if (elapsed >= total) actions.stopTimer();
            }, 50);
        },
        stopTimer() {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        },
        togglePause() {
            setState((s) => ({ ...s, paused: !s.paused }));
        },
        mark(good) {
            // ensure answer is visible
            setState((s) => {
                const seen = s.seen + 1;
                const correct = good ? s.correct + 1 : s.correct;
                const accuracy = Math.round((correct / seen) * 100);

                const last = s.currentIndex >= s.order.length - 1;
                if (last) {
                    return {
                        ...s,
                        showing: true,
                        seen,
                        correct,
                        accuracy,
                        finished: true,
                        barPct: 100,
                    };
                }
                const nextIndex = s.currentIndex + 1;
                const next = buildCard(s, s.order, nextIndex);
                return {
                    ...s,
                    currentIndex: nextIndex,
                    seen,
                    correct,
                    accuracy,
                    showing: s.delaySec === 0, // immediate show if 0
                    barPct: 0,
                    prompt: next.prompt,
                    answer: next.answer,
                    mode: next.mode,
                };
            });

            // after we update to next card, restart timer
            setTimeout(() => {
                actions.stopTimer();
                actions.startTimer();
            }, 50);
        },
    };

    const value = useMemo<Ctx>(
        () => ({ state, actions }),
        [state, cfg]
    );

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
    return ctx;
}