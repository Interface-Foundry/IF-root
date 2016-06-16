import subprocess

DEBUG_ = True


def syntaxnet_array(t):
    '''
    pass text argument to syntaxnet, get dependency tree, must have
    '''
    # demo.sh for testing, parser.sh irl
    if DEBUG_:
        script_location = "syntaxnet/demo.sh"
    else:
        script_location = "parser.sh"
    t = "echo " + t + " | " + script_location
    p = subprocess.Popen(t, stdout=subprocess.PIPE, shell=True)
    out = p.stdout.read().splitlines()
    # last item in array is ' ' for some reason
    out.pop()
    return out

def syntax_no_script(t):
    '''
    '''
    pass

class McParser:
    '''
    '''
    def __init__(self, text):
        self.text = text
        self.dependency_array = self.array_form()
        self.root = self.root()

    def root(self):
        '''
        not really necessary but for future use depending on modifiers
        '''
        for i in self.dependency_array:
            if i[7] == 'ROOT':
                return i[1]

    def array_form(self):
        dependency_array = []
        # d_array =
        for line in syntaxnet_array(self.text):
            dependency_array.append(line.split('\t'))
        return dependency_array
