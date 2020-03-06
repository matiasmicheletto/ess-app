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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_fire.png',
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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_gas.png',
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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_electricity.png',
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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_closed.png',
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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_collapse.png',
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
                }),
            disabled_icon: L.icon({
                    iconUrl: 'custom/img/disabled_marker_other.png',
                    shadowUrl: 'custom/img/marker_shadow.png',
                    iconSize: [40, 43],
                    iconAnchor: [20, 43],
                    popupAnchor: [0, -30],
                    shadowSize: [40, 43],
                    shadowAnchor: [15, 43]
                })
        }
    };

    public.marker_list = []; // Lista de marcadores para guardar posiciones de wus y eventos
    public.waypoint_list = []; // Lista de waypoints para la ruta de escape
    public.wu_list = []; // Lista de WU (Witness Units) o puntos de conexion

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
    private.timerId = null;

    public.updateMarkers = function(){
        console.log("Actualizar marcadores en mapa.");
    };

    public.initServer = function(){
        console.log("Conectando con websocketserver");
        //private.socket = new WebSocket("ws://192.168.4.1:8081"); // Para la raspi
        private.socket = new WebSocket("ws://localhost:8081"); // Para debug del server

        private.socket.onerror = function (error) {
            console.log(error);
        };

        private.socket.onopen = function () { // Puerto conectado
            console.log("Conectado con websocketserver");
            
            if (private.timerId) { // No seguir intentando conectar
                clearInterval(private.timerId);
                private.timerId = null;
            }

            public.wsStatus = "CONNECTED";

            // Cambiar el icono de estado
            document.getElementById("wss_state_icon").innerHTML = "signal_wifi_4_bar";

            var database = { // Objeto a enviarle al server
                wus: public.wu_list,
                markers: public.marker_list,
                waypoints: public.waypoint_list
            };

            private.socket.send(JSON.stringify(database));
        };

        private.socket.onclose = function () { // Server no disponible (seguir intentando conectar)
            console.log("Server desconectado");

            if (public.wsStatus == "CONNECTED") // Si la conexion con server estaba abierta significa que se cerro el server
                public.wsStatus = "CONNECTING"; // Pasar a estado conectando

            document.getElementById("wss_state_icon").innerHTML = "signal_wifi_off";

            if (!private.timerId) {
                private.timerId = setInterval(function () { // Sigue intentando conectar indefinidamente
                    private.socket = null;
                    public.initServer();
                }, 10000);
            }
        };

        private.socket.onmessage = function (message) { // Respuesta del server
            console.log("Nuevo mensaje del server: "+message.data);
            var database = JSON.parse(message.data);
            
            public.wu_list = database.wus;
            public.marker_list = database.markers;
            public.waypoint_list = database.waypoints;

            public.updateMarkers(); // Ejecutar callback para actualizar esta informacion en el mapa
            // Los waypoints se van a dibujar cuando cambie la posicion del usuario

            // Actualizar en storage
            localStorage.setItem("wu_list", JSON.stringify(app.wu_list)); 
            localStorage.setItem("marker_list", JSON.stringify(app.marker_list));
            localStorage.setItem("waypoint_list", JSON.stringify(app.waypoint_list)); 
        };
    };

    public.stopServer = function(){
        public.wsStatus = "DISCONNECTED";
        if (private.timerId) {
            clearInterval(private.timerId);
            private.timerId = null;
        }
        private.socket.onclose = function () {}; // Borrar la funcion para que no se vuelva a conectar
        private.socket.close();
        private.socket = null;
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