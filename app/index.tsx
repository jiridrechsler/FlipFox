import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    Pressable,
    StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

// ========= TYPES =========
interface Category {
    ordered?: boolean;
    en: string[];
    cs: string[];
    emoji?: string[];
}

interface DataSet {
    [key: string]: Category;
}

// ========= DATA (shortened example, add all datasets you want) =========
const data: DataSet = {
    days: {
        ordered: true,
        en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        cs: ["pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota", "neděle"],
    },
    months: {
        ordered: true,
        en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
        cs: ["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"],
    },
    colors: {
        en: ["red","blue","green","yellow"],
        cs: ["červená","modrá","zelená","žlutá"],
        emoji: ["🔴","🔵","🟢","🟡"],
    },
};

// ========= HELPERS =========
const shuffle = (a: number[]): number[] => {
    const arr = [...a];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

type Mode =
    | "num-to-word"
    | "word-to-num"
    | "en-to-cs"
    | "cs-to-en"
    | "emoji-to-word"
    | "word-to-emoji";

function modesForCategory(catKey: string): { value: Mode; label: string }[] {
    const cat = data[catKey];
    const modes: { value: Mode; label: string }[] = [];

    if (cat.ordered) {
        modes.push({ value: "num-to-word", label: "Number → Word" });
        modes.push({ value: "word-to-num", label: "Word → Number" });
    }
    modes.push({ value: "en-to-cs", label: "EN → CS" });
    modes.push({ value: "cs-to-en", label: "CS → EN" });
    if (Array.isArray(cat.emoji)) {
        modes.push({ value: "emoji-to-word", label: "Emoji → Word" });
        modes.push({ value: "word-to-emoji", label: "Word → Emoji" });
    }
    return modes;
}

// ========= COMPONENT =========
export default function Index() {
    const [category, setCategory] = useState<keyof typeof data>("days");
    const [lang, setLang] = useState<"en" | "cs">("en");
    const [mode, setMode] = useState<Mode>("num-to-word");
    const [delay, setDelay] = useState<number>(2);

    const [order, setOrder] = useState<number[]>([]);
    const [pos, setPos] = useState<number>(-1);
    const [showing, setShowing] = useState<boolean>(false);
    const [seen, setSeen] = useState<number>(0);
    const [correct, setCorrect] = useState<number>(0);
    const [barPct, setBarPct] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const tStartRef = useRef<number>(0);

    const categories = useMemo(() => Object.keys(data), []);
    const modes = useMemo(() => modesForCategory(category), [category]);

    // Ensure mode is valid for category
    useEffect(() => {
        if (!modes.find((m) => m.value === mode)) {
            setMode(modes[0].value);
        }
    }, [category]);

    // Reset order when category changes
    useEffect(() => {
        const len = data[category].en.length;
        setOrder(shuffle(Array.from({ length: len }, (_, i) => i)));
        setPos(-1);
    }, [category, lang]);

    // Cleanup timer
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startTimer = (ms: number) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setBarPct(0);
        if (ms <= 0) return;
        const total = ms;
        tStartRef.current = Date.now();
        timerRef.current = setInterval(() => {
            const elapsed = Date.now() - tStartRef.current;
            const pct = Math.min(100, (elapsed / total) * 100);
            setBarPct(pct);
            if (elapsed >= total) {
                if (timerRef.current) clearInterval(timerRef.current);
                reveal();
            }
        }, 50);
    };

    const next = () => {
        const nextPos = (pos + 1) % order.length;
        setPos(nextPos);
        setShowing(false);
        setBarPct(0);
        startTimer(Math.max(0, delay * 1000));
    };

    const reveal = () => setShowing(true);

    const mark = (isCorrect: boolean) => {
        if (!showing) reveal();
        setSeen((s) => s + 1);
        if (isCorrect) setCorrect((c) => c + 1);
        setTimeout(next, 250);
    };

    // Prepare card
    const idx = order.length ? order[(pos + order.length) % order.length] : 0;
    const cat = data[category];
    const en = cat.en[idx] ?? "";
    const cs = cat.cs[idx] ?? "";
    const emoji = cat.emoji?.[idx] ?? "";
    const word = lang === "en" ? en : cs;
    const num = idx + 1;

    let prompt = "—";
    let answer = "";
    switch (mode) {
        case "num-to-word":
            prompt = String(num);
            answer = word;
            break;
        case "word-to-num":
            prompt = word;
            answer = String(num);
            break;
        case "emoji-to-word":
            prompt = emoji || "—";
            answer = word;
            break;
        case "word-to-emoji":
            prompt = word;
            answer = emoji || "—";
            break;
        case "en-to-cs":
            prompt = en;
            answer = cs;
            break;
        case "cs-to-en":
            prompt = cs;
            answer = en;
            break;
    }

    const accuracy = seen ? Math.round((correct / seen) * 100) : 0;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.card, styles.container]}>
                <Text style={styles.h1}>Flashcards — TSX</Text>

                <View style={styles.controlsRow}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(val) => setCategory(val)}
                        style={styles.picker}
                    >
                        {categories.map((k) => (
                            <Picker.Item key={k} label={k} value={k} />
                        ))}
                    </Picker>

                    <Picker
                        selectedValue={mode}
                        onValueChange={(val) => setMode(val)}
                        style={styles.picker}
                    >
                        {modes.map((m) => (
                            <Picker.Item key={m.value} label={m.label} value={m.value} />
                        ))}
                    </Picker>

                    <Picker
                        selectedValue={lang}
                        onValueChange={(val) => setLang(val)}
                        style={styles.picker}
                    >
                        <Picker.Item label="English" value="en" />
                        <Picker.Item label="Čeština" value="cs" />
                    </Picker>
                </View>

                <View style={styles.flash}>
                    <Text style={styles.big}>{prompt}</Text>
                    {showing && <Text style={styles.answer}>{answer}</Text>}
                    <View style={styles.progress}>
                        <View style={[styles.bar, { width: `${barPct}%` }]} />
                    </View>
                </View>

                <View style={styles.buttonsRow}>
                    <Btn title="Next" onPress={next} />
                    <Btn title="Reveal" onPress={reveal} />
                    <Btn title="Got it" onPress={() => mark(true)} />
                    <Btn title="Missed" onPress={() => mark(false)} />
                </View>

                <View style={styles.statsRow}>
                    <Text style={styles.stat}>Seen: {seen}</Text>
                    <Text style={styles.stat}>Correct: {correct}</Text>
                    <Text style={styles.stat}>Accuracy: {accuracy}%</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

