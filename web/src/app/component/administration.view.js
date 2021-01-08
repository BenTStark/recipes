import React, { Component } from "react";
import {Tabs, Tab} from 'react-bootstrap';
import List from './list.view.js'

export class Administration extends Component {
  render() {
    return (
      <div>
        <h1>Administration Table</h1>
        <List
                title={'Ingredients'}
                apiPutRefresh={false}
                endpoint={'ingredient'}
                columns={{
                  ingredient_id: {
                    alias: 'ID',
                    value: undefined,
                    visibility: true,
                    editable: false,
                    isPrimaryKey: true,
                    autoFill: true,
                  },
                  name: {
                    alias: 'Ingredient',
                    value: undefined,
                    visibility: true,
                    editable: true,
                    isPrimaryKey: false,
                    autoFill: false,
                  },
                  description: {
                    alias: 'Description',
                    value: undefined,
                    visibility: true,
                    editable: true,
                    isPrimaryKey: false,
                    autoFill: false,
                  }
                }}
              />
        {
        // <Tabs defaultActiveKey="ingredient" id="uncontrolled-tab">
        //   <Tab eventKey="ingredient" title="Ingredients">
        //     <List
        //         title={'Ingredients'}
        //         id={'ingredient_id'}
        //         endpoint={'ingredient'}
        //         columns={{
        //           ingredient_id: {
        //             alias: 'ID',
        //             value: '',
        //             visibility: true,
        //           },
        //           name: {
        //             alias: 'Ingredient',
        //             value: '',
        //             visibility: true,
        //           },
        //           description: {
        //             alias: 'Description',
        //             value: '',
        //             visibility: true,
        //           }
        //         }}
        //       />
        //   </Tab>
        //   <Tab eventKey="spice" title="Spices">
        //     <List
        //         title={'Spices'}
        //         id={'spice_id'}
        //         endpoint={'spice'}
        //         columns={{
        //           name: ''
        //         }}
        //       />
        //   </Tab>
        //   <Tab eventKey="condition" title="Condition">
        //     <List
        //         title={'Condition'}
        //         id={'condition_id'}
        //         endpoint={'condition'}
        //         columns={{
        //           name: ''
        //         }}
        //       />
        //   </Tab>
        //   <Tab eventKey="tag" title="Tags">
        //     <List
        //         title={'Tags'}
        //         id={'tag_id'}
        //         endpoint={'tag'}
        //         columns={{
        //           tag_group: '',
        //           name: '',
        //         }}
        //       />
        //   </Tab>
        //   <Tab eventKey="quantity" title="Quantity Types">
        //     <List
        //       title={'Quantity Types'}
        //       id={'quantity_type_id'}
        //       endpoint={'quantity_type'}
        //       columns={{
        //         quantity_type: '',
        //         abbreviation: '',
        //       }}
        //     />
        //   </Tab>
        // </Tabs>
        }
        
      </div>
    );
  }
}

export default Administration;
