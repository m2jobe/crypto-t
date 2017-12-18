import React, { Component } from 'react';
import { connect } from 'react-redux';

import { showCard } from '../../actions'

class CardHeader extends Component {

 handleClick = (e, content) => {
    e.preventDefault();
    this.props.showCard(this.props.position, content);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(this.props) !== JSON.stringify(nextProps);
  }

  render() {
    // console.log('rendering CardHeader');
    return (
      <div className="p-1 bg-dark card-header">
          {
            this.props.contentOptions.map(content => {
              return (<button
                key={content}
                className={`col-${Math.floor(12 / this.props.contentOptions.length)} btn btn-primary header-button`}
                onClick={e => {this.handleClick(e, content)}}>{ content }</button>)
            })
          }
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showCard: (card, content) => (
      dispatch(showCard(card, content))
    ),
  }
}

const CardHeaderContainer = connect(
  null,
  mapDispatchToProps,
)(CardHeader);

export default CardHeaderContainer;

