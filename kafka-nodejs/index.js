const express = require('express');
const bodyParser = require('body-parser');

require("dotenv").config();
const cors = require('cors');


const adminRoute = require('./admin/admin-client');
const producerRoute = require('./client/producer');
const consumerRoute = require('./client/consumer');

const port = process.env.PORT || 3001
const app = express();
const expressWS = require('express-ws')(app);

//Middlewares
app.use(bodyParser.json());
app.use(cors());

// route
app.use('/admin-client',adminRoute);
app.use('/producer', producerRoute);
app.use('/consumer', consumerRoute);


// Listen on ${port}
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
    
});