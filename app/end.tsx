import React, {useEffect} from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Dimensions} from "react-native";
import {Link, useRouter} from "expo-router";
import {useGame} from "../src/store";

export default function EndScreen() {
    const router = useRouter();
    const {state, actions} = useGame();
    const {width} = Dimensions.get('window');

    useEffect(() => {
        // Auto-dismiss results after 10 seconds if user doesn't interact
        const timer = setTimeout(() => {
            if (state.showingResults) {
                actions.dismissResults();
                router.replace("/");
            }
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const playAgain = () => {
        actions.startNewGame();
        router.replace("/game");
    };

    const goHome = () => {
        actions.dismissResults();
        router.replace("/");
    };

    const getPerformanceData = () => {
        const accuracy = state.accuracy;
        if (accuracy >= 90) {
            return {
                emoji: "🏆",
                title: "Outstanding!",
                message: "You're a memory master!",
                color: "#ffd700",
                bgColor: "#1a1a00"
            };
        } else if (accuracy >= 75) {
            return {
                emoji: "🌟",
                title: "Excellent!",
                message: "Great memory skills!",
                color: "#64ffda",
                bgColor: "#0a1a1a"
            };
        } else if (accuracy >= 60) {
            return {
                emoji: "👍",
                title: "Good Job!",
                message: "You're improving!",
                color: "#4ade80",
                bgColor: "#0a1a0a"
            };
        } else if (accuracy >= 40) {
            return {
                emoji: "💪",
                title: "Keep Going!",
                message: "Practice makes perfect!",
                color: "#f59e0b",
                bgColor: "#1a1500"
            };
        } else {
            return {
                emoji: "🎯",
                title: "Try Again!",
                message: "Every expert was once a beginner!",
                color: "#f87171",
                bgColor: "#1a0a0a"
            };
        }
    };

    const performance = getPerformanceData();
    const isNewBest = state.accuracy === state.statistics.bestAccuracy && state.statistics.totalGames > 1;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Performance Header */}
                <View style={[styles.performanceHeader, {backgroundColor: performance.bgColor}]}>
                    <Text style={styles.performanceEmoji}>{performance.emoji}</Text>
                    <Text style={[styles.performanceTitle, {color: performance.color}]}>
                        {performance.title}
                    </Text>
                    <Text style={styles.performanceMessage}>{performance.message}</Text>
                    {isNewBest && (
                        <View style={styles.newBestBadge}>
                            <Text style={styles.newBestText}>🎉 New Best!</Text>
                        </View>
                    )}
                </View>

                {/* Main Stats */}
                <View style={styles.mainStats}>
                    <View style={[styles.accuracyCircle, {borderColor: performance.color}]}>
                        <Text style={[styles.accuracyNumber, {color: performance.color}]}>
                            {state.accuracy}%
                        </Text>
                        <Text style={styles.accuracyLabel}>Accuracy</Text>
                    </View>
                </View>

                {/* Detailed Stats */}
                <View style={styles.detailedStats}>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>👀</Text>
                        <Text style={styles.statValue}>{state.seen}</Text>
                        <Text style={styles.statLabel}>Words Seen</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>✅</Text>
                        <Text style={styles.statValue}>{state.correct}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statEmoji}>❌</Text>
                        <Text style={styles.statValue}>{state.seen - state.correct}</Text>
                        <Text style={styles.statLabel}>Missed</Text>
                    </View>
                </View>

                {/* Progress Visualization */}
                <View style={styles.progressSection}>
                    <Text style={styles.progressTitle}>Your Progress</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, {
                            width: `${state.accuracy}%`,
                            backgroundColor: performance.color
                        }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {state.correct} out of {state.seen} correct
                    </Text>
                </View>

                {/* Game Info */}
                <View style={styles.gameInfo}>
                    <Text style={styles.gameInfoTitle}>Game Details</Text>
                    <View style={styles.gameInfoGrid}>
                        <View style={styles.gameInfoItem}>
                            <Text style={styles.gameInfoLabel}>Category</Text>
                            <Text style={styles.gameInfoValue}>
                                {state.settings.category.charAt(0).toUpperCase() + state.settings.category.slice(1)}
                            </Text>
                        </View>
                        <View style={styles.gameInfoItem}>
                            <Text style={styles.gameInfoLabel}>Mode</Text>
                            <Text style={styles.gameInfoValue}>
                                {state.settings.mode.replace(/-/g, ' → ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                        </View>
                        <View style={styles.gameInfoItem}>
                            <Text style={styles.gameInfoLabel}>Delay</Text>
                            <Text style={styles.gameInfoValue}>{state.settings.delaySec}s</Text>
                        </View>
                        <View style={styles.gameInfoItem}>
                            <Text style={styles.gameInfoLabel}>Total Words</Text>
                            <Text style={styles.gameInfoValue}>{state.settings.count}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Pressable onPress={playAgain} style={[styles.actionBtn, styles.playAgainBtn]}>
                        <Text style={styles.actionBtnText}>🔄 Play Again</Text>
                    </Pressable>
                    <Pressable onPress={goHome} style={[styles.actionBtn, styles.homeBtn]}>
                        <Text style={styles.actionBtnText}>🏠 Home</Text>
                    </Pressable>
                </View>

                {/* Overall Stats Preview */}
                <View style={styles.overallStats}>
                    <Text style={styles.overallStatsTitle}>Overall Progress</Text>
                    <View style={styles.overallStatsGrid}>
                        <View style={styles.overallStatItem}>
                            <Text style={styles.overallStatValue}>{state.statistics.totalGames}</Text>
                            <Text style={styles.overallStatLabel}>Total Games</Text>
                        </View>
                        <View style={styles.overallStatItem}>
                            <Text style={styles.overallStatValue}>{state.statistics.bestAccuracy}%</Text>
                            <Text style={styles.overallStatLabel}>Best Score</Text>
                        </View>
                        <View style={styles.overallStatItem}>
                            <Text style={styles.overallStatValue}>
                                {state.statistics.totalSeen > 0 
                                    ? Math.round((state.statistics.totalCorrect / state.statistics.totalSeen) * 100)
                                    : 0}%
                            </Text>
                            <Text style={styles.overallStatLabel}>Average</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f0f23",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    performanceHeader: {
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    performanceEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    performanceTitle: {
        fontSize: 32,
        fontWeight: "900",
        marginBottom: 8,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    performanceMessage: {
        fontSize: 18,
        color: "#8892b0",
        fontWeight: "500",
        textAlign: "center",
    },
    newBestBadge: {
        backgroundColor: "#ffd700",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginTop: 15,
    },
    newBestText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f0f23",
    },
    mainStats: {
        alignItems: "center",
        marginBottom: 25,
    },
    accuracyCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1e1e3f",
    },
    accuracyNumber: {
        fontSize: 36,
        fontWeight: "900",
        marginBottom: 4,
    },
    accuracyLabel: {
        fontSize: 14,
        color: "#8892b0",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    detailedStats: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 25,
        justifyContent: "center",
    },
    statCard: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        flex: 1,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#ffffff",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#8892b0",
        fontWeight: "500",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    progressSection: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 15,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: "#2a2a5a",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 10,
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 6,
    },
    progressText: {
        fontSize: 14,
        color: "#8892b0",
        textAlign: "center",
        fontWeight: "500",
    },
    gameInfo: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    gameInfoTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 15,
    },
    gameInfoGrid: {
        gap: 12,
    },
    gameInfoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    gameInfoLabel: {
        fontSize: 16,
        color: "#8892b0",
        fontWeight: "500",
    },
    gameInfoValue: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
    },
    actionButtons: {
        gap: 15,
        marginBottom: 25,
    },
    actionBtn: {
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        borderWidth: 2,
    },
    playAgainBtn: {
        backgroundColor: "#64ffda",
        borderColor: "#4fd1c7",
    },
    homeBtn: {
        backgroundColor: "#1e1e3f",
        borderColor: "#64ffda",
    },
    actionBtnText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f0f23",
    },
    overallStats: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    overallStatsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 15,
    },
    overallStatsGrid: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    overallStatItem: {
        alignItems: "center",
    },
    overallStatValue: {
        fontSize: 20,
        fontWeight: "800",
        color: "#64ffda",
        marginBottom: 4,
    },
    overallStatLabel: {
        fontSize: 12,
        color: "#8892b0",
        fontWeight: "500",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});