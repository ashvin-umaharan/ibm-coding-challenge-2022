/* */

import * as bakeryOms from '../bin/index.js'
import chai from 'chai'

const expect = chai.expect

describe('1. Load Products functionality', function () {
  context('check if load_products() exists', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.loadProducts).to.equal('function')
    })
  })
})
