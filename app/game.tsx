import React, {useEffect} from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable} from "react-native";
import {useRouter} from "expo-router";
import {useGame} from "../src/store";
import {useWindowDimensions} from "react-native";

export default function GameScreen() {
    const {width} = useWindowDimensions();
    const isWide = width >= 700;
    const router = useRouter();
    const {state, actions} = useGame();

    useEffect(() => {
        if (state.paused || state.holding) return;
        actions.startTimer();
        return actions.stopTimer;
    }, [state.currentIndex, state.paused, state.delaySec, state.holding]);

    useEffect(() => {
        if (state.finished) router.replace("/end");
    }, [state.finished]);

    const fontPrompt = Math.max(40, Math.min(80, Math.floor(width / 8)));
    const fontAnswer = Math.max(20, Math.min(40, Math.floor(width / 18)));

    const isHoldPhase = state.holding;

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.card}>
                {/* Top bar (Pause left; radial timer badge right during hold) */}
                <View style={styles.topRow}>
                    <Pressable
                        onPress={() => actions.togglePause()}
                        style={[styles.smallBtn, state.paused && styles.smallBtnActive]}
                    >
                        <Text style={styles.smallBtnText}>{state.paused ? "Resume" : "Pause"}</Text>
                    </Pressable>

                    {/* Circular hold indicator (top-right) */}
                    {isHoldPhase && (
                        <View style={styles.ringWrap} accessibilityLabel="hold timer">
                            <View style={styles.ringOuter}>
                                <View style={[styles.ringFill, {width: `${state.holdPct}%`}]}/>
                                <Text style={styles.ringText}>
                                    {Math.max(0, 100 - Math.round(state.holdPct))}%
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Flash / canvas */}
                <View style={styles.flash}>
                    <Text style={[styles.prompt, {fontSize: fontPrompt}]} selectable>
                        {state.prompt}
                    </Text>
                    {state.showing && (
                        <Text style={[styles.answer, {fontSize: fontAnswer}]} selectable>
                            {state.answer}
                        </Text>
                    )}
                    <View style={styles.progress}><View style={[styles.bar, {width: `${state.barPct}%`}]}/></View>
                </View>

                {/* Action area (swaps) */}
                <View style={[styles.actionArea, {flexDirection: isWide ? "row" : "column"}]}>
                    {isHoldPhase ? (
                        <>
                            {state.lastChoice?.good && (
                                <BigBtn title="Change to wrong" onPress={actions.changeLastToWrong} bad/>
                            )}
                            <BigBtn title="Continue ▷" onPress={actions.continueNow} primary/>
                        </>
                    ) : (
                        <>
                            <BigBtn title="Got it ✓" onPress={() => actions.mark(true)} good/>
                            <BigBtn title="Missed ✗" onPress={() => actions.mark(false)} bad/>
                        </>
                    )}
                </View>

                {/* PAUSE OVERLAY — centered Resume + End */}
                {state.paused && (
                    <View style={styles.pausedOverlay} pointerEvents="box-none">
                        <View style={styles.pausedPanel} pointerEvents="auto">
                            <Text style={styles.pausedText}>Paused</Text>
                            <View style={styles.pauseButtons}>
                                <Pressable onPress={() => actions.togglePause()}
                                           style={[styles.bigBtn, styles.bigBtnPrimary]}>
                                    <Text style={styles.bigBtnText}>Resume</Text>
                                </Pressable>
                                <Pressable onPress={actions.endNow} style={[styles.bigBtn, styles.bigBtnBad]}>
                                    <Text style={styles.bigBtnText}>End</Text>
                                </Pressable>
                            </View>
                        </View>
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
                    primary,
                }: {
    title: string;
    onPress: () => void;
    good?: boolean;
    bad?: boolean;
    primary?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({pressed}) => [
                styles.bigBtn,
                good && styles.bigBtnGood,
                bad && styles.bigBtnBad,
                primary && styles.bigBtnPrimary,
                pressed && {transform: [{translateY: 1}]},
            ]}
        >
            <Text style={styles.bigBtnText}>{title}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    safe: {flex: 1, backgroundColor: "#0b1025", alignItems: "center"},
    card: {
        backgroundColor: "#111827",
        margin: 16, padding: 16, borderRadius: 16,
        borderWidth: 1, borderColor: "rgba(255,255,255,.06)",
        width: "96%", maxWidth: 900, overflow: "hidden",
    },

    topRow: {
        position: "relative", zIndex: 20,
        flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
    },
    smallBtn: {
        backgroundColor: "#0b1226",
        borderColor: "rgba(255,255,255,.12)", borderWidth: 1,
        borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
    },
    smallBtnActive: {backgroundColor: "#102650", borderColor: "rgba(56,189,248,.5)"},
    smallBtnText: {color: "#e5e7eb", fontWeight: "600"},

    // Simple circular badge (no external deps). For a true radial sweep, we can add react-native-svg later.
    ringWrap: {width: 36, height: 36, alignItems: "center", justifyContent: "center"},
    ringOuter: {
        width: 36, height: 36, borderRadius: 18,
        borderWidth: 2, borderColor: "rgba(56,189,248,.5)",
        alignItems: "center", justifyContent: "center", overflow: "hidden",
    },
    ringFill: {
        position: "absolute", left: 0, top: 0, bottom: 0,
        backgroundColor: "rgba(56,189,248,.35)",
    },
    ringText: {color: "#e5e7eb", fontSize: 10, fontWeight: "700"},

    flash: {
        alignItems: "center", padding: 16,
        borderWidth: 1, borderColor: "rgba(255,255,255,.12)",
        borderRadius: 12, marginBottom: 12, minHeight: 180,
    },
    prompt: {color: "#e5e7eb", fontWeight: "800", textAlign: "center"},
    answer: {color: "#e5e7eb", marginTop: 8, opacity: 0.95, textAlign: "center"},

    progress: {
        height: 6, width: "100%", backgroundColor: "rgba(255,255,255,.06)",
        marginTop: 12, borderRadius: 999, overflow: "hidden",
    },
    bar: {height: "100%", backgroundColor: "#38bdf8"},

    actionArea: {gap: 12, justifyContent: "center", alignItems: "stretch", marginTop: 6},

    bigBtn: {
        backgroundColor: "#0b1226", borderColor: "rgba(255,255,255,.12)", borderWidth: 1,
        borderRadius: 14, paddingVertical: 18, paddingHorizontal: 20, alignItems: "center",
    },
    bigBtnGood: {borderColor: "rgba(52,211,153,.5)"},
    bigBtnBad: {borderColor: "rgba(248,113,113,.5)"},
    bigBtnPrimary: {borderColor: "rgba(56,189,248,.5)", backgroundColor: "#0a1938"},
    bigBtnText: {color: "#e5e7eb", fontSize: 20, fontWeight: "700"},

    // Pause overlay with centered controls; only panel is interactive
    pausedOverlay: {
        position: "absolute", zIndex: 15, left: 0, right: 0, top: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,.45)", alignItems: "center", justifyContent: "center",
    },
    pausedPanel: {
        backgroundColor: "rgba(17,24,39,.95)", padding: 16, borderRadius: 14,
        borderWidth: 1, borderColor: "rgba(255,255,255,.12)", alignItems: "center", gap: 12, minWidth: 240,
    },
    pausedText: {color: "#e5e7eb", fontSize: 28, fontWeight: "800"},
    pauseButtons: {flexDirection: "row", gap: 10, marginTop: 4},
});