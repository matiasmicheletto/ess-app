var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket en puerto 8081

var clients = []; // Lista de clientes conectados

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente

    cl.index = clients.length - 1; // Asignar indice

    clients.push(cl); // Agregar nuevo cliente a la lista

    // Handshake
    //cl.send("Hola cliente");

    console.log("Nuevo cliente conectado.");
    console.log(clients);

    // Definir callbacks

    cl.on('message', function (data) { // Callback cuando el cliente envia datos        
        console.log("Recibido: ",data); 

        // Hay que sincronizar data con lo que se tiene localmente


        // A modo de ejemplo, mandarle esta lista:

        var location = {lat: -38.6942173, lng: -62.2566036}; // Bahia blanca
        var markers = [ // Ejemplo marcadores al azar
            {latlng: {lat:location.lat+0.005, lng: location.lng+0.006}, id:"a8uhn7eHUJnheUJ3n9In", validated: true, type: "fire"},
            {latlng: {lat:location.lat-0.009, lng: location.lng+0.003}, id:"won7HYd3N7jOmd7UHjw3", validated: true, type: "electricity"},
            {latlng: {lat:location.lat-0.015, lng: location.lng-0.001}, id:"9oiMN7yHG6eHBGeBY382", validated: false, type: "other"},
            {latlng: {lat:location.lat-0.013, lng: location.lng+0.016}, id:"HNue3HNplU893PmUjd3U", validated: true, type: "collapse"},
            {latlng: {lat:location.lat+0.012, lng: location.lng-0.016}, id:"vhUH3m893NMehd7Uje31", validated: false, type: "collapse"},
            {latlng: {lat:location.lat+0.003, lng: location.lng+0.005}, id:"Pmsu1w9UbeImJ3m93108", validated: false, type: "gas"}
        ];    
        var waypoints = [ // Ejemplo de una ruta cualquiera:
            {lat:location.lat-0.005, lng: location.lng-0.006},
            {lat:location.lat-0.016, lng: location.lng-0.007},
            {lat:location.lat-0.018, lng: location.lng-0.007},
            {lat:location.lat-0.02, lng: location.lng-0.008}
        ];

        var database = { // Objeto a enviar
            markers:markers,
            waypoints:waypoints
        };

        cl.send(JSON.stringify(database));
    });

    cl.on('close', function () { // Callback cierre de conexion
        clients.splice(cl.index,1); // Quitar del arreglo
        console.log("Cliente desconectado.");
        console.log(clients);
    });

});

console.log("Websocket listo.");