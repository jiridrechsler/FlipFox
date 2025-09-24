import React, {useEffect} from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable, Dimensions} from "react-native";
import {useRouter} from "expo-router";
import {useGame} from "../src/store";

export default function GameScreen() {
    const router = useRouter();
    const {state, actions} = useGame();
    const {width, height} = Dimensions.get('window');

    useEffect(() => {
        if (state.paused || state.holding) return;
        actions.startTimer();
        return actions.stopTimer;
    }, [state.currentIndex, state.paused, state.settings.delaySec, state.holding]);

    useEffect(() => {
        if (state.finished && state.showingResults) {
            router.replace("/end");
        }
    }, [state.finished, state.showingResults]);

    const progress = ((state.currentIndex + 1) / state.order.length) * 100;
    const isHoldPhase = state.holding;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        {state.currentIndex + 1} / {state.order.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, {width: `${progress}%`}]} />
                    </View>
                </View>
                
                <Pressable
                    onPress={() => actions.togglePause()}
                    style={[styles.pauseBtn, state.paused && styles.pauseBtnActive]}
                >
                    <Text style={styles.pauseBtnText}>
                        {state.paused ? "▶️" : "⏸️"}
                    </Text>
                </Pressable>
            </View>

            {/* Main Game Area */}
            <View style={styles.gameArea}>
                <View style={styles.card}>
                    <Text style={[styles.prompt, {fontSize: Math.min(width * 0.15, 80)}]}>
                        {state.prompt}
                    </Text>
                    
                    {state.showing && (
                        <Text style={[styles.answer, {fontSize: Math.min(width * 0.08, 40)}]}>
                            {state.answer}
                        </Text>
                    )}

                    {/* Timer Bar */}
                    <View style={styles.timerContainer}>
                        <View style={[styles.timerBar, {width: `${state.barPct}%`}]} />
                    </View>
                </View>

                {/* Hold Phase Indicator */}
                {isHoldPhase && (
                    <View style={styles.holdIndicator}>
                        <View style={styles.holdProgress}>
                            <View style={[styles.holdFill, {width: `${state.holdPct}%`}]} />
                        </View>
                        <Text style={styles.holdText}>
                            {state.lastChoice?.good ? "✅ Correct!" : "❌ Incorrect"}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionArea}>
                {isHoldPhase ? (
                    <View style={styles.holdActions}>
                        {state.lastChoice?.good && (
                            <Pressable
                                onPress={actions.changeLastToWrong}
                                style={[styles.actionBtn, styles.changeBtn]}
                            >
                                <Text style={[styles.actionBtnText, styles.changeBtnText]}>❌ Change to Wrong</Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={actions.continueNow}
                            style={[styles.actionBtn, styles.continueBtn]}
                        >
                            <Text style={styles.actionBtnText}>➡️ Continue</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.markActions}>
                        <Pressable
                            onPress={() => actions.mark(false)}
                            style={[styles.actionBtn, styles.wrongBtn]}
                        >
                            <Text style={styles.actionBtnText}>❌ Wrong</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => actions.mark(true)}
                            style={[styles.actionBtn, styles.correctBtn]}
                        >
                            <Text style={styles.actionBtnText}>✅ Correct</Text>
                        </Pressable>
                    </View>
                )}
            </View>

            {/* Score Display */}
            <View style={styles.scoreArea}>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{state.correct}</Text>
                    <Text style={styles.scoreLabel}>Correct</Text>
                </View>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{state.accuracy}%</Text>
                    <Text style={styles.scoreLabel}>Accuracy</Text>
                </View>
                <View style={styles.scoreItem}>
                    <Text style={styles.scoreValue}>{state.seen}</Text>
                    <Text style={styles.scoreLabel}>Seen</Text>
                </View>
            </View>

            {/* Pause Overlay */}
            {state.paused && (
                <View style={styles.pauseOverlay}>
                    <View style={styles.pausePanel}>
                        <Text style={styles.pauseEmoji}>⏸️</Text>
                        <Text style={styles.pauseTitle}>Game Paused</Text>
                        <Text style={styles.pauseSubtitle}>Take your time</Text>
                        
                        <View style={styles.pauseActions}>
                            <Pressable
                                onPress={() => actions.togglePause()}
                                style={[styles.pauseActionBtn, styles.resumeBtn]}
                            >
                                <Text style={styles.pauseActionText}>▶️ Resume</Text>
                            </Pressable>
                            <Pressable
                                onPress={actions.endGame}
                                style={[styles.pauseActionBtn, styles.endBtn]}
                            >
                                <Text style={styles.pauseActionText}>🏁 End Game</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f23",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
        paddingBottom: 10,
    },
    progressContainer: {
        flex: 1,
        marginRight: 15,
    },
    progressText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#8892b0",
        marginBottom: 8,
        textAlign: "center",
    },
    progressBar: {
        height: 6,
        backgroundColor: "#1e1e3f",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#64ffda",
        borderRadius: 3,
    },
    pauseBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#1e1e3f",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    pauseBtnActive: {
        backgroundColor: "#64ffda",
    },
    pauseBtnText: {
        fontSize: 20,
    },
    gameArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: "#1e1e3f",
        borderRadius: 24,
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        width: "100%",
        maxWidth: 400,
        borderWidth: 2,
        borderColor: "#2a2a5a",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    prompt: {
        color: "#ffffff",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 20,
        textShadowColor: "rgba(255, 255, 255, 0.1)",
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    answer: {
        color: "#64ffda",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },
    timerContainer: {
        width: "100%",
        height: 4,
        backgroundColor: "#2a2a5a",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 20,
    },
    timerBar: {
        height: "100%",
        backgroundColor: "#64ffda",
        borderRadius: 2,
    },
    holdIndicator: {
        marginTop: 20,
        alignItems: "center",
        width: "100%",
        maxWidth: 400,
    },
    holdProgress: {
        width: "100%",
        height: 8,
        backgroundColor: "#1e1e3f",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 10,
    },
    holdFill: {
        height: "100%",
        backgroundColor: "#ff6b6b",
        borderRadius: 4,
    },
    holdText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
    },
    actionArea: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    holdActions: {
        flexDirection: "row",
        gap: 15,
        justifyContent: "center",
    },
    markActions: {
        flexDirection: "row",
        gap: 15,
        justifyContent: "center",
    },
    actionBtn: {
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 140,
        borderWidth: 2,
    },
    correctBtn: {
        backgroundColor: "#4ade80",
        borderColor: "#22c55e",
    },
    wrongBtn: {
        backgroundColor: "#f87171",
        borderColor: "#ef4444",
    },
    changeBtn: {
        backgroundColor: "#1e1e3f",
        borderColor: "#f87171",
        color: "#f87171",
    },
    continueBtn: {
        backgroundColor: "#64ffda",
        borderColor: "#4fd1c7",
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f0f23",
    },
    changeBtnText: {
        color: "#f87171",
    },
    scoreArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: "#1e1e3f",
        paddingTop: 15,
    },
    scoreItem: {
        alignItems: "center",
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#64ffda",
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 12,
        color: "#8892b0",
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    pauseOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 15, 35, 0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    pausePanel: {
        backgroundColor: "#1e1e3f",
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        minWidth: 280,
        borderWidth: 2,
        borderColor: "#2a2a5a",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
    },
    pauseEmoji: {
        fontSize: 60,
        marginBottom: 15,
    },
    pauseTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#ffffff",
        marginBottom: 8,
    },
    pauseSubtitle: {
        fontSize: 16,
        color: "#8892b0",
        marginBottom: 25,
        textAlign: "center",
    },
    pauseActions: {
        gap: 12,
        width: "100%",
    },
    pauseActionBtn: {
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        borderWidth: 2,
    },
    resumeBtn: {
        backgroundColor: "#64ffda",
        borderColor: "#4fd1c7",
    },
    endBtn: {
        backgroundColor: "#1e1e3f",
        borderColor: "#f87171",
    },
    pauseActionText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f0f23",
    },
});