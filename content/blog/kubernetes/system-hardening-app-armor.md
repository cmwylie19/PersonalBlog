---
title: System Hardening with App Armor
date: "2022-05-28T16:42:32.169Z"
description: App Armor custom profile demo 
---

# Cluster Hardening
Applications running in the user space make Syscalls to interact with the Kernel and underlying hardware. In this post we will look at restricting calls made from the user space to the kernel using custom seccomp profiles loaded onto a node to pods and containers.

>&nbsp;&nbsp;- Anatomy of a Seccomp Profile   
&nbsp;&nbsp;- How to use Seccomp Profiles in Kubernetes     
&nbsp;&nbsp;- Using custom Seccomp Profiles   
&nbsp;&nbsp;- Restricting access using AppArmor   


## Anatomy of a Seccomp Profile
Seccomp profiles can be categorized as "whitelist" or "blacklist" profiles and consist of 3 elements.

**defaultAction** - Default behavior for syscalls **not** defined in syscalls array.  
**architectures** - Define which systems the profile can be used on  
**syscalls** - Define array of syscalls and a default action (Allow or Deny)  

```json
{
  "defaultAction":"SCMP_ACT_ERRNO",
  "architectures": [
        "SCMP_ARCH_X86_64",
        "SCMP_ARCH_X86",
        "SCMP_ARCH_X32"
    ],
    "syscalls": [
        {
            "names": [
                "syscall-1",
                "syscall-2",
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
```

The above Seccomp profile is a "whitelist" profile, the default action blocks all syscalls not defined in the syscalls array, and allows those defined in the syscalls array.

A "blacklist" profile would use a `defaultAction` of allow, and use a "deny" action for the syscalls defined in the syscalls array.

We will focus on "whitelist" profiles for this demo as they are inherently more secure by being more restrictive _only_ allowing the syscalls defined in the syscalls array.

## How to use Seccomp Profiles in Kubernetes 
We have the ability to define the Seccomp profile used in our Kubernetes manifests through pods and containers `SecurityContext` field. Below we see a pod using the `RuntimeDefault` seccomp profile with the container's `securityContext` set to `allowPrivilegeEscalation: false`.
```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: demo
  name: demo
spec:
  securityContext: 
    seccompProfile:
      type: Localhost
      localhostProfile: profiles/custom-profile.json # <- in profiles dir
  containers:
  - image: nginx
    name: demo
    resources: {}
    securityContext: # <- disable privilege escalation
      allowPrivilegeEscalation: false
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```   

> When we run containers inside of Pods, there is a chance that the process running inside of the container can escalate privileges and potentially have more privileges than the parent process. It is a good idea to add `allowPrivilegeEscalation: false` in the container's security context to prevent privilege escalation.

By default, you have the options of using type `RuntimeDefault`, `Localhost`, or `Unconfined`.

## Using custom Seccomp Profiles
Check if the kernel in the host supports seccomp by checking the boot config file:
```
grep -i seccomp /boot/config-$(uname -r)
```
expected output
```bash
CONFIG_HAVE_ARCH_SECCOMP_FILTER=y
CONFIG_SECCOMP_FILTER=y
CONFIG_SECCOMP=y
```
Lets create a custom "whitelist" style seccomp profile that only allows the syscalls that we define in our syscalls array. Notice in this custom profile, there is no `mkdir` syscall whitelisted. _This command needs to be done on the controlplane node._

