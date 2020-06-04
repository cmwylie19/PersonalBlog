---
title: Blue Green App Deployment in Open Shift
date: "2020-06-01T13:40:32.169Z"
description: Blue Green App Deployment in OpenShift
---

## Set up a Blue Green Deployment in OpenShift

## Create a project

> oc new-project "${whoami}-deployments --display-name "${whoami} Deployments"

### Create two apps

> oc new-app --name="blue" labels=name=blue php~https://github.com/redhat-gpte-devopsautomation/cotd.git --env=SELECTOR=cats

> oc new-app --name="green" labels=name=green php~https://github.com/redhat-gpte-devopsautomation/cotd.git --env=SELECTOR=cities

### Expose the service for the blue app

> oc expose svc/blue --name=bluegreen

### In a second terminal

> while true; do curl -s $(oc get route bluegreen --template='{{ .spec.host }}')/item.php | grep "data/images" | awk '{print $5}'; sleep 1; done

## Execute Blue-Green deployment

> oc patch route/bluegreen -p '{"spec":{"to":{"name":"green"}}}'

> oc set env dc/blue SELECTOR=pets
> oc set route-backends bluegreen green=100 blue=0
