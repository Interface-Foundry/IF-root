'use strict';

const AbstractModelType = require('./abstract-model-type');

function validateOptionalTypedObject(context, obj, type, itemName, expectedTypeName)
{
    if(obj == null) return [];
    return validateTypedObject(context, obj, type, itemName, expectedTypeName);
}

function validateTypedObject(context, item, type, itemName, expectedTypeName)
{
    var errors = [];

    if(itemName == null) itemName = 'an object';
    if(expectedTypeName == null) expectedTypeName = 'not specified';

    if(item == null)
    {
        errors.push(itemName + ' is null');
    }
    else
    {
        if(!(item instanceof type)) errors.push(itemName + ' is not of expected type ' + expectedTypeName + ' but of type ' + typeof item);
        if(item instanceof AbstractModelType)
        {
            errors = errors.concat(item.validate(context));
        }
    }

    return errors;
}

function validateOptionalTypedObjectArray(context, array, type, arrayName, expectedTypeName)
{
    if(array == null) return [];
    return validateEnumArray(context, array, type, arrayName, expectedTypeName);
}

function validateTypedObjectArray(context, array, type, arrayName, expectedTypeName)
{
    if(arrayName == null) arrayName = 'an object array';
    if(expectedTypeName == null) expectedTypeName = 'not specified';

    var errors = validateArray(context, array, arrayName);
    if(errors.length > 0) return errors;

    array.forEach(function(item){ errors = errors.concat(validateTypedObject(context, item, type, arrayName + ' item', expectedTypeName)); });

    return errors;
}

function validateOptionalString(context, validatedString, stringName, canBeEmptyOrWhitespace, maxLen, minLen)
{
    if(validatedString == null) return [];
    return validateString(context, validatedString, stringName, canBeEmptyOrWhitespace, maxLen, minLen);
}

function validateString(context, validatedString, stringName, canBeEmptyOrWhitespace, maxLen, minLen)
{
    var errors = [];
    if(stringName == null) stringName = 'a string';
    if(canBeEmptyOrWhitespace == undefined) canBeEmptyOrWhitespace = false;

    if(validatedString == null)
    {
        errors.push(stringName + ' must not be null');
        return errors;
    }

    if(!(typeof validatedString === 'string' || validatedString instanceof String))
    {
        errors.push(stringName + ' is not a string');
        return errors;
    }

    if(!canBeEmptyOrWhitespace && !/\S/.test(validatedString)) errors.push(stringName + ' must not be empty or whitespaces only');

    if(minLen != null && validatedString.length < minLen)
    {
        errors.push(stringName + ' length ' + validatedString.length + ' is less than allowed minimum ' + minLen);
    }

    if(maxLen != null && maxLen < validatedString.length)
    {
        errors.push(stringName + ' length ' + validatedString.length + ' is more than allowed maximum ' + maxLen);
    }

    return errors;
}

function validateOptionalNumber(context, validatedNumber, numberName, minValue, maxValue)
{
    if(validatedNumber == null) return [];
    return validateNumber(context, validatedNumber, numberName, minValue, maxValue);
}

function validateNumber(context, validatedNumber, numberName, minValue, maxValue)
{
    var errors = [];
    if(numberName == null) numberName = 'a number';

    if(validatedNumber == null)
    {
        errors.push(numberName + ' is null');
        return errors;
    }

    if(isNaN(parseFloat(validatedNumber)) || !isFinite(validatedNumber))
    {
        errors.push(numberName + ' is not numeric');
        return errors;
    }

    if(minValue != null && validatedNumber < minValue)
    {
        errors.push(numberName + ' value ' + validatedNumber + ' is less than allowed minimum ' + minValue);
    }
    else if(maxValue != null && maxValue < validatedNumber)
    {
        errors.push(numberName + ' value ' + validatedNumber + ' is more than allowed maximum ' + maxValue);
    }

    return errors;
}

function validateOptionalEnum(context, validatedValue, enumDictionary, enumName, notAllowedValuesList)
{
    if(validatedValue == null) return [];

    return validateEnum(context, validatedValue, enumDictionary, enumName, notAllowedValuesList);
}

function validateEnum(context, validatedValue, enumDictionary, enumName, notAllowedValuesList)
{
    var errors = [];
    if(enumName == null) enumName = 'an enum';
    if(enumDictionary == null) throw new Error('Enum dictionary is not provided');

    if(validatedValue == null)
    {
        errors.push(enumName + ' is null');
        return errors;
    }

    var found = false;
    for(var key in enumDictionary)
    {
        if(enumDictionary[key] === validatedValue)
        {
            found = true;
            break;
        }
    }

    if(!found)
    {
        errors.push(enumName + ' value ' + validatedValue + ' is invalid');
    }
    else
    {
        if(notAllowedValuesList != null)
        {
            if(notAllowedValuesList.indexOf(validatedValue) >= 0)
            {
                errors.push(enumName + ' must not have value from list ' + notAllowedValuesList);
            }
        }
    }
    return errors;
}

function validateOptionalArray(context, validatedArray, arrayName, canBeEmpty, canHaveDuplicates, maxSize)
{
    if(validatedArray == null) return [];

    return validateArray(context, validatedArray, arrayName, canBeEmpty, canHaveDuplicates, maxSize);
}

