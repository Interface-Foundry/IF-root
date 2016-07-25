VERSION=0.7.4.27

#docker build -t gcr.io/kip-styles/reply_logic:$VERSION -f Dockerfiles/reply_logic .
#gcloud docker push gcr.io/kip-styles/reply_logic:$VERSION

#docker build -t gcr.io/kip-styles/web:$VERSION -f Dockerfiles/web .
#gcloud docker push gcr.io/kip-styles/web:$VERSION

docker build -t gcr.io/kip-styles/facebook:$VERSION -f Dockerfiles/facebook .
gcloud docker push gcr.io/kip-styles/facebook:$VERSION

#docker build -t gcr.io/kip-styles/botbuilder:$VERSION -f Dockerfiles/botbuilder .
#gcloud docker push gcr.io/kip-styles/botbuilder:$VERSION

exit 0

# NLP
cd nlp
#docker build -t gcr.io/kip-styles/nlp:$VERSION .
#gcloud docker push gcr.io/kip-styles/nlp:$VERSION
cd ..

# NLP2
docker build -t gcr.io/kip-styles/parser:$VERSION -f nlp2/parser.Dockerfile nlp2/
docker build -t gcr.io/kip-styles/rnn:$VERSION -f nlp2/rnn.Dockerfile nlp2/
gcloud docker push gcr.io/kip-styles/parser:$VERSION
gcloud docker push gcr.io/kip-styles/rnn:$VERSION

# PICSTITCH
cd image_processing
docker build -t gcr.io/kip-styles/picstitch:$VERSION .
gcloud docker push gcr.io/kip-styles/picstitch:$VERSION
cd ..


