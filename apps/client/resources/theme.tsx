import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#424242",
      light: "#6d6d6d",
      dark: "#1b1b1b",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#9e9e9e",
      light: "#cccccc",
      dark: "#757575",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f44336",
      light: "#ff7961",
      dark: "#ba000d",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#ff9800",
      light: "#ffca28",
      dark: "#c66900",
      contrastText: "#000000",
    },
    info: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
      contrastText: "#ffffff",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
      contrastText: "#000000",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#000000",
      secondary: "#757575",
      disabled: "#bdbdbd",
    },
  },
});

export default theme;
