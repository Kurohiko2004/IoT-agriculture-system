const express = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const hostname = process.env.HOST_NAME;

console.log(process.env);