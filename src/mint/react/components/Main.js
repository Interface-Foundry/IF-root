import React, { PropTypes, Component } from 'react';
import InputContainer from '../containers/InputContainer';
import CartContainer from '../containers/CartContainer';

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
        <div className="container">
            <div className="row">
                <div className="col-xs-12">
                    <h1 className="page-header">Cart ID #{cart_id}</h1>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <h6>
                        <strong>Accounts:</strong>
                        {accounts.map((account, i) => <span className="text-primary" key={i}>{account.email_address}</span>)}
                    </h6>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    {loggedIn
                      ? <CartContainer cart_id={cart_id}/>
                      : ((newAccount || newAccount === undefined)
                        ? <InputContainer cart_id={cart_id} />
                    : <div className="help-block">Looks like you've been here before. We just sent you an email, use that to log in! </div>)}
                </div>
            </div>

            <hr/>
        </div>

      </div>
    );
  }
}
