import React from 'react';
import PropTypes from 'prop-types';
import Loader from './Loader';

const FetchButton = props => (
  (
    <button className={`${props.className} ${props.isFetching ? 'fetching' : '' }`} onClick={props.onClick} disabled={props.isFetching}>
      { props.isFetching ?
        <Loader
          color={props.loaderColor}
          className={props.loaderClassName}
          fadeIn={props.loaderFadeIn}
          name={props.loaderName}
        />
        : props.text
      }
    </button>
  )
);

FetchButton.propTypes = {
  className: PropTypes.string.isRequired,
  isFetching: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired,
  loaderColor: PropTypes.string,
  loaderClassName: PropTypes.string,
  loaderFadeIn: PropTypes.string,
  loaderName: PropTypes.string,
};

FetchButton.defaultProps = {
  loaderColor: '#fff',
  loaderClassName: 'loader',
  loaderFadeIn: 'none',
  loaderName: 'ball-clip-rotate',
};

export default FetchButton;
