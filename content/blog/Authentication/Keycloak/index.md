---
title: KeyCloak Overview
date: "2020-04-20T22:40:32.169Z"
description: Using KeyCloak in Application Development
---

> ### This guide aims to outline several key functionalities in keycloak pertinent to _application develop_ and infrastrucutre securities.

### Table Of Contents
____
+ Spinning Up Keycloak
+ Getting familiar with the UI
  * Logging into the Admin Console
  * Creating a realm
  * Adding a user
  * Creating a Client (Application)
+ Locking down Applications

## Spin up Keycloak locally
___________________________

```
> docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2 jboss/keycloak
```



## Using the User Interface

_This part of the guide is focuses on getting to know your way around the keycloak admin interface_

#### Log into the console
____
Hit http://localhost:8080/auth/admin in your browser of choice and enter "admin" (no quotes) for both the username and password.
<br />

![Login](login.png "Login")


#### Creating a realm
______
_The realm in keycloak secures and manages security metadata for a set of users. If you have used Cognito it is comparable to the user pool_


Scroll over text "Master" on the top left and a dropdown menu will appear with button "Add Realm", click that. Next you will be presented with a text box to add the name of the realm, and click create. 
<br />

![Add realm](realm.png "Add realm")

### Create a user
___
There is also another wya to create a user in keycloak . 
- From the left side menu, click Users
- On the right side, click the button "Add User"
<br />


![Add user](user.png "Add user")


### Creating a Client
_____
_In keycloak, client refers to a client application_

We will go into more detail of creating a client in the _Locking down applications sector of the guide_.

- Login into the admin console
- Click clients in the left side menu 
- On the right hand side, click the create button
<br />


![Client Application](client.png "Create a client")


### Managing Tokens
___
- In the left side menu select Realm Settings 
- On the top menu of the realm settings select tokens 
<br />

![Mange Tokens](token.png "Manage tokens")

## Securing Applications 