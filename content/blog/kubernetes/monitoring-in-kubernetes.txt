---
title: Monitoring in Kubernetes
date: "2022-04-27T16:42:32.169Z"
description: Leveraging Prometheus and Grafana to monitor your cluster and applications.
---

## Overview
 This post is designed as a tutorial to teach you how to integrate metrics into a Go and Node.js applications, deploy the applications on Kubernetes, and set up infrastructure to monitor the applications and visualize the data in dashboards. All of the manifests that we will create today can be found in their [repository]().   
 
 Also, this is not an exhaustive list by any means of the functionality of Prometheus and Grafana. This is essentially a very basic setup that we will create but it serves the purpose of getting aquainted to monitoring on Kubernetes.  I encourage you to fully dive into the Prometheus and Grafana docs to see all the features.  

_A few technologies Leveraged in this Post:_  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Node.js  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Go  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Docker    
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Helm  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Prometheus (Operator)  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Grafana (Operator)

**TOC**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Write/Build/Deploy Go App with Prometheus Middleware  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Write/Build/Deploy Node.js with Prometheus Middleware  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Deploy Kube-Prometheus-Stack Helm Chart  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Create ServiceMonitors to Scrape your Apps  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Create PrometheusRules to define Alerts  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Create a GrafanaDashboard to visualize metrics  

### Go App
**Write Blue App**  
For simplicities sake, we are going to write a simple  Go application that leverages Prometheus middleware to generate metrics. We will create an endpoint in our app to excercise Prometheus's `RemoteWrite` and `ExternalLabels` features. We will call the go application the Blue app.


**Build Blue App**

**Deploy Blue App in Kubernetes**

### Node.js App

**Write Red App**  
This is a very simple Node.js application that leverages Prometheus middleware to generate metrics. We will call the Node.js application the Red App.

**Build Red App**

**Deploy Red App in Kubernetes**

The Devops Collective handbook under "Operational Capabilities of a DevOps environment", it says,
> First, and possibly foremost, you need the ability to automatically and consistently spin up environments. That's a huge deal, and it isn't easy.

