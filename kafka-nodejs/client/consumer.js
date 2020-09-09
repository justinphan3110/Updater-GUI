const {Kafka} = require('kafkajs');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const config = require('../utils/config');
const router = express.Router();


const kafka = new Kafka({
  clientId: 'kafka-node-app',
  brokers: [config.kafka_host+':'+config.kafka_broker1_port]
})



router.ws('/', async (ws,req) =>{
    console.log(ws.readyState);
    
    try {
      ws.on('message', function(msg) {
        const sub = async (topicName) =>{
          const consumer = kafka.consumer({ groupId: "node-js-consumer" + Math.random(), memberId: "kafka-node-app"});
          await consumer.connect();
          await consumer.subscribe({topic: "ner-incremental-local", fromBeginning: true});

          await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
              ws.send(message.value.toString());
            }
            
          });
        }
        sub(msg).catch();
      })
    } catch(e) {
      console.log("some error")
    }
})

module.exports = router;