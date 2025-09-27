import React, {createContext, useContext, useMemo, useRef, useState, useEffect} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== DATA =====
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
    drinks: {
        en: ["water","coffee","tea","milk","juice","soda","beer","wine","champagne","cocktail","martini","smoothie","energy drink","hot chocolate","sparkling water"],
        emoji: ["💧","☕","🍵","🥛","🧃","🥤","🍺","🍷","🍾","🍹","🍸","🧋","⚡","🍫","💦"]
    },
    vegetables: {
        en: ["carrot","tomato","potato","corn","cucumber","eggplant","broccoli","pepper","mushroom","garlic","onion","lettuce","pumpkin","peas","sweet potato","olives","ginger","avocado","spinach","cabbage"],
        emoji: ["🥕","🍅","🥔","🌽","🥒","🍆","🥦","🌶️","🍄","🧄","🧅","🥬","🎃","🫛","🍠","🫒","🫚","🥑","🥬","🥬"]
    },
    clothing: {
        en: ["shirt","pants","shorts","dress","skirt","coat","jacket","shoes","boots","sneakers","high heels","hat","cap","socks","gloves","scarf","belt","tie","swimsuit","backpack","bag","glasses","watch","ring","umbrella"],
        emoji: ["👕","👖","🩳","👗","👗","🧥","🧥","👟","🥾","👟","👠","👒","🧢","🧦","🧤","🧣","🧷","👔","🩱","🎒","👜","👓","⌚","💍","☂️"]
    },
    household: {
        en: ["bed","sofa","chair","table","lamp","door","window","shower","toilet","bathtub","mirror","carpet","clock","bookshelf","cup","plate","fork","knife","spoon","broom","bucket","sponge","soap","trash can","vacuum"],
        emoji: ["🛏️","🛋️","🪑","🍽️","💡","🚪","🪟","🚿","🚽","🛁","🪞","🧶","⏰","📚","☕","🍽️","🍴","🔪","🥄","🧹","🪣","🧽","🧼","🗑️","🧹"]
    },
    body: {
        en: ["head","hair","face","eye","ear","nose","mouth","tooth","tongue","neck","shoulder","arm","hand","finger","chest","back","belly","leg","knee","foot","toe","heart","brain","skin","bone"],
        emoji: ["🙂","💇","🙂","👁️","👂","👃","👄","🦷","👅","🦴","💪","💪","✋","☝️","🫁","🦴","🫃","🦵","🦵","🦶","🦶","❤️","🧠","🧴","🦴"]
    },
    transportation: {
        en: ["car","bus","tram","train","subway","airplane","helicopter","ship","boat","bicycle","motorbike","scooter","rocket","taxi","truck","fire engine","police car","ambulance","railway","station"],
        emoji: ["🚗","🚌","🚊","🚆","🚇","✈️","🚁","🚢","⛵","🚲","🏍️","🛵","🚀","🚕","🚚","🚒","🚓","🚑","🛤️","🚉"]
    },
    sports: {
        en: ["soccer","basketball","tennis","baseball","volleyball","rugby","american football","golf","table tennis","badminton","hockey","ice skating","swimming","cycling","running","skiing","snowboarding","boxing","karate","weightlifting"],
        emoji: ["⚽","🏀","🎾","⚾","🏐","🏉","🏈","⛳","🏓","🏸","🏒","⛸️","🏊","🚴","🏃","🎿","🏂","🥊","🥋","🏋️"]
    },
    directions: {
        en: ["up","down","left","right","forward","back","north","south","east","west"],
        emoji: ["⬆️","⬇️","⬅️","➡️","⏩","⏪","🧭","🧭","➡️","⬅️"]
    },
    weather: {
        en: ["sunny","cloudy","rainy","snowy","stormy","windy","foggy","hot","cold","warm","thunder","hail","drizzle","overcast","clear"],
        emoji: ["☀️","☁️","🌧️","❄️","⛈️","💨","🌫️","🔥","🥶","🙂","⚡","🌨️","🌦️","☁️","🌞"]
    },
    technology: {
        en: ["computer","laptop","keyboard","mouse","monitor","smartphone","tablet","camera","tv","headphones","speaker","battery","plug","light bulb","printer","hard drive","usb","satellite","robot","drone"],
        emoji: ["🖥️","💻","⌨️","🖱️","🖥️","📱","📱","📷","📺","🎧","🔊","🔋","🔌","💡","🖨️","💽","🔌","🛰️","🤖","🛸"]
    },
    nature: {
        en: ["tree","flower","leaf","cactus","mushroom","mountain","river","ocean","sun","moon","star","cloud","rain","snow","fire","rock","volcano","desert","island","rainbow"],
        emoji: ["🌳","🌸","🍃","🌵","🍄","⛰️","🏞️","🌊","☀️","🌙","⭐","☁️","🌧️","❄️","🔥","🪨","🌋","🏜️","🏝️","🌈"]
    },
    professions: {
        en: ["teacher","student","doctor","nurse","engineer","programmer","designer","chef","waiter","driver","farmer","police officer","firefighter","pilot","artist","musician","actor","writer","journalist","photographer","dentist","mechanic","electrician","plumber","architect","lawyer","judge","scientist","cashier","manager"],
        emoji: ["🧑‍🏫","🧑‍🎓","🧑‍⚕️","🧑‍⚕️","🧑‍🔧","💻","🎨","🧑‍🍳","🧑‍🍳","🚗","👩‍🌾","👮","👩‍🚒","🧑‍✈️","🎨","🎵","🎭","✍️","📰","📷","🦷","🧰","🔌","🔧","📐","⚖️","⚖️","🔬","💳","👔"]
    },
    countries_europe: {
        en: ["Czechia","Slovakia","Poland","Germany","Austria","Hungary","France","Spain","Italy","Portugal","Netherlands","Belgium","Switzerland","Sweden","Norway","Denmark","Finland","Greece","Ireland","United Kingdom"],
        emoji: ["🇨🇿","🇸🇰","🇵🇱","🇩🇪","🇦🇹","🇭🇺","🇫🇷","🇪🇸","🇮🇹","🇵🇹","🇳🇱","🇧🇪","🇨🇭","🇸🇪","🇳🇴","🇩🇰","🇫🇮","🇬🇷","🇮🇪","🇬🇧"]
    }
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
function getFirstMode(cat: Category): Mode {
    return modesForCat(cat)[0];
}

