import logging
import subprocess
import sys

from googleapiclient import discovery
import httplib2
from oauth2client.client import GoogleCredentials

from word_list import action_terms, price_terms, stopwords, \
    invalid_adjectives, purchase_terms, periodical_terms

DEBUG_ = False
logger = logging.getLogger()


def get_service():
    credentials = GoogleCredentials.get_application_default()
    scoped_credentials = credentials.create_scoped(
        ['https://www.googleapis.com/auth/cloud-platform'])
    http = httplib2.Http()
    scoped_credentials.authorize(http)
    return discovery.build('language', 'v1beta1', http=http)


def get_native_encoding_type():
    """Returns the encoding type that matches Python's native strings."""
    if sys.maxunicode == 65535:
        return 'UTF16'
    else:
        return 'UTF32'


def analyze_syntax(text, encoding='UTF32'):
    body = {
        'document': {
            'type': 'PLAIN_TEXT',
            'content': text,
        },
        'features': {
            'extract_syntax': True,
        },
        'encodingType': encoding,
    }

    service = get_service()

    request = service.documents().annotateText(body=body)
    response = request.execute()

    return response


def convert_api_to_dependency_array(resp):
    dependency_array = []
    tokens = resp['tokens']
    for i, toke in enumerate(tokens):
        word_array = []
        word_array.append(str(i))
        word_array.append(toke['text']['content'])
        word_array.append('_')
        word_array.append(toke['partOfSpeech']['tag'])
        word_array.append('Penn_POS_Not_Provided')
        word_array.append('_')
        word_array.append(toke['dependencyEdge']['headTokenIndex'])
        word_array.append(str(toke['dependencyEdge']['label']))
        word_array.append('_')
        word_array.append('_')
        dependency_array.append(word_array)
    return dependency_array


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
    t = t.encode('ascii', 'ignore')
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


def syntaxnet_gcloud(text):
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

    def __init__(self, text, local_or_gcloud='gcloud'):
        '''
        # self.terms = EasyDict({'item_descriptors': [], 'had_find': False})
        '''

        self.had_about = False
        self.had_find = False
        self.had_more = False
        self.had_question = False
        self.single_focus_single_modify = False
        self.local_or_gcloud = local_or_gcloud

        self.text = text.lower()
        self.tokens = []
        self.focus = []
        self.nouns = []
        self.verbs = []
        self.adjectives = []
        self.noun_phrases = []
        self.modifier_words = []
        self.parts_of_speech = []
        self.modifier_words = []
        self.item_descriptors = []
        self.entities = []
        self.d = {}

        self._process_text()
        self._parse_terms()
        # ----------------
        self._create_noun_query()
        self._create_modifier_words()
        self._create_nouns_without_stopwords()
        self._create_checks()
        # ----------------
        self._get_action_and_mode()
        self._get_last_check()
        self._focus_edgecase()
        self._simple_case()

    def _process_text(self):
        '''
        takes base text, pass into syntaxnet_array, put into array form, and
        parse the terms into accessible object
        '''
        self.text = self.text.replace(':', '')
        self.dependency_array = []
        if self.local_or_gcloud == 'local':
            logging.info('using local syntaxnet')
            self.pos_response = syntaxnet_array(self.text)
            for line in self.pos_response:
                self.dependency_array.append(line.split('\t'))
        elif self.local_or_gcloud == 'gcloud':
            logging.info('using gcloud syntaxnet')
            self.pos_response = analyze_syntax(
                self.text, get_native_encoding_type())
            self.language = self.pos_response['language']
            self.entities = self.pos_response['entities']
            self.dependency_array = convert_api_to_dependency_array(
                self.pos_response)

        # self.sorted_array = self.dependency_array.copy()
        # self.sorted_array.sort(key=lambda x: x[6])

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

    def _create_noun_query(self):
        if hasattr(self, 'first_noun'):
            if self.first_noun is not self.last_noun:
                self.noun_query = ' '.join(
                    self.tokens[self.first_noun:self.last_noun + 1])

    def _create_modifier_words(self):
        modifier_split = set(['but', 'except']).intersection(self.tokens)
        if self.adjectives:
            self.modifier_words = self.adjectives + self.nouns
        elif modifier_split:
            split_word = list(modifier_split)[0]
            self.modifier_words = self.tokens[
                self.tokens.index(split_word) + 1:]

    def _create_nouns_without_stopwords(self):
        '''
        removes:
            nouns without stopwords
            adjectives without invalid adjectives
        '''
        adj_set = set(self.adjectives)
        nouns_set = set(self.nouns)
        self.nouns_with_adjectives = ' '.join(self.modifier_words)
        self.adjectives = list(adj_set.difference(invalid_adjectives))
        self.invalid_adj = list(adj_set.intersection(invalid_adjectives))
        self.nouns_without_stopwords = list(nouns_set.difference(stopwords))

    def _focus_edgecase(self):
        if any(map(lambda each: each in periodical_terms, self.tokens)):
            self.focus = []

    def _create_checks(self):
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
        if (len(self.focus) == 1) and (len(self.modifier_words) >= 1) and (self.action not in action_terms.keys()):
            self.action = 'modify.one'
            self.single_focus_single_modify = True

            if any(w in self.tokens for w in price_terms['more']):
                self.price_modifier = 'more'
                logger.info('modifying price of one with more')

            elif any(w in self.tokens for w in price_terms['less']):
                self.price_modifier = 'less'
                logger.info('modifying price of one with less')

        elif len(self.focus) > 1:
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
