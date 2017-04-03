const isEmpty = value => value === undefined || value === null || value === '';
const join = rules => (value, data) => rules.map(rule => rule(value, data))
  .filter(error => !!error)[0]; /* first error */

export const isValidEmail = value => {
  return !isEmpty(value) && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
};

export const isRequired = value => {
  if (isEmpty(value)) {
    return 'Required';
  }
};

export const minLength = min => value => {
  if (!isEmpty(value) && value.length < min) {
    return `Must be at least ${min} characters`;
  }
};

export const maxLength = max => value => {
  if (!isEmpty(value) && value.length > max) {
    return `Must be no more than ${max} characters`;
  }
};

export const isInteger = value => {
  if (!Number.isInteger(Number(value))) {
    return 'Must be an integer';
  }
};

export const oneOf = enumeration => value => {
  if (!~enumeration.indexOf(value)) {
    return `Must be one of: ${enumeration.join(', ')}`;
  }
};

export const match = field => (value, data) => {
  if (data) {
    if (value !== data[field]) {
      return 'Do not match';
    }
  }
};

export const createValidator = rules => (data = {}) => {
  const errors = {};
  Object.keys(rules)
    .forEach((key) => {
      const rule = join([].concat(rules[key])); // concat enables both functions and arrays of functions
      const error = rule(data[key], data);
      if (error) {
        errors[key] = error;
      }
    });
  return errors;
};
