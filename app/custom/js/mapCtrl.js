var mapCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    app.showPreloader("Loading...");
    setTimeout(function () {
        app.hidePreloader();
    }, 5000);

    // Coordenadas por defecto donde inicia el mapa
    const defaultLatLng = [-38.7164681, -62.2699996];

    // Marcadores predefinidos
    const startMarker = new L.Icon({
        iconUrl: 'custom/img/start_marker.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

    const waypointMarker = new L.Icon({
        iconUrl: 'custom/img/waypoint_marker.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [15, 25],
        iconAnchor: [7, 25],
        popupAnchor: [1, -34],
        shadowSize: [25, 25]
      });

    const endMarker = new L.Icon({
        iconUrl: 'custom/img/end_marker.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

    const wuUpMarker = new L.Icon({
        iconUrl: 'custom/img/marker_wu_up.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [40, 43],
        iconAnchor: [20, 43],
        popupAnchor: [0, -30],
        shadowSize: [40, 43],
        shadowAnchor: [15, 43]
      });

    const wuDownMarker = new L.Icon({
        iconUrl: 'custom/img/marker_wu_down.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [40, 43],
        iconAnchor: [20, 43],
        popupAnchor: [0, -30],
        shadowSize: [40, 43],
        shadowAnchor: [15, 43]
      });

    const wuUnkMarker = new L.Icon({
        iconUrl: 'custom/img/marker_wu_unk.png',
        shadowUrl: 'custom/img/marker_shadow.png',
        iconSize: [40, 43],
        iconAnchor: [20, 43],
        popupAnchor: [0, -30],
        shadowSize: [40, 43],
        shadowAnchor: [15, 43]
      });

    // Variables globales del controller de la vista
    
    var current_location = null; // Ubicacion actual del usuario (Obj: {marker, accuracy})
    var escape_route = null; // Ruta de escape calculada
    var tap_location; // Posicion donde clickea en el mapa (para reportar evento) (Obj: {lat, long})
    var drawnEvents = []; // Lista de eventos que se esta mostrando en mapa
    var drawnWUs = []; // Lista de WUs dibujadas

    const gpsUpdatePeriod = 10000; // Tasa de refresco de posicion del usuario

    // Inicializar mapa
    var map = L.map('map',{
        center:defaultLatLng,
        zoom:8
    });
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo(map);
    
    /* 
    // Mapa guardado localmente
    L.tileLayer('assets/img/map/{z}/{x}/{y}.jpg', {
        maxZoom: 15
    }).addTo(map);
    */


    /// POSICIONAMIENTO Y RUTAS /////

    var setUserLocation = function(latlng, accuracy){ // Establecer posicion del usuario en el mapa
        if(!current_location){ // Si el marcador no fue creado aun, crear y agregar al mapa
            // Crear marcador
            current_location = {
                marker: L.marker(latlng),
                accuracy: L.circle(latlng, accuracy),
            };

            // Agregar marcador al mapa con su circulo de posicion estimada
            current_location.marker.addTo(map).bindPopup("You are within " + accuracy + " meters from this point");
            current_location.accuracy.addTo(map);
            current_location.marker.openPopup();

        }else{ // Si ya existe, solo mover
            current_location.marker.setLatLng(latlng);
            current_location.accuracy.setLatLng(latlng);
            current_location.accuracy.setRadius(accuracy);
        }

        if(app.waypoint_list) // Si existe ruta de escape, dibujar
            drawEscapeRoute(current_location.marker.getLatLng(), app.waypoint_list);
    };


    // Callback de click o tap: mostrar menu para reportarr evento aqui
    map.on('click', function(e){
        tap_location = e.latlng; // Guardar la posicion donde hizo click
        event_dialog.open(); // Mostrar menu para elegir tipo de evento a reportar
    });

    // Callback de posicion GPS actualizada
    map.on('locationfound', function (e) {
        //console.log(e);
        setUserLocation(e.latlng, e.accuracy);
        app.hidePreloader();
    });

    // Mostrar ubicación actual
    map.locate({
        setView: true, // Forzar vista
        maxZoom: 16 // Zomm
    });

    var gpsUpdater = setInterval(function(){ // Actualizar posicion periodicamente
        // Obtiene coordenadas (de la ubicacion del navegador, gps o red)
        map.locate({}); // Cuando devuelve la ubicacion, se llama al evento "locationfound"
    },gpsUpdatePeriod);


    app.setAutoLocation = function(enabled){ // Callback para cuando se cambia el modo auto o manual
        if(gpsUpdater) // En cada cambio hay que restablecer el timer
            clearInterval(gpsUpdater);

        lastRouteUpdate = 0; // Reiniciar limitador de solicitudes
        
        if(enabled) // Habilitar posicionamiento automatico
            gpsUpdater = setInterval(function(){
                map.locate({});
            },5000);
    };


    var drawEscapeRoute = function(start, waypoints){ // Dibuja la ruta de escape en el mapa a partir de los waypoints
        if(escape_route) // Si ya estaba definida, eliminar del mapa
            map.removeControl(escape_route);
        escape_route = L.Routing.control({ // Calcula la ruta optima dados los waypoints
            waypoints: [start].concat(waypoints), // Recorrido
            collapsible: true, // Menu de instrucciones desplegable
            draggableWaypoints: false, // Que no se puedan arrastrar los puntos
            addWaypoints: false, // Que no se puedan agregar nuevos puntos
            createMarker: function(i, wp, nWps) {
                switch(i){
                    case 0:
                        return L.marker(wp.latLng, {
                            icon: startMarker
                        }); 
                    case nWps-1:     
                        return L.marker(wp.latLng, {
                            icon: endMarker
                        });
                    default:   
                        return L.marker(wp.latLng, {
                            icon: waypointMarker
                        });
                }
              }
        });
        escape_route.addTo(map).hide(); // Agregar al mapa
    };


    var deleteEvent = function(event){ // Eliminar evento
        var index = app.marker_list.findIndex(function(el){return el.id == event.ident}); // Buscar por id
        app.marker_list.splice(index,1); // Quitar marcador de la lista
        localStorage.setItem("marker_list", JSON.stringify(app.marker_list)); // Actualizar en storage
        event.removeFrom(map); // Quitarlo del mapa;           
    };

    var drawEvent = function(event){ // Dibuja el evento en el mapa y define callback para eliminacion
        var ev = app.getEvent(event.type); // Obtener el objeto evento para dibujar
        var marker = L.marker(event.latlng, {icon: event.validated ? ev.marker_icon : ev.disabled_icon});
        marker.ident = event.id; // Identificador del marcador
        marker.on('click',function(e){ // Evento de clickeo sobre el marcador (para borrarlo)
            app.confirmDialog('Remove event from map?').then(function () { // Dialogo por defecto para confirmar la operacion con callback de ok
                deleteEvent(e.target); // Eliminar evento del mapa y del localstorage
            });
        });
        marker.addTo(map).bindPopup(app.getEvent(event.type).text+" near this location."); // Dibujar y poner popup
        drawnEvents.push(marker);
    };

    var drawWU = function(wu){ // Dibuja la posicion de la WU
        // Determinar el icono a usar dependiendo del estado del WU
        
        var wuMarker;
        switch(wu.status){
            case "up":
                wuMarker = wuUpMarker;
                break;
            case "down":
                wuMarker = wuDownMarker;
                break;
            case "unknown":
                wuMarker = wuUnkMarker;
                break;
            default:
                wuMarker = wuUnkMarker;
                break;
        }

        var marker = L.marker(wu.latlng, {icon: wuMarker});
        marker.ident = event.id; // Identificador del marcador del WU
        marker.addTo(map).bindPopup("Witness Unit in this location."); // Dibujar y poner popup
        drawnWUs.push(marker);
    };

    app.updateMarkers = function(){ // Sobreescribo esta funcion declarada en la libreria
        
        console.log(drawnEvents);

        // Antes de dibujar, eliminar los que estan en el mapa
        for(var k in drawnWUs)
            drawnWUs[k].removeFrom(map);
        drawnWUs = [];
        for(var k in drawnEvents)
            drawnEvents[k].removeFrom(map);
        drawnEvents = [];

        // Luego dibujar
        for(var k in app.marker_list) // Agregar cada marcador al mapa
            drawEvent(app.marker_list[k]); 
        for(var k in app.wu_list) // Dibujar las WUs
            drawWU(app.wu_list[k]);
    }

    // Descargar lista de marcadores de localstorage
    app.marker_list = JSON.parse(localStorage.getItem('marker_list'));
    if(app.marker_list)
        console.log(app.marker_list.length+" marcadores cargados desde almacenamiento local");
    else
        app.marker_list = [];

    // Descargar la lista de WUs de localstorage
    app.wu_list = JSON.parse(localStorage.getItem('wu_list'));
    if(app.wu_list)
        console.log(app.wu_list.length+" WUs cargados desde almacenamiento local");
    else
        app.wu_list = [];

    app.updateMarkers(); // Uso el mismo callback para dibujar marcadores en el mapa

    // Descargar ruta de escape del storage (se dibuja no bien se conozca la posicion del usuario)
    app.waypoint_list = JSON.parse(localStorage.getItem('waypoint_list')); // Descargar de localstorage

    app.initServer(); // Iniciar escuchador de conexion con WU


    ///// MENU EVENTOS //////

    // Crear lista de botones del dialogo para reportar eventos
    var buttons = []; // Lista de botones del menu
    forEach(app.getEventList(), function(ev, type, obj){ // Para cada evento definido, crear un boton del menu
        buttons.push({
            text: '<img src="'+ev.button_icon+'" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> '+ev.text+'</span>',
            onClick: function () { // Callback de click de cada boton -> dibujar marcador en mapa
                var event = { // Nuevo evento creado por el usuario
                    latlng: tap_location ? tap_location : current_location.marker.getLatLng(),
                    type: type, // Tipo de obstaculo/evento
                    validated: false, // Inicialmente sin validar hast que no pase por una WU
                    id: generateID(), // Identificador unico (declarada en utils.js)
                    timestamp: Date.now() // Fecha hora de creacion en formato Unix
                };
                // Agregar marcador a la lista y dibujar en mapa
                drawEvent(event);
                app.marker_list.push(event);
                localStorage.setItem("marker_list", JSON.stringify(app.marker_list)); // Actualizar en storage
            }
        });
    });

    // Agregar un boton al menu para rescribir posicion del usuario manualmente
    buttons.push({
        text: '<img src="custom/img/override.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;">Override location</span>',
        onClick: function(){ // Callback al elegir manualmente la posicion
            setUserLocation(tap_location,100); // Por defecto 100 metros de error
        }
    });

    // Crear dialogo de seleccion de eventos
    const event_dialog = app.createDialog({
        title: 'Report event',
        text: 'Select the type of event from the list to report for this location',
        buttons: buttons,
        closeByBackdropClick: true,
        verticalButtons: true,
    });

};