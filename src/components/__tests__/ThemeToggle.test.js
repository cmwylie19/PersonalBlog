import React from "react"
import { shallow, mount } from "enzyme"
import ThemeToggle from "../ThemeToggle"
import * as Gatsby from "gatsby"


describe("ThemeToggle", () => {

  it("renders correctly", () => {

    const tree = shallow(<ThemeToggle theme={false} />)
    expect(tree).toBeDefined();
    expect(tree.length).toBe(1);
  })
})
