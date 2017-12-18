import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setLocation } from '../../actions';
import { round } from '../../utils/math';

class Accounts extends Component {

  componentDidMount() {
    this.props.setLocation(this.props.location);
  }

  render() {
    // console.log('rendering accounts container');
    return (
      <div className="accounts-page">
        <ul>
          {this.props.accounts.map(a => (
            <li key={a.currency}>
              <div>
                <p>{a.currency}</p>
                <p>{`Available: ${round(a.available, 6)}`}</p>
                <p>{`Balance: ${round(a.balance, 6)}`}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = state => (
  {
    accounts: state.profile.accounts,
  }
);

const mapDispatchToProps = dispatch => (
  {
    setLocation: (location) => {
      dispatch(setLocation(location));
    },
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Accounts);
