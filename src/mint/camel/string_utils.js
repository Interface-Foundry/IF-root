/**
 * string manipulation functions for cleaning up camel item strs
 * @namespace utils
 */
var utils = {};

/**
 * Captures and returns important product information -- specifically, sizing, "wifi", "hd", or pixel counts -- that we don't want to lose when we clean the product name
 * @param the product name
 * @returns an array of strings pulled from the product-name
 */
utils.getSpecs = function (str) {

  var patterns = [
    /\s(\d+\s?px?|\d+\spixels?)\b/gi,
    /\s(wi[-\s]?fi)\b/gi,
    /\s(size\s\d\d?|(?:(?:size\s)?|(?:(?:x-?|extra[-\s])?[sml])small|medium|large))\b/gi,
    /\s(hd|high[-\s]definition)\b/gi
  ];

  var specs = [];

  patterns.map(function (p) {
    var matches = p.exec(str);
    // console.log('MATCHES:', matches);
    if (matches) specs = specs.concat(matches.slice(1));
  });

  return specs;
};

/**
 * truncates a string before the first dash
 */
utils.dashes = function (str) {
  // console.log('abdashsoul');
  return str.split(' -')[0];
};

/**
 * removes parentheses and any text within them
 */
utils.parens = function (str) {
  // console.log('parens');
  return str.replace(/\([^\)]*\)/g, '');
};

/**
 * removes brackets and any text within them
 */
utils.brackets = function (str) {
  // console.log('brackets');
  return str.replace(/\[[^\]]*\]/g, '');
};

/**
 * When ellipses indicate that some portion of the text has been removed, this function removes the ellipses as well as the two
 * truncated words on either end of them. When ellipses indicate that a word has been split accross a line-break on
 * camelcamelcamel, this function removes the repeated letter that indicates that as well as the ellipses themselves.
 */
utils.ellipses = function (str) {
  // console.log('ellipses');
  str = str.split(' ... ');
  if (str.length <= 1) str = str[0];
  else {
    var firstHalf = str[0].split('');
    var lastHalf = str[1].split('');
    if (firstHalf[firstHalf.length-1] === lastHalf[0]) {
      console.log('single word split up');
      str = firstHalf.slice(0, firstHalf.length).concat(lastHalf.slice(1)).join('');
    }
    else {
      console.log('multiple words truncated');
      firstWords = firstHalf.join('').split(' ');
      lastWords = lastHalf.join('').split(' ');
      // console.log('first words, last words:', firstWords, lastWords);
      str = firstWords.slice(0, firstWords.length-1).concat(lastWords.slice(1)).join(' ');
    }
  }
  return str;
};

/**
 * Truncates the string after the first period that indicates a sentence-end rather than an abbreviation
 */
utils.periods = function (str) {
  // console.log('moon hut');
  // return str.split('. ')[0];
  var period = /\w\w\w+(\.)\s/.exec(str);
  if (period) return str.slice(0, period.index);
  else return str;
};

/**
 * Truncates the string after the first comma
 */
utils.commas = function (str) {
  // console.log('commas');
  return str.split(',')[0];
};

/**
 * Replaces any double spaces the previous methods have left with a single space
 */
utils.spaces = function (str) {
  // console.log('spaces');
  return str.replace('  ', ' ');
};

module.exports = utils;
