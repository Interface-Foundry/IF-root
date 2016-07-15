import logging
import subprocess
from easydict import EasyDict

from word_list import action_terms, price_terms, stopwords, \
    invalid_adjectives, purchase_terms

DEBUG_ = False
logger = logging.getLogger()


def syntaxnet_array(text):
    '''
    pass text argument to syntaxnet, get dependency tree, must have
    '''
    # demo.sh for testing, parser.sh irl
    if DEBUG_:
        script_location = 'syntaxnet/demo.sh'
    else:
        script_location = './parser.sh'
    t = 'echo "' + text + '" | ' + script_location
    p = subprocess.Popen(t, stdout=subprocess.PIPE, shell=True)
    out = p.stdout.read().splitlines()
    # last item in array is ' ' for some reason
    try:
        out.pop()
    except IndexError:
        print('Not Parsed correctly')
        return None

    return out


def syntax_no_script(text):
    '''
    TODO:
        - implement syntaxnet_array without piping from .sh
    '''
    pass


class McParser:
    '''
    # Properties
        - text
        - terms

    # Methods
        - process_text
        - find_search_terms
    '''

    def __init__(self, text):
        '''
        # self.terms = EasyDict({'item_descriptors': [], 'had_find': False})
        '''

        self.had_about = False
        self.had_find = False
        self.had_more = False
        self.had_question = False
        self.sf_sm = False

        self.text = text.lower()
        # self.tokens = [self.text.split(' ')]
        self.tokens = []
        self.focus = []
        self.nouns = []
        self.verbs = []
        self.adjectives = []
        self.noun_phrases = []
        self.parts_of_speech = []
        self.item_descriptors = []
        self.entities = []
        self.d = {}

        self._process_text()
        self._parse_terms()
        self._get_modifier_terms()
        self._remove_words()
        self._get_action_mode()
        self._checks()
        self._price_modifier()
        self._simple_case()

    def _process_text(self):
        '''
        takes base text, pass into syntaxnet_array, put into array form, and
        parse the terms into accessible object
        '''
        self.d_array = syntaxnet_array(self.text)
        self.dependency_array = []
        for line in self.d_array:
            self.dependency_array.append(line.split('\t'))
        self.dependency_array.sort(key=lambda x: x[6])

    def _parse_terms(self):
        '''
        not sure if i should use unicode(i[1]) or u"{}",format(i[1])" so using
        cur_word
        '''
        for i in self.dependency_array:
            cur_word = unicode(i[1])
            self.tokens.append(cur_word)
            self.parts_of_speech.append([cur_word, unicode(i[3])])
            if i[3] in ['NOUN', 'PRON']:
                self.nouns.append(cur_word)
            if i[3] in ['VERB']:
                self.verbs.append(cur_word)
            if i[3] in ['ADJ']:
                self.adjectives.append(cur_word)

            # could potentially move these within nouns/verbs/etc stuff
            if i[7] in ['ROOT']:
                self.root = cur_word
                self.search_object = cur_word
            if i[7] in ['dobj']:
                self.dobj = cur_word
                self.search_object = cur_word
                self.noun_phrases = [self.root + ' ' + cur_word]
            if i[7] in ['dep']:
                self.item_descriptors.append(cur_word)
            if i[7] in ['amod']:
                self.had_qualitative = cur_word

            # focus thing
            if cur_word.lower() in ['one', '1', 'first']:
                self.focus.append(1)
            if cur_word.lower() in ['two', '2', 'second']:
                self.focus.append(2)
            if cur_word.lower() in ['three', '3', 'third']:
                self.focus.append(3)

            self.action = self._get_action(cur_word)
            self.mode = self._get_mode(cur_word)

    def _get_modifier_terms(self):
        self.modifier_words = list(set(self.nouns).union(self.adjectives))

    def _remove_words(self):
        '''
        removes:
            nouns without stopwords
            adjectives without invalid adjectives
        '''
        adj_set = set(self.adjectives)
        nouns_set = set(self.nouns)

        self.adjectives = list(adj_set.difference(invalid_adjectives))
        self.invalid_adj = list(adj_set.intersection(invalid_adjectives))
        self.nouns_without_stopwords = list(nouns_set.difference(stopwords))

    def _checks(self):
        '''check for all the words previously searched for in api.js

        old but previously removed 'find'
        text.lower().replace('find', '')
        '''

        if 'about' in self.text:
            self.had_about = True

        if 'find' in self.text:
            self.had_find = True

        if 'more' in self.text:
            self.had_more = True

        if '?' in self.text:
            self.had_question = True

    def _get_action(w):
        if w in action_terms['checkout']:
            return 'checkout'
        elif w in action_terms['remove']:
            return 'remove'
        elif w in action_terms['list_cart']:
            return 'list'
        elif w in action_terms['save']:
            return 'save'
        elif w in action_terms['focus']:
            return 'focus'
        elif w in action_terms['search']:
            return 'search'
        else:
            return 'initial'

    def _get_mode(w):
        if w in purchase_terms:
            return 'cart'
        elif w in action_terms['focus']:
            return 'focus'

    def _get_action_mode(self):
        # if any(map(
        #         lambda each: each in action_terms['checkout'], self.tokens)):
        #     self.action = 'checkout'
        # if any(map(lambda each: each in action_terms['remove'],self.tokens)):
        #     self.action = 'remove'
        # if any(map(
        #         lambda each: each in action_terms['list_cart'],self.tokens)):
        #     self.action = 'list'
        # if any(map(lambda each: each in action_terms['save'], self.tokens)):
        #     self.action = 'save'
        # if any(map(lambda each: each in action_terms['focus'], self.tokens)):
        #     self.action = 'focus'
        # if any(map(lambda each: each in action_terms['search'],self.tokens)):
        #     self.action = 'checkout'
        # not sure if to use self.tokens or self.verbs, using tokens for now
        # if set(self.tokens).intersection(purchase_terms):
        #     self.mode = 'cart'
        # if set(self.tokens).intersection(action_terms['focus']):
        #     self.mode = 'focus'

        if hasattr(self, 'modifier_words'):
            self.mode = 'shopping'
            if (len(self.focus) == 1) and (len(self.modifier_words) == 1):
                # single focus single modifier
                self.sf_sm = True
                self.action = 'modify.one'
            else:
                self.action = 'modify.all'

        if self.had_about:
            self.mode = 'shopping'
            self.action = 'focus'

        if self.had_more:
            self.mode = 'shopping'
            self.action = 'similar'

    def _price_modifier(self):
        '''check if price is to be modified'''
        if any(w in self.tokens for w in price_terms['more']):
            self.price_modifier = 'more'
            self.action = 'modify.one'
            self.mode = 'focus'
            logger.info('modifying price of one with more')

        elif any(w in self.tokens for w in price_terms['less']):
            self.price_modifier = 'less'
            self.action = 'modify.one'
            self.mode = 'focus'
            logger.info('modifying price of one with less')

    def _simple_case(self):
        '''possibly self.nouns_without_stopwords.join(' ') but that
        doesnt include adjectives
        '''
        if not self.had_question and not self.focus:
            self.simple_case = True
            self.simple_query = self.text
            self.mode = 'shopping'
            self.action = 'initial'
            logger.info('simple case using query: ' + self.simple_query)
        else:
            self.simple_case = False
            logger.info('not using a simple query')



    def output_form(self):
        '''
        Put into correct json format for api.js
        note: probably a better way to do this with obj.__dict__
        '''
        response = EasyDict()
        response.text = self.text

        # probably need to fix response.nouns
        # most likely want (set(noun_phrases) - nouns) - adjectives)
        response.nouns = list(self.noun_phrases +[' '.join(self.adjectives + self.nouns)])
        response.nouns_without_stopwords = self.nouns_without_stopwords
        response.verbs = self.verbs
        response.adjectives = self.adjectives
        response.entities = self.entities
        response.parts_of_speech = self.parts_of_speech
        response.modifier_words = self.modifier_words

        response.mode = self.mode
        response.action = self.action
        response.focus = self.focus

        response.had_about = self.had_about
        response.had_more = self.had_more
        response.had_question = self.had_question

        if hasattr(self, 'price_modifier'):
            response.price_modifier = self.price_modifier

        if hasattr(self, 'simple_query'):
            response.simple_query = self.simple_query
            response.simple_case = self.simple_case

        # add ss
        ss = {}
        ss['focus'] = self.focus
        ss['noun_phrases'] = self.noun_phrases
        ss['parts_of_speech'] = self.parts_of_speech
        ss['sentiment_polarity'] = 0.0
        ss['sentiment_subjectivity'] = 0.0
        response.ss = [ss]

        return response

    # def _create_execute(self):
    #     e = {}
    #     if self.had_about:
    #         e['mode'] = 'shopping'
    #         e['action'] = 'focus'
    #         e['params'] = 'params'
    #     if self.had_find:
    #         e['mode'] = 'shopping'
    #         e['action'] = 'focus'
    #         e['params'] = 'params'
