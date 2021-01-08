import React, {Component, useContext} from 'react';
import {Accordion, AccordionContext, Card, Button, Badge,  useAccordionToggle } from 'react-bootstrap';
// import Card from 'react-bootstrap/Card';
// import Button from 'react-bootstrap/Button';

import axios from 'axios';
import _ from 'lodash';
import "../scss/ordinary.scss";

const API_URL = 'http://localhost:5000'

export class Home extends Component {
    constructor(props) {
      super(props)
      this.state = { 
        data: [],
        nextId: -1,
      }

      this.postData = this.postData.bind(this)
    }

    getData() {
      axios({
        method: 'get',
        url: API_URL + '/recipe/list'
      }).then((response) => {
        this.setState({
          data: response.data.payload,
          nextId: response.data.nextId
        })
      })
    }

    // Fetch Data after mount
    componentDidMount() {
      this.getData()
    }

    postData() {
      console.log("Save")
    }

    render() {
        return (
            <div>
              <h1>
                Willkommen bei der Rezeptliste
              </h1>
              <Accordion>
              {this.state.data.map((recipe,index) => {
                const i = index + 1
                return (  
                    <Card key={i}>
                      <Card.Header>
                        <ContextAwareToggle eventKey={i} onSave={this.postData} tags={recipe.tags}>{recipe.name} ({recipe.duration} Min)</ContextAwareToggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey={i}>
                        <Card.Body>Hier ist das Rezept zu {recipe.name}</Card.Body>
                      </Accordion.Collapse>
                    </Card>        
              )})}
              </Accordion>
            </div>

        )
    }


}

function ContextAwareToggle({ children, onSave, tags, eventKey, callback }) {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <div className="recipeContainer">
      <Button
        variant="link"
        onClick={decoratedOnClick}
        className="recipeHeaderItem"
      >{children}</Button>
      {tags.map((tag,index) => {
        const color = (tag_group) => {
          switch(tag_group){
            case "Zeit":  
              return "primary"
            case "Zutaten":  
              return "success"
            default:
              return "warning"
          }
        }

        return (
          <Badge 
            pill
            variant={color(tag.tag_group)}
            key={index} 
            className="recipeHeaderItem"
          >
            {tag.tag_name}
          </Badge>
        )
      })}
      <Button
        variant={isCurrentEventKey ? "dark" : "light"}
        onClick={() => {decoratedOnClick(); onSave()}}
        className="recipeHeaderItemEnd recipeHeaderItem"
      >
        Edit
      </Button>
    </div>
  );
}
export default Home;