const express = require('express')
const app = express()
const port = 3001
const wikidata_model = require("./models/wikidata_model")


//Import Routes
const wikidata_route = require("./routes/wikidata_route");

//Import Dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(bodyParser.json());
app.use(cors());


// Listen on ${port}
app.listen(port, () => {
    console.log(`App running on port ${port}.`);
    
});

(async function() {
    console.info("start fetching data");
    app.set("wikidata", await wikidata_model.getEntities());

    console.info("fetching data done")
    // The rest of your app startup logic
})(()=> console.log("done"));


/// Route
app.use('/wikidata', wikidata_route);


// const wikidata_entities = wikidata_model.getEntities().then(response => {
//     // console.log(response)
//     return response
//     })
//     .catch(error => {
//         return []
// }) 

// console.log(wikidata_entities)



// app.get('/', async(req, res) => {
    
//     res.json({'data': 'hello world'})
// })

// app.on('fetching_data', () => {
//     console.log("fecthing data")
// })

