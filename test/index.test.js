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
      expect(bakeryOms.fileExists('/Users/ashvinumaharan/Documents/ibm-coding-challenge-2022/test/test_file_invalid.csv')).to.equal(true)
    })
  })

  context('loadProducts()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.loadProducts).to.equal('function')
    })
    it('should reject an invalid CSVs with inconsistent delimiters', async () => {
      await expect(bakeryOms.loadProducts('/Users/ashvinumaharan/Documents/ibm-coding-challenge-2022/test/test_file_invalid.csv')).to.be.rejected
    })
    it('should reject a valid CSV with columns greater than or less than 3', async () => {
      await expect(bakeryOms.loadProducts('/Users/ashvinumaharan/Documents/ibm-coding-challenge-2022/test/test_file_missing_column.csv')).to.be.rejected
    })
    it('should accept a valid CSV with different column names', async () => {
      await expect(bakeryOms.loadProducts('/Users/ashvinumaharan/Documents/ibm-coding-challenge-2022/test/test_file_diff_column_names.csv')).to.eventually.deep.equal([
        new Product({ code: 'VS', count: '3', price: '699' }),
        new Product({ code: 'VS', count: '5', price: '899' }),
        new Product({ code: 'BM', count: '2', price: '995' })
      ])
    })
    it('should accept a valid CSV with expected column names', async () => {
      await expect(bakeryOms.loadProducts('/Users/ashvinumaharan/Documents/ibm-coding-challenge-2022/test/test_file.csv')).to.eventually.deep.equal([
        new Product({ code: 'VS', count: '3', price: '699' }),
        new Product({ code: 'VS', count: '5', price: '899' }),
        new Product({ code: 'BM', count: '2', price: '995' })
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
    it('correctly grouping packaging options for each product', function () {
      expect(bakeryOms.showInventory([
        new Product({ code: 'VS', count: '3', price: '699' }),
        new Product({ code: 'VS', count: '5', price: '899' }),
        new Product({ code: 'BM', count: '2', price: '995' })
      ])).to.deep.equal({
        VS: ['3 x $6.99', '5 x $8.99'],
        BM: ['2 x $9.95']
      })
    })
  })
})
