/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import ReactDOM from 'react-dom';

import { HeaderContainer, FooterContainer } from '../../containers';

import { Icon } from '../../themes';
import { Down, Right, EmailDrawn, FacebookDrawn, TwitterDrawn, Smartphone } from '../../themes/newSvg';


const img_src = [
  {
    src: 'https://storage.googleapis.com/kip-random/mint_1_desktop.gif',
    class: 'secondary',
    bubble: 'Browse Items or Paste a URL to Add Things to Your Kip Cart',
    step: 'One',
    id: 1
  },
  {
    src: 'https://storage.googleapis.com/kip-random/mint_2_desktop.gif',
    class: 'primary',
    bubble: 'Use Kip to Store the Items you Love in the Cloud',
    step: 'Two',
    id: 2
  },
  {
    src: 'https://storage.googleapis.com/kip-random/mint_3_desktop.gif',
    class: 'third',
    bubble: 'Invite friends to Add to Your Kip Cart, Share Shipping and Other Fees',
    step: 'Three',
    id: 3
  }
]

const FAQ = [
  {
    title: 'How do i talk to kip?',
    answer: 'Kip only responds to Direct Messages. To send a Direct Message, tap Kip’s name in the Direct Messages list or + button next to it to send a message to Kip. Direct Messages help save on chatter so that you can focus on your work'
  },
  {
    title: 'Why can’t I remove items from my cart?',
    answer: 'Only Team Admins can add and remove other people’s items in the cart, change quantities and set budgets and prices. Team members can remove only their own items.'
  },
  {
    title: 'I don’t see the my team name in the authorization page.',
    answer: 'You may need additional admin privileges to add Kipbot to your team or channel. Check your admin levels by clicking your account profile on your Slack team.'
  },
  {
    title: 'I don’t use any platform but I want to try it.',
    answer: 'We have a no frills, no download, no sign-in version available at kipthis.com/chat. If you have a chat service you want Kip to be on, drop us a note.'
  },
  {
    title: 'I can’t get Kip to work :(',
    answer: 'If Kip isn’t working for you, drop us a message and we’ll get back to you ASAP.'
  },
  {
    title: 'Who is Kip?',
    answer: 'Kip is a young digital penguin who is loves large groups of people. Being inside teams is like being in a community colony :). They are 5"inches tall, very blue and hate missing a good sale. Their favorite food is emoji 🍋 🍉 🍇 if you send Kip emojis, they will get happy! Underneath their round black eyes, they have a personality like an iceberg…'
  }
]

export default class Help extends Component {
  constructor(props) {
    super(props)
    this._startLoop = this._startLoop.bind(this)
  }

  state = {
    selectedIndex: 0,
    offsetTop: 0
  }

  componentWillMount() {
    // try to preload giffs
    img_src.map((row) => {
      let img = new Image()
      img.src = row.src;
    })

    this._startLoop()
  }

  componentDidMount() {
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.help).offsetTop + 50
    })
  }


  _startLoop(stop) {
    const { selectedIndex } = this.state

    if(stop) {
      if(self)
        clearTimeout(self.timeout)

      clearTimeout(this.timeout)
    } else {
      let self = this
      self.timeout = setTimeout(() => {

        self.setState({
          selectedIndex: selectedIndex === 2 ? 0 : selectedIndex+1
        })    

        self._startLoop()
      }, 5000);
    }
  }

  componentWillUnmount() {
    this._startLoop(true)
  }

  render() {
    const { selectedIndex, offsetTop } = this.state,
      { _startLoop } = this;

    return (
      <div className="Help"> 
        <HeaderContainer title={'Kip is 1 - Click Easy'} subtext={['No Fees', 'No Download', 'No Hassle']} color={img_src[selectedIndex].class} offsetTop={offsetTop}/>
        <section className={`tutorial ${img_src[selectedIndex].class}`} ref={(help) => this.help = help}> 
          <nav className="col-12 row-1 services__navigation">
            {
              img_src.map((i, index) => (
                <h2 key={i.id} onClick={() => { _startLoop(true); this.setState({selectedIndex: index}) }} className={`row-1 col-4 ${index === selectedIndex ? 'selected' : ''}`}>
                  Step&nbsp;–&nbsp;
                  <span className={i.class}>{i.step}</span>
                </h2>
              ))
            }
          </nav>
          <div className="col-12 row-1 tutorial__slideshow" >
            <CSSTransitionGroup
              transitionName="slide"
              transitionEnterTimeout={0}
              transitionLeaveTimeout={0}>
              {
                img_src.map((i, index) => { 
                  if(index !== selectedIndex ) return null

                  return (
                    <div key={i.id} className={`image ${img_src[selectedIndex].class}`} style={
                      {
                        backgroundImage: `url(${i.src})`
                      }}>                          
                      <div className='bubble'>
                        <p>{i.bubble}</p>
                      </div>
                    </div>
                  )
                })
              }
            </CSSTransitionGroup>
          </div>
        </section>
        <section className='FAQ'> 
          <h1><span>Frequently Asked Questions</span></h1>
          <p className='subtext'>Cant find your answer? Contact us at <span>hello@kipthis.com</span></p>
          {
            FAQ.map((q, i) => (
              <div key={i} className='question'>
                <h2>
                  {`${i+1}. `}
                  {q.title}
                </h2>
                <p>{q.answer}</p>
              </div>
            ))
          }
        </section>
        <FooterContainer />
      </div>
    );
  }
}
