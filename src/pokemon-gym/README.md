# Pokemon Gym

**How to run on your dev machine**
* cd to UI/
* npm install && bower install
* gulp serve

**How to add more pages**
* add a link to UI/material/client/app/layout/sidebar.html
* add an .html file at the specified directory
* add the route to UI/material/client/app/core/config.route.js

*example: creating `#/tests/nlp` route:*
* added `<a md-button aria-label="meanu" href="#/tests/nlp">` to sidebar.html
* created the file UI/material/client/app/tests/nlp.html
* added 'tests/nlp' to the `routes` array in config.route.js
