import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

const DEFAULT_TYPES = ["People"];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      todos: DEFAULT_TYPES,
      selectedType: DEFAULT_TYPES[0],
      currentForm: {
        data: [{
          rowData: ["", ""],
          children: []
        }],
        type: "",
      },
      storedForms: [],
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    const newTodos = this.state.todos;
    newTodos.push(this.state.text);
    this.setState({
      text: "",
      todos: newTodos,
    });
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleClick(e) {
    const index = e.target.value;
    const newTodos = this.state.todos;
    newTodos.splice(index,1);
    this.setState({
      todos: newTodos,
    })
  }

  selectType(e) {
    this.setState({
      selectedType: e.target.value,
    });
  }

  handleFormChange(row, index, e) {
    const newForm = this.state.currentForm;
    newForm['data'][row]['rowData'][index] = e.target.value;
    this.setState({currentForm: newForm});
    this.maybeCreateNewRow(e);
  }

  maybeCreateNewRow(e) {
    e.preventDefault();
    const last = this.state.currentForm['data'][this.state.currentForm['data'].length-1]['rowData'];
    if (last[0] || last[1]) {
      const newForm = this.state.currentForm;
      newForm['data'].push({
        rowData: ["", ""],
        children: [],
      });
      this.setState({currentForm: newForm});
    }
  }

  handleFormSubmit(e) {
    const newStoredForms = this.state.storedForms;
    const newCurrentForm = this.state.currentForm;
    newCurrentForm["type"] = this.state.selectedType;
    newStoredForms.push(newCurrentForm);
    this.setState({
      currentForm: {
        data: [{
          rowData: ["", ""],
          children: []
        }],
        type: "",
      },
      storedForm: newStoredForms,
    });
  }

  renderStoredForms() {
    const storedForms = this.state.storedForms.map( (form, index) => {
      const formatedForm = form['data'].map( (row, rowIndex) => {
        return row['rowData'][0] || row['rowData'][1] ?
          <div key={rowIndex}>
            {`${row['rowData'][0]}: ${row['rowData'][1]}`}
          </div> : null;
      })
      return form['type'] === this.state.selectedType ? (
        <div key={index} className="stored-form">
          {formatedForm}
        </div>
      ) : null;
    })
    return (
      <div className="stored-forms">
        {storedForms}
      </div>
    );
  }

  handleParentify(e) {
    const newForm = this.state.currentForm;
    const index = e.target.value;
    newForm['data'][index]['children'].push({
      rowData: ["", ""],
      children: []
    });
    this.setState({ currentForm: newForm, });
  }

  renderForm() {
    const formElements = this.state.currentForm['data'].map( (row, index) => {
      const children = row['children'].map( (child, childIndex) => {
        console.log(child);
        return (
          <div key={childIndex}>
            <input type="text" value={child['rowData'][0]} onChange={this.handleFormChange.bind(this, index, 0)}/>
            <input type="text" value={child['rowData'][1]} onChange={this.handleFormChange.bind(this, index, 1)}/>
          </div>
        );
      })
      return (
        <div key={index}>
          <input type="text" value={row['rowData'][0]} onChange={this.handleFormChange.bind(this, index, 0)}/>
          <input type="text" value={row['rowData'][1]} onChange={this.handleFormChange.bind(this, index, 1)}/>
          <button value={index} onClick={this.handleParentify.bind(this)}>PARENTIFY</button>
          {children}
        </div>
      );
    })
    return (
      <div>
        <h1>{this.state.selectedType}</h1>
        {formElements}
        <button onClick={this.handleFormSubmit.bind(this)}>SUBMIT</button>
      </div>
    );
  }

  renderTodos() {
    const todos = this.state.todos.map( (todo, index) => {
      return (
        <div key={index}>
          <button value={todo} onClick={this.selectType.bind(this)}>V</button>
          {todo}
          <button value={index} onClick={this.handleClick.bind(this)}>X</button>
        </div>
      );
    })
    return todos;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Snapshot</h2>
        </div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <input type="text" value={this.state.text} onChange={this.handleChange.bind(this)}/>
        </form>
        {this.renderTodos()}
        {this.renderForm()}
        {this.renderStoredForms()}
      </div>
    );
  }
}

export default App;
