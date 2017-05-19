import React, { Component } from 'react';
import './App.css';

import _ from 'lodash';

const DEFAULT_TYPE = "People";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      names: { [DEFAULT_TYPE]: "" },
      text: "",
      types: [DEFAULT_TYPE],
      selectedType: DEFAULT_TYPE,
      openForms: {
        [DEFAULT_TYPE]: [{
          rowData: ["", ""],
          children: [],
        }],
      },
      storedForms: { [DEFAULT_TYPE]: [] },
    };
  }

  handleNameChange(e){
    const newNames = this.state.names;
    newNames[this.state.selectedType] = e.target.value;
    this.setState({ names: newNames });
  }

  handleSubmit(e) {
    e.preventDefault();
    const newTypes = this.state.types;
    const newOpenForms = this.state.openForms;
    const newStoredForms = this.state.storedForms;
    const newNames = this.state.names;
    newTypes.push(this.state.text);
    newOpenForms[this.state.text] = [{ rowData: ["", ""], children: [] }];
    newStoredForms[this.state.text] = [];
    newNames[this.state.text] = "";
    this.setState({
      text: "",
      names: newNames,
      types: newTypes,
      openForms: newOpenForms,
      storedForms: newStoredForms,
    });
  }

  handleChange(e) {
    this.setState({text: e.target.value});
  }

  handleClick(e) {
    const index = e.target.value;
    const newTypes = this.state.types;
    newTypes.splice(index,1);
    this.setState({
      types: newTypes,
    })
  }

  selectType(e) {
    this.setState({
      selectedType: e.target.value,
    });
  }

  handleFormChange(row, column, e) {
    const { openForms, selectedType } = this.state;
    const newForm = openForms;
    newForm[selectedType][row]['rowData'][column] = e.target.value;
    this.setState({openForms: newForm});
    this.maybeCreateNewRow(e);
  }

  handleChildFormChange(path, column, e) {
    const { openForms, selectedType } = this.state;
    const newPath = path;
    newPath.pop();
    newPath.push('rowData');
    newPath.push(column)
    newPath.unshift(selectedType)
    const newForm = openForms;
    _.set(newForm, newPath, e.target.value);
    this.setState({openForms: newForm});
  }

  maybeCreateNewRow(e) {
    e.preventDefault();
    const { openForms, selectedType } = this.state;
    const last = openForms[selectedType][openForms[selectedType].length-1]['rowData'];
    if (last[0] || last[1]) {
      const newForm = openForms;
      newForm[selectedType].push({
        rowData: ["", ""],
        children: [],
      });
      this.setState({openForms: newForm});
    }
  }

  handleFormSubmit(e) {
    const newStoredForms = this.state.storedForms;
    const newOpenForms = this.state.openForms;
    const newNames = this.state.names;
    newOpenForms[this.state.selectedType]['name'] = this.state.names[this.state.selectedType];
    newStoredForms[this.state.selectedType].push(newOpenForms[this.state.selectedType]);
    newOpenForms[this.state.selectedType] = [{ rowData: ["", ""], children: [] }];
    newNames[this.state.selectedType] = "";
    this.setState({
      names: newNames,
      openForms: newOpenForms,
      storedForm: newStoredForms,
    });
  }

  renderStoredForms() {
    const { storedForms, selectedType } = this.state;

    const renderedForms = storedForms[selectedType].map( (form, index) => {
      const formatedForm = form.map( (row, rowIndex) => {

          const testchildren = [
            <div key={'parent'}>
              {row['rowData'][0]}:&emsp;&emsp;
              {row['rowData'][1]}
            </div>
          ];
          if (row['children'].length) {
            row['path'] = [rowIndex, 'children'];
            let path = row['path'];
            const stack = this.getTrackedChildren(row['children'], row['path']);
            let currentRow = row;
            while (stack.length) {
              currentRow = stack.pop();
              path = currentRow['path'];
              stack.push(...this.getTrackedChildren(currentRow['children'], path));
              let bufferStyle = {
                marginLeft: `${(path.length-2)*10}px`,
              }
              testchildren.push(
                <div key={path} style={bufferStyle}>
                  {currentRow['rowData'][0]}:&emsp;&emsp;
                  {currentRow['rowData'][1]}
                </div>
              );
            }
          }
          return testchildren;

      })
      return (
        <div key={index} className="stored-form">
          {form['name']}
          {formatedForm}
        </div>
      );
    })

    return (
      <div className="stored-forms">
        {renderedForms}
      </div>
    );
  }

  handleParentify(e) {
    const { openForms, selectedType } = this.state;
    const newForm = openForms;
    const index = e.target.value;
    newForm[selectedType][index]['children'].unshift({
      rowData: ["", ""],
      children: [],
    });
    this.setState({ openForms: newForm, });
  }

  handleChildParentify(path, e) {
    const { openForms, selectedType } = this.state;
    const newPath = [selectedType, ...path];
    const newForm = openForms;
    const newChildren = _.get(newForm, newPath);
    newChildren.unshift({
      rowData: ["", ""],
      children: [],
    });
    _.set(newForm, newPath, newChildren);
    this.setState({openForms: newForm});
  }

  getTrackedChildren(children, currentPath) {
    return children.map( (child, childIndex) => {
      const trackedChild = child;
      trackedChild['path'] = [...currentPath, childIndex, 'children'];
      return trackedChild;
    });
  }

  renderOpenForm() {
    const { openForms, selectedType } = this.state;
    const formElements = openForms[selectedType].map( (row, index) => {
      const testchildren = [];
      if (row['children'].length) {
        row['path'] = [index, 'children'];
        let path = row['path'];
        const stack = this.getTrackedChildren(row['children'], row['path']);
        let currentRow = row;
        while (stack.length) {
          currentRow = stack.pop();
          path = currentRow['path'];
          stack.push(...this.getTrackedChildren(currentRow['children'], path));
          let bufferStyle = {
            marginLeft: `${(path.length-2)*10}px`,
          }
          testchildren.push(
            <div key={path} style={bufferStyle}>
              <input type="text" value={currentRow['rowData'][0]} onChange={this.handleChildFormChange.bind(this, path, 0)}/>
              <input type="text" value={currentRow['rowData'][1]} onChange={this.handleChildFormChange.bind(this, path, 1)}/>
              <button onClick={this.handleChildParentify.bind(this, path)}>v</button>
            </div>
          );
        }
      }

      return (
        <div key={index}>
          <input type="text" value={row['rowData'][0]} onChange={this.handleFormChange.bind(this, index, 0)}/>
          <input type="text" value={row['rowData'][1]} onChange={this.handleFormChange.bind(this, index, 1)}/>
          <button value={index} onClick={this.handleParentify.bind(this)}>v</button>
          {testchildren}
        </div>
      );
    })
    return (
      <div>
        <h1>{selectedType}</h1>
        Name: <input type="text" value={this.state.names[selectedType]} onChange={this.handleNameChange.bind(this)}/>
        {formElements}
        <button onClick={this.handleFormSubmit.bind(this)}>SUBMIT</button>
      </div>
    );
  }

  renderTypes() {
    const types = this.state.types.map( (type, index) => {
      return (
        <div key={index}>
          <button value={type} onClick={this.selectType.bind(this)}>&gt;</button>
          {type}
          <button value={index} onClick={this.handleClick.bind(this)}>X</button>
        </div>
      );
    })
    return types;
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Snapshot</h2>
        </div>
        <div className="types">
          <h2>Types</h2>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <input type="text" value={this.state.text} onChange={this.handleChange.bind(this)}/>
          </form>
          {this.renderTypes()}
        </div>
        <div className="forms">
          {this.renderOpenForm()}
          {this.renderStoredForms()}
        </div>
      </div>
    );
  }
}

export default App;
