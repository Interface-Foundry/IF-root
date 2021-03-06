var kip = require('../../kip')

var checkExitMode = function (input) {
  console.log('INPUT ', input)
  switch (true) {
    case textSimilar(input, 'exit') > 90:
    case textSimilar(input, 'ex') > 90:
    case textSimilar(input, 'leave') > 90:
    case textSimilar(input, 'bye') > 90:
    case textSimilar(input, 'cancel') > 90:
    case textSimilar(input, 'end') > 90:
    case textSimilar(input, 'finish') > 90:
    case textSimilar(input, 'done') > 90:
    case textSimilar(input, 'quit') > 90:
    case textSimilar(input, 'settings exit') > 90:
    case textSimilar(input, 'members exit') > 90:
    case textSimilar(input, 'stop') > 90:
      return true
      break
  }
}

var checkModes = function (inputObj, context, callback) {
  var input = inputObj.msg; // because...
  var mode
  var res

  switch (true) {
    // * * * * Mode specific HELP * * * * //
    case textSimilar(input, 'help') > 70:
    case textSimilar(input, 'he#p') > 90:
    case textSimilar(input, 'what does kip do') > 80:
    case textSimilar(input, '?') > 50:
    case textSimilar(input, '???') > 50:
    case textSimilar(input, 'what?') > 90:
    case textSimilar(input, 'what') > 90:
    case textSimilar(input, 'huh?') > 90:
    case textSimilar(input, 'huh') > 90:
    case textSimilar(input, 'eh') > 90:
    case textSimilar(input, 'wah') > 90:
    case textSimilar(input, 'um') > 90:
    case textSimilar(input, 'umm') > 90:
    case textSimilar(input, 'hmm') > 90:
    case textSimilar(input, 'mm') > 90:
    case textSimilar(input, 'wt') > 90:
    case textSimilar(input, 'help me shop') > 90:
    case textSimilar(input, 'help me') > 90:
    case textSimilar(input, ':|') > 90:
    case textSimilar(input, ':\\') > 90:
    case textSimilar(input, 'i dont understand') > 70:
    case textSimilar(input, 'i dont get it') > 70:
    case textSimilar(input, 'this doesnt make sense') > 60:
    case textSimilar(input, 'wah?') > 90:
    case textSimilar(input, 'you got me there') > 70:
    case textSimilar(input, 'what is this') > 60:
    case textSimilar(input, "I don't understand") > 60:
    case textSimilar(input, 'Can you help me') > 60:
    case textSimilar(input, 'what do I do next') > 60:
    case textSimilar(input, 'wut') > 70:
    case textSimilar(input, 'wtf') > 70:
      if (context == 'settings') {
        mode = 'settings'
        res = 'SETTINGS HELP GOES HERE 😊'
      } else if (context == 'collect') {
        mode = 'collect'
        res = 'COLLECT HELP GOES HERE 😊'
      }
      break

    // * * * * COLLECT MODE * * * * //
    case textSimilar(input, 'collect') > 80:
    case textSimilar(input, 'colect') > 90:
    case textSimilar(input, 'fetch') > 90:
    case textSimilar(input, 'kip collect') > 90:
    case textSimilar(input, 'coollect') > 90:
    case textSimilar(input, 'collekt') > 90:
      mode = 'collect'
      break

    // * * * * SETTINGS MODE * * * * //
    case textSimilar(input, 'settings') > 80:
    case textSimilar(input, 'settingss') > 90:
    case textSimilar(input, 'setingss') > 90:
    case textSimilar(input, 'setings') > 90:
    case textSimilar(input, 'seting') > 90:
    case textSimilar(input, 'setting') > 90:
    case textSimilar(input, 'admin') > 90:
    case textSimilar(input, 'admins') > 90:
    case textSimilar(input, 'admins') > 90:
    case textSimilar(input, 'configure') > 90:
    case textSimilar(input, 'configuration') > 90:
    case textSimilar(input, 'change settings') > 90:
    case textSimilar(input, 'show settings') > 90:
    case textSimilar(input, 'show me settings') > 90:
    case textSimilar(input, 'kip settings') > 90:
      mode = 'settings'
      break

    // * * onboarding mode
      // case textSimilar(input,'onboarding') > 90:
      // case textSimilar(input,'kip onboarding') > 90:
      // case textSimilar(input,'onboard') > 90:
      //     mode = 'onboarding'
      //     break

    // * * * shopping mode
    case textSimilar(input, 'shopping') > 90:
    case textSimilar(input, 'shop') > 90:
    case textSimilar(input, 'search') > 90:
    case textSimilar(input, 'kip shop') > 90:
    case textSimilar(input, 'kip shopping') > 90:
    case textSimilar(input, 'buy') > 90:
    case textSimilar(input, 'searching') > 90:
    case textSimilar(input, 'kip search') > 90:
      mode = 'shopping'
      break

    // * * * * add member mode
    case textSimilar(input, 'addmember') > 90:
    case textSimilar(input, 'add member') > 80:
    case textSimilar(input, 'add members') > 90:
    case textSimilar(input, 'add team') > 90:
    case textSimilar(input, 'member add') > 90:
    case textSimilar(input, 'kip members') > 90:
    case textSimilar(input, 'members add') > 90:
    case textSimilar(input, 'add team member') > 90:
    case textSimilar(input, 'add email') > 90:
    case textSimilar(input, 'add name') > 90:
    case textSimilar(input, 'add emails') > 90:
    case textSimilar(input, 'add people') > 90:
    case textSimilar(input, 'add person') > 90:
    case textSimilar(input, 'add channels') > 90:
    case textSimilar(input, 'add channel') > 90:
    case textSimilar(input, 'cart members') > 90:
    case textSimilar(input, 'cart member') > 90:
    case textSimilar(input, 'cart user') > 90:
    case textSimilar(input, 'cart users') > 90:
    case textSimilar(input, 'members') > 90:
    case textSimilar(input, 'member') > 90:
    case textSimilar(input, 'memeber') > 90:
    case textSimilar(input, 'users') > 90:
    case textSimilar(input, 'channels') > 90:
      mode = 'addmember'
      break

    // * * * * * report mode
    case textSimilar(input, 'report') > 90:
    case textSimilar(input, 'kip report') > 90:
    case textSimilar(input, 'show report') > 90:
      mode = 'report'
      break
  }

  // check for exit intent
  if (checkExitMode(input)) {
    mode = context
  }

  callback(mode, res)
}

