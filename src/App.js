import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Navigation from './containers/Navigation';
import { Dashboard } from './containers/Dashboard';
import Profile from './containers/Profile';
import Calculator from './containers/Calculator';

import { ToastContainer } from 'react-toastify';


const App = () => (
  (
    <div className="App">
      <Route component={Navigation} />
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/calculator" component={Calculator} />
        <Route render={() => (<h1 className="not-found">Na Fam</h1>)} />
      </Switch>
      <ToastContainer  autoClose={8000} />
    </div>
  )
);

export default App;
