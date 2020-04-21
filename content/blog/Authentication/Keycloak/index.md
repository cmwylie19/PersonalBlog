---
title: KeyCloak Overview
date: "2020-04-20T22:40:32.169Z"
description: Using KeyCloak in Application Development
---

## KeyCloak Guide
This guide aims to outline several key functionalities in keycloak pertinent to application develop and infrastrucutre securities.

### Quickstart from Docker

> docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2 jboss/keycloak

### Creating a realm
- go to http://localhost:8080/auth/admin and login using admin for the username and admin for the password.

Scroll over text "Master" on the top left and a dropdown menu will appear with button "Add Realm", click that. Next you will be presented with a text box to add the name of the realm, and click create. 

### Create a user
- From the left side menu, click Users
- On the right side, click the button "Add User"

