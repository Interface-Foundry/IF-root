'use strict';

/**
 * Check if a Buffer/Uint8Array is a SWF file
 *
 * @param {Buffer} buf
 * @api public
 */

module.exports = function (buf) {
    if (!buf || buf.length < 2) {
        return false;
    }
    
    return buf[0] === 123 && buf[1] === 92 && buf[2] === 114 && buf[3] === 116 && buf[4] === 102
};