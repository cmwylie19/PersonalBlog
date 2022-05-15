---
title: Cluster Upgrade Process
date: "2022-05-15T16:42:32.169Z"
description: Upgrading my Kubernetes cluster and live video. Kubernetes 1.22 -> 1.23
---

## Kubernetes Upgrade
Today I am upgrading my Kubernetes cluster. I am currently running Kubernetes v1.22.0 as of this post. [Kubernetes v1.24](https://kubernetes.io/releases/#release-v1-24) was released a little less than 2 weeks ago. Please note that Kubernetes supports the last 3 minor versions, meaning that `1.24`, `1.23`, and `1.22` are supported and `1.21` is not longer supported. 
  
The recommended approach is to upgrade one minor version at a time. In this post, I will be upgrading to Kubernetes `v1.23`. Remember, always upgrade _only one major version at a time as a best practice_.

The upgrade process itself is pretty simple, roughly the process is install the depencies and do the upgrade. I will be using [kubeadm](#https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/), which is how i built the cluster.

## Environment
The cluster has two nodes, controlplane, node01.
```
Client Version: v1.22.0
Server Version: v1.22.0
```



## Approach
I will be using `kubeadm` to upgrade the cluster, first upgrading the master, then the worker. 

While the master is being upgraded the controlplane components - the scheduler, apiserver, controller-managers go down briefly, but this will not affect the applications on the worker node as they will continue to function normally, we just will not be able to do anything that involves the controlplane like use `kubectl`.

Next, we upgrade the worker nodes, moving the workloads to the controlplane while the upgrade occurs, then moving them back after the upgrade occurs.

# Upgrade Kubernetes
Before starting, you will see `k` instead of `kubectl`. To also use `k` incase you have not already created an alias, do the following:
```
alias k=kubectl
```

### Upgrade the ControlPlane
Since I only have two nodes, I have kubelet on my master node, which is why I will be upgrading it in my controlplane upgrade.

First thing is to `ssh` into the control plane.

Next, we need to update `apt-get` and `unhold` the packages that we will upgrade.
```
sudo apt-get -y update
sudo apt-mark unhold kubeadm kubelet kubectl
```
Upgrade `kubeadm`, `kubectl`,and `kubelet` to version `1.23.0.00`
```
apt-get install -y kubeadm=1.23.0-00 kubelet=1.23.0-00 kubectl=1.23.0-00
```
Next, run `kubeadm upgrade apply` to pull the images and upgrade the components.
```
kubeadm upgrade apply v.1.23.0
```

**Always** drain the node before updating kubelet.. next upgrade the node and restart kubelet
```
k drain node01 --force --grace-period=0 --ignore-daemonsets
kubeadm upgrade node
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

Check Nodes to make sure the version reflects our changes (you should see 1.23 on the controlplane)
```
k get no 
```

Hold packages again
```
sudo apt-mark hold kubeadm kubelet kubectl
```

### Upgrade the Worker
First thing is to `ssh` into the worker.

Next, we need to update `apt-get` and `unhold` the packages that we will upgrade.
```
sudo apt-get -y update
sudo apt-mark unhold kubeadm kubelet kubectl
```

To upgrade the worker, we need to change the workloads so they will get picked up by the controlplane. I have a taint on my controlplane, so we will remove the taint for this process.   

Find if taints exist on your nodes
```
k describe no | grep -A5 Taints
```

output
```
Taints:             node-role.kubernetes.io/master:NoSchedule
Unschedulable:      false
Lease:
  HolderIdentity:  controlplane
  AcquireTime:     <unset>
  RenewTime:       Sun, 15 May 2022 11:50:24 +0000
--
Taints:             <none>
Unschedulable:      false
Lease:
  HolderIdentity:  node01
  AcquireTime:     <unset>
  RenewTime:       Sun, 15 May 2022 11:50:24 +0000
```

Untaint the controlplane
```
k taint no controlplane node-role.kubernetes.io/master-
```


Drain worker node:
```
k drain node01 --force --grace-period=0 --ignore-daemonsets
```

Upgrade `kubeadm`,`kubectl`, and `kubelet`
```
sudo apt-get install -y kubeadm=1.23.0-00 kubectl=1.23.0-00 kubelet=1.23.0-00
```

Upgrade Node Configuration
```
kubeadm upgrade node
```

Restart kubelet service
```
sudo systemctl daemon-reload
sudo systemctl restart kubelet
```

Make worker schedulable again
```
k uncordon node01
```

Retaint the controlplane
```
k taint no controlplane node-role.kubernetes.io/master:NoSchedule
```

Hold packages again
```
sudo apt-mark hold kubeadm kubelet kubectl
```

### Video
[![Video](https://i9.ytimg.com/vi/3xsznTndXfU/mq2.jpg?sqp=CPDAhZQG&rs=AOn4CLC5G8UVg7IXAjQHi72ZASDPKYxcJA)](https://youtu.be/3xsznTndXfU)   
Watch the [video](https://youtu.be/3xsznTndXfU)