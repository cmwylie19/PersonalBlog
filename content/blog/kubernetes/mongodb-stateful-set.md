---
title: MongoDB Stateful Sets
date: "2021-11-14T07:42:32.169Z"
description: Build a StatefulSet of MongoDB instances on Kubernetes on GKE.
---

# High Level Overview
StatefulSets, like Deployments, and ReplicaSets, can scale up and down, perform rolling updates and rollbacks, but they can also replicate data. One major usecase of ReplicaSets is for storing data, if pod goes down in statefulset the other instances will be used to perform the action, you will **not** lose your data 🎊.
  
Also, like a deployment, a StatefulSets manage pods based on an identical copntainer spec, if you are familiar with Deployments and ReplicaSets, the StatefulSet will be familiar. One major difference is that the `StatefulSet` backs each instance with a Persistent Volume and a Persistent Volume Claim for availability, although you do not actually have to provision these, you will use the `volumeClaimTemplates` to automatically provision a PersistentVolume and persistentVolumeClaim per instance.

Lets deploy a MongoDB StatefulSet on Google Kubernetes Engine. Our end goal is to have 1 instance of Mongo as the master and 2 slave instances that are replicated from the master. If one instance goes down, we will still be able to reliably retrieve data.

![ReplicatedMongo](/ReplicatedMongo.jpg)  


## Configure Mongo As a Replicated Database
- Exposed `StatefulSet` from a headless service
- Create a `StorageClass` for the `StatefulSet`
- Create `StatefulSet`
- Configure Mongo to Replicate
- Proof

### Create a Headless Service to Expose StatefulSet
Create a service the normal way configuring the ports and selector, then set `ClusterIP: None`. We will configure our service to run on port 27017, and to connect to the mongo container on port 27017.
```
apiVersion: v1
kind: Service
metadata:
  name: mongo-headless
  labels:
    app: mongo
spec:
  ports:
    - port: 27017
      targetPort: 27017
      name: mongo
  selector:
    app: mongo
  clusterIP: None # <- Set ClusterIP to none to create headless service
```

### Create a StorageClass for the StatefulSet
StorageClasses let you provision volumes based on the your cloud provider. Since I am using GKE, I will set the `.spec.provisioner=kubernetes.io/gce-pd`. If you do not know which provisioner to choose, look up storage classes based on your cloud provider.   

The StatefulSet will use the `StorageClass` to spin up one `PV` and one `PVC` per instance of the `StatefulSet`.
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: mongo-storage
provisioner: kubernetes.io/gce-pd
```

## Create a StatefulSet
In a statefulSet you have to specify the `serviceName` as the headless service, and create the `volumeClaimTemplates` so that each instance will have a PersistentVolume and PersistentVolumeClaim. As seen from the command arguments on the mongo image, we need `mongod` to bind to `0.0.0.0` to listen for connections from applications on configured addresses (our headless service)
```
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongo
spec:
  replicas: 3
  serviceName: mongo-headless # <- name of Headless Service
  volumeClaimTemplates: # <- Unique to StatefulSets
   - metadata:
       name: data-volume
     spec:
       accessModes: ["ReadWriteOnce"]
       storageClassName: mongo-storage
       resources:
         requests:
           storage: 1Gi
  selector:
    matchLabels:
      app: mongo
  template:
    metadata:
      name: mongo
      labels:
        app: mongo
    spec:
      containers:
        - image: mongo:5.0.3
          name: mongodb
          command: # <- mongo "init" command>
          - mongod
          - "--bind_ip"
          - "0.0.0.0"
          - "--replSet"
          - "MainRepSet"
          volumeMounts: 
            - name: data-volume
              mountPath: /var/lib/mongo
      restartPolicy: Always
```

## Configure Mongo to Replicate
The infrastructure is ready, now to finally initiate the `ReplicaSet` in mongo. Docs on this can be found [here](https://docs.mongodb.com/manual/tutorial/deploy-replica-set/). 

```
k exec pod/mongo-0 -- mongo --eval 'rs.initiate({ 
_id: "MainRepSet",
members: [
    { _id: 0, host: "mongo-0.mongo-headless.demo.svc.cluster.local:27017"
    },
    { _id: 1, host: "mongo-1.mongo-headless.demo.svc.cluster.local:27017"
    },
    { _id: 2, host: "mongo-2.mongo-headless.demo.svc.cluster.local:27017"
    }]
})'
```

Now our replica set is replicating. Now to test.


## Proof
Lets create some data in the master mongo instance.
```
k exec -it mongo-0 --  mongo --eval 'db.local.insert({"name":"dbot"})' 
```   
   
Now, we exec into a slave pod, `mongo-1` or `mongo-2` and we query the local database. First, we must issue the command `rs.secondaryOk()` in the mongo container so it allows us to read from the slave.

```
k exec -it mongo-1 -- mongo
```

From the mongo shell, issue `rs.secondaryOk()`, then `db.local.find()` to select all from local db:
```
MainRepSet:SECONDARY> rs.secondaryOk()
MainRepSet:SECONDARY> db.local.find()
{ "_id" : ObjectId("61916cbcdd955ecc2d7531b7"), "name" : "dbot" }
```

You should have received the output above.

do the same on mong-2, the other slave:   
Exec into the pod
```
k exec -it mongo-1 -- mongo
```

From the mongo shell, issue `rs.secondaryOk()`, then `db.local.find()` to select all from local db:
```
MainRepSet:SECONDARY> rs.secondaryOk()
MainRepSet:SECONDARY> db.local.find()
{ "_id" : ObjectId("61916cbcdd955ecc2d7531b7"), "name" : "dbot" }
```

Somewhat complicated and not good for devops but hey, it works 🤷.