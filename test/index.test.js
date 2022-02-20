/* */

var bakery_oms = require('../bin/index.js');
var expect = require('chai').expect;

describe('1. Load Products functionality', function() {

  context('check if load_products() exists', function() {
    it('should be of type function', function() {
        expect(typeof bakery_oms.load_products).to.equal('function')
    })
  })
  
})