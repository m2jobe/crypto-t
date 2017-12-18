import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';

const Dropdown = ({ className, multi, onChange, options, value }) => (
  <div className={className}>
    <Select
      searchable={false}
      multi={multi}
      name="form-field-name"
      onChange={onChange}
      options={options}
      value={value}
      clearable={false}
    />
  </div>
);

Dropdown.propTypes = {
  className: PropTypes.string.isRequired,
  multi: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.object)]).isRequired,
};

Dropdown.defaultProps = {
  multi: false,
  value: '',
};

export default Dropdown;
