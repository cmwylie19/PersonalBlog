---
title: Setting Up a Jenkins Pipeline from scratch
date: "2020-08-07T22:40:32.169Z"
description: Provision, create a custom slave pod to handle the pipeline, create a pipeline, and trigger builds from GIT. (Work in progress)
---

# Provision Jenkins Using Templates
_This post shows you a quick way to get up and running with Jenkins on OpenShift_

Print out available parameters for the `jenkins-persistent` template.
```
oc process --parameters jenkins-persistent -n openshift 
```

Provision a jenkins instance in your namespace
```
oc process jenkins-persistent -n openshift VOLUME_CAPACITY=5Gi JENKINS_IMAGE_STREAM_TAG=jenkins:$(oc project -q):<openshift_version>  | oc create -f - 

```


## Creating the slave image

_Currently, the jenkins-xxxx pod is running the image for the master jenkins. It is bad practice to run the pipeline in the master pod. Therefore, we will make slave images to run the pipelines. The slave images will be equipped with "npm" and "skopeo" so they can build and copy the images throughout the pipeline._

### Import the image
```
oc import-image https://quay.io/repository/cmwylie19/origin-jenkins-agent-nodejs --confirm
```

label the image
```
oc label is/origin-jenkins-agent-nodejs role=jenkins-slave
```

Create build config and apply it.
```
# bc-origin-jenkins-agent-nodejs.yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  labels:
    application: origin-jenkins-agent-nodejs
  name: origin-jenkins-agent-nodejs
spec:
  nodeSelector: null
  output:
    to:
      kind: ImageStreamTag
      name: "origin-jenkins-agent-nodejs:latest"
  postCommit: {}
  resources: {}
  runPolicy: Serial
  source:
    dockerfile: >-
      FROM
      registry.access.redhat.com/openshift3/jenkins-agent-maven-35-rhel7:latest

      USER root

      RUN yum repolist > /dev/null && yum-config-manager --enable
      rhel-7-server-extras-rpms &&  yum clean all &&  INSTALL_PKGS="skopeo" &&
      yum install -y --setopt=tsflags=nodocs $INSTALL_PKGS && rpm -V
      $INSTALL_PKGS && yum clean all

      USER 1001
    type: Dockerfile
  strategy:
    dockerStrategy: {}
    type: Docker
  triggers: []
```

```
oc apply -f bc-origin-jenkins-agent-nodejs.yaml
```