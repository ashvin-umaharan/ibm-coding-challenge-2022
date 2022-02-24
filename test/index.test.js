#!/usr/bin/env node

/* LICENSE ACKNOWLEDGEMENTS

'Mocha' package license acknowledgement:
(The MIT License)

Copyright (c) 2011-2022 OpenJS Foundation and contributors, https://openjsf.org

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

'Chai' package license acknowledgement:
MIT License

Copyright (c) 2017 Chai.js Assertion Library

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import * as bakeryOms from '../bin/index.js'
import Product from '../model/Product.js'

chai.use(chaiAsPromised)
const expect = chai.expect

process.env.NODE_ENV = 'test'

const testRawInput = [
  { code: 'VS', count: '3', price: '699' },
  { code: 'VS', count: '5', price: '899' },
  { code: 'BM', count: '2', price: '995' },
  { code: 'BM', count: '5', price: '1695' },
  { code: 'BM', count: '8', price: '2495' },
  { code: 'CR', count: '3', price: '595' },
  { code: 'CR', count: '5', price: '995' },
  { code: 'CR', count: '9', price: '1699' }
]

const testInventory = [
  new Product('VS', [['3', '699'], ['5', '899']]),
  new Product('BM', [['2', '995'], ['5', '1695'], ['8', '2495']]),
  new Product('CR', [['3', '595'], ['5', '995'], ['9', '1699']])
]

const testReceipt = [
  { code: 'VS', packagingOptions: [[5, 899], [5, 899]], totalCost: 1798, lineSummary: [['5', 2]] },
  { code: 'BM', packagingOptions: [[2, 995], [2, 995], [2, 995], [8, 2495]], totalCost: 5480, lineSummary: [['2', 3], ['8', 1]] },
  { code: 'CR', packagingOptions: [[3, 595], [5, 995], [5, 995]], totalCost: 2585, lineSummary: [['3', 1], ['5', 2]] }
]

const testReceiptWithError = [
  { code: 'VS', packagingOptions: [], totalCost: 'N/A', lineSummary: [[]] },
  { code: 'BM', packagingOptions: [[2, 995], [2, 995], [2, 995], [8, 2495]], totalCost: 5480, lineSummary: [['2', 3], ['8', 1]] },
  { code: 'CR', packagingOptions: [[3, 595], [5, 995], [5, 995]], totalCost: 2585, lineSummary: [['3', 1], ['5', 2]] }
]

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
      await expect(bakeryOms.loadProducts('test/test_file_diff_column_names.csv')).to.eventually.deep.equal(testRawInput)
    })
    it('should accept a valid CSV with expected column names', async () => {
      await expect(bakeryOms.loadProducts('test/test_file.csv')).to.eventually.deep.equal(testRawInput)
    })
  })

  context('consolidateProducts()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.consolidateProducts).to.equal('function')
    })
    it('correctly groups packaging options for each product', function () {
      expect(bakeryOms.consolidateProducts(testRawInput)).to.deep.equal(testInventory)
    })
  })

  context('showInventory()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.showInventory).to.equal('function')
    })
    it('should show that the bakery is empty when the inventory is empty', function () {
      expect(bakeryOms.showInventory(null)).to.deep.equal('The bakery is empty')
    })
    it('should correctly output inventory when it is not empty', function () {
      expect(bakeryOms.showInventory(testInventory)).to.deep.equal(
        'VS, options: 3 x $6.99, 5 x $8.99\nBM, options: 2 x $9.95, 5 x $16.95, 8 x $24.95\nCR, options: 3 x $5.95, 5 x $9.95, 9 x $16.99\n')
    })
  })
})

describe('2. Orders functionality', function () {
  context('isValidOrder()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.isValidOrder).to.equal('function')
    })
    it('should correctly detect valid orders', function () {
      expect(bakeryOms.isValidOrder('VS 10 BM 14 CR 13', testInventory)).to.be.true
    })
    it('should correctly detect invalid order with missing quantity', function () {
      expect(bakeryOms.isValidOrder('VS 10 BM 14 CR', testInventory)).to.be.false
    })
    it('should correctly detect invalid order with a zero quantity', function () {
      expect(bakeryOms.isValidOrder('VS 10 BM 0 CR 13', testInventory)).to.be.false
    })
    it('should correctly detect invalid order with negative quantity', function () {
      expect(bakeryOms.isValidOrder('VS 10 BM 14 CR -5', testInventory)).to.be.false
    })
    it('should correctly detect invalid order with invalid product code', function () {
      expect(bakeryOms.isValidOrder('VS 10 BM 14 CM 13', testInventory)).to.be.false
    })
  })

  context('formatOrder()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.formatOrder).to.equal('function')
    })
    it('should correctly format valid orders', function () {
      expect(bakeryOms.formatOrder('VS 10 BM 14 CR 13')).to.deep.equal([
        ['VS', 10],
        ['BM', 14],
        ['CR', 13]
      ])
    })
  })

  context('prepareOrder()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.prepareOrder).to.equal('function')
    })
    it('handles orders where no valid package combinations exist', function () {
      expect(bakeryOms.prepareOrder([
        ['VS', 1],
        ['BM', 14],
        ['CR', 13]
      ], testInventory)).to.deep.equal(testReceiptWithError)
    })
    it('creates an optimal receipt for order without duplicate products', function () {
      expect(bakeryOms.prepareOrder([
        ['VS', 10],
        ['BM', 14],
        ['CR', 13]
      ], testInventory)).to.deep.equal(testReceipt)
    })
    // it('creates an optimal receipt for order with duplicate products', function () {
    //   expect(bakeryOms.prepareOrder([
    //     ['VS', 10],
    //     ['BM', 14],
    //     ['CR', 13],
    //     ['VS', 5]
    //   ], testInventory)).to.deep.equal([
    //     { 'VS': [[ 5, 899 ], [ 5, 899 ], [ 5, 899 ]] },
    //     { 'BM': [[ 2, 995 ], [ 2, 995 ], [ 2, 995 ], [ 8, 2495 ]] },
    //     { 'CR': [[ 3, 595 ], [ 5, 995 ], [ 5, 995 ]] }
    //   ])
    // })
  })
  context('printReceipt()', function () {
    it('should be of type function', function () {
      expect(typeof bakeryOms.printReceipt).to.equal('function')
    })
    it('should correctly produce a receipt for an order with valid combinations', function () {
      expect(bakeryOms.printReceipt(testReceipt)).to.deep.equal(
        'VS, $17.98, packages: 2x5\nBM, $54.8, packages: 3x2, 1x8\nCR, $25.85, packages: 1x3, 2x5\n')
    })
    it('should correctly produce a receipt for an order with invalid combinations', function () {
      expect(bakeryOms.printReceipt(testReceiptWithError)).to.deep.equal(
        'VS, N/A, packages: no valid combination of packages exist - please contact bakery for a custom order\nBM, $54.8, packages: 3x2, 1x8\nCR, $25.85, packages: 1x3, 2x5\n')
    })
  })
})
