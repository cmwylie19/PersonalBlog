import React from 'react'
import { shallow } from 'enzyme'
import typography from '../typography'

describe("Typography", () => {
  it("renders", () => {
    shallow(<typography />)
  })
})