[source](https://devops-collective-inc.gitbook.io/devops-the-ops-perspective/operational-capabilities-of-a-devops-environment)

This comes in handy when you need to spin up a quick staging environment to test code, or a kubernetes cluster for workshop participants.
   
Your staging environments should be largely identical for your application to ensure that production ready code goes out into the world.
   
In this post, we'll look into how to write an ansible playbook to spin up and destroy a GKE Cluster and Network.
***
## To do list
- Create a Repo and Scaffolding
- Get your GKE project ID
- Create a Service Account
- Assign roles to the service account
- Create an ansible playbook
- Run the playbook

## Create a Repo and Scaffolding
Creating a repo containing the scaffolding for this project.
```
mkdir automate-gke-cluster

cd automate-gke-cluster

mkdir ansible ansible/files \
ansible/inventory ansible/roles \
ansible/roles/create-cluster/tasks ansible/roles/destroy-cluster/tasks \
ansible/roles/create-network ansible/roles/create-network/tasks \
ansible/roles/destroy-network ansible/roles/destroy-network/tasks \

```
## Get your GKE project ID
Easy step. Just get your GKE_PROJECT and assign a variable to it.

```
gcloud projects list
```

Assign GKE_PROJECT to the project ID that we are going to use:
```
GKE_PROJECT=some-project-12345  
```


## Create a Service Account
We need a service account that is capable of spinning up/destroying clusters. I like to create a new service account for each function to minimize attack service area that would occur if an account was compromised. The best approach is a just enough access approach. 

Create a fresh service account with no roles, call it `deployer-sa`:
```
gcloud iam service-accounts create deployer-sa 
```

## Assign roles to the service account
We give our brand new service account the ability to create clusters by assigning roles to it. The following roles I found based on trail and error:

```
# Assign SA_EMAIL to value of service account email
SA_EMAIL=$(gcloud iam service-accounts list \
| grep deployer-sa |  \
awk '{print $1}')

gcloud projects add-iam-policy-binding $GKE_PROJECT \
  --member=serviceAccount:$SA_EMAIL \
  --role=roles/container.admin \
  --role=roles/storage.admin \
  --role=roles/compute.admin \
  --role=roles/container.clusterAdmin \
  --role=roles/iam.serviceAccountUser
```

Download the `JSON` keyfile for the service account:
```
gcloud iam service-accounts keys create key.json \
--iam-account=$SA_EMAIL

# Move it to the `ansible/files` directory to use with playbook
mv key.json ansible/files/deployer-sa.json

# Create a git ignore so we dont accidently check this into the repo
cat <<EOF> .gitignore
# Ansible inventory
ansible/inventory/gcp.yaml 

# Service Account
ansible/files/deployer-sa.json
EOF
```

## Create an ansible playbook
Now for this section, we build out the `inventory`, `roles`, `ansible.cfg`, and the `playbook`.

Lets start out with  the basics, we need an `ansible.cfg` file to set some sensible defaults.
```
cd ansible

cat <<EOF > ansible.cfg
[defaults]
# human-readable stdout/stderr results display [debug/yaml]
stdout_callback = yaml

# This points to the file that lists your hosts
inventory=inventory/gcp.yaml

# File to which Ansible will log on the controller. When empty logging is disabled.
log_path = ~/ansible.log
EOF
```

Next, we are referencing an `inventory/gcp.yaml` file but we dont have one yet.

Before jumping to the inventory, make sure you assign `gcloud_sa_path` the correct location based on your project directory. The one listed may not work for you. 
```
# In the invetory directory
cd inventory

cat <<EOF > gcp.yaml
all:
  vars:
    # use this section to enter GCP related information
    zone: "us-east1-b" 
    region: "us-east1"
    project_id: "your-project-1234"
    gcloud_sa_path: "/automate-gke-cluster/ansible/files/deployer-sa.json"
    credentials_file: "{{ lookup('env','HOME') }}/{{ gcloud_sa_path }}"
    gcloud_service_account: "deployer-sa@your-project-1234.iam.gserviceaccount.com"

    # use the section below to enter k8s cluster related information
    cluster_name: "my-cluster-soak"
    initial_node_count: 3
    disk_size_gb: 100
    disk_type: "pd-ssd"
    machine_type: "e2-medium"

EOF
```

Now, lets create the roles for deploying/deleting clusters:
```
# Change into the roles directory
cd ../roles/create_cluster/tasks

cat <<EOF> main.yaml
---
- name: create cluster
  google.cloud.gcp_container_cluster:
    name: "{{ cluster_name }}"
    initial_node_count: "{{ initial_node_count }}"
    location: "{{ zone }}"
    network: "{{ network.name }}"
    network_policy:
      enabled: true
      provider: "CALICO"
    project: "{{ project_id }}"
    auth_kind: serviceaccount
    service_account_file: "{{ credentials_file }}"
    state: present
  register: cluster

- name: create node pool
  google.cloud.gcp_container_node_pool:
    name: "node-pool-{{ cluster_name }}"
    initial_node_count: "{{ initial_node_count }}"
    cluster: "{{ cluster }}"
    config:
      disk_size_gb: "{{ disk_size_gb }}"
      disk_type: "{{ disk_type }}"
      machine_type: "{{ machine_type }}"
    location: "{{ zone }}"
    project: "{{ project_id }}"
    auth_kind: serviceaccount
    service_account_file: "{{ credentials_file }}"
    state: present
EOF

# Destroy cluster role
cd ../../destroy_cluster/tasks

cat <<EOF> main.yaml
---
- name: destroy cluster
  google.cloud.gcp_container_cluster:
    name: "{{ cluster_name }}"
    location: "{{ zone }}"
    project: "{{ project_id }}"
    auth_kind: serviceaccount
    service_account_file: "{{ credentials_file }}"
    state: absent
EOF


# Change back to the the ansible directory
cd ../../create-network/tasks

# Create the role to build a network in GKE
cat <<EOF> main.yaml
- name: create network
  google.cloud.gcp_compute_network:
    name: network-{{ cluster_name }}
    auto_create_subnetworks: 'true'
    project: "{{ project_id }}"
    auth_kind: serviceaccount
    service_account_file: "{{ credentials_file }}"
    state: present
  register: network
EOF

# Change to the destroy network role tasks
cd ../../destroy-network/tasks

# Create the role to destroy the network
cat <<EOF> main.yaml
- name: destroy GCP network
  google.cloud.gcp_compute_network:
    name: network-{{ cluster_name }}
    auto_create_subnetworks: 'true'
    project: "{{ project_id }}"
    auth_kind: serviceaccount
    service_account_file: "{{ credentials_file }}"
    state: absent
EOF

# Change to the base ansible directory
cd ../../.. 
```

## Create an ansible playbook
Now finally, lets leverage these roles in a playbook. We will actually create two playbooks, one for creating the cluster and one for destroying the cluster.

```
# Create cluster playbook
cat <<EOF> create-cluster.yaml
---
- name: deploy cluster
  hosts: localhost
  gather_facts: false
  environment:
    GOOGLE_CREDENTIALS: "{{ credentials_file }}"

  roles:
    - create-network
    - create-cluster
EOF

# Delete cluster playbook
cat <<EOF> destroy-cluster.yaml
---
- name: destroy infra
  hosts: localhost
  gather_facts: false
  environment:
    GOOGLE_CREDENTIALS: "{{ credentials_file }}"

  roles:
    - destroy-cluster
    - destroy-network
EOF

# go back to the base directory
cd ..
```

## Run the playbook
From the base directory of the repo, run the playbook.

Create the soak cluster
```
ansible-playbook ansible/create-cluster.yaml -i ansible/inventory/gcp.yaml 
```


Delete the soak cluster
```
ansible-playbook ansible/destroy-cluster.yaml -i ansible/inventory/gcp.yaml 
```

## Retrospective
This automation would be a lot easier using a bash script admittedly, in fact, it is a much more straight forward option. The only reason i would recommend using ansible here is if you have a larger usecase for automation other than simply spinning up environments. Ansible is great in configuring VMs, applications, you can even use it to create simple kubernetes operators. You could write an ansible playbook to deploy infrastructure and applications together. I never had a favorite between ansible and terraform but now I prefer ansible due to flexibility and functionality. 

## References
[Repo Source Code](https://github.com/cmwylie19/automate-gke-cluster)   
[Anisble GCE Guide](https://docs.ansible.com/ansible/latest/scenario_guides/guide_gce.html)


## Test
abcd