import React, { Component } from "react";
import { CSVReader } from 'react-papaparse'
import Button from 'react-bootstrap/Button';
import {Modal, Col, Spinner} from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory from 'react-bootstrap-table2-filter';
import cellEditFactory from 'react-bootstrap-table2-editor';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Select from 'react-select'
import makeAnimated from 'react-select/animated';

import axios from 'axios';
import _ from 'lodash';
import "../scss/list.scss";

const API_URL = 'http://localhost:5000/'
const animatedComponents = makeAnimated();
// TO DO: aktuell muss nach csv upload immer pro Zeile neu gelaen werden. Kann das mit einem Promise auch erst am ende geschehen?

export class List extends Component {
  constructor(props) {
    super(props)

    const testdata = [{ingredient_id: 2, name: "Hirse", description: ""}
        , {ingredient_id: 3, name: "Dinkelmehl", description: ""}
        , {ingredient_id: 4, name: "Eier", description: "Protein"}
        , {ingredient_id: 8, name: "Tomate", description: "Histamin, Säure"}
        , {ingredient_id: 6, name: "Gurke", description: "Basisliste"}
        , {ingredient_id: 9, name: "Kartoffel", description: ""}
        , {ingredient_id: 1, name: "Hokkaido Kürbis", description: ""}
        , {ingredient_id: 11, name: "Litschi", description: null}]
    
    //-----------------------------------------
    // Modification of props/enrich props
    //-----------------------------------------
    // add onSort function to props, if sort is True. 
    // onSort makes save event to localStorage
    this.props.columns.map(column => {
        if (_.isEqual(column.sort,true)) {
            column['onSort'] = this.onSort
        }
    })

    let columnsGlanced = this.props.columns
    this.props.columns.map((column,index) => {
        if (!("hidden" in column)) {
            columnsGlanced[index]["hidden"] = false
        }
        if (column.alwaysHidden) {
            columnsGlanced[index]["hidden"] = true
        }
    })
    let selectOptions = []
    columnsGlanced.map(column => {
        if (!column.alwaysHidden) {
            selectOptions.push({value: column.dataField, label: column.text, hidden: column.hidden === undefined ? false : column.hidden })
        }
    })
    console.log(selectOptions)
    //-----------------------------------------
    // Local Storage Handling
    //-----------------------------------------
    // Local Storage for Table Sort, Pagesize and Pagenumber
    let localStorageName = ''
    let localStorageParameters = {
        defaultPagination: {
            value: 5, 
            name: 'Page'
        },
        defaultPage: {
            value: 1,
             name: 'PageSize'
            },
        defaultSorted: {
            value: [{
                    dataField: this.props.columns[0].dataField,
                    order: 'asc'
                }], 
            name: 'Sorted'
        },
        defaultColumnsVisible: {
            value: selectOptions,
            name: 'ColumnsVisible'
        }
        ,
        defaultColumns: {
            value: columnsGlanced,
            name: 'Columns'
        }
    }
    Object.keys(localStorageParameters).map(key => {
        localStorageName = this.props.endpoint + localStorageParameters[key].name
        if (localStorage.getItem(localStorageName) !== undefined && localStorage.getItem(localStorageName) !== null)  {
            // default columns has function as property. Only "hidden" property necessary 
            if (key === "defaultColumns") {
                const localStorageItem = JSON.parse(localStorage.getItem(localStorageName))
                localStorageItem.map(columnStorage => {
                    localStorageParameters[key].value.map((column,index) => {
                        if (columnStorage.dataField === column.dataField) {
                            localStorageParameters[key].value[index].hidden = columnStorage.hidden
                        }
                    })
                })
            } else {
            localStorageParameters[key].value = JSON.parse(localStorage.getItem(localStorageName))
            }

        }
    })
  
    this.state = { 
      data: testdata, 
      loadingData: true,
      autofill: {ingredient_id: 11}, 
      columns: localStorageParameters.defaultColumns.value,
      localStorageNameColumns: this.props.endpoint + localStorageParameters.defaultColumns.name,
      selectOptions: localStorageParameters.defaultColumnsVisible.value,
      localStorageNameColumnsVisible: this.props.endpoint + localStorageParameters.defaultColumnsVisible.name,
      keyField: this.props.columns[0].dataField, 
      selected: [], 
      defaultSorted: localStorageParameters.defaultSorted.value, 
      defaultPagination: localStorageParameters.defaultPagination.value,
      defaultPage: localStorageParameters.defaultPage.value,
      localStorageNameSorted: this.props.endpoint + localStorageParameters.defaultSorted.name,
      localStorageNamePagination: this.props.endpoint + localStorageParameters.defaultPagination.name,
      localStorageNamePage: this.props.endpoint + localStorageParameters.defaultPage.name, 
      submitIsLoading: false, 
      modalShow: false, 
      edit: {} 
    } 
  }
  // Function to get Data from REST API
  getData = () => {
    this.setState({loadingData: true})
    axios({
      method: 'get',
      url: API_URL + this.props.endpoint + '/list'
    }).then((response) => {
      this.setState({
        autofill: response.data.pk_autofill,
        data: response.data.payload,
        loadingData: false
      })
    })
  }
  // Function to post Data to REST API
  // isStateless: update component State: True/False

