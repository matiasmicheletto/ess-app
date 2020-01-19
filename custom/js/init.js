// Ruteo de vistas
var routes = [
  {
    name: 'home',
    path: '/',
    url: './views/home.html',
    on:{
      pageInit: homeCtrl
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

// Inicializacion de la app
var app = new Framework7({
  root: '#app',
  name: 'ESS App',
  id: 'com.ess-app.test',
  panel: {
    swipe: 'left',
  },
  routes: routes
});

// Inicializacion vista
var mainView = app.views.create('.view-main',{url: '/'});
mainView.router.load("home");
