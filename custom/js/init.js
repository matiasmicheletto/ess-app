var app = new Framework7({
    root: '#app',
    name: 'My App',
    id: 'com.myapp.test',
    panel: {
      swipe: 'left',
    },
    routes: [
      {
        path: '/about/',
        url: 'about.html',
      },
    ]
  });

  var mainView = app.views.create('.view-main');