# Running New NLP System

requires docker-compose and docker

```
> cd /components/cinna-slack/nlp2
> docker-compose build
> docker-compose up
```


# Notes



## notes on using prod mongo_db

prod db is not the same as kip_tester db for collections.

packed column jsons in prod:
thread and source

thread keys:

- 'parent':

    -'isParent': False,

    -'id': u'E1_rKk_Eb',
- 'id': u'N13SY1uNW',
- 'isOpen': False,
- 'sequence': 2

source keys:
-

## Training Corpus

Texts being used


## Dockerfile

Building dockerfile requires 12+ gb of RAM?  Building on remote server but should set up something.


## Using syntaxnet

without tree form is (# index is -1 of these values for python indexing):


|#  | What?| Description |
|---|------|-------------|
|1  |  ID | Token counter, starting at 1 for each new sentence. |
|2  |  FORM |   Word form or punctuation symbol. |
|3  |  LEMMA |  Lemma or stem (depending on particular data set) of word form, or an underscore if not available. |
|4  |  CPOSTAG |Coarse-grained part-of-speech tag, where tagset depends on the language. |
|5  |  POSTAG | Fine-grained part-of-speech tag, where the tagset depends on the language, or identical to the coarse-grained part-of-speech tag if not available. |
|6  |  FEATS |  Unordered set of syntactic and/or morphological features (depending on the particular language), separated by a vertical bar (|), or an underscore if not available. |
|7  |  HEAD |   Head of the current token, which is either a value of ID or zero ('0'). Note that depending on the original treebank annotation, there may be multiple tokens with an ID of zero. |
|8  |  DEPREL | Dependency relation to the HEAD. The set of dependency relations depends on the particular language. Note that depending on the original treebank annotation, the dependency relation may be meaningfull or simply 'ROOT'. |
|9  |  PHEAD |  Projective head of current token, which is either a value of ID or zero ('0'), or an underscore if not available. Note that depending on the original treebank annotation, there may be multiple tokens an with ID of zero. The  |dependency structure resulting from the PHEAD column is guaranteed to be projective (but is not available for all languages), whereas the structures resulting from the HEAD column will be non-projective for some sentences of some languages (but is always available). |
|10 | PDEPREL | Dependency relation to the PHEAD, or an underscore if not available. The set of dependency relations depends on the particular language. Note that depending on the original treebank annotation, the dependency relation may be meaningfull or simply 'ROOT'. |

example:

> `['1', 'hey', '_', 'X', 'UH', '_', '5', 'discourse', '_', '_']`


Explanation of some of the terms (POSTAG, DEPREL, etc): [Dependencies Manual](http://nlp.stanford.edu/software/dependencies_manual.pdf)

Another explanation: [temrs](https://cs.nyu.edu/grishman/jet/guide/PennPOS.html)


## USING FROM PYTHON

the request from node stuff:
```
var resp =request({
...       method: 'POST',
...       url: config.nlp_rnn + '/predict',
...       json: true,
...       body: {
.....         text: text,
.....         // history: history_array
.....       }
...     })
```
the equivalent in python will be:

```
import requests
r = requests.post('http://localhost:8085/predict', json={'text': 'red shoes'})
```


