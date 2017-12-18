import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import PropTypes from 'prop-types';

import {
  updateHeartbeat,
  fetchAccounts,
  initProducts,
} from '../../actions';
import { round } from '../../utils/math';

class Navigation extends Component {

  componentDidMount() {
    this.props.initProducts();

    setInterval(() => {
      if (this.props.session.length > 5) {
        this.props.fetchAccounts(this.props.session);
      }
    }, 5000);

    setInterval(() => {
      if (moment().unix() - moment(this.props.heartbeatTime).unix() > 30
          && this.props.connected === true) {
        this.props.updateHeartbeat(false);
      }
    }, 5000);
  }

  shouldComponentUpdate(nextProps) {
    const accountsChanged = JSON.stringify(this.props.accounts)
      !== JSON.stringify(nextProps.accounts);
    const locationChanged = JSON.stringify(this.props.location)
      !== JSON.stringify(nextProps.location);
    const tickerChanged = JSON.stringify(this.props.ticker)
      !== JSON.stringify(nextProps.ticker);
    const liveChanged = JSON.stringify(this.props.live)
      !== JSON.stringify(nextProps.live);
    return accountsChanged || locationChanged || tickerChanged || liveChanged;
  }

  render() {
    // console.log('rendering Navigation');
    return (
      <nav className={`navbar ${this.props.live ? 'bg-error' : ''}`}>
        <section className="navbar-section">

          <NavLink
            className="btn vcenter"
            exact
            activeClassName="text-dark"
            to="/"
          >
              Dashboard
          </NavLink>
          <NavLink
            className="btn vcenter"
            exact
            activeClassName="text-dark"
            to="/profile"
          >
            Profile
          </NavLink>
          {
            this.props.ticker.map(a => (
              <div className="ticker vcenter hide-md" key={a.name}>
                <p>{a.name}</p>
                <p>{`Bid: ${a.bid}`}</p>
                <p>{`Ask: ${a.ask}`}</p>
              </div>
          ))}
        </section>
        <section className="navbar-section accounts hide-md">
          {this.props.accounts.map(a => (
            <div className="ticker vcenter" key={a.currency}>
              <p>{a.currency}</p>
              <p className="small">{`Available: ${round(a.available, 6)}`}</p>
              <p className="small">{`Balance: ${round(a.balance, 6)}`}</p>
            </div>
          ))}
        </section>
      </nav>
    );
  }
}

Navigation.propTypes = {
  live: PropTypes.bool.isRequired,
  accounts: PropTypes.arrayOf(PropTypes.object).isRequired,
  session: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  connected: PropTypes.bool.isRequired,
  ticker: PropTypes.arrayOf(PropTypes.object),
  location: PropTypes.object.isRequired,
}

const mapStateToProps = state => {                    // p.value == id, p.label == naem

  return {
    live: state.profile.live,
    accounts: state.profile.accounts,
    session: state.profile.session,
    products: state.chart.products,
    connected: state.websocket.connected,
    heartbeatTime: state.websocket.heartbeatTime,
    ticker: state.profile.products.map(selectedProduct => {
      const t = state.websocket.products.find(wsProduct => wsProduct.id === selectedProduct.id).ticker;
      return { name: selectedProduct.label,
          bid: t ? t.bestBid : '',
          ask: t ? t.bestAsk : '',
        }
    }),
    location: state.location,
  }
};

const mapDispatchToProps = dispatch => (
  {
    updateHeartbeat: (status) => {
      dispatch(updateHeartbeat(status));
    },
    fetchAccounts: (session) => {
      dispatch(fetchAccounts(session));
    },
    initProducts: () => {
      dispatch(initProducts());
    },
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Navigation);
