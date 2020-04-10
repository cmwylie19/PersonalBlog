# BligBlogger ![Greetings](https://github.com/cmwylie19/BligBlogger/workflows/Greetings/badge.svg)

README.md 
# Keycloak Setup for Authentication

### Spin up Keycloak Container
```
docker run -d -p 8080:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2 jboss/keycloak
```

Open keycloak instance [http://localhost:8080/auth](keycloak instance) and login 
- username=admin
- password=admin


### `Upload the realm-export.json`
- In the keycloak admin console, scroll over the to left side where it says "master", a click the button that appears, "add realm".

- When you open the add realm page  you will a button that says *Import*, select file, select the realm-export.json file from the root directory of this project 
> realm-export.json

Now, run the app locally and you should see the keycloak admin screen, you can choose to *register a new user* if you do not yet have one.

### Keycloak Fix
- First try shutting down the backend docker container and running locally. If that does not work, try this:
- Backend: comment app.module.ts lines 25-30 (`export class AppModule implements NestModule`) and insert `export class AppModule {}`
- Frontend: comment utils/API.tsx lines 3-6, 14-16 and restart app, then uncomment those lines and restart app again

### To Access backend data from postman
- bypass keycloak auth by commenting out app.module.ts lines 25-30 (`export class AppModule implements NestModule`) and insert `export class AppModule {}
