import React, { Component } from "react";
import { CSVReader } from 'react-papaparse'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import axios from 'axios';
import _ from 'lodash';
import "../scss/list.scss";
import { sortObj } from  '../helpers/helpers' 

const API_URL = 'http://localhost:5000/'

// TO DO: aktuell muss nach csv upload immer pro Zeile neu gelaen werden. Kann das mit einem Promise auch erst am ende geschehen?

export class List extends Component {
  constructor(props) {
    super(props)

    var columns_pk = {}
    var columns_pk_autofill = {}
    var columns_no_autofill = {}
    var columns_all = {}
    Object.keys(this.props.columns).map(column => {
      columns_all[column] = this.props.columns[column].value
      if (this.props.columns[column].isPrimaryKey) {
        columns_pk[column] = this.props.columns[column].value
        if (this.props.columns[column].autoFill) {
          columns_pk_autofill[column] = this.props.columns[column].value
        }
      }
      if (!this.props.columns[column].autoFill) {
        columns_no_autofill[column] = this.props.columns[column].value
      }
    })

    this.state = { 
      data: [],
      submitIsLoading: false,
      apiPutRefresh: this.props.apiPutRefresh,
      meta: {
        columns_pk: columns_pk,
        columns_pk_autofill: columns_pk_autofill,
        columns_no_autofill: columns_no_autofill,
        columns_all: columns_all
      },
      editMode: {
        new: false,
        existing: false
      },
      edit: {
        columns_pk_autofill: {},
        columns_all: columns_all
      }
    } 

  //this.onChangeItem = this.onChangeItem.bind(this);
  //this.handleSubmitItem = this.handleSubmitItem.bind(this);
  this.handleOnDrop = this.handleOnDrop.bind(this);
  this.handleOnError = this.handleOnError.bind(this);
  this.addNewItem = this.addNewItem.bind(this);
  this.onChangeEditItem = this.onChangeEditItem.bind(this);
  this.cancelItem = this.cancelItem.bind(this);
  this.deleteItem = this.deleteItem.bind(this);
  this.editItem = this.editItem.bind(this);
  this.putItem = this.putItem.bind(this);
  this.postItem = this.postItem.bind(this);
  }
  // Function to get Data from REST API
  getData() {
    axios({
      method: 'get',
      url: API_URL + this.props.endpoint + '/list'
    }).then((response) => {
      this.setState({
        data: response.data.payload,
        edit: {
          ...this.state.edit,
          columns_pk_autofill: response.data.pk_autofill
        }
      })
    })
  }
  // Function to post Data to REST API
  // isStateless: update component State: True/False

  // id weg!!!!! TODO... CHECK ALL
  postData(columns_no_autofill,isStateless) {
    this.setState({submitIsLoading: true})
    axios({
      method: 'post',
      headers: {"Access-Control-Allow-Origin": "*"},
      url: API_URL + this.props.endpoint,
      data: columns_no_autofill
    }).then((response) => { 
      if (!isStateless) {       
        // Add submitted Item to state.
        this.setState(state => {
          const newItem = sortObj({...columns_no_autofill,...state.edit.columns_pk_autofill},Object.keys(state.meta.columns_all))
          const data = [...state.data,newItem]
          return {
            data,
            edit: {
              ...state.edit,
              columns_pk_autofill: response.data.pk_autofill
            },
            submitIsLoading: false
          };
        })
      }
    })
  }

    // Function to update Data in REST API
  putData(columns_all) {
    axios({
      method: 'put',
      url: API_URL + this.props.endpoint,
      data: columns_all
    }).then((response) => {
      if (this.state.apiPutRefresh) {
        this.setState(prevState => {
          const data = prevState.data.map(item => {
            var updatedItem = {}
            if (_.isEqual(_.pick(item,Object.keys(prevState.meta.columns_pk)),_.pick(columns_all,Object.keys(prevState.meta.columns_pk)))) {
              updatedItem = Object.assign({}, item)
              for (var key of Object.keys(columns_all)) {
                updatedItem[key] = columns_all[key]
              }  
            }
            return updatedItem; 
          });
          return {
            data,
          };
        })}
      else {
        this.getData()
      }
    })
  }

