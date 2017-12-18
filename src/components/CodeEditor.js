import React, { Component } from 'react';

import run from '../utils/scriptEnv';
import test from '../utils/scriptTestEnv';

export default class CodeEditor extends Component {

  handleTextAreaChange = (event) => {
    const script = { ...this.props.script, script: event.target.value };
    this.props.saveScript(script);
  }

  handleTabKey = (event) => {
    if (event.keyCode === 9) { // tab was pressed
      event.preventDefault();
      const val = this.props.script.script,
        start = event.target.selectionStart,
        end = event.target.selectionEnd;
      const script = { ...this.props.script, script: val.substring(0, start) + '\t' + val.substring(end) };
      this.props.saveScript(script).then(() => {
        this.refs.textarea.selectionStart = start + 1;
        this.refs.textarea.selectionEnd = this.refs.textarea.selectionStart;
      });
    }
  }

  handleInputChange = (event) => {
    const name = event.target.value;
    this.props.saveScript({ ...this.props.script, name });
  }

  runScript = (event) => {
    event.preventDefault();
    run(this.props.scriptHeader, this.props.script.script, this.props.products, this.props.profile, this.props.appendLog,
      this.props.addOrder);
  }

  testScript = (event) => {
    event.preventDefault();
    const result = test(this.props.scriptHeader, this.props.script.script, this.props.products, this.props.appendLog);
    this.props.saveTestResult(result);
  }

  deleteScript = (event) => {
    event.preventDefault();
    this.props.deleteScript(this.props.script.id);
  }

  render() {
    // console.log('rendering CodeEditor');
    return (
      <div className={this.props.className}>
        <form className="form-horizontal flex-column flex-1" onSubmit={this.handleSave}>
          <div className="form-group">
            <label className="form-label col-1 text-light" htmlFor="input-example-1">Name</label>
            <input
              className="form-input col-9"
              type="text"
              value={this.props.script.name}
              onChange={this.handleInputChange}
              placeholder="Script Name"
            />
            { this.props.script.id !== 0 &&
            <button className="col-2 btn bg-error" onClick={this.deleteScript}>Delete</button> }
          </div>
          <textarea
            className="form-input flex-1 col-12"
            rows={'3'}
            cols={'30'}
            ref={'textarea'}
            value={this.props.script.script}
            onChange={this.handleTextAreaChange}
            onKeyDown={this.handleTabKey}
          >
            { this.props.script.id !== 0 &&
              <div className="action-buttons">
                <button className="btn bg-success" onClick={this.runScript}>Run</button>
                <button className="btn bg-warning" onClick={this.testScript}>Test</button>
              </div>
            }
          </textarea>
        </form>
      </div>
    );
  }
}
