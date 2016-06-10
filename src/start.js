// Migrations Data
var migrations = require('../node_modules/sise-db/test/migrations.json')

var api = require('./index.js')
var SISEDB = require('sise-db')

var db = new SISEDB()

db.import(migrations)

api.start(db, function (err, info) {

    if (err){
        throw error
    }
    
    console.log('Server started')
    
})
