var fs = require('fs');
var path = require('path');
var url = require('url');

var http = require('http');

exports = module.exports;

var server;

exports.start = function (db, callback) {
    // start API

    server = http.createServer(function (req, res) {

        console.log('Incoming request on: ', req.url);

        var address = url.parse(req.url, true);
        var segment = address.path.split('/');

        //Handle requests here


        if (req.method === 'GET' && segment[1] === 'insurance' && segment.length === 2) {

            console.log('Handling insurance endpoint');

            db.getInsurances(function (err, insurances) {

                if (err) {
                    throw error
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(insurances))
            })
        }

        else if (req.method === 'GET' && segment[1] === 'property' && segment.length === 2) {

            console.log('Handling property endpoint');

            db.getProperties(function (err, properties) {

                if (err) {
                    throw error
                }

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(properties))
            })
        }

        else if (req.method === 'GET' && segment[1] === 'insurance' && segment.length === 3) {

            console.log('Handling get quote endpoint');


            var requestType = segment[2].split('?');

            if(requestType.length===1) {

                db.getInsurance(segment[2], function (err, insurance) {

                    if (err) {
                        throw error
                    }

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(insurance))

                })
            }

            else if(requestType[1].slice(0,3)==='nif'){

                var nif = requestType[1].slice(4,13);

                db.getUser(nif, function (err, user) {

                    if (err) {throw error}

                    var quotes=[];

                    for(i=0; i<Object.keys(user.quotes).length; i++) {

                        quotes.push(user.quotes[nif + '' + i])

                    }

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(quotes))

                })

            }

            else if(requestType[1].slice(0,2)==='id'){

                var id = requestType[1].slice(3);
                var nif = requestType[1].slice(3,12);

                db.getUser(nif, function (err, user) {

                    if (err) {throw error}

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(user.quotes[id]))

                })

            }
        }

        else if (req.method === 'POST' && segment[1] === 'insurance' && segment[2] === 'quote' && segment.length === 3) {

            console.log('Handling quote submission endpoint');

            var data = '';
            var jsonData = '';
            var quoteId='';

            req.on("data", function (chunk) {

                data += chunk;

            });


            req.on("error", function (err) {
                
                throw error
                
            });

            req.on("end", function() {

                jsonData = JSON.parse(data);
                //jsonDataUser = jsonData.quote.user;

                db.getUser(jsonData.quote.user.nif, function (err, user) {

                    if (err) {
                        throw error
                    }

                    var userDb;

                    if (typeof user == 'undefined' || user.length === 0) {

                        quoteId = jsonData.quote.user.nif + '' + 0;

                        jsonData.quote.user["quotes"] = {
                            [quoteId]: {
                                "insurances": jsonData.quote.insurances,
                                "property": jsonData.quote.property
                            }
                        };

                        userDb = jsonData.quote.user
                    }

                    else {

                        var idSufix = Object.keys(user.quotes).length;

                        quoteId = jsonData.quote.user.nif + '' + idSufix;

                        var quotation={};

                        quotation={
                            [quoteId]: {
                                "insurances": jsonData.quote.insurances,
                                "property": jsonData.quote.property
                            }
                        };

                        user.quotes=Object.assign(quotation,user.quotes);

                        userDb=user
                    }


                    db.putUser(userDb, function (err) {

                        if (err) {
                            throw error
                        }

                    });

                    //Test that checks if the user/user's quotation request was correctly written into the DB:

                    /*db.getUser(jsonData.quote.user.nif, function (err, user) {

                         console.log("DB Verification 1: ",user);
                         console.log("DB Verification 2: ",user.quotes[quoteId])

                     });*/


                    var payload = {};
                    payload['quoteId']=quoteId;

                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(payload));

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
