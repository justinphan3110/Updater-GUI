const Pool = require('pg').Pool

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gazetteer',
  password: 'postgres',
  port: 5432,
});

const fetch_all_query = "SELECT wikidata_id, title, aliases, page_view, type, data \
FROM public.wikidata_entities \
ORDER BY page_view DESC"

const getEntities = () => {
    console.log("start fetching wiki data")
      pool.query(fetch_all_query, (error, results) => {
        
        if (error) {
           console.log("fetching wiki data failed"); 
          return {}
        }

        console.log("fetching wiki data done");
        return results
      });
}

module.exports = {
    getEntities,
}