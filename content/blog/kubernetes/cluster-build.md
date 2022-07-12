---
title: Building a Kubernetes Cluster
date: "2022-05-21T16:42:32.169Z"
description: Building a 3 node Kubernetes 1.24 Cluster
---

# Kubernetes Cluster Build
I am rebuilding my Kubernetes cluster. I got a new [Rock Pi Plus Model B](https://www.amazon.com/dp/B095LGKP5J?psc=1&ref=ppx_yo2ov_dt_b_product_details) board a couple of days and I want to install Cilium as the pod networking solution so I have decided rather to rebuild from scratch with Kubeadm. 

The steps that I am taking to build can be broken down into the following:   
&nbsp;&nbsp;- Install Operatoring Systems, configure WiFi and SSH on nodes   
&nbsp;&nbsp;- Configure Networking on nodes     
&nbsp;&nbsp;- Install/Configure Containerd  
&nbsp;&nbsp;- Install/Configure Kubernetes Dependencies on Nodes  
&nbsp;&nbsp;- Install the Kubernetes Control Plane  
&nbsp;&nbsp;- Join the worker nodes  

### Install Operatating Systems, Configure WiFi and SSH on Nodes
To prepare the nodes, I have installed `Ubuntu 22.04 LTS` operating system. For the Rock Pi board, I had to download a special `rockpi4b_ubuntu_focal_server_arm64_20210823_2154-gpt.img` for the board, the Raspberry Pi 4 boards got regular `ubuntu-22.04-live-server-arm64.iso` images. I used `balenaEtcher` and `Raspberry Pi Imager` to burn the images to the SD cards.

Once the SD cards were ready, i booted the nodes with the images and configured Wifi.

For the Rock Pi, the process was done using `nmcli`. Details [here](https://wiki.radxa.com/Rockpi4/Ubuntu)
```
# open the WIFI
nmcli r wifi on

# Scan the WIFI
nmcli dev wifi

# connect to wifi
nmcli dev wifi connect "wifi_name" password "wifi_password"
```

For the Raspberry Pi, it was done through file configuration, details [here](https://linuxconfig.org/ubuntu-20-04-connect-to-wifi-from-command-line). Make sure this file looks the same, use `sudo` to edit `/etc/netplan/50-cloud-init.yaml`
```
# /etc/netplan/50-cloud-init.yaml
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    wifis:
        wlan0:
            dhcp4: true
            optional: true
            access-points:
              "wifi_ssid":
                 password: "wifi_password"
    ethernets:
        eth0:
            dhcp4: true
            optional: true
    version: 2
```
Then, after editing:
```
sudo netplan apply
```

Finally, configure `ssh`, in my case ssh was already configured. Check by running the following command:
```
ps aux | grep ssh 
```

Make sure you see `sshd` running.


### Configure Networking on Nodes
For the master and worker nodes to correctly see bridged traffic, you need to ensure `net.bridge.bridge-nf-call-iptables` is set to `1` in your config. First, ensure the `br_netfilter` is loaded, confirm by issuing the following on **each node**: 
```
lsmod | grep br_netfilter
```
You can load the module with the following:   
```
sudo modprobe br_netfilter overlay
```
   
Configure the bridge traffic:
```
cat <<EOF | sudo tee /etc/sysctl.d/kubernetes.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sudo sysctl --system
```

sudo tee /etc/modules-load.d/containerd.conf <<EOF
overlay
br_netfilter
EOF

### Install/Configure Containerd
sudo apt-get install docker-ce docker-ce-cli containerd.io 
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF
sudo  mkdir -p /etc/systemd/system/docker.service.d
sudo systemctl daemon-reload
sudo systemctl restart docker
sudo systemctl status docker.service

We need to install containerd on all of the nodes. 
```
sudo apt-get update
sudo apt-get install containerd -y
sudo mkdir -p /etc/containerd
sudo su -
containerd config default /etc/containerd/config.toml
```

Configure `systemd` cgroup driver
```
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml
```

The first change is to add a line to /etc/sysctl.conf. Open the file with the command:

sudo nano /etc/sysctl.conf

With that file open, add the following at the bottom:

net.bridge.bridge-nf-call-iptables = 1

Save and close the file.

Next, issue the commands:

sudo -s
sudo echo '1' > /proc/sys/net/ipv4/ip_forward
exit

Reload the configurations with the command:

sudo sysctl --system



### Install/Configure Kubernetes Dependencies on Nodes
Run the following commands to update the repositories and install the required packages.
```
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" >> ~/kubernetes.list
sudo mv ~/kubernetes.list /etc/apt/sources.list.d
sudo apt-get -y update
sudo apt-get install -y kubeadm=1.22.0-00 kubelet=1.22.0-00 kubectl=1.22.0-00
```

Disable swap memory:
```
sudo swapoff -a
```

Comment out `/swapfile` in `/etc/fstab`

**ONLY ROCK**
```bash
cat > /etc/sysctl.d/90-kubelet.conf << EOF
vm.overcommit_memory=1
kernel.panic=10
kernel.panic_on_oops=1
EOF
sysctl -p /etc/sysctl.d/90-kubelet.conf
```
### Install the Kubernetes Control Plane
We are now going to install Kubernetes on the controlplane with `kubeadm init`. We will use `10.244.0.0/16` for the pod network CIDR range, and the `apiserver-advertise-address` is the IP Address of the controlplane.
```
sudo kubeadm init --pod-network-cidr 10.244.0.0/16 --apiserver-advertise-address=192.168.1.196 --cri-socket /run/containerd/containerd.sock
```
Now, move the kubeconfig into the appropriate directory with the appropriate permissions. 
```
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

The output displays a join command. Save the output from that command, we will run it after we install the Pod Networking Solution, Cilium. (Do not execute yet)
```
kubeadm join 192.168.1.196:6443 --token xu45aw.4dbxyn7h21g5tljx \
	--discovery-token-ca-cert-hash sha256:1aa41fd1911c88a9e765ae245378db51ed98129aab727c3bacb0f68030d35cbc 
```

sudo rm /etc/containerd/config.toml



Install Calico CNI
```
https://projectcalico.docs.tigera.io/manifests/calico.yaml
            - name: CALICO_IPV4POOL_CIDR
              value: "10.142.0.0/24"


helm repo add cilium https://helm.cilium.io/
helm install cilium cilium/cilium --version 1.11.5 \
  --namespace kube-system
```

Get the taints from the nodes:
```
k describe no | grep -A8 Taints
```
output
```
Taints:             node-role.kubernetes.io/control-plane:NoSchedule
                    node-role.kubernetes.io/master:NoSchedule
Unschedulable:      false
Lease:
  HolderIdentity:  controlplane
  AcquireTime:     <unset>
```

Remove the controlplane taint
```
k taint no controlplane node-role.kubernetes.io/control-plane-
```



dpkg -l | grep cri-o

sudo hostnamectl set-hostname master

https://www.itzgeek.com/how-tos/linux/ubuntu-how-tos/install-containerd-on-ubuntu-22-04.html

https://devopstales.github.io/kubernetes/migrate-docker-to-containerd/


https://www.techrepublic.com/article/how-to-install-kubernetes-on-ubuntu-server-without-docker/


https://askubuntu.com/questions/1189480/raspberry-pi-4-ubuntu-19-10-cannot-enable-cgroup-memory-at-boostrap
sudo nano /boot/firmware/cmdline.txt
cgroup_enable=cpuset cgroup_enable=memory cgroup_memory=1

https://pixelrobots.co.uk/2021/03/building-a-raspberry-pi-kubernetes-cluster-on-ubuntu-20-04-using-kubeadm-and-containerd-as-the-runtime/

k label no node01 node-role.kubernetes.io/worker=worker
k label no node02 node-role.kubernetes.io/worker=worker


https://stackoverflow.com/questions/42705432/kubernetes-service-ips-not-reachable

https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/