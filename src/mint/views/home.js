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
        <p>Kip!</p>
        <form action='/cart/abcXXX' method='get' accept-charset='utf-8'>
          <button type='submit'>Create A Cart</button>
        </form>
      </div>
    );
  }

  // methods
}
