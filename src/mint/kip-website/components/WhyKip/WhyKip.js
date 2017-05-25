/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom'

import { Footer } from '..';
import { HeaderContainer } from '../../containers';

import { Icon } from '../../themes';
import { Down, Right, Items, Mapper, Cloud, Person } from '../../themes/newSvg';

export default class About extends Component {
  constructor(props) {
      super(props)
  }

  state = {
    offsetTop: 0
  }

  componentDidMount() {
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.why).offsetTop - 50
    })
  }

  render() {
    const { offsetTop } = this.state;

    return (
      <div className="about"> 
        <HeaderContainer title={'A.I Penguin for Group Purchases'} subtext={[ 'Community Driven', 'Social Commerce', 'Machine Learning']} color="primary" offsetTop={offsetTop}/>
        <div className="why col-12" ref={(why) => this.why = why}> 
          <div className="col-12">
            <h1>WHY PENGUINS?</h1>
            <h4>
              <span>Kip</span> brings a penguin's perspective to collective purchasing. 
            </h4>
            <section className='cluster'>
              <div className='image' style={{backgroundImage: 'url(https://storage.googleapis.com/kip-random/many_kips/presents_smile.svg)'}}/>
              <div className='inline'>
                <Down/>
                <Down/>
                <Down/>
              </div>
            </section>
            <div className="col-4 row-1 services__details">
              <div className='image' style={{backgroundImage: 'url(https://storage.googleapis.com/kip-random/many_kips/office.svg)'}}/>
              <h4>
                Group together to share resources and warmth. 
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
              </div>
            </div>

            <div className="col-4 row-1 services__details">
              <div className='image' style={{backgroundImage: 'url(https://storage.googleapis.com/kip-random/many_kips/struggle.svg)'}}/>
              <h4> 
                Help each other find the best spots to shop and fish. 
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
              </div>
            </div>

            <div className="col-4 row-1 services__details">
              <div className='image' style={{backgroundImage: 'url(https://storage.googleapis.com/kip-random/many_kips/coupon_L.svg)'}}/>
              <h4> 
                Swim through deals like a professional Penguin.
              </h4>
              <div className="col-12 row-1 action">
                <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button><span>Use Kip Now <Right/></span></button></a>
              </div>
            </div>
          </div>
        </div>
        <h1>AS SEEN IN</h1>
        <section className="iconsRow">
          <div className="icon col-1"/>
          <div className="icon col-1"><Icon icon='Wallstreet'/></div>
          <div className="icon col-1"><Icon icon='Fastcompany'/></div>
          <div className="icon col-1"><Icon icon='Time'/></div>
          <div className="icon col-1"><Icon icon='Venturebeat'/></div>
          <div className="icon col-1"><Icon icon='Paymentsource'/></div>
          <div className="icon col-1"/>
        </section>
        <section className="col-12 row-1 video">
          <iframe width="100%" height="100%" src="https://www.youtube.com/embed/QPlBeTJqF1Y?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe>
        </section>
        <Footer/>
      </div>
    );
  }
}