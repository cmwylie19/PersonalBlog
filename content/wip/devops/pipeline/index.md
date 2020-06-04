---
title: Building a pipeline
date: "2020-04-10T22:40:32.169Z"
description: Building a CICD pipeline for an application in Kubernetes
---

## Building a CI/CD pipeline that deliverys an app from repo into production environment.

The goal of this post is to teach you how to build a pipeline that will take an application from a repository to production. Aftwards, we will discuss relevent kubernetes and Jenkins configuration files to keep in your repository incase we want to tear it down and spin it back up. The build process integrates Gogs, which is an open source version of a GitHub, Nexus for storing large artifacts and built versions of code, SonarQube for static code analysis. We will use a Blue-Green [deployment strategy](http://localhost:8000/deployments/strategies) and cautiously shift traffic over to the new version.

```
function LastStateComponent() {
  const updateLastState = () => {
      sendState(lastState)
  };
  return (
    <>
      <input value={lastState} onChange={(e)=>setLastState(e.target.value)}  type="text" />
      <button onClick={updateLastState}>Submit</button>
    </>
  );
}
```

#### Mutable Refernce

A mutable ref object whose .current property is initialized to some initialValue passed in via function parameter. The returned object will persist for the full lifetime of the component.

```
function LastStateComponent() {
  const inputRef = useRef(null);
  const {originalState, setOriginalState} = useState();
  const prevState = usePrevious(count);

  return (
    <>
      <h1>Now: Modified {lastState === prevState} </h1>;
      <input value={originalState} onChange={(e)=>setOriginalState(e.target.value))} ref={inputRef} type="text" />
    </>
  );
}


function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
```

This is a clean and systematic approach to ensure you are only submitting changes to data that has changes from it's original state. Ya never know know when your app is going to call for something like that. Always good to have more than one tool in the toolbag.
