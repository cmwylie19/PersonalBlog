import React from "react"
import { Link } from "gatsby"
import { rhythm, scale } from "../utils/typography"
import ThemeButton from "./ThemeToggle"
import "./style.css"

const Layout = ({
  dark,
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
      <h2
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
          fontFamily: `'Montserrat', sans-serif`,
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
      </h2>
    )
  } else {
    header = (
      <h2
        style={{
          fontFamily: `'Montserrat', sans-serif`,
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
      </h2>
    )
  }
  return (
    <div
      style={{
        height: "100vh",
        width: "100% !important",
        color: dark ? "#333" : "inherit"
        // color: theme ? "inherit" : "black",
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
        <header
          style={{
            fontFamily: "Montserrat",
            color: "YellowGreen",
          }}
        >
          {header}
        </header>
        <main style={{color: dark ? "#333" : "inherit"}}>{children}</main>
        <footer
          style={{
            fontFamily: `'Montserrat', sans-serif`,
            textAlign: "center",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px"
          }}
        >
          © {new Date().getFullYear()}, 
          {` `}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linkedin.com/in/casewylie/"
          >
            Casey Wylie
          </a>
        </footer>
        {/* <ThemeButton toggleTheme={toggleTheme} dark={dark} /> */}
       {location.pathname == "/" && <ThemeButton toggleTheme={toggleTheme} dark={dark} /> }
      </div>
    </div>
  )
}

export default Layout
