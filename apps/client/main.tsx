import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../style.css";
import { BrowserRouter } from "react-router-dom";
import { Viewer } from "../3d/src/viewer";
import { ThemeProvider, createTheme } from "@mui/material";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const theme = createTheme({
  palette: {
    primary: {
      light: "#757ce8",
      main: "#424242",
      dark: "#002884",
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

try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <React.Suspense fallback="loading">
          <ThemeProvider theme={theme}>
            <App />
          </ThemeProvider>
        </React.Suspense>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (e) {
  console.error(e);
} finally {
  const script = document.createElement("script");
  script.type = "module";
  script.src = "./script.ts";
  document.body.appendChild(script);
}
