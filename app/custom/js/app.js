window.app = (function () {

    var routes = [{ // Rutas de navegacion
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

    var core = {}; // Atributos y metodos publicos

    core.f7 = new Framework7({
        root: '#app',
        name: 'ESS App',
        id: 'com.ess-app.test',
        routes: routes
    });

    core.preloader = core.f7.dialog.preloader("Loading location...", "blue");

    core.init = function () { // Inicializacion de la app
        // Inicializacion vista
        core.mainView = core.f7.views.create('.view-main', {
            url: '/'
        });
        core.mainView.router.load("home");
    };

    core.getRoute = function(location){ // Devuelve la ruta que hay que seguir para llegar el centro de evacuacion

        // TODO: si esta conectado a un WU, pedir datos y calcular ruta

        return new Promise(function(fulfill, reject){
            return fulfill([ // Hardcodeo una ruta cualquiera
                location, // Partida de la ubicacion actual
                L.latLng(location.lat-0.005, location.lng-0.006),
                L.latLng(location.lat-0.01, location.lng-0.007),
                L.latLng(location.lat-0.016, location.lng-0.007),
                L.latLng(location.lat-0.02, location.lng-0.008)
            ]);
        })
    };

    return core;
})();