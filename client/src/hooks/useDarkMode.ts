import { useTheme } from "@/components/ui/theme-provider";

export function useDarkMode() {
  const { theme, setTheme } = useTheme();
  
  const isDarkMode = theme === "dark" || (theme === "system" && 
    window.matchMedia("(prefers-color-scheme: dark)").matches);
  
  const toggleDarkMode = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  return {
    isDarkMode,
    toggleDarkMode,
    theme,
    setTheme,
  };
}