  // Delete Item and Update State
  deleteData(columns_pk) {  
    axios({
      method: 'delete',
      url: API_URL + this.props.endpoint,
      data: columns_pk
    }).then((response) => {
      this.setState(state => {
        const data = state.data.filter(item => !_.isEqual(columns_pk,_.pick(item,Object.keys(state.meta.columns_pk))));
        return {
          data,
        };
      });
    })
  }

  // Set edit in State to reset. i.e. no item is in editMode
  resetEdit() {
    this.setState(prevState => ({
      editMode: {
        new: false,
        existing: false
      },
      edit: {
        ...prevState.edit,
        columns_all: prevState.meta.columns_all
      }
    }));
  }

  // Function after pressing delete Button if Ordinary Item
  // State is automatically updated afterwards
  deleteItem(columns_pk)  {
    this.deleteData(columns_pk);
    this.resetEdit()
  };

  // Cancel when Item in Editmode. editId is set back to -1
  cancelItem()  {
    this.resetEdit()
  };

  // Function to call when "Save" Button is clicked for data update. Starts REST API PUT. State update has to be done with get Data,
  // since, versionised table logic is not implemented in frontend
  putItem(columns_all)  {
    this.putData(columns_all);
    this.resetEdit()
    //this.getData();
  };

  // Function to call when "Save" Button is clicked for new data append to database. Starts REST API POST.
  postItem(columns_no_autofill)  {
    this.postData(columns_no_autofill,false);
    this.resetEdit();
  };

  // Function to call when "Edit" Button is clicked.
  // All other edit buttos are disabled and selected Item goes into Edit Mode.
  editItem(columns_all)  {
    this.setState(prevState => {
      return {
        editMode: {
          new: false,
          existing: true
        },
        edit: {
          ...prevState.edit,
          columns_all: columns_all
        }
      }
    });
  };

  // Function to call when "Add New" Button is clicked.
  addNewItem() {
    var editColumnsAll = Object.assign({}, {...this.state.edit.columns_all,...this.state.edit.columns_pk_autofill})
    this.setState(prevState => ({
      editMode: {
        new: true,
        existing: false
      },
      edit: {
        ...prevState.edit,
        columns_all: editColumnsAll
      }
    }));
  }


  // Fetch Data after mount
  componentDidMount() {
    this.getData()
  }

    // Update state after input filed in submit form
    // deprecated!!!
    onChangeItem(event) {
        this.setState(prevState => {
            const newColumns = prevState.columns
            newColumns[event.target.name] = event.target.value
            return {
                columns: newColumns 
            }
        });    
    }

  // Update state after input filed in EditMode of (Row in table)
  onChangeEditItem(event) {
    this.setState(prevState => {
      const newColumns = Object.assign({},prevState.edit.columns_all)
      newColumns[event.target.name] = event.target.value
      return {
        edit: {
          ...prevState.edit,
          columns_all: newColumns
        }
      }
    });
  };   

