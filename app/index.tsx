import React, {useState} from "react";
import {SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView} from "react-native";
import {Picker} from "@react-native-picker/picker";
import {useRouter} from "expo-router";
import {useGame, data} from "../src/store";

type Mode = "num-to-word" | "word-to-num" | "emoji-to-word" | "word-to-emoji";

export default function HomeScreen() {
    const router = useRouter();
    const {state, actions} = useGame();
    const [showSettings, setShowSettings] = useState(false);
    const [showStats, setShowStats] = useState(false);

    const categories = Object.keys(data) as (keyof typeof data)[];
    
    const getModeOptions = (category: keyof typeof data) => {
        const cat = data[category];
        const modes: {value: Mode; label: string}[] = [];
        
        if (cat.ordered) {
            modes.push(
                {value: "num-to-word", label: "Number → Word"},
                {value: "word-to-num", label: "Word → Number"}
            );
        }
        if (cat.emoji) {
            modes.push(
                {value: "emoji-to-word", label: "Emoji → Word"},
                {value: "word-to-emoji", label: "Word → Emoji"}
            );
        }
        if (modes.length === 0) {
            modes.push(
                {value: "num-to-word", label: "Number → Word"},
                {value: "word-to-num", label: "Word → Number"}
            );
        }
        return modes;
    };

    const startGame = () => {
        actions.startNewGame();
        router.push("/game");
    };

    const formatCategoryName = (key: string) => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    };

    if (showStats) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>📊 Statistics</Text>
                        <Pressable onPress={() => setShowStats(false)} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>

                    <View style={styles.statsCard}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Total Games</Text>
                            <Text style={styles.statValue}>{state.statistics.totalGames}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Total Correct</Text>
                            <Text style={styles.statValue}>{state.statistics.totalCorrect}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Total Seen</Text>
                            <Text style={styles.statValue}>{state.statistics.totalSeen}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Best Accuracy</Text>
                            <Text style={styles.statValue}>{state.statistics.bestAccuracy}%</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Category Performance</Text>
                    {Object.entries(state.statistics.categoryStats).map(([category, stats]) => (
                        <View key={category} style={styles.categoryStatCard}>
                            <Text style={styles.categoryStatTitle}>{formatCategoryName(category)}</Text>
                            <View style={styles.categoryStatRow}>
                                <Text style={styles.categoryStatText}>Games: {stats.games}</Text>
                                <Text style={styles.categoryStatText}>
                                    Accuracy: {stats.seen > 0 ? Math.round((stats.correct / stats.seen) * 100) : 0}%
                                </Text>
                            </View>
                        </View>
                    ))}

                    <Pressable onPress={actions.resetStatistics} style={styles.resetBtn}>
                        <Text style={styles.resetBtnText}>🗑️ Reset Statistics</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    if (showSettings) {
        const modeOptions = getModeOptions(state.settings.category);
        
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>⚙️ Settings</Text>
                        <Pressable onPress={() => setShowSettings(false)} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </Pressable>
                    </View>

                    <View style={styles.settingsCard}>
                        <View style={styles.settingGroup}>
                            <Text style={styles.settingLabel}>Category</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={state.settings.category}
                                    onValueChange={(value) => actions.updateSettings({category: value})}
                                    style={styles.picker}
                                >
                                    {categories.map((cat) => (
                                        <Picker.Item
                                            key={cat}
                                            label={formatCategoryName(cat)}
                                            value={cat}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.settingGroup}>
                            <Text style={styles.settingLabel}>Mode</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={state.settings.mode}
                                    onValueChange={(value) => actions.updateSettings({mode: value})}
                                    style={styles.picker}
                                >
                                    {modeOptions.map((mode) => (
                                        <Picker.Item
                                            key={mode.value}
                                            label={mode.label}
                                            value={mode.value}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        <View style={styles.settingGroup}>
                            <Text style={styles.settingLabel}>Words per Game</Text>
                            <View style={styles.numberButtons}>
                                {[5, 10, 15, 20, 30].map((num) => (
                                    <Pressable
                                        key={num}
                                        onPress={() => actions.updateSettings({count: num})}
                                        style={[
                                            styles.numberBtn,
                                            state.settings.count === num && styles.numberBtnActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.numberBtnText,
                                            state.settings.count === num && styles.numberBtnTextActive
                                        ]}>
                                            {num}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.settingGroup}>
                            <Text style={styles.settingLabel}>Reveal Delay (seconds)</Text>
                            <View style={styles.numberButtons}>
                                {[0, 1, 2, 3, 5].map((num) => (
                                    <Pressable
                                        key={num}
                                        onPress={() => actions.updateSettings({delaySec: num})}
                                        style={[
                                            styles.numberBtn,
                                            state.settings.delaySec === num && styles.numberBtnActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.numberBtnText,
                                            state.settings.delaySec === num && styles.numberBtnTextActive
                                        ]}>
                                            {num}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroEmoji}>🧠</Text>
                    <Text style={styles.heroTitle}>FlipFox</Text>
                    <Text style={styles.heroSubtitle}>Master memory through play</Text>
                </View>

                {/* Current Settings Preview */}
                <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>Ready to Play</Text>
                    <View style={styles.previewDetails}>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>Category</Text>
                            <Text style={styles.previewValue}>{formatCategoryName(state.settings.category)}</Text>
                        </View>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>Mode</Text>
                            <Text style={styles.previewValue}>
                                {getModeOptions(state.settings.category)
                                    .find(m => m.value === state.settings.mode)?.label || "Number → Word"}
                            </Text>
                        </View>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>Words</Text>
                            <Text style={styles.previewValue}>{state.settings.count}</Text>
                        </View>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>Delay</Text>
                            <Text style={styles.previewValue}>{state.settings.delaySec}s</Text>
                        </View>
                    </View>
                </View>

                {/* Main Action */}
                <Pressable onPress={startGame} style={styles.playButton}>
                    <Text style={styles.playButtonText}>🚀 Start Game</Text>
                </Pressable>

                {/* Secondary Actions */}
                <View style={styles.actionGrid}>
                    <Pressable onPress={() => setShowSettings(true)} style={styles.actionButton}>
                        <Text style={styles.actionEmoji}>⚙️</Text>
                        <Text style={styles.actionText}>Settings</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowStats(true)} style={styles.actionButton}>
                        <Text style={styles.actionEmoji}>📊</Text>
                        <Text style={styles.actionText}>Statistics</Text>
                    </Pressable>
                </View>

                {/* Quick Stats */}
                {state.statistics.totalGames > 0 && (
                    <View style={styles.quickStats}>
                        <Text style={styles.quickStatsTitle}>Your Progress</Text>
                        <View style={styles.quickStatsRow}>
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>{state.statistics.totalGames}</Text>
                                <Text style={styles.quickStatLabel}>Games</Text>
                            </View>
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>{state.statistics.bestAccuracy}%</Text>
                                <Text style={styles.quickStatLabel}>Best</Text>
                            </View>
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>
                                    {state.statistics.totalSeen > 0 
                                        ? Math.round((state.statistics.totalCorrect / state.statistics.totalSeen) * 100)
                                        : 0}%
                                </Text>
                                <Text style={styles.quickStatLabel}>Average</Text>
                            </View>
                        </View>
                    </View>
                )}
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
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        color: "#ffffff",
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#1e1e3f",
        alignItems: "center",
        justifyContent: "center",
    },
    closeBtnText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "600",
    },
    hero: {
        alignItems: "center",
        marginBottom: 30,
    },
    heroEmoji: {
        fontSize: 80,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: "900",
        color: "#ffffff",
        marginBottom: 8,
        textShadowColor: "rgba(255, 255, 255, 0.1)",
        textShadowOffset: {width: 0, height: 2},
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 18,
        color: "#8892b0",
        fontWeight: "500",
    },
    previewCard: {
        backgroundColor: "#1e1e3f",
        borderRadius: 20,
        padding: 20,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 15,
        textAlign: "center",
    },
    previewDetails: {
        gap: 12,
    },
    previewItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    previewLabel: {
        fontSize: 16,
        color: "#8892b0",
        fontWeight: "500",
    },
    previewValue: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
    },
    playButton: {
        backgroundColor: "#64ffda",
        borderRadius: 25,
        paddingVertical: 18,
        paddingHorizontal: 40,
        alignItems: "center",
        marginBottom: 25,
        shadowColor: "#64ffda",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    playButtonText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#0f0f23",
    },
    actionGrid: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 25,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    actionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        color: "#ffffff",
        fontWeight: "600",
    },
    quickStats: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    quickStatsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ffffff",
        textAlign: "center",
        marginBottom: 15,
    },
    quickStatsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    quickStat: {
        alignItems: "center",
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#64ffda",
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 14,
        color: "#8892b0",
        fontWeight: "500",
    },
    // Settings & Stats styles
    statsCard: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2a2a5a",
    },
    statLabel: {
        fontSize: 16,
        color: "#8892b0",
        fontWeight: "500",
    },
    statValue: {
        fontSize: 18,
        color: "#64ffda",
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#ffffff",
        marginBottom: 15,
    },
    categoryStatCard: {
        backgroundColor: "#1e1e3f",
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    categoryStatTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 8,
    },
    categoryStatRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    categoryStatText: {
        fontSize: 14,
        color: "#8892b0",
        fontWeight: "500",
    },
    resetBtn: {
        backgroundColor: "#ff6b6b",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
    },
    resetBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    settingsCard: {
        gap: 25,
    },
    settingGroup: {
        backgroundColor: "#1e1e3f",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#2a2a5a",
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: "600",
        color: "#ffffff",
        marginBottom: 15,
    },
    pickerContainer: {
        backgroundColor: "#2a2a5a",
        borderRadius: 12,
        overflow: "hidden",
    },
    picker: {
        color: "#ffffff",
        backgroundColor: "transparent",
    },
    numberButtons: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
    },
    numberBtn: {
        backgroundColor: "#2a2a5a",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 50,
        alignItems: "center",
    },
    numberBtnActive: {
        backgroundColor: "#64ffda",
    },
    numberBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#ffffff",
    },
    numberBtnTextActive: {
        color: "#0f0f23",
    },
});