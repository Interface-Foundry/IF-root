import {
	isValidEmail
} from '.'

export const commaSeparateNumber = val => {
    while (/(\d+)(\d{3})/.test(val.toString())) {
      	val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
}

export const getNameFromEmail = email => {
	if(isValidEmail(email))
		return email.split('@')[0];

	return 'No valid email'
}