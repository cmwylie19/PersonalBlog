import React from "react"
import Toggle from "react-toggle"

export default props => (
  <div style={{ display: "flex", justifyContent: "center" }}>
    {props.theme ? "Light  " : "Dark "}
    <div style={{ width: "10px" }}></div>{" "}
    <Toggle
      defaultChecked={props.theme}
      aria-label="Toggle Theme"
      onChange={props.toggleTheme}
    />
  </div>
)
