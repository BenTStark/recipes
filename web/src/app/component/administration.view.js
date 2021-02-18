import React, { Component } from "react";
import {Tabs, Tab, Row,Col,Nav, Button} from 'react-bootstrap';
import {List} from './list.view.js'
import {textFilter} from 'react-bootstrap-table2-filter';
import "../scss/administration.scss";

export class Administration extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            items: {
                ingredient: true,
                spice: false,
                condition: false,
                tag: false,
                quantity_type: false

            }
        } 
      }

    changeVisibility = (eventKey,event) => {
        let newItems = _.cloneDeep(this.state.items)
        Object.keys(newItems).map(key => {
            newItems[key] = false
        })
        newItems[eventKey] = true
        this.setState({items: newItems})
    }
  
   render() {
    return (
      <div>
        <h1>Administration Table</h1>
        <Nav variant="tabs" defaultActiveKey="spice">
            <Nav.Item>
                <Nav.Link 
                    eventKey="ingredient"
                    onSelect={this.changeVisibility}
                    name="ingredient">Ingredients</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="spice"
                    onSelect={this.changeVisibility}
                    name="spice">Spice</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="condition"
                    onSelect={this.changeVisibility}
                    name="condition">Condition</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link 
                    eventKey="tag"
                    onSelect={this.changeVisibility}
                    name="tag">Tag</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link
                    eventKey="quantity_type" 
                    onSelect={this.changeVisibility}
                    name="quantity_type">Quantity Types</Nav.Link>
            </Nav.Item>
        </Nav>
        <div id="ingredient" className={this.state.items.ingredient ? "visible" : "invisible"}>

           <List
          title={'Ingredients'}
          endpoint={'ingredient'}
          columns={[{
            dataField: 'ingredient_id',
            text: 'ID',
            sort: true,
            autofill: true,
            isPrimaryKey: true,
            alwaysHidden: true,
            hidden:true
          },
          {
            dataField: 'name',
            text: 'Ingredient',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          },
          {
            dataField: 'description',
            text: 'Description',
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          }]}
        />
        
        </div>
        <div id="spice" className={this.state.items.spice ? "visible" : "invisible"}>    
        
           <List
          title={'Spices'}
          endpoint={'spice'}
          columns={[{
            dataField: 'spice_id',
            text: 'ID',
            sort: true,
            autofill: true,
            isPrimaryKey: true,
            alwaysHidden: true,
            hidden:true
          },
          {
            dataField: 'name',
            text: 'Spice',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          }]}
        />
        </div>
        <div id="condition" className={this.state.items.condition ? "visible" : "invisible"}> 
       
           <List
          title={'Condition'}
          endpoint={'condition'}
          columns={[{
            dataField: 'condition_id',
            text: 'ID',
            sort: true,
            autofill: true,
            isPrimaryKey: true,
            alwaysHidden: true,
            hidden:true
          },
          {
            dataField: 'name',
            text: 'Condition',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          }]}
        />
        </div>
        <div id="tag" className={this.state.items.tag ? "visible" : "invisible"}> 
   
           <List
          title={'Tags'}
          endpoint={'tag'}
          columns={[{
            dataField: 'tag_id',
            text: 'ID',
            sort: true,
            autofill: true,
            isPrimaryKey: true,
            alwaysHidden: true,
            hidden:true
          },
          {
            dataField: 'name',
            text: 'Tag',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          },
          {
            dataField: 'tag_group',
            text: 'Tag group',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          }]}
        />
         </div>
        <div id="quantity_type" className={this.state.items.quantity_type ? "visible" : "invisible"}> 
      
           <List
          title={'Quantity Types'}
          endpoint={'quantity_type'}
          columns={[{
            dataField: 'quantity_type_id',
            text: 'ID',
            sort: true,
            autofill: true,
            isPrimaryKey: true,
            alwaysHidden: true,
            hidden:true
          },
          {
            dataField: 'quantity_type',
            text: 'Quantity Types',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          },
          {
            dataField: 'abbreviation',
            text: 'Abbreviation',
            sort: true,
            autofill: false,
            isPrimaryKey: false,
            filter: textFilter()
          }]}
        />
       </div>
        
      </div>
    );
  }
}

export default Administration;
