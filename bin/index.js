#!/usr/bin/env node

/* LICENSE ACKNOWLEDGEMENTS

'Chalk' package license acknowledgement:
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

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

'node-csv' package license acknowledgement:
The MIT License (MIT)

Copyright (c) 2010 Adaltas

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

import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import chalk from 'chalk'
import fs from 'fs'
import { parse } from 'csv-parse'
import Product from '../model/Product.js'

function fileExists (filePath) {
  if (fs.existsSync(filePath)) {
    return true
  } else {
    if (process.env.NODE_ENV !== 'test') {
      console.error(chalk.red('File not found'))
    }
    return false
  }
}

async function loadProducts (filePath) {
  const records = []
  try {
    const parser = fs
      .createReadStream(filePath)
      .pipe(parse({
        columns: ['code', 'count', 'price'],
        from_line: 2,
        skip_empty_lines: true,
        trim: true
      }))
    for await (const record of parser) {
      if (Object.keys(record).length === 3) {
        const newProduct = new Product(record)
        records.push(newProduct)
      } else {
        throw new Error('Number of columns is not equal to 3')
      }
    }
    return records
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(chalk.red(`File has formatting errors. ${err}`))
      console.error(chalk.yellow('Please provide a file where each line has the following format: '))
      console.error(chalk.yellow('<code>,<count>,<price>'))
    } else {
      throw err
    }
  }
}

function showInventory (inventory) {
  if (inventory === null) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.yellow('The bakery is empty'))
    } else {
      return 'The bakery is empty'
    }
  } else {
    const uniqueProductCodes = [...new Set(inventory.map(product => product.code))]
    const consolidatedInventory = uniqueProductCodes.reduce(function (options, uniqueProductCode) {
      options[uniqueProductCode] = []
      return options
    }, {})
    uniqueProductCodes.forEach((code) => {
      inventory.forEach((entry) => {
        if (entry.code === code) {
          consolidatedInventory[code].push(`${entry.count} x $${entry.price / 100.00}`)
        }
      })
    })
    if (process.env.NODE_ENV !== 'test') {
      for (const [productCode, options] of Object.entries(consolidatedInventory)) {
        console.log(chalk.blue(`${productCode}, options: ${options.join(', ')}`))
      }
    } else {
      return consolidatedInventory
    }
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
        showInventory(inventoryData)
        break

      case 'quit':
        console.log(chalk.grey('Closing program...'))
        didQuit = true
        rl.close()
        break

      default:
        if (command.startsWith('load ')) {
          const filePath = command.replace('load', '').trim()
          if (fileExists(filePath)) {
            const data = await loadProducts(filePath)
            if (data !== undefined) {
              inventoryData = data
              console.log(chalk.green('Loaded items successfully'))
            }
          }
        } else {
          console.error(chalk.red('Invalid command'))
        }
        break
    }
  }
}

run()

export {
  loadProducts,
  fileExists,
  showInventory
}
