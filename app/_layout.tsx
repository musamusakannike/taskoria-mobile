import { Stack } from "expo-router";
import "../global.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
