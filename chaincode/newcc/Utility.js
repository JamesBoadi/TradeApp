'use strict';

const fs = require('fs');
const shim = require('fabric-shim');
const { Contract } = require('fabric-contract-api');
let time = new Date(); // Get the current time

class Utility extends Contract {

    constructor() {
        super('utilityContract');     /**
        * Global:
        *  - UniqueID
        *  - Order
        *  - OrderNo
        * Trader:
        *  - traderInfo ..............
        */
    }
    // When interacting with the chaincode, call all functions here
    /* E.g... A typical transaction (will be rejected by the blockchain if there are inconsistencies)
              let jsonFile = fs.readFileSync('./' + 'transactionFile' + walletID + '.json'); // read jsonFile     
                   // Blockchain
                   let transactionDetails = await context.getState(walletID); // get the transaction details
                   let transactionNo = transactionDetails.transactionNo + 1; // get the transaction number
                   let trader = transactionDetails.transactionInfo[transactionNo]; // get the transaction array

                   // Json file details
                   let traderFile = JSON.parse(jsonFile); // Only the transactions
                   let filetransactionNo = traderFile.transactionNo; // get the transaction number
                   let tradeFileDetails = filetransactionNo.transactionInfo[transactionNo]; // get the transaction array
   
             tranacationInfo[transactionNo+1]: { Global transactions
                 uniqueID = "uniqueid" // only created after registration
                 Equity = 0.. // equity transferred
                 OrderNo = orderNo+1
                 transactionInfo[transactionNo+1] = { // A transaction number is unique to that trader only
                     ID: walletID,
                     Order: orderCost,
                     Status: status,  // status 
                     Time: TransactionTime   
                 }
             }

    /* Set the commission (for all traders) */
    async setCommission(context, commission) {

        let isnum = /^\d+$/.test(commission);

        if(!isnum){
            throw new Error('Expected type: int');
        }
        else{
            await context.stub.putState('commission', Buffer.from(commission));
        }
    }

    async getTrader(context, walletID) // Cannot put state
    {
        let iden = await context.stub.getState(walletID.toString());
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

    /* delete trader */
    async deleteTrader(context, walletID) {
        let iden = await context.stub.getState(walletID.toString());
        let isString = /([A-Za-z]+\d+$)|(\d+[A-Za-z]+$)/.test(walletID); // Contains numbers and digits

        if (!iden || iden.toString().length <= 0) {
            return "Trader does not exist";
        }
        
        if (isString === false) {
            throw new Error('Expected type: String');
        }

        await context.stub.deleteState(walletID); 
    }


    /* create trader */
    async createTrader(context, traderName, equity, walletID) {  
        let status = '';
        let uniqueid = '';
        let isString = /([A-Za-z]+\d+$)|(\d+[A-Za-z]+$)/.test(walletID); // Contains numbers and digits
      

        let TransactionTime = {
            Day: time.getDate(),
            Month: time.getMonth(),
            Year: time.getUTCFullYear(),
            Hours: time.getHours(),
            Mintues: time.getMinutes(),
            Seconds: time.getSeconds()
        };

        let transaction = { 
            TraderName: traderName,
            WalletID: walletID,
            Equity: equity,
            OrderCost: 0,
            Status: status,
            Time: TransactionTime
        };

        var transactionArr = [];
        transactionArr.push(transaction);
        let data = {
            UniqueID: uniqueid, 
            OrderCost: 0, 
            OrderNo: 0,
            TransactionInfo: transactionArr,
           
        };

        await this.setCommission(context, '0');

        if (isString === false) {
            throw new Error('Expected type: String');
        }

        await context.stub.putState(walletID, Buffer.from(JSON.stringify(data))); // add to an json file each time
    }
}

/**
 *    tranacationInfo: { Global transactions
              uniqueID = "uniqueid" // only created after registration
              Equity = 0.. // equity transferred
              OrderNo = orderNo+1
           
              transactionInfo[transactionNo+1] = { // A transaction number is unique to that trader only
                  ID: walletID,
                  Order: orderCost,
                  Status: status,  // status 
                  Time: TransactionTime   
              }
          }
 * 
 */

module.exports = Utility;
