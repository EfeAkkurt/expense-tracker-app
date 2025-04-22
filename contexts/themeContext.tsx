import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

// Tema türleri
type ThemeType = "light" | "dark";

// Tema bağlamı değerleri
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  isSystemTheme: boolean;
  setIsSystemTheme: (value: boolean) => void;
}

// Tema bağlamı oluşturma
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

// Tema sağlayıcısı
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Sistem temasını al
  const colorScheme = useColorScheme();

  // State tanımlamaları
  const [theme, setTheme] = useState<ThemeType>(
    colorScheme === "dark" ? "dark" : "light"
  );
  const [isSystemTheme, setIsSystemTheme] = useState<boolean>(true);

  // Sistem teması değiştiğinde ve isSystemTheme true ise temayı güncelle
  useEffect(() => {
    if (isSystemTheme && colorScheme) {
      setTheme(colorScheme === "dark" ? "dark" : "light");
    }
  }, [colorScheme, isSystemTheme]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    setIsSystemTheme(false);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isSystemTheme,
        setIsSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Tema bağlamını kullanmak için hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
