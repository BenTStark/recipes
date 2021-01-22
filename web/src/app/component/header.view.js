import React, { Component } from "react";
import { Link } from "react-router-dom";
import '../scss/header.scss';

export class HeaderView extends Component {
  getItems() {
    return {
      headerList: [
        {
          link: "/",
          headerText: "Rezeptliste",
        },
        {
          link: "/reacttable",
          headerText: "react-table",
        },
        {
          link: "/administration",
          headerText: "Verwaltung",
        }
      ]
    };
  }

  render() {
    return (
      <div>
        <nav>
          <ul className="containerNavigation">
            {this.getItems().headerList.map(
              (item, index) =>
                (
                  <li key={item.headerText} className="navigationListItem">
                    <Link to={item.link}>{item.headerText}</Link>
                  </li>
                )
            )}
          </ul>
        </nav>
      </div>
    );
  }
}

export default HeaderView;
