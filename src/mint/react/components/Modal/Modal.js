import React, { Component, PropTypes } from 'react';

import { Icon } from '..';
import { EmailFormContainer, AmazonFormContainer, ItemContainer } from '../../containers';

export default class SignIn extends Component {

  static propTypes = {
    component: PropTypes.string.isRequired,
    changeModalComponent: PropTypes.func.isRequired
  }

  render() {
    const { component } = this.props;

    return (
      <div className="modal">
        { component
          ? this.renderComponent()
          : null}
      </div>
    );
  }

  renderComponent() {
    const { component, changeModalComponent } = this.props;

    const Components = {
      AmazonFormContainer,
      EmailFormContainer,
      ItemContainer
    }
    const Component = Components[component]

        return <Component changeModalComponent={changeModalComponent} />;
  }
}
