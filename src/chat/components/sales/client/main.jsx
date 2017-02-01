import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import App from '../imports/ui/App.jsx';
 
Meteor.startup(() => {
	Meteor.subscribe('metrics');
	  render(<App />, document.getElementById('render-target'));
});