import React, { Component } from 'react';
import { ObjectInspector } from 'react-inspector';
import { connect } from 'react-redux';

class ProductDataList extends Component {
  // only render if product price data changed or product doc selection changed

  render() {
    // console.log('rendering ProductDataList');
    return ( this.props.visible &&
      <div className="doc-list">
        <h2>
          Product Data
        </h2>
        <div className="docs">
          { this.props.products && this.props.products.map(p => (
            <div key={p.id}>
              <button
                className="list-button"
                onClick={() => this.props.onClick(p.id)}
              >
                {p.id.replace('-', '_')}
              </button>
              { p.docSelected &&
                <div className="doc-desc">
                  <ObjectInspector data={p} name={p.display_name} />
                </div>
              }
            </div>
          ))}
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const products = state.products;
  const content = 'Product Data';
  const visible = state.view.bottomRight.find(c => (c.id === content)).selected;
  return ({
    products,
    visible,
  })
};

const ProductDataListContainer = connect(
  mapStateToProps,
  null,
)(ProductDataList);

export default ProductDataListContainer;
