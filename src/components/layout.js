import React from "react"
import { Link } from "gatsby"
import Toggle from "react-toggle"
import { rhythm, scale } from "../utils/typography"
import ThemeButton from "./ThemeToggle"
import "./style.css"

const Layout = ({
  theme,
  toggleTheme,
  location,
  title,
  children,
  ...props
}) => {
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
    <div
      style={{
        height: "100vh",
        width: "100% !important",
      }}
    >
      <div
        style={{
          height: "100vh",
          width: "100% !important",
          marginLeft: `auto`,

          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        <header style={{ color: theme ? "inherit" : "YellowGreen" }}>
          {header}
        </header>
        <main>{children}</main>
        <footer
          style={{
            fontFamily: `Red Hat Text, sans-serif`,
            textAlign: "center",
            color: theme ? "inherit" : "grey",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          © {new Date().getFullYear()}, Built by
          {` `}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="mailto:casewylie@gmail.com?subject=blog"
          >
            Casey
          </a>
          {` `}
          {location.pathname === rootPath ? (
            <ThemeButton toggleTheme={toggleTheme} theme={theme} />
          ) : (
            <Link
              style={{
                boxShadow: `none`,
                color: `inherit`,
              }}
              to={`/`}
            >
              <br />
              home
            </Link>
          )}
        </footer>
      </div>
    </div>
  )
}

export default Layout
