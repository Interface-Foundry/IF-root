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
        <form action='/newcart' method='get' accept-charset='utf-8'>
          <button type='submit'>new cart</button>
        </form>
      </div>
    );
  }

  // methods
}
