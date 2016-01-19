/**
 * Pass a question to this question-answering module, supplying optional
 * source text (like the text of an amazon.com page)
 */
module.exports = function(question, source, callback) {
  if (typeof source === 'function') {
    callback = source;
    source = null;
  }

  callback(null, '42')
}
