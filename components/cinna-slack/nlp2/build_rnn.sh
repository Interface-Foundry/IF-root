#! /bin/sh
#
# Due to training in another folder use this script to get


# move stuff from nlp_training to nlp2/src_rnn:
# - tokenizer
# - model weights/json

cp -r ../nlp_training/models src_rnn/
cp -r ../nlp_training/dict_lookups src_rnn/
cp ../nlp_training/pkls/tokenizer.pkl src_rnn/pkls/tokenizer.pkl
