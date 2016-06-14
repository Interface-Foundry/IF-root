import pandas as pd


def retrieve_from_db():
    from pymongo import MongoClient
    client = MongoClient()
    db = client.foundry
    cursor = db.messages.find({})
    df_messages = pd.DataFrame(list(cursor))

    return df_messages


class McParser:
    '''
    mcparser class that parses similar to current spacy oriented parser
    '''

    def __init__(self, text):
        self.text = text
        pass

    def parser_text():
        pass

    def last_three_messages(self):
        '''
        given user, return last three messages from dataframe
        '''
        pass



# from seq2seq