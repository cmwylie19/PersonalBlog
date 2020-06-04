---
title: Store previous state in a ref in ReactJS
date: "2020-04-10T22:40:32.169Z"
description: How to store previous state using a ref in ReactJS
---

## State Versioning

Dealing state changes can get messy when adding layers of complexity on top of the initial state change to determine if the current state of the object is different that the initial state. There are plenty of ways to go about it, namely creating an object with a key called previousState and assigning the current state to it on changes before updating the current state to the new value, but lets say in this case you are not allowed to take that route.

Suppose you are creating an app to track status updates. You are presented with a text box which is prepopulated with the current status and you can make changes to that text box and submit it and it let all subscribers know that a status has been made.

So, how can you provide logic to verify that the value of the text that you submitted is different than the initial value, assuming the previous version of the status is erased and updated as soon as you change the entry in the text field?

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
