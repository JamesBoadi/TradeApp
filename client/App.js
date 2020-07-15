import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {
   Route,
   NavLink,
   HashRouter
} from "react-router-dom";

//import './Register.css';
import Market from "./Market";
import Register from './Register';
import Login from './Login';


class MainInterface extends Component {    /* <Route path="/Market" component={Market} />   <li><NavLink to="/Market">Market</NavLink></li>Handle the design of the main interface https://stackoverflow.com/questions/50644976/react-button-onclick-redirect-page*/
   render() {
      
      return (
  
         <HashRouter>
            <div>
             
               <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous"></link>
                 <ul className="header">  
                  <li><NavLink to="/Login">Log in</NavLink></li>
                  <li><NavLink to="/Register">Register</NavLink></li>
               </ul>
             
               <div   >
               <Route path="/Login" component={Login}/>
                  <Route path="/Register" component={Register}/>
                  <Route path="/Market" component={Market} />
               </div>
           
            </div>
         </HashRouter>

      );
   }
}

class App extends Component {
   render() {
      return (
         <div>

            <MainInterface />
            {/* https://www.golangprograms.com/how-to-create-simple-react-router-to-navigate-multiple-pages.html
            <ul className="header"> {/* Enable visibility when user is logged in
                  <li><NavLink to="/">Register</NavLink></li>
                  <li><NavLink to="/Market">Market</NavLink></li>
               </ul>
            
            
            
            
            
            
            */}

         </div>

      );
   }
}

ReactDOM.render(<App />, document.getElementById('app'));

export default App;