import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useGame, data } from "../src/store";
import { useWindowDimensions } from "react-native";

export default function ConfigScreen() {
    const { width } = useWindowDimensions();
    const isWide = width >= 700;
    const router = useRouter();
    const { state, actions } = useGame();

    const categories = useMemo(() => Object.keys(data) as (keyof typeof data)[], []);
    const [category, setCategory] = useState<keyof typeof data>(state.category);
    const [speedSec, setSpeedSec] = useState<number>(state.delaySec);
    const [count, setCount] = useState<number>(state.count || 30);

    const start = () => {
        actions.configure({ category, delaySec: speedSec, count });
        actions.startNewRound();
        router.push("/game");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.card, { maxWidth: isWide ? 900 : undefined }]}>
                <Text style={styles.h1}>Flashcards</Text>
                <Text style={styles.sub}>Pick your practice and go</Text>

                <View className="block" style={styles.block}>
                    <Text style={styles.label}>Category</Text>
                    <Picker
                        selectedValue={category}
                        onValueChange={(v) => setCategory(v)}
                        style={styles.picker}
                    >
                        {categories.map((k) => (
                            <Picker.Item
                                key={k}
                                label={String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                value={k}
                            />
                        ))}
                    </Picker>
                </View>

                <View style={styles.rowWrap}>
                    <View style={[styles.block, styles.flex1]}>
                        <Text style={styles.label}>Auto-reveal speed</Text>
                        <Picker
                            selectedValue={String(speedSec)}
                            onValueChange={(v) => setSpeedSec(Number(v))}
                            style={styles.picker}
                        >
                            {["0","1","1.5","2","3","4"].map((s) => (
                                <Picker.Item key={s} label={`${s} s`} value={s} />
                            ))}
                        </Picker>
                        <Text style={styles.hint}>0 = show answer immediately</Text>
                    </View>

                    <View style={[styles.block, styles.flex1]}>
                        <Text style={styles.label}>Number of words</Text>
                        <Picker
                            selectedValue={String(count)}
                            onValueChange={(v) => setCount(Number(v))}
                            style={styles.picker}
                        >
                            {[10,20,30,40,50,75,100,150,200].map((n) => (
                                <Picker.Item key={n} label={`${n}`} value={String(n)} />
                            ))}
                        </Picker>
                        <Text style={styles.hint}>If larger than the category, items repeat in shuffled order.</Text>
                    </View>
                </View>

                <View style={styles.buttonsRow}>
                    <Btn title="Start" primary onPress={start} />
                </View>
            </View>
        </SafeAreaView>
    );
}

function Btn({
                 title, onPress, primary,
             }: { title: string; onPress: () => void; primary?: boolean; }) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.btn,
                primary && styles.btnPrimary,
                pressed && { transform: [{ translateY: 1 }] },
            ]}
        >
            <Text style={styles.btnText}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0b1025", alignItems: "center" },
    card: {
        backgroundColor: "#111827",
        margin: 16, padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: "rgba(255,255,255,.06)",
        width: "96%",
    },
    h1: { color: "#e5e7eb", fontSize: 28, fontWeight: "800" },
    sub: { color: "#94a3b8", marginTop: 4, marginBottom: 10 },
    label: { color: "#cbd5e1", marginBottom: 6, fontWeight: "600" },
    hint: { color: "#64748b", fontSize: 12, marginTop: 4 },
    block: { marginVertical: 8 },
    picker: { backgroundColor: "#0b1226", color: "#e5e7eb", borderRadius: 10 },
    rowWrap: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
    flex1: { flex: 1, minWidth: 220 },
    buttonsRow: { marginTop: 16, alignItems: "center" },
    btn: {
        backgroundColor: "#0b1226",
        paddingVertical: 12, paddingHorizontal: 18,
        borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,.12)",
        minWidth: 160, alignItems: "center",
    },
    btnPrimary: { backgroundColor: "#0a1938", borderColor: "rgba(56,189,248,.5)" },
    btnText: { color: "#e5e7eb", fontSize: 16, fontWeight: "600" },
});