import React, { useState } from "react"
import { Link, graphql } from "gatsby"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { rhythm } from "../utils/typography"

const BlogIndex = ({ data, location, ...props }) => {
  const [dark, setdark] = useState(false)
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.edges
  const setStyle = () => {
    setdark(!dark)
    
    if (dark) {
      document.body.style="background-color: #8a8a8a"
    } else {
      document.body.style="background-color: inherit"
    }
  }
  React.useEffect(()=>setStyle(),[])
  return (
 
    <Layout
      {...props}
      location={location}
      dark={dark}
      toggleTheme={() => setStyle()}
      title={siteTitle}
    >
      <SEO title="All posts" />
      <Bio dark={dark} />
      {posts.map(({ node }) => {
        const title = node.frontmatter.title || node.fields.slug
        return (
          <article key={node.fields.slug} >
            <header>
              <h3
                style={{
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h3>
              <small style={{fontWeight: 750,color: dark?"inherit":"#fbfbfb"}}>{node.frontmatter.date}</small>
            </header>
            <section>
              <p
              style={{color: dark?"inherit":"#fbfbfb"}}
                dangerouslySetInnerHTML={{
                  __html: node.frontmatter.description || node.excerpt,
                }}
              />
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
