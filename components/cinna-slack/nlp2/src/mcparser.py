import subprocess
import logging

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
        self.text = text
        self.terms = {'item_descriptors': [], 'had_find': False}
        self.process_text()

    def process_text(self):
        '''
        takes base text, pass into syntaxnet_array and then
        '''
        # find ruins root of parser
        if 'find' in self.text.lower():
            self.terms['had_find'] = True
            self.text = self.text.lower().replace('find', '')

        self.d_array = syntaxnet_array(self.text)
        self.array_form()
        self.find_search_terms()
        if self.dobj:
            self.search_object = self.dobj
        elif self.root:
            self.search_object = self.root

    def array_form(self):
        a = []
        for line in self.d_array:
            a.append(line.split('\t'))
        self.dependency_array = a

    def find_search_terms(self):
        for i in self.dependency_array:
            if i[7] == 'ROOT':
                self.terms['root'] = i[7]
            if i[7] == 'dobj':
                self.terms['dobj'] = i[7]
            if i[7] == 'dep':
                self.terms['item_descriptors'].append(i[7])
