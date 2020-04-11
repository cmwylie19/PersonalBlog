import React from "react"
import { shallow } from "enzyme"
import ThemeToggle from "../ThemeToggle"
import * as Gatsby from "gatsby"
describe("ThemeToggle", () => {
  it("renders correctly", () => {
    const tree = shallow(<ThemeToggle theme={true} toggleTheme={() => true} />)
    expect(tree).toBeDefined()
  })
})
