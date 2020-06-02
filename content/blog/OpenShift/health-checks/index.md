---
title: Using Health Checks
date: "2020-06-01T13:40:32.169Z"
description: Relying in Health Checks as Circuit Breakers in Open Shift
---

_Liveness and Readiness probes control the circuit breaking of your application. If your application fails the liveness probe 3 times the pod will be restarted, OpenShift will also not route traffic to your pod until it is ready._

## Create a project 
> oc new-project "${whoami}-deployments --display-name "${whoami} Deployments"

### Create two apps

> oc new-app --name="blue" labels=name=blue php~https://github.com/redhat-gpte-devopsautomation/cotd.git --env=SELECTOR=cats

### Expose the service for the blue app
> oc expose svc/blue --name=bluegreen

### Set Readiness Probe
> oc set probe dc/blue --readiness --get-url=http://:8080/item.php --initial-delay-seconds=2

### Set Liveness Probe
> oc set probe dc/blue --liveness --get-url=http://:8080/item.php --initial-delay-seconds=2
