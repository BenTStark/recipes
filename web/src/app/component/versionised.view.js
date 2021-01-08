import React, { Component } from "react";
import { CSVReader } from 'react-papaparse'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import axios from 'axios';
import _ from 'lodash';
import "../scss/versionised.scss";

const API_URL = 'http://192.168.178.44:5000/versionised'

// TO DO: aktuell muss nach csv upload immer pro Zeile neu gelaen werden. Kann das mit einem Promise auch erst am ende geschehen?

export class Versionisied extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      data: [],
      nextId: -1,
      columns: {
        normal_col: '',
        update_col: '',
        ignore_col: '',
      },
      submitIsLoading: false,
      edit: {
        editId: -1,
        columns: {
          normal_col: '',
          update_col: '',
          ignore_col: '',
        }
      }
    } 

    this.onChangeItem = this.onChangeItem.bind(this);
    this.handleSubmitItem = this.handleSubmitItem.bind(this);
    this.handleOnDrop = this.handleOnDrop.bind(this);
    this.handleOnError = this.handleOnError.bind(this);
  }
  // Function to get Data from REST API
  getData() {
    axios({
      method: 'get',
      url: API_URL
    }).then((response) => {
      this.setState({
        data: response.data.payload,
        nextId: response.data.nextVal
      })
    })
  }
  // Function to post Data to REST API
  // isStateless: update component State: True/False
  postData(id,columns,isStateless) {
    this.setState({submitIsLoading: true})
    axios({
      method: 'post',
      headers: {"Access-Control-Allow-Origin": "*"},
      url: API_URL,
      data: {
        id: id,
        ...columns,
      }
    }).then((response) => { 
      if (!isStateless) {       
        // Add submitted Item to state.
        this.setState(state => {
          const data = [...state.data,{id: id, ...columns}]
          return {
            data,
            nextId: response.data.nextVal,
            submitIsLoading: false
          };
        })
      }
    })
  }
  // Delete Item and Update State
  deleteData(id) {
    axios({
      method: 'delete',
      url: API_URL,
      data: {
        id: id
      }
    }).then((response) => {
      this.setState(state => {
        const data = state.data.filter(item => id !== item.id);
        return {
          data,
        };
      });
    })
  }

  // Function after pressing delete Button if Ordinary Item
  // State is automatically updated afterwards
  deleteItem(i,state)  {
    this.deleteData(i);
    this.setState(prevState => ({
      edit: {
        ...prevState.edit,
        editId: -1
      }
    }));
  };
  // Cancel when Item in Editmode. editId is set back to -1
  cancelItem(i,state)  {
    this.setState(prevState => ({
      edit: {
        ...prevState.edit,
        editId: -1
      }
    }));
  };
  // Function to call when "Save" Button is clicked. Starts REST API POST. State update has to be done with get Data,
  // since, versionised table logic is not implemented in frontend
  putItem(id,state)  {
    this.postData(id,this.state.edit.columns,true);
    this.setState(prevState => ({
      edit: {
        ...prevState.edit,
        editId: -1
      }
    }));
    this.getData();
  };
  // Function to call when "Edit" Button is clicked.
  // All other edit buttos are disabled and selected Item goes into Edit Mode.
  editItem(item,state)  {
    this.setState(prevState => {
      // Object assign in order to prevent modification of state without setState.
      const columns = Object.assign({}, item);
      delete columns.id
      return {
        edit: {
          editId: item.id,
          columns: columns
        }
      }
    });
  };

  // Fetch Data after mount
  componentDidMount() {
    this.getData()
  }

  // Update state after input filed in submit form
  onChangeItem(event) {
    this.setState(prevState => {
      const newColumns = prevState.columns
      newColumns[event.target.name] = event.target.value
      return {
        columns: newColumns 
    }});    
  }
  // Update state after input filed in EditMode of (Row in table)
  onChangeEditItem(event) {
    this.setState(prevState => {
      const newColumns = prevState.edit.columns
      newColumns[event.target.name] = event.target.value
      return {
        edit: {
          ...prevState.edit,
          columns: newColumns
        }
      }
    });
  };    
  // Handle Form Submit, i.e. send data to database 
  // and update state.
  handleSubmitItem(event) {
    if (this.state.nextId > 0) {
      this.postData(this.state.nextId, this.state.columns,false)
      event.preventDefault();
    } else {
      alert('Cannot perform request. No API connection so far.')
    }
  }
  // Helper Function to check CSV File. 
  checkCSVMetaData(meta,metaTarget) {
    if (meta.length !== metaTarget.length) {
      console.log("Too many fields in CSV file.")
      return false
    }
    
    if (!_.isEqual(meta.sort(), metaTarget.sort())) {
      console.log("At least one column name in CSV does not match column name in table")
      return false
    }
    return true

  }
  // Drop CSV File on Drop Zone.
  handleOnDrop(data) {
    const meta = data[0].meta.fields
    const metaTarget = ['normal_col','update_col','ignore_col']
    if (this.checkCSVMetaData(meta,metaTarget))
    {
    data.map(item => {
      this.postData(this.state.nextId,item.data.columns,true)
      this.getData();
    })} else {
      console.log("The Fields in CSV have differences to table fields!")
    }
  };
  // If File Drop leads to Error
  handleOnError(err, file, inputElem, reason) {
    console.log(err)
  };

  render() {
    return (
      <div>
        <h1>Versionised Table</h1>
        <div className="container">
          <div className="InputContainer">
            <div className="inputField">
              <Form onSubmit={this.handleSubmitItem}>
                <Form.Group>
                  <Form.Label>Neuen Datenbankeintrag erzeugen</Form.Label>
                  <Form.Control controlId="normal" name="normal_col" type="text" placeholder="normal_col" onChange={this.onChangeItem}/>
                  <Form.Control controlId="update" name="update_col" type="text" placeholder="update_col" onChange={this.onChangeItem}/>
                  <Form.Control controlId="ignore" name="ignore_col" type="text" placeholder="ignore_col" onChange={this.onChangeItem}/>
                  <Form.Text className="text-muted">
                    Mit diesem Eingabefeld kann ein neuer Dateieintrag erzeugt werden.
                  </Form.Text>
                </Form.Group>
                <Button 
                  variant="primary"
                  type="submit" 
                  disabled={(this.state.submitIsLoading) ? "disabled" : ""}>
                    {(this.state.submitIsLoading) ? "... submitting" : "Submit"} 
                </Button>
              </Form>            
            </div>
            <div className="inputFile">
              <p>Mit dem folgenden Eingabefeld können CSVs hochgeladen werden:</p>
              <CSVReader
                onDrop={this.handleOnDrop}
                onError={this.handleOnError} 
                config={{
                  header: true
                }}
                style={{
                  dropArea: {
                    height: 100
                  }}}>
              <span>Drop CSV file here or click to upload.</span>
              </CSVReader>
            </div>
          </div>
          <div>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Normal Column</th>
                  <th>Update Column</th>
                  <th>Ignore Column</th>
                  <th>Delete/Edit</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.state.data.map((item,i) => {
                    return <VersionisedItem 
                              key={i} 
                              id={item.id} 
                              columns={item} 
                              edit={this.state.edit}
                              deleteItem={this.deleteItem.bind(this,item.id)}
                              cancelItem={this.cancelItem.bind(this,item.id)}
                              putItem={this.putItem.bind(this,item.id)}
                              editItem={this.editItem.bind(this,item)}
                              onChangeEditItem={this.onChangeEditItem.bind(this)}/>})
                }
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

function VersionisedItem(props) {
  // Active Edit Mode: Show Input field and "Cancel" and "Save" Button
  const activeEditModeOn = (id,editId) => {
    if (_.isEqual(id,editId)) {
      return true
    } else {
      return false
    }      
  }
  // Passive Edit Mode: Disabled "Edit" Field.
  const passiveEditModeOn = (editId) => {
    if (_.isEqual(-1,editId)) {
      return false
    } else {
      return true
    }      
  }

  return (
    <tr>
      {
        Object.keys(props.columns).map((item,i) => {
          let value = props.columns[item]
          return (
            <td key={i}>{(activeEditModeOn(props.columns.id,props.edit.editId) && !_.isEqual('id',item)) ? (
              <div>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>{item}</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl
                      type='text' 
                      name={item}
                      defaultValue={value}
                      onChange={props.onChangeEditItem}
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                    />
                  </InputGroup>
              </div>

            )
              : (<p>{value}</p>) }
              </td>)
            })}
        <td>{activeEditModeOn(props.columns.id,props.edit.editId) ? (
        <div>
          <Button variant="secondary" onClick={props.cancelItem}>Cancel</Button>{' '}
          <Button variant="secondary" onClick={props.putItem}>Save</Button>
        </div>)
        : (<div>
          <Button variant="secondary" 
            onClick={props.deleteItem}
            disabled={passiveEditModeOn(props.edit.editId)}>Delete</Button>{' '}
          <Button variant="secondary" 
            onClick={props.editItem}
            disabled={passiveEditModeOn(props.edit.editId)}>Edit</Button>
        </div>)}
      </td>
    </tr>
  )
}

export default Versionisied
