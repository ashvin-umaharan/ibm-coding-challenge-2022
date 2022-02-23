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
import OrderedProduct from '../model/OrderedProduct.js'

/**
 * Validates whether a given file path exists using the built-in 'fs' library
 * @param {filePath} arg a string that represents a system file path
 * @returns true if filePath is valid, false otherwise
 */
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

/**
 * Loads each line from a Comma Separated Values (CSV) file
 * into an array (stored in memory) and returns it.
 * Utilises the built-in 'fs' library to create a read stream
 * that is piped into an instance of 'csv-parser' that:
 *  - ignores the first line in the CSV file (because it should be the header)
 *  - sets the header as 'code', 'count', and 'price'
 *  - skips blank lines in the CSV file
 *  - trims blank spaces from each value
 * Only CSV files with three columns is accepted.
 * @param {filePath} arg a string that represents a valid system file path
 * @returns {records} an array of arrays containing each line from input file,
 * undefined if CSV file is invalid as error is printed to the console
 * @throws {Error} when testing
 */
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

/**
 * Groups each line item from the CSV file by product code
 * and returns an array that contains instances of the Product object.
 * Each instance of Product has a code and an array of arrays that contains
 * all packaging options avalable for it in the form [count, price].
 * @param {rawInventoryData} arg An array of arrays containing strings
 * @returns {inventory} An array of Product objects
 */
function consolidateProducts (rawInventoryData) {
  const inventory = []

  // Create a new Set from an array of product codes from the inventory
  // and convert it back into an Array using Spread syntax
  const uniqueProductCodes = [...new Set(rawInventoryData.map(product => product.code))]

  // Create a map that contains each product as the key and an empty array as the value
  const consolidatedInventory = uniqueProductCodes.reduce(function (options, uniqueProductCode) {
    options[uniqueProductCode] = []
    return options
  }, {})

  // For each product, append each packaging option available as the value within the map
  uniqueProductCodes.forEach((code) => {
    rawInventoryData.forEach((entry) => {
      if (entry.code === code) {
        consolidatedInventory[code].push([entry.count, entry.price])
      }
    })
  })

  // Iterate through the map and create a 'Product' object from each key, value pair
  // and push it to the inventory Array
  for (const [productCode, options] of Object.entries(consolidatedInventory)) {
    inventory.push(new Product(productCode, options))
  }
  return inventory
}

/**
 * Prints the inventory to the console in the required format.
 * If inventory is empty, the string 'The bakery is empty' is printed to the console.
 * @param {inventory} arg an array of Product objects
 * @returns {output} a string representing the output shown to the user when testing,
 * undefined otherwise as the function prints to the console
 */
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

/**
 * Validates a given order by checking for the following:
 *  - number of arguments must be even, otherwise it means that
 *    a product code or quanitity is missing
 *  - every second argument (i.e. the quantities of each product)
 *    must be a valid integer
 *  - every second argument (i.e. the quantities of each product)
 *    must be greater than zero
 *  - checks that given product codes exist in the inventory
 * @param {commandArguments} arg a string representing an order placed by a customer
 * @param {inventory} arg an array of Product objects
 * @returns true if the given order is valid, false otherwise
 */
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

/**
 * Converts a given order into tuples of the product code and the
 * quantity of the product that has been ordered.
 * @param {commandArguments} arg a string representing a valid order placed by a customer
 * @returns {formattedArgs} an array of arrays containing pairs of a string and an integer
 */
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
 * @param {options} arg an int (positive only) array of arrays e.g. [[1, 2], ..., [3, 4]]
 * @param {targetSum} arg a positive integer
 * @returns {matrix[targetSum]} an int (positive only) array of arrays e.g. [[1, 2], ..., [3, 4]]
 * Time complexity: O(n * m), where 'n' = length of 'options' and 'm' = size of 'targetSum'
 * Space complexity: O(m), where 'm' = size of 'targetSum'
 */
function perfectSubsetSum (options, targetSum) {
  // Initialise an array of length targetSum + 1 with []
  const matrix = Array(targetSum + 1).fill(null).map(() => [])
  // Set index 0 as an empty array because all arrays have a subset
  // that add up to zero (because of the empty set)
  matrix[0] = [[]]

  // For each option available in 'options' where the quantity adds up to 'targetSum',
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

/**
 * Fulfills each order by allocating an optimal combination
 * of the various pakcaging options available for each product.
 * This is done by determining all possible combinations of the
 * packaging options for each product that equal the quantity
 * of the product ordered and selecting the combination with the
 * least number of packages to save on shipping costs.
 * @param {orders} arg an array of arrays containing pairs of a string and an integer
 * @param {inventory} arg an array of Product objects
 * @returns {receipt} an array of OrderedProduct objects
 */
function prepareOrder (orders, inventory) {
  const receipt = []
  orders.forEach((order) => {
    const productOrdered = order[0]
    const quantityOrdered = order[1]

    // Filter the inventory for the current product
    const filteredInventory = inventory.filter((product) => product.code === productOrdered)

    // Get all available packaing options for the product
    const availablePackagingOptions = filteredInventory[0].packagingOptions.map((option) => [parseInt(option[0]), parseInt(option[1])])

    // Get all possible packaging options that can fulfill the quanitity ordered
    const possibleCombinations = perfectSubsetSum(availablePackagingOptions, quantityOrdered)

    let newOrderedProduct

    // If no possible packging options exist, the order for that product cannot
    // be fulfilled, otherwise, sort the packaging options by length and select
    // the first option to fulfill the order
    if (possibleCombinations.length === 0) {
      newOrderedProduct = new OrderedProduct(productOrdered, [])
    } else {
      const optimalCombination = possibleCombinations.sort().sort((a, b) => a.length - b.length)[0]
      newOrderedProduct = new OrderedProduct(productOrdered, optimalCombination)
    }
    receipt.push(newOrderedProduct)
  })
  return receipt
}

/**
 * Outputs the receipt for an order placed by a customer
 * @param {receipt} Arg an array of OrderedProduct objects
 * @returns {output} a string representing the output shown to the customer when testing,
 * undefined otherwise as the function prints to the console
 */
function printReceipt (receipt) {
  if (process.env.NODE_ENV !== 'test') {
    receipt.forEach((lineItem) => {
      if (lineItem.totalCost === 'N/A') {
        console.log(chalk.red(`${lineItem.code}, ${lineItem.totalCost}, packages: no valid combination of packages exist - please contact bakery for a custom order`))
      } else {
        console.log(chalk.green(`${lineItem.code}, $${lineItem.totalCost / 100.00}, packages: ${lineItem.lineSummary.map((option) => `${option[1]}x${option[0]}`).join(', ')}`))
      }
    })
  } else {
    let output = ''
    receipt.forEach((lineItem) => {
      if (lineItem.totalCost === 'N/A') {
        output += `${lineItem.code}, ${lineItem.totalCost}, packages: no valid combination of packages exist - please contact bakery for a custom order\n`
      } else {
        output += `${lineItem.code}, $${lineItem.totalCost / 100.00}, packages: ${lineItem.lineSummary.map((option) => `${option[1]}x${option[0]}`).join(', ')}\n`
      }
    })
    return output
  }
}

/**
 * The main function that contains a loop to get input from,
 * and show output(s) to the user via the Command Line Interface (CLI)
 */
async function main () {
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

main()

export {
  fileExists,
  loadProducts,
  consolidateProducts,
  showInventory,
  isValidOrder,
  formatOrder,
  prepareOrder,
  printReceipt
}
