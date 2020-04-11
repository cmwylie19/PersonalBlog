import React from "react"
import Toggle from "react-toggle"

const ThemeToggle = props => (
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
export default ThemeToggle
