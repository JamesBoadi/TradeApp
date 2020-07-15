import React from 'react';
import { Redirect } from 'react-router-dom';
import './css/Login.css';


class Home extends React.Component {    /* Handle the design of the main interface */
    constructor(props) {
        super(props);

        this.login = this.login.bind(this);
        this.state = { redirect: false, homepage: false }; // Can have as many variables
    }

    
    login()  
    {
        var urlEncodedData = "";
        var pairs = [];

        var walletID = document.getElementById('walletID').value;
        var password = document.getElementById('password').value;

        pairs.push(encodeURIComponent('walletID') + '=' + encodeURIComponent(walletID)); // Push data here
        pairs.push(encodeURIComponent('password') + '=' + encodeURIComponent(password));

        urlEncodedData = pairs.join('&').replace(/%20/g, '+'); // Key-pair values

        var url = "http://localhost:3001/verifylogin/?" + urlEncodedData; // send the data as a query

        var request = new XMLHttpRequest();
        request.open('GET', url, true); // Send data to server
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send(); // Send the body
        request.onload = function () {
            try {
                var text = JSON.parse(request.responseText);

                if (text.ValidCredentials) {
                    localStorage.setItem('login', 'true');
                    localStorage.setItem('id', walletID); // Not secure, but a quick workaround!
                    localStorage.setItem('name', text.Name);

                    alert('You are now logged in');

                    this.setState({ redirect: true });
                }

                else {
                    localStorage.setItem('login', 'false');
                    alert('Your credentials were not valid, please check your WalletID/Password');
                }
            }
            catch (ex) {
                console.log(ex + ' error');
            }
        }.bind(this);
    }


    render() {

        if (this.state.redirect) {
            return <Redirect to={"/Market"} />
        }

        return (
            <div class="background">
               <h2 id="title" style={{ color: "white" }}>Login</h2>
                <div id="form" style={{ textAlign: "center" }, { backgroundColor: "black" }}>
                    <form>
                        <div class="form-group">
                            <label for="walletID" style={{ color: "white" }}>WalletID </label>
                            <input type="text" id="walletID" class="form-control" aria-describedby="walletIDHelp" placeholder="Enter your walletID here"></input>
                        </div>
                        <div class="form-group">
                            <label for="password" style={{ color: "white" }}>Password</label>
                            <input type="password" id="password" class="form-control" placeholder="Enter your password here"></input>
                        </div>
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="checkbox" ></input>
                            <label class="form-check-label" for="exampleCheck1">Hide password</label>
                        </div>
                        <button type="submit" class="btn btn-primary" id="register" onClick={this.logout} style={{ float: "right" }}>Log out</button>
                        <button type="submit" class="btn btn-primary" id="register" onClick={this.login} style={{ float: "right" }}>Log in</button>
                    </form>
                </div>
              
            </div>
        );
    }
}

export default Home;