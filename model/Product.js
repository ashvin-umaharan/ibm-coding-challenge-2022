#!/usr/bin/env node
'use strict'

export default class Product {
  constructor (code, packagingOptions) {
    this.code = code
    this.packagingOptions = packagingOptions
  }
}