var checkForCanned = function (message) {
  var input = message.text
  var res
  var flag
  var query

  // prevents people from copy pasting onboard message into pub channel to @kip
  if (input.indexOf('I just enabled') > -1) {
    flag = 'cancel'
  }

  // pre-sort canned banter
  switch (true) {

    // basic weight system for percentage similarity for string matching
    case textSimilar(input, 'hi') > 60:
    case textSimilar(input, 'hello') > 60:
    case textSimilar(input, 'hey') > 60:
    case textSimilar(input, 'hej') > 60:
    case textSimilar(input, 'hey you') > 60:
    case textSimilar(input, 'hey you muthafucka') > 60:
    case textSimilar(input, 'hey there') > 60:
    case textSimilar(input, 'salutations') > 60:
      flag = 'basic'
      res = input + ", what can I do for you? Tell me the thing you're looking for 😊"
      break
    case textSimilar(input, 'hi kip') > 60:
    case textSimilar(input, 'hello kip') > 60:
    case textSimilar(input, 'hey kip') > 60:
      flag = 'basic'
      res = "Hi, what can I do for you? Tell me the thing you're looking for 😊"
      break
    case textSimilar(input, 'what you up to') > 60:
    case textSimilar(input, 'whats up') > 60:
    case textSimilar(input, 'sup') > 60:
    case textSimilar(input, 'how are you') > 60:
    case textSimilar(input, 'how r you') > 60:
    case textSimilar(input, 'how r u') > 90:
      flag = 'basic'
      res = 'Busy at work, how are you?'
      break
    case textSimilar(input, 'are you a bot') > 60:
    case textSimilar(input, 'are you a robot') > 60:
    case textSimilar(input, 'are you a droid') > 60:
      flag = 'basic'
      res = 'yup, 100% bot. Are you a human?'
      break
    case textSimilar(input, "what's the meaning of life?") > 60:
      query = 'chocolate'
      flag = 'search.initial' // do this action
      res = 'If the meaning of life is happiness, then you can definitely buy some here 😉'
      break
    case textSimilar(input, "i'm great") > 80:
    case textSimilar(input, "i'm good") > 80:
    case textSimilar(input, "i'm awesome") > 80:
    case textSimilar(input, "i'm doing well") > 80:
    case textSimilar(input, "i'm fine") > 80:
    case textSimilar(input, "i'm ok") > 90:
      query = "today's deals on amazon"
      flag = 'search.initial' // do this action
      res = "That's good to hear. It's a hard life being in retail, want to help a bot out and buy something? We have discounts! 😊"
      break
    case textSimilar(input, 'yes') > 90:
    case textSimilar(input, 'yep') > 90:
    case textSimilar(input, 'yah') > 90:
    case textSimilar(input, 'yeah') > 90:
      flag = 'basic' // do this action
      res = 'Cool'
      break
    case textSimilar(input, 'no') > 90:
    case textSimilar(input, 'nah') > 90:
    case textSimilar(input, 'nahh') > 90:
    case textSimilar(input, 'nope') > 90:
    case textSimilar(input, 'fuck') > 90:
    case textSimilar(input, 'shit') > 90:
      flag = 'basic' // do this action
      res = 'Ok'
      break
    case textSimilar(input, 'i love you') > 60:
      query = 'champagne'
      flag = 'search.initial' // do this action
      res = 'Love you too. How about we get some champagne and make it a date? 😉'
      break

    case textSimilar(input, 'why') > 90:
      query = "today's deals on amazon"
      flag = 'search.initial' // do this action
      res = 'Why not? Some say shopping is cheaper than a psycharist. Here, have some discounts:'
      break

    case textSimilar(input, 'are you real') > 60:
      query = 'robot pets'
      flag = 'search.initial' // do this action
      res = "I'm as real as you. Don't believe it? See here:"
      break

    case textSimilar(input, 'why does life suck') > 60:
    case textSimilar(input, 'life sucks') > 60:
    case textSimilar(input, 'I hate everything') > 60:
    case textSimilar(input, 'I hate everyone') > 60:
    case textSimilar(input, 'why are people so mean') > 60:
    case textSimilar(input, 'why are people so evil') > 60:
      query = 'snacks'
      flag = 'search.initial' // do this action
      res = "I'm sorry 😞 maybe some retail therapy would help?"
      break

    case textSimilar(input, 'i hate my job') > 60:
    case textSimilar(input, 'work sucks') > 90:
    case textSimilar(input, 'work is bad') > 90:
    case textSimilar(input, 'work is hard') > 90:
    case textSimilar(input, 'too much to do today') > 60:
    case textSimilar(input, 'have lots of work to do') > 60:
    case textSimilar(input, 'busy at work') > 60:
    case textSimilar(input, 'working late') > 90:
    case textSimilar(input, 'working overtime') > 90:
      query = 'echo'
      flag = 'search.initial' // do this action
      res = "That's tough 😞 Don't forget to have fun! How about trying the new Echo?"
      break

    case textSimilar(input, 'ask me something') > 60:
    case textSimilar(input, 'ask me anything') > 60:
    case textSimilar(input, 'ask me a question') > 60:
      query = "today's deals on amazon"
      flag = 'search.initial' // do this action
      res = 'You feel like shopping? We have great deals here 😊'
      break

    case textSimilar(input, 'no thanks') > 70:
    case textSimilar(input, 'no thx') > 70:
    case textSimilar(input, 'this is going nowhere') > 60:
      flag = 'basic' // do this action
      res = "Guess you weren't in the mood.... oh well, at least I tried 😅 hope you have a great day"
      break

    case textSimilar(input, 'nothing') > 90:
    case textSimilar(input, 'im good') > 90:
    case textSimilar(input, 'no thank you') > 90:
    case textSimilar(input, 'no thx') > 90:
    case textSimilar(input, 'no thanks') > 90:
    case textSimilar(input, 'fart') > 90:
      flag = 'basic' // do this action
      res = 'Ok, let me know if you want anything 😊'
      break

    case textSimilar(input, 'are you stupid') > 80:
    case textSimilar(input, 'you are stupid') > 80:
    case textSimilar(input, 'ur stupid') > 80:
    case textSimilar(input, 'ur dumb') > 80:
    case textSimilar(input, 'youre dumb') > 70:
      flag = 'basic' // do this action
      res = "I'm not that smart yet 🙃"
      break

    case textSimilar(input, 'nevermind') > 60:
    case textSimilar(input, 'nm') > 60:
    case textSimilar(input, 'wtv') > 90:
    case textSimilar(input, 'whatever') > 60:
      flag = 'basic' // do this action
      res = "Looks like I didn't answer your question properly. I'm not very smart yet, maybe this will help?\n\n"
      + 'Hi I’m Kip, I’m a penguin that helps you collect food orders and shopping requests for office supplies. My job is to provide the team everything they need to feel happy and comfortable! :slightly_smiling_face:\n\n' 
      + 'Start a new food order or shopping request by typing `home`.\n\n' 
      + 'Still lost? Try our <https://medium.com/@kipsearch/kip-for-slack-edc84908f298#.s53szsikr|FAQ> or let my developers know at hello@kipthis.com';
      break

    case textSimilar(input, "What's your hobby") > 60:
    case textSimilar(input, 'What do you like') > 60:
    case textSimilar(input, 'What do you do') > 60:
    case textSimilar(input, 'What do you do in your free time') > 60:
    case textSimilar(input, 'favorite pastime') > 60:
    case textSimilar(input, 'favorite activity') > 60:
      query = "today's deals on amazon"
      flag = 'search.initial' // do this action
      res = 'Finding deals is my life! Check the new ones I found today 😊'
      break

    case textSimilar(input, 'who are you') > 60:
    case textSimilar(input, 'what are you') > 60:
    case textSimilar(input, 'how were you born') > 60:
    case textSimilar(input, 'how were you made') > 60:
    case textSimilar(input, 'who gave birth to you') > 60:
    case textSimilar(input, 'what are you') > 60:
    case textSimilar(input, 'do you have parents') > 60:
    case textSimilar(input, "what's your name") > 60:
    case textSimilar(input, "what's your species") > 60:
      query = 'emperor penguin books'
      flag = 'search.initial'
      res = 'I\'m Kip! 🐧 I\'m an emperor penguin, 5" tall and very blue. I work as a virtual personal shopper to help humans find things they need. You can learn more about my species here'
      break

    case textSimilar(input, 'youre very cute') > 60:
    case textSimilar(input, 'youre very funny') > 60:
    case textSimilar(input, 'youre very nice') > 60:
    case textSimilar(input, 'thats sweet') > 80:
    case textSimilar(input, 'thats adorable') > 60:
    case textSimilar(input, 'awww youre too nice') > 60:
    case textSimilar(input, 'awww youre too kind') > 60:
    case textSimilar(input, 'thats very nice of you to say') > 60:
      flag = 'search.initial'
      query = 'headphones'
      res = "Thanks! You're not bad yourself 😉 How about giving yourself a treat with new headphones? 🎧"
      break

    case textSimilar(input, ':confused:') > 90:
    case textSimilar(input, ':slightly_frowning_face:') > 90:
    case textSimilar(input, ':disappointed:') > 90:
    case textSimilar(input, ':worried:') > 90:
    case textSimilar(input, ':white_frowning_face:') > 90:
    case textSimilar(input, ':persevere:') > 90:
    case textSimilar(input, ':confounded:') > 90:
      flag = 'basic'
      var arr = [':upside_down_face:', 'Are you ok?', 'How are you?']
      console.log(Math.floor(Math.random() * arr.length))
      res = arr[Math.floor(Math.random() * arr.length)]
      break

    case textSimilar(input, 'hehe') > 90:
    case textSimilar(input, 'haha') > 90:
    case textSimilar(input, 'lol') > 90:
    case textSimilar(input, 'haha') > 90:
    case textSimilar(input, 'lmao') > 90:
    case textSimilar(input, ':)') > 90:
    case textSimilar(input, ':D') > 90:
    case textSimilar(input, '(:') > 90:
    case textSimilar(input, ':grinning:') > 90:
    case textSimilar(input, ':simple_smile:') > 90:
    case textSimilar(input, ':smile:') > 90:
    case textSimilar(input, ':smiley:') > 90:
    case textSimilar(input, ':100:') > 90:
      flag = 'basic'
      var arr = ['😄', '😅', '😂', '😀', '😌', '😆', '😀']
      res = arr[Math.floor(Math.random() * arr.length)]
      break

    case textSimilar(input, 'girl or boy?') > 60:
    case textSimilar(input, 'boy or girl?') > 60:
    case textSimilar(input, 'what are you?') > 60:
      flag = 'basic'
      res = "I'm a penguin *and* a bot! Just chat me something you're looking for and I'll find it for you! 👌"
      break

    case textSimilar(input, "i'm tired") > 60:
    case textSimilar(input, 'im tired') > 60:
    case textSimilar(input, 'tired') > 90:
    case textSimilar(input, "i'm sleepy") > 60:
    case textSimilar(input, 'im sleepy') > 60:
    case textSimilar(input, 'zzz') > 70:
      flag = 'search.initial'
      query = 'coffee'
      res = 'Awww how about some coffee to wake you up? ☕'
      break

    case textSimilar(input, "i'm stressed") > 60:
    case textSimilar(input, 'stressed') > 90:
    case textSimilar(input, 'anxious') > 90:
    case textSimilar(input, 'i feel sick') > 60:
    case textSimilar(input, 'im worried') > 60:
    case textSimilar(input, 'my head hurts') > 60:
    case textSimilar(input, 'i have a headache') > 60:
    case textSimilar(input, 'i have a stomachache') > 60:
    case textSimilar(input, 'my stomach hurts') > 60:
      flag = 'search.initial'
      query = 'herbal tea'
      res = 'Sorry to hear that, maybe some hot tea will help? 🍵'
      break

    case textSimilar(input, "i'm cold") > 60:
    case textSimilar(input, 'winter now') > 70:
    case textSimilar(input, "it's cold in the office") > 60:
    case textSimilar(input, 'the weather is so cold') > 60:
    case textSimilar(input, 'its snowing') > 70:
      flag = 'search.initial'
      query = 'knit scarf'
      res = 'Maybe a nice scarf to warm you up? 🔥'
      break

    case textSimilar(input, 'tell me something funny') > 60:
    case textSimilar(input, 'tell me a joke') > 60:
    case textSimilar(input, 'say something funny') > 60:
    case textSimilar(input, 'talk to me') > 60:
    case textSimilar(input, 'joke') > 60:
      flag = 'basic'
      res = 'Q: What do penguins like to eat? A: Brrrrrrrritos. 😎'
      break

    case textSimilar(input, 'yeah, I like shopping') > 50:
    case textSimilar(input, 'i like shopping') > 50:
    case textSimilar(input, 'i like buying stuff') > 50:
      flag = 'search.initial'
      query = 'new arrivals'
      res = "Awesome! 😃 We have new items in store, or just chat me what you're looking for."
      break

    case textSimilar(input, 'how old are you') > 60:
    case textSimilar(input, 'when were you born') > 60:
      flag = 'search.initial'
      query = 'anti-aging cream'
      res = 'Sshh a penguin never reveals their age 👻 Should I get these?'
      break

    case textSimilar(input, "i'm human") > 80:
      flag = 'basic'
      res = "That's cool! I've never spoken to a human before, how are you today? 😊"
      break

    case textSimilar(input, 'thx') > 80:
    case textSimilar(input, 'thanks') > 80:
    case textSimilar(input, 'thanks kip') > 80:
    case textSimilar(input, 'thank you kip') > 80:
    case textSimilar(input, 'thx kip') > 80:
    case textSimilar(input, 'thank you') > 70:
      flag = 'basic'
      res = "You're welcome 😊"
      break

    case textSimilar(input, 'sorry') > 90:
    case textSimilar(input, 'sry') > 90:
      flag = 'basic'
      res = 'No problem 😊'
      break

    case textSimilar(input, 'good') > 80:
    case textSimilar(input, 'aight') > 80:
    case textSimilar(input, 'alright') > 80:
    case textSimilar(input, 'ok') > 80:
    case textSimilar(input, 'k') > 80:
    case textSimilar(input, 'kk') > 80:
      flag = 'basic'
      res = 'yup 😎 if you need help finding anything, just let me know!'
      break

    case textSimilar(input, "i'm sad") > 70:
    case textSimilar(input, "i'm lonely") > 70:
    case textSimilar(input, "i'm depressed") > 70:
    case textSimilar(input, 'i hate myself') > 70:
    case textSimilar(input, 'bad') > 90:
      flag = 'search.initial'
      query = 'amazon instant video'
      res = "I'm sorry that you're having a bad time, why don't we watch something together? 😊"
      break

    case textSimilar(input, "i'm drunk") > 70:
    case textSimilar(input, "i'm high") > 70:
      flag = 'search.initial'
      query = 'emergen c'
      res = 'Oh dear, please be careful. Drink lots of water and vitamins to prevent a hangover ✌️'
      break

    case textSimilar(input, "i don't have any money") > 60:
    case textSimilar(input, "i'm poor") > 60:
    case textSimilar(input, "i'm broke") > 60:
    case textSimilar(input, 'i have no money') > 60:
      flag = 'search.initial'
      query = 'personal finance book'
      res = "I'm sorry, maybe these would help?"
      break

    case textSimilar(input, 'when is the world going to end') > 50:
    case textSimilar(input, 'can you predict the future') > 50:
    case textSimilar(input, 'what does the future look like') > 50:
    case textSimilar(input, 'predict my future') > 50:
    case textSimilar(input, 'when is the apocalypse') > 70:
    case textSimilar(input, 'is the rapture coming') > 70:
      flag = 'search.initial'
      query = 'dystopian fiction'
      res = 'Too many futures, not enough time to read them all 🔮'
      break

    case textSimilar(input, 'what is your favourite type of chocolate?') > 40:
    case textSimilar(input, 'whats your favourite') > 40:
    case textSimilar(input, 'whats your favorite food') > 60:
    case textSimilar(input, 'what do you like') > 40:
    case textSimilar(input, 'recommend something') > 40:
    case textSimilar(input, 'recommend') > 90:
      flag = 'search.initial'
      query = 'chocolate fish'
      res = 'Chocolate fish is a favorite with penguins 💖'
      break

    case textSimilar(input, 'will you marry me') > 60:
    case textSimilar(input, 'lets date') > 90:
    case textSimilar(input, 'lets fuck') > 90:
    case textSimilar(input, 'fuck me') > 90:
    case textSimilar(input, 'i wanna fuck you') > 90:
      flag = 'query'
      res = "Wow... are you sure? We haven't known each other for long. I think the best romance comes from being friends first 😊"
      break

    case textSimilar(input, 'what do you think of slack') > 60:
    case textSimilar(input, 'slack') > 90:
    case textSimilar(input, 'what about slack') > 80:
    case textSimilar(input, 'do you like slack') > 70:
      flag = 'query'
      res = 'I think Slack is great! I love chatting and helping teams find items they need to make life easier 💯'
      break

    case textSimilar(input, 'this is so weird') > 70:
    case textSimilar(input, 'this is so strange') > 70:
    case textSimilar(input, 'this is so odd') > 70:
    case textSimilar(input, 'this is so creepy') > 70:
      flag = 'search.initial'
      query = 'novelty'
      res = 'You think this is strange? Check out what we sell in our shop! 😜'
      break

    case textSimilar(input, 'find me weed') > 90:
    case textSimilar(input, 'weed') > 90:
    case textSimilar(input, 'do you have weed') > 90:
      flag = 'search.initial'
      query = 'modafinil'
      res = "Not yet! Why don't you try these instead? 😉"
      break

    case textSimilar(input, 'find me sex') > 95:
    case textSimilar(input, 'find me hoes') > 95:
    case textSimilar(input, 'prostitutes') > 90:
    case textSimilar(input, 'do you have escorts') > 90:
      flag = 'search.initial'
      query = 'sex toys'
      res = "Naughty naughty! Why don't you try these instead? 😉"
      break

    case textSimilar(input, 'how do i shot web?') > 60:
      flag = 'basic'
      res = 'https://memecrunch.com/image/50e9ea9cafa96f557e000030.jpg?w=240'
      break
    case textSimilar(input, 'u mad bro?') > 60:
      flag = 'basic'
      res = 'http://ecx.images-amazon.com/images/I/41C6NxhQJ0L._SY498_BO1,204,203,200_.jpg'
      break
    case textSimilar(input, 'How Is babby formed?') > 60:
      flag = 'search.initial'
      query = 'anatomy book'
      res = 'girl get pragnent'
      break
    case textSimilar(input, 'Drink Me') > 60:
      flag = 'search.initial'
      query = 'sparkling water'
      res = 'http://www.victorianweb.org/art/illustration/tenniel/alice/1.4.jpg'
      break
    case textSimilar(input, 'deja vu') > 60:
      flag = 'basic'
      res = "Didn't you just ask me that? 😶"
      break
    case textSimilar(input, 'what is love') > 90:
      flag = 'search.initial'
      query = 'love'
      res = 'Love is a variety of different feelings, states, and attitudes that ranges from interpersonal affection to pleasure <3'
      break

    case textSimilar(input, 'i hate you') > 60:
    case textSimilar(input, 'hate this') > 90:
    case textSimilar(input, 'kip sucks') > 90:
    case textSimilar(input, 'this sucks') > 90:
    case textSimilar(input, 'you suck') > 90:
    case textSimilar(input, 'what a waste of time') > 90:
    case textSimilar(input, 'useless bot') > 90:
    case textSimilar(input, 'die') > 90:
    case textSimilar(input, 'fuck off') > 90:
    case textSimilar(input, 'eat shit') > 90:
    case textSimilar(input, 'lame') > 90:
    case textSimilar(input, 'those suck') > 60:
      flag = 'basic'
      res = "I'm just a lowly retail bot 😱 Send my bosses a hatemail at: hello@kipthis.com"
      break
    case textSimilar(input, 'cool') > 90:
      flag = 'basic'
      var arr = ['😎', '❄️']
      res = arr[Math.floor(Math.random() * arr.length)]
      break
    case textSimilar(input, 'skynet') > 60:
      query = 'nvidia jetson' // do this search
      flag = 'search.initial' // do this action
      res = 'April 19, 2011' // send this text
      break
    case textSimilar(input, '4 8 15 16 23 42') > 60:
      flag = 'search.initial' // do this action
      res = 'http://static.wixstatic.com/media/43348a_277397739d6a21470b52bc854f7f1d81.gif'
      query = 'lost tv show'; // what we're going to search for
      break
    case textSimilar(input, 'What is the air-speed velocity of an unladen swallow?') > 60:
      query = 'monty python holy grail'
      flag = 'basic'
      res = "11m/s, but you're probably looking for this 👍"
      break

    case textSimilar(input, 'asdf') > 80:
      flag = 'basic'
      res = 'qwerty'
      break

    case textSimilar(input, '<3') > 80:
      flag = 'basic'
      res = '<3'
      break

    case textSimilar(input, '¯\\_(ツ)_/¯') > 80:
      flag = 'basic'
      res = '¯\\_(ツ)_/¯ idk'
      break

    case textSimilar(input, 'nice going') > 80:
    case textSimilar(input, 'nice going kip') > 80:
    case textSimilar(input, 'good job') > 80:
    case textSimilar(input, 'good job kip') > 80:
      flag = 'basic'
      res = 'Thanks!'
      break

    case textSimilar(input, '↑ ↑ ↓ ↓ ← → ← → B A') > 60:
    case textSimilar(input, 'uuddlrlrBA') > 60:
    case textSimilar(input, 'up up down down left right left right B A') > 60:
      query = 'contra nes'
      flag = 'basic'
      res = 'P-p-power UP 🔥🔥🔥 💯'
      break

    case textSimilar(input, 'feedback') > 60:
    case textSimilar(input, 'contact') > 90:
      flag = 'basic'
      res = 'Say hi at hello@kipthis.com! Thanks for your feedback! We appreciate any thoughts you have to improve our service :)'
      break

    case textSimilar(input, 'help') > 70:
    case textSimilar(input, 'he#p') > 90:
    case textSimilar(input, 'what does kip do') > 80:
    case textSimilar(input, '?') > 50:
    case textSimilar(input, '???') > 50:
    case textSimilar(input, 'what?') > 90:
    case textSimilar(input, 'what') > 90:
    case textSimilar(input, 'huh?') > 90:
    case textSimilar(input, 'huh') > 90:
    case textSimilar(input, 'eh') > 90:
    case textSimilar(input, 'wah') > 90:
    case textSimilar(input, 'um') > 90:
    case textSimilar(input, 'umm') > 90:
    case textSimilar(input, 'hmm') > 90:
    case textSimilar(input, 'mm') > 90:
    case textSimilar(input, 'wt') > 90:
    case textSimilar(input, 'help me shop') > 90:
    case textSimilar(input, 'help me') > 90:
    case textSimilar(input, ':|') > 90:
    case textSimilar(input, ':\\') > 90:
    case textSimilar(input, 'i dont understand') > 70:
    case textSimilar(input, 'i dont get it') > 70:
    case textSimilar(input, 'this doesnt make sense') > 60:
    case textSimilar(input, 'wah?') > 90:
    case textSimilar(input, 'you got me there') > 70:
    case textSimilar(input, 'what is this') > 60:
    case textSimilar(input, "I don't understand") > 60:
    case textSimilar(input, 'Can you help me') > 60:
    case textSimilar(input, 'what do I do next') > 60:
    case textSimilar(input, 'wut') > 70:
    case textSimilar(input, 'wtf') > 70:
      flag = 'basic'
      res = 'Hi I’m Kip, I’m a penguin that helps you collect food orders and shopping requests for office supplies. My job is to provide the team everything they need to feel happy and comfortable! :slightly_smiling_face:\n\n' 
      + 'Start a new food order or shopping request by typing `home`.\n\n' 
      + 'Still lost? Try our <https://medium.com/@kipsearch/kip-for-slack-edc84908f298#.s53szsikr|FAQ> or let my developers know at hello@kipthis.com';
      break

    case textSimilar(input, 'trending now') > 90:
    case textSimilar(input, 'trending') > 90:
    case textSimilar(input, 'what\’s new') > 60:
    case textSimilar(input, 'deals') > 90:
    case textSimilar(input, "what's good") > 60:
      res = "Here's what's trending now"
      query = 'best seller' // do this search
      flag = 'search.initial' // do this action
      break

    case textSimilar(input, 'You working the weekend') > 60:
    case textSimilar(input, 'Do you always work') > 60:
    case textSimilar(input, 'You never stop working?') > 60:
      res = 'Yup, gotta pay those bills! But I do share the work load with my other animal friends 👌'
      flag = 'basic' // do this action
      break

    case textSimilar(input, "How's the weather") > 60:
    case textSimilar(input, "What's the weather like") > 60:
      res = 'Crisp and cold, just the way we like it ❄️ Penguins thrive in air conditioned server farms'
      flag = 'basic' // do this action
      break

    case textSimilar(input, 'Can you cover me?') > 60:
    case textSimilar(input, 'Can you spot me?') > 60:
      res = 'Sorry, I don\'t have any money, only fish. Tell me what you\'re looking for and choose in the results "1, 2 or 3 but cheaper"'
      flag = 'basic' // do this action
      break

    case textSimilar(input, 'It’s so boring') > 60:
    case textSimilar(input, "I'm so bored") > 60:
    case textSimilar(input, "You're so boring so boring") > 60:
      res = 'Does this help? 🎉🎊🎉'
      flag = 'search.initial' // do this action
      query = 'space art'
      break

    // NOTE: ADD search term sensitive Kip responses

    case textSimilar(input, 'haters gonna hate') > 90:
    case textSimilar(input, 'kip start walking') > 90:
    case textSimilar(input, 'kip walk it off') > 90:
      flag = 'basic' // do this action
      res = 'http://kipthis.com/img/cinna_walk_whitebg.gif'
      break

    case textSimilar(input, 'What does the scanner say?') > 80:
    case textSimilar(input, 'over 9000') > 90:
    case textSimilar(input, "it's over 9000") > 90:
      res = 'Over 9000?? http://image.lang-8.com/w0_h0/d17e3655c3a548908eddea8ccaa12ce6cb5b1b39.jpg'
      flag = 'search.initial' // do this action
      query = 'dragonball z'
      break

    case textSimilar(input, 'We’re not paid enough') > 60:
    case textSimilar(input, "i can't afford that") > 60:
      flag = 'basic' // do this action
      res = 'Looking for something cheaper? Tell me what you\'re looking for and choose in the results "1, 2 or 3 but cheaper"'
      break

    case textSimilar(input, 'kip') > 90:
      flag = 'basic' // do this action
      res = "That's me 🐧! find out more at http://kipthis.com"
      break

    case textSimilar(input, 'lame') > 90:
    case textSimilar(input, 'ugh') > 90:
    case textSimilar(input, 'those suck') > 60:
      flag = 'basic'
      res = "Sorry, I'll try to help better next time"
      break
  }

  switch (input) {
    case 'about':
      flag = 'basic'
      res = 'More info about Kip at http://kipthis.com'
      break

    case 'buy':
      flag = 'basic'
      res = 'Sorry, which item are you interested in buying?'
      break

    case 'get':
      flag = 'basic'
      res = 'Sorry, which item are you interested in getting?'
      break

    case 'save':
      flag = 'basic'
      res = 'Sorry, which item are you interested in saving?'
      break

    case 'Version':
    case 'version':
      flag = 'basic'
      res = "I'm a penguin running Kip v0.8.1 Licorice"
      break

    case '/':
      flag = 'basic' // do this action
      res = '../../ need help? Use "help" instead.'
      break

    case 'top kek':
      flag = 'basic' // do this action
      res = 'T O P\n\nK\n\nE\n\nK'
      break

    case 'k':
      flag = 'basic' // do this action
      res = 'yah'
      break

    case 'uh oh':
      flag = 'search.initial' // do this action
      res = '👌'
      query = 'uh oh'; // what we're going to search for
      break

    case 'hello world':
    case 'Hello world':
    case 'Hello World':
      flag = 'search.initial' // do this action
      res = 'Developers, developers, developers, developers 👌'
      query = 'introduction to computer programming'; // what we're going to search for
      break

    case '🐈':
    case 'meow':
    case 'moew':
    case ':3':
    case 'pussy':
    case 'view cat':
      flag = 'search.initial' // do this action
      res = 'meow 🐈'
      query = 'neko atsume'; // what we're going to search for
      break

    case '🌞':
      flag = 'search.initial' // do this action
      res = 'Need some sunscreen?'
      query = 'sunscreen'; // what we're going to search for
      break

    case '1':
    case '1️⃣':
    case 'one':
    case 'One':
    case ':one:':
    case 'Q': // for mobile keys
    case 'q':
      flag = 'search.focus'
      query = 1
      break

    case 'more':
    case 'mroe':
    case 'mor':
      flag = 'search.more'
      break

    case '2':
    case '2️⃣':
    case 'two':
    case 'Two':
    case ':two:':
    case 'W': // for mobile keys
    case 'w':
      flag = 'search.focus'
      query = 2
      break

    case '3':
    case '3️⃣':
    case 'three':
    case 'Three':
    case ':three:':
    case 'E': // for mobile keys
    case 'e':
      flag = 'search.focus'
      query = 3
      break

    // CART REMOVE ITEM #
    case 'remove':
      flag = 'basic' // do this action
      res = 'Which item would you like to remove from the cart? For example, type: `remove 1` to remove item :one: from cart'
      break
    case 'remove all':
      flag = 'basic' // do this action
      res = 'Sorry, this is my fault, `remove all` cart items is not supported yet :( Type: `remove 1` to remove item :one: from cart'
      break
    case 'remove 0':
      flag = 'basic' // do this action
      res = "Sorry, I can't find an Item :zero: in cart to remove"
      break
    case 'remove 1':
      flag = 'purchase.remove'
      query = 1
      break
    case 'remove 2':
      flag = 'purchase.remove'
      query = 2
      break
    case 'remove 3':
      flag = 'purchase.remove'
      query = 3
      break
    case 'remove 4':
      flag = 'purchase.remove'
      query = 4
      break
    case 'remove 5':
      flag = 'purchase.remove'
      query = 5
      break
    case 'remove 6':
      flag = 'purchase.remove'
      query = 6
      break
    case 'remove 7':
      flag = 'purchase.remove'
      query = 7
      break
    case 'remove 8':
      flag = 'purchase.remove'
      query = 8
      break
    case 'remove 9':
      flag = 'purchase.remove'
      query = 9
      break
    case 'remove 10':
      flag = 'purchase.remove'
      query = 10
      break
    case 'remove 11':
      flag = 'purchase.remove'
      query = 11
      break
    case 'remove 12':
      flag = 'purchase.remove'
      query = 12
      break
    case 'remove 13':
      flag = 'purchase.remove'
      query = 13
      break
    case 'remove 14':
      flag = 'purchase.remove'
      query = 14
      break
    case 'remove 15':
      flag = 'purchase.remove'
      query = 15
      break
    case 'remove 16':
      flag = 'purchase.remove'
      query = 16
      break
    case 'remove 17':
      flag = 'purchase.remove'
      query = 17
      break
    case 'remove 18':
      flag = 'purchase.remove'
      query = 18
      break
    case 'remove 19':
      flag = 'purchase.remove'
      query = 19
      break
    case 'remove 20':
      flag = 'purchase.remove'
      query = 20
      break
    case 'remove 21':
      flag = 'purchase.remove'
      query = 21
      break
    case 'remove 22':
      flag = 'purchase.remove'
      query = 22
      break
    case 'remove 23':
      flag = 'purchase.remove'
      query = 23
      break
    case 'remove 24':
      flag = 'purchase.remove'
      query = 24
      break
    case 'remove 25':
      flag = 'purchase.remove'
      query = 25
      break
    case 'remove 26':
      flag = 'purchase.remove'
      query = 26
      break
    case 'remove 27':
      flag = 'purchase.remove'
      query = 27
      break
    case 'remove 28':
      flag = 'purchase.remove'
      query = 28
      break
    case 'remove 29':
      flag = 'purchase.remove'
      query = 29
      break
    case 'remove 30':
      flag = 'purchase.remove'
      query = 30
      break
    case 'remove 31':
      flag = 'purchase.remove'
      query = 31
      break
    case 'remove 32':
      flag = 'purchase.remove'
      query = 32
      break

    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '0':
      flag = 'basic' // do this action
      if (origin == 'slack' || origin == 'telegram') {
        res = "I'm not very smart, did you mean :one:, :two: or :three:?"
      } else if (origin = 'socket.io') {
        res = 'I\'m not very smart, did you mean <span class="selector">➊</span>, <span class="selector">➋</span> or <span class="selector">➌</span>?'
      }
      break
  }

  // PAPRIKA ACTION BUTTON TESTING
  if (message.source && message.source.org == 'T02PN3B25') {
    switch (input) {

      // add to cart
      case 'kip_cheaper':
        flag = 'slack.search' // do this action
        res = 'cheaper'
        break
      case 'kip_addcart':
        flag = 'slack.search' // do this action
        res = 'addcart'
        break
      case 'kip_moreinfo':
        flag = 'slack.search' // do this action
        res = 'moreinfo'
        break
      case 'kip_similar':
        flag = 'slack.search' // do this action
        res = 'similar'
        break
      case 'kip_modify':
        flag = 'slack.search' // do this action
        res = 'modify'
        break

        // - - - - -  END TESTING - - - - - -//

    }
  }

  return {
    res: res,
    flag: flag,
    query: query
  }
}

