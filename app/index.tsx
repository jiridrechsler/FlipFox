import React, {useMemo, useState} from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable, TextInput} from "react-native";
import {Picker} from "@react-native-picker/picker";
import {useRouter} from "expo-router";
import {useGame, data} from "../src/store";
import {useWindowDimensions} from "react-native";

export default function ConfigScreen() {
    const {width} = useWindowDimensions();
    const isWide = width >= 700;
    const router = useRouter();
    const {state, actions} = useGame();

    const categories = useMemo(() => Object.keys(data) as (keyof typeof data)[], []);
    const [category, setCategory] = useState<keyof typeof data>(state.category);

    const [countStr, setCountStr] = useState(String(state.count || 30));
    const [speedStr, setSpeedStr] = useState(String(state.delaySec ?? 2));

    const count = Number.parseInt(countStr, 10);
    const speed = Number.parseFloat(speedStr);

    const countValid = Number.isFinite(count) && count >= 1 && count <= 500;
    const speedValid = Number.isFinite(speed) && speed >= 0 && speed <= 10;
    const canStart = countValid && speedValid;

    const onCountBlur = () => {
        if (!Number.isFinite(count)) {
            setCountStr("30");
            return;
        }
        const c = Math.min(500, Math.max(1, Math.round(count)));
        setCountStr(String(c));
    };
    const onSpeedBlur = () => {
        if (!Number.isFinite(speed)) {
            setSpeedStr("2");
            return;
        }
        const s = Math.min(10, Math.max(0, Math.round(speed * 10) / 10));
        setSpeedStr(String(s));
    };

    const start = () => {
        if (!canStart) return;
        actions.configure({category, delaySec: Number(speedStr), count: Number(countStr)});
        actions.startNewRound();
        router.push("/game");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.card, {maxWidth: isWide ? 900 : undefined}]}>
                <Text style={styles.intro}>
                    Welcome to FlipFox — your playful companion for fast and fun memory training!
                    Pick a category, set your pace, and start flipping your way to better recall.
                </Text>

                {/* Category */}
                <View style={styles.block}>
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
                    {/* Auto-reveal speed */}
                    <View style={[styles.block, styles.flex1]}>
                        <Text style={styles.label}>Auto-reveal speed (seconds)</Text>
                        <TextInput
                            value={speedStr}
                            onChangeText={setSpeedStr}
                            onBlur={onSpeedBlur}
                            keyboardType="decimal-pad"
                            inputMode="decimal"
                            placeholder="2"
                            placeholderTextColor="#64748b"
                            style={[styles.input, !speedValid && styles.inputError]}
                        />
                        <Text style={styles.hint}>
                            0 = show the answer immediately. Higher = wait longer before revealing (max 10s).
                        </Text>
                        {!speedValid && (
                            <Text style={styles.error}>Please enter a number between 0 and 10 (e.g., 1.5).</Text>
                        )}
                    </View>

                    {/* Number of words */}
                    <View style={[styles.block, styles.flex1]}>
                        <Text style={styles.label}>Number of words</Text>
                        <TextInput
                            value={countStr}
                            onChangeText={(t) => setCountStr(t.replace(/[^0-9]/g, ""))}
                            onBlur={onCountBlur}
                            keyboardType="number-pad"
                            inputMode="numeric"
                            placeholder="30"
                            placeholderTextColor="#64748b"
                            style={[styles.input, !countValid && styles.inputError]}
                        />
                        <Text style={styles.hint}>
                            Total cards in this round (1–500). If the category has fewer, they repeat in shuffled order.
                        </Text>
                        {!countValid && (
                            <Text style={styles.error}>Please enter an integer between 1 and 500.</Text>
                        )}
                    </View>
                </View>

                <View style={styles.buttonsRow}>
                    <Btn title="Start" primary onPress={start} disabled={!canStart}/>
                </View>
            </View>
        </SafeAreaView>
    );
}

function Btn({
                 title, onPress, primary, disabled,
             }: { title: string; onPress: () => void; primary?: boolean; disabled?: boolean }) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            style={({pressed}) => [
                styles.btn,
                primary && styles.btnPrimary,
                disabled && styles.btnDisabled,
                pressed && !disabled && {transform: [{translateY: 1}]},
            ]}
        >
            <Text style={[styles.btnText, disabled && {opacity: 0.7}]}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({

    safe: {flex: 1, backgroundColor: "#0b1025", alignItems: "center"},
    card: {
        backgroundColor: "#111827",
        margin: 16, padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: "rgba(255,255,255,.06)",
        width: "96%",
    },
    h1: {color: "#e5e7eb", fontSize: 28, fontWeight: "800"},
    sub: {color: "#94a3b8", marginTop: 4, marginBottom: 10},

    label: {color: "#cbd5e1", marginBottom: 6, fontWeight: "600"},
    hint: {color: "#64748b", fontSize: 12, marginTop: 6, lineHeight: 18},
    error: {color: "#f87171", fontSize: 12, marginTop: 6},

    block: {marginVertical: 8},
    rowWrap: {flexDirection: "row", gap: 12, flexWrap: "wrap"},
    flex1: {flex: 1, minWidth: 220},

    input: {
        backgroundColor: "#0b1226",
        color: "#e5e7eb",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.12)",
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
    },
    inputError: {borderColor: "rgba(248,113,113,.65)"},

    buttonsRow: {marginTop: 16, alignItems: "center"},
    btn: {
        backgroundColor: "#0b1226",
        paddingVertical: 12, paddingHorizontal: 18,
        borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,.12)",
        minWidth: 160, alignItems: "center",
    },
    btnPrimary: {backgroundColor: "#0a1938", borderColor: "rgba(56,189,248,.5)"},
    btnDisabled: {opacity: 0.6},
    btnText: {color: "#e5e7eb", fontSize: 16, fontWeight: "600"},
    picker: {backgroundColor: "#0b1226", color: "#e5e7eb", borderRadius: 10},
    intro: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 10,
        lineHeight: 20,
        color: "#e5e7eb",
    },
});