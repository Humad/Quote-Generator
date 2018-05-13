var express = require("express");
var app = express();
var path = require("path");
var mongo = require('mongodb').MongoClient;
var bodyParser = require("body-parser");
var port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public'))); // location of scripts and styles
app.use(bodyParser.urlencoded({ extended: false })); // needed to parse POST requests

// -- GET requests -- 

// Renders the home page
app.get("/", function(req, res){
    console.log("Received get request for page")
    res.render("readQuote");
});

// Connects to the mLab database to retrieve collection of quotes
app.get("/get", function(req, res){
    getQuoteFromCollection(res, "quotes");
});

// Get motivational quotes
app.get("/getMotivational", function(req, res) {
    getQuoteFromCollection(res, "motivationalQuotes")
});

// Renders the addNewQuote page, allowing users to add new quotes
app.get("/add", function(req, res){
    res.render("addNewQuote");
});

app.get("/addMotivational", function(req, res) {
    res.render("addNewQuote");
});

// -- POST requests --

// Connects to the mLab database to add a quote to the collection of quotes
app.post("/add", function(req, res){
    addQuoteToCollection(req, "quotes");
});

// Add motivational quotes
app.post("/addMotivational", function(req, res){
    addQuoteToCollection(req, "motivationalQuotes");
});

app.listen(port, function(){
    console.log("Listening on port " + port);
});

// -- Helper functions --

function getQuoteFromCollection(res, collection) {
    console.log("Getting quote from collection ", collection)
    var mLabUri = "mongodb://" + process.env.readerId +
    ":" + process.env.readerPass + "@ds061246.mlab.com:61246/projects";
    mongo.connect(mLabUri, function(err, db){
        if (err){
            throw err;
            res.end(err);
        } else {
            db.collection(collection).find().toArray(function(err, docs){
                res.status(200).json({data : docs});
                db.close();
            });
        }
    })
}

function addQuoteToCollection(req, collection) {
    var data = {
        "text" : req.body.quote,
        "author" : req.body.author
    };

    var mLabUri = "mongodb://" + process.env.writerId +
        ":" + process.env.writerPass + "@ds061246.mlab.com:61246/projects";

    mongo.connect(mLabUri, function(err, db){
        if (err){
            throw err;
        } else {
            db.collection(collection).insert(data, function(err, data){
                if (err){
                    throw err;
                }
                db.close();
            });
        }
    });
}
