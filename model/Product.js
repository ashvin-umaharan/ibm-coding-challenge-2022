#!/usr/bin/env node
'use strict'

export default class Product {
  // constructor (code, count, price) {
  //   this.code = code
  //   this.count = count
  //   this.price = price
  // }

  constructor (object) {
    this.code = object.code
    this.count = object.count
    this.price = object.price
  }

  // set price (price) { this.price = price }

  // get price () {
  //   return this.price / 100.00
  // }
}