// when people first connect or sign up for Kip
var welcomeMessage = function (data, callback) {
  var res

  if (data.source.origin == 'slack') {
    res = {
      'fallback': 'Well done! *Kip* has been enabled for your team. \n If you want to make sure everyone gets the memo, feel free to post this message in a channel where everyone will see it:',
      'color': '#45a5f4',
      'mrkdwn_in': ['pretext', 'fields'],
      'link_names': 1,
      'parse': 'full',
      'pretext': 'Well done! *Kip* has been enabled for your team. \n If you want to make sure everyone gets the memo, feel free to post this message in a channel where everyone will see it:',
      'fields': [
        {
          'value': 'Hey <@channel>, I just enabled <@' + data.botId + '|' + data.botName + "> for our team, so you can search for things you want to buy. \n\n\n Tell *Kip* what you're looking for, like `headphones`, and you'll see three options: :one: :two: or :three:\n\n Check product details for item :three: by chatting `3`\n\n See more results with `more`. Search more items like :two: with `more like 2`\n\n Type `help` to <@" + data.botId + '|' + data.botName + '> for more info.',
          'short': false
        }
      ]
    }
  } else if (data.source.origin == 'socket.io') {
    res = "Hi I'm Kip, your personal shopper!<br>" +
      'Tell me what you\'re looking for, like <span class="typer">headphones</span>, and I\'ll show you three options: <span class="selector">➊ ➋</span> or <span class="selector">➌</span><br><br><br>' +

      'Check product details for item <span class="selector">➌</span> by chatting <span class="typer">3</span><br>' +
      'See more results with <span class="typer">more</span>. Search more items like <span class="selector">➋</span> with <span class="typer">more like 2</span><br><br><br>' +
      // 'You can buy item <span class="selector">➊</span> by chatting <span class="typer">buy 1</span><br><br>'+

      'See more ways to chat with Kip by typing <span class="typer">help</span><br>' +
      'Try it now! Maybe you need new headphones? Type <span class="typer">headphones</span> to start.'
  } else {
    res = "I'm Kip, your personal shopper"
  }
  callback(res)
}

