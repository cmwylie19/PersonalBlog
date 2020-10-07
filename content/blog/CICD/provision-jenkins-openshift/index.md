---
title: Provision jenkins using templates
date: "2020-08-07T22:40:32.169Z"
description: Provision jenkins using templates
---

# Provision Jenkins Using Templates
_This post shows you a quick way to get up and running with Jenkins on OpenShift_

Print out available parameters for the `jenkins-persistent` template.
```
oc process --parameters jenkins-persistent -n openshift 
```

Provision a jenkins instance in your namespace
```
oc process jenksin-persistent -n openshift VOLUME_CAPACITY=5Gi JENKINS_IMAGE_STREAM_TAG=jenkins:<project_name>:<openshift_version>
```