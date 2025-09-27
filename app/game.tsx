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

    // Fox expressions based on game state
    const getFoxExpression = () => {
        if (state.paused) return "😴"; // Sleeping fox
        if (isHoldPhase && state.lastChoice?.good) return "😊"; // Happy fox
        if (isHoldPhase && !state.lastChoice?.good) return "🤔"; // Thinking fox
        return "🦊"; // Default fox
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Fox Header */}
            <View style={styles.foxHeader}>
                <Text style={styles.foxEmoji}>{getFoxExpression()}</Text>
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
                        <Text style={styles.pauseEmoji}>😴</Text>
                        <Text style={styles.pauseTitle}>Game Paused</Text>
                        <Text style={styles.pauseSubtitle}>Take your time, little fox!</Text>
                        
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
                                <Text style={[styles.pauseActionText, styles.endActionText]}>🏁 End Game</Text>
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
        backgroundColor: "#fef3e2", // Warm cream background
    },
    foxHeader: {
        alignItems: "center",
        padding: 20,
        paddingBottom: 10,
    },
    foxEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    progressContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 15,
    },
    progressText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#8b5a3c",
        marginBottom: 8,
        textAlign: "center",
    },
    progressBar: {
        width: "80%",
        height: 8,
        backgroundColor: "#ffb380",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#ff8c42",
        borderRadius: 4,
    },
    pauseBtn: {
        position: "absolute",
        right: 20,
        top: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pauseBtnActive: {
        backgroundColor: "#ff8c42",
        borderColor: "#ff8c42",
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
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 40,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        width: "100%",
        maxWidth: 400,
        borderWidth: 3,
        borderColor: "#ff8c42",
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    prompt: {
        color: "#8b5a3c",
        fontWeight: "900",
        textAlign: "center",
        marginBottom: 20,
        textShadowColor: "rgba(139, 90, 60, 0.1)",
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    answer: {
        color: "#ff8c42",
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 20,
    },
    timerContainer: {
        width: "100%",
        height: 6,
        backgroundColor: "#fef3e2",
        borderRadius: 3,
        overflow: "hidden",
        marginTop: 20,
    },
    timerBar: {
        height: "100%",
        backgroundColor: "#ff8c42",
        borderRadius: 3,
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
        backgroundColor: "#ffb380",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 10,
    },
    holdFill: {
        height: "100%",
        backgroundColor: "#ff8c42",
        borderRadius: 4,
    },
    holdText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#8b5a3c",
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
        borderWidth: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    correctBtn: {
        backgroundColor: "#4ade80",
        borderColor: "#ffffff",
    },
    wrongBtn: {
        backgroundColor: "#f87171",
        borderColor: "#ffffff",
    },
    changeBtn: {
        backgroundColor: "#ffffff",
        borderColor: "#f87171",
    },
    continueBtn: {
        backgroundColor: "#ff8c42",
        borderColor: "#ffffff",
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    changeBtnText: {
        color: "#f87171",
        textShadowColor: "transparent",
    },
    scoreArea: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopWidth: 2,
        borderTopColor: "#ffb380",
        paddingTop: 15,
        backgroundColor: "#ffffff",
        marginHorizontal: 20,
        borderRadius: 20,
        marginBottom: 10,
    },
    scoreItem: {
        alignItems: "center",
    },
    scoreValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#ff8c42",
        marginBottom: 4,
    },
    scoreLabel: {
        fontSize: 12,
        color: "#8b5a3c",
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
        backgroundColor: "rgba(254, 243, 226, 0.95)",
        alignItems: "center",
        justifyContent: "center",
    },
    pausePanel: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 30,
        alignItems: "center",
        minWidth: 280,
        borderWidth: 3,
        borderColor: "#ff8c42",
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.3,
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
        color: "#8b5a3c",
        marginBottom: 8,
    },
    pauseSubtitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginBottom: 25,
        textAlign: "center",
    },
    pauseActions: {
        gap: 12,
        width: "100%",
    },
    pauseActionBtn: {
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 20,
        alignItems: "center",
        borderWidth: 3,
    },
    resumeBtn: {
        backgroundColor: "#ff8c42",
        borderColor: "#ffffff",
    },
    endBtn: {
        backgroundColor: "#ffffff",
        borderColor: "#f87171",
    },
    pauseActionText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    endActionText: {
        color: "#f87171",
        textShadowColor: "transparent",
    },
});