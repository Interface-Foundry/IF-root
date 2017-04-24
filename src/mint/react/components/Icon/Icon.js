// mint/react/components/Icon/Icon.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IoEmail,
  IoNaviconRound,
  IoClose,
  IoChevronUp,
  IoEdit,
  IoPricetag,
  IoCamera,
  IoLocked,
  IoCheckmark,
  IoSearch,
  IoIosCartOutline,
  IoPlus,
  IoAndroidPersonAdd
} from 'react-icons/lib/io';
import {
  FaExternalLink
} from 'react-icons/lib/fa';
import {
  Facebook,
  FacebookMessenger,
  Gmail,
  Slack,
  Sms,
  Whatsapp,
} from '../../styles'

export default class Icon extends Component {
  static propTypes = {
    icon: PropTypes.string.isRequired
  }
  render() {
    switch (this.props.icon) {
    case 'PriceTag':
      return <IoPricetag/>
    case 'Hamburger':
      return <IoNaviconRound/>;
    case 'Email':
      return <IoEmail/>;
    case 'Clear':
      return <IoClose/>;
    case 'Up':
      return <IoChevronUp/>;
    case 'Edit':
      return <IoEdit/>;
    case 'Facebook':
      return <Facebook/>;
    case 'FacebookMessenger':
      return <FacebookMessenger/>;
    case 'Gmail':
      return <Gmail/>;
    case 'Slack':
      return <Slack/>;
    case 'Sms':
      return <Sms/>;
    case 'Whatsapp':
      return <Whatsapp/>;
    case 'Camera':
      return <IoCamera/>;
    case 'Locked':
      return <IoLocked/>;
    case 'Check':
      return <IoCheckmark/>;
    case 'Search':
      return <IoSearch/>;
    case 'Open':
      return <FaExternalLink/>; 
    case 'Cart':
      return <IoIosCartOutline/>;
    case 'Person':
      return <IoAndroidPersonAdd/>;
    case 'Plus':
      return <IoPlus/>;
    default:
      return <div>¯\_(ツ)_/¯</div>
    }
  }
}
