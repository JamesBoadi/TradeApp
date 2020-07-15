var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var client = require('./client');
var cors = require('cors');
var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

let urlencodedParser = bodyParser.urlencoded({ extended: true });

var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});

let server = app.listen(3001, function () {
    console.log("This confirms the server is running")
});

var whitelist = ['http://localhost:8001', 'http://localhost:3001/register', 'http://localhost:3001/verifylogin', 'http://localhost:3001', 'http://localhost:7050', 'http://localhost:7051', 'http://localhost:7054']; // Whitelist requests from other ports to this domain
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

app.use(cors(corsOptions));



// Registration
app.get('/register?', async function (req, res) { // callback
    try {
        let traderName = new String(req.query.name);
        let traderEmail = new String(req.query.email);
        const traderPassword = new String(req.query.password);
       
        // Complete registration
        var registration = new client.Registration(traderName, traderEmail, traderPassword);
        let result = registration.registerAccount(traderName, traderEmail, traderPassword);
        let obj = JSON.stringify(result);
        res.send(obj);
    }
    catch (ex) {
        console.log('Failed registration ' + ex);
  //      res.sendStatus(400);
    }
});

// Execute Transaction
app.get('/submitTransaction?', async function (req, res) { // callback
    try {
        const option = new String(req.query.option);
        const amount = new String(req.query.amount);
        const multiplier = new String(req.query.multiplier);
        const traderName = new String(req.query.name);
        const walletID = new String(req.query.walletID);

        console.log(option + ' ' + amount + ' ' + multiplier + ' ' + traderName + ' ' + walletID);
        var transaction = new client.Transaction();
        var result = await transaction.submitTransaction(amount, multiplier, option, traderName, walletID);
        res.send(result);
    }
    catch (ex) {
        console.log('Invalid transaction' + ex);
        logger.write('Invalid transaction');
       // res.sendStatus(400);
    }
});

// Log In
app.get('/verifylogin?', async function (req, res) { // callback
    try {
        const walletID = req.query.walletID;
        const traderPassword = req.query.password;

        var trader = new client.Trader();
        var result = trader.authLogin(walletID, traderPassword);
        var obj = JSON.stringify(result);
        console.log(obj);
        res.send(obj);
    }

    catch (ex) {
        console.log('invalid login' + ex);
        logger.write('invalid login');
       // res.sendStatus(400);
    }
});



