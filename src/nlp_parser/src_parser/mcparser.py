import logging
import subprocess
import requests

from word_list import action_terms, price_terms, stopwords, \
    invalid_adjectives, purchase_terms, periodical_terms

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

    # fix byte input from shell stuff
    new_out = []
    for row in out:
        new_out.append(row.decode('utf'))

    return new_out


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
        self._checks()
        self._remove_words()
        self._get_action_and_mode()
        self._get_last_check()
        self._not_actually_focus()
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

        # d2 = self.dependency_array
        # dont sort into tree struct
        # self.dependency_array.sort(key=lambda x: x[6])

    def _parse_terms(self):
        '''
        '''
        d_index = 0
        for i in self.dependency_array:
            cur_word = i[1]
            self.tokens.append(cur_word)
            self.parts_of_speech.append([cur_word, i[3]])
            if i[3] in ['NOUN', 'PRON']:
                self.nouns.append(cur_word)

            if i[3] in ['NOUN']:
                if not hasattr(self, 'first_noun'):
                    self.first_noun = d_index
                self.last_noun = d_index

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
            if i[7] in ['pobj']:
                self.pobj = cur_word
                self.search_object = cur_word
            if i[7] in ['dep']:
                self.item_descriptors.append(cur_word)
            if i[7] in ['amod']:
                self.had_qualitative = cur_word

            # focus thing
            if cur_word.lower() in ['one', '1', 'first']:
                self.focus.append('1')
            if cur_word.lower() in ['two', '2', 'second']:
                self.focus.append('2')
            if cur_word.lower() in ['three', '3', 'third']:
                self.focus.append('3')

            d_index += 1

        if hasattr(self, 'first_noun'):
            if self.first_noun is not self.last_noun:
                self.noun_query = ' '.join(self.tokens[self.first_noun:self.last_noun + 1])
        self.modifier_words = list(set(self.nouns).union(self.adjectives))
        self.nouns_with_adjectives = ' '.join(self.modifier_words)

    # def _create

    def _not_actually_focus(self):
        if any(map(lambda each: each in periodical_terms, self.tokens)):
            self.focus = []

    def _call_rnn(self):
        '''
        get preds from rnn
        '''
        res = requests.post('http://rnn:8085/predict', json={'text': 'red shoes'})
        return res

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
        if 'about' in self.tokens:
            self.had_about = True
        if 'find' in self.tokens:
            self.had_find = True
        if 'more' in self.tokens:
            self.had_more = True
        if '?' in self.tokens:
            self.had_question = True

    def _get_action_and_mode(self):
        if any(map(
                lambda each: each in action_terms['checkout'], self.tokens)):
            self.action = 'checkout'

        elif any(map(
                lambda each: each in action_terms['remove'], self.tokens)):
            self.action = 'remove'

        elif any(map(
                lambda each: each in action_terms['list_cart'], self.tokens)):
            self.action = 'list'

        elif any(map(lambda each: each in action_terms['save'], self.tokens)):
            self.action = 'save'

        elif any(map(lambda each: each in action_terms['focus'], self.tokens)):
            self.action = 'focus'

        elif any(map(
                lambda each: each in action_terms['search'], self.tokens)):
            self.action = 'search'
        else:
            self.action = 'initial'

        # for triggering verbs thing
        if self.action in action_terms.keys():
            self.action_verb = True
        else:
            self.action_verb = False

        # trigger single focus single modify
        if (len(self.focus) == 1) and (len(self.modifier_words) == 1) and (self.action not in action_terms.keys()):
            self.action = 'modify.one'
            self.single_focus_single_modify = True

            if any(w in self.tokens for w in price_terms['more']):
                self.price_modifier = 'more'
                logger.info('modifying price of one with more')

            elif any(w in self.tokens for w in price_terms['less']):
                self.price_modifier = 'less'
                logger.info('modifying price of one with less')

        elif len(self.modifier_words) > 1:
            self.action = 'modify.all'

        if any(map(lambda each: each in purchase_terms, self.tokens)):
            self.mode = 'cart'
        else:
            self.mode = 'shopping'

    def _get_last_check(self):
        if self.had_about:
            self.mode = 'shopping'
            self.action = 'focus'

        if self.had_more:
            self.mode = 'shopping'
            self.action = 'similar'

    def _create_search(self):
        '''
        '''
        if hasattr(self, 'noun_query'):
            self.search_query = self.noun_query
        elif hasattr(self, 'pobj'):
            self.search_query = self.pobj
        elif len(self.tokens) < 3:
            self.search_query = ' '.join(self.tokens)
        elif hasattr(self, 'nouns_with_adjectives'):
            self.search_query = self.nouns_with_adjectives
        else:
            logger.info('using full query')
            self.search_query = self.text

    def _simple_case(self):
        '''v1 rule based simple_case
        '''
        if not self.had_question and not self.focus:
            self.simple_case = True
            self.mode = 'shopping'
            self.action = 'initial'
            self._create_search()
            if type(self.search_query) is not str:
                # coerce query into str
                logger.critical('query isnt a string for some reason')
                try:
                    logger.debug(str(self.search_query))
                except:
                    logger.critical('_something_wrong_trying_to_strng_')
            logger.info('simple case using query: ' + self.search_query)

        else:
            self.simple_case = False
            logger.info('not using a simple query')

    def output_form(self):
        return self.__dict__
