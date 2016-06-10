var fs = require('fs');
var path = require('path');
var url = require('url');
var request = require("request");

/*
 var SISEDB = require('sise-db')
 var db = new SISEDB()

 var migrationPath=path.join(__dirname,'../node_modules/sise-db/test/migrations.json')
 var buf=fs.readFileSync(migrationPath)
 var migrations=JSON.parse(buf.toString())

 console.log(migrations)

 //Loading data into db
 db.import(migrations)

 //console.log(db)

 //console.log(db.getInsurances())

 console.log(db.getUsers())
 */

//////////////////////////////////////////////////////////////////////////////////

var http = require('http');

exports = module.exports;

var server;

exports.start = function (db, callback) {
    // start API

    server = http.createServer(function (req, res) {

        console.log('Incoming request on: ', req.url);

        var address = url.parse(req.url, true);
        var segment = address.path.split('/');
        console.log("SEGMENT",segment);
        //Handle requests here


        if (segment[1] === 'insurance' && segment.length < 3) {
            console.log('Handling insurance endpoint');

            db.getInsurances(function (err, insurances) {

                if (err) {
                    throw error
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                console.log(insurances);
                res.end(JSON.stringify(insurances))
            })
        }

        else if (req.method === 'GET' && segment[1] === 'property' && segment.length < 3) {
            console.log('Handling property endpoint');

            db.getProperties(function (err, properties) {

                if (err) {
                    throw error
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                console.log(properties);
                res.end(JSON.stringify(properties))
            })
        }

        else if (req.method === 'GET' && segment[1] === 'insurance' && segment.length === 3) {
            console.log('Handling quotes endpoint');

            db.getInsurance(segment[2], function (err, insurance) {

                if (err) {
                    throw error
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                console.log(insurance);
                res.end(JSON.stringify(insurance))

            })
        }

        else if (req.method === 'POST' && segment[1] === 'insurance' && segment[2] === 'quote' && segment.length === 3) {

            console.log('Handling quotes submission endpoint');

            var payload = '';
            var payloadUser = '';
            var quoteId;

            console.log('ola');

            req.on("data", function (data) {

                payload = JSON.parse(data);
                payloadUser = payload.quote.user

                //console.log(payload)
                //console.log(payloadUser)
                //console.log(Object.keys(payload.quote.user).length);

                //payload.quote.quoteId=1
                //console.log(payload.quote.quoteId)


                db.getUser(payload.quote.user.nif, function (err, user) {

                    if (err) {
                        throw error
                    }

                    //var quoteId;

                    if (typeof user == 'undefined' || user.length === 0) {
                        console.log("Entrei aqui 1");

                        quoteId = payload.quote.user.nif + '' + 0;
                        payload["quoteId"]=quoteId


                        //payload.quote.user.quotes=quoteId

                        payload.quote.user["quotes"] = {
                            [quoteId]: {
                                "insurances": payload.quote.insurances,
                                "property": payload.quote.property
                            }
                        };

                        db.putUser(payloadUser);


                    }


                    //Teste

                    db.getUser(payload.quote.user.nif, function (err, user) {

                        console.log(user.quotes[1122334450])

                    });

                    console.log("payload",payload.quoteId)
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(payload))


                })


            })


        }


    });

    server.listen(process.env.PORT || 8080, callback)
};

exports.stop = function (callback) {
    // stop

    server.close(callback)
};
