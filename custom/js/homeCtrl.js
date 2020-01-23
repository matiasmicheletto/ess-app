var homeCtrl = function(){ // Controller vista home
    
    // Inicializar mapa
    var map = L.map('map').fitWorld();

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1IjoibWF0aWFzbWljaGVsZXR0byIsImEiOiJjazVsa2ZtamowZHJnM2ttaXFmZGo1MDhtIn0.8iBO-J1wj34LIqq-e4Me5w'
    }).addTo(map);

    map.on('locationfound', function(e) {
        console.log(e);
        var radius = e.accuracy;
        L.marker(e.latlng).addTo(map).bindPopup("You are within " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    });

    map.locate({setView: true, maxZoom: 16});    

    // Marcador principal
    L.Control.Marker = L.Control.extend({
        onAdd: function(map) {
            var button = L.DomUtil.create('button');
            button.className = "button button-raised button-fill color-white text-color-black";
            button.innerHTML = "<i class='material-icons'>room</i>";
            return button;
        },
        onRemove: function(map) {}
    });
    
    L.control.marker = function(opts) {
        return new L.Control.Marker(opts);
    };
    
    L.control.marker().addTo(map);

    /* Boton de retorno navegacion
    L.Control.GoBack = L.Control.extend({
        onAdd: function(map) {
            var button = L.DomUtil.create('button');
            button.className = "button button-raised button-fill color-white text-color-black link-back";
            button.innerHTML = "<i class='material-icons'>arrow_back_ios</i>";
            return button;
        },
        onRemove: function(map) {}
    });
    
    L.control.goBack = function(opts) {
        return new L.Control.GoBack(opts);
    };
    
    L.control.goBack({position:"bottomleft"}).addTo(map);
    */

};