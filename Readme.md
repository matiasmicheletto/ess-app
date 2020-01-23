# Sistema de evacuación con IoT

## Detalle de componentes

### Plataforma Nube

Se necesita una nube capaz de comunicarse con gateways LoRa/LoRaWAN (EOC).  Además, debe tener registrado todos los WU en un grafo, con el estado actual de cada uno, y poder calcular la ruta más corta a las áreas seguras.   

#### Características principales:

Aplicación para definir áreas seguras, ver el estado de cada WU y poder visualizar los caminos críticos de cada nodo.  
  - ChirpStack Network Server  
  - ChirpStack Application Server  
  - Broker MQTT  
  - Base de datos de grafos para poder almacenar y manipular los WU  

### Nodo EOC
Consiste en un gateway LoRa/LoRaWAN que se comunica con los WU y a su vez con internet. Debe poder recibir una ruta de una aplicación en la nube, e informarla a los nodos WU. A su vez, puede recibir actualizaciones de la ruta de los WU y transmitirlos a la aplicación en la nube. Este nodo no calcula la ruta si no que es un simple gateway.  
[TBD]  

### Nodo WU
Consiste en un nodo LoRa/LoRaWAN que debe ofrecer un access point para que teléfonos celulares se conecten a él a través de una aplicación y puedan cargar actualizaciones de la ruta y consultar la ruta a seguir. Debe poder recibir una ruta del EOC y, si se pierde conexión con el mismo, debe poder re-calcular la ruta en base a las actualizaciones recibidas de los teléfonos celulares.  

#### Características principales:
  - Comunicación por LoRa/LoRaWAN  
  - WiFi Access Point  
  - Capacidad de procesamiento para resolver shortest-path con grafos  
  - Memoria no volátil para almacenar un grafo de X vertices e Y aristas  
  - Autonomía de 24 horas (Módulo batería + batería)  
  - Módulo de cargador para panel solar  

#### Hardware
Se presentan 3 alternativas para implementar el WU:  
  - Arduino + módulo WiFi + módulo LoRaWAN  
  - Placa PIVOT Ponce (ESP32 WROVER + RFM96)  
  - Raspberry Pi + módulo WiFi (si no está incorporado en RPi) + módulo LoRaWAN.  

#### Software

En el caso de las alternativa 1 y 2 de hardware, se podrán usar las siguientes librerías de Arduino:  
  - Librería WiFi ESP8266: https://github.com/itead/ITEADLIB_Arduino_WeeESP8266  
  - Librería WiFi ESP32: https://www.arduino.cc/en/Reference/WiFi   
  - Librería shortest path: https://github.com/MikeNourian/Dijkstra-Shortest-Path-and-Backtrace-code-For-Arduino-
  - Librería LoRaWAN RFM96: https://github.com/jgromes/RadioLib  

En el caso de la alternativa 3 de hardware, se propone usar el siguiente software:  
  - Node.js: https://nodejs.org/es/  
  - Librería LoRaWAN: https://www.npmjs.com/package/lorapacket  

### Aplicación móvil

Se necesita una aplicación multi-plataforma (Android y iOS) que tenga almacenado el mapa de la ciudad con los WU correspondientes. Cada vez que se conecta a un WU, actualiza el estado de los mismos y descarga el camino más cercano a un área segura.  

#### Software:
  - Framework para desarrollo de apps móviles: https://ionicframework.com/  
  - Leaflet + OpenStreetMap: https://www.javascripttuts.com/using-leaflet-open-street-map-in-an-ionic-application-in-one-go/  

### Interfaces

#### Serialización de mensajes

Se propone usar MessagePack para la comunicación entre los componentes debido a su eficiencia, tamaño y portabilidad: https://msgpack.org/  