  // id weg!!!!! TODO... CHECK ALL
  postData = (columns_no_autofill,isStateless) => {
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
          const newItem = {...columns_no_autofill,...this.state.autofill}
          const data = [...state.data,newItem]
          return {
            data,
            autofill: response.data.pk_autofill,
            submitIsLoading: false
          };
        })
       }
    })
  }

  // Function to update Data in REST API; state update happens implicitly
  putData = (columns_all) => {
    axios({
      method: 'put',
      url: API_URL + this.props.endpoint,
      data: columns_all
    })
  }

  // Delete Item and Update State
  deleteData = () => {
    this.state.selected.map(keyFieldValue => {    
        axios({
            method: 'delete',
            headers: { 
                'Content-Type': 'application/json'
            },
            url: API_URL + this.props.endpoint,
            data: this.state.data.filter(item => _.isEqual(item[this.state.keyField],keyFieldValue)).map(item => _.pick(item,this.state.columns.filter(column => _.isEqual(column.isPrimaryKey,true)).map(column => column.dataField)))[0]
          }).then(() => {
            this.setState({
                data: this.state.data.filter(item => !_.isEqual(item[this.state.keyField],keyFieldValue)),
                selected: this.state.selected.filter(item => !_.isEqual(item,keyFieldValue))
            })
        })  
    })
  }

  // Set edit in State to reset. i.e. no item is in editMode
  resetEdit = () => {
    this.setState({edit: {}});
  }

  // Function after pressing delete Button if Ordinary Item
  // State is automatically updated afterwards
  deleteItem = () =>  {
    this.deleteData();
  };

  // Function to call when "Save" Button is clicked for new data append to database. Starts REST API POST.
  postItem = () =>  {
    this.setModalShow()
    this.postData(_.omit(this.state.edit,Object.keys(this.state.autofill)),false);
    this.resetEdit();
  };

  // Function to call when "Add New" Button is clicked.
  addNewItem = () => {
    const edit = {} 
    this.props.columns.map(column => {
        if (column.dataField in this.state.autofill) {
            edit[column.dataField] = this.state.autofill[column.dataField]
        }
    })
    this.setState(prevState => {
        return {
            modalShow: true,
            edit: {
                ...prevState.edit,
                ...edit
            }

        }
    })
  }

  // Fetch Data after mount
  componentDidMount = () => {
    this.getData()
  }

  // Update state after input field in EditMode of (Row in table)
  onChangeEdit = (event) => {
    this.setState(prevState => {
      const newEdit = Object.assign({},prevState.edit)
      newEdit[event.target.name] = event.target.value
      return {
        edit: newEdit
      }
    });
  };   

  // Helper Function to check CSV File. 
  // ToDO: Check pk columns for uniqueness
  checkCSVMetaData = (meta,metaTarget) => {
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
  handleOnDrop = (data) => {
    // Close Modal
    this.setModalShow();
    const meta = data[0].meta.fields
    const metaTarget = [] 
    this.state.columns.map(column => column.autofill ? null : metaTarget.push(column.dataField))
    // Object.keys(this.state.meta.columns_no_autofill)
    if (this.checkCSVMetaData(meta,metaTarget)) {
      data.map(item => {
        this.postData(_.omit(item.data,Object.keys(this.state.autofill)),true)
        this.getData();
      })
    } else {
      console.log("The Fields in CSV have differences to table fields!")
    }
  };
  // If File Drop leads to Error
  handleOnError = (err, file, inputElem, reason) => {
      console.log(err)
  };

  // Hide or Show Modal for Add Net Item Modal.
  setModalShow = () => {
      this.setState(prevState => {
        return {
            modalShow: !prevState.modalShow 
        }
    });    
  }

  handleOnSelect = (row, isSelect) => {
    if (isSelect) {
      this.setState({selected: [...this.state.selected, row[this.state.keyField]]});
    } else {
      this.setState({selected: this.state.selected.filter(x => x !== row[this.state.keyField])});
    }
  }

  // Function will save sort Options to LocalStorage and update State
  onSort = (field, order) => {
      localStorage.setItem(this.state.localStorageNameSorted,JSON.stringify([{
        dataField: field,
        order: order
      }]))
      this.setState({defaultSorted:[{
        dataField: field,
        order: order
      }] })
  }

  handleOnSelectAll = (isSelect, rows) => {
    const ids = rows.map(r => r[this.state.keyField]);
    if (isSelect) {
      this.setState(() => ({
        selected: ids
      }));
    } else {
      this.setState(() => ({
        selected: []
      }));
    }
  }

  afterSaveCell = (oldValue, newValue, row, column) =>{
    if (!_.isEqual(oldValue,newValue)) {
        // state update happens implicitly
        this.putData(row)
    }
  }

  // When Multi Select is Changed, the visibility of the columns is updated
  selectVisibleColumns = (options,action) => {
    let columns =_.cloneDeep(this.state.columns)
    let columnIndex = -1
    let selectOptions =_.cloneDeep(this.state.selectOptions)
    
    switch(action.action) {
        case "remove-value":
            columnIndex = columns.findIndex((column => column.dataField === action.removedValue.value));
            columns[columnIndex]["hidden"] = true
            columnIndex = selectOptions.findIndex((option => option.value === action.removedValue.value));
            selectOptions[columnIndex]["hidden"] = true
            this.setState({columns})
            break;
        case "select-option":
            // One could also sort the "options" compared to this.state.columns
            columnIndex = columns.findIndex((column => column.dataField === action.option.value));
            columns[columnIndex]["hidden"] = false
            columnIndex = selectOptions.findIndex((option => option.value === action.option.value));
            selectOptions[columnIndex]["hidden"] = false
            this.setState({columns})
            break;
    }
    localStorage.setItem(this.state.localStorageNameColumns,JSON.stringify(columns))
    localStorage.setItem(this.state.localStorageNameColumnsVisible,JSON.stringify(selectOptions))
  }

  render() {
    const selectRow = {
        mode: 'checkbox',
        clickToSelect: false,
        clickToEdit: true,
        selected: this.state.selected,
        onSelect: this.handleOnSelect,
        onSelectAll: this.handleOnSelectAll
    };

    const sizePerPageOptionRenderer = ({
        text,
        page,
        onSizePerPageChange
      }) => (
        <li
          key={ text }
          role="presentation"
          className="dropdown-item"
        >
          <a
            href="#"
            tabIndex="-1"
            role="menuitem"
            data-page={ page }
            onMouseDown={ (e) => {
              e.preventDefault();
              onSizePerPageChange(page);
            } }
            style={ { color: 'black' } }
          >
            { text }
          </a>
        </li>
      );
    
    const paginationOptions = {
        sizePerPageOptionRenderer,
        sizePerPageList: [
            {
                text: '5', value: 5
              }, {
                text: '10', value: 10
              }, {
                text: '50', value: 50
              }, {
                text: '100', value: 100
              }, {
                text: 'Alle', value: this.state.data.length
              }
        ],
        firstPageText: 'First',
        prePageText: 'Back',
        nextPageText: 'Next',
        lastPageText: 'Last',
        page:  Math.ceil(this.state.data.length/this.state.defaultPagination) < this.state.defaultPage ? Math.ceil(this.state.data.length/this.state.defaultPagination) : this.state.defaultPage,
        sizePerPage: this.state.defaultPagination,
        onPageChange: (page, sizePerPage) => {
            localStorage.setItem(this.state.localStorageNamePage,JSON.stringify(page))
            this.setState({defaultPage: page })
        },
        onSizePerPageChange: (sizePerPage, page) => {
            localStorage.setItem(this.state.localStorageNamePagination,JSON.stringify(sizePerPage))
            this.setState({defaultPagination: sizePerPage })
        }
      };
    return (
      <div>
          <div>
            <h2>{this.props.title}</h2>
            {this.state.loadingData ? (
            <Spinner animation="border" />) : (
            <div>
                <Button 
                variant="primary" 
                onClick={this.addNewItem}>Add Item</Button>
                <Button 
                variant="light" 
                onClick={this.deleteData}
                disabled={this.state.selected.length === 0 || this.state.columns.filter(column => {return column.hidden === false && column.alwaysHidden === undefined}).length < 1}>Delete</Button>
                <Select 
                    defaultValue={Object.values(_.pickBy(this.state.selectOptions,(value,key)=> {
                        return !value.hidden}))}
                    isMulti
                    options={this.state.selectOptions} 
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isClearable={false}
                    onChange={this.selectVisibleColumns}
                    name={this.props.endpoint}
                />
                <BootstrapTable 
                    keyField={this.state.keyField} 
                    data={ this.state.data } 
                    columns={ this.state.columns } 
                    bootstrap4={true}  
                    selectRow={ selectRow }
                    defaultSorted={ this.state.defaultSorted }
                    cellEdit={ cellEditFactory({ 
                        mode: 'click',
                        blurToSave: true,
                        afterSaveCell: this.afterSaveCell
                    })}
                    pagination={ paginationFactory(paginationOptions) }
                    filter={ filterFactory() }/>
                <InputModal
                    show={this.state.modalShow}
                    onHide={this.setModalShow.bind(this)}
                    columns={this.state.columns.map(column =>{column.value = this.state.edit[column.dataField]; return column})}
                    callback={this.postItem}
                    handleOnDrop={this.handleOnDrop}
                    handleOnError={this.handleOnError}
                    onChangeEdit={this.onChangeEdit}
                />
            </div>)}
          </div>
      </div>
    );
  }
}


