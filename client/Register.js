import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import './css/Register.css';

class Register extends Component {    /* Handle the design of the main interface */
    constructor(props) {
        super(props);

        this.registerUser = this.registerUser.bind(this);
        this.state = { redirect: false };
        //  this.registerUser = this.registerUser.bind(this);
    }
    registerUser() { // change to post
        var urlEncodedData = "";
        var pairs = [];

        var username = document.getElementById('name').value;
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;

        pairs.push(encodeURIComponent('name') + '=' + encodeURIComponent(username));
        pairs.push(encodeURIComponent('email') + '=' + encodeURIComponent(email)); // Push data here
        pairs.push(encodeURIComponent('password') + '=' + encodeURIComponent(password));

        urlEncodedData = pairs.join('&').replace(/%20/g, '+'); // Key-pair values

        var url = "http://localhost:3001/register/?" + urlEncodedData;

        var request = new XMLHttpRequest();
        request.open('GET', url, true); // Send data to server
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(); // Send the body



        request.onload = function () {
            try {
                var res = request.responseText;
                var obj = JSON.parse(res);

                var message = obj.Message;
                if (obj.Bool) {

                    this.setState({ redirect: true });


                }
                else {
                    document.getElementById('name').value = username;
                    document.getElementById('email').value = email;
                    document.getElementById('password').value = password;

                    document.getElementById('name').style.backgroundColor = 'red';
                    document.getElementById('email').style.backgroundColor = 'red';
                    document.getElementById('password').style.backgroundColor = 'red';

                    alert(`${message}`);
                }
            }
            catch (ex) {
                console.log(ex + ' error');
            }
        }.bind(this);



    }


    render() {

        if (this.state.redirect) {

            return <Redirect to={"/Login"} />
        }

        return (
            <div class="background">
      
                <h2 id="title" style={{ color: "white" }}>A BlockChain Driven Online Trading Platform</h2>
                <div id="form" style={{ textAlign: "center" }, { backgroundColor: "black" }}>
                    <form>
                        <div class="form-group">
                            <label for="name" style={{ color: "white" }}>Name</label>
                            <input type="text" id="name" class="form-control" aria-describedby="nameHelp" placeholder="Enter your name here"></input>
                        </div>
                        <div class="form-group">
                            <label for="emai1" style={{ color: "white" }}>Email address</label>
                            <input type="email" id="email" class="form-control" aria-describedby="emailHelp" placeholder="Enter your email here"></input>
                        </div>
                        <div class="form-group">
                            <label for="password" style={{ color: "white" }}>Password</label>
                            <input type="password" id="password" class="form-control" placeholder="Enter your password here"></input>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="checkbox" ></input>
                            <label class="form-check-label" for="exampleCheck1">Hide password</label>
                        </div>
                        <button type="submit" class="btn btn-primary" id="register" onClick={this.registerUser} style={{ float: "right" }}>Register</button>

                    </form>
                </div>
            </div>
        );
    }
}


export default Register;