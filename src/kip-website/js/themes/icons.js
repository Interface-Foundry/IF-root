/* @flow */
import React, { Component } from 'react'
import {
	IoChevronDown,
	IoSoupCanOutline,
	IoLaptop,
	IoIphone,
	IoSocialNodejs,
	IoEmail,
	IoSocialGithub,
	IoSocialLinkedin
} from 'react-icons/lib/io'

export default class Icon extends Component {
	render() {
    	switch (this.props.icon) {
	        case 'Down':
	          	return <IoChevronDown/>
	        case 'Server':
	        	return <IoSoupCanOutline/>
			case 'Client':
	        	return <IoLaptop/>
	        case 'Mobile':
	        	return <IoIphone/>
	        case 'Email':
	        	return <IoEmail/>
	        case 'Github':
	        	return <IoSocialGithub/>
	        case 'Linkedin':
	        	return <IoSocialLinkedin/>
      	}
    }
}

