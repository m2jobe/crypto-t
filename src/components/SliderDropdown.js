import React, { Component } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

class SliderDropdown extends Component {
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
      <div className={`slider-dropdown ${this.props.className}`}>
        <div className="dropdown-toggle Select-control" role="menu" onClick={this.handleExpand} tabIndex={0}>
          <span className="Select-value-label">{this.props.value}</span>
          <span className="Select-arrow-zone">
            <span className="Select-arrow" />
          </span>
        </div>
        { this.state.expanded &&
          <div className="dropdown-menu" aria-hidden>
            <div className="slider-container">
              <Slider
                min={this.props.min}
                max={this.props.max}
                onChange={this.props.handleChange}
                defaultValue={this.props.defaultValue}
              />
            </div>
          </div> }
      </div>
    )
  }
};

export default SliderDropdown;
