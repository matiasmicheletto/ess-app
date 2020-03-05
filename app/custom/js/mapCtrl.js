var mapCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    app.showPreloader("Loading...");
    setTimeout(function () {
        app.hidePreloader();
    }, 5000);

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

    // Variables globales del controller de la vista
    var marker_list = []; // Lista de marcadores para guardar posiciones de wus y eventos
    var waypoint_list = []; // Lista de waypoints para la ruta de escape
    
    var current_location = null; // Ubicacion actual del usuario (Obj: {marker, accuracy})
    var escape_route = null; // Ruta de escape calculada
    var tap_location; // Posicion donde clickea en el mapa (para reportar evento) (Obj: {lat, long})

    const gpsUpdatePeriod = 10000; // Tasa de refresco de posicion del usuario

    // Inicializar mapa
    var map = L.map('map').fitWorld();
    
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

        if(waypoint_list) // Si existe ruta de escape, dibujar
            drawEscapeRoute(current_location.marker.getLatLng(), waypoint_list);
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
        var index = marker_list.findIndex(function(el){return el.id == event.ident}); // Buscar por id
        marker_list.splice(index,1); // Quitar marcador de la lista
        localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
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
    };



    // Descargar lista de marcadores de storage
    marker_list = JSON.parse(localStorage.getItem('marker_list'));
    if(marker_list){
        console.log(marker_list.length+" marcadores cargados desde almacenamiento local");
        for(var k in marker_list) // Agregar cada marcador al mapa
            drawEvent(marker_list[k]); 
    }else{ // Si no hay nada en storage, cargar de la app
        app.getMarkers()
        .then(function(markers_data){
            if(markers_data){
                console.log(markers_data.length+" marcadores descargados");
                marker_list = markers_data;
                localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
                for(var k in marker_list) // Agregar cada marcador al mapa
                    drawEvent(marker_list[k]); 
            }
        });    
    }

    // Descargar ruta de escape del storage (se dibuja no bien se conozca la posicion del usuario)
    waypoint_list = JSON.parse(localStorage.getItem('waypoint_list')); // Descargar de localstorage
    if(!waypoint_list){
        app.getRoute()
        .then(function(waypoint_data){
            if(waypoint_data){
                waypoint_list = waypoint_data;
                console.log(waypoint_data.length+" waypoint descargados");
                localStorage.setItem("waypoint_list", JSON.stringify(waypoint_list)); // Actualizar en storage
            }
        });
    }




    ///// MENU EVENTOS //////

    // Crear lista de botones del dialogo para reportar eventos
    var buttons = []; // Lista de botones del menu
    forEach(app.getEventList(), function(ev, type, obj){ // Para cada evento definido, crear un boton del menu
        buttons.push({
            text: '<img src="'+ev.button_icon+'" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> '+ev.text+'</span>',
            onClick: function () { // Callback de click de cada boton -> dibujar marcador en mapa
                var event = { // Nuevo evento creado
                    latlng: tap_location ? tap_location : current_location.marker.getLatLng(),
                    type: type,
                    validated: false,
                    id: generateID()
                };
                // Agregar marcador a la lista y dibujar en mapa
                drawEvent(event);
                marker_list.push(event);
                localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
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