import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  selectProduct,
  selectDateRange,
  setGranularity,
  selectIndicator,
  editIndicator,
  setProductWSData,
  setFetchingStatus,
  fetchProductData,
  calculateIndicators,
  saveTestResult,
  initWebsocket,
  fetchOrders,
  fetchFills
} from '../../actions';

import Dropdown from '../../components/Dropdown';
import Select from '../../components/Select';
import Input from '../../components/Input';
import SliderDropdown from '../../components/SliderDropdown';
import FetchButton from '../../components/FetchButton';
import ObjectForm from '../../components/ObjectForm';
import { INIT_GRANULARITY, INIT_RANGE } from '../../utils/constants';

class ChartHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      granularity: `${INIT_GRANULARITY}`,
      showSlider: false,
      range: INIT_RANGE,
      editing: false,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) || JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  // re-init websocket, fetch product specific data, change active flags in product arrays
  // todo: remve active flag from products and wensocket, only maintain this in profie.
  onProductChange = (event) => {
    if (event) {
      const id = event.value;
      // fetch historical data
      this.props.fetchProductData(id, this.state.range, this.state.granularity);
      // init websocket for product
      this.props.initWebsocket(id, this.props.dropdownProductOptions.map(p => (p.value)));
      // fetch orders
      this.props.fetchOrders(id);
      // fetch fills
      this.props.fetchFills(id);
      // set product
      this.props.selectProduct(id);
      // clear test result
      this.props.saveTestResult({});
    }
  }

  onSelectIndicator = (id) => {
    this.props.selectIndicator(id);
  }

  onClose = (id) => {
    this.setState(() => (
      { editing: false }
    ));
  }

  onSave = (indicator) => {
    this.setState(() => (
      { editing: false }
    ));
    this.props.editIndicator(indicator);
    this.props.calculateIndicators(this.props.productId);
  }

  // set editing to indicator object
  onEditIndicator = (id) => {
    this.setState(() => (
      { editing: this.props.indicators.reduce((a, b) => (b.id === id ? b : a), {}) }
    ));
  }

  onSelectDateRange = (event) => {
    if (event && event.value) {
      const range = event.value;
      this.setState(() => ({ range }));
    }
  }

  onSetGanularity = (name, event) => {
    if (event.target.validity.valid && event.target.value.length < 9) {
      const granularity = event.target.value;
      this.setState(() => ({ granularity }));
    }
  }

  onApply = () => {
    this.props.setGranularity(this.props.productId, this.state.granularity);
    this.props.selectDateRange(this.props.productId, this.state.range);
    this.props.fetchProductData(this.props.productId, this.state.range, this.state.granularity);
    this.props.saveTestResult({});
  }

  handleGranularityChange = granularity => {
    this.setState(() => ({ granularity:  Math.pow(granularity, 2) + '' }));
  }

  render() {
    // console.log('rendering chart header container');
    return (
      <div className="p-1 bg-dark">
        <div className="container">
          <div className="columns">
            <Dropdown
              className="col-2 col-lg-4"
              options={this.props.dropdownProductOptions}
              onChange={this.onProductChange}
              value={this.props.productId}
            />
            <Select
              className="col-3 col-lg-4"
              options={this.props.dropdownIndicatorOptions}
              value={'Indicators'}
              onCheck={this.onSelectIndicator}
              handleDrilldown={this.onEditIndicator}
            />
            <Dropdown
              className="col-2 col-lg-4"
              options={this.props.dateRanges}
              onChange={this.onSelectDateRange}
              value={this.state.range}
            />
            <div className="granularity columns col-3 col-lg-6">
              <Input
                className="col-9"
                invalid={this.props.fetchingStatus === 'failure'}
                maxLength={9}
                name="granularity"
                onChange={this.onSetGanularity}
                placeholder=""
                type="text"
                value={this.state.granularity}
              />
              <div className="relative"><label className="absolute">s</label></div>
              <SliderDropdown
                className = "col-2"
                min={Math.ceil(Math.sqrt(this.state.range / 50))}
                max={Math.ceil(Math.sqrt(this.state.range * 5))}
                handleChange={this.handleGranularityChange}
                defaultValue={Math.sqrt(parseInt(this.state.granularity, 10))}
              />
            </div>
            <FetchButton
              className="btn btn-primary btn-fetch col-2 col-lg-4"
              onClick={this.onApply}
              isFetching={this.props.fetchingStatus === 'fetching'}
              text="Apply"
            />
          </div>
        </div>
        { this.state.editing !== false && <div className='modal active'>
          <div className="modal-overlay"></div>
          <div className="modal-container">
            <div className="modal-body">
              <div className="content">
                <div className="h3 text-dark">{this.state.editing ? this.state.editing.name : ''}</div>
                <ObjectForm
                  hidden={['id', 'name', 'active', 'valueIds']}
                  object={this.state.editing}
                  onSave={this.onSave}
                  closeButton={(<button className="btn col-3" onClick={this.onClose}>Close</button>)}
                />
              </div>
            </div>
          </div>
        </div> }
      </div>
    );
  }
}


const mapStateToProps = state => {

  const selectedProduct = state.profile.products.find(p => {
    return p.active;
  });

  const productId = selectedProduct ? selectedProduct.id : '';

  // create data to populate product dropdown items
  const dropdownProductOptions = state.profile.products.map(product => (
    { value: product.id, label: product.label, active: product.active }
  ));

  const dropdownIndicatorOptions = state.chart.indicators.map(indicator => (
    { value: indicator.id, label: indicator.name, active: indicator.active }
  ));

  const fetchingStatus = state.chart.fetchingStatus;

  const dateRanges = state.chart.dateRanges;

  const indicators = state.chart.indicators;

  return ({
    productId,
    dropdownProductOptions,
    dropdownIndicatorOptions,
    fetchingStatus,
    dateRanges,
    indicators,
  })
};

const mapDispatchToProps = dispatch => (
  {
    selectProduct: (id) => {
      dispatch(selectProduct(id));
    },
    setGranularity: (id, granularity) => {
      dispatch(setGranularity(id, granularity));
    },
    selectIndicator: (id) => {
      dispatch(selectIndicator(id));
    },
    editIndicator: (indicator) => {
      dispatch(editIndicator(indicator));
    },
    selectDateRange: (id, range) => {
      dispatch(selectDateRange(id, range));
    },
    setProductWSData: (id, data) => {
      dispatch(setProductWSData(id, data));
    },
    setFetchingStatus: (status) => {
      dispatch(setFetchingStatus(status));
    },
    fetchProductData: (id, range, granularity) => {
      dispatch(fetchProductData(id, range, granularity));
    },
    calculateIndicators: (id) => {
      dispatch(calculateIndicators(id));
    },
    saveTestResult: result => {
      dispatch(saveTestResult(result));
    },
    initWebsocket: (activeId, ids) => {
      dispatch(initWebsocket(activeId, ids));
    },
    fetchOrders: (id) => {
      dispatch(fetchOrders(id));
    },
    fetchFills: (id) => {
      dispatch(fetchFills(id));
    },
  }
);

const ChartHeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChartHeader);

export default ChartHeaderContainer;
