import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./home.view";
import Ingredients from "./ingredients.view";
import Administration from "./administration.view";

export class Main extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path="/">
            <Home/>
          </Route>
          <Route exact path="/administration">
            <Administration/>
          </Route>
        </Switch>
      </div>
    );
  }
}
export default Main;
