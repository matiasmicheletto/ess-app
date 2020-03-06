// Debe instalarse ws con npm antes de usar este script:
//
//    $ npm install -g ws
//
// Ejecutar con 
//
//    $ node ./WebScoketServer.js
//

var WebSocketServer = require('ws').Server; 

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket en puerto 8081

var clients = []; // Lista de clientes conectados

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente

    cl.index = clients.length - 1; // Asignar indice al cliente (para identificarlo)

    clients.push(cl); // Agregar nuevo cliente a la lista

    console.log("Nuevo cliente conectado.");
    console.log(clients);

    // Definir callbacks

    cl.on('message', function (remote_db) { // Callback cuando el cliente envia datos        
        console.log("Recibido: ",remote_db); // Se asume que manda su base de datos siempre

        var local_db = loadDatabase(); // Leer datos locales

        var resulting_db = mergeDatabases(local_db, remote_db); // Combinar con lo recibido

        cl.send(JSON.stringify(resulting_db)); // Responder nueva base de datos a la app

        writeDatabase(resulting_db); // Actualizar base de datos local
    });

    cl.on('close', function () { // Callback cierre de conexion
        clients.splice(cl.index,1); // Quitar del arreglo
        console.log("Cliente desconectado.");
        console.log(clients);
    });
});


var loadDatabase = function(){ // Leer base de datos mas reciente desde archivo

        // Hardcodeada por ahora

        var location = {lat: -38.6942173, lng: -62.2566036}; // Bahia blanca

        var wus = [ // Ejemplo WUs
            {latlng: {lat:location.lat+0.01, lng: location.lng+0.016}, id: "wu_0", status: "up"},
            {latlng: {lat:location.lat-0.01, lng: location.lng+0.02}, id: "wu_1", status: "up"},
            {latlng: {lat:location.lat+0.02, lng: location.lng-0.006}, id: "wu_2", status: "down"},
            {latlng: {lat:location.lat-0.008, lng: location.lng+0.018}, id: "wu_3", status: "unknown"}
        ];
        var markers = [ // Ejemplo marcadores al azar
            {latlng: {lat:location.lat+0.005, lng: location.lng+0.006}, id:"a8uhn7eHUJnheUJ3n9In", timestamp: 1579123392000, validated: true, type: "fire"},
            {latlng: {lat:location.lat-0.009, lng: location.lng+0.003}, id:"won7HYd3N7jOmd7UHjw3", timestamp: 1579126992000, validated: true, type: "electricity"},
            {latlng: {lat:location.lat-0.015, lng: location.lng-0.001}, id:"9oiMN7yHG6eHBGeBY382", timestamp: 1579123792000, validated: false, type: "other" },
            {latlng: {lat:location.lat-0.013, lng: location.lng+0.016}, id:"HNue3HNplU893PmUjd3U", timestamp: 1579124392000, validated: true, type: "collapse" },
            {latlng: {lat:location.lat+0.012, lng: location.lng-0.016}, id:"vhUH3m893NMehd7Uje31", timestamp: 1579127092000, validated: false, type: "collapse" },
            {latlng: {lat:location.lat+0.003, lng: location.lng+0.005}, id:"Pmsu1w9UbeImJ3m93108", timestamp: 1579133392000, validated: false, type: "gas" }
        ];    
        var waypoints = [ // Ejemplo de una ruta cualquiera:
            {lat:location.lat-0.005, lng: location.lng-0.006},
            {lat:location.lat-0.016, lng: location.lng-0.007},
            {lat:location.lat-0.018, lng: location.lng-0.007},
            {lat:location.lat-0.02, lng: location.lng-0.008}
        ];

        return { 
            wus: wus,
            markers:markers,
            waypoints:waypoints
        };
};

var writeDatabase = function(db){ // Guardar nueva database en nuevo archivo
    
    // TODO: Leer archivo json con base de datos

};

var mergeDatabases = function(local_db, remote_db){ // Combinar informacion

    // TODO: Algoritmo de combinacion de informacion

    return local_db;
};

console.log("Server WU esperando conexiones...");