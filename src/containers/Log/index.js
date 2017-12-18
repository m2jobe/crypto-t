import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

class Log extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  render() {
    // console.log('rendering log');
    return ( this.props.visible &&
      <div className="card log">
        <div className="card-body log-messages">
          { this.props.log.map((l, i) => ((
            <p className="" key={`${l.time}${i}`}>
              {`${moment(l.time).format(this.props.timeFormat)}: ${l.message}`}
            </p>
          )))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const log = state.log;
  const content = 'Log';
  const contentOptions = state.view.topRight.map(c => (c.id));
  const visible = state.view.topRight.find(c => (c.id === content)).selected;
  const timeFormat = 'h:mm:ss a';
  return ({
    log,
    contentOptions,
    content,
    visible,
    timeFormat,
  })
};

const LogContainer = connect(
  mapStateToProps,
  null,
)(Log);

export default LogContainer;
