#! /bin/sh

VERSION=0.7.5.0.1
REPO=kip-ai
DOCKERFILES_PATH='../src/Dockerfiles'
CONTEXT_PATH='../src/'

# echo "gcr.io/$REPO/slack:$VERSION"
docker build -t gcr.io/$REPO/slack:$VERSION     -f $DOCKERFILES_PATH/slack_test.Dockerfile       $CONTEXT_PATH
docker build -t gcr.io/$REPO/reply:$VERSION     -f $DOCKERFILES_PATH/reply_logic_test.Dockerfile $CONTEXT_PATH
docker build -t gcr.io/$REPO/parser:$VERSION    -f $DOCKERFILES_PATH/parser.Dockerfile           $CONTEXT_PATH
docker build -t gcr.io/$REPO/rnn:$VERSION       -f $DOCKERFILES_PATH/rnn.Dockerfile              $CONTEXT_PATH
docker build -t gcr.io/$REPO/picstitch:$VERSION -f $DOCKERFILES_PATH/picstitch.Dockerfile        $CONTEXT_PATH

gcloud docker push gcr.io/$REPO/slack:$VERSION
gcloud docker push gcr.io/$REPO/reply:$VERSION
gcloud docker push gcr.io/$REPO/parser:$VERSION
gcloud docker push gcr.io/$REPO/rnn:$VERSION
gcloud docker push gcr.io/$REPO/picstitch:$VERSION

# if you need to delete all previous services/deployments
# kubectl delete deployment slack reply parser rnn picstitch
# kubectl delete service slack reply parser rnn picstitch

kubectl run slack     --port=8000 --image=gcr.io/$REPO/slack:$VERSION
kubectl run reply                 --image=gcr.io/$REPO/reply:$VERSION
kubectl run parser    --port=8083 --image=gcr.io/$REPO/parser:$VERSION
kubectl run rnn       --port=8085 --image=gcr.io/$REPO/rnn:$VERSION
kubectl run picstitch --port=5000 --image=gcr.io/$REPO/picstitch:$VERSION

kubectl expose deployment slack
kubectl expose deployment reply
kubectl expose deployment parser --type=LoadBalancer
kubectl expose deployment rnn --type=LoadBalancer
kubectl expose deployment picstitch --type=LoadBalancer


# OLD BELOW____________
# # kubectl delete deployment image parser reply rnn slack

# # slack build push
# docker build -t gcr.io/kip-ai/slack:$VERSION -f Dockerfiles/slack.Dockerfile .
# gcloud docker push gcr.io/kip-ai/slack:$VERSION
# kubectl run slack --port=8000 --image=gcr.io/kip-ai/slack:$VERSION

# #reply logic build push
# docker build -t gcr.io/kip-ai/reply:$VERSION -f Dockerfiles/reply_logic.Dockerfile .
# gcloud docker push gcr.io/kip-ai/reply:$VERSION
# kubectl run reply --image=gcr.io/kip-ai/reply:$VERSION

# #parser
# docker build -t gcr.io/kip-ai/parser:$VERSION -f Dockerfiles/parser.Dockerfile .
# gcloud docker push gcr.io/kip-ai/parser:$VERSION
# kubectl run parser --port=8083 --image=gcr.io/kip-ai/parser:$VERSION

# # ----------------------------------------------------------------------