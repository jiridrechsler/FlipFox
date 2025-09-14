import React, { useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useGame } from "../src/store";
import { useWindowDimensions } from "react-native";

export default function GameScreen() {
    const { width, height } = useWindowDimensions();
    const isWide = width >= 700;
    const router = useRouter();
    const { state, actions } = useGame();

    // progress timer
    useEffect(() => {
        if (state.paused) return;
        actions.startTimer();
        return actions.stopTimer;
    }, [state.currentIndex, state.paused, state.delaySec]);

    useEffect(() => {
        if (state.finished) router.replace("/end");
    }, [state.finished]);

    const fontPrompt = Math.max(40, Math.min(80, Math.floor(width / 8)));
    const fontAnswer = Math.max(20, Math.min(40, Math.floor(width / 18)));

    return (
        <SafeAreaView style={styles.safe}>
            <View style={[styles.card, { maxWidth: isWide ? 900 : undefined }]}>
                {/* Top bar */}
                <View style={styles.topRow}>
                    <Pressable
                        onPress={() => actions.togglePause()}
                        style={[styles.smallBtn, state.paused && styles.smallBtnActive]}
                    >
                        <Text style={styles.smallBtnText}>{state.paused ? "Resume" : "Pause"}</Text>
                    </Pressable>

                    <Link href="/" asChild>
                        <Pressable style={styles.smallBtn}>
                            <Text style={styles.smallBtnText}>Config</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Flash area */}
                <View style={styles.flash}>
                    <Text style={[styles.prompt, { fontSize: fontPrompt }]} selectable>
                        {state.prompt}
                    </Text>
                    {state.showing && (
                        <Text style={[styles.answer, { fontSize: fontAnswer }]} selectable>
                            {state.answer}
                        </Text>
                    )}
                    <View style={styles.progress}>
                        <View style={[styles.bar, { width: `${state.barPct}%` }]} />
                    </View>
                </View>

                {/* Big buttons */}
                <View
                    style={[
                        styles.bigButtons,
                        { flexDirection: isWide ? "row" : "column" },
                    ]}
                >
                    <BigBtn
                        title="Got it ✓"
                        onPress={() => actions.mark(true)}
                        good
                    />
                    <BigBtn
                        title="Missed ✗"
                        onPress={() => actions.mark(false)}
                        bad
                    />
                </View>

                {/* Stats row */}
                <View style={styles.statsRow}>
                    <Stat label="Seen" value={String(state.seen)} />
                    <Stat label="Correct" value={String(state.correct)} />
                    <Stat label="Accuracy" value={`${state.accuracy}%`} />
                    <Stat label="Card" value={`${state.currentIndex + 1}/${state.order.length}`} />
                </View>

                {state.paused && (
                    <View style={styles.pausedOverlay}>
                        <Text style={styles.pausedText}>Paused</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

function BigBtn({
                    title,
                    onPress,
                    good,
                    bad,
                }: {
    title: string;
    onPress: () => void;
    good?: boolean;
    bad?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.bigBtn,
                good && styles.bigBtnGood,
                bad && styles.bigBtnBad,
                pressed && { transform: [{ translateY: 1 }] },
            ]}
        >
            <Text style={styles.bigBtnText}>{title}</Text>
        </Pressable>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.pill}>
            <Text style={styles.pillText}>
                {label}: <Text style={{ color: "#e5e7eb" }}>{value}</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#0b1025", alignItems: "center" },
    card: {
        backgroundColor: "#111827",
        margin: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.06)",
        width: "96%",
        overflow: "hidden",
    },
    topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
    smallBtn: {
        backgroundColor: "#0b1226",
        borderColor: "rgba(255,255,255,.12)",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    smallBtnActive: { backgroundColor: "#102650", borderColor: "rgba(56,189,248,.5)" },
    smallBtnText: { color: "#e5e7eb", fontWeight: "600" },

    flash: {
        alignItems: "center",
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.12)",
        borderRadius: 12,
        marginBottom: 12,
        minHeight: 180,
    },
    prompt: { color: "#e5e7eb", fontWeight: "800", textAlign: "center" },
    answer: { color: "#e5e7eb", marginTop: 8, opacity: 0.95, textAlign: "center" },

    progress: {
        height: 6,
        width: "100%",
        backgroundColor: "rgba(255,255,255,.06)",
        marginTop: 12,
        borderRadius: 999,
        overflow: "hidden",
    },
    bar: { height: "100%", backgroundColor: "#38bdf8" },

    bigButtons: { gap: 12, justifyContent: "center", alignItems: "stretch" },
    bigBtn: {
        backgroundColor: "#0b1226",
        borderColor: "rgba(255,255,255,.12)",
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    bigBtnGood: { borderColor: "rgba(52,211,153,.5)" },
    bigBtnBad: { borderColor: "rgba(248,113,113,.5)" },
    bigBtnText: { color: "#e5e7eb", fontSize: 20, fontWeight: "700" },

    statsRow: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        marginTop: 12,
    },
    pill: {
        borderColor: "rgba(255,255,255,.1)",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    pillText: { color: "#94a3b8", fontSize: 12 },

    pausedOverlay: {
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(0,0,0,.45)",
        alignItems: "center",
        justifyContent: "center",
    },
    pausedText: { color: "#e5e7eb", fontSize: 28, fontWeight: "800" },
});