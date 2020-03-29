// Debe instalarse ws con npm antes de usar este script:
//
//    $ npm install -g ws
//
// Ejecutar con 
//
//    $ node ./WebScoketServer.js
//

const WebSocketServer = require('ws').Server; 
const Fs = require('fs');

//var wss = new WebSocketServer({port: 8081}); // Servidor WebSocket en puerto 8081 para debug
var wss = new WebSocketServer({port: 443}); // Servidor WebSocket en puerto 443

var clients = []; // Lista de clientes conectados

wss.on('connection', function (cl) { // Callback de conexion con nuevo cliente

    cl.index = clients.length - 1; // Asignar indice al cliente (para identificarlo)

    clients.push(cl); // Agregar nuevo cliente a la lista

    console.log("Nuevo cliente conectado.");
    //console.log(clients);

    // Definir callbacks

    cl.on('message', function (remote_db) { // Callback cuando el cliente envia datos        
        //console.log("Recibido: ",remote_db); // Se asume que manda su base de datos siempre

        var local_db = loadDatabase(); // Leer datos locales

        var resulting_db = mergeDatabases(local_db, remote_db); // Combinar con lo recibido

        cl.send(JSON.stringify(resulting_db)); // Responder nueva base de datos a la app

        writeDatabase(resulting_db); // Actualizar base de datos local
    });

    cl.on('close', function () { // Callback cierre de conexion
        clients.splice(cl.index,1); // Quitar del arreglo
        console.log("Cliente desconectado.");
        //console.log(clients);
    });
});


var loadDatabase = function(){ // Leer base de datos mas reciente desde archivo

    var database = null;
    try{
        database = JSON.parse(Fs.readFileSync('database.json'));
    } catch(err){
        console.log(err);
    }

    if(database)
        return database;
};

var writeDatabase = function(db){ // Guardar nueva database en nuevo archivo
    Fs.writeFileSync('database.json', JSON.stringify(db));
};

var mergeDatabases = function(local_db, remote_db){ // Combinar informacion

    // TODO: Algoritmo de combinacion de informacion

    return local_db;
};

console.log("Server WU esperando conexiones...");