import React, {
  Component
} from 'react';
// import ReactDOMServer from 'react-dom/server'

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <form action='/createAccount' method='get' accept-charset='utf-8'>
          <input type='hidden' name='cart_id' value='abcXXX'></input>
          <input type='text' name='email'></input>
          <button type='submit'>Log In</button>
        </form>
      </div>
    );
  }
}
