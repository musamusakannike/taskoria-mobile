import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem("theme");
        if (storedTheme) {
          setThemeState(storedTheme as Theme);
        }
      } catch {
        // fallback to defaultTheme
      }
    })();
  }, []);

  useEffect(() => {
    const root = window?.document?.documentElement;
    if (root) {
      root.classList.remove("light", "dark");
    }
    if (theme === "system") {
      const systemTheme =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      if (root) root.classList.add(systemTheme);
      return;
    }
    if (root) root.classList.add(theme);
    // Save theme to AsyncStorage
    (async () => {
      try {
        await AsyncStorage.setItem("theme", theme);
      } catch {}
    })();
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
