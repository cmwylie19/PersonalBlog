import React from "react"
import * as Gatsby from "gatsby"
import renderer from "react-test-renderer"
import NotFoundPage from "../404"

import { mount } from "enzyme"

describe("404", () => {
  var data
  beforeEach(() => {
    const useStaticQuery = jest.spyOn(Gatsby, "useStaticQuery")
    useStaticQuery.mockImplementation(() => ({
      site: {
        siteMetadata: {
          author: "Case",
          description: "Test Page",
          title: "Test Component",
          social: { twitter: "cmwylie19" },
        },
      },
    }))

    data = {
      site: {
        siteMetadata: { social: { twitter: "cmwylie19" }, title: "test" },
      },
    }
  })

  it("renders without crashing", () => {
    mount(<NotFoundPage data={data} location="/" />)
  })
  it("renders correctly", () => {
    const tree = renderer
      .create(<NotFoundPage data={data} location="/" />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})
