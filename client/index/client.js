var pbkdf2 = require('pbkdf2');
var fs = require('fs');
var Mnemonic = require('bitcore-mnemonic');

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'basic-network', 'connection.json');

var logger = fs.createWriteStream('log.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});

var login = false;
var tradername = false;

class Registration {
    constructor(traderName, traderEmail, traderPassword) {
        this.traderName = traderName;
        this.traderEmail = traderEmail;
        this.traderPassword = traderPassword;
    }



    static generateWords() {
        var words = new Mnemonic();
        return words.toString();
    }

    // Create a new account
    registerAccount(traderName, traderEmail, traderPassword) {
        var registration = new Registration(traderName, traderEmail, traderPassword);

        // Validate Credentials
        let obj = registration.validateCredentials(traderEmail, traderName, traderPassword);
        if (obj.Bool == false)
            return obj;

        // Complete Registration
        const words = Buffer.from(Registration.generateWords(), 'utf8').toString('hex'); // Store this, fuck aughttt
        let walletID = registration.createWalletID(words, traderPassword); // get the first hash (secret)
        console.log("Please keep this walletID secret " + walletID + ' ' + words + ' ' + traderPassword);
        registration.storeCredentials(registration, words);
        const reg = (registration.createIdentity(traderName, "50000", walletID)) ? true : false;
        if (reg == true)
            return {
                Bool: true,
                Message: "Registration Successful"
            };

        return {
            Bool: false,
            Message: "Registratiion Failed"
        };
    }

    /**
     * @param {key} Key Mneumonic words randomly generated
     * @param {salt} Salt  String "mnemonic"+passphrase
     */
    createWalletID(key, salt) {
        key = new String(key).toString().trim();
        salt = "mnemonic".concat(salt).toString().trim();
        var res = pbkdf2.pbkdf2Sync(key, salt, 2048, 8, 'sha512');
        res = res.toString('hex');

        return res;
    }

    validateCredentials(traderEmail, traderName, traderPassword) {
        let bool = Registration.checkEmail(traderEmail, traderName);
        let message = "Password must contain letters and numbers";
        let success = true;

        if (bool) message = "Name or Email already registered, please check details again";

        let isValid = /(^[A-Za-z]+\d+)|(^\d+[A-Za-z]+)$/.test(traderPassword.toString());

        if (isValid && !bool) { message = '' }
        else if (!isValid || bool) { success = false }

        let info =
        {
            Bool: success,
            Message: message
        }

        return info;
    }

    static isEmpty(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    static checkEmail(traderEmail, traderName) {
        fs.readFile('./Credentials/id.json', 'utf8', (err, emailFile) => {
            if (err) {
                console.log("File read failed:", err)
                return;
            }

            // Check if the email file is empty
            let info = (Registration.isEmpty(emailFile)) ? true : false;
            // Else, check if the email or name exists
            if (!info) {
                try {
                    var emailArr = JSON.parse(emailFile);
                    var counter;
                    for (var counter in emailArr.email) {
                        var mail = emailArr.Email[counter];
                        var name = emailArr.Name[counter];
                        if (mail == traderEmail || name == traderName) { // The email is already registered
                            return true;
                        }
                        else {
                            console.log("key.mail " + mail + ' ' + name);
                        }
                    }

                    return false;
                }
                catch (ex) {
                    return false;
                }
            }
        });
    }


    storeCredentials(registration, words) {
        fs.readFile((process.cwd() + "/Credentials/id.json"), 'utf8', function (err, hash) {
            if (err) throw err;
                        
            let objArr = JSON.parse(hash);
            var name = registration.traderName;
            var email = registration.traderEmail;
            
            // Store information
            let info =
            {
                Name: name,
                Email: email,
                Key: words
            }

            objArr.push(info);

            fs.writeFile((process.cwd() + "/Credentials/id.json"), JSON.stringify(objArr), function (err) {
                if (err) throw err;
            });
        });
    }

    async createIdentity(traderName, equity, walletID) {
        traderName = traderName.toString().trim();
        walletID = walletID.toString().trim();
        let traderIdentity = new String();

        /*** - Create a new file system based wallet for managing identities.
         *** - A wallet is unique for every registered user            ***/
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Establish certificate authority
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const caInfo = ccp.certificateAuthorities['ca.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        try {
            // Import identity to the wallet}
            const walletIdentity = await wallet.exists(`${traderName}`);
            if (walletIdentity) {
                console.log('This identity already exists');
                return false;
            } else {
                const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });

                traderIdentity = X509WalletMixin.createIdentity('Org1MSP', enrollment.certificate,
                    enrollment.key.toBytes());
                await wallet.import(traderName, traderIdentity);
            }
            // Establish gateway
            const gateway = new Gateway();

            let connectionOptions = {
                identity: traderName,
                wallet: wallet,
                discovery: { enabled: false, asLocalhost: true }
            };

            // Connect to gateway
            await gateway.connect(ccp, connectionOptions);
            const network = await gateway.getNetwork('mychannel');
            const contract = network.getContract('mycc', 'utilityContract');
            await contract.submitTransaction('createTrader', traderName, equity, walletID);
            const i = await contract.submitTransaction('getTrader', walletID);
            const success = Buffer.from(i, 'utf8').toString();
            console.log("Check if identity exists? " + success);

            if (success == "Trader does not exist")
                return false;

            logger.write('Registration successful \r\n' + success);
        }
        catch (ex) {
            logger.write('Registration failed \r\n' + ex);
            return false;
        }
        return true;
    }
}

