import React from "react"
import Toggle from "react-toggle"

const ThemeToggle = ({theme, toggleTheme}) => (
  <div id="theme" style={{ color: theme?"inherit":"#fbfbfb",display: "flex", justifyContent: "center" }}>
    {theme ? "Light" : "Dark"}
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
