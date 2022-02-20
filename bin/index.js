#!/usr/bin/env node

const yargs = require("yargs");

const options = yargs
 .usage("Usage:\nload <csv-file>\ninventory\norder <code-1> <quantity> <code-2> <quantity> ...")
 .option("load", { alias: "l", describe: "A CSV file containing product code, count of products in package, and price of package", type: "string" })
 .option("inventory", { alias: "i", describe: "List all products currently in the inventory" })
 .option("order", { alias: "o", describe: "Generate a fulfillment for an order specified like <code-1> <quantity> <code-2> <quantity> ... that minimises the number of packs shipped", type: "string" })
 .argv;

function load_products(){
    return
}


module.exports = {
    load_products
}