class Trader {    /* Handle the design of the main interface */
    constructor() {
        this.equity = "50000";
        this.salt = "mnemonic";
        

    }

    static setBool(bool)
    {
        login = bool;
    }

    static getBool()
    {
       return login;
    }

    
    static setName(name)
    {
        tradername = name;
    }

    static getName()
    {
       return tradername;
    }


    authLogin(walletID, traderPassword) {
        var name = '';
        // Validate hash
        fs.readFile((process.cwd() + "/Credentials/id.json"), 'utf8', function (err, hash) {
            if (err) throw err;
            let objArr = JSON.parse(hash);
          
            for (var count = 0; count < objArr.length; count++) {
                var key = objArr[count].Key;
                if (Trader.verfifyHash(Buffer.from(key, 'utf8'), traderPassword, walletID.toString().trim())) {
                    name = objArr[count].Name; 
                    Trader.setName(name);  
                    Trader.setBool(true);
                    break;
                }
            }
        });

        let Credentials = { Name: Trader.getName(), ValidCredentials: Trader.getBool() };
        return Credentials;
    }




    /**
     * @param {words} Key Mneumonic words that make up the key (this is stored)
     * @param {password} Password The password (this remains secret and is not stored in any capacity)
     * @param {walletID} WalletID Wallet identification
     */
    static verfifyHash(key, password, walletID) {
        let salt = new Trader().salt;
        let hardSalt = salt.concat(password.toString()).trim();
        key = new String(key).toString().trim();
        hardSalt = new String(hardSalt).toString().trim();

        var res = pbkdf2.pbkdf2Sync(key, hardSalt, 2048, 8, 'sha512');
        res = res.toString('hex');
        let isValid = (res === walletID) ? true : false;

        return isValid;
    }
}


class Transaction {
    constructor() {
    }

    async submitTransaction(amount, multiplier, option, traderName, walletID) {
        amount = amount.toString().trim();
        multiplier = multiplier.toString().trim();
        walletID = walletID.toString().trim();
        option = option.toString().trim();
        traderName = traderName.toString().trim();

        /*** - Create a new file system based wallet for managing identities.
         *** - A wallet is unique for every registered user            ***/
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Establish certificate authority
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        try {
            const walletIdentity = await wallet.exists(`${traderName}`);
            if (walletIdentity)
                console.log('This identity exists');
            else
                return false;

            // Establish gateway
            const gateway = new Gateway();

            let connectionOptions = {
                identity: traderName,
                wallet: wallet,
                discovery: { enabled: false, asLocalhost: true }
            };

            // Connect to gateway
            await gateway.connect(ccp, connectionOptions);
            const network = await gateway.getNetwork('mychannel');
            const contract = network.getContract('mycc', 'traderContract');
            await contract.submitTransaction('orderTransact', amount, multiplier, option, walletID);
            const i = await contract.submitTransaction('getTransactions', walletID);
            const success = Buffer.from(i, 'utf8').toString();
            console.log("trans " + success);
         
            if (success == "Trader does not exist")
                return false;

            logger.write('Transaction successful \r\n' + success);
        } catch (ex) {
            logger.write('Transaction failed \r\n' + ex);
            console.log(ex);

            return false;
        }

        return true;
    }
}

module.exports = { Registration, Trader, Transaction };