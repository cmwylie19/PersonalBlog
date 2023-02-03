---
title: Expose Metrics from NGINX Webserver in Kubernetes
date: "2023-02-03T23:42:32.169Z"
description: Prometheus-style metrics are important for frontends because they allow for real-time monitoring and analysis of application performance. This helps frontend developers identify and diagnose issues quickly and efficiently, and make informed decisions about how to optimize the user experience.
---

## TL;DR
The Kubernetes Gateway API can be "implemented" by several `GatewayClasses` (controllers), similarly how `StorageClasses` work in `PersistentVolumeClaims`. The Kubernetes Gateway API is used to interface with the underlying controller which implements the logic and reports back via the Gateway API.  

  
  
Skip the "Background" if you already know about the envoy proxy and the Kubernetes Gateway API.

## Background

> **THE Envoy Proxy-** [Envoy](envoyproxy.io) the open source edge and service proxy developed by Lyft and is the proxy seen in the sidecars and at the [Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/) in Istio. It provides features such as traffic management, load balancing, service discovery, and security to microservices and service mesh architecture. Envoy can be deployed as a standalone proxy or as a sidecar, running alongside each service instance in a service mesh as seen in Istio. It allows for a flexible and dynamic configuration (no restarts required), making it a popular choice for modern, cloud-native applications. It has a ton of capabilities, also, for instance it can translate gRPC streamsto HTTP and can be extended with WASM.

- Presentation on [Envoy](https://docs.google.com/presentation/d/17_IBwR4EoDFQ67o1lq-vzJQ8-lY_We_j5BPpPfi0JvU/edit?usp=sharing)

> **Kubernetes Gateway API** is a Kubernetes sig-network managed project that adds `GatewayClass`,`Gateway`, `HTTPRoute`, `TCPRoute` and more to Kubernetes create more expressive, extensible, role-oriented service networking. It can be implemented by a number of `Inglress Controllers` included NGINX, HAProxy, Kong, also other Envoy based controllers like Gloo, Ambassador, and Contour. 

![Architecture, Site: k8s.io](https://gateway-api.sigs.k8s.io/images/api-model.png)


## Prereqs
Spin up kind cluster running Kubernetes `1.25`

```bash
kind create cluster --name=envoy-gateway  --image "kindest/node:v1.25.3"
```

Install the Envoy Proxy and required CRDs:
```bash
kubectl apply -f https://github.com/envoyproxy/gateway/releases/download/v0.2.0/install.yaml
```

Wait for the envoy-gateway deployment to be Available
```bash
kubectl wait --timeout=5m -n envoy-gateway-system deployment/envoy-gateway --for=condition=Available
```


----           
Install CRDs for:
- `envoyproxies.config.gateway.envoyproxy.io`
- `gatewayclasses.gateway.networking.k8s.io`
- `gateways.gateway.networking.k8s.io`
- `httproutes.gateway.networking.k8s.io`
- `referencegrants.gateway.networking.k8s.io`
- `referencepolicies.gateway.networking.k8s.io`
- `tcproutes.gateway.networking.k8s.io`
- `tlsroutes.gateway.networking.k8s.io`
- `udproutes.gateway.networking.k8s.io`
## Clean Up

Delete the kind cluster used in the post

```bash
kind delete cluster --name=envoy-gateway 
```

## Resources
- [Envoy Gateway](https://gateway.envoyproxy.io/v0.2.0)
- [Envoy Gateway GitHub](https://github.com/envoyproxy/gateway/)
- [Envoy Gateway QuickStart](https://gateway.envoyproxy.io/v0.2.0/user/quickstart.html)