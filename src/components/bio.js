import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/avatar.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
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
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
        Welcome, I'm Casey Wylie and this is where I live on the internet. I am a software engineer and I'm always traveling for work. I work on very large commercial projects related to application and
        infratructure development in clusters and distributed environments. I lived in Colombia for over five years and speak spanish, I'm passionate about equality, cars, my wife and I'm hoping to add a furry friend to the family soon.{" "}
        {/* <a href={`https://twitter.com/${social.twitter}`}>
          <strong>{author.name}</strong>
        </a> */}
        <br />
        {/* {author.summary} */}
        {` `}
      </p>
    </div>
  )
}

export default Bio
