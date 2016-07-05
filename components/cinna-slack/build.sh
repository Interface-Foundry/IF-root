VERSION=0.7.4.2

docker build -t gcr.io/kip-styles/reply_logic:$VERSION -f Dockerfiles/reply_logic .
gcloud docker push gcr.io/kip-styles/reply_logic:$VERSION

docker build -t gcr.io/kip-styles/web:$VERSION -f Dockerfiles/web .
gcloud docker push gcr.io/kip-styles/web:$VERSION

docker build -t gcr.io/kip-styles/facebook:$VERSION -f Dockerfiles/facebook .
gcloud docker push gcr.io/kip-styles/facebook:$VERSION

# NLP
cd nlp
docker build -t gcr.io/kip-styles/nlp:$VERSION .
gcloud docker push gcr.io/kip-styles/nlp:$VERSION
cd ..

# PICSTITCH
cd image_processing
docker build -t gcr.io/kip-styles/picstitch:$VERSION .
gcloud docker push gcr.io/kip-styles/picstitch:$VERSION
cd ..