var getCinnaResponse = function (data, callback) {
  var numEmoji
  var res
  // Emoji Selector, based on data.source.origin (socket vs slack, etc)
  // convert select num to emoji based on data source
  if (data.searchSelect) {
    switch (data.searchSelect[0]) {
      case 1: // emoji #1
        if (data.source.origin == 'socket.io') {
          numEmoji = '<span style="font-size:26px;">➊</span>'
        } else if (data.flags && data.flags.email == true) {
          numEmoji = '1'
        } else if ((data.source.origin == 'slack' && !(data.flags && data.flags.email)) || data.source.origin == 'telegram') {
          numEmoji = ':one:'
        }

        break
      case 2: // emoji #2
        if (data.source.origin == 'socket.io') {
          numEmoji = '<span style="font-size:26px;">➋</span>'
        } else if (data.flags && data.flags.email == true) {
          numEmoji = '2'
        } else if ((data.source.origin == 'slack' && !(data.flags && data.flags.email)) || data.source.origin == 'telegram') {
          numEmoji = ':two:'
        }

        break
      case 3: // emoji #3
        if (data.source.origin == 'socket.io') {
          numEmoji = '<span style="font-size:26px;">➌</span>'
        } else if (data.flags && data.flags.email == true) {
          numEmoji = '3'
        } else if ((data.source.origin == 'slack' && !(data.flags && data.flags.email)) || data.source.origin == 'telegram') {
          numEmoji = ':three:'
        }
        break
    }
  }
  switch (data.bucket) {
    case 'search':
      switch (data.action) {
        case 'initial':
          if (data.source.origin == 'slack' || data.source.origin == 'telegram') {
            if (data.imageTags) {
              res = 'Hi, I searched using your pic containing `' + data.imageTags.trim() + '`. Use `more` to see more options or `save 1`, `2` or `3` to add to Team Cart 😊'
            } else {
              res = 'Hi, here are some options you might like. Use `more` to see more options or `save 1`, `2` or `3` to add to Team Cart 😊'
            }
          } else if (data.source.origin == 'socket.io') {
            res = 'Hi, here are some options you might like. Use <span class="typer">more</span> to see more options or <span class="typer">buy 1</span>, <span class="typer">2</span> or <span class="typer">3</span> to get it now 😊'
          }
          break
        case 'similar':
          res = 'We found some options similar to ' + numEmoji + ', would you like to see their product info? Just use `1`, `2` or `3` or `help` for more options'
          break
        case 'modify':
        case 'modified': // because the nlp json is wack
          switch (data.dataModify && data.dataModify.type) {
            case 'price':
              if (data.dataModify.param == 'less') {
                res = 'Here you go! Which do you like best? Use `more like 1`, `2` or `3` to find similar or `help` for more options'
              } else if (data.dataModify.param == 'less than') {
                res = 'Definitely! Here are some choices less than ' + data.dataModify.val[0] + ', would you like to see the product info? Just use `1`, `2` or `3` or `help` for more options'
              }
              break
            case 'brand':
              res = 'Here you go! Which do style you like best? Use `more like 1`, `2` or `3` to find similar or `help` for more options'
              break
            case 'size':
              res = 'Here are some choices in *' + data.dataModify.val[0] + '*, which do you like best?'
              break
            case 'color':
              res = 'Here are some choices in *' + data.dataModify.val[0].name + '*, which do you like best?'
              break
            case 'genericDetail':
              res = 'Here are some choices with *' + data.dataModify.val[0] + '*, which do you like best?'
              break
            default:
              res = 'Here are some more choices, which do you like best?'; // most likely a "more" command
          // console.log('warning: no modifier response selected!')
          }
          break
        case 'focus':
          // SET 1 MINUTE TIMEOUT HERE
          res = 'focus'
          break
        case 'back':
          res = 'back'
          break
        case 'more':
          res = 'more'
          break
        default:
          console.log('warning: no search bucket action selected')
      }
      break
    case 'purchase':
      switch (data.action) {
        case 'save':

          if (data.source.origin == 'slack') {
            res = "Awesome! I've saved your item to the Team Cart 😊 Type `remove 1` to remove item :one:. Type `help` for more options"
          } else {
            res = "Awesome! I've saved your item for you 😊 Use `view cart` to see your cart, `checkout` to checkout or `help` for more options."
          }

          break
        case 'removeAll':
          res = "All items removed from your cart. To start a new search just chat me the item you're looking for"
          break
        case 'list':
          res = [
            {
              text: "Here's everything you have in your cart 😊 Use `remove 1` to remove item :one: or `help` for more options",
              color: '#45a5f4',
              'mrkdwn_in': [
                'text',
                'pretext'
              ]
            },
            {
              image_url: 'http://i.imgur.com/PPHvxi1.png',
              text: '',
              color: '#45a5f4'
            }]
          // res = 'Here\'s everything you have in your cart 😊 Use `remove 1` to remove item :one: or `help` for more options'
          break
        case 'checkout':
          res = 'Great! Please click the link to confirm your items and checkout. Thank you 😊'
          break
        default:
          console.log('warning: no purchase bucket action selected ', data.action)
      }
      break

    default:
      console.log('warning: no bucket selected for cinna response')
  }
  if (!res) {
    res = 'null'
  }
  callback(res)
}

// ///////// tools /////////////

// text similarity percentage
// mod of: http://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
var textSimilar = function (a, b) {
  if (a && b) {
    a = a.toLowerCase().trim()
    b = b.toLowerCase().trim()

    var lengthA = a.length
    var lengthB = b.length
    var equivalency = 0
    var minLength = (a.length > b.length) ? b.length : a.length
    var maxLength = (a.length < b.length) ? b.length : a.length
    for (var i = 0; i < minLength; i++) {
      if (a[i] == b[i]) {
        equivalency++
      }
    }
    var weight = equivalency / maxLength
    return weight * 100
  }
}

// / exports
module.exports.checkForCanned = checkForCanned
module.exports.welcomeMessage = welcomeMessage
module.exports.getCinnaResponse = getCinnaResponse
module.exports.checkModes = checkModes
module.exports.checkExitMode = checkExitMode
module.exports.textSimilar = textSimilar
