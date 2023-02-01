---
title: Configure Istio Access Log JSON
date: "2021-08-31T22:40:32.169Z"
description: Configuring access logs in JSON format is easier than traditional log formats such as plain text because of its structured and machine-readable nature. JSON logs are easy to parse and extract specific data, making them well-suited for integration with other logging tools and services. Additionally, JSON logs can be easily scaled and distributed across multiple systems, allowing for better management and analysis of log data. Furthermore, JSON logs are flexible and can be extended to include additional fields as needed, providing a consistent format for log data and ensuring compatibility across different systems and tools. Overall, JSON format provides a more efficient, scalable, and flexible approach to logging.
---
![Access Logs](/access_log.png)  
When you are debugging network requests, the access logs should be one of the first places that you look.
   
The Istio docs say that,
> The simplest kind of Istio logging is Envoy’s access logging. Envoy proxies print access information to their standard output. The standard output of Envoy’s containers can then be printed by the kubectl logs command. 

I personally prefer my logs in JSON format, makes them easier to read and parse.
   
In this post, we'll how at two ways to configure the Istio Access Log. 

## Contents
- **Part 1** - Setting up the Access Log with Flags
- **Part 2** - Configuration through ConfigMap
- **Part 3** - Configuration through Helm values file

## Part 1 - Setting up the Access Log with Flags

