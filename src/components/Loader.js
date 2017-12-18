import React from 'react';
import Spinner from 'react-spinkit';
import PropTypes from 'prop-types';

const Loader = ({ className, color, fadeIn, name }) => (
  (
    <div className={className}>
      <Spinner color={color} fadeIn={fadeIn} name={name} />
    </div>
  )
);

Loader.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  fadeIn: PropTypes.string,
  color: PropTypes.string,
};

Loader.defaultProps = {
  className: 'spinner',
  color: '#007eff',
  fadeIn: 'none',
  name: 'ball-clip-rotate-multiple',
};

export default Loader;
