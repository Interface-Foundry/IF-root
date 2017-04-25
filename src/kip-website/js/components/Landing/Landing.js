/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Ribbon } from '..';
import { HeroContainer, StatementContainer } from '../../containers';


export default class Landing extends Component {
  render() {
    return (
      <div className="landing"> 
        <Ribbon/>
        <HeroContainer/>
        <StatementContainer/>
      </div>
    );
  }
}