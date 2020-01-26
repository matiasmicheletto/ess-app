var homeCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    const preloader = app.dialog.preloader("Loading location...", "blue");
    setTimeout(function () {
        if (preloader.opened)
            preloader.close();
    }, 10000);



    /////// Inicializar mapa //////////
    var current_location = null; // Ubicacion actual del usuario (Obj: {marker, accuracy})
    var tap_location; // Posicion donde clickea en el mapa (para reportar evento) (Obj: {lat, long})
    var marker_list = []; // Lista de marcadores (wus, eventos)
    
    var map = L.map('map').fitWorld();
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo(map);

    // Callback de click o tap: mostrar menu para reportarr evento aqui
    map.on('click', function(e){
        tap_location = e.latlng; // Guardar la posicion donde hizo click
        event_dialog.open();
    });

    // Callback de GPS
    map.on('locationfound', function (e) {
        //console.log(e);
        var radius = e.accuracy;
        if(!current_location){ // Si el marcador no fue creado, crear y agregar al mapa
            current_location = {
                marker:L.marker(e.latlng),
                accuracy: L.circle(e.latlng, radius),
            };
            current_location.marker.addTo(map).bindPopup("You are within " + radius + " meters from this point");
            current_location.accuracy.addTo(map);
            current_location.marker.openPopup();
        }else{ // Si ya existe, mover
            current_location.marker.setLatLng(e.latlng);
            current_location.accuracy.setLatLng(e.latlng);
        }
        
        console.log(current_location.marker.getLatLng());

        if (preloader.opened)
            preloader.close();
    });

    // Mostrar ubicación actual
    map.locate({
        setView: true, // Forzar vista
        maxZoom: 16 // Zomm
    });

    // Cada cierto intervalo, actualizar posicion (por si se va moviendo)
    setInterval(function(){
        map.locate({});
    },5000);
    


    /////// Reporte de eventos /////
    const event_types = [ // Lista de eventos, iconos y descripciones
        {
            key: "fire",
            text: "Fire",
            button_icon: "custom/img/event_fire.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_fire.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        },
        {
            key: "gas",
            text: "Gas escapes",
            button_icon: "custom/img/event_gas.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_gas.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        },
        {
            key: "electricity",
            text: "Dropped cables",
            button_icon: "custom/img/event_electricity.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_electricity.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        },
        {
            key: "closed",
            text: "Closed path",
            button_icon: "custom/img/event_closed.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_closed.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        },
        {
            key: "collapse",
            text: "Collapse",
            button_icon: "custom/img/event_collapse.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_collapse.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        },
        {
            key: "other",
            text: "Other event",
            button_icon: "custom/img/event_other.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_other.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30]
                })
        }
    ];

    // Botones del dialogo para reportar eventos
    var buttons = []; // Lista de botones del menu
    event_types.forEach(function(ev, type){ // Para cada evento definido, crear un boton del menu
        buttons.push({
            text: '<img src="'+ev.button_icon+'" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> '+ev.text+'</span>',
            onClick: function () { // Callback de click de cada boton
                    // Agregar marcador a la lista que tiene el mapa
                    //console.log(event_types[type].text);
                    var marker; // Objeto marcador
                    if(tap_location) // Si esta variable esta definida, el contexto es agregar marcador en la posicion donde se clickeo
                        marker = L.marker(tap_location, {icon: event_types[type].marker_icon});     
                    else // Si no hay tap_location, se agrega el marcador a la posicion actual
                        marker = L.marker(current_location.marker.getLatLng(), {icon: event_types[type].marker_icon});    
                    marker.on('click',function(e){ // Evento de clickeo sobre el marcador
                        app.dialog.confirm('Remove event from map?', function () {
                            marker_list.splice(e.target.idx,1); // Quitar marcador de la lista
                            e.target.removeFrom(map); // Quitarlo del mapa;    
                        });
                    });
                    marker.idx = marker_list.length+1; // Indice del marcador en el arreglo (para identificarlo)
                    marker_list.push(marker); // Guardar el marcador en la lista
                    marker.addTo(map).bindPopup(event_types[type].text+" near this location.").openPopup();

                    // TODO: reportar evento al WU actual
                    // TODO: cuando se conecte a un WU, reportar esta lista
                }
        });
    });

    // Crear dialogo de seleccion de eventos
    const event_dialog = app.dialog.create({
        title: 'Report event',
        text: 'Select the type of event from the list to report for this location',
        buttons: buttons,
        closeByBackdropClick: true,
        verticalButtons: true,
    });

    // Control para insertar eventos en el mapa
    L.Control.Marker = L.Control.extend({
        onAdd: function (map) {
            var button = L.DomUtil.create('button');
            button.className = "button button-raised button-fill color-white text-color-black";
            button.innerHTML = "<i class='material-icons'>room</i>";
            button.onclick = function (e) { // Evento de clickeo del boton
                e.stopPropagation(); // Para que no dispare el evento de click sobre el mapa
                tap_location = null; // Borrar posicion de tap o click para que use la del usuario
                event_dialog.open(); // Abrir dialogo
            };
            return button;
        },
        onRemove: function (map) {}
    });

    L.control.marker = function (opts) {
        return new L.Control.Marker(opts);
    };

    L.control.marker().addTo(map);
};