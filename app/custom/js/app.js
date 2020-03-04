window.app = (function () {

    const routes = [{ // Vistas de la app
            name: 'home',
            path: '/',
            url: './views/home.html',
            on: {
                pageInit: mapCtrl
            }
        },
        {
            name: 'about',
            path: '/about/',
            url: './views/about.html'
        },
        {
            name: 'help',
            path: '/help/',
            url: './views/help.html'
        }
    ];

    var public = {}; // Atributos y metodos publicos
    var private = {}; // Atributos y metodo privados

    private.f7 = new Framework7({ // Libreria de estilos
        root: '#app',
        name: 'ESSN App',
        id: 'com.essn-app.test',
        routes: routes
    });

    private.event_types = { // Lista de eventos, iconos y descripciones
        fire: {
            text: "Fire",
            button_icon: "custom/img/event_fire.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_fire.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        },
        gas: {
            text: "Gas escapes",
            button_icon: "custom/img/event_gas.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_gas.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        },
        electricity: {
            text: "Dropped cables",
            button_icon: "custom/img/event_electricity.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_electricity.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        },
        closed: {
            text: "Closed path",
            button_icon: "custom/img/event_closed.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_closed.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        },
        collapse: {
            text: "Collapse",
            button_icon: "custom/img/event_collapse.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_collapse.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        },
        other: {
            text: "Other event",
            button_icon: "custom/img/event_other.png",
            marker_icon: L.icon({
                    iconUrl: 'custom/img/marker_other.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        }
    };

    public.getEventList = function(){ // Retornar toda la lista de eventos
        return private.event_types;
    };

    public.getEvent = function(type){ // Retorno de icono de eventos
        return private.event_types[type] ? private.event_types[type] : private.event_types["other"]; // Si no existe, retorna evento "otros"
    };

    public.showPreloader = function(message){ // Muestra un preloader mientras carga algunas operaciones
        private.preloader = private.f7.dialog.preloader(message, "blue");
    };

    public.hidePreloader = function(){ // Oculta el preloader si estaba abierto
        if(private.preloader.opened)
            private.preloader.close();
    };

    public.confirmDialog = function(message){ // Mostrar un dialogo de confirmacion
        return new Promise(function(fulfill, reject){
            private.f7.dialog.confirm(message,fulfill);
        });
    };

    public.createDialog = function(dialog){ // Mostrar un dialogo customizable
        return private.f7.dialog.create(dialog);
    };

    public.setAutoLocation = function(enabled){ // Callback para usar en el controller del mapa
        if(enabled)
            console.log("Autolocation enabled");
        else
            console.log("Autolocation disabled");
    };

    public.toggleAutoLocation = function(){ // Callback del input checkbox del menu
        var autoLocation = document.getElementById("autoloc_checkbox").checked;
        public.setAutoLocation(autoLocation);
    };

    //// COMUNICACION CON API WU /////

    public.getMarkers = function(){ // Retorna lista de marcadores de la db
        return new Promise(function(fulfill, reject){

            var location = {lat: -38.6942173, lng: -62.2566036}; // Bahia blanca
            var result = [ // Ejemplo marcadores al azar
                {type: "fire", latlng: L.latLng(location.lat+0.005, location.lng+0.006), id:""},
                {type: "other", latlng: L.latLng(location.lat-0.009, location.lng+0.003), id:""},
                {type: "fire", latlng: L.latLng(location.lat-0.015, location.lng-0.001), id:""},
                {type: "collapsed", latlng: L.latLng(location.lat-0.013, location.lng+0.016), id:""},
                {type: "fire", latlng: L.latLng(location.lat+0.012, location.lng-0.016), id:""},
                {type: "closed", latlng: L.latLng(location.lat+0.003, location.lng+0.005), id:""}
            ];

            return fulfill(result);
        });
    };

    public.addMarker = function(location){ // Registrar nuevo marcador en el server
        return new Promise(function(fulfill, reject){

        });
    };

    public.removeMarker = function(id){
        return new Promise(function(fulfill, reject){

        });
    };

    public.getRoute = function(location){ // Devuelve la ruta que hay que seguir para llegar el centro de evacuacion
        // La ruta debe ser un array de formato latLng ({lat:..., lng:...})

        // TODO: Pedir datos y calcular ruta

        return new Promise(function(fulfill, reject){
            
            var result = [ // Ejemplo de una ruta cualquiera:
                location, // Partida de la ubicacion actual
                L.latLng(location.lat-0.005, location.lng-0.006),
                L.latLng(location.lat-0.016, location.lng-0.007),
                L.latLng(location.lat-0.018, location.lng-0.007),
                L.latLng(location.lat-0.02, location.lng-0.008)
            ];

            return fulfill(result);
        });
    };


    //// INICIALIZACION ////

    public.init = function () { // Inicializacion de la app
        // Inicializacion vista
        private.mainView = private.f7.views.create('.view-main', {
            url: '/'
        });
        private.mainView.router.load("home");
    };

    return public;
})();