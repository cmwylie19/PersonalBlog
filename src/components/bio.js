import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"
// import Twitter from './twitter.png'
import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/avatar.jpg/" }) {
        childImageSharp {
          fixed(width: 150, height: 150) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  const { author, social } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 150,
          // borderRadius: `15px`
        }}
        imgStyle={{
          borderRadius: `16px`,
        }}
      />
      <p>
        {author.summary}
        {` `}
      </p>
    </div>
  )
}

export default Bio
