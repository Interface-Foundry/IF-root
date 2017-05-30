import React, { Component } from 'react';

import { Icon } from '../../themes';
import { Link } from 'react-router-dom';
import { Plus } from '../../themes/newSvg';
import PropTypes from 'prop-types';

export default class Ribbon extends Component {

  static propTypes = {
    fixed: PropTypes.bool,
    ribbonTemplate: PropTypes.object,
    user_account: PropTypes.object,
    src: PropTypes.string,
    toggleModal: PropTypes.func,
    toggleSidenav: PropTypes.func
  }
  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    return nextProps.fixed !== this.props.fixed
      || nextProps.ribbonTemplate.right.loginText !== this.props.ribbonTemplate.right.loginText
      || nextProps.user_account !== this.props.user_account
      || nextProps.user_account.name !== this.props.user_account.name
      || nextProps.src !== this.props.src;
  }

  render() {
    const { fixed, toggleSidenav, toggleModal, user_account, src, ribbonTemplate } = this.props;

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
                  {ribbonTemplate.right.newCartText}
                </button></a>
            </div> : null  
          }

          {
            user_account ? null : ( src !== 'slack' ? <div className="right row row-1 action2">
                <a href='/newcart'><button>
                <Plus /> {ribbonTemplate.right.newCartText}
                </button></a>
              </div> : <div className="right row row-1 action2">
                  <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
                    {ribbonTemplate.right.addToSlackText}
                  </button></a>
              </div>
            )  
          }

          {
            user_account ? null : <div className="right row row-1">
              <div className="col-12 row-1 action">
                <button onClick={() => toggleModal()}>{ribbonTemplate.right.loginText}</button>
              </div>
            </div>
          }
          <div className="row row-1 second">
            {
              ribbonTemplate.left.map((button, i) => (
                <div key={i} className="right row row-1">
                  <div className="col-12 row-1 action">
                    <Link to={button.link} ><button>{button.title}</button></Link>
                  </div>
                </div>))
            }
          </div>
        </div>
      </nav>
    );
  }
}