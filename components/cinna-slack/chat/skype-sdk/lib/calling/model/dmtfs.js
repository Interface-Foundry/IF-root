'use strict';

const ModelValidation = require('./model-validation');
const CallingModelLimits = require('./limits');

var AllowedDtmfs = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '*': 10,
    '#': 11,
    'A': 12,
    'B': 13,
    'C': 14,                                                                                                            
    'D': 15
};

function validateDtmfs(context, value, itemName)
{
    if(itemName == null) itemName = 'Dtmfs value';

    var errors = ModelValidation.validateString(context, value, itemName, false, 1);
    if(errors.length > 0) return errors;

    if (!(value in AllowedDtmfs))
    {
        errors.push('Value ' + value + ' in ' + itemName + ' is not valid Dtmfs char');
    }
    return errors;
}

function validateDtmfsArray(context, arrayValue, arrayName)
{
    if(arrayName == null) arrayName = 'Dtmfs list';

    var errors = ModelValidation.validateArray(context, arrayValue, arrayName, false, false, CallingModelLimits.NumberOfStopTones.Max);
    if(errors.length > 0) return errors;

    arrayValue.forEach(function(item) {errors = errors.concat(validateDtmfs(context, item, arrayName + ' item'));});

    return errors;
}


module.exports = { validateDtmfs, validateDtmfsArray };