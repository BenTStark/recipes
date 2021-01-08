import { hot } from 'react-hot-loader/root';
import React, { Component } from "react";
import Header from "./component/header.view";
import Main from "./component/main.view";
import './app.scss';

export class AppView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Header />
        <Main />
      </div>
    );
  }
}

export default hot(AppView);
