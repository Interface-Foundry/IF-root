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
	IoSocialLinkedin,
	IoAndroidCart,
	IoArrowRightC,
	IoNaviconRound,
	IoClock,
	IoArrowGraphDownLeft,
	IoHappy,
	IoChevronUp,
	IoCloseRound,
	IoPlus,
	IoLogOut,
	IoLogIn,
	IoSocialFacebook,
	IoSocialTwitter,
	IoCheckmarkRound
} from 'react-icons/lib/io'

import {
  Support,
  Empower,
  Believe,
  Amazon,
  Google,
  Delivery,
  Slack,
  Microsoft,
  Wallstreet,
  Fastcompany,
  Paymentsource,
  Time,
  Venturebeat,
  Newsweek
} from './';

export default class Icon extends Component {
	render() {
  	switch (this.props.icon) {
  		case 'Right':
        return <IoArrowRightC/>
		  case 'Plus':
			  return <IoPlus/>
		  case 'Clear':
			  return <IoCloseRound/>
		  case 'Check':
  			return <IoCheckmarkRound/>
		  case 'Up':
			  return <IoChevronUp/>
      case 'Down':
        return <IoChevronDown/>
		  case 'Cart':
        return <IoAndroidCart/>
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
     	case 'Support':
      	return <Support/>
     	case 'Empower':
      	return <Empower/>
     	case 'Believe':
      	return <Believe/>
      case 'Amazon':
      	return <Amazon/>
     	case 'Google':
      	return <Google/>
     	case 'Slack':
      	return <Slack/>
	    case 'Microsoft':
      	return <Microsoft/>
	    case 'Delivery':
      	return <Delivery/>
      case 'Menu':
        return <IoNaviconRound/>
      case 'Clock':
        return <IoClock/>
      case 'GraphDown':
        return <IoArrowGraphDownLeft/>
      case 'Happy':
        return <IoHappy/>
	    case 'Logout':
	      return <IoLogOut/>
	    case 'Login':
	      return <IoLogIn/>
	    case 'Wallstreet':
	    	return <Wallstreet/>
	    case 'Fastcompany':
	    	return <Fastcompany/>
	    case 'Paymentsource':
	    	return <Paymentsource />
	   	case 'Newsweek':
	   		return <Newsweek />
	    case 'Time':
	    	return <Time/>
	    case 'Venturebeat':
	    	return <Venturebeat/>
	    case 'Facebook':
	    	return <IoSocialFacebook/>
	    case 'Twitter':
	    	return <IoSocialTwitter/>
  	}
  }
}
