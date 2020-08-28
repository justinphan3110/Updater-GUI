const express = require('express');
const router = express.Router();

const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gazetteer',
  password: 'postgres',
  port: 5432,
});

const fetch_all = "SELECT wikidata_id, title, aliases, page_view, type, data \
FROM public.wikidata_entities \
ORDER BY page_view DESC"


router.get('/', async (req, result) => {
    console.log("get  wikidata");
    console.log(app.get("wikidata"));

    // pool.query(fetch_all, (err, res) => {
    //     if(err) {
    //         console.log(err.stack)
    //         result.json({message: "query wiki data failed"})
    //     }
    //     else {
    //         console.log('query wiki data successfully')
    //         result.json({message: "query wiki data successfully", count: res.rowCount, data: res.rows[0]})
    //     }

    // })
})

module.exports = router;