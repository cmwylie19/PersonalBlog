---
title: Deploy Sonatype Nexus in OpenShift
date: "2020-06-01T22:40:32.169Z"
description: Deploy Sonatype Nexus in OpenShift
---

## Set Up Nexus

_We are going to pull Sontatype Nexus 3 image `sonatype/nexus3:3.21.2` from DockerHub. We will deploy it using a recreate deployment strategy and customized memory, cpu and volumeMount._

#### Create a new project:

> oc new-project ${whoami}-nexus --display-name "${whoami} Shared Nexus"

#### Create a new app in OpenShift

> oc new-app sonatype/nexus3:3.21.1 --name=nexus

#### Expose a service and generate a route from nexus

> oc expose svc nexus

#### Check your route

> oc get routes

## Interrupt Deploymeny

#### Pause deployment

> oc rollout pause dc nexus

#### Change deployment strategy from Rolling to recreate and set requests and limits for memory and CPU

> oc patch dc nexus -p '{"spec":{"strategy":{"type":"Recreate"}}}'
> oc set resources dc nexus --limits=memory=2Gi,cpu=2 --requests=memory=2Gi,cpu=500m

#### Create a persistent volume claim (PVC) and mount it at `/nexus-data`

> oc set volume dc/nexus --add --overwrite --name=nexus-volume-1 --mount-path=/nexus-data/ --type persistentVolumeClaim --claim-name=nexus-pvc --claim-size=10Gi

#### Set up liveness and readiness probes for Nexus

> oc set probe dc/nexus --liveness --failure-threshold 3 --initial-delay-seconds 60 -- echo ok
> oc set probe dc/nexus --readiness --failure-threshold 3 --initial-delay-seconds 60 --get-url=http://:8081/

#### Resume rollout

> oc rolleout resume dc nexus

## Configure Nexus

> oc get pods
> NEXUS_POD=nexus-2-chc8g
> export NEXUS_PASSWORD=$(oc rsh ${NEXUS_POD} cat /nexus-data/admin.password)

Enable ability to use a script to allow creation of proxies, repositories, etc. in Nexus

> oc set deployment-hook dc/nexus --mid --volumes=nexus-volume-1 \
> -- /bin/sh -c "echo nexus.scripts.allowCreation=true >./nexus-data/etc/nexus.properties"
> oc rollout latest dc/nexus
> watch oc get po
> with script option enabled and ypour nexus pod Ready and Running
> cd $HOME
> curl -o setup_nexus3.sh -s https://raw.githubusercontent.com/redhat-gpte-devopsautomation/ocp_advanced_development_resources/master/nexus/setup_nexus3.sh
> chmod +x setup_nexus3.sh
> ./setup_nexus3.sh admin $NEXUS_PASSWORD http://$(oc get route nexus --template='{{ .spec.host }}')
> rm setup_nexus3.sh
> Create a service `nexus-registry` that exposes port 5000 from the deployment confirguration `nexus`.
> oc expose dc nexus --port=5000 --name=nexus-registry
> Create an OpenShift route called `nexus-registry` that uses `edge` termination for the TLS encryption and exposes port 5000
> oc create route edge nexus-registry --service=nexus-registry --port=5000
> confirm routes
> oc get routes -n \${whoami}-nexus
