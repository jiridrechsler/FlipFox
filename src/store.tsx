import React, {createContext, useContext, useMemo, useRef, useState} from "react";

// ===== DATA (English only; add more categories freely) =====
type Category = { ordered?: boolean; en: string[]; emoji?: string[] };
export const data: Record<string, Category> = {
    days: {ordered: true, en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]},
    months: {
        ordered: true,
        en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    seasons: {ordered: true, en: ["Spring", "Summer", "Autumn", "Winter"], emoji: ["🌱", "☀️", "🍂", "❄️"]},
    colors: {
        en: ["red", "blue", "green", "yellow", "black", "white", "orange", "purple", "pink", "brown", "gray"],
        emoji: ["🔴", "🔵", "🟢", "🟡", "⚫", "⚪", "🟠", "🟣", "🌸", "🤎", "⬜"]
    },
    animals: {
        en: ["dog", "cat", "horse", "cow", "sheep", "pig", "chicken", "duck", "bird", "fish"],
        emoji: ["🐶", "🐱", "🐴", "🐮", "🐑", "🐷", "🐔", "🦆", "🐦", "🐟"]
    },
    food: {
        en: ["apple", "banana", "carrot", "bread", "cheese", "egg", "rice", "pizza", "burger", "milk"],
        emoji: ["🍎", "🍌", "🥕", "🍞", "🧀", "🥚", "🍚", "🍕", "🍔", "🥛"]
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
type Mode = "num-to-word" | "word-to-num" | "emoji-to-word" | "word-to-emoji";

function modesForCat(cat: Category): Mode[] {
    const out: Mode[] = [];
    if (cat.ordered) out.push("num-to-word", "word-to-num");
    if (cat.emoji) out.push("emoji-to-word", "word-to-emoji");
    if (out.length === 0) out.push("num-to-word", "word-to-num");
    return out;
}

type PoolItem = { catKey: keyof typeof data; idx: number };

function buildPool(category: keyof typeof data): PoolItem[] {
    const items: PoolItem[] = [];
    const cat = data[category];
    for (let i = 0; i < cat.en.length; i++) items.push({catKey: category, idx: i});
    return items;
}

function buildOrder(count: number, poolLen: number): number[] {
    if (poolLen === 0) return [];
    const base = shuffle(Array.from({length: poolLen}, (_, i) => i));
    if (count <= poolLen) return base.slice(0, count);
    const out: number[] = [];
    while (out.length < count) out.push(...shuffle(base));
    return out.slice(0, count);
}

// ===== STATE =====
type Config = { category: keyof typeof data; delaySec: number; count: number };

type GameState = Config & {
    pool: PoolItem[]; order: number[]; currentIndex: number;
    seen: number; correct: number; accuracy: number;
    prompt: string; answer: string; showing: boolean;
    barPct: number; paused: boolean; finished: boolean;
    holding: boolean; holdPct: number;
    lastChoice?: { poolIndex: number; good: boolean };
};

type Ctx = {
    state: GameState;
    actions: {
        configure(p: Partial<Config>): void;
        startNewRound(): void;
        startTimer(): void;
        stopTimer(): void;
        togglePause(): void;
        endNow(): void;
        mark(good: boolean): void;
        continueNow(): void;
        changeLastToWrong(): void;
    };
};

const GameContext = createContext<Ctx | null>(null);

function buildCardFor(poolItem: PoolItem) {
    const cat = data[poolItem.catKey];
    const en = cat.en[poolItem.idx];
    const emoji = cat.emoji?.[poolItem.idx] ?? "";
    const num = poolItem.idx + 1;
    const pref = modesForCat(cat)[0];
    switch (pref) {
        case "emoji-to-word":
            return {prompt: emoji || "—", answer: en};
        case "word-to-emoji":
            return {prompt: en, answer: emoji || "—"};
        case "word-to-num":
            return {prompt: en, answer: String(num)};
        case "num-to-word":
        default:
            return {prompt: String(num), answer: en};
    }
}

function buildInitialState(cfg: Config): GameState {
    const pool = buildPool(cfg.category);
    const order = buildOrder(cfg.count, pool.length);
    const firstPoolIndex = order[0] ?? 0;
    const first = buildCardFor(pool[firstPoolIndex] ?? {catKey: "days", idx: 0});
    return {
        ...cfg,
        pool,
        order,
        currentIndex: 0,
        seen: 0,
        correct: 0,
        accuracy: 0,
        prompt: first.prompt,
        answer: first.answer,
        showing: cfg.delaySec === 0,
        barPct: 0,
        paused: false,
        finished: false,
        holding: false,
        holdPct: 0,
    };
}

export function GameProvider({children}: { children: React.ReactNode }) {
    const [cfg, setCfg] = useState<Config>({category: "days", delaySec: 2, count: 30});
    const [state, setState] = useState<GameState>(() => buildInitialState(cfg));

    const revealTimerRef = useRef<NodeJS.Timer | null>(null);
    const holdTimerRef = useRef<NodeJS.Timer | null>(null);
    const holdEndRef = useRef<NodeJS.Timeout | null>(null);
    const t0 = useRef<number>(0);

    const stopRevealTimer = () => {
        if (revealTimerRef.current) {
            clearInterval(revealTimerRef.current);
            revealTimerRef.current = null;
        }
    };
    const stopHoldTimers = () => {
        if (holdTimerRef.current) {
            clearInterval(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        if (holdEndRef.current) {
            clearTimeout(holdEndRef.current);
            holdEndRef.current = null;
        }
    };

    const advance = () => {
        setState((s) => {
            if (s.finished) return s;
            const last = s.currentIndex >= s.order.length - 1;
            if (last) return {...s, holding: false, holdPct: 0, finished: true, barPct: 100};
            const nextIndex = s.currentIndex + 1;
            const nextPoolIndex = s.order[nextIndex];
            const next = buildCardFor(s.pool[nextPoolIndex]);
            return {
                ...s,
                currentIndex: nextIndex,
                prompt: next.prompt,
                answer: next.answer,
                showing: s.delaySec === 0,
                barPct: 0,
                holding: false,
                holdPct: 0,
            };
        });
    };

    const actions: Ctx["actions"] = {
        configure(p) {
            setCfg((prev) => ({...prev, ...p}));
        },

        startNewRound() {
            setState(buildInitialState({...cfg}));
        },

        startTimer() {
            if (state.delaySec <= 0 || state.paused || state.finished || state.holding) return;
            stopRevealTimer();
            const total = state.delaySec * 1000;
            const start = Date.now();
            revealTimerRef.current = setInterval(() => {
                const elapsed = Date.now() - start;
                const pct = Math.min(100, (elapsed / total) * 100);
                setState((s) => ({...s, barPct: pct, showing: elapsed >= total ? true : s.showing}));
                if (elapsed >= total) {
                    stopRevealTimer();
                }
            }, 50);
        },

        stopTimer() {
            stopRevealTimer();
        },

        togglePause() {
            setState((s) => ({...s, paused: !s.paused}));
            stopRevealTimer();
            stopHoldTimers();
        },

        endNow() {
            stopRevealTimer();
            stopHoldTimers();
            setState((s) => ({...s, finished: true, holding: false, holdPct: 0}));
        },

        mark(good) {
            // show answer, enter 1s hold
            stopRevealTimer();
            stopHoldTimers();

            setState((s) => {
                const poolIndex = s.order[s.currentIndex];
                const seen = s.seen + 1;
                const correct = good ? s.correct + 1 : s.correct;
                const accuracy = Math.round((correct / seen) * 100);
                return {
                    ...s,
                    showing: true,
                    holding: true,
                    holdPct: 0,
                    seen,
                    correct,
                    accuracy,
                    lastChoice: {poolIndex, good}
                };
            });

            const HOLD_MS = 1000;
            const start = Date.now();
            holdTimerRef.current = setInterval(() => {
                const pct = Math.min(100, ((Date.now() - start) / HOLD_MS) * 100);
                setState((s) => ({...s, holdPct: pct}));
            }, 50);

            holdEndRef.current = setTimeout(() => {
                stopHoldTimers();
                advance();
                setTimeout(() => actions.startTimer(), 50);
            }, HOLD_MS);
        },

        continueNow() {
            stopHoldTimers();
            advance();
            setTimeout(() => actions.startTimer(), 50);
        },

        changeLastToWrong() {
            setState((s) => {
                if (!s.lastChoice || !s.lastChoice.good) return s;
                const correct = Math.max(0, s.correct - 1);
                const accuracy = s.seen ? Math.round((correct / s.seen) * 100) : 0;
                return {...s, correct, accuracy, lastChoice: {...s.lastChoice, good: false}};
            });
        },
    };

    const value = useMemo(() => ({state, actions}), [state, cfg]);
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
    return ctx;
}