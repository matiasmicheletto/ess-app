
const MQTT = require('mqtt'); // MQTT

const brokerAddr = 'mqtt://localhost:1883';
const inTopic = 'wu1/messageIn';
const outTopic = 'wu1/messageOut';

//////// MQTT //////////////

var options = {
  port:1883
};
var mqttClient = MQTT.connect(brokerAddr, options);

mqttClient.on('connect', function () { // Callback conexion
    console.log("Conectado al broker: "+brokerAddr);
    mqttClient.subscribe(inTopic, function (err) {
        if(err){
            console.log("Error de subscribe");
            console.log(err);
         }
    });
    setInterval(function(){
        mqttSend("Hola "+Math.random());
    },2000);
});

mqttClient.on('message', function (topic, message) { // Mensaje es tipo Buffer
    console.log("["+topic+"] - Mensaje del broker: "+message.toString());
});

var mqttSend = function(payload){ // Enviar mensaje al broker
    console.log("Enviado "+payload);
    mqttClient.publish(outTopic, payload, function(){
        console.log("Mensaje enviado a "+outTopic);
        //mqttClient.end();
    });
};
