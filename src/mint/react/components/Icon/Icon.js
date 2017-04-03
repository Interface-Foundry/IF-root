import React, { Component } from 'react';
import {
  IoEmail,
  IoNaviconRound,
  IoClose,
  IoChevronUp
} from 'react-icons/lib/io';

export default class Icon extends Component {
  render() {
    switch (this.props.icon) {
      case 'Hamburger':
        return <IoNaviconRound/>;
      case 'Email':
        return <IoEmail/>;
      case 'Clear':
        return <IoClose/>;
      case 'Up':
        return <IoChevronUp/>;
    }
  }
}
