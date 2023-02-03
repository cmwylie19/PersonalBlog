---
title: Expose Metrics from NGINX Webserver in Kubernetes
date: "2023-02-03T23:42:32.169Z"
description: Expose your React metrics... Prometheus-style metrics are important for frontends because they allow for real-time monitoring and analysis of application performance. This helps frontend developers identify and diagnose issues quickly and efficiently, and make informed decisions about how to optimize the user experience.
---

_React is my JS framework of choice. I deploy my react-apps behind an NGINX proxy which serves the build folder of the react app. This guide shows how to scrape NGINX proxy metrics._ 


## MultiStage Dockerfile

I use a multistage `Dockerfile` to install the dependecies and build the code in the first stage, in the second stage add the built code and the nginx config to the image. 


```bash
# Frontend UI running in NGINX
FROM node AS builder
LABEL description="KubeFS-Web" \
      maintainer="Casey Wylie casewylie@gmail.com"
# Set working directory
WORKDIR /app
# Copy all files from current directory to working dir in image
COPY . .
# install node modules and build assets
RUN npm i && npm run build 

# nginx state for serving content
FROM nginx
#FROM arm64v8/nginx
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
```
--
In the `nginx.conf` `stub_status` is defined. This means at `/nginx_status` we will be serving NGINX style metrics. 

```bash
server { 
  listen 80;
  server_name kubefs-web;
  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    root /usr/share/nginx/html;
    try_files $uri /index.html;
    proxy_set_header Host $host;
  }
  location /.(*)$ {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    root /usr/share/nginx/html;
    try_files $uri /index.html;
    proxy_set_header Host $host;
  }

  location /nginx_status {
    # Choose your status module

    # freely available with open source NGINX
    stub_status;
    
    # ensures the version information can be retrieved
    server_tokens on;
  }
}
```
--  
Now we need to run `nginx/nginx-prometheus-exporter` as a sidecar and scrape to the `/nginx_status` endpoint of the NGINX container which will export the metrics prometheus style metrics.

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: nginx
  name: nginx
spec:
  containers:
  - image: nginx/nginx-prometheus-exporter
    name: exporter
    args: ["-nginx.scrape-uri=http://localhost:80/nginx_status"]
    ports:
    - name: metrics
      containerPort: 9113
  - image: cmwylie19/test_nginx_metrics
    name: nginx
    ports:
    - containerPort: 80
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
```

Assume you build the container and called it . We deploy the sidecar with the `nginx-prometheus-exporter` container beside the `cmwylie19/test_nginx_metrics` container and tell it to scrape `http://localhost:80/nginx_status` which is the endpoint of the NGINX style metrics.   

## Demo

Deploy the nginx pod and service.      
```bash
k apply -f -<<EOF
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: nginx
  name: nginx
spec:
  containers:
  - image: nginx/nginx-prometheus-exporter
    name: exporter
    args: ["-nginx.scrape-uri=http://localhost:80/nginx_status"]
    ports:
    - name: metrics
      containerPort: 9113
  - image: cmwylie19/test_nginx_metrics
    name: nginx
    ports:
    - containerPort: 80
    resources: {}
  dnsPolicy: ClusterFirst
  restartPolicy: Always
status: {}
---
apiVersion: v1
kind: Service
metadata:
  labels:
    run: nginx
  name: nginx
spec:
  ports:
  - port: 9113
    protocol: TCP
    targetPort: 9113
  selector:
    run: nginx
  sessionAffinity: None
  type: ClusterIP
EOF
```

Port forward the service to locally to port 3333.   

```bash
k port-forward svc/nginx 3333:9113
```

in another terminal, curl the `/metrics` endpoint


```bash
✗ curl http://127.0.0.1:3333/metrics
# HELP nginx_connections_accepted Accepted client connections
# TYPE nginx_connections_accepted counter
nginx_connections_accepted 6
# HELP nginx_connections_active Active client connections
# TYPE nginx_connections_active gauge
nginx_connections_active 1
# HELP nginx_connections_handled Handled client connections
# TYPE nginx_connections_handled counter
nginx_connections_handled 6
# HELP nginx_connections_reading Connections where NGINX is reading the request header
# TYPE nginx_connections_reading gauge
nginx_connections_reading 0
# HELP nginx_connections_waiting Idle client connections
# TYPE nginx_connections_waiting gauge
nginx_connections_waiting 0
# HELP nginx_connections_writing Connections where NGINX is writing the response back to the client
# TYPE nginx_connections_writing gauge
nginx_connections_writing 1
# HELP nginx_http_requests_total Total http requests
# TYPE nginx_http_requests_total counter
nginx_http_requests_total 12
# HELP nginx_up Status of the last metric scrape
# TYPE nginx_up gauge
nginx_up 1
# HELP nginxexporter_build_info Exporter build information
# TYPE nginxexporter_build_info gauge
nginxexporter_build_info{arch="linux/amd64",commit="e4a6810d4f0b776f7fde37fea1d84e4c7284b72a",date="2022-09-07T21:09:51Z",dirty="false",go="go1.19",version="0.11.0"} 1
```