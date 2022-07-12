---
title: ETCD Encryption 
date: "2022-07-12T16:42:32.169Z"
description: Encrypting ETCD in Kubernetes
---

# ETCD Encryption
In this post, we will encrypt secrets at rest in ETCD. If someone were to get access to ETCD, they could read secrets directly compromising credentials and potentially allowing them to use our cloud keys and run up our infrastructure bill. We want to ensure that the secrets are encrypted in ETCD.

>&nbsp;&nbsp;- Read Secrets from ETCD  
&nbsp;&nbsp;- Encryption Configuration  
&nbsp;&nbsp;- Update the kube-apiserver      
&nbsp;&nbsp;- Test Solution  


## Read Secrets from ETCD
In this section, we will create a secret, and read it directly from ETCD. As ETCD requires credentials for communication, we will use `kube-apiserver` creds.

Lets first create a secret.

```bash
kubectl create secret generic test --from-literal=secret=reader
```

Now, lets grab the ETCD creds from the kube-apiserver
```bash
sudo cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep etcd
```

output
```yaml
    - --etcd-cafile=/etc/kubernetes/pki/etcd/ca.crt
    - --etcd-certfile=/etc/kubernetes/pki/apiserver-etcd-client.crt
    - --etcd-keyfile=/etc/kubernetes/pki/apiserver-etcd-client.key
    - --etcd-servers=https://127.0.0.1:2379
    - name: etcd-encrypt
      mountPath: /etc/kubernetes/etcd
      path: /etc/kubernetes/etcd
    name: etcd-encrypt
```

Lets read that secret directly from etcd, we are reading from the `default` namespace and the secret of `test`
```bash
sudo ETCDCTL_API=3 etcdctl --cert=/etc/kubernetes/pki/apiserver-etcd-client.crt --cacert=/etc/kubernetes/pki/etcd/ca.crt --key=/etc/kubernetes/pki/apiserver-etcd-client.key get /registry/secrets/default/test
```

output
```bash
/registry/secrets/default/test
k8s


v1Secret?
?
testdefault"*$9510b715-c847-46ae-be0e-8d0a612105aa2ʽ??z?c
kubectl-createUpdatevʽ??FieldsV1:/
-{"f:data":{".":{},"f:secret":{}},"f:type":{}}B
secretreaderOpaque"
```

We can see secretreader in plain text.


## Encryption Configuration 
The kube-apiserver process accepts an argument --encryption-provider-config that controls how API data is encrypted in etcd. The configuration is provided as an API named EncryptionConfiguration. An example configuration is provided below.

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - identity: {}
      - aescbc:
          keys:
            - name: key1
              secret: c2VjcmV0IGlzIHNlY3VyZQ==
```   
Save the file in `/etc/kubernetes/etcd/ec.yaml`

> This `EncryptionConfiguration` tells `kube-apiserver` to encrypt secrets with encryption method `aescbc`. The secret is a 32-byte random key base64 encoded, obtained by running `head -c 32 /dev/urandom | base64`


## Update the kube-apiserver
To load our `EncryptionConfiguration` in the kube-apiserver, we must accomplish three steps:
1. set `--encryption-provider-config` pointing to our `EncryptionConfiguration`
2. Load the into a volume using `hostPath` pointing to the directory of the file on the controlplane node
3. Create a `volumeMount` to mount the directory at `/etc/kubernetes/etcd`

**Step 1**
```yaml
spec:
  containers:
  - command:
    - kube-apiserver
    - --encryption-provider-config=/etc/kubernetes/etcd/ec.yam
```

**Step 2**
```yaml
    volumeMounts:
    - name: etcd-encrypt
      mountPath: /etc/kubernetes/etcd
```

**Step 3**
```yaml
  volumes:
  - hostPath:
      path: /etc/kubernetes/etcd
      type: DirectoryOrCreate
    name: etcd-encrypt
```

## Test Solution  
Finally, we test the solution, check if we can read secrets both in Kubernetes, and directly from etcd.

Lets start by creating another secret:
```bash
kubectl create secret generic test2 --from-literal=results=pass
```

Now, read the secret from `etcd` directly
```bash
sudo ETCDCTL_API=3 etcdctl --cert=/etc/kubernetes/pki/apiserver-etcd-client.crt --cacert=/etc/kubernetes/pki/etcd/ca.crt --key=/etc/kubernetes/pki/apiserver-etcd-client.key get /registry/secrets/default/test2
```

output
```bash
s/pki/apiserver-etcd-client.key get /registry/secrets/default/test2
/registry/secrets/default/test2
k8s:enc:aescbc:v1:key1:!F%9????_?n/?d9sCz?ʡ?x??W?}???A??g82d*?????_H?\D??s?w?|Y?݄s???%>??D0?.Zֱn
?4?????r[9??>L????bG?񮁈??&M'(?ňs?Giӵ? ??fj?NL
                                            ~Z???Tm????W:H1?(zH?1\?ՉYC?eTb????

2?????5B?'???????ML?l???`"???'!?4?%s?"??                                      ???-?ȯw_:*T
```

The data is clearly encrypted.

Now, check if we can read the secret in Kubernetes
```bash
kubectl get secret test2 -ojsonpath='{.data.results}' | base64 -d 
```

output
```
pass
```

ETCD is now encrypting secrets.


## Resources
- [Encrypting Secret Data at Rest](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)