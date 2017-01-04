# Pokemon Gym

**How to modify the UI on your dev machine**
* cd to pokemon-gym/UI/material
* npm install && bower install
* cd to pokemon-gym/server
* node app.js
* go to localhost:9999 and log in with username: kip, password: vampirecat1200

**How to add more pages**
* add a link to UI/material/client/app/layout/sidebar.html
* add an .html file at the specified directory
* add the route to UI/material/client/app/core/config.route.js

*example: creating `#/tests/nlp` route:*
* added `<a md-button aria-label="meanu" href="#/tests/nlp">` to sidebar.html
* created the file UI/material/client/app/tests/nlp.html
* added 'tests/nlp' to the `routes` array in config.route.js
