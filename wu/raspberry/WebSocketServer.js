var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket en puerto 8081

var clients = []; // Lista de clientes conectados

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente

    cl.index = clients.length - 1; // Asignar indice

    clients.push(cl); // Agregar nuevo cliente a la lista

    // Handshake
    cl.send("Hola cliente");

    console.log("Nuevo cliente conectado.");
    console.log(clients);

    // Definir callbacks

    cl.on('message', function (data) { // Callback cuando el cliente envia datos        
        console.log("Recibido: ",data); 
    });

    cl.on('close', function () { // Callback cierre de conexion
        clients.splice(cl.index,1); // Quitar del arreglo
        console.log("Cliente desconectado.");
        console.log(clients);
    });
});

console.log("Websocket listo");