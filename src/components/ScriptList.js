import React, { Component } from 'react';
import ToggleSwitch from 'react-toggle-switch';

export default class ScriptList extends Component {

  // only render if script data changed
  shouldComponentUpdate(nextProps, nextState) {
    const scriptsChanged = JSON.stringify(this.props.scripts)
        !== JSON.stringify(nextProps.scripts);
    return scriptsChanged;
  }

  render() {
    // console.log('rendering ScriptList');
    return (
      <div className={this.props.className}>
        <button
          className="btn btn-primary col-12"
          key="add-new"
          onClick={() => this.props.addNew()}
        >
          Add New
        </button>
        { this.props.scripts.map((script, i) => (
          <button
            key={script.id}
            className={`btn col-12 ${script.active ? 'active' : ''}`}
            onClick={() => this.props.onScriptClick(script.id)}
          >
            {script.name}
            {i !== 0 &&
                <ToggleSwitch
                  className="float-right"
                  on={script.live}
                  onClick={() => this.props.toggleScriptLive(script.id)}
                />
            }
          </button>
        ))}
      </div>
    );
  }
}
