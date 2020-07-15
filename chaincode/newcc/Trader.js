'use strict';

const fs = require('fs');
const shim = require('fabric-shim');
const { Contract } = require('fabric-contract-api');
let time = new Date(); // Get the current time

class Trader extends Contract {

    constructor() {
        super('traderContract');
    }

    async getTransactions(context, walletID) {
        let iden = await context.stub.getState(walletID);
        let isString = /([A-Za-z]+\d+$)|(\d+[A-Za-z]+$)/.test(walletID); // Contains numbers and digits

        if (!iden || iden.toString().length <= 0) {
            return "Trader does not exist";
        }

        if (isString === false) {
            throw new Error('Expected type: String');
        }

        let res = JSON.stringify(JSON.parse(iden));

        return res;
    }

    async orderTransact(context, amount, multiplier, option, walletID) {
        let iden = await context.stub.getState(walletID.toString());

        if (!iden || iden.toString().length <= 0) {
            return "Trader does not exist";
        }

        let traderInfo = JSON.parse(iden);
        let id = traderInfo.TransactionInfo[0].WalletID;

        /**********************************************************************  
                                    Validation checks
         *   Reject information that does not match previous transaction info *
         *********************************************************************/
        if (!(walletID.toString() == id.toString())) {
            return "Trader does not exist";
        }

        let size = parseInt(traderInfo.TransactionInfo.length) - 1;
        let trader = traderInfo.TransactionInfo[size];

        let TransactionTime = { // Get properties of time in json format
            Day: time.getDate(),
            Month: time.getMonth(),
            Year: time.getUTCFullYear(),
            Hours: time.getHours(),
            Mintues: time.getMinutes(),
            Seconds: time.getSeconds()
        };

        let deduction = await context.stub.getState('commission');
        let args = [amount, multiplier];

        for (var countArgs = 0; countArgs < args.length; countArgs++) {
            let isnum = /^\d+$/.test(args[countArgs]);

            if (!isnum)
                throw new Error('Expected type: int');
        }

        let isString = /([A-Za-z]+\d+$)|(\d+[A-Za-z]+$)/.test(walletID); // Contains numbers and digits
        if (isString === false) {
            throw new Error('Expected type: String');
        }

        // Convert to integer
        amount = parseInt(amount);
        deduction = parseInt(deduction);
        multiplier = parseInt(multiplier);
        trader.Equity = parseInt(trader.Equity);

        let orderCost = (amount * multiplier);
        let newEquity = parseInt(trader.Equity - deduction - orderCost);

        let transaction = {
            TraderName: trader.TraderName,
            WalletID: trader.WalletID,
            Equity: newEquity,
            OrderCost: orderCost,
            Status: option,
            Time: TransactionTime
        };

        traderInfo.TransactionInfo.push(transaction);

        let data = {
            UniqueID: trader.TraderID,
            OrderCost: orderCost,
            OrderNo: parseInt(traderInfo.orderNo) + 1,
            TransactionInfo: traderInfo.TransactionInfo
        };

        await context.stub.putState(walletID, Buffer.from(JSON.stringify(data)));
    }

    async updateOrder(oldPrice, orderNo, walletID) { // Should be called automatically     
        /* let jsonFile = fs.readFileSync('./' + 'transactionFile' + walletID + '.json'); // read jsonFile     
         // Blockchain
         let transactionDetails = await context.getState(walletID);
         let transactionNo = transactionDetails.transactionNo;
         let trader = transactionDetails.transactionInfo[transactionNo]; // get the transaction array
 
         var data = JSON.parse(response); //get response
 
         let currentPrice = data.price; // get the current price
         let oldEquity = trader.Equity;
         let newEquity = 0;
 
         if (trader.OptionContract == 'Call') {
             //   if
             newEquity = Math.abs((currentPrice * (trader.Amount * trader.multiplier)
                 - (oldPrice * (amount) * multiplier))); // new price of stock
         }
         else if (trader.OptionContract == 'Put') {
             newEquity = (currentPrice * (amount * multiplier)
                 - (oldPrice * (amount * multiplier)));
 
         }
 
         let obj = context.getState(walletID);
         let transaction = obj.OrderNo + 1;
         let calc = Math.max(oldValue, newValue);
 
         if (calc < 0)
             status = "loss"
         else
             status = "gain"*/
    }

    /*     async function closeOrder(currentPrice, orderNo, walletID) { // Both the trader and the broker reserve the right to close the order
             try {
                 await context.getState(walletID.orderNo); // An order cannot be closed if it has never been opened
             }
             catch (ex) {
 
 
             }
 
 
             await context.deleteState(walletID.orderNo); // delete the state
         }*/


}

module.exports = Trader;