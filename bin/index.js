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
        records.push(record)
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

function consolidateProducts (rawInventoryData) {
  const inventory = []
  const uniqueProductCodes = [...new Set(rawInventoryData.map(product => product.code))]
  const consolidatedInventory = uniqueProductCodes.reduce(function (options, uniqueProductCode) {
    options[uniqueProductCode] = []
    return options
  }, {})
  uniqueProductCodes.forEach((code) => {
    rawInventoryData.forEach((entry) => {
      if (entry.code === code) {
        consolidatedInventory[code].push([entry.count, entry.price])
      }
    })
  })
  for (const [productCode, options] of Object.entries(consolidatedInventory)) {
    inventory.push(new Product(productCode, options))
  }
  return inventory
}

function showInventory (inventory) {
  if (inventory === null) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(chalk.yellow('The bakery is empty'))
    } else {
      return 'The bakery is empty'
    }
  } else {
    if (process.env.NODE_ENV !== 'test') {
      inventory.forEach((product) => {
        console.log(chalk.blue(`${product.code}, options: ${product.packagingOptions.map((option) => `${option[0]} x $${option[1] / 100.00}`).join(', ')}`))
      })
    } else {
      let output = ''
      inventory.forEach((product) => {
        output += `${product.code}, options: ${product.packagingOptions.map((option) => `${option[0]} x $${option[1] / 100.00}`).join(', ')}\n`
      })
      return output
    }
  }
}

function isValidOrder (commandArguments, inventory) {
  const args = commandArguments.split(' ')
  if (args.length % 2 !== 0) {
    return false
  } else {
    let invalidQuantityFound = false
    for (let i = 1; i < args.length; i += 2) {
      if (isNaN(parseInt(args[i])) || parseInt(args[i]) <= 0) {
        invalidQuantityFound = true
      }
    }
    if (invalidQuantityFound) {
      return false
    } else {
      let invalidProductCodeFound = false
      const validProducts = inventory.map(product => product.code)
      for (let i = 0; i < args.length; i += 2) {
        if (!validProducts.includes(args[i])) {
          invalidProductCodeFound = true
        }
      }
      if (invalidProductCodeFound) { 
        return false 
      } else { 
        return true 
      }
    }
  }
}

function formatOrder (commandArguments) {
  const args = commandArguments.split(' ')
  const formattedArgs = []
  for (let i = 0; i < args.length; i += 2) {
    formattedArgs.push([args[i], parseInt(args[i + 1])])
  }
  return formattedArgs
}

/**
 * Given an array A and a number N, calculate all possible subsets of A
 * that add up to N.
 * @param {options} arg An int array of arrays e.g. [[1, 2], ..., [3, 4]]
 * @param {targetSum} arg A positive integer
 * Time complexity: O(n * m * k), where 'n' = length of 'options',
 * 'm' = 'targetSum', and k = 
 */
function perfectSubsetSum(options, targetSum) {
  // Initialise an array of length targetSum + 1 with []
  const matrix = Array(targetSum + 1).fill(null).map(() => [])
  // Set index 0 as an empty array because all arrays have a subset
  // that add up to zero (because of the empty set)
  matrix[0] = [[]]

  // For each option available in 'options' that adds up to 'targetSum',
  // populate the matrix with that option at index i
  options.forEach(option => {
    for (let i = option[0]; i <= targetSum; ++i) {
      matrix[i - option[0]].forEach(combination => {
        matrix[i].push(combination.concat([option]))
      })
    }
  })
  return matrix[targetSum]
}

function prepareOrder(orders, inventory){
  const receipt = []
  orders.forEach((order) => {
    const productOrdered = order[0]
    const quantityOrdered = order[1]
    const filteredInventory = inventory.filter((product) => product.code === productOrdered)
    const otherPackagingOptions = filteredInventory[0].packagingOptions.map((option) => [parseInt(option[0]), parseInt(option[1])])
    const possibleCombinations = perfectSubsetSum(otherPackagingOptions, quantityOrdered)
    const newEntry = {}
    newEntry[productOrdered] = possibleCombinations.sort().sort((a, b) => a.length - b.length)[0]
    receipt.push(newEntry)
  })
  return receipt
}

function printReceipt () {
  
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
              inventoryData = consolidateProducts(data)
              console.log(chalk.green('Loaded items successfully'))
            }
          }
        } else if (command.startsWith('order ')) {
          const orderPlaced = command.replace('order', '').trim()
          if (inventoryData !== null) {
            if (isValidOrder(orderPlaced, inventoryData)) {
              const formattedOrder = formatOrder(orderPlaced)
              const receipt = prepareOrder(formattedOrder, inventoryData)
              printReceipt(receipt)
            } else {
              console.error(chalk.red('Invalid order - please enter valid product codes and quantities > 0'))
            }
          } else {
            console.error(chalk.red('The bakery is empty - please populate inventory using -> load <path/to/file.csv>'))
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
  fileExists,
  loadProducts,
  consolidateProducts,
  showInventory,
  isValidOrder,
  formatOrder,
  prepareOrder
}
