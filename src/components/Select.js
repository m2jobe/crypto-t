import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleExpand = (event) => {
    event.preventDefault();
    this.setState(prevState => (
      { expanded: !prevState.expanded }
    ));
  }

  render() {
    return (
      <div className={`dropdown ${this.props.className}`}>
        <div className="btn-dropdown Select-control" role="menu" onClick={this.handleExpand} tabIndex={0}>
          <span className="vcenter">{this.props.value}</span>
          <span className="Select-arrow-zone">
            <span className="Select-arrow" />
          </span>
        </div>
        { this.state.expanded &&
          <div className="dropdown-menu Select-menu-outer" aria-hidden>
            {
              this.props.options.map((o, i) => (
                <div key={`${o.value}${i}`}className="container columns col-12 dropdown-item Select-option">
                  <span className="col-9">{o.label}</span>
                  <div className="col-2">
                    <label className="form-checkbox">
                      <input
                        defaultChecked={o.active}
                        type="checkbox"
                        onChange={(e) => { this.props.onCheck(o.value); }}
                      />
                      <i className="form-icon"></i>
                    </label>
                  </div>
                  <div className="col-1" role="button" onClick={(e) => { this.props.handleDrilldown(o.value); }} tabIndex={0}>
                    <FontAwesome name="chevron-right" />
                  </div>
                </div>
              ))
            }
          </div> }
      </div>
    );
  }
}

export default Select;
