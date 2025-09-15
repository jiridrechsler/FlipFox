import {Stack} from "expo-router";
import {GameProvider} from "../src/store";

export default function Layout() {
    return (
        <GameProvider>
            <Stack screenOptions={{headerShown: false}}/>
        </GameProvider>
    );
}