// Migrations Data
var migrations = require('../node_modules/sise-db/test/migrations.json')
 
// Your RESTful HTTP API implementation entry point
var api = require('../src/index.js')
 
// This are the tests that will be run
var test = require('sise-restful-api-tests').base
 
// Run the tests
test(migrations, api)
