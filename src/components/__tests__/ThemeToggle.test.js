import React from "react"
import renderer from "react-test-renderer"

import ThemeToggle from "../ThemeToggle"

describe("Header", () => {
  it("renders correctly", () => {
    const tree = renderer
      .create(<ThemeToggle theme={true} toggleTheme={() => true} />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})