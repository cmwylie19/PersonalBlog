import React, { useEffect } from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm, scale } from "../utils/typography"
import API from "../utils/Api"
import Bio from "../components/bio"

const BlogPostTemplate = ({ data, pageContext, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext

  useEffect(() => {
    const api = new API(`${process.env.REACT_APP_METRICS_EP}`)
    api.recordPost(location.pathname)
  }, [])

  return (
    <Layout location={location} title={siteTitle}>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article>
        <header>
          <h3
            style={{
              marginTop: rhythm(1),
              marginBottom: 0,
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {post.frontmatter.title}
          </h3>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            {post.frontmatter.date}
          </p>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <b>Description: </b>
            {post.frontmatter.description}
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <Bio />
        </footer>
      </article>

      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link
                to={previous.fields.slug}
                rel="prev"
                style={{
                  fontFamily: `'Montserrat', sans-serif`,
                }}
              >
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link
                to={next.fields.slug}
                rel="next"
                style={{
                  fontFamily: `'Montserrat', sans-serif`,
                }}
              >
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
