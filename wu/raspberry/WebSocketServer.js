// Debe instalarse ws con npm antes de usar este script:
//
//    $ npm install -g ws
//
// Ejecutar con 
//
//    $ node ./WebScoketServer.js
//

const WebSocketServer = require('ws').Server; // WSS
const MQTT = require('mqtt'); // MQTT
const Fs = require('fs'); // File Storage

// Puertos
const WSS_PORT = 443;
const MQTT_PORT = 1883;

// Config mqtt
const brokerAddr = 'mqtt://localhost:'+MQTT_PORT;
const inTopic = 'wu1/messageIn';
const outTopic = 'wu1/messageOut';

const txPeriod = 10000; // Periodo de transmision de datos mqtt
var txEnabled = false; // Habilitacion para transmitir

const DEBUG = true; // Modo debuggeo

/////// WEB SOCKETS ////////

var wss = new WebSocketServer({port: WSS_PORT}); // Servidor WebSocket en puerto 443

var clients = []; // Lista de clientes conectados al web socket server

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente

    cl.index = clients.length - 1; // Asignar indice al cliente (para identificarlo)

    clients.push(cl); // Agregar nuevo cliente a la lista

    if(DEBUG) console.log("Nuevo cliente conectado.");
    //console.log(clients);

    // Definir callbacks

    cl.on('message', function (data) { // Callback cuando el cliente envia datos        
        //console.log("Recibido: ",data); // Se asume que manda su base de datos siempre
        
        var remote_db = JSON.parse(data); // Base de datos enviada por la app
        
        var local_db = loadDatabase(); // Leer datos locales

        var resulting_db = mergeDatabases(local_db, remote_db); // Combinar con lo recibido de la app

        cl.send(JSON.stringify(resulting_db)); // Responder la nueva base de datos a la app

        writeDatabase(resulting_db); // Actualizar base de datos local
    });

    cl.on('close', function () { // Callback cierre de conexion
        clients.splice(cl.index, 1); // Quitar del arreglo
        if(DEBUG) console.log("Cliente desconectado.");
        //console.log(clients);
    });
});

if(DEBUG) console.log("Server WU esperando conexiones...");




///// LECTURA / ESCRITURA DB ///////

var loadDatabase = function () { // Leer base de datos mas reciente desde archivo
    if(DEBUG) console.log("Leyendo database.json local.");
    var database = null;
    try {
        database = JSON.parse(Fs.readFileSync('database.json'));
    } catch (err) {
        if(DEBUG){
            console.log("Error de lectura database.json:");
            console.log(err);
        } 
    }

    if (database) return database;
};

var writeDatabase = function (db) { // Guardar nueva database en nuevo archivo
    if(DEBUG) console.log("Actualizando database.json local.");
    Fs.writeFileSync('database.json', JSON.stringify(db));
};

var mergeDatabases = function (local_db, remote_db) { // Combinar informacion de dos bases de datos

    if(DEBUG) {
        console.log("Combinando bases de datos...");
        console.log("Eventos recibidos desde app: "+remote_db.markers.length);
        console.log("Eventos en base de datos local: "+local_db.markers.length);
    }

    // Crear objeto con lista de marcadores de las dos db
    var newMarkerList = {};
    for(var k in local_db.markers) // Agregar los marcadores locales
        newMarkerList[local_db.markers[k].id] = local_db.markers[k];
    
    for(var k in remote_db.markers) // Agregar los marcadores que se importaron
        if(!newMarkerList[remote_db.markers[k].id]){ // Si no lo tiene
            remote_db.markers[k].validated = true; // Marcar como validado
            newMarkerList[remote_db.markers[k].id] = remote_db.markers[k]; // Agregar
            if(DEBUG) console.log("Nuevo marcador agregado a la db local: "+remote_db.markers[k].id);
        }
    
    // Crear la nueva lista de marcadores como arreglo
    var markers = []; // Borrar arreglo
    for(var k in newMarkerList)
        markers.push(newMarkerList[k]);

    //
    //
    // TODO: Combinar la lista de wu y de waypoints ?
    //
    //

    if(DEBUG) console.log("Retornando: "+markers.length+" eventos totales.");

    return {
        wus: local_db.wus,
        markers: markers,
        waypoints: local_db.waypoints
    };
};




//////// MQTT //////////////

var mqttClient = MQTT.connect(brokerAddr, {port:MQTT_PORT});

// Parar desconectar usar:
//     mqttClient.end();

mqttClient.on('connect', function () { // Callback conexion
    if(DEBUG) console.log("Conectado al broker: "+brokerAddr);
    mqttClient.subscribe(inTopic, function (err) {
        if(DEBUG) console.log("Error de subscribe");
        if(err) console.log(err);
    });

    txEnabled = true; // Habilitado para transmitir
});

mqttClient.on('message', function (topic, message) { // Mensaje es tipo Buffer
    if(DEBUG) console.log("["+topic+"] - Mensaje del broker: "+message.toString());
});

var mqttSend = function(payload){ // Enviar mensaje al broker
    return new Promise(function(fulfill,reject){ // Retorna callback asincrono
        if(DEBUG) console.log("Enviando "+payload);
        mqttClient.publish(outTopic, payload, fulfill);
    });
};

var timer = setInterval( function(){ // Funcion periodica
    // Va mandando los markers de a uno por vez cada 10 segundos hasta que figuren todos como reported = true
    // Para detener usar: 
    //     clearInterval(timer)

    var local_db = loadDatabase(); // Leer datos locales

    if(txEnabled){ // Si esta habilitado para transmitir
        for(var k in local_db.markers){ // Busca el primer marcador de la db que no fue transmitido
            if(!local_db.markers[k].reported){
                var data = local_db.markers[k]; // Copia del marcador
                data.reported = true; // Cambiar estado para que llegue como reported
                mqttSend(JSON.stringify(data))
                .then(function(){ // Cambiar el reported por true si envia bien el dato
                    local_db.markers[k].reported = true;
                    writeDatabase(local_db); // Actualizar
                })
                break; // Terminar ciclo for para que no envie mas eventos hasta la proxima transmision
            }
        }
    }
}, txPeriod);