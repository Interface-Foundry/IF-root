/**
 * string manipulation functions for cleaning up camel item strs
 * @namespace utils
 */
var utils = {};

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
 *
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
 *
 */
utils.periods = function (str) {
  return str.split('. ')[0];
};

/**
 *
 */
utils.commas = function (str) {
  return str.split(',')[0];
};

/**
 * replaces any double spaces the previous methods have left with a single space
 */
utils.spaces = function (str) {
  // console.log('spaces');
  return str.replace('  ', ' ');
};

module.exports = utils;
