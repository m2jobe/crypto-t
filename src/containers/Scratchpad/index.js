import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  addScript,
  saveScript,
  deleteScript,
  selectScript,
  toggleScriptLive,
} from '../../actions';

import CodeEditor from '../../components/CodeEditor';
import ScriptList from '../../components/ScriptList';

class Scratchpad extends Component {
  render() {
    // console.log('rendering scratchpad container');
    const activeScript = this.props.scripts.reduce((a, b) => (
      b.active ? b : a
    ), {});
    const scriptHeader = this.props.scripts[0].script;
    return ( this.props.visible &&
      <div className={`${this.props.className}`}>
        <div className="columns flex-1">
          <ScriptList
            className="col-3"
            scripts={this.props.scripts}
            addNew={this.props.addScript}
            toggleScriptLive={this.props.toggleScriptLive}
            onScriptClick={this.props.selectScript}
          />
          <CodeEditor
            className="col-9 flex-column"
            scriptHeader={scriptHeader}
            script={activeScript}
            deleteScript={this.props.deleteScript}
            saveScript={this.props.saveScript}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const scripts = state.scripts;
  const content = 'Scripts';
  const visible = state.view.bottomLeft.find(c => (c.id === content)).selected;
  return ({
    scripts,
    visible,
  })
};

const mapDispatchToProps = dispatch => (
  {
    addScript: () => {
      dispatch(addScript());
    },
    saveScript: (script) => (
      dispatch(saveScript(script))
    ),
    deleteScript: (id) => {
      dispatch(deleteScript(id));
    },
    selectScript: (id) => {
      dispatch(selectScript(id));
    },
    toggleScriptLive: (id) => {
      dispatch(toggleScriptLive(id));
    },
  }
);

const ScratchpadContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Scratchpad);

export default ScratchpadContainer;
