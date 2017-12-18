import React, { Component } from 'react';

export default class ObjectForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // TODO: use immutible
      object: JSON.parse(JSON.stringify(props.object)),
      hidden: props.hidden,
    };
  }

  handlePeriod = str => (
    str.slice(-1) === '.' ? str : Number(str)
  )

  handleCheck = (key) => {
    this.setState((prevState) => {
      const object = { ...prevState.object };
      object[key] = !object[key];
      return { object };
    });
  }

  handleChange = (event, key) => {
    event.preventDefault();
    const value = this.handlePeriod(event.target.value);
    this.setState((prevState) => {
      const object = { ...prevState.object };
      object[key] = value;
      return { object };
    });
  }

  handleArrayChange = (event, key, index) => {
    event.preventDefault();
    const value = this.handlePeriod(event.target.value);
    this.setState((prevState) => {
      const object = { ...prevState.object };
      object[key][index] = value;
      return { object };
    });
  }

  handleObjectChange = (event, key, subkey) => {
    event.preventDefault();
    const value = this.handlePeriod(event.target.value);
    this.setState((prevState) => {
      const object = { ...prevState.object };
      object[key][subkey] = value;
      return { object };
    });
  }

  render() {
    const keys = Object.keys(this.state.object);
    let label;
    let inputs;
    let groups;
    console.log('object form', this.props, this.state);
    return (
      <form className="form-horizontal">
        {
          keys.map((k) => {
            if (!this.state.hidden.includes(k)) {
              label = <label className="form-label text-dark col-3">{k}</label>;
              if (typeof (this.state.object[k]) !== 'object') {
                if (typeof (this.state.object[k]) !== 'boolean') {
                  inputs = [<input className="form-input" key={`${k}-input`} value={this.state.object[k]} onChange={(e) => { this.handleChange(e, k); }} />];
                } else if (typeof (this.state.object[k]) === 'boolean') {
                  inputs = [(
                    <label class="form-checkbox text-dark col-3">
                      <input key={`${k}-input`} defaultChecked={this.state.object[k]} className="form-checkbox" type="checkbox" onChange={(e) => { this.handleCheck(k); }}/>
                      <i class="form-icon"></i>
                    </label>
                  )];
                }
                return (
                  <div className="form-group" key={`${k}-form-group`}>
                    {label}
                    {inputs}
                  </div>
                );
              } else if (typeof (this.state.object[k]) === 'object') {
                if (Array.isArray(this.state.object[k])) {
                  if (typeof (this.state.object[k]) !== 'boolean') {
                    inputs = this.state.object[k].map((o, i) => (
                      <input className="form-input" key={`${k}${i}-input`} value={o} onChange={(e) => { this.handleArrayChange(e, k, i); }} />
                    ));
                  }
                } else {
                  const subKeys = Object.keys(this.state.object[k]);
                  groups = subKeys.map((sk, i) => (
                    <div className="form-group" key={`${k}${i}-form-group`}>
                      <label className="form-label text-dark col-3">{sk}</label>
                      <input className="form-input" key={`${k}${sk}-input`} value={this.state.object[k][sk]} onChange={(e) => { this.handleObjectChange(e, k, sk); }} />
                    </div>
                  ));
                  return groups;
                }
                return (
                  <div className="object-form-group" key={`${k}-form-group`}>
                    {label}
                    {inputs}
                  </div>
                );
              }
            }
            return null;
          })
        }
        <div className="form-group">
          <button className="btn col-3 col-mr-auto" onClick={(e) => { this.props.onSave(this.state.object); }}>Save</button>
          { this.props.closeButton }
        </div>
      </form>
    );
  }
}
