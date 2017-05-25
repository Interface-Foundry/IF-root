/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';
import { Link } from 'react-router-dom';
import { Plus, Right } from '../../themes/newSvg';

export default class Ribbon extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if (
      nextProps.fixed !== this.props.fixed
      || nextProps.user_account !== this.props.user_account
      || nextProps.user_account.name !== this.props.user_account.name
      || nextProps.src !== this.props.src
    ) {
      return true;
    }

    return false
  }

  render() {
    const { fixed, toggleSidenav, toggleModal, user_account, src } = this.props;

    return (
      <nav className={`ribbon ${fixed ? 'background' : ''}`}>
        <div className='row-1'> 
          <div className="row row-1">
            <Link to="/">
              <div className="row-1">
                <div className='image' style={
                  {
                    backgroundImage: `url(https://storage.googleapis.com/kip-random/kip_logo_horizontal.svg)`
                  }}/>
              </div>
            </Link>
          </div>

          {
            user_account && user_account.email_address ? <div className="right row row-1">
              <div className="right menu row row-1" onClick={() => toggleSidenav()}>
                <Icon icon='Menu' />
              </div>
            </div> : null     
          }

          {
            user_account && user_account.email_address ? <div className="right row row-1 action2">
                <a href='/newcart'><button>
                  New Cart
                </button></a>
            </div> : null  
          }

          {
            user_account ? null : ( src !== 'slack' ? <div className="right row row-1 action2">
                <a href='/newcart'><button>
                  <Plus/> New Cart
                </button></a>
              </div> : <div className="right row row-1 action2">
                  <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
                    Add To Slack
                  </button></a>
              </div>
            )  
          }

          {
            user_account ? null : <div className="right row row-1">
              <div className="col-12 row-1 action">
                <button onClick={() => toggleModal()}>Log in</button>
              </div>
            </div>
          }
          <div className="right row row-1">
            <div className="col-12 row-1 action">
              <Link to='/help' ><button>Help</button></Link>
            </div>
          </div>
          <div className="right row row-1">
            <div className="col-12 row-1 action">
              <Link to='/blog'><button>Blog</button></Link>
            </div>
          </div>
          <div className="right row row-1">
            <div className="col-12 row-1 action">
              <Link to='/whykip' ><button>Why Kip</button></Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}
