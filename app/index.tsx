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
                {/* Fox Hero Section */}
                <View style={styles.hero}>
                    <View style={styles.foxContainer}>
                        <Text style={styles.foxEmoji}>🦊</Text>
                    </View>
                    <Text style={styles.heroTitle}>FlipFox</Text>
                    <Text style={styles.heroSubtitle}>Your playful companion for memory training!</Text>
                </View>

                {/* Current Settings Preview */}
                <View style={styles.previewCard}>
                    <Text style={styles.previewTitle}>🎯 Ready to Play</Text>
                    <View style={styles.previewDetails}>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>🎨 Category</Text>
                            <Text style={styles.previewValue}>{formatCategoryName(state.settings.category)}</Text>
                        </View>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>🔄 Mode</Text>
                            <Text style={styles.previewValue}>
                                {getModeOptions(state.settings.category)
                                    .find(m => m.value === state.settings.mode)?.label || "Number → Word"}
                            </Text>
                        </View>
                        <View style={styles.previewItem}>
                            <Text style={styles.previewLabel}>📝 Words</Text>
                            <Text style={styles.previewValue}>{state.settings.count}</Text>
                        </View>
                    </View>
                </View>

                {/* Main Action */}
                <Pressable onPress={startGame} style={styles.playButton}>
                    <Text style={styles.playButtonText}>🚀 Start Learning!</Text>
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
                        <Text style={styles.quickStatsTitle}>🏆 Your Progress</Text>
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
        backgroundColor: "#fef3e2", // Warm cream background
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
        color: "#8b5a3c",
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#ff8c42",
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    closeBtnText: {
        color: "#ff8c42",
        fontSize: 18,
        fontWeight: "600",
    },
    hero: {
        alignItems: "center",
        marginBottom: 30,
    },
    foxContainer: {
        alignItems: "center",
        marginBottom: 15,
        position: "relative",
    },
    foxEmoji: {
        fontSize: 80,
        marginBottom: 10,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: "900",
        color: "#ff8c42",
        marginBottom: 8,
        textShadowColor: "rgba(255, 140, 66, 0.3)",
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: 18,
        color: "#8b5a3c",
        fontWeight: "500",
        textAlign: "center",
    },
    previewCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 20,
        marginBottom: 25,
        borderWidth: 3,
        borderColor: "#ff8c42",
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    previewTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#8b5a3c",
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
        color: "#8b5a3c",
        fontWeight: "600",
    },
    previewValue: {
        fontSize: 16,
        color: "#ff8c42",
        fontWeight: "700",
    },
    playButton: {
        backgroundColor: "#ff8c42",
        borderRadius: 25,
        paddingVertical: 18,
        paddingHorizontal: 40,
        alignItems: "center",
        marginBottom: 25,
        shadowColor: "#ff8c42",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 3,
        borderColor: "#ffffff",
    },
    playButtonText: {
        fontSize: 20,
        fontWeight: "800",
        color: "#ffffff",
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: {width: 1, height: 1},
        textShadowRadius: 2,
    },
    actionGrid: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 25,
    },
    actionButton: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 16,
        color: "#8b5a3c",
        fontWeight: "600",
    },
    quickStats: {
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
    quickStatsTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#8b5a3c",
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
        color: "#ff8c42",
        marginBottom: 4,
    },
    quickStatLabel: {
        fontSize: 14,
        color: "#8b5a3c",
        fontWeight: "500",
    },
    // Settings & Stats styles
    statsCard: {
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#fef3e2",
    },
    statLabel: {
        fontSize: 16,
        color: "#8b5a3c",
        fontWeight: "500",
    },
    statValue: {
        fontSize: 18,
        color: "#ff8c42",
        fontWeight: "700",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#8b5a3c",
        marginBottom: 15,
    },
    categoryStatCard: {
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#ffb380",
    },
    categoryStatTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#8b5a3c",
        marginBottom: 8,
    },
    categoryStatRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    categoryStatText: {
        fontSize: 14,
        color: "#94a3b8",
        fontWeight: "500",
    },
    resetBtn: {
        backgroundColor: "#ff6b6b",
        borderRadius: 16,
        padding: 15,
        alignItems: "center",
        marginTop: 20,
        borderWidth: 2,
        borderColor: "#ffffff",
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
        backgroundColor: "#ffffff",
        borderRadius: 20,
        padding: 20,
        borderWidth: 2,
        borderColor: "#ffb380",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#8b5a3c",
        marginBottom: 15,
    },
    pickerContainer: {
        backgroundColor: "#fef3e2",
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#ffb380",
    },
    picker: {
        color: "#8b5a3c",
        backgroundColor: "transparent",
    },
    numberButtons: {
        flexDirection: "row",
        gap: 10,
        flexWrap: "wrap",
    },
    numberBtn: {
        backgroundColor: "#fef3e2",
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 50,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#ffb380",
    },
    numberBtnActive: {
        backgroundColor: "#ff8c42",
        borderColor: "#ff8c42",
    },
    numberBtnText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#8b5a3c",
    },
    numberBtnTextActive: {
        color: "#ffffff",
    },
});