    // Handle Form Submit, i.e. send data to database 
    // and update state.
    // deprecated!!!
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
    const metaTarget = Object.keys(this.state.meta.columns_no_autofill)
    if (this.checkCSVMetaData(meta,metaTarget)) {
      data.map(item => {
        this.postData(item.data.info,true)
        this.getData();
      })
    } else {
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
        <h1>{this.props.title}</h1>
        <div className="container">
          <div className="InputContainer">
            {
            // <!-- start  deprecated -->
            // <div className="inputField">
            //   <Form onSubmit={this.handleSubmitItem}>
            //     <Form.Group controlId="formBasicEmail">
            //       <Form.Label>Neuen Datenbankeintrag erzeugen</Form.Label>
            //         {Object.keys(this.state.columns).map((key,index) => {
            //             return (
            //                 <Form.Control key={index} controlid={key} name={key} type="text" placeholder={key} onChange={this.onChangeItem}/>
            //             )
            //         })}
            //       <Form.Text className="text-muted">
            //         Mit diesem Eingabefeld kann ein neuer Dateieintrag erzeugt werden.
            //       </Form.Text>
            //     </Form.Group>
            //     <Button 
            //       variant="primary"
            //       type="submit" 
            //       disabled={(this.state.submitIsLoading) ? "disabled" : ""}>
            //         {(this.state.submitIsLoading) ? "... submitting" : "Submit"} 
            //     </Button>
            //   </Form>            
            // </div>
            // <!--  end deprecated -->
                  }
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
            <h2>{this.props.title}</h2>
            <Button 
              variant="outline-dark" 
              onClick={this.addNewItem}
              disabled={this.state.editMode.new || this.state.editMode.existing}>Add Item</Button>
            <Table striped bordered hover>
              <thead>
                <tr>
                  { Object.keys(this.state.meta.columns_all).map((column,index) => {
                    return (
                      <th key={index}>{column}</th>
                    )
                  })}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {// First row is input for new data records. Visibile when "Add New" Button is clicked.
                (this.state.editMode.new &&
                  <ListItem 
                  columns_all={this.state.edit.columns_all} 
                  columns_edit_status={{..._.mapValues(this.state.meta.columns_all, () => true),..._.mapValues(this.state.meta.columns_pk_autofill, () => false)}}
                  isActive={this.state.editMode.new}
                  globalEditMode={this.state.editMode.new || this.state.editMode.existing}
                  deleteItem={() => {}}
                  editItem={() => {}}  
                  cancelItem={this.cancelItem}
                  saveItem={this.postItem.bind(this,_.pick(this.state.edit.columns_all,Object.keys(this.state.meta.columns_no_autofill)))} 
                  onChangeEditItem={this.onChangeEditItem}/>
                )}
                {// Rows with data coming from database
                this.state.data.map((item,i) => {
                  return <ListItem 
                            key={i}  
                            columns_all={item} 
                            columns_edit_status={{..._.mapValues(this.state.meta.columns_all, () => true),..._.mapValues(this.state.meta.columns_pk, () => false)}}
                            isActive={this.state.editMode.existing && _.isEqual(_.pick(this.state.edit.columns_all,Object.keys(this.state.meta.columns_pk)),_.pick(item,Object.keys(this.state.meta.columns_pk)))}
                            globalEditMode={this.state.editMode.new || this.state.editMode.existing}
                            deleteItem={this.deleteItem.bind(this,_.pick(item,Object.keys(this.state.meta.columns_pk)))}
                            editItem={this.editItem.bind(this,item)}
                            cancelItem={this.cancelItem}
                            saveItem={this.putItem.bind(this,this.state.edit.columns_all)}
                            onChangeEditItem={this.onChangeEditItem}/>})
                }
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

function ListItem({columns_all, columns_edit_status, isActive, globalEditMode, deleteItem, editItem, cancelItem, saveItem, onChangeEditItem}) {
  return (
    <tr>
      {Object.keys(columns_all).map((column,i) => {
        let value = columns_all[column]
        return (
          <td key={i}>{(columns_edit_status[column] && isActive) ? (
            <div>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>{column}</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                  type='text' 
                  name={column}
                  defaultValue={value}
                  onChange={onChangeEditItem}
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                />
              </InputGroup>
            </div>
            ) : (
            <p>{value}</p>) }
          </td>
        )
      })}
      <td>{isActive ? (
        <div>
          <Button variant="secondary" onClick={cancelItem}>Cancel</Button>{' '}
          <Button variant="secondary" onClick={saveItem}>Save</Button>
        </div>
        ) : (
        <div>
          <Button variant="secondary" 
            onClick={deleteItem}
            disabled={globalEditMode}>Delete</Button>{' '}
          <Button variant="secondary" 
            onClick={editItem}
            disabled={globalEditMode}>Edit</Button>
        </div>)}
      </td>
    </tr>
  )
}

export default List
