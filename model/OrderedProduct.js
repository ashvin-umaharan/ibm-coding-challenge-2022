#!/usr/bin/env node
'use strict'

import Product from '../model/Product.js'

export default class OrderedProduct extends Product {
  constructor (code, selectedPackagingOptions) {
    super(code, selectedPackagingOptions)
    if (selectedPackagingOptions.length !== 0) {
      this.totalCost = this.#calculateTotalCost(selectedPackagingOptions.map(option => option[1]))
      this.lineSummary = this.#createLineSummary(selectedPackagingOptions.map(option => option[0]))
    } else {
      this.totalCost = "N/A"
      this.lineSummary = [[]]
    }
  }

  #calculateTotalCost(prices) {
   return prices.reduce((a, b) => a + b, 0)
  }

  #createLineSummary (orderedOptions) {
    const counter = {}
    orderedOptions.forEach(option => {
      if (!counter[option]) {
        counter[option] = 0
      }
      ++counter[option]
    })
    const counterArray = []
    for (const [name, value] of Object.entries(counter)) {
      counterArray.push([name, value]);
    }
    return counterArray
  }
}