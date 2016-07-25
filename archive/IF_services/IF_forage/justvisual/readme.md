# justvisual

this is a service that helps us tag images

run process_images.js on ash

it updates each landmark's source_justvisual prop, and sets flags.shouldProcessElasticsearch to true.  Then elasticsearch will re-index.
