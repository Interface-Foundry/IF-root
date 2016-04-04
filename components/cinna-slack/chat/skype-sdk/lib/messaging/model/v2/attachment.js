'use strict';

const AbstractModelType = require('../abstract-model-type');
const Enums = require('./enums');
const Limits = require('./limits');

const ModelValidation = require('../model-validation');

/**
 * Attachment view properties
 *
 * @extends AbstractModelType
 *
 * @property {String} viewId - attachment view id
 * @property {Number} size - attachment view size bytes
 */
class AttachmentViewInfo extends AbstractModelType
{
    /**
     * Creates a attachment view object
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.viewId = null;
        this.size = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors =  ModelValidation.validateEnum(context, this.viewId,  Enums.AttachmentViewType, 'AttachmentViewInfo.viewId');
        return errors.concat(ModelValidation.validateOptionalNumber(context, this.size, 'AttachmentViewInfo.size'));
    }
}

/**
 * Properties of uploaded attachment
 *
 * @extends AbstractModelType
 *
 * @property {String} type - Enums.AttachmentType; media type of the attachment
 * @property {String} name - optional; attachment name
 * @property {Object[]} views - Array of AttachmentViewInfo; description of available attachment views
 */
class AttachmentInfo extends AbstractModelType
{
    /**
     * Creates a new activity response
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.type = null;
        this.name = null;
        this.views = null;

        this.populatePlainInput(inputData,{
            'views': attrData => {
                return new AttachmentViewInfo(attrData);
            }
        });
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors =  ModelValidation.validateEnum(context, this.type, Enums.AttachmentType,  'AttachmentInfo.type');
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.name, 'AttachmentInfo.name'));
        return errors.concat(ModelValidation.validateTypedObjectArray(context, this.views, AttachmentViewInfo, 'AttachmentInfo.views', 'AttachmentViewInfo'));
    }
}

/**
 * Attachment to be uploaded to the Skype chat
 * Maximum attachment request size calculated from all the data is 20 MB
 * Currently supported attachment types are only 'Image' and 'Video'
 * Content binary data are transmitted in form of base-64 encoded string
 * Supported image types for 'Image' type: png, jpeg, gif; resolution up to 2000x2000
 * Supported video types for 'Video' type: mp4, AAC+H264 audio/video
 * Supported thumbnail is only JPEG for 'Video' type, with resolution same as the video is
 *
 * @extends AbstractModelType
 *
 * @property {String} originalBase64 - base-64 encoded binary attachment content
 * @property {String} thumbnailBase64 - optional; base64 encoded binary thumbnail content
 * @property {String} type - Enums.AttachmentType; media type of the attachment
 * @property {String} name - optional; attachment name
 */
class Attachment extends AbstractModelType
{
    /**
     * Creates a new attachment
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.originalBase64 = null;
        this.thumbnailBase64 = null;
        this.type = null;
        this.name = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors = ModelValidation.validateString(context, this.originalBase64, 'Attachment.originalBase64');
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.thumbnailBase64, 'Attachment.thumbnailBase64'));
        errors = errors.concat(ModelValidation.validateOptionalString(context, this.name, 'Attachment.name'));
        errors = errors.concat(ModelValidation.validateEnum(context, this.type, Enums.AttachmentType, 'Attachment.type'));

        try {
            if (this.originalBase64 != null && typeof(this.originalBase64) === 'string'
                && !(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(this.originalBase64))) {
                errors.push('Attachment.originalBase64 is not a valid base64-encoded string');
            }

            if (this.thumbnailBase64 != null && typeof(this.thumbnailBase64) === 'string'
                && !(/^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/.test(this.thumbnailBase64))) {
                errors.push('Attachment.thumbnailBase64 is not a valid base64-encoded string');
            }
        }
        catch(err) // this may happen when the base64 'string' is too big
        {
            // just ignore, this was optional check anyway
        }

        // not 100% at this point if close to the limits, but still will exclude cases when the limit gets exceeded by a lot
        var approxSize = this.thumbnailBase64 != null && typeof(this.thumbnailBase64) === 'string' ? this.thumbnailBase64.length : 0;
        approxSize += this.originalBase64 != null && typeof(this.originalBase64) === 'string' ? this.originalBase64.length : 0;
        approxSize += this.name != null && typeof(this.name) === 'string' ? this.name.length : 0;
        approxSize += this.type != null && typeof(this.type) === 'string' ? this.type.length : 0;
        if(approxSize > Limits.AttachmentRequestSize.Max)
        {
            errors.push('Total size of attachment request ' + approxSize + ' exceeds maximum limit size of ' + Limits.AttachmentRequestSize.Max + ' bytes');
        }

        return errors;
    }
}

/**
 * Response on successful attachment upload
 *
 * @extends AbstractModelType
 *
 * @property {String} attachmentId -attachment object id, it should be used to address the attachments object
 * @property {String} activityId - optional; id of the 'attachment shared' notification posted automatically
 */
class AttachmentResponse extends AbstractModelType
{
    /**
     * Creates a new activity response
     *
     * @param {Object} inputData - the object received from the Messaging service, or null if constructing from scratch.
     */
    constructor(inputData)
    {
        super();

        this.attachmentId = null;
        this.activityId = null;

        this.populatePlainInput(inputData);
    }

    /**
     *  validates the object instance
     *
     * @param context
     * @returns {Array} - validation errors
     */
    validate(context)
    {
        var errors =  ModelValidation.validateString(context, this.attachmentId, 'AttachmentResponse.attachmentId');
        return errors.concat(ModelValidation.validateOptionalString(context, this.activityId, 'AttachmentResponse.activityId'));
    }
}

module.exports = { AttachmentViewInfo, AttachmentInfo, Attachment, AttachmentResponse };
