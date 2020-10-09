---
title: Deploy React App in NGINX on OpenShift
date: "2020-08-04T22:40:32.169Z"
description: NGINX seems complicated at times with all of its configuration. Here is an easy way to deploy a react application with it.
---

> # Deploy React App in OpenShift
_This article is meant to demonstrate to you how to deploy React Apps using NGINX on OpenShift. In this article I am using an OpenShift 4.4 Cluster but this should work for any OpenShift 4.x Cluster_

## Prereqs
>- OpenShift 4.x Cluster 
>- OpenShift 4.x CLI
>- Node >= v12 
>- GitHub

## Steps
>- Clone Repo containing the react code
>- Run NPM build command to build react code out the results to the build folder
>- Create a new OpenShift App From the code in the build folder based on an nginx container


## Clone the reppo
```
export GIT_REPO="https://github.com/devsuperstar/progressive-web-app.git"
export BUILDER_IMAGE="quay.io/evanshortiss/s2i-nodejs-nginx"
export APPLICATION_NAME="frontend-pga"

// Clone the repo
git clone $GIT_REPO;

// Chage Directories into the repo
cd progressive-web-app;

// Install the dependencies
npm i;

// Build the code and output results to the build folder
npm run build;

// Create a project that the application will live in
oc new-project chatapp

// Create the app in OpenShift based on the Node.js & NGINX container
oc new-app $BUILDER_IMAGE~$GIT_REPO \
--name $APPLICATION_NAME \
--build-env BUILD_OUTPUT_DIR=build

// Expose the service 
oc expose svc/$APPLICATION_NAME


// Check the build status
oc get builds

# Print the application URL (Route)
echo "http://$(oc get route/$APPLICATION_NAME -o jsonpath='{.spec.host}')"


```
