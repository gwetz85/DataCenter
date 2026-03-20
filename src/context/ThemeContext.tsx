import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type ThemeType = 'dark' | 'light';
export type ColorPalette = 'biru' | 'merah' | 'oren' | 'kuning' | 'jingga' | 'hijau';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  color: ColorPalette;
  setColor: (c: ColorPalette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    return (localStorage.getItem('dc_theme') as ThemeType) || 'dark';
  });
  
  const [color, setColorState] = useState<ColorPalette>(() => {
    return (localStorage.getItem('dc_color') as ColorPalette) || 'biru';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('dc_theme', newTheme);
  };

  const setColor = (newColor: ColorPalette) => {
    setColorState(newColor);
    localStorage.setItem('dc_color', newColor);
  };

  // Inject into <html> tag for global CSS variable targeting
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', color);
  }, [color]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
