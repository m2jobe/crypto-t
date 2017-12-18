import { connect } from 'react-redux';
import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import ToggleSwitch from 'react-toggle-switch';
import Dropzone from 'react-dropzone';

import {
  saveProfile,
  fetchAccounts,
  setLocation,
  findSession,
  fetchOrders,
  saveSession,
  initWebsocket,
  fetchFills,
} from '../../actions';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: this.props.session,
      live: this.props.live,
      selectedProducts: this.props.selectedProducts,
      productOptions: this.props.productOptions,
      sessionIdPaths: [
        {
          os: 'OSX',
          browser: 'Chrome',
          path: '~/Library/Application Support/Google/Chrome/Default/Web Data',
        },
      ],
    };
  }

  componentDidMount() {
    this.props.setLocation(this.props.location);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps)
      || JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  onSelectProducts = (values) => {
    const selectedProducts = values;
    const selectedProductIds = selectedProducts.map(p => p.value);
    const productOptions = this.props.productOptions.filter(p => {
      return selectedProductIds.indexOf(p.value) < 0;
    });
    this.setState(prevState => ({
      selectedProducts,
      productOptions,
    }));
  }

  handleInputChange = (key, event) => {
    const session = event.target.value;
    console.log('session', session);
    console.log('state', this.state.session);
    this.setState(prevState => ({
      session: session,
    }));
  }

  handleToggle = () => {
    this.setState(prevState => ({
      live: !prevState.live,
    }));
  }

  handleSave = (event) => {
    event.preventDefault();
    // save all data not session
    this.props.saveProfile({
      live: this.state.live,
      products: this.state.selectedProducts.map(p => (
        { label: p.label, id: p.value, active: p.value === this.props.activeProductId }
      )),
    });
    // save session if it is valid
    console.log('profile session', this.state.session);
    if (this.state.session.length > 0) {
      this.props.fetchAccounts(this.state.session).then(res => {
        if (res) {
          this.props.saveSession(this.state.session);
          const selectedProductIds = this.state.selectedProducts.map(p => (p.value));
          this.props.initWebsocket(this.props.activeProductId, selectedProductIds);
        }
      })
      for (let i = 0; i < this.state.selectedProducts.length; i += 1) {
        this.props.fetchOrders(this.state.selectedProducts[i].value, this.state.session);
        this.props.fetchFills(this.state.selectedProducts[i].value, this.state.session);
      }
    }
  }

  handleFindSession = (acceptedFiles) => {
    this.props.findSession(acceptedFiles);
  }

  render() {
    console.log('rendering profile container', this.state);
    return (
      <div className="container secondary-bg-dark">
        <div className="columns">
          <form className="form-horizontal col-mx-auto col-6 col-md-10" onSubmit={this.props.onSaveClick}>
            <div className="form-group">
              <button type="submit" className="col-3 col-mx-auto btn btn-primary" onClick={this.handleSave}>
                Save
              </button>
            </div>
            <div className="form-group">
              <label className="col-1 text-light" htmlFor="live">Live</label>
              <div className="col-11">
                <ToggleSwitch
                  className="mx-2"
                  on={this.state.live}
                  onClick={this.handleToggle}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label col-2 text-light" htmlFor="session">Session</label>
              <Input
                className="col-10 mx-2"
                name="session"
                placeholder="Session"
                value={this.state.session}
                onChange={this.handleInputChange}
              />
            </div>
            <p className="col-12 text-light hide-md">
              {'Can\'t find your session ID? Session data is stored by your browser. You can upload browser data and the app will try to find your session.'}
            </p>
            <table className="col-12 hide-md">
                <tbody>
                  <tr>
                    <th className="text-light">OS</th>
                    <th className="text-light">Browser</th>
                    <th className="text-light">Path</th>
                  </tr>
                  {
                    this.state.sessionIdPaths.map(s => (
                      (
                        <tr key={s.os}>
                          <td className="text-light">{s.os}</td>
                          <td className="text-light">{s.browser}</td>
                          <td className="text-light">{s.path}</td>
                          <td>
                            <CopyToClipboard onCopy={() => {}} text={s.path} >
                              <button className="btn" onClick={(e) => { e.preventDefault(); }}>
                                Copy
                              </button>
                            </CopyToClipboard>
                          </td>
                        </tr>
                      )
                    ))
                  }
                </tbody>
            </table>
            <div className="form-group col-12 hide-md">
              <button type="submit" className="btn" onClick={(e) => { e.preventDefault(); }}>
                <Dropzone className="dropzone" onDrop={this.handleFindSession}>
                  Find Session
                </Dropzone>
              </button>
            </div>
            <div className="d-block">
              <label className="col-2 col-md-12 text-light" htmlFor="watched-products">Watched Products</label>
              <Dropdown
                className="col-10 col-md-12"
                multi
                simpleValue
                options={this.state.productOptions}
                onChange={this.onSelectProducts}
                value={this.state.selectedProducts}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => (
  {
    activeProductId: state.profile.products.find(p => (p.active)).id,
    selectedProducts: state.profile.products.map(p => ({ label: p.label, value: p.id })),
    live: state.profile.live,
    session: state.profile.session,
    productOptions: state.chart.products ? state.chart.products.map(p => ({ label: p.display_name, value: p.id })) : [],
  }
);

const mapDispatchToProps = dispatch => (
  {
    saveProfile: (settigns) => {
      dispatch(saveProfile(settigns));
    },
    setLocation: (location) => {
      dispatch(setLocation(location));
    },
    findSession: (acceptedFiles) => {
      dispatch(findSession(acceptedFiles));
    },
    fetchAccounts: (session) => (
      dispatch(fetchAccounts(session))
    ),
    fetchOrders: (product, session) => {
      dispatch(fetchOrders(product, session));
    },
    fetchFills: (product, session) => {
      dispatch(fetchFills(product, session));
    },
    saveSession: (session) => {
      dispatch(saveSession(session));
    },
    initWebsocket: (id, ids) => {
      dispatch(initWebsocket(id, ids));
    },
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);
