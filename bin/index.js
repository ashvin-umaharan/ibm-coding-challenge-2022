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
