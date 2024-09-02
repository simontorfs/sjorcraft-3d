// create a new file called Main.tsx in the client folder this will be the root of the react based ui of the project, this file will be the entry point of the react app, use a proper router to navigate between different pages of the app
import React, { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import SjorcraftEditor from "./components/SjorcraftEditor";
import { darkTheme, defaultTheme } from "./contexts/colorContext";
import { ThemeProvider } from "@mui/material";
import { RendererContext } from "./contexts/rendererContext";
import { Color } from "three";

//@ts-ignore
const App = () => {
  const [isLightMode, setIsLightMode] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [floorColor, setFloorColor] = React.useState<string>("#2a6e3c");
  const [isGrassTexture, setIsGrassTexture] = React.useState(false);

  const toggleLightmode = () => {
    setIsLightMode(!isLightMode);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleFloorTexture = () => {
    setIsGrassTexture(!isGrassTexture);
  };

  const updateFloorColor = (color: string) => {
    setFloorColor(color);
  };

  const parameterObject = {
    isLightMode: isLightMode,
    toggleLightmode: toggleLightmode,
    isSidebarOpen: isSidebarOpen,
    toggleSidebar: toggleSidebar,
    floorColor: floorColor,
    setFloorColor: setFloorColor,
    isGrassTexture: isGrassTexture,
    toggleFloorTexture: toggleFloorTexture,
  };

  return (
    <ThemeProvider theme={isLightMode ? defaultTheme : darkTheme}>
      <Routes>
        <Route
          path="/"
          element={<SjorcraftEditor parameterObject={parameterObject} />}
        />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
