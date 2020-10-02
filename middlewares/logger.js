require('dotenv').config();
const jwt = require('jsonwebtoken');

const {NODE_ENV, JWT_SECRET} = process.env;