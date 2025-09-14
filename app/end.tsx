import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useGame } from "../src/store";

export default function EndScreen() {
    const router = useRouter();
    const { state, actions } = useGame();

    const again = () => {
        actions.startNewRound(); // same config, reshuffle
        router.replace("/game");
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.card}>
                <Text style={styles.h1}>Great work!</Text>
                <Text style={styles.sub}>Here’s how you did:</Text>

                <View style={styles.statsWrap}>
                    <Stat label="Seen" value={String(state.seen)} />
                    <Stat label="Correct" value={String(state.correct)} />
                    <Stat label="Accuracy" value={`${state.accuracy}%`} />
                </View>

                <View style={styles.buttonsRow}>
                    <Btn title="Practice again" primary onPress={again} />
                    <Link href="/" asChild><Btn title="Back to start" onPress={() => {}} /></Link>
                </View>
            </View>
        </SafeAreaView>
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

function Btn({
                 title,
                 onPress,
                 primary,
             }: {
    title: string;
    onPress: () => void;
    primary?: boolean;
}) {
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
        margin: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.06)",
        width: "96%",
        maxWidth: 900,
    },
    h1: { color: "#e5e7eb", fontSize: 28, fontWeight: "800" },
    sub: { color: "#94a3b8", marginTop: 4, marginBottom: 10 },
    statsWrap: {
        flexDirection: "row",
        gap: 8,
        flexWrap: "wrap",
        justifyContent: "center",
        marginVertical: 12,
    },
    pill: {
        borderColor: "rgba(255,255,255,.1)",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    pillText: { color: "#94a3b8", fontSize: 12 },
    buttonsRow: { gap: 10, marginTop: 12, alignItems: "center" },
    btn: {
        backgroundColor: "#0b1226",
        paddingVertical: 12,
        paddingHorizontal: 18,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,.12)",
        minWidth: 200,
        alignItems: "center",
    },
    btnPrimary: { backgroundColor: "#0a1938", borderColor: "rgba(56,189,248,.5)" },
    btnText: { color: "#e5e7eb", fontSize: 16, fontWeight: "600" },
});