/* key:
  NOUN: a noun, like "cow"
  PLURAL_NOUN: like "cows"
  ADJECTIVE: like "soft"
  COMPARATIVE_ADJECTIVE: like "softer"
  SUPERLATIVE_ADJECTIVE: like "softest"
  SELECTION_NUMBER: 1, 2, or 3
  PRODUCT: the title of a random product from amazon, ebay, walmart or wherever
*/

// templates
module.exports = {
  initial_search: [
    'NOUN',
    'PLURAL_NOUN',
    'find me a NOUN',
    'find me PLURAL_NOUN',
    'ADJECTIVE NOUN',
    'SUPERLATIVE_ADJECTIVE NOUN',
    'PRODUCT'
  ],

  modify_previous_search: [
    'more ADJECTIVE',
    'SELECTION_NUMBER but ADJECTIVE',
    'SELECTION_NUMBER but COMPARATIVE_ADJECTIVE',
    'like SELECTION_NUMBER but ADJECTIVE',
    'like SELECTION_NUMBER but COMPARATIVE_ADJECTIVE'
  ]
]}
