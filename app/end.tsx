import React from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView, Dimensions} from "react-native";
import {useRouter} from "expo-router";
import {useGame} from "../src/store";

export default function EndScreen() {
    const router = useRouter();
    const {state, actions} = useGame();

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
                foxEmoji: "✨",
                title: "Outstanding!",
                message: "You're a memory master, little fox!",
                color: "#ffd700",
                bgColor: "#fff9e6"
            };
        } else if (accuracy >= 75) {
            return {
                emoji: "🌟",
                foxEmoji: "😊",
                title: "Excellent!",
                message: "Great memory skills!",
                color: "#ff8c42",
                bgColor: "#fef3e2"
            };
        } else if (accuracy >= 60) {
            return {
                emoji: "👍",
                foxEmoji: "👍",
                title: "Good Job!",
                message: "You're improving!",
                color: "#4ade80",
                bgColor: "#f0fdf4"
            };
        } else if (accuracy >= 40) {
            return {
                emoji: "💪",
                foxEmoji: "💪",
                title: "Keep Going!",
                message: "Practice makes perfect!",
                color: "#f59e0b",
                bgColor: "#fffbeb"
            };
        } else {
            return {
                emoji: "🎯",
                foxEmoji: "🎯",
                title: "Try Again!",
                message: "Every expert was once a beginner!",
                color: "#f87171",
                bgColor: "#fef2f2"
            };
        }
    };

    const performance = getPerformanceData();
    const isNewBest = state.accuracy === state.statistics.bestAccuracy && state.statistics.totalGames > 1;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Fox Celebration Header */}
                <View style={[styles.performanceHeader, {backgroundColor: performance.bgColor}]}>
                    <Text style={styles.foxCelebration}>{performance.foxEmoji}</Text>
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
                        <Text style={styles.statValue}>{state.seen}</Text>
                        <Text style={styles.statLabel}>Words Seen</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{state.correct}</Text>
                        <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statCard}>
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

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <Pressable onPress={playAgain} style={[styles.actionBtn, styles.playAgainBtn]}>
                        <Text style={styles.actionBtnText}>🔄 Play Again</Text>
                    </Pressable>
                    <Pressable onPress={goHome} style={[styles.actionBtn, styles.homeBtn]}>
                        <Text style={[styles.actionBtnText, styles.homeBtnText]}>🏠 Home</Text>
                    </Pressable>
                </View>

                {/* Overall Stats Preview */}
                <View style={styles.overallStats}>
                    <Text style={styles.overallStatsTitle}>🏆 Overall Progress</Text>
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
        backgroundColor: "#fef3e2", // Warm cream background
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    performanceHeader: {
        borderRadius: 24,
        padding: 25,
        alignItems: "center",
        marginBottom: 25,
        borderWidth: 3,
        borderColor: "#ff8c42",
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    foxCelebration: {
        fontSize: 60,
        marginBottom: 10,
    },
    performanceTitle: {
        fontSize: 32,
        fontWeight: "900",
        marginBottom: 8,
        textShadowColor: "rgba(0, 0, 0, 0.1)",
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    performanceMessage: {
        fontSize: 18,
        color: "#8b5a3c",
        fontWeight: "500",
        textAlign: "center",
    },
    newBestBadge: {
        backgroundColor: "#ffd700",
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginTop: 15,
        borderWidth: 2,
        borderColor: "#ffffff",
    },
    newBestText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#8b5a3c",
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
        backgroundColor: "#ffffff",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    accuracyNumber: {
        fontSize: 36,
        fontWeight: "900",
        marginBottom: 4,
    },
    accuracyLabel: {
        fontSize: 14,
        color: "#8b5a3c",
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
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 16,
        alignItems: "center",
        flex: 1,
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#ff8c42",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#8b5a3c",
        fontWeight: "500",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    progressSection: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#8b5a3c",
        textAlign: "center",
        marginBottom: 15,
    },
    progressBarContainer: {
        height: 12,
        backgroundColor: "#fef3e2",
        borderRadius: 6,
        overflow: "hidden",
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#ffb380",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: "#8b5a3c",
        textAlign: "center",
        fontWeight: "500",
    },
    actionButtons: {
        gap: 15,
        marginBottom: 25,
    },
    actionBtn: {
        borderRadius: 25,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: "center",
        borderWidth: 3,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 6,
    },
    playAgainBtn: {
        backgroundColor: "#ff8c42",
        borderColor: "#ffffff",
    },
    homeBtn: {
        backgroundColor: "#ffffff",
        borderColor: "#ff8c42",
    },
    actionBtnText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    homeBtnText: {
        color: "#ff8c42",
        textShadowColor: "transparent",
    },
    overallStats: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: "#ffb380",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    overallStatsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#8b5a3c",
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
        color: "#ff8c42",
        marginBottom: 4,
    },
    overallStatLabel: {
        fontSize: 12,
        color: "#8b5a3c",
        fontWeight: "500",
        textAlign: "center",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});