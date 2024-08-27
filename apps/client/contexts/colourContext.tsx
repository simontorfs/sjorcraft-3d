import { createTheme } from "@mui/material/styles";

export const defaultTheme = createTheme({
  palette: {
    primary: {
      light: "#b7dfb2",
      main: "#2a6e3c",
      dark: "#0a4b0f",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#5a5a5a", // Donkere grijstint, maar nog steeds lichter dan de hoofdkleur
      main: "#333333", // Donkere neutrale grijstint als hoofdkleur
      dark: "#1a1a1a", // Bijna zwart als de donkere grijstint
      contrastText: "#fff", // Witte tekst voor contrast
    },
    secondary: {
      light: "#ff6e68", // Donkere tint van rood
      main: "#d32f2f", // Diepe, donkere rode hoofdkleur voor accenten
      dark: "#9a0007", // Zeer donkere tint van rood
      contrastText: "#000", // Zwarte tekst voor contrast
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
