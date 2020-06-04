---
title: Intro to Open Shift Concepts
date: "2020-04-18T22:40:32.169Z"
description: Introduction to commonly used Open Shift terminology
---

## Open Shift Terms and Concepts

OpenShift runs on RHEL (Red Hat Enterprise Linux) and RHCOS (Red Hat Core OS).

### Node Types:

OpenShift has two types of nodes:

- Workers
- Masters

<b>Nodes</b> are instances of RHEL or RHCOS with OpenShift installed. The end user applications run in these nodes and the applications are orchestrated by the master nodes. Node capacity is related to memory and CPU of underlying resources.

### Containers

- Application instances
- A worker node can run many containers at once

### Pod

- One or more containers deployed together on one host.
- Consists of containers grouped together with shared resources like volumes and IP addresses
- A pod is the smalled compute unit that can be defined, deployed and managed
  May contain tightly couples applications that run with shared context like a front end application and a webserver to serve it. Although it is possible to have multiple containers in a pod, most applications are benefit from the single container pod for easy horizontal scaling.

So, a **pod** is an application, or instance of something.

All components are wired together by <i>services</i>.

### Service (SVC)

- Defines logical set of pods <i>and</i> access policy.
- Provides internal IP addresses and hostnames for other applications to use as pods are created and destroyed
- Provides internal load balancing across application components

### Labels

- Used to group and select API Objects.
- Makes it possible to reference groupps of pods
- labels are key-value p[ai]rs
