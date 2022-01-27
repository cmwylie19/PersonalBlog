import React from "react"
import Toggle from "react-toggle"

const ThemeToggle = ({theme, toggleTheme}) => (
  <div id="theme" style={{display: "flex", justifyContent: "center" }}>
     
    <div style={{ width: "10px" }}></div>{" "}
    <Toggle
      id="toggle"
      defaultChecked={theme}
      aria-label="Toggle Theme"
      onChange={toggleTheme}
    />
  </div>
)
export default ThemeToggle
