#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ESP8266WebServer.h>
#include <Ticker.h>

// Parametros
#define BAUDRATE 115200 // Velocidad serial
#define T_PERIOD 10000 // Periodo de actualizacion de estado (ms)
//#define WIFI_PWD true // Usar contrasenia
#define WIFI_MODE_AP true // Modo Access Point
#define DEBUG true // Modo Debuggeo
//#define VERBOSE true // Mostrar texto en cada intercambio

// Codigos de error
#define ERROR_LED 2 // Pin para mostrar errores (builtin)
enum{AP_CONFIG_ERROR, AP_INIT_ERROR};

ESP8266WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81); // Websocket puerto 81

// Funciones periodicas 
Ticker ticker;

// Autenticacion red
const char* ssid = "ESSNETWORK";
#ifdef WIFI_PWD
  const char* pwd = "ESSNETWORK";
#endif

uint8_t client_num; // Un solo cliente por vez

static const char PROGMEM INDEX_HTML[] = R"( 
<!DOCTYPE html>
<html>
  <head>
      <meta charset=utf-8>
      <title>ESSN Access Point</title>
  </head>
  <body>
  </body>
</html>
)";

void displayError(int code){ // Muestra codigos de error usando el led
  int swPeriod = 0; // Periodo de parpadeo del led en ms
  switch(code){
    case AP_CONFIG_ERROR: // Error configurando AP
      #ifdef DEBUG
        Serial.println("Error configurando AP");
      #endif
      swPeriod = 500;
      break;
    case AP_INIT_ERROR: // Error de inicializacion AP
      #ifdef DEBUG
        Serial.println("Error inicializando AP");
      #endif
      swPeriod = 1000;
      break;
    default: 
      return;
      break;
  }

  // Bloquear aca
  while(true){ 
    delay(swPeriod);
    digitalWrite(ERROR_LED, HIGH);
    delay(swPeriod);
    digitalWrite(ERROR_LED, LOW);
  }
}

void updateStatus() {
  // Aqui realizar sincronizacion de estado con el EOC
  #ifdef DEBUG
    Serial.println("Estado actualizado.");
  #endif
}

void webSocketEvent(uint8_t client, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(client);
      #ifdef DEBUG
        Serial.printf("[%u] Conectado a la URL: %d.%d.%d.%d - %s\n", client, ip[0], ip[1], ip[2], ip[3], payload); 
      #endif
      break;
    }
    case WStype_DISCONNECTED:{
      #ifdef DEBUG
        Serial.printf("[%u] Desconectado!\n", client);
      #endif
      break;
    }
    case WStype_TEXT:{
      client_num = client;
      #ifdef DEBUG
        Serial.printf("%s\n", payload);
      #endif
      break;
    }
  }
}

void setup() {

  pinMode(ERROR_LED, OUTPUT);

  #if defined(DEBUG)
    Serial.begin(BAUDRATE); // Iniciar comunicacion con PC
  #endif
  
  ////// INICIALIZAR AP //////
  
  boolean status; // Estado del inicio AP
  
  #ifdef WIFI_MODE_AP // Modo AP
    
    #ifdef DEBUG
      Serial.println("Configurando AP...");
    #endif
    
    IPAddress local_IP(192,168,4,1);
    IPAddress gateway(192,168,4,2);
    IPAddress subnet(255,255,255,0);
    status  = WiFi.softAPConfig(local_IP, gateway, subnet);
  
    if(!status) // Si hubo error de configuracion del AP
      displayError(AP_CONFIG_ERROR); // Indicar
  
    #ifdef DEBUG
    else
      Serial.println("Listo.");
    Serial.println("Iniciando AP...");
    #endif
  
    status = WiFi.softAP(ssid);

    if(!status) // Si hubo error de inicio del AP
      displayError(AP_INIT_ERROR); // Indicar
  
    #if defined(DEBUG)
    else
      Serial.println("Listo.");
    #endif

  #else // Si en vez de AP es modo STA

    #ifdef WIFI_PWD
      status = WiFi.begin(ssid, pwd); // Con password
    #else
      status = WiFi.begin(ssid); // Sin password
    #endif
    
    while (WiFi.status() != WL_CONNECTED) { // Esperar conexion con modem
      delay(500);
      #ifdef DEBUG
        Serial.printf(".");
      #endif
    }

  #endif

    
  if(!status)
    displayError(AP_INIT_ERROR);
  #if defined(DEBUG)
  else
    Serial.println("Listo.");   
    #ifdef WIFI_MODE_AP
      // Mostrar direccion IP
      Serial.print("Soft-AP: direccion IP = ");
      Serial.println(WiFi.softAPIP());
    #else
      // Mostrar IP asignada
      Serial.print("STA: direccion IP = ");
      Serial.println(WiFi.localIP()); 
    #endif
  #endif

  // Iniciar server
  server.on("/", []() {
      server.send_P(200, "text/html", INDEX_HTML);
  });
  server.begin();

  webSocket.begin(); // Iniciar WebSocket Server
  webSocket.onEvent(webSocketEvent); // Habilitar event linstener

  ticker.attach_ms(T_PERIOD, updateStatus); // Iniciar funcion periodica
}

void loop() {
  webSocket.loop(); // Solo chequea eventos y ejecuta el callback
  server.handleClient(); // Eventos del server
}
