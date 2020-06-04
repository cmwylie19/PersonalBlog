---
title: Custom Theming in Keycloak
date: "2020-04-20T22:40:32.169Z"
description: How to customize themes in keycloak
---

> ### This guide aims to teach how to create a custom theme in keycloak

## Step 1: Spin up the keycloak container

---

```
> docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2 jboss/keycloak
```

## Step 2: Docker exec into the container

```
> docker ps -a
```

![Containers](docker.png "See containers")

```
> docker exec -it 87c7567daf27 bash
```

![Containers](exec.png)

## Step 3: Go to the themes folder

```
> cd opt/jboss/keycloak/themes
```

_from here you have the choice to edit the base theme, which does not have default styling or the keycloak theme, which is not suggested in the keycloak docs, but i prefer it because it is a good starting point_

## Step 4:

assuming we are going to add on to the keycloak default theme

```
> cd keycloak
```

from here you have the choices of editing the following interfaces

- login
- email
- account
- welcome
- common
