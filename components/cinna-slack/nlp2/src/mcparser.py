import subprocess
import logging
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
    out.pop()
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
        self.item_descriptors = []
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
        '''
        for i in self.dependency_array:
            if i[3] in ['NOUN', 'PRON']:
                self.nouns.append(i[1])
            if i[3] in ['VERB']:
                self.verbs.append(i[1])
            if i[3] in ['ADJ']:
                self.adjectives.append(i[1])

            # could potentially move these within nouns/verbs/etc stuff
            if i[7] in ['ROOT']:
                self.terms.root = i[1]
                self.search_object = i[1]
            if i[7] in ['dobj']:
                self.terms.dobj = i[1]
                self.search_object = i[1]
            if i[7] in ['dep']:
                self.terms.item_descriptors.append(i[7])
            if i[7] in ['punct']:
                if i[1] in ['?']:
                    self.isQuestion = True
            # focus thing
            if i[1].lower() in ['one', '1', 'first']:
                self.focus.append(1)
            if i[1].lower() in ['two', '2', 'second']:
                self.focus.append(2)
            if i[1].lower() in ['three', '3', 'third']:
                self.focus.append(3)
