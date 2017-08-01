// mint/react/components/Icon/Icon.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  IoAndroidCart,
  IoAndroidFavorite,
  IoAndroidPerson,
  IoAndroidPersonAdd,
  IoArrowLeftC,
  IoCamera,
  IoChatbubbleWorking,
  IoCheckmark,
  IoChevronDown,
  IoChevronLeft,
  IoChevronRight,
  IoChevronUp,
  IoClose,
  IoEdit,
  IoIosEmailOutline,
  IoEye,
  IoGearA,
  IoHappy,
  IoIosBox,
  IoLocked,
  IoUnlocked,
  IoLogIn,
  IoLogOut,
  IoLoop,
  IoNaviconRound,
  IoOutlet,
  IoPlus,
  IoPlusRound,
  IoPricetag,
  IoRefresh,
  IoSad,
  IoSearch,
  IoHome,
  IoPound,
  IoQrScanner,
  IoArrowRightB,
  IoSocialTwitter,
  IoSocialPinterest,
  IoPaperAirplane,
  IoIosUploadOutline,
  IoAndroidOpen,
  IoIosWorldOutline,
  IoAndroidStopwatch
} from 'react-icons/lib/io';
import {
  FaExternalLink,
  FaWhatsapp
} from 'react-icons/lib/fa';
import {
  Facebook,
  FacebookMessenger,
  Gmail,
  Slack,
  Sms,
  Whatsapp
} from '../../styles';
import {
  Share
} from '../../kipsvg';

export default class Icon extends Component {
  static propTypes = {
    icon: PropTypes.string.isRequired
  }
  render() {
    switch (this.props.icon) {
    case 'Like':
      return <IoAndroidFavorite/>;
    case 'Loop':
      return <IoLoop/>;
    case 'Home':
      return <IoHome/>;
    case 'PriceTag':
      return <IoPricetag/>;
    case 'Hamburger':
      return <IoNaviconRound/>;
    case 'Email':
      return <IoIosEmailOutline/>;
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
      return <FaWhatsapp style={{fill: '#25d366'}}/>;
    case 'Camera':
      return <IoCamera/>;
    case 'Locked':
      return <IoLocked/>;
    case 'Unlocked':
      return <IoUnlocked/>;
    case 'Check':
      return <IoCheckmark/>;
    case 'Search':
      return <IoSearch/>;
    case 'Open':
      return <FaExternalLink/>;
    case 'Cart':
      return <IoAndroidCart/>;
    case 'Archive':
      return <IoIosBox/>;
    case 'Person':
      return <IoAndroidPersonAdd/>;
    case 'Member':
      return <IoAndroidPerson/>;
    case 'Eye':
      return <IoEye/>;
    case 'Plus':
      return <IoPlus/>;
    case 'Settings':
      return <IoGearA/>;
    case 'Down':
      return <IoChevronDown/>;
    case 'Left':
      return <IoArrowLeftC/>;
    case 'Refresh':
      return <IoRefresh/>;
    case 'Logout':
      return <IoLogOut/>;
    case 'Happy':
      return <IoHappy/>;
    case 'Sad':
      return <IoSad/>;
    case 'Neutral':
      return <IoOutlet/>;
    case 'Add':
      return <IoPlusRound/>;
    case 'RightChevron':
      return <IoChevronRight />;
    case 'LeftChevron':
      return <IoChevronLeft />;
    case 'Login':
      return <IoLogIn/>;
    case 'Share':
      return <Share/>;
    case 'Chatbubble':
      return <IoChatbubbleWorking/>;
    case 'Hash':
      return <IoPound/>;
    case 'QR':
      return <IoQrScanner/>;
    case 'Right':
      return <IoArrowRightB/>;
    case 'Twitter':
      return <IoSocialTwitter/>;
    case 'Pinterest':
      return <IoSocialPinterest/>;
    case 'Send':
      return <IoPaperAirplane/>;
    case 'Upload':
      return <IoAndroidOpen/>;
    case 'World':
      return <IoIosWorldOutline/>;
    case 'Timer':
      return <IoAndroidStopwatch/>;
    default:
      return <div>¯\_(ツ)_/¯</div>;
    }
  }
}