```json
sudo sh -c 'cat <<EOF> /var/lib/kubelet/seccomp/profiles/no-mkdir.json
{
    "defaultAction": "SCMP_ACT_ERRNO",
    "architectures": [
        "SCMP_ARCH_X86_64",
        "SCMP_ARCH_X86",
        "SCMP_ARCH_X32"
    ],
    "syscalls": [
        {
            "names": [
                "accept4",
                "epoll_wait",
                "pselect6",
                "futex",
                "madvise",
                "mkdir",
                "epoll_ctl",
                "getsockname",
                "setsockopt",
                "vfork",
                "mmap",
                "read",
                "write",
                "close",
                "arch_prctl",
                "sched_getaffinity",
                "munmap",
                "brk",
                "rt_sigaction",
                "rt_sigprocmask",
                "sigaltstack",
                "gettid",
                "clone",
                "bind",
                "socket",
                "openat",
                "readlinkat",
                "exit_group",
                "epoll_create1",
                "listen",
                "rt_sigreturn",
                "sched_yield",
                "clock_gettime",
                "connect",
                "dup2",
                "epoll_pwait",
                "execve",
                "exit",
                "fcntl",
                "getpid",
                "getuid",
                "ioctl",
                "mprotect",
                "nanosleep",
                "open",
                "poll",
                "recvfrom",
                "sendto",
                "set_tid_address",
                "setitimer",
                "writev"
            ],
            "action": "SCMP_ACT_ALLOW"
        }
    ]
}
EOF'
```

Now, lets create a pod that tries to run `mkdir` that uses this custom seccomp profile. This pod uses initContainers to prepare a custom site for nginx to serve.
```yaml
kubectl apply -f -<<EOF
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: demo
  name: demo
spec:
  securityContext:
    seccompProfile:
      type: Localhost
      localhostProfile: profiles/no-mkdir.json # should block mkdir
  initContainers:
  - image: nginx
    name: mkdir
    command: ["sh","-c","mkdir /usr/share/nginx/html"]
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
  - image: nginx
    name: html-page
    command: ["sh","-c","echo '<html><body><h1>Made Directory</h1></body></html>' > /usr/share/nginx/html/index.html"] 
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
  containers:
  - image: nginx
    name: demo
    ports:
    - containerPort: 80
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
    resources: {}
  volumes:
  - name: sites
    emptyDir: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
EOF
```

Lets look at the pod on the node
```text
NAME   READY   STATUS             RESTARTS      AGE
demo   0/1     CrashLoopBackOff   5 (34s ago)   3m43s
```

If we describe the pod, we can see the that there was an `operation not permitted` in the events, because this profile does not allowed mkdir.
```text
  Warning  Failed     6s (x2 over 9s)   kubelet            Error: failed to start container "mkdir": Error response from daemon: failed to create shim task: OCI runtime create failed: runc create failed: unable to start container process: error closing exec fds: ensure /proc/self/fd is on procfs: operation not permitted: unknown
```

Lets confirm our hypothesis that this syscall has been blocked on the `demo` pod by deleting and recreating the pod without the seccomp profile:
```yaml
kubectl delete po demo --force --grace-period=0
kubectl apply -f -<<EOF
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: demo
  name: demo
spec:
  securityContext: {}
  initContainers:
  - image: nginx
    name: mkdir
    command: ["sh","-c","mkdir /usr/share/nginx/html"]
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
  - image: nginx
    name: html-page
    command: ["sh","-c","echo '<html><body><h1>Made Directory</h1></body></html>' > /usr/share/nginx/html/index.html"] 
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
  containers:
  - image: nginx
    name: demo
    ports:
    - containerPort: 80
    volumeMounts:
    - name: sites
      mountPath: /usr/share/nginx/
    resources: {}
  volumes:
  - name: sites
    emptyDir: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
EOF
```

Now, lets check and make sure this pod was able to `mkdir` in order to serve a custom site.
```bash
kubectl wait --for=condition=ready pod -l run=demo 
kubectl exec -it demo -c demo -- curl localhost
```

output
```html
<html><body><h1>Made Directory</h1></body></html>
```

We have effectively demonstrated how to control syscalls that a pod makes by creating custom seccomp profiles.

## Restricting access using AppArmor 
In the last section, we saw how to implement Seccomp profiles to restrict access for a pod. However, _we cannot use seccomp profiles to restrict access to files or directories_. To implement fine-grained access control for a container, we will use *AppArmor*, which is used to expose a program only to a limited set of resources.


## Resources
- [Kubernetes - Restrict a Container's Syscalls with seccomp](https://kubernetes.io/docs/tutorials/security/seccomp/)