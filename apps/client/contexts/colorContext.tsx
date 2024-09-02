import { createTheme } from "@mui/material/styles";
export type Theme = typeof defaultTheme;

export const defaultTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      light: "#f4f4f4", // Zeer lichte grijstint voor zachte achtergrondaccenten
      main: "#d1d1d1", // Neutrale, lichte grijstint voor de navbar en andere belangrijke elementen
      dark: "#a6a6a6", // Iets donkerdere grijstint voor randen, knoppen, en hover-effecten
      contrastText: "#000000", // Zwarte tekst voor een sterk contrast en leesbaarheid
    },
    secondary: {
      light: "#a2d9a6", // Lichte groenige tint voor accenten (ongewijzigd)
      main: "#4caf50", // Groene hoofdkleur voor belangrijke accenten (ongewijzigd)
      dark: "#357a38", // Donkere groentint voor nadruk op knoppen of selecties (ongewijzigd)
      contrastText: "#fff", // Witte tekst voor contrast tegen de secundaire kleur (ongewijzigd)
    },
    background: {
      default: "#f5f5f5", // Lichte achtergrondkleur voor de hoofdpagina
      paper: "#fafafa", // Zeer lichte achtergrond voor papieren elementen
    },
    text: {
      primary: "#333333", // Donkere grijstint voor primaire tekst
      secondary: "#666666", // Medium grijze tekst voor secundaire tekst
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#5a5a5a", // Donkere grijstint, maar nog steeds lichter dan de hoofdkleur
      main: "#333333", // Donkere neutrale grijstint als hoofdkleur
      dark: "#333232", // Bijna zwart als de donkere grijstint
      contrastText: "#fff", // Witte tekst voor contrast
    },
    secondary: {
      light: "#a2d9a6", // Lichte groenige tint voor accenten
      main: "#4caf50", // Groene hoofdkleur voor belangrijke accenten
      dark: "#357a38", // Donkere groentint voor nadruk op knoppen of selecties
      contrastText: "#fff", // Witte tekst voor contrast tegen de secundaire kleur
    },
    background: {
      default: "#0f0f0f", // Zeer donkere achtergrondkleur voor een dramatisch effect
      paper: "#1a1a1a", // Nog donkere achtergrond voor papieren elementen
    },
    text: {
      primary: "#e0e0e0", // Iets minder scherpe witte tekst voor primaire inhoud
      secondary: "#8c8c8c", // Donkere grijze tekst voor secundaire inhoud
    },
  },
});
