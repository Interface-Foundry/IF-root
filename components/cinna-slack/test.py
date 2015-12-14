from textblob import TextBlob

text = 'purfect kitten'

blob = TextBlob(text)
print blob.correct()
