const {Kafka} = require('kafkajs');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const config = require('../utils/config');
const router = express.Router();

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');

const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [config.kafka_host+':'+config.kafka_broker1_port]
})

var footballLeagueIds = []
fs.createReadStream(path.resolve('', 'data', 'startseite_wettbewerb.csv'))
    .pipe(csv.parse({ headers: true }))
    .on('error', (error) => console.error("League Id File not found: Looking for startseite_wettbewerb.csv"))
    .on('data', (row) => footballLeagueIds.push(row.transfermarktLeagueID))
    .on('end', (rowCount) => console.log(`Parsed ${rowCount} football league IDs`))


router.get('/football/leagueIDs', async (req, res) => {
  res.json({'leagueIDs': footballLeagueIds})
})

router.ws('/football/:type', async (ws,req) =>{
  const type = req.params.type
  
  try {
    ws.on('message', function(msg) {
      const sub = async (topicName) =>{
        const consumer = kafka.consumer({ groupId: "node-js-consumer" + Math.random(), memberId: "kafka-node-app"});
        await consumer.connect();
        await consumer.subscribe({topic: "ner-incremental-local", fromBeginning: true, offset: 100});
        
        try {
          await consumer.run(
            { 

              eachMessage: async ({topic, partition, message}) => {
                // console.log(message.value.toString());
                const m = JSON.parse(message.value.toString());
                // get message related to football match
                if(m.entityType !== 'football' || m.type !== type)
                  return;

                try {
                  ws.send(message.value.toString());
                } catch (error) {
                  // console.log('Failed to process message, sending to DLQ');
                }
              }
            }
          );
        }catch(e) {
          console.log("error in consumer each message");
        } 
      }
      sub(msg).catch();
    })
  } catch(e) {
    console.log("some error")
  }
})

router.ws('/wikidata', async (ws,req) =>{
    console.log(ws.readyState);
    
    try {
      ws.on('message', function(msg) {
        const sub = async (topicName) =>{
          const consumer = kafka.consumer({ groupId: "node-js-consumer" + Math.random(), memberId: "kafka-node-app"});
          await consumer.connect();
          await consumer.subscribe({topic: "ner-incremental-local", fromBeginning: true});
          
          try {
            await consumer.run(
              { 

                eachMessage: async ({topic, partition, message}) => {
                  // console.log(message.value.toString());
                  const m = JSON.parse(message.value.toString());
                  // get message related to wiki
                  if(m.entityType !== 'wiki')
                    return;

                  try {
                    ws.send(message.value.toString());
                  } catch (error) {
                    // console.log('Failed to process message, sending to DLQ');
                  }
                }
              }
            );
          }catch(e) {
            console.log("error in consumer each message");
          } 
        }
        sub(msg).catch();
      })
    } catch(e) {
      console.log("some error")
    }
})

module.exports = router;