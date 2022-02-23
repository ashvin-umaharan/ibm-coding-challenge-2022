#!/usr/bin/env node

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as bakeryOms from '../bin/index.js'
import Product from '../model/Product.js'

chai.use(chaiAsPromised)
const expect = chai.expect

process.env.NODE_ENV = 'test'

describe('1. Load Products functionality', function () {
  context('fileExists()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.fileExists).to.equal('function')
    })
    it('correctly detecting an invalid file path', function () {
      expect(bakeryOms.fileExists('../bin/test_file.csv')).to.equal(false)
    })
    it('correctly detecting a valid file path', function () {
      expect(bakeryOms.fileExists('test/test_file.csv')).to.equal(true)
    })
  })

  context('loadProducts()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.loadProducts).to.equal('function')
    })
    it('should reject an invalid CSVs with inconsistent delimiters', async () => {
      await expect(bakeryOms.loadProducts('test/test_file_invalid.csv')).to.be.rejected
    })
    it('should reject a valid CSV with columns greater than or less than 3', async () => {
      await expect(bakeryOms.loadProducts('test/test_file_missing_column.csv')).to.be.rejected
    })
    it('should accept a valid CSV with different column names', async () => {
      await expect(bakeryOms.loadProducts('test/test_file_diff_column_names.csv')).to.eventually.deep.equal([
        { code: 'VS', count: '3', price: '699' },
        { code: 'VS', count: '5', price: '899' },
        { code: 'BM', count: '2', price: '995' },
        { code: 'BM', count: '5', price: '1695' },
        { code: 'BM', count: '8', price: '2495' },
        { code: 'CR', count: '3', price: '595' },
        { code: 'CR', count: '5', price: '995' },
        { code: 'CR', count: '9', price: '1699' }
      ])
    })
    it('should accept a valid CSV with expected column names', async () => {
      await expect(bakeryOms.loadProducts('test/test_file.csv')).to.eventually.deep.equal([
        { code: 'VS', count: '3', price: '699' },
        { code: 'VS', count: '5', price: '899' },
        { code: 'BM', count: '2', price: '995' },
        { code: 'BM', count: '5', price: '1695' },
        { code: 'BM', count: '8', price: '2495' },
        { code: 'CR', count: '3', price: '595' },
        { code: 'CR', count: '5', price: '995' },
        { code: 'CR', count: '9', price: '1699' }
      ])
    })
  })

  context('consolidateProducts()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.consolidateProducts).to.equal('function')
    })
    it('correctly groups packaging options for each product', function () {
      expect(bakeryOms.consolidateProducts([
        { code: 'VS', count: '3', price: '699' },
        { code: 'VS', count: '5', price: '899' },
        { code: 'BM', count: '2', price: '995' },
        { code: 'BM', count: '5', price: '1695' },
        { code: 'BM', count: '8', price: '2495' },
        { code: 'CR', count: '3', price: '595' },
        { code: 'CR', count: '5', price: '995' },
        { code: 'CR', count: '9', price: '1699' }
      ])).to.deep.equal([
        new Product('VS', [['3', '699'], ['5', '899']]),
        new Product('BM', [['2', '995'], ['5', '1695'], ['8', '2495']]),
        new Product('CR',[['3', '595'], ['5', '995'], ['9', '1699']])
      ])
    })
  })

  context('showInventory()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.showInventory).to.equal('function')
    })
    it('should show that the bakery is empty when the inventory is empty', function () {
      expect(bakeryOms.showInventory(null)).to.deep.equal('The bakery is empty')
    })
    it('should show that the bakery is empty when the inventory is empty', function () {
      expect(bakeryOms.showInventory([
        new Product('VS', [['3', '699'], ['5', '899']]),
        new Product('BM', [['2', '995'], ['5', '1695'], ['8', '2495']]),
        new Product('CR',[['3', '595'], ['5', '995'], ['9', '1699']])
      ])).to.deep.equal(
        `VS, options: 3 x $6.99, 5 x $8.99\nBM, options: 2 x $9.95, 5 x $16.95, 8 x $24.95\nCR, options: 3 x $5.95, 5 x $9.95, 9 x $16.99\n`)
    })
  })
})

describe('2. Orders functionality', function () {
  context('prepareOrder()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.prepareOrder).to.equal('function')
    })
    it('creates an optimal order', function () {
      expect(bakeryOms.prepareOrder([
        ['VS', 10],
        ['BM', 14], 
        ['CR', 13]
      ], [
        new Product('VS', [['3', '699'], ['5', '899']]),
        new Product('BM', [['2', '995'], ['5', '1695'], ['8', '2495']]),
        new Product('CR',[['3', '595'], ['5', '995'], ['9', '1699']])
      ])).to.deep.equal([
        { 'VS': [[ 5, 899 ], [ 5, 899 ]] },
        { 'BM': [[ 2, 995 ], [ 2, 995 ], [ 2, 995 ], [ 8, 2495 ]] },
        { 'CR': [[ 3, 595 ], [ 5, 995 ], [ 5, 995 ]] }
      ])
    })
  })
})
