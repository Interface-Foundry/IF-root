'use strict';

/**
 * Base class for all the model classes; it must not be instantiated directly
 */
class AbstractModelType
{
    /**
     *  Copies attributes from generic javascript object to the corresponding instance attributes,
     *  including instantiation of appropriate classes for class-specific attributes
     *
     * @param {Object} inputData - the input javascript object, perhaps deserialized JSON from the Calling service
     * @param {Object} objectClasses - helper object which maps content attribute names to proper constructors of their respective classes
     *
     */
    populatePlainInput(inputData, objectClasses) {

        if(inputData == null) return;

        for (var key in inputData) {
            if (this.hasOwnProperty(key)) {
                var attribute = inputData[key];
                var isObjectClass = objectClasses != null && key in objectClasses;
                if(isObjectClass)
                {
                    if(attribute instanceof Array)
                    {
                        var newArray = new Array();
                        attribute.forEach(function(item){
                            newArray.push(objectClasses[key](item));
                        });
                        this[key] = newArray;
                    }
                    else if (attribute != null){
                        var instance = objectClasses[key](attribute);
                        this[key] = instance;
                    }
                }
                else
                {
                    this[key] = attribute;
                }
            }
        }
    }

    /**
     *  sort of abstract method for validation of the object instances extending this base class
     *
     * @param context
     * @throws {TypeError} when called directly
     */
    validate()
    {
        throw new TypeError('validate() not implemented');
    }
}

module.exports = AbstractModelType;