type CatKey = keyof typeof data;

function modesForCatKey(catKey: CatKey): Mode[] {
    const cat = data[catKey];
    const out: Mode[] = [];
    if (cat.ordered) out.push("num-to-word", "word-to-num");
    if (cat.emoji) out.push("emoji-to-word", "word-to-emoji");
    if (out.length === 0) out.push("num-to-word", "word-to-num");
    return out;
}

function getFirstModeKey(catKey: CatKey): Mode {
    return modesForCatKey(catKey)[0];
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

// ===== PERSISTENT SETTINGS =====
type Settings = {
    category: keyof typeof data;
    delaySec: number;
    count: number;
    mode: Mode;
};

type Statistics = {
    totalGames: number;
    totalCorrect: number;
    totalSeen: number;
    bestAccuracy: number;
    categoryStats: Record<string, { games: number; correct: number; seen: number }>;
};

// ===== STATE =====
type GameState = {
    // Settings (persistent)
    settings: Settings;
    statistics: Statistics;

    // Game state
    pool: PoolItem[];
    order: number[];
    currentIndex: number;
    seen: number;
    correct: number;
    accuracy: number;
    prompt: string;
    answer: string;
    showing: boolean;
    barPct: number;
    paused: boolean;
    finished: boolean;
    holding: boolean;
    holdPct: number;
    lastChoice?: { poolIndex: number; good: boolean };

    // UI state
    gameActive: boolean;
    showingResults: boolean;
};

type Ctx = {
    state: GameState;
    actions: {
        updateSettings(settings: Partial<Settings>): void;
        startNewGame(): void;
        startTimer(): void;
        stopTimer(): void;
        togglePause(): void;
        endGame(): void;
        mark(good: boolean): void;
        continueNow(): void;
        changeLastToWrong(): void;
        dismissResults(): void;
        resetStatistics(): void;
    };
};

const GameContext = createContext<Ctx | null>(null);

function buildCardFor(poolItem: PoolItem, mode: Mode) {
    const cat = data[poolItem.catKey];
    const en = cat.en[poolItem.idx];
    const emoji = cat.emoji?.[poolItem.idx] ?? "";
    const num = poolItem.idx + 1;

    switch (mode) {
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

const defaultSettings: Settings = {
    category: "days",
    delaySec: 2,
    count: 10,
    mode: "num-to-word"
};

const defaultStatistics: Statistics = {
    totalGames: 0,
    totalCorrect: 0,
    totalSeen: 0,
    bestAccuracy: 0,
    categoryStats: {}
};

function buildInitialGameState(settings: Settings): Omit<GameState, 'settings' | 'statistics'> {
    const pool = buildPool(settings.category);
    const order = buildOrder(settings.count, pool.length);
    const firstPoolIndex = order[0] ?? 0;
    const first = buildCardFor(pool[firstPoolIndex] ?? {catKey: "days", idx: 0}, settings.mode);

    return {
        pool,
        order,
        currentIndex: 0,
        seen: 0,
        correct: 0,
        accuracy: 0,
        prompt: first.prompt,
        answer: first.answer,
        showing: settings.delaySec === 0,
        barPct: 0,
        paused: false,
        finished: false,
        holding: false,
        holdPct: 0,
        gameActive: false,
        showingResults: false,
    };
}

export function GameProvider({children}: { children: React.ReactNode }) {
    const [state, setState] = useState<GameState>(() => ({
        settings: defaultSettings,
        statistics: defaultStatistics,
        ...buildInitialGameState(defaultSettings)
    }));

    const revealTimerRef = useRef<NodeJS.Timer | null>(null);
    const holdTimerRef = useRef<NodeJS.Timer | null>(null);
    const holdEndRef = useRef<NodeJS.Timeout | null>(null);

    // Load persistent data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [settingsData, statsData] = await Promise.all([
                    AsyncStorage.getItem('flipfox_settings'),
                    AsyncStorage.getItem('flipfox_statistics')
                ]);

                const settings = settingsData ? JSON.parse(settingsData) : defaultSettings;
                const statistics = statsData ? JSON.parse(statsData) : defaultStatistics;

                setState(prev => ({
                    ...prev,
                    settings,
                    statistics,
                    ...buildInitialGameState(settings)
                }));
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };
        loadData();
    }, []);

    // Save settings when they change
    const saveSettings = async (settings: Settings) => {
        const catKey: CatKey = settings.category;

        const next: Settings = {
            ...settings,
            mode: getFirstModeKey(catKey), // ⬅️ pick mode from the key
        };

        try {
            await AsyncStorage.setItem('flipfox_settings', JSON.stringify(next));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    // Save statistics when they change
    const saveStatistics = async (statistics: Statistics) => {
        try {
            await AsyncStorage.setItem('flipfox_statistics', JSON.stringify(statistics));
        } catch (error) {
            console.error('Failed to save statistics:', error);
        }
    };

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
            if (last) {
                // Game finished - update statistics
                const newStats = {
                    ...s.statistics,
                    totalGames: s.statistics.totalGames + 1,
                    totalCorrect: s.statistics.totalCorrect + s.correct,
                    totalSeen: s.statistics.totalSeen + s.seen,
                    bestAccuracy: Math.max(s.statistics.bestAccuracy, s.accuracy),
                    categoryStats: {
                        ...s.statistics.categoryStats,
                        [s.settings.category]: {
                            games: (s.statistics.categoryStats[s.settings.category]?.games || 0) + 1,
                            correct: (s.statistics.categoryStats[s.settings.category]?.correct || 0) + s.correct,
                            seen: (s.statistics.categoryStats[s.settings.category]?.seen || 0) + s.seen,
                        }
                    }
                };
                saveStatistics(newStats);
                return {
                    ...s,
                    holding: false,
                    holdPct: 0,
                    finished: true,
                    barPct: 100,
                    showingResults: true,
                    statistics: newStats
                };
            }

            const nextIndex = s.currentIndex + 1;
            const nextPoolIndex = s.order[nextIndex];
            const next = buildCardFor(s.pool[nextPoolIndex], s.settings.mode);
            return {
                ...s,
                currentIndex: nextIndex,
                prompt: next.prompt,
                answer: next.answer,
                showing: s.settings.delaySec === 0,
                barPct: 0,
                holding: false,
                holdPct: 0,
            };
        });
    };

    const actions: Ctx["actions"] = {
        updateSettings(newSettings) {
            setState((prev) => {
                const updatedSettings = {...prev.settings, ...newSettings};
                saveSettings(updatedSettings);
                return {
                    ...prev,
                    settings: updatedSettings,
                    ...buildInitialGameState(updatedSettings)
                };
            });
        },

        startNewGame() {
            setState((prev) => ({
                ...prev,
                ...buildInitialGameState(prev.settings),
                gameActive: true,
                showingResults: false
            }));
        },

        startTimer() {
            if (state.settings.delaySec <= 0 || state.paused || state.finished || state.holding) return;
            stopRevealTimer();
            const total = state.settings.delaySec * 1000;
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

        endGame() {
            stopRevealTimer();
            stopHoldTimers();
            setState((s) => ({...s, finished: true, holding: false, holdPct: 0, showingResults: true}));
        },

        mark(good) {
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

            const HOLD_MS = 1500;
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

        dismissResults() {
            setState((s) => ({...s, showingResults: false, gameActive: false}));
        },

        resetStatistics() {
            const newStats = defaultStatistics;
            saveStatistics(newStats);
            setState((s) => ({...s, statistics: newStats}));
        }
    };

    const value = useMemo(() => ({state, actions}), [state]);
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
    return ctx;
}