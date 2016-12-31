# What this is for
Since we ideally would like for everyone to have their code deployed without having to know specific info about which VM is running what under what user, (also that is just a really annoying and terrible way to do stuff if you are troubleshooting) and to help possibly start incorporating tests into our system (obviously they are boring and lame but kind of helpful).  i looked at and had set up the jenkins server but think that it was just a bit too enterprise level in many ways and didnt really work well with how we have stuff set up, also seemed like it was basically just a legacy java thing that people use b/c the alternatives are slim and setting all this stuff up is actually a huge time suck and confusing and the docs and tutorials are usually either too specific to someones particular use case or are very outdated.

# to help speed up things we have a cache and should set this up first
the cache is from minio and is installed via helm following [this guide](https://github.com/kubernetes/charts/tree/master/stable/minio) and using the minio-config.yaml.  helm seemed a lot easier and more useful than configuring an assorted array of k8s files and diving into k8s documentation on how disks work and formating etc, it is actually really good and might be useful for other things we deploy since we would just need to use a template.

the command to install the minio deployment would be:
`helm install --name=gitlab-cache --namespace=gitlab -f minio-helm.yaml stable/minio`

for what we are doing we also need a /runner folder in the persistent disk (folder is a bucket on the mounted volume i think).  for now, just run this command (which gets the pod then enters and executes the mkdir command):
`kubectl get pod --namespace=gitlab --selector='app=gitlab-cache-minio' --output='name' | cut -d'/' -f2 | xargs -I {} kubectl exec {} -- /bin/sh -c "mkdir -p /export/runner""`

### Note:
a better way to do the above is either a custom helm install the creates /runner (incredibly simple and easy to add), or from within a [init-container/pod for gitlab-runner](http://kubernetes.io/docs/user-guide/accessing-the-cluster/#accessing-the-api-from-a-pod).  Wasnt interested in diving into either atm.

in the case you need to delete:
`helm delete gitlab-cache`

# gitlab runner
the gitlab-runner is a custom dockerfile since the official docs didnt seem to work unless we were hosting the gitlab instance ourselves and that currently doesnt allow automatic mirroring.  it is based on the official image but uses a pretty heavily modified entrypoint to use our cache and kubernetes stuff.  the majority of setup/config is in the entrypoint file and then the deployment uses a args: run on the entrypoint.  a lot of this stuff is incredibly new (the kubernetes executor is only from a few months ago) so I have no idea what will change.

the kubernetes executor is really cool because it allows us to do any stage within the gitlab-ci concurrently so we can for instance test 5 different things and they will all execute and do stuff in their own pod. same for building docker images and whatever else.  currently have it limited to 2 and not sure what the difference between global concurrent and runner limit is.  the kubernetes use a docker:dind service which allows us to build images from a docker image but requires setting kubernetes privileged thing.


the gitlab runner can be set up and deployed if you are authenticated on the cluster:

```
docker build -t gcr.io/kip-styles/gitlab-runner:latest -f gitlab-runner.Dockerfile .
gcloud docker -- push gcr.io/kip-styles/gitlab-runner:latest
# not actually necessary since i did the data in the entrypoint file, should consolidate and move the configmap stuff out
kubectl create -f gitlab-runner.configmap.yaml
kubectl create -f gitlab-runner.deployment.yaml
```

# gitlab-ci.yml file
this is the file that actually does everything.
it uses a few secret keys ive set up in gitlab which we should probably not do since it might be confusing when troubleshooting later.

the .gitlab-ci.yml file is set up to be pretty straightforward but has a few things which may seem confusing at first.  mainly the templates which is just a way to do something like build and push an image the same way for multiple things without having to configure each individually.

also using the docker:dind image as a service doesnt allow us to easily cache atm so the workaround is to do
`docker build --cache-from $KIP_REGISTRY/$IMAGE_NAME:latest`
which will probably change in the future. (could potentially save docker image to cache and then use that instead of having to pull latest image and tag latest image etc)


# to do later

the nodepools are running an old base image which doesnt allow overlayfs for docker stuff.  im not entirely sure how that stuff works though but it would speed up the builds/testing apparently.

# helpful docs

https://gitlab.com/gitlab-org/gitlab-ci-multi-runner/blob/master/docs/configuration/advanced-configuration.md

