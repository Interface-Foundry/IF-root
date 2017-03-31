## Mint, Stand alone KIP shopping cart!!

Implemented using React, Redux, Webpack.

Karma, Jasmine, Enzyme (airBnB's pretty awesome react specific testing library)

Babel all day and all night (gotta love writting javascript that compiles to... more javascript!!!)

## SETUP

1. Install [NodeJS](nodejs.org)
2. Install [Mongodb](mongodb.com)
3. Go to root directory and run `npm install`
4. Go to mint directory and run `npm install`

## HOW TO DO INTERNETS
We are using pretty standard commands just to keep it easy, webpack builds react into public then express serves it up on port: 3000

1. yarn dev --> npm run dev --> runs express and webpack-dev-server with hot-reloading because meh to refreshing
2. npm run test --> runs karma start, which has technically less characters so you could justs go with karma start 

## API DOCS
Peter has built a pretty awesome apidoc, should automagically open after running script.

1. npm run apidoc

## File Structure

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

## TEST FILES

All test files are in __test__ folders in their respective folders (e.g actions/__test__, components/__test__)
Not full coverage yet, and most tests are very basic unit tests. Should test more use cases/edge cases expecially for any async functions that talk with the backend.

## Platforms

No styling implemented yet.
Eventally Should work on mobile, tablet, and desktop.

## (current) Sub-branches

1. Mint-react --> refactoring mint front, streamlining onboarding process, building memebers onboarding.



