#!/bin/bash

# Ir a home ?
cd /home/pi

# Clonar repo
git clone https://github.com/matiasmicheletto/ess-app

# Copiar archivos a la carpeta del captive portal
sudo cp /home/pi/ess-app/app/* /etc/nodogsplash/htdocs/ -r

# Cambiar el nombre index por splash
sudo rm /etc/nodogsplash/htdocs/splash.html
sudo mv /etc/nodogsplash/htdocs/index.html /etc/nodogsplash/htdocs/splash.html


#
#-----------
#


# Ejecutar el server con:
node /home/pi/ess-app/wu/raspberry/WebSocketServer.js