When we configure access logs in Istio, we are actually configuring [Envoy Access Logging](https://www.envoyproxy.io/docs/envoy/latest/configuration/observability/access_log/usage).   
   
Access Log flags are referred to as `Command Operators` in Envoy. By definition, they are used to extract values that will be inserted into the access logs. I recommend having _at least_ the following Command Operators to make life easier when debugging requests in the access log.   

`%START_TIME%` - Request start time including milliseconds   
   
`%REQ(:METHOD)%` - Method used in request   
   
`%BYTES_RECEIVED%` - Body bytes received   
   
`%PROTOCOL%` - Protocol. Either HTTP/1.1 or HTTP/2 or HTTP/3     
   
`%RESPONSE_CODE%` - HTTP Response code, Note that a response code of 0 means that the sever never sent the beginning of the response. This generally means that the downstream client disconnected.   
   
`%RESPONSE_CODE_DETAILS%` - HTTP response code details provides additional info about the response code.
   
`%CONNECTION_TERMINATION_DETAILS%` - Connection termination details may provide additional information about why the connection was terminated by Envoy for L4 reasons.   
   
`%DURATION%` - Total duration in milliseconds of the request from the start time to the last byte out.   
   
`%RESPONSE_DURATION%` - Total duration in milliseconds of the request from the first byte read from the upstream host to the last byte sent downstream.   
   
`%RESPONSE_FLAGS%` - Additional details about the response or connection, if any. For TCP connections, the response codes mentioned in the descriptions do not apply. Possible values are:   
```
HTTP and TCP
UH: No healthy upstream hosts in upstream cluster in addition to 503 response code.   
UF: Upstream connection failure in addition to 503 response code.   
UO: Upstream overflow (circuit breaking) in addition to 503 response code.   
NR: No route configured for a given request in addition to 404 response code, or no matching filter chain for a downstream connection.   
URX: The request was rejected because the upstream retry limit (HTTP) or maximum connect attempts (TCP) was reached.   
NC: Upstream cluster not found.   
DT: When a request or connection exceeded max_connection_duration or max_downstream_connection_duration.   
   
HTTP only   
DC: Downstream connection termination.   
LH: Local service failed health check request in addition to 503 response code.   
UT: Upstream request timeout in addition to 504 response code.   
LR: Connection local reset in addition to 503 response code.   
UR: Upstream remote reset in addition to 503 response code.   
UC: Upstream connection termination in addition to 503 response code.   
DI: The request processing was delayed for a period specified via fault injection.   
FI: The request was aborted with a response code specified via fault injection.   
RL: The request was ratelimited locally by the HTTP rate limit filter in addition to 429 response code.   
UAEX: The request was denied by the external authorization service.   
RLSE: The request was rejected because there was an error in rate limit service.   
IH: The request was rejected because it set an invalid value for a strictly-checked header in addition to 400 response code.   
SI: Stream idle timeout in addition to 408 response code.   
DPE: The downstream request had an HTTP protocol error.   
UPE: The upstream response had an HTTP protocol error.   
UMSDR: The upstream request reached to max stream duration.   
OM: Overload Manager terminated the request.    
```   
`%ROUTE_NAME%` - Name of the route   
   
`%UPSTREAM_HOST%` - Upstream host URL   
   
`%DOWNSTREAM_REMOTE_ADDRESS%` - Remote address of the downstream connection   
   
`%DOWNSTREAM_LOCAL_URI_SAN%` - The URIs present in the SAN of the local certificate used to establish the downstream TLS connection.   


## Part 2 - Configuration through ConfigMap
To configure Access Logging in Istio, the `istio` `configmap` in `istio-system` must be edited. To illustrate this, lets start by installing Istio with the demo profile. After we learn how to edit the config map to get access logs, we are going to learn how to configure access logging through Helm so that you don't have to edit the config map everytime you install Istio.   

Spin up a local minikube cluster and install Istio using default profile.   
```
minikube start   

istioctl install --set profile=demo -y 
```

Look at the config map in `istio-system` called `istio`:
```
kubectl get cm istio -n istio-system -oyaml
```
The result will look similar to the output below. We are going to need to add `accessLogEncoding` and `accessLogFormat` to the `.data.mesh` section.   

```
# Original ConfigMap
apiVersion: v1
data:
  mesh: |-
    accessLogFile: /dev/stdout
    defaultConfig:
      discoveryAddress: istiod.istio-system.svc:15012
      proxyMetadata: {}
      tracing:
        zipkin:
          address: zipkin.istio-system:9411
    enablePrometheusMerge: true
    rootNamespace: istio-system
    trustDomain: cluster.local
  meshNetworks: 'networks: {}'
kind: ConfigMap
metadata:
  name: istio
  namespace: istio-system
```
 
The end state should look similar to the following below:
```
# Updated ConfigMap
apiVersion: v1
data:
  mesh: |-
    accessLogFile: /dev/stdout
    accessLogEncoding: JSON
    accessLogFormat: |
      {
            # Request start time including milliseconds.
            systemTime: '%START_TIME%'
            # Bytes Received in the request body
            bytesReceived: '%BYTES_RECEIVED%'
            # Request Method
            httpMethod: '%REQ(:METHOD)%'
            # Protocol. Currently either HTTP/1.1 or HTTP/2.
            protocol: '%PROTOCOL%'
            # HTTP response code. Note that a response code of ‘0’ means that the server never sent the
            # beginning of a response. This generally means that the (downstream) client disconnected.
            responseCode: '%RESPONSE_CODE%'
            # Total duration in milliseconds of the request from the start time to the last byte out
            clientDuration: '%DURATION%'
            # HTTP Response code details
            responseCodeDetails: '%RESPONSE_CODE_DETAILS%'
            # Connection termination details
            connectionTerminationDetails: '%CONNECTION_TERMINATION_DETAILS%'
            # Total duration in milliseconds of the request from the start time to the first byte read from the upstream host
            targetDuration: '%RESPONSE_DURATION%'
            # Value of the "x-envoy-original-path" header (falls back to "path" header if not present)
            path: '%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%'
            # Upstream cluster to which the upstream host belongs to
            upstreamName: '%UPSTREAM_CLUSTER%'
            # Unique tracking ID
            requestId: '%REQ(X-REQUEST-ID)%'
            # Response flags; will contain details about the response or connectiuon
            responseFlags: '%RESPONSE_FLAGS%'
            # Name of the route
            routeName: `%ROUTE_NAME%`
            # Remote address of the requester
            downstreamRemoteAddress: '%DOWNSTREAM_REMOTE_ADDRESS%'
            # Upstream host url
            upstreamHost: '%UPSTREAM_HOST%'
            # URIs present on the SAN of the local certificate used to establish downstream TLS
            downstreamLocalURISan: '%DOWNSTREAM_LOCAL_URI_SAN%'
      }
    defaultConfig:
      discoveryAddress: istiod.istio-system.svc:15012
      tracing:
        zipkin:
          address: zipkin.istio-system:9411
    enablePrometheusMerge: true
    rootNamespace: null
    trustDomain: cluster.local
  meshNetworks: 'networks: {}'
kind: ConfigMap
metadata:
  name: istio
  namespace: istio-system
```

Now, since we edited the config map that is attached to the Istio deployment in the `istio-system` namespace, we must roll the deployment to apply our changes.
```
kubectl rollout restart deploy/istio -n istio-system
```

That is it, that is all your need to configure an access log. The next will show how to accomplish the same through helm overrides.

## Part 3 - Configuration through Helm values file
A better approach would adhere to the principals of infrastructure as code and devops. In the previous example we installed Istio using a demo profile which is not recommended for production, and we would have to manually make these changes to the config map everytime we install Istio in order to achieve this result. A more sophistacated approach would be to install Istio through the helm chart.   

We are going to download the istio release and change into the directory
```
curl -L https://istio.io/downloadIstio | sh -
cd istio*
```

Install thge base chart which contains cluster-wide resources used by the istio control plane:
```
helm install istio-base manifests/charts/base -n istio-system
```

Edit the `manifests/charts/istio-control/istio-discovery/values.yaml` file, make sure the  `meshConfig` has `accessLogEncoding: JSON` and `accessLogFormat`. The final result of the `meshConfig` section should look exactly like the only below.
```
meshConfig:
  accessLogFile: /dev/stdout
  accessLogEncoding: JSON
  accessLogFormat: |
      {
            # Request start time including milliseconds.
            systemTime: '%START_TIME%'
            # Bytes Received in the request body
            bytesReceived: '%BYTES_RECEIVED%'
            # Request Method
            httpMethod: '%REQ(:METHOD)%'
            # Protocol. Currently either HTTP/1.1 or HTTP/2.
            protocol: '%PROTOCOL%'
            # HTTP response code. Note that a response code of ‘0’ means that the server never sent the
            # beginning of a response. This generally means that the (downstream) client disconnected.
            responseCode: '%RESPONSE_CODE%'
            # Total duration in milliseconds of the request from the start time to the last byte out
            clientDuration: '%DURATION%'
            # HTTP Response code details
            responseCodeDetails: '%RESPONSE_CODE_DETAILS%'
            # Connection termination details
            connectionTerminationDetails: '%CONNECTION_TERMINATION_DETAILS%'
            # Total duration in milliseconds of the request from the start time to the first byte read from the upstream host
            targetDuration: '%RESPONSE_DURATION%'
            # Value of the "x-envoy-original-path" header (falls back to "path" header if not present)
            path: '%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%'
            # Upstream cluster to which the upstream host belongs to
            upstreamName: '%UPSTREAM_CLUSTER%'
            # Unique tracking ID
            requestId: '%REQ(X-REQUEST-ID)%'
            # Response flags; will contain details about the response or connectiuon
            responseFlags: '%RESPONSE_FLAGS%'
            # Name of the route
            routeName: `%ROUTE_NAME%`
            # Remote address of the requester
            downstreamRemoteAddress: '%DOWNSTREAM_REMOTE_ADDRESS%'
            # Upstream host url
            upstreamHost: '%UPSTREAM_HOST%'
            # URIs present on the SAN of the local certificate used to establish downstream TLS
            downstreamLocalURISan: '%DOWNSTREAM_LOCAL_URI_SAN%'
      }
```

Now we can install the helm chart for the Istio control-plane:
```
helm install istiod manifests/charts/istio-control/istio-discovery \
    -n istio-system
```

Now, we install the chart for the Ingress gateway
```
helm install istio-ingress manifests/charts/gateways/istio-ingress \
    -n istio-system
```

This concludes the installation of Istio through the helm chart, now lets test by checking the `configmap/istio` in `istio-system` to verify that the config map was created properly.
```
kubectl get cm/istio -n istio-system -oyaml
```

If your config map has the accessLogFormat and accessLogEncoding then you have succeeded!

The End!