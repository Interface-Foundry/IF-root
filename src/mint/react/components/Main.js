import React, { PropTypes, Component } from 'react';
import InputContainer from '../containers/InputContainer';
import CartContainer from '../containers/CartContainer';
import Onboard from '../components/Onboard';
import { Button, Grid, Row, Col, PageHeader } from 'react-bootstrap';

export default class Cart extends Component {
  static propTypes = {
    cart_id: PropTypes.string.isRequired,
    accounts: PropTypes.array.isRequired,
    newAccount: PropTypes.bool
  }

  render() {
    const { cart_id, accounts, newAccount } = this.props;
    const loggedIn = accounts.length > 0;
    return (
      <Grid>
        <Row>
          <Col xs={12}>
              <PageHeader>
                Cart ID #{cart_id}
              </PageHeader>
          </Col>
        </Row>
        <Row>
          {loggedIn ? 
            <Col xs={12}>
              <strong>Accounts:</strong>
              {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
            </Col>
            : null}
        </Row>
        <Row>
          <Col xs={12}>
            {/* This should be an overlay on top of the CartContainer at some point */}
            {/* !loggedIn ? null : <Onboard /> */}
            <CartContainer cart_id={cart_id}/>
          </Col>
        </Row>
      </Grid>
    );
  }
}