const InputModal = ({show, onHide, columns, callback, handleOnDrop, handleOnError,onChangeEdit}) => {
    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                Add New Item
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>


                <h4>Single Value Input</h4>
                <Form>

               
                {columns.map(column => {return (<ColumnCard
                    key={column.dataField}
                    dataField={column.dataField}
                    text={column.text}
                    value={column.value}
                    onChangeEdit={onChangeEdit}
                    disabled={column.autofill}
                    row='input'
                />)})}
                 </Form>
                <h4>CSV Upload</h4>
                <p>Mit dem folgenden Eingabefeld können CSVs hochgeladen werden:</p>
                <CSVReader
                    onDrop={handleOnDrop}
                    onError={handleOnError} 
                    config={{
                    header: true
                    }}
                    style={{
                    dropArea: {
                        height: 100
                    }}}>
                <span>Drop CSV file here or click to upload.</span>
                </CSVReader>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={callback}>Save</Button>
            </Modal.Footer>
        </Modal>
    )
}

const ColumnCard = ( {dataField, text, value, disabled, onChangeEdit, row}) => {
    return(
        
            <Form.Group controlId={dataField}>
                <Form.Label column sm="2">
                {text} ({dataField})
                </Form.Label>
                <Col sm="10">
                <Form.Control 
                    name={dataField}
                    readOnly={disabled}
                    type='text'
                    onChange={onChangeEdit}
                    defaultValue={value}
                    placeholder={text} />
                </Col>

            </Form.Group>
           
        
    )

}

export default List
