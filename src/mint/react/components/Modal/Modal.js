import React, { Component, PropTypes } from 'react';

import { Icon } from '..';
import { EmailFormContainer, AmazonFormContainer, ItemContainer } from '../../containers';

export default class SignIn extends Component {

  static propTypes = {
    component: PropTypes.string.isRequired,
    changeModalComponent: PropTypes.func.isRequired
  }

  render() {
    const { component, changeModalComponent } = this.props;

    return (
      <div className="modal">
        { component
          ? this.renderComponent()
          : null}
        <div className="modal__drag" onClick={() => changeModalComponent(null)}>
          <Icon icon="Up"/>
        </div>
      </div>
    );
  }

  renderComponent() {
    const { component } = this.props;

    const Components = {
      AmazonFormContainer,
      EmailFormContainer,
      ItemContainer
    }
    const Component = Components[component]

    return <Component />;
  }
}
