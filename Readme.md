# Evacuation Supporting System based on IoT components

Original article:  
https://www.mdpi.com/2504-3900/31/1/38

An evacuation supporting system based on IoT-networked devices to guide people to safe places or shelters once the alert of an extreme event has been issued. The system is interactive and support crowd-sensing; this allows people to upload information on the state of the routes and the shelters, thus keep an updated status of the evacuation routes.

## General scheme

![Scheme](img/scheme.png "Scheme") 

## WU

Based on a Raspberry Pi 3 Model B+ configured as access point with Kupiki hotspot (https://github.com/pihomeserver/Kupiki-Hotspot-Script) and the web application as captive portal.

### Database format
```jsonc
{
    "wus": [ // Witness Units list
      {
        "latlng": { // WU geolocation
            "lat": -38.6842173,
            "lng": -62.2406036
        },
        "id": "wu_0", // Identifier
        "status": "up" // Status: up, down, unknown
      }, 
      ...
    ],
    "markers": [ // Event list (obstacles)
      {
        "latlng": { // Event geolocation
            "lat": -38.689217299999996,
            "lng": -62.2506036
        },
        "id": "a8uhn7eHUJnheUJ3n9In", // Unique identifier generated in app
        "timestamp": 1579123392000, // Event creation timestamp (from smartphone time)
        "validated": true, // Validation status (sended to EOC)
        "reported": false, // Event reported to EOC
        "type": "fire" // Event type
      }, 
      ...
    ],
    "waypoints": [ // Escape route is a list of geolocated waypoints
      {
        "lat": -38.6992173,
        "lng": -62.2626036
      }, 
      ...
    ]
}
```

## EOC

In progress...

## Web application

Libs:
  - jQuery: https://jquery.com/
  - Framework7: https://framework7.io/
  - Leaflet: https://leafletjs.com/
  - Leaflet-routing-machine: https://www.liedman.net/leaflet-routing-machine/
  - Leaflet-offline: https://github.com/robertomlsoares/leaflet-offline

Screenshots:
![Screenshot](img/app_screenshot.png "Screenshot") 

### Description
 
The application is quite simple; when it starts, it shows the local map with marks including actual location of the user and the evacuation route, that is a suggested path to follow in order to reach the shelter. It also indicates the estimated distance in minutes and the obstacles or dangerous situations in the evacuation route; e.g., dropped electricity cables, fires or destroyed bridges. 

The user can also act as a human sensor providing information about obstacles not informed in the system. Therefore, the user can touch the screen on a certain point, and a menu with these basic events is open allowing for the indication of new obstacles. Once the obstacle has been added to the system, the WU updates the information locally, dismissing the route going through that street and issuing the alert to the EOC.

Three screenshots of the application are shown in the figure. Its user interface is as simple as possible in order to reduce the cognitive load required to understand the information shown to the end-users. 

In the screenshots, it is possible to see the location of the WUs represented as blue markers, the locations of danger zones are displayed in red markers with their respective icons and the red path on the street marks the suggested path that the user should follow. Every marker on the map has a popup menu that shows details when clicked or touched with a brief description of its meaning. On the upper right section of the screen there is a drop-down button that shows the instructions to the user.

The application uses web based technologies, using the Leaflet library to display an interactive map with routes and markers. The GUI components are provided by the Framework7 styles library and the communication with the WU is handled through the Axios library, which is a promise based HTTP client for browsers. Using a web based application allows to distribute the app through many ways without modifying the source code: standalone executables for mobile and desktop can be compiled with framworks as Apache Cordova or Electron, the app also can be hosted on a web server and distributed through HTTP as most websites and there is an intermediate option, which is called a Progressive Web Application or PWA, which is basically a website that can be installed on the system as an extension of the browser and runs independently with its own requirements and permissions. 



