import tools, evaluation, os

# Hey Kipster!  For this to work, use a python virtualenv
# and pip install -r requirements.txt in IF-root
# you might also need to install numpy or gfortran with your os pkg manager

# First lets make sure the model kinda works
__dirname = os.path.dirname(os.path.realpath(__file__))
model = tools.load_model(__dirname + '/data/coco.npz')
evaluation.evalrank(model, data='coco', split='test')


# Now lets compute sentence vecs for something specific
example_sentences = [
'black tie women',
'warm winter coat',
'long dressi gown tuxedo cocktail black_ti'
]
sentence_vectors = tools.encode_sentences(model, example_sentences, verbose=True)

print sentence_vectors.shape
print sentence_vectors[0].shape
