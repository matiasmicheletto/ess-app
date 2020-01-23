var homeCtrl = function () { // Controller vista home

    // Mostrar preloader por 10 seg o hasta que inicialice el mapa
    var preloader = app.dialog.preloader("Loading location...", "blue");
    setTimeout(function () {
        if (preloader.opened)
            preloader.close();
    }, 10000);

    // Inicializar mapa
    var map = L.map('map').fitWorld();
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo(map);

    // Callback de GPS
    map.on('locationfound', function (e) {
        console.log(e);
        var radius = e.accuracy;
        L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
        if (preloader.opened)
            preloader.close();
    });

    // Mostrar ubicación actual
    map.locate({
        setView: true,
        maxZoom: 16
    });


    /////// Reporte de eventos /////
    var reportEventHere = function (event_type) { // Reportar eventos de distintos tipos
        console.log("reportado: " + event_type);
    };

    // Boton para insertar evento en el mapa
    L.Control.Marker = L.Control.extend({
        onAdd: function (map) {
            var button = L.DomUtil.create('button');
            button.className = "button button-raised button-fill color-white text-color-black";
            button.innerHTML = "<i class='material-icons'>room</i>";
            button.onclick = function () {
                app.dialog.create({
                    title: 'Report event',
                    text: 'Select the type of event from the list to report for your current location',
                    buttons: [{
                            text: '<img src="custom/img/event_fire.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Fire</span>',
                            onClick: function () {
                                reportEventHere('fire');
                            }
                        },
                        {
                            text: '<img src="custom/img/event_gas.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Gas escapes</span>',
                            onClick: function () {
                                reportEventHere('gas');
                            }
                        },
                        {
                            text: '<img src="custom/img/event_electricity.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Dropped cables</span>',
                            onClick: function () {
                                reportEventHere('electricity');
                            }
                        },
                        {
                            text: '<img src="custom/img/event_closed.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Closed path</span>',
                            onClick: function () {
                                reportEventHere('closed');
                            }
                        },
                        {
                            text: '<img src="custom/img/event_collapse.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Collapse</span>',
                            onClick: function () {
                                reportEventHere('collapse');
                            }
                        },
                        {
                            text: '<img src="custom/img/event_other.png" style="max-width:50px;vertical-align: middle;"/> <span style="margin-left:20px;font-size:1.1em;"> Others</span>',
                            onClick: function () {
                                reportEventHere('other');
                            }
                        }
                    ],
                    verticalButtons: true,
                }).open();
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