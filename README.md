###################################################################
              Blockchain online trading platform 
###################################################################
This app requires the following folders to run


App -
        - basic-network
        - bin
        - chaincode
        - client
        - git

###################################################################
                             Client
###################################################################
client -
        - images
        - index
                - server.js
                - client.js
        - node_modules
        - wallet

Missing packages:
Run the following commands to reinstall them

export NODE_PATH='yourdir'/node_modules

Testing nodejs chaincode



Installing the prototype
This prototype runs on Linux, it can also run on Windows but either Docker or a Virtual Machine running Linux is needed. The prior requires additional configuration beyond the scope of this manual.
In order to run the application, the following prerequisites need to be installed on the system root directory first

⦁	Docker Engine (Latest version) https://docs.docker.com/engine/install/
⦁	Golang Programming Language (Version 10.4) https://golang.org/dl/
⦁	NPM (Version 3.5.2 or higher) https://nodejs.org/en/download/package-manager/
⦁	Python 2.7x and Pip https://www.python.org/downloads/
⦁	Visual studio code https://code.visualstudio.com/

The project structure is as follows

The following dependencies are needed to run the application

⦁	express
⦁	body-parser
⦁	pbkdf2
⦁	bitcore-mnemonic

If any of the dependancies are missing, you can install them by running the following command

npm install --missing dependencies--

Before installing any of the dependencies, it may be useful to export the path so that it installs in the local directory (workspace directory)
export NODE_PATH=/node_modules 
or
export NODE_PATH=${workspaceFolder}/node_modules

Running the blockchain using Hyperledger Fabric
Before the website can run, the blockchain must be running first.

To run the blockchain
⦁	Open visual studio and open the basic-network folder 

 

⦁	Open the terminal; this can be done by navigating to the terminal menu  terminal -> new terminal
 

⦁	Type sudo ./start.sh

If successful, you should see the following
 
Bash-5.0 simply means we can now execute blockchain commands through the docker container. 
To run execute the smart contract directly on the blockchain itself, it must be written exactly in the following format.
peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n mycc -c '{"function":"utilityContract:setCommission","Args":["200"]}'

You can find some more of these functions in a file called “Blockchain Functions”.

⦁	To stop the blockchain from running, simply type Type sudo ./stop.sh

#### Quick demo 
```
cd basic-network

chmod 777 start.sh

./start.sh
```
