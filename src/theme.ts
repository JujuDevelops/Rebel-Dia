import { createContext, useContext } from "react";
import { Platform, TextStyle, useColorScheme } from "react-native";
import { FONT_FILES, P5_BODY, P5_TITLE } from "./fonts";
import type { ThemeMode, ThemeSet } from "./utils/settings";

const L = { bg: "#f6f5f3", card: "#fff", tx: "#17171a", mu: "#85858c", ln: "#e3e2df", ac: "#17171a", ak: "#fff", cy: "#0e9fbc", bt: "#ecebe8", bs: 85, bl: 90, dg: "#ff453a" };
const D = { bg: "#0d0d0f", card: "#1a1a1e", tx: "#f5f5f7", mu: "#8e8e96", ln: "#2a2a2f", ac: "#f5f5f7", ak: "#111", cy: "#22d3ee", bt: "#2c2c31", bs: 40, bl: 22, dg: "#ff453a" };
export type Theme = typeof L;
// na web o Appearance não pode ser sobreposto: o esquema vem direto dos ajustes
export const ThemeModeCtx = createContext<ThemeMode>("dark");
const useModeCtx = () => useContext(ThemeModeCtx);
const useScheme = Platform.OS === "web" ? useModeCtx : useColorScheme;
export const useTheme = (): Theme => (useScheme() === "dark" ? D : L);
// conjunto de temas num contexto próprio: o texto lê só isto, sem re-renderizar a cada mudança do app
export const ThemeSetCtx = createContext<ThemeSet>("default");
export const useThemeSet = () => useContext(ThemeSetCtx);
// fonte do texto no conjunto atual; o peso já vem do arquivo, por isso volta para "normal"
export const useFont = (title?: boolean): TextStyle | undefined => {
  const f = title ? P5_TITLE : P5_BODY;
  return useThemeSet() === "persona5" && f in FONT_FILES
    ? { fontFamily: f, fontWeight: "normal" }
    : undefined;
};
export const hsl = (h: number, s: number, l: number) => `hsl(${h}, ${s}%, ${l}%)`;
// vermelho do tema Persona 5 (fundo do cartão "Caminhos do dia", contorno do título do Inbox)
export const P5_RED = "#C70000";
