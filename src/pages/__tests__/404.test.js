import React from "react"
import * as Gatsby from 'gatsby';
import renderer from "react-test-renderer"
import NotFoundPage from "../404"

describe("404", () => {
  it("renders correctly", () => {
    const useStaticQuery = jest.spyOn(Gatsby, 'useStaticQuery');
    useStaticQuery.mockImplementation(() => ({
      site: {
        siteMetadata: {
          author: 'Case',
          description: 'Test Page',
          title: 'Test Component',
        },
      },
    }));
    let data = { site: { siteMetadata: { title: "test" } } }
    const tree = renderer
      .create(<NotFoundPage data={data} location="/" />)
      .toJSON()
    expect(tree).toMatchSnapshot()
  })
})