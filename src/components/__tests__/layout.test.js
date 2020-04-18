import React from 'react'
import { shallow } from 'enzyme'
import Layout from '../layout'

describe('Layout Component', () => {
  it('renders', () => {
    const location = {
      pathname: "/"
    }
    let wrapper = shallow(<Layout location={location} />)
    expect(wrapper).toBeDefined()
  })
})