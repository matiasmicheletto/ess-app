var mapCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    //app.showPreloader("Loading...");
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
    var current_location = null; // Ubicacion actual del usuario (Obj: {marker, accuracy})
    var marker_list = []; // Lista de marcadores (L.marker) para guardar posiciones de wus y eventos
    var escape_route = null; // Ruta de escape calculada
    var tap_location; // Posicion donde clickea en el mapa (para reportar evento) (Obj: {lat, long})
    const gpsUpdatePeriod = 20000; // Tasa de refresco de la posicion GPS (ms)
    const routeUpdatePeriod = 20000; // El server de leaflet routing machine tiene una tasa de refresco minima (ms)
    var lastRouteUpdate = 0; // Ultima actualizacion de la ruta

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

    var setUserLocation = function(latlng, accuracy){ // Establecer posicion del usuario
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
        
        // Pedir ruta de escape (si no esta conectado a un WU, devuelve camino hasta algun WU mas cercano)
        if(Date.now() - lastRouteUpdate > routeUpdatePeriod){
            app.showPreloader("Retrieving escape route...");
            lastRouteUpdate = Date.now();
            app.getRoute(latlng)
            .then(function(waypoints){
                if(escape_route) // Si ya estaba definida, eliminar del mapa
                    map.removeControl(escape_route);
                escape_route = L.Routing.control({
                    waypoints: waypoints, // Recorrido
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
                app.hidePreloader();
            });
        }
    };

    // Callback de click o tap: mostrar menu para reportarr evento aqui
    map.on('click', function(e){
        tap_location = e.latlng; // Guardar la posicion donde hizo click
        event_dialog.open(); // Mostrar menu para elegir tipo de evento a reportar
    });

    // Callback de posicino GPS actualizada
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

    // Cada cierto intervalo, actualizar posicion (por si se va moviendo)
    var gpsUpdater = setInterval(function(){
        map.locate({});
    },gpsUpdatePeriod);

    app.setAutoLocation = function(enabled){
        if(gpsUpdater) // En cada cambio hay que restablecer el timer
            clearInterval(gpsUpdater);

        lastRouteUpdate = 0; // Reiniciar limitador de solicitudes
        
        if(enabled) // Habilitar posicionamiento automatico
            gpsUpdater = setInterval(function(){
                map.locate({});
            },5000);
    };


    // Descargar lista de marcadores de la db
    app.getMarkers()
    .then(function(markers_data){
        if(markers_data){
            marker_list = markers_data; // Guardar en objeto global           
            console.log(marker_list.length+" marcadores cargados");
            for(var k in marker_list){ // Agregar cada marcador al mapa
                var marker = L.marker(marker_list[k].latlng, {icon: app.getEvent(marker_list[k].type).marker_icon});
                marker.idx = k; // Indice del marcador en el arreglo (para identificarlo)
                marker.on('click',function(e){ // Evento de clickeo sobre el marcador
                    app.confirmDialog('Remove event from map?').then(function () { // Dialogo por defecto para confirmar la operacion con callback de ok
                        marker_list.splice(e.target.idx,1); // Quitar marcador de la lista
                        localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
                        e.target.removeFrom(map); // Quitarlo del mapa;   
                    });
                });
                marker.addTo(map).bindPopup(app.getEvent(marker_list[k].type).text+" near this location.");
            }
        }
    });
    

    // Crear lista de botones del dialogo para reportar eventos
    var buttons = []; // Lista de botones del menu
    forEach(app.getEventList(), function(ev, type, obj){ // Para cada evento definido, crear un boton del menu
        buttons.push({
            text: '<img src="'+ev.button_icon+'" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> '+ev.text+'</span>',
            onClick: function () { // Callback de click de cada boton
                    // Agregar marcador a la lista que tiene el mapa
                    //console.log(app.getEvent(type).text);
                    var marker; // Objeto marcador
                    if(tap_location) // Si esta variable esta definida, el contexto es agregar marcador en la posicion donde se clickeo
                        marker = L.marker(tap_location, {icon: app.getEvent(type).marker_icon});     
                    else // Si no hay tap_location, se agrega el marcador a la posicion actual
                        marker = L.marker(current_location.marker.getLatLng(), {icon: app.getEvent(type).marker_icon});    
                    marker.on('click',function(e){ // Evento de clickeo sobre el marcador
                        app.confirmDialog('Remove event from map?').then(function () { // Dialogo por defecto para confirmar la operacion con callback de ok
                            marker_list.splice(e.target.idx,1); // Quitar marcador de la lista
                            localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
                            e.target.removeFrom(map); // Quitarlo del mapa;   
                        });
                    });
                    marker.idx = marker_list.length+1; // Indice del marcador en el arreglo (para identificarlo)
                    marker.addTo(map).bindPopup(app.getEvent(type).text+" near this location.").openPopup();
                    marker_list.push({ // Guardar el marcador en la lista
                        type: type,
                        latlng: marker.getLatLng()
                    }); 
                    localStorage.setItem("marker_list", JSON.stringify(marker_list)); // Actualizar en storage
                }
        });
    });

    // Agregar un boton para rescribir posicion del usuario manualmente
    buttons.push({
        text: '<img src="custom/img/override.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;">Override location</span>',
        onClick: function(){ // Callback al elegir manualmente la posicion
            setUserLocation(tap_location,100); // Por defecto 25 metros de error
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