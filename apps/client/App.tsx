// create a new file called Main.tsx in the client folder this will be the root of the react based ui of the project, this file will be the entry point of the react app, use a proper router to navigate between different pages of the app
import React from "react";
import { Route, Routes } from "react-router-dom";
import SjorcraftEditor from "./components/SjorcraftEditor";

// add browser router and route to the app
//@ts-ignore
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<SjorcraftEditor />} />
    </Routes>
  );
};

export default App;
