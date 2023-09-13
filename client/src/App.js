import React from "react";
import SettingsBar from "./components/SettingsBar";
import ToolBar from "./components/ToolBar";
import Canvas from "./components/Canvas";
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom'
import "./styles/app.scss";


const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Switch>
          <Route path='/:id'>
            <ToolBar />
            <SettingsBar />
            <Canvas />
          </Route>
          {/* при открытие сыйта будет создаваться уникальный id */}
          <Redirect to={`f${(+new Date).toString(16)}`} />
        </Switch>
      </div>
    </BrowserRouter>
  );
};


export default App;
