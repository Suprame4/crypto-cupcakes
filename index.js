require('dotenv').config('.env');
const cors = require('cors');
const express = require('express');
const app = express();
const morgan = require('morgan');
const { PORT = 3000 } = process.env;
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
// TODO - require express-openid-connect and destructure auth from it

const { User, Cupcake } = require('./db');

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
  // define the config object
  // attach Auth0 OIDC auth router
  // create a GET / route handler that sends back Logged in or Logged out

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
  };
  
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
  
// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    console.log(req.oidc.user);

    const authHomePage = ` 
      Welcome, ${req.oidc.user.name}
      Username: ${req.oidc.user.nickname}
      ${req.oidc.user.email}
      ${req.oidc.user.picture}
      `



    res.send(req.oidc.isAuthenticated() ? authHomePage : 'Logged out');
  })


app.get('/cupcakes', requiresAuth(),  async (req, res, next) => {
  try {
    const cupcakes = await Cupcake.findAll();
    res.send(cupcakes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// error handling middleware
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if(res.statusCode < 400) res.status(500);
  res.send({error: error.message, name: error.name, message: error.message});
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.listen(PORT, () => {
  console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});

