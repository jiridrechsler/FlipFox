import React, { createContext, useContext, useMemo, useRef, useState } from "react";

// ===== DATA (English only; add more categories freely) =====
type Category = { ordered?: boolean; en: string[]; emoji?: string[]; };
export const data: Record<string, Category> = {
    days: { ordered: true, en: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
    months: { ordered: true, en: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
    seasons: { ordered: true, en: ["Spring","Summer","Autumn","Winter"], emoji: ["🌱","☀️","🍂","❄️"] },
    colors: { en: ["red","blue","green","yellow","black","white","orange","purple","pink","brown","gray"], emoji: ["🔴","🔵","🟢","🟡","⚫","⚪","🟠","🟣","🌸","🤎","⬜"] },
    animals: { en: ["dog","cat","horse","cow","sheep","pig","chicken","duck","bird","fish"], emoji: ["🐶","🐱","🐴","🐮","🐑","🐷","🐔","🦆","🐦","🐟"] },
    food: { en: ["apple","banana","carrot","bread","cheese","egg","rice","pizza","burger","milk"], emoji: ["🍎","🍌","🥕","🍞","🧀","🥚","🍚","🍕","🍔","🥛"] },
};

// ===== HELPERS =====
const shuffle = (a: number[]) => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
};
type Mode = "num-to-word" | "word-to-num" | "emoji-to-word" | "word-to-emoji";
function modesForCat(cat: Category): Mode[] {
    const out: Mode[] = [];
    if (cat.ordered) out.push("num-to-word","word-to-num");
    if (cat.emoji) out.push("emoji-to-word","word-to-emoji");
    if (out.length===0) out.push("num-to-word","word-to-num");
    return out;
}
type PoolItem = { catKey: string; idx: number };
function buildPool(category: string): PoolItem[] {
    const items: PoolItem[] = [];
    const addCat = (key: string) => { const cat = data[key]; for (let i=0;i<cat.en.length;i++) items.push({catKey:key, idx:i}); };
    if (category === "all") Object.keys(data).forEach(addCat); else addCat(category);
    return items;
}
function buildOrder(count: number, poolLen: number): number[] {
    if (poolLen===0) return [];
    const base = shuffle(Array.from({length: poolLen}, (_,i)=>i));
    if (count <= poolLen) return base.slice(0,count);
    const out: number[] = [];
    while (out.length < count) out.push(...shuffle(base));
    return out.slice(0,count);
}

// ===== STATE =====
type Config = { category: "all" | keyof typeof data; delaySec: number; count: number; };

type GameState = Config & {
    pool: PoolItem[]; order: number[]; currentIndex: number;
    seen: number; correct: number; showing: boolean; barPct: number;
    paused: boolean; finished: boolean;
    // hold phase after marking
    holding: boolean;
    // current card
    prompt: string; answer: string;
    // stats
    accuracy: number;
    // last choice for correction
    lastChoice?: { poolIndex: number; good: boolean };
};

type Ctx = {
    state: GameState;
    actions: {
        configure(p: Partial[Config]): void;
        startNewRound(): void;
        startTimer(): void;
        stopTimer(): void;
        togglePause(): void;
        mark(good: boolean): void;     // shows answer, starts 2s hold, then advance
        continueNow(): void;           // skip remaining hold and advance immediately
        changeLastToWrong(): void;     // if last was marked good, flip it to wrong
    };
};

const GameContext = createContext<Ctx | null>(null);

function buildCardFor(poolItem: PoolItem): { prompt: string; answer: string; pref: Mode } {
    const cat = data[poolItem.catKey];
    const en = cat.en[poolItem.idx];
    const emoji = cat.emoji?.[poolItem.idx] ?? "";
    const num = poolItem.idx + 1;
    const pref = modesForCat(cat)[0];
    switch (pref) {
        case "emoji-to-word": return { prompt: emoji || "—", answer: en, pref };
        case "word-to-emoji": return { prompt: en, answer: emoji || "—", pref };
        case "word-to-num":   return { prompt: en, answer: String(num), pref };
        case "num-to-word":
        default:              return { prompt: String(num), answer: en, pref };
    }
}

function buildInitialState(cfg: Config): GameState {
    const pool = buildPool(cfg.category);
    const order = buildOrder(cfg.count, pool.length);
    const firstPoolIndex = order[0] ?? 0;
    const first = buildCardFor(pool[firstPoolIndex] ?? {catKey:"days", idx:0});
    return {
        ...cfg, pool, order, currentIndex: 0,
        seen: 0, correct: 0, showing: cfg.delaySec === 0, barPct: 0,
        paused: false, finished: false, holding: false,
        prompt: first.prompt, answer: first.answer, accuracy: 0,
    };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [cfg, setCfg] = useState<Config>({ category: "all", delaySec: 2, count: 30 });
    const [state, setState] = useState<GameState>(() => buildInitialState(cfg));

    const timerRef = useRef<NodeJS.Timer | null>(null);
    const holdRef  = useRef<NodeJS.Timeout | null>(null);
    const t0 = useRef<number>(0);

    const clearHold = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };

    const advance = () => {
        setState((s) => {
            if (s.finished) return s;
            const last = s.currentIndex >= s.order.length - 1;
            if (last) {
                return { ...s, holding: false, finished: true, barPct: 100 };
            }
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
                // keep lastChoice for potential immediate correction of previous, then it will shift naturally
            };
        });
    };

    const actions: Ctx["actions"] = {
        configure(p) { setCfg((prev) => ({ ...prev, ...p })); },
        startNewRound() { setState(buildInitialState({ ...cfg })); },

        startTimer() {
            actions.stopTimer();
            if (state.delaySec <= 0 || state.paused || state.finished || state.holding) return;
            const total = state.delaySec * 1000;
            t0.current = Date.now();
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - t0.current;
                const pct = Math.min(100, (elapsed / total) * 100);
                setState((s) => ({ ...s, barPct: pct, showing: elapsed >= total ? true : s.showing }));
                if (elapsed >= total) actions.stopTimer();
            }, 50);
        },
        stopTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } },

        togglePause() { setState((s) => ({ ...s, paused: !s.paused })); },

        mark(good) {
            // stop reveal timer, show the answer, start a 2s hold
            actions.stopTimer();
            clearHold();
            setState((s) => {
                const poolIndex = s.order[s.currentIndex];
                const seen = s.seen + 1;
                const correct = good ? s.correct + 1 : s.correct;
                const accuracy = Math.round((correct / seen) * 100);
                return {
                    ...s,
                    showing: true,                      // show answer immediately
                    holding: true,                      // enter hold phase
                    seen, correct, accuracy,
                    lastChoice: { poolIndex, good },
                };
            });

            holdRef.current = setTimeout(() => {
                clearHold();
                advance();
                setTimeout(() => actions.startTimer(), 50);
            }, 2000); // 2 seconds
        },

        continueNow() {
            // skip the remaining hold and advance immediately
            clearHold();
            advance();
            setTimeout(() => actions.startTimer(), 50);
        },

        changeLastToWrong() {
            setState((s) => {
                if (!s.lastChoice || !s.lastChoice.good) return s; // only if last was marked good
                const correct = Math.max(0, s.correct - 1);
                const accuracy = s.seen ? Math.round((correct / s.seen) * 100) : 0;
                return { ...s, correct, accuracy, lastChoice: { ...s.lastChoice, good: false } };
            });
        },
    };

    const value = useMemo(() => ({ state, actions }), [state, cfg]);
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
    return ctx;
}