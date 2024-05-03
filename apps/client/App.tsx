// create a new file called Main.tsx in the client folder this will be the root of the react based ui of the project, this file will be the entry point of the react app, use a proper router to navigate between different pages of the app
import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import SjorcraftEditor from "./components/SjorcraftEditor";
import SjorcraftCanvas from "./components/SjorcraftCanvas";

// add browser router and route to the app
/* const App = () => {
  return (
    <Router>
      <Route path="/" Component={<SjorcraftEditor />} />
      <Route path="/editor" Component={<SjorcraftEditor />} />
    </Router>
  );
}; */

const App = () => {
  return (
    <>
      <h1>Test</h1>
      <canvas className="webgl"></canvas>
    </>
  );
};
export default App;
