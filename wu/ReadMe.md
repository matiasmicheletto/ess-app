# Tutorial configuración hotspot + fake captive portal

Modificado y resumido de:
http://www.cybersecurityguy.com/Building_a_Raspberry_Pi_Captive_Portal_Wi-Fi_Hotspot.pdf


Instalar hostap daemon
```
sudo apt‐get install hostapd
```

Editar configuracion
```
sudo nano /etc/hostapd/hostapd.conf
```

Usar:
```
interface=wlan0
driver=nl80211
ssid=ESS-NETWORK
hw_mode=g
channel=6
```

Para probar ejecutar:
```
sudo hostapd /etc/hostapd/hostapd.conf
```

Configurar hostapd para que ejecute en arranque:
```
sudo nano /etc/rc.local
```

Agregar al final:
```
hostapd ‐B /etc/hostapd/hostapd.conf
```

Instalar server dhcp
```
sudo apt‐get install isc‐dhcp‐server
```

Editar configuracion del server
```
sudo nano /etc/dhcp/dhcpd.conf
```

Descomentar la linea que dice “#authoritative”

Agregar esto al final:
```
subnet 10.0.10.0 netmask 255.255.255.0 {
    range 10.0.10.2 10.0.10.254
    option domain‐name "essnetwork.com";
    option domain‐name‐servers 8.8.8.8,8.8.4.4;
    option routers 10.0.10.1;
    interface wlan0;
}
```

Editar el archivo:
```
sudo nano /etc/network/interfaces
```

Cambiar "iface wlan0 inet manual" por "iface wlan0 inet static" y agregar esto debajo:
```
address 10.0.10.1
netmask 255.255.255.0
```

Editar
```
sudo nano /etc/sysctl.conf
```

Y descomentar la linea que dice "net.ipv4.ip_forward=1"

Ejecutar
```
sudo iptables ‐t nat ‐A POSTROUTING ‐o eth0 ‐j MASQUERADE
```

Instalar y confirmar guardar reglas:
```
sudo apt‐get install iptables‐persistent
```

Reiniciar:
```
sudo shutdown –r now
```


### Instalar captive-portal de nodogsplash

```
wget https://github.com/nodogsplash/nodogsplash/archive/master.zip
unzip master.zip
rm master.zip
cd nodogsplash‐master
make
sudo make install
```

Editar archivo de configuracion:
```
sudo nano /etc/nodogsplash/nodogsplash.conf
```

Escribir:
```
GatewayInterface wlan0
GatewayAddress 10.0.10.1
MaxClients 250
ClientIdleTimeout 480
```

Editar la web (o copiar otra encima):
```
sudo nano /etc/nodogsplash/htdocs/splash.html 
```

Iniciar:
```
sudo nodogsplash
```

Editar el archivo
```
sudo nano /etc/rc.local
```

Agregar esta linea:
```
nodogsplash
```


### Fake captive-portal para usar sin conexion

Instalar el servidor DNS:

```
sudo apt‐get install bind9
```

Editar configuracion:

```
sudo nano /etc/bind/named.conf.local
```

Agregar esto al final:
```
zone "." {
    type master;
    file "/etc/bind/db.catchall";
};
```

Modificar archivo de opciones:

```
sudo nano /etc/bind/named.conf.options
```

Modificar "dir=/etc/namedb" por "dir = /etc/bind"

Y Crear este archivo:
```
sudo nano /etc/bind/db.catchall
```

Con este contenido:
```
$TTL    604800
@       IN      SOA     . root.localhost. (
                              1         ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
IN NS .
. IN A 10.0.10.1
*. IN A 10.0.10.1
```

Para que el server inicie en arranque, editar:
```
sudo nano /etc/rc.local
```

Y agregar esta línea:
```
named –u bind
```

Editar:
```
sudo nano /etc/dhcp/dhcp.conf
```

Buscar línea que dice "" y poner esto:
```
option domain‐name‐servers 10.0.10.1;
```

Reiniciar.
