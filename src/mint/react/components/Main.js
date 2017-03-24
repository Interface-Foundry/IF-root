import React, { PropTypes, Component } from 'react';
import InputContainer from '../containers/InputContainer';
import CartContainer from '../containers/CartContainer';
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
      <div>
        <Grid>
            <Row>
                <Col xs={12}>
                    <PageHeader>
                        Cart ID #{cart_id}
                    </PageHeader>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <strong>Accounts:</strong>
                    {accounts.map((account, i) => <span key={i}>{account.email_address}</span>)}
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {loggedIn
                      ? <CartContainer cart_id={cart_id}/>
                      : ((newAccount || newAccount === undefined)
                        ? <InputContainer cart_id={cart_id} />
                        : <p>Looks like you've been here before. We just sent you an email, use that to log in! </p>)}
                </Col>
            </Row>
        </Grid>
      </div>
    );
  }
}
