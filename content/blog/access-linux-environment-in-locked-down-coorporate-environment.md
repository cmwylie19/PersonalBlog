---
title: Access Linux Environment in an overly secure coorporate computer environment with Access To OpenShift
date: "2020-08-09T22:40:32.169Z"
description: Access Linux Environment in an overly secure coorporate computer environment with Access To OpenShift
---

> # Background
_A problem came up recently when I was working on migrating some applications to a new cluster environment. I needed to push some files to GIT, but the `ssh-keygen` tool was blocked, so I was unable to push my public key to the git server to establish trust. This article speaks to the steps I took to overcome that challenge, and gain access to a pure linux terminal running Root with every tool imaginable at my disposal_



## Create a new project based on UBI 7

First, you are going to need to fire up a new project in OpenShift based on UBI 7, which is Universal Base Image 7, a small Red Hat Enterprise Linux image running root that is fully equipped with vital linux tools and is capable of downloading more if you need.

```
oc new-app registry.access.redhat.com/ubi7/ubi
```

## Scale the Deployment Config to 0 Replicas
The next step is to scale down the 'deployment config' to 0 replicas, and then start a debug pod. From here you will have access to the shell.

```
oc scale --relicas=0 dc ubi

oc debug dc/ubi
```

## Install `openssh`
The package containing `ssh-keygen` is openssh. We need to install it to be able to create the public and private key.
```
yum -y install openssh git
```


## Create public and private keys
```
ssh-keygen
```

After this you will go through the typical prompts to create your key.

Then, upload your public key `/root/.ssh/id_rsa.pub` to the GIT server to establish trust.

then, finally

```
GIT_SSL_NO_VERIFY=yes git clone https://GIT:SERVER.GIT
```

AND THATS IT!


