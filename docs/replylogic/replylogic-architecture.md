# Reply Logic

Reply Logic is a server that handles responding to user queries.

## Proxied Requests To Amazon

ReplyLogic uses one of two proxies to resolve all requests to Amazon.com. Mesh (http://proxymesh.com/) uses a list of remote proxy servers. At request time, RL chooses one server at random. On the other hand, Luminati (https://github.com/luminati-io/luminati-proxy) is a local proxy server running in the same kubernetes cluster as RL. When it receives a request, it forwards it along to its peer network and eventually on to Amazon.

See the descriptions of various parameters in the [luminati proxy dockerfile](../../Dockerfiles/luminati_proxy.Dockerfile) for some of the important tuning parameters for Luminati. Tuning makes a HUGE difference!

![Network Architecture Diagram](ReplyLogicPricesNetworkDiagram.png)

The above diagram gives a basic overview of the path of proxied requests from the Reply Logic server (RL) to amazon.

1. Every few minutes, RL sends a test request through luminati to Amazon.com (to some predetermined product page) to check the health of the luminati proxy. If the response is returned quickly and appears to be a valid product page, then luminati is used as the default proxy. Otherwise, the mesh proxy is used by default.
2. In response to user queries (e.g. 'green hat'), RL consults the Amazon Search API for a list of products that match the query. In order to retrieve prices, Amazon.com must be scraped. Depending on the preferred proxy (determined by `1`) a request is made to either a remote mesh proxy server chosen at random, or to the local luminati proxy service.
3. The chosen proxy service queries amazon and returns the body of the product page, which is scraped for pricing and review information.

## Deployment

No deployment steps are necessary for mesh, as it's an external service. To deploy RL and/or Luminati proxy, you'll need to build a new image, push that image to an image repository (gcr.io in this case) and then rollout the container.

### Building/Pushing Containers

Reply Logic
```
cd $KIP-ROOT/IF-root
LABEL=gcr.io/kip-styles/reply_logic:`git rev-parse --short HEAD`
docker build -t $LABEL -f Dockerfiles/reply_logic.Dockerfile .
gcloud docker push $LABEL
```

Luminati Proxy: NOTE: the only reason to build a new luminati container is if the docker file changes or if the luminati image that the kip image is [based on](https://hub.docker.com/r/luminati/luminati-proxy/) changes. In such cases, you can build/push a new version:
```
cd $KIP-ROOT/IF-root
LABEL="gcr.io/kip-styles/luminati-proxy:`date +%Y%m%d`"
docker build -t $LABEL -f Dockerfiles/luminati_proxy.Dockerfile .
gcloud docker push $LABEL
```

### Rollout

Update the image line of the deployment configuration for the appropriate namespace (e.g. the production replylogic config is located at `src/k8s/prod/replylogic.deployment.yaml`)

Then simply apply that deployment file to the appropriate kubernetes namespace. E.g. for replylogic in prod:
```
kubectl apply --record -f src/k8s/prod/replylogic.deployment.yaml
```

### Rollback

Mistakes happen. If you want to rever to the previous version again:
```
# For the default namespace (prod) replylogic instance.
kubectl rollout undo deployments/replylogic
```
