---
title: Envoy Gateway Implementation of the Kubernetes Gateway API
date: "2023-02-02T23:42:32.169Z"
description: The Gateway API is a SIG-Network project being built to improve and standardize service networking in Kubernetes. Current and in-progress implementations include Contour, Emissary-Ingress (Ambassador API Gateway), Google Kubernetes Engine (GKE), Istio, Kong, Traefik and Envoy. This post takes the Envoy Gateway implementation for a spin on a kind cluster.
---

---
> **TOC** In this post we are going to:
- Talk about Envoy Gateway and the Kubernetes Gateway API
- Spin up a kind cluster
- Deploy the Envoy Gateway
- Learn how to use Envoy Gateway for common tasks


## TL;DR
Kubernetes Gateway is like the evolution of the Kubernetes Ingress. The Kubernetes Gateway API can be "implemented" by several `GatewayClasses` (controllers), similarly how `StorageClasses` define specific work in `PersistentVolumeClaims`. The Kubernetes Gateway API is used to interface with the underlying controller which implements the logic and reports back via the Gateway API.  

  
  
Skip the "Background" if you just want to kick the tires of the Envoy Gateway.

## Background

> **Envoy Proxy-** [Envoy](envoyproxy.io) the proxy seen in the sidecars and at the [Gateway](https://istio.io/latest/docs/reference/config/networking/gateway/) in Istio. It's powerful, fast, extendable, dynamically configured, and extremely feature rich.

- Presentation on [Envoy](https://docs.google.com/presentation/d/17_IBwR4EoDFQ67o1lq-vzJQ8-lY_We_j5BPpPfi0JvU/edit?usp=sharing)

> **Kubernetes Gateway API** is a Kubernetes sig-network managed project that adds `GatewayClass`,`Gateway`, `HTTPRoute`, `TCPRoute` and more to Kubernetes create more expressive, extensible, role-oriented service networking. It can be implemented by a number of `Gateway Controllers` included NGINX, HAProxy, Kong, also other Envoy based controllers like Gloo, Ambassador, and Contour. 

![Architecture, Site: k8s.io](https://gateway-api.sigs.k8s.io/images/api-model.png)


## Spin Up a Kind Cluster
Spin up kind cluster running Kubernetes `1.25`

```bash
kind create cluster --name=envoy-gateway  --image "kindest/node:v1.25.3"
```
--     
Install the Envoy Proxy and required CRDs:
```bash
kubectl apply -f https://github.com/envoyproxy/gateway/releases/download/v0.2.0/install.yaml
```
--  
Wait for the envoy-gateway deployment to be Available
```bash
kubectl wait --timeout=5m -n envoy-gateway-system deployment/envoy-gateway --for=condition=Available
```
--  
Patch the envoy-gateway service to be of type `NodePort`
```bash
k patch svc/envoy-gateway -n envoy-gateway-system --type='json' -p '[{"op":"replace","path":"/spec/type","value":"NodePort"}]'
```
## Deploy 

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