# Mint, Stand alone KIP shopping cart!!

Implemented using React, Redux, Webpack.

Karma, Jasmine, Enzyme (airBnB's pretty awesome react specific testing library)

Babel all day and all night (gotta love writting javascript that compiles to... more javascript!!!)

# SETUP

1. Install [NodeJS](nodejs.org)
2. Install [Mongodb](mongodb.com)
3. Go to root directory and run `npm install`
4. Go to mint directory and run `npm install`

# HOW TO DO INTERNETS
We are using pretty standard commands just to keep it easy, webpack builds react into public then express serves it up on port: 3000

1. yarn dev --> npm run dev --> runs express and webpack-dev-server with hot-reloading because meh to refreshing
2. yarn react-tests --> runs karma start, which has technically less characters so you could justs go with karma start
3. yarn test --> runs api tests if you have a server running already


# ENVIRONMENTAL VARIABLES AND SWITCHES

* `NODE_ENV` - sort of a node.js convention for determining if server errors are logged to the user or if the user gets the fail whale or other external-facing error page. also sometimes has weird effects in some npm modules.
	* `production` logs less debug information
	* `development` logs more i guess
* `SEND_EMAILS` - sends emails if set
  * `export SEND_EMAILS=1` or `true` or anything (even `0`) will send emails
  * `export SEND_EMAILS=;` will not send emails
* `NO_LIVE_RELOAD` - controls whether the webpack stuff runs. I set this when working just on back-end stuff.
* `NO_LUMINATI` - uses a regular request instead of a proxied request through luminati. only use this as a very last resort. if you need to scrape deals or something, instead of running the scraper locally with `NO_LUMINATI=1` you can ask someone for a db dump of their scraped deals.
* `SCRAPE_DEALS` - turn on and off the periodic scraping of deals, recommend to leave unset in development and just use a dump of the deals db.
* `SEND_DAILY_DEALS` - turn on and off the emailing of daily deals to customers.

To set an environmental variable in your **.bashrc** or **.zshrc** so that it is set every time you open a terminal and for every command run:

```sh
export NODE_ENV=production
```

To set or override an environmental variable just for one command:
```sh
$ NODE_ENV=development node index.js
```

For **fish** users, to export a variable do

```fish
set -x NODE_ENV production
```

for a single command:

```
> env NODE_ENV=development node index.js
```

The above method using the `env` program will work for any shell, so if you're writing scripts for others to use try to use env instead of `NODE_ENV=development node index.js`.

# API DOCS
Peter has built a pretty awesome apidoc, should automagically open after running script.

1. npm run apidoc

# FILE STRUCTURE

	* -- react
		|___ actions --> Action creators, Async Actions (basically fancy middleware, sends an "action" object(type, params) to the reducer/store)
		|___ components --> The only real react, holds all our react components. Try to keep as much "logic" out of these as possible. Local state is also cool but ensure that the local state does not bloat to much, otherwise move to reducer.
		|___ constants --> Hold all action type constants (e.g for the type field in the action object)
		|___ containers --> Connects react components with redux store/redux forms (two key functions, mapStateToProps --> set component props, mapDispatchToProps --> set component functions)
		|___ reducers --> Simple switch statement that listens for actions. Sets properties for local store (currently a bit bloated, but easy refactor later)
		|___ styles --> (maybe rename to themes?) holds all style constants such as animations, css variables, grid system etc..
		|___ utils --> Utility functions used accross the app
		|___ index.js --> first file that gets run
		|___ routes.js --> We are using react-redux-router, so holds all our routes.

# TEST FILES

All test files are in __test__ folders in their respective folders (e.g actions/__test__, components/__test__)
Not full coverage yet, and most tests are very basic unit tests. Should test more use cases/edge cases expecially for any async functions that talk with the backend.

# PLATFORMS

No styling implemented yet.
Eventally Should work on mobile, tablet, and desktop.

# (current) Sub-branches

1. Mint-react --> refactoring mint front, streamlining onboarding process, building memebers onboarding.

# Posible Optimizations/Refactors for future (in order of priority-ish).

## For Redux: (https://github.com/reactjs/redux/issues/1171)
1. Use selectors everywhere (e.g in containers, do this myValueSelector NOT state.myValue)
	Why:
		1. Easier to tests, lets you write ducks (e.g test action, containers, and reducers )
		2. More reusablity for accessing attributes

2. Do MORE in action-creators and LESS in reducers
	why:
		1. according to the interwebs community "Business logic belongs in action-creators. Reducers should be stupid and simple."
		2. So we should do most of our logic in the action-creators, and secondly in the containers

3. Implement Immutable.js, but can do this last as its just an optimization thing for react. React is built to deal with immutable objects as thats how they do their virtual dom tree diffs (I think its done similar to google closure, should double check me here) so this really speeds up load time and lowers CPU usage ( goes from O(n^3) --> O(n) I think, or thats what reacts special diff algorith does).

# Some cool videos cause cool.

## How react virtual dom-dif works
https://www.youtube.com/watch?v=mLMfx8BEt8g

## Figwheel (amazing work tool, though closurescript which compiles to react which compiles to javascript. Just had to add a closurescript link :D)
https://www.youtube.com/watch?v=j-kj2qwJa_E

## Netflix RxJS + Redux + React
https://www.youtube.com/watch?v=AslncyG8whg