function validateArray(context, validatedArray, arrayName, canBeEmpty, canHaveDuplicates, maxSize)
{
    var errors = [];

    if(arrayName == null) arrayName = 'an array';
    if(canBeEmpty == null) canBeEmpty = false;
    if(canHaveDuplicates == null) canHaveDuplicates = false;

    if(validatedArray == null)
    {
        errors.push(arrayName + ' is null');
    }
    else if(!(validatedArray instanceof Array))
    {
        errors.push(arrayName + ' is not instance of Array but ' + typeof validatedArray);
    }
    else if(validatedArray.length == 0)
    {
        if(!canBeEmpty) errors.push(arrayName + ' is empty');
    }
    else
    {
        if(!canHaveDuplicates)
        {
            if((new Set(validatedArray)).size != validatedArray.length) {
                errors.push(arrayName + ' contains duplicates');
            }
        }

        if(maxSize != null)
        {
            if(validatedArray.length > maxSize) errors.push('Number of items in ' + arrayName + ' exceeds maximum value ' + maxSize);
        }
    }

    return errors;
}

function validateOptionalEnumArray(context, validatedArray, enumDictionary, arrayName, notAllowedValuesList)
{
    if(validatedArray == null) return [];

    return validateEnumArray(context, validatedArray, enumDictionary, arrayName, notAllowedValuesList);
}

function validateEnumArray(context, validatedArray, enumDictionary, arrayName, notAllowedValuesList)
{
    if(arrayName == null) arrayName = 'an enum array';
    if(enumDictionary == null) throw new Error('Enum dictionary is not provided');

    var errors = validateArray(context, validatedArray, arrayName);
    if(errors.length > 0) return errors;

    validatedArray.forEach(function(item){ errors = errors.concat(validateEnum(context, item, enumDictionary, arrayName + ' item')); });

    if(notAllowedValuesList != null)
    {
        for (var i = 0; i < notAllowedValuesList.length; ++i)
        {
            if(validatedArray.indexOf(notAllowedValuesList[i])>= 0)
            {
                errors.push(arrayName + ' must not contain value ' + notAllowedValuesList[i]);
            }
        }
    }

    return errors;
}

function validateOptionalBoolean(context, validatedValue, valueName)
{
    if(validatedValue == null) return [];

    return validateBoolean(context, validatedValue, valueName);
}

function validateBoolean(context, validatedValue, valueName)
{
    var errors = [];
    if(valueName == null) valueName = 'a boolean';

    if(validatedValue == null)
    {
        errors.push(valueName + ' is null');
        return errors;
    }

    if(typeof validatedValue != 'boolean')
    {
        errors.push(valueName + ' is not a boolean value but ' + typeof valueName);
    }

    return errors;
}

function checkIfObject(obj)
{
    return obj && typeof obj  === 'object' && !Array.isArray(obj);
}

function validateGenericObject(context, validatedValue, valueName, canBeNull)
{
    var errors = [];
    if(valueName == null) valueName = 'an object';
    if(canBeNull == null) canBeNull = true;

    if(validatedValue == null) {
        if(!canBeNull) errors.push(valueName + ' must not be null');
        return errors;
    }

    if(!checkIfObject(validatedValue)) errors.push(valueName + ' is not an object but ' + typeof object);

    return errors;
}

function validateDictionaryOfStrings(context, validatedValue, valueName)
{
    if(valueName == null) valueName = 'an object with string properties only';

    var errors = validateGenericObject(context, validatedValue, valueName, true);
    if(errors.length > 0) return errors;

    for(var propertyName in validatedValue)
    {
        if(propertyName === 'null' || propertyName === 'undefined') {
            errors.push('attribute name [' + propertyName + '] in [' + valueName + '] is set to null or undefined');
        }
        else {
            errors = errors.concat(validateString(context, propertyName, valueName + ' key ' + propertyName));
            errors = errors.concat(validateString(context, validatedValue[propertyName], valueName + ' value of ' + propertyName));
        }
    }

    return errors;
}

function validateOptionalArrayOfStrings(context, validatedArray, arrayName, canBeEmpty, canHaveDuplicates, maxArraySize, canBeStringEmptyOfWhitespace, stringMaxLen)
{
    if(validatedArray == null) return [];

    if(arrayName == null) arrayName = 'a string array';

    var errors = validateArray(context, validatedArray, arrayName, canBeEmpty, canHaveDuplicates, maxArraySize);
    if(errors.length > 0) return errors;

    validatedArray.forEach(item => { errors = errors.concat(validateString(context, item, arrayName + ' item', canBeStringEmptyOfWhitespace, stringMaxLen)); });

    return errors;
}

module.exports = {
    checkIfObject,
    validateOptionalEnumArray,
    validateEnumArray,
    validateOptionalArray,
    validateArray,
    validateOptionalEnum,
    validateEnum,
    validateOptionalNumber,
    validateNumber,
    validateOptionalString,
    validateString,
    validateOptionalTypedObject,
    validateTypedObject,
    validateTypedObjectArray,
    validateOptionalTypedObjectArray,
    validateOptionalBoolean,
    validateBoolean,
    validateGenericObject,
    validateDictionaryOfStrings,
    validateOptionalArrayOfStrings
};