// ========= SUB COMPONENTS =========
function Btn({ title, onPress }: { title: string; onPress: () => void }) {
    return (
        <Pressable style={styles.btn} onPress={onPress}>
            <Text style={styles.btnText}>{title}</Text>
        </Pressable>
    );
}

// ========= STYLES =========
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0b1025" },
    container: { flex: 1, justifyContent: "center" },
    card: {
        backgroundColor: "#111827",
        margin: 20,
        padding: 20,
        borderRadius: 12,
    },
    h1: { color: "#e5e7eb", fontSize: 22, fontWeight: "700", marginBottom: 12 },
    controlsRow: { flexDirection: "row", marginBottom: 12 },
    picker: { flex: 1, color: "#e5e7eb", backgroundColor: "#0b1226" },
    flash: {
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.12)",
        borderRadius: 10,
        marginBottom: 12,
    },
    big: { fontSize: 48, fontWeight: "800", color: "#e5e7eb" },
    answer: { fontSize: 24, color: "#e5e7eb", marginTop: 8 },
    progress: {
        height: 6,
        width: "100%",
        backgroundColor: "rgba(255,255,255,.06)",
        marginTop: 8,
        borderRadius: 999,
        overflow: "hidden",
    },
    bar: { height: "100%", backgroundColor: "#38bdf8" },
    buttonsRow: { flexDirection: "row", justifyContent: "space-around", marginVertical: 12 },
    btn: { padding: 10, backgroundColor: "#0a1938", borderRadius: 8 },
    btnText: { color: "#e5e7eb" },
    statsRow: { flexDirection: "row", justifyContent: "space-around" },
    stat: { color: "#94a3b8" },
});