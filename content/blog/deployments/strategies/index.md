---
title: Deployment Strategies
date: "2020-06-04T22:40:32.169Z"
description: Deployment strategies and when to use them
---

## Which deployment strategy works for you

The correct deployment strategy to use is completely situational. Below are some strategies to help you choose the _right_ strategy at the _right_ time.


#### Recreate Deployment
Terminate the all old pods and release all new pods with downtown between. 
```
spec:
  replicas: 1
  strategy:
    type: Recreate
```

 **When to use**: When nothing relies on the previous version to be up.

#### Rolling Deployment
Release a new version of the application pod by pod, replacing the old version with the new version never having any downtown.

```
spec:
  replicas: 1
  strategy:
    type: Rolling
```

 **When to use**: When you have users and you dont want the application to go down, and the new version is ready to be in production.


#### Blue/Green Deployment
Deploy new version (green) along with the old application (blue), after the deployment, only QA has access to green while your normal users have access to blue. 

**When to use**: When a new feature needs testing before being released.

#### Canary Deployment
Similar to blue/green deployments but with more control, where you can shift traffic to different versions of your application. 

**When to use**: When a new feature is testing and proven to work but you want to get feedback from a subset of your users regarding the new feature.
