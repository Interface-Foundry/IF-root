// react/components/Display/Display.js

import React, { Component } from 'react';
import { Route } from 'react-router';

import { SettingsContainer, FeedbackContainer, EditCartContainer, ArchiveContainer, ShareContainer, InvoiceContainer } from '../../containers';


export default class Display extends Component {
  render = () =>
    (
      <div className='display'>
        <Route path={'/cart/:cart_id/m/share'} exact component={()=><ShareContainer {...this.props}/>} />
        <Route path={'/cart/:cart_id/m/edit'} exact component={EditCartContainer} />
        <Route path={'/cart/:cart_id/m/invoice'} exact component={InvoiceContainer} />
        <Route path={'/m/settings'} exact component={SettingsContainer} />
        <Route path={'/m/feedback'} exact component={FeedbackContainer} />
        <Route path={'/m/archive'} exact component={ArchiveContainer} />
      </div>
    )
}
