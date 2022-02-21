#!/usr/bin/env node

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import fs from 'fs'
import { parse } from 'csv-parse'
import Product from '../model/Product.js'

async function loadProducts (filePath) {
  try {
    const records = []
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        columns: true
      }))
    for await (const record of parser) {
      const newProduct = new Product(record)
      records.push(newProduct)
    }
    return records
  } catch (err) {
    console.error(err)
  }
}

async function run () {
  const rl = readline.createInterface({ input, output })

  let didQuit = false

  let inventoryData = null

  while (!didQuit) {
    const command = await rl.question('> ')
    switch (command) {
      case 'inventory':
        if (inventoryData === null) {
          console.log(chalk.yellow('The bakery is empty'))
        } else {
          console.log(inventoryData)
        }
        break

      case 'quit':
        console.log(chalk.grey('Closing program...'))
        didQuit = true
        rl.close()
        break

      default:
        if (command.startsWith('load ')) {
          inventoryData = await loadProducts(command.replace('load', '').trim())
          console.log(chalk.green('Loaded items successfully'))
        } else {
          console.log(chalk.red('Invalid command'))
        }
        break
    }
  }
}

run()

export {
  loadProducts
}
