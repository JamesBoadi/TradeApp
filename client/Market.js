import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './css/MainInterface.css';
import Chart from "react-apexcharts";

class Market extends Component {    /* Handle the design of the main interface */
   constructor(props) {
      super(props);

      this.submitTransaction = this.submitTransaction.bind(this);
      this.getStockInformation = this.getStockInformation.bind(this);
      this.logout = this.logout.bind(this);

      this.tradName = React.createRef();
      this.historicalData = [8];
      this.realTimeData = 0;
      this.TICKINTERVAL = 120;// Changed to every 2 minutes
      this.XAXISRANGE = 777600000;
      var finalData = [8];
      global.finalData = finalData;
      this.currentDate = new Date();
      this.time = this.currentDate.getDay() + "/" + this.currentDate.getMonth() + "/" +
         this.currentDate.getFullYear()// + "  " + this.currentDate.getHours()+":"+this.currentDate.getSeconds()


      this.state = {

         stock: "SNAP",
         homepage: false,
         series: [
            {
               name: "Graph", // stock name
               data: [250, 260, 261.2, 284.1]
            }
         ],
         options: {
            title: {
               text: this.time,
               align: 'center'
            },

            stroke: {
               curve: 'smooth'
            },
            markers: {
               size: 0
            },

            legend: {
               show: false
            }
         }

      };
   }


   getStockInformation() {
      const url = new URL( // Auto update the order (P/L)
         "https://financialmodelingprep.com/api/v3/stock/real-time-price/AAPL" // The broker will first have to confirm if there are enough funds before updating an order
      );

      fetch(url, { // might have to change
         method: "GET",
      })
         .then(response => response.json()
         ).then(responseData => {

            this.realTimeData = { stock: "AAPL", price: responseData.price };

         }
         );

      const newurl = new URL( // Auto update the order (P/L)
         "https://financialmodelingprep.com/api/v3/historical-chart/1hour/AAPL" // The broker will first have to confirm if there are enough funds before updating an order
      );

      fetch(newurl, { // might have to change
         method: "GET",
      })
         .then(response => response.json()
         ).then(responseData => {

            var hours = 0;
            while (hours < 8) {
               this.historicalData[hours] = { price: responseData[hours].close };
               hours++;
            }

            this.getDayWiseTimeSeries(this.historicalData);
         }
         );

      return new String(this.realTimeData.price);
   }

   logout() {
      localStorage.clear();
      this.setState({ homepage: true });
   }

   submitTransaction() // send a request to the server using a xttprequest
   {
      var urlEncodedData = "";
      var pairs = [];

      var option = document.getElementById('option').value;
      var amount = document.getElementById('amount').value;
      var multiplier = document.getElementById('multiplier').value;
      var walletID = localStorage.getItem('id');
      var name = localStorage.getItem('name');

      // Push historicalData here
      pairs.push(encodeURIComponent('option') + '=' + encodeURIComponent(option));
      pairs.push(encodeURIComponent('multiplier') + '=' + encodeURIComponent(multiplier));
      pairs.push(encodeURIComponent('amount') + '=' + encodeURIComponent(amount));
      pairs.push(encodeURIComponent('walletID') + '=' + encodeURIComponent(walletID));
      pairs.push(encodeURIComponent('name') + '=' + encodeURIComponent(name));

      urlEncodedData = pairs.join('&').replace(/%20/g, '+'); // Key-pair values

      var url = "http://localhost:3001/submitTransaction/?" + urlEncodedData;

      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      request.send(); // Send the body

      request.onload = function () {
         try {
            let bool = JSON.parse(request.responseText);
            if (bool == true) {
               document.getElementById('amount').value = '';
               document.getElementById('multiplier').value= '';
               alert('Successful transaction');
            }
            else {
               document.getElementById('amount').value = '';
               document.getElementById('multiplier').value= '';
               alert('Transaction failed');
            }
         }
         catch (ex) {
            console.log(ex + ' error');
         }
      };
   }

   render() {
      if (this.state.homepage) {
         return <Redirect to={"/"} />
      }
      return (
         <div>
            <div class="container" id="main-container">  { /* create two columns with one nested column */}
               <div class="row" id="bar">

                  <h3 style={{ position: "fixed" }, { font: "arial" }, { transform: "translate(600px, 0px)" }}> Name:  {localStorage.getItem('name')}{/*this.name.stock*/}</h3> { /*Account information goes here */}

                  <div id="equity">
                     <h3 style={{ position: "fixed" }, { font: "arial" }, { transform: "translate(700px, 0px)" }} >Stock: SNAP {/*this.state.stock*/} </h3>
                  </div>

                  <div id="profitloss">
                     <h3 style={{ position: "fixed" }, { font: "arial" }, { transform: "translate(750px, 0px)" }} >Price: 2.86 {/*this.state.price*/}</h3> {/* Add objects that we can update */}
                  </div>

                  <div id="register">
                     <button style={{ position: "fixed" }, { font: "arial" }, { transform: "translate(800px, 0px)" }} onClick={this.logout} > Log Out </button> {/* Add objects that we can update */}
                  </div>

               </div>
               <div class="row" >
                  <div class="col-md-4" id="col-1">
                     <div class="sidenav">
                        <a href="#">Account</a>
                        <a href="#">Order History</a>
                        <a href="#">About</a>
                     </div>
                  </div>

                  <div class="col-md-8" id="col-2">
                     <div class="row">
                        <div class="col-md-8" id="col-3"> {/* Where the graph is, dnable visibility upon button click */}
                           <form class="px-4 py-3" id="border">
                              <div class="form-group" style={{ position: "fixed" }, { textAlign: "center" }}>
                                 <h3>Order form</h3>
                              </div>

                              <div class="form-group" style={{ position: "fixed" }, { transform: "translate(0px, 0px)" }}>
                                 <label>Amount</label>
                                 <input class="form-control" id="amount" aria-describedby="amountHelp" placeholder="Amount"></input>
                                 <select class="form-control" id="option">
                                    <option>Call</option>
                                    <option>Put</option>
                                 </select>
                              </div>

                              <div class="form-group" style={{ position: "fixed" }, { transform: "translate(0px, 0px)" }}>
                                 <div class="d-inline-block">
                                    <label>Mutiplier</label>
                                    <div class="d-inline-block">
                                       <input class="form-control" id="multiplier" aria-describedby="multiplier" placeholder="Multiplier"></input>
                                    </div>
                                 </div>

                                 <div class="d-inline-block"> {/* aligns to the right, enter forms*/}
                                    <div class="d-inline-block">
                                       <p id="max" style={{ marginLeft: "20px" }} >Range: 20-100</p>
                                    </div>
                                    <div class="d-inline-block">
                                       <button type="submit" id="decreaseMul" onClick={this.decreaseMultiplier} style={{ position: "fixed" }, { marginLeft: "110px" }}>-</button>
                                       <button type="submit" id="increaseMul" onClick={this.increaseMultiplier} style={{ position: "fixed" }, { marginLeft: "15px" }}>+</button>
                                    </div>
                                 </div>
                              </div>

                              <button type="submit" style={{ position: "fixed" }, { float: "right" }} onClick={this.submitTransaction}>Place Order</button>
                           </form>
                        </div>

                        <div class="col-md-4" id="col-4"> {/* Where the order form goes */}
                           <div id="lineGraph">
                              <div id="chart" >
                                 <Chart options={this.state.options} series={this.state.series} type="line" height={350} width={800} />
                              </div>
                           </div>

                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}

export default Market;