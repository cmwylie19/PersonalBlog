import React, { useState } from "react"
import { shallow, mount } from "enzyme"
import ThemeToggle from "../ThemeToggle"
import * as Gatsby from "gatsby"

const HOC = ({ element }) => {
  let [theme, setTheme] = useState(false)

  const toggleTheme = () => setTheme(!theme)

  return <element theme={theme} toggleTheme={() => toggleTheme()} />
}
describe("ThemeToggle", () => {
  it("renders correctly", () => {
    let theme = false
    const tree = shallow(
      <ThemeToggle theme={theme} toggleTheme={() => theme} />
    )
    console.log(tree.text())
    expect(tree).toBeDefined()
    expect(tree.length).toBe(1)
    expect(tree.text()).toBe("Dark ")
    tree.find("#toggle").simulate("change")
  })
})
