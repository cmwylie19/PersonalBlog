import React from "react"
import { Link } from "gatsby"
import Toggle from 'react-toggle'
import { rhythm, scale } from "../utils/typography"
import "./style.css"

const Layout = ({ theme, ThemeButton, location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  let header

  if (location.pathname === rootPath) {
    header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
  } else {
    header = (
      <h3
        style={{
          fontFamily: `Red Hat Display, sans-serif`,
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h3>
    )
  }
  return (
    <div style={{
      height: '100vh',
      backgroundColor: theme ? "#818181" : "#fbfbfb",
      width: '100% !important'
    }}>
      <div
        style={{
          backgroundColor: theme ? "#818181" : "#fbfbfb",
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <header>{header}</header>
        <main>{children}</main>
        <footer
          style={{
            fontFamily: `Red Hat Text, sans-serif`,
            textAlign: 'center'
          }}
        >
          © {new Date().getFullYear()}, Built by
        {` `}
          <a target="_blank" rel="noopener noreferrer" href="mailto:casewylie@gmail.com?subject=blog">Casey</a>
          {` `}<br />{ThemeButton}
        </footer>
      </div>
    </div>
  )
}

export default Layout
