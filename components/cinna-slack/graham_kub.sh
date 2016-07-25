#! /bin/sh

VERSION=0.7.5.0

docker tag cinnaslack_slack gcr.io/kip-styles/slack2:$VERSION
docker tag cinnaslack_reply_logic gcr.io/kip-styles/reply2:$VERSION
docker tag cinnaslack_rnn gcr.io/kip-styles/rnn2:$VERSION
docker tag cinnaslack_parser gcr.io/kip-styles/parser2:$VERSION
docker tag cinnaslack_image_processing gcr.io/kip-styles/picstitch2:$VERSION

gcloud docker push gcr.io/kip-styles/slack2:$VERSION
gcloud docker push gcr.io/kip-styles/reply2:$VERSION
gcloud docker push gcr.io/kip-styles/rnn2:$VERSION
gcloud docker push gcr.io/kip-styles/parser2:$VERSION
gcloud docker push gcr.io/kip-styles/picstitch2:$VERSION

kubectl run slack --port=8000 --image=gcr.io/kip-styles/slack2:$VERSION
kubectl run reply --port=27017 --image=gcr.io/kip-styles/reply2:$VERSION
kubectl run image --port=5000 --image=gcr.io/kip-styles/picstitch2:$VERSION
kubectl run parser --port=8083 --image=gcr.io/kip-styles/parser2:$VERSION
kubectl run rnn --port=8085 --image=gcr.io/kip-styles/rnn2:$VERSION


kubectl expose deployment parser
kubectl expose deployment rnn
kubectl expose deployment image
