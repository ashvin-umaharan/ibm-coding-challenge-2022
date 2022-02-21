# ibm-coding-challenge-2022

This is my solution for a coding challenge presented by IBM Garage as part of their graduate hiring process.

## Requirements

This is a Node.js CLI application, therefore it requires `Node.js` and `npm` to be installed. This project was developed using the following versions:
* `Node.js` v17.5.0
* `npm` v8.5.1

However, this project should still be able to be run without issues with the following versions:
* `Node.js` v17.x (and newer)
* `npm` v8.1.x (and newer)

## Installation

### 1. Clone project using `git`
```sh
$ git clone
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