import json
import logging
import subprocess
from easydict import EasyDict

logger = logging.getLogger()


# True uses their parser script, ruins root and stuff
DEBUG_ = False


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
        self.text = text
        self.focus = []
        self.nouns = []
        self.verbs = []
        self.adjectives = []
        self.parts_of_speech = []
        self.item_descriptors = []
        self.entities = []
        self.had_find = False
        self.isQuestion = False
        self.process_text()

    def process_text(self):
        '''
        takes base text, pass into syntaxnet_array, put into array form, and
        parse the terms into accessible object

        Notes:
            find ruins 'root' parser, possibly remove
        '''
        #
        if 'find' in self.text.lower():
            self.terms['had_find'] = True
            # self.text = self.text.lower().replace('find', '')
        self.d_array = syntaxnet_array(self.text)
        self.array_form()
        self.parse_terms()

    def array_form(self):
        '''
        '''
        self.dependency_array = []
        for line in self.d_array:
            self.dependency_array.append(line.split('\t'))
        self.dependency_array.sort(key=lambda x: x[6])

    def parse_terms(self):
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
            if i[7] in ['dep']:
                self.item_descriptors.append(cur_word)

            # store punctuation
            if i[7] in ['punct']:
                if cur_word in ['?']:
                    self.isQuestion = True

            # focus thing
            if cur_word.lower() in ['one', '1', 'first']:
                self.focus.append(1)
            if cur_word.lower() in ['two', '2', 'second']:
                self.focus.append(2)
            if cur_word.lower() in ['three', '3', 'third']:
                self.focus.append(3)

    def output_form(self):
        '''
        Put into correct json format for api.js:
        {
        'adjectives': [u'darker'],
        'entities': [[u'first', u'ORDINAL']],
        'focus': [1],
        'nouns': [],
        'parts_of_speech': [[u'first', u'ADV'],[u'but', u'CONJ'],...],
        'ss': [{'focus': [1],'isQuestion': False,'noun_phrases': [],
        'parts_of_speech': [[u'first', u'ADV'],[u'but', u'CONJ'],[u'darker', u'ADJ']],'sentiment_polarity': 0.25,'sentiment_subjectivity': 0.3333333333333333}],
        'text': 'first but darker',
        'verbs': []}
        '''
        response = EasyDict()
        response.adjectives = self.adjectives
        response.entities = self.entities
        response.focus = self.focus
        response.nouns = self.nouns
        response.parts_of_speech = self.parts_of_speech
        response.text = self.text.lower()
        response.verbs = self.verbs
        return response

    def to_JSON(self):
        '''
        possibly easier than output_form, but 100 micro seconds slower
        '''
        return json.dumps(self,
                          default=lambda o: o.__dict__,
                          sort_keys=True)
