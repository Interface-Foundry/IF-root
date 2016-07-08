import logging
import subprocess
from easydict import EasyDict

from word_list import action_terms, price_terms, stopwords, invalid_adjectives

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
        - array_form
        - find_search_terms
    '''

    def __init__(self, text):
        '''
        # self.terms = EasyDict({'item_descriptors': [], 'had_find': False})
        '''
        self.text = text.lower()
        self.tokens = self.text.split(' ')
        self.focus = []
        self.nouns = []
        self.verbs = []
        self.adjectives = []
        self.noun_phrases = []
        self.parts_of_speech = []
        self.item_descriptors = []
        self.entities = []

        self._process_text()
        self._array_form()
        self._parse_terms()
        self._remove_words()
        self._get_action()
        self._checks()

    def _process_text(self):
        '''
        takes base text, pass into syntaxnet_array, put into array form, and
        parse the terms into accessible object
        '''
        self.d_array = syntaxnet_array(self.text)

    def _array_form(self):
        '''
        '''
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

    def _remove_words(self):
        '''
        removes:
            nouns without stopwords
            adjectives without invalid adjectives
        '''
        self.adjectives = list(
            set(self.adjectives).difference([invalid_adjectives]))

        self.nouns_without_stopwords = list(
            set(self.nouns).difference(stopwords))

    def _checks(self):
        '''check for all the words previously searched for in api.js

        old but previously removed 'find'
        text.lower().replace('find', '')
        '''
        self.had_about = False
        self.had_find = False
        self.had_more = False
        self.had_question = False

        if 'about' in self.text:
            self.had_about = True
        if 'find' in self.text:
            self.had_find = True
        if 'more' in self.text:
            self.had_more = True
        if '?' in self.text:
            self.had_question = True

    def _get_action(self):
        if any(map(
                lambda each: each in action_terms['checkout'], self.tokens)):
            self.action = 'checkout'
        if any(map(
                lambda each: each in action_terms['remove'], self.tokens)):
            self.action = 'remove'
        if any(map(
                lambda each: each in action_terms['list_cart'], self.tokens)):
            self.action = 'list'
        if any(map(
                lambda each: each in action_terms['save'], self.tokens)):
            self.action = 'save'
        if any(map(
                lambda each: each in action_terms['focus'], self.tokens)):
            self.action = 'focus'
        if any(map(
                lambda each: each in action_terms['search'], self.tokens)):
            self.action = 'checkout'

    def _simple_case(self):
        pass

    def _price_modifier(self):
        '''check if price is to be modified'''
        if any(w in self.text for w in price_terms['more']):
            self.data_modify = 'more'
        if any(w in self.text for w in price_terms['less']):
            self.data_modify = 'less'

    def create_execute(self):
        e = {}
        if self.had_about:
            e['mode'] = 'shopping'
            e['action'] = 'focus'
            e['params'] = 'params'
        if self.had_find:
            e['mode'] = 'shopping'
            e['action'] = 'focus'
            e['params'] = 'params'


    def output_form(self):
        '''
        Put into correct json format for api.js
        '''
        response = EasyDict()
        response.nouns = self.noun_phrases + \
            [' '.join(self.adjectives + self.nouns)]
        response.adjectives = self.adjectives
        response.entities = self.entities
        response.focus = self.focus
        response.parts_of_speech = self.parts_of_speech
        response.text = self.text.lower()
        response.verbs = self.verbs
        # add ss
        ss = {}
        ss['focus'] = self.focus
        ss['has_question'] = self.has_question
        ss['noun_phrases'] = self.noun_phrases
        ss['parts_of_speech'] = self.parts_of_speech
        ss['sentiment_polarity'] = 0.0
        ss['sentiment_subjectivity'] = 0.0
        response.ss = [ss]

        return response
