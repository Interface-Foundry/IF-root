import React, { Component } from 'react';
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
  IoSearch
} from 'react-icons/lib/io';
import {
  Facebook,
  FacebookMessenger,
  Gmail,
  Slack,
  Sms,
  Whatsapp,
} from '../../styles'

export default class Icon extends Component {
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
    }
  }
}
