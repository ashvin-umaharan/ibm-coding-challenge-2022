# ibm-coding-challenge-2022

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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
> quit
```

### 6. (optional) Run the `mocha` test suite
```sh
$ npm test
```
