import React from 'react';
import PropTypes from 'prop-types';

const Input = props => (
  (
    <div className={props.className}>
      <input
        className={`col-12 form-input bg-dark ${props.invalid ? 'invalid' : ''}`}
        maxLength={props.maxLength}
        name={props.name}
        onChange={e => props.onChange(props.name, e)}
        placeholder={props.placeholder}
        type={props.type}
        value={props.value}
      />
      {props.children}
    </div>
  )
);

Input.propTypes = {
  className: PropTypes.string.isRequired,
  invalid: PropTypes.bool,
  maxLength: PropTypes.number,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
};

Input.defaultProps = {
  invalid: false,
  maxLength: Number.MAX_SAFE_INTEGER,
  placeholder: '',
  value: '',
  type: 'text',
};

export default Input;
