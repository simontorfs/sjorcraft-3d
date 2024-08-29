// create a new file called Main.tsx in the client folder this will be the root of the react based ui of the project, this file will be the entry point of the react app, use a proper router to navigate between different pages of the app
import React from "react";
import { Route, Routes } from "react-router-dom";
import SjorcraftEditor from "./components/SjorcraftEditor";
import { darkTheme, defaultTheme } from "./contexts/colorContext";
import { ThemeProvider } from "@mui/material";
import { c } from "vite/dist/node/types.d-FdqQ54oU";

//@ts-ignore
const App = () => {
  const [isLightMode, setIsLightMode] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleLightmode = () => {
    setIsLightMode(!isLightMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ThemeProvider theme={isLightMode ? defaultTheme : darkTheme}>
      <Routes>
        <Route
          path="/"
          element={
            <SjorcraftEditor
              isLightMode={isLightMode}
              toggleLightmode={toggleLightmode}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
          }
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
