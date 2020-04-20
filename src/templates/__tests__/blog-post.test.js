import React from 'react'
import { mount, render, shallow } from 'enzyme'
import BlogPostTemplate from '../blog-post'
import * as Gatsby from "gatsby"


describe('BlogPostTemplate', () => {
  beforeEach(() => {
    const useStaticQuery = jest.spyOn(Gatsby, 'useStaticQuery');
    useStaticQuery.mockImplementation(() => ({
      site: {
        siteMetadata: {
          author: "Case",
          description: "Test Page",
          title: "Test Component",
          social: { twitter: "cmwylie19" }
        }
      }
    }))
  })
  it('mounts', () => {
    let data = {
      markdownRemark: {
        frontmatter: {
          title: "test"
        }
      },

      site: {
        siteMetadata: {
          title: "Test",
          social: {
            twitter: "cmwylie19"
          }
        }
      }
    }


    let pageContext = {
      next: "",
      previous: ""
    }

    shallow(<BlogPostTemplate pageContext={pageContext} data={data} location='/test' />)

  })
})