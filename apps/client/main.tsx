import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../style.css";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@mui/material";
import { defaultTheme } from "./contexts/colourContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <React.Suspense fallback="loading">
          <Analytics />
          <ThemeProvider theme={defaultTheme}>
            <App />
          </ThemeProvider>
        </React.Suspense>
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (e) {
  console.error(e);
}
