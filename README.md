# ibm-coding-challenge-2022

![GitHub](https://img.shields.io/github/license/ashvin-umaharan/ibm-coding-challenge-2022) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ashvin-umaharan/ibm-coding-challenge-2022) ![Lines of code](https://img.shields.io/tokei/lines/github/ashvin-umaharan/ibm-coding-challenge-2022)

This is my solution for a coding challenge presented by IBM Garage as part of their graduate hiring process.

## Requirements
### Runtime + Package Manager
This is a Node.js CLI application, therefore it requires `Node.js` and `npm` to be installed. This project was developed using the following versions:
* `Node.js` v17.5.0
* `npm` v8.5.1

However, this project should still be able to be run without issues with the following versions:
* `Node.js` v17.x (and newer)
* `npm` v8.1.x (and newer)

### Third-Party Packages
The following third-party `npm` packages have been utilised:
* [`chalk`](https://github.com/chalk/chalk) ![npms.io (final)](https://img.shields.io/npms-io/final-score/chalk) ![node-current](https://img.shields.io/node/v/chalk) ![npm](https://img.shields.io/npm/v/chalk)
* [`csv-parse`](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse) ![npms.io (final)](https://img.shields.io/npms-io/final-score/csv-parse) ![node-current](https://img.shields.io/node/v/csv-parse) ![npm](https://img.shields.io/npm/v/csv-parse)

#### Dev Dependencies
The following third-party `npm` packages have been utilised for testing:
* [`mocha`](https://github.com/mochajs/mocha) ![npms.io (final)](https://img.shields.io/npms-io/final-score/mocha) ![node-current](https://img.shields.io/node/v/mocha) ![npm](https://img.shields.io/npm/v/mocha)
* [`chai`](https://github.com/chaijs/chai) ![npms.io (final)](https://img.shields.io/npms-io/final-score/chai) ![node-current](https://img.shields.io/node/v/chai) ![npm](https://img.shields.io/npm/v/chai)
* [`chai-as-promised`](https://github.com/domenic/chai-as-promised) ![npms.io (final)](https://img.shields.io/npms-io/final-score/chai-as-promised) ![node-current](https://img.shields.io/node/v/chai-as-promised) ![npm](https://img.shields.io/npm/v/chai-as-promised)

## Installation

### 1. Clone project using `git`
```sh
$ git clone https://github.com/ashvin-umaharan/ibm-coding-challenge-2022.git
```
### 2. Navigate to cloned project folder (if applicable)
```sh
$ cd /../ibm-coding-challenge-2022
```

### 3. Install project using `npm`
```sh
$ npm install -g
```

### 4. Launch program
```sh
$ bakery-oms
```

### 5. Enter (valid) commands to use the program
```sh
> load <path/to/file.csv>
```
```sh
> inventory
```
```sh
> order <code-1> <quantity> [ <code-2> <quantity> ... ]
```
```sh
> quit
```

### 6. (optional) Run the `mocha` test suite
```sh
$ npm test
```
