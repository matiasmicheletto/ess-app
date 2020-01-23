var homeCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    const preloader = app.dialog.preloader("Loading location...", "blue");
    setTimeout(function () {
        if (preloader.opened)
            preloader.close();
    }, 10000);



    /////// Inicializar mapa //////////
    var current_location = null; // Ubicacion actual del usuario (Obj: {marker, accuracy})
    var tap_location = null; // Posicion donde clickea en el mapa (para reportar evento) (Obj: {lat, long})
    var marker_list = []; // Lista de marcadores (wus, eventos)
    
    var map = L.map('map').fitWorld();
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo(map);

    // Callback de click o tap: mostrar menu para reportarr evento aqui
    map.on('click', function(e){
        tap_location = e.latlng;
        event_dialog.open();
    });

    // Callback de GPS
    map.on('locationfound', function (e) {
        console.log(e);
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
            icon: "custom/img/event_fire.png"
        },
        {
            key: "gas",
            text: "Gas escapes",
            icon: "custom/img/event_gas.png"
        },
        {
            key: "electricity",
            text: "Dropped cables",
            icon: "custom/img/event_electricity.png"
        },
        {
            key: "closed",
            text: "Closed path",
            icon: "custom/img/event_closed.png"
        },
        {
            key: "collapse",
            text: "Collapse",
            icon: "custom/img/event_collapse.png"
        },
        {
            key: "other",
            text: "Other event",
            icon: "custom/img/event_other.png"
        }
    ];

    // Botones del dialogo para reportar eventos
    var buttons = []; // Lista de botones del menu
    event_types.forEach(function(ev, type){ // Para cada evento definido, crear un boton del menu
        buttons.push({
            text: '<img src="'+ev.icon+'" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> '+ev.text+'</span>',
            onClick: function () { // Callback de click de cada boton
                    // Agregar marcador a la lista que tiene el mapa
                    //console.log(event_types[type].text);
                    if(tap_location){
                        marker_list.push(L.marker(tap_location)); // TODO: cuando se conecte a un WU, reportar esta lista
                        marker_list[marker_list.length-1].addTo(map).bindPopup(event_types[type].text+" near this location.").openPopup();
                    }else{
                        marker_list.push(L.marker(current_location.marker.getLatLng())); // TODO: cuando se conecte a un WU, reportar esta lista
                        marker_list[marker_list.length-1].addTo(map).bindPopup(event_types[type].text+" near this location.").openPopup();
                    }

                    // TODO: reportar evento al WU actual
                }
        });
    });

    // Crear dialogo
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
            button.onclick = function () { // Evento de clickeo del boton
                tap_location = null; // Borrar posicion de click para que se use la posicion actual
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