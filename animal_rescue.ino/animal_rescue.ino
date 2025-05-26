#include <WiFi.h>
#include <WebSocketsServer.h>

const char *wifi_ssid = "AAVISHKAR-1_2025";
const char *wifi_password = "KU@12345";

WebSocketsServer web_socket = WebSocketsServer(81);

typedef struct struct_message {
  char id[20];
  char lat[15];
  char lng[15];
  char temp[10];
  char hum[10];
} struct_message;

struct_message incoming_data;
volatile bool newDataAvailable = false;

// Simple parser for WebSocket data
void parseIncomingData(String message) {
  // Reset incoming_data to avoid garbage values
  memset(&incoming_data, 0, sizeof(incoming_data));
  
  // Parse message and fill incoming_data
  if(message.indexOf("ID:") != -1) {
    int idStart = message.indexOf("ID:") + 3;
    int idEnd = message.indexOf(",", idStart);
    if(idEnd == -1) idEnd = message.indexOf("\n", idStart);
    if(idEnd == -1) idEnd = message.length();
    
    String idValue = message.substring(idStart, idEnd);
    idValue.trim();
    idValue.toCharArray(incoming_data.id, sizeof(incoming_data.id));
  }
  
  if(message.indexOf("Lat:") != -1) {
    int latStart = message.indexOf("Lat:") + 4;
    int latEnd = message.indexOf(",", latStart);
    if(latEnd == -1) latEnd = message.indexOf("\n", latStart);
    if(latEnd == -1) latEnd = message.length();
    
    String latValue = message.substring(latStart, latEnd);
    latValue.trim();
    latValue.toCharArray(incoming_data.lat, sizeof(incoming_data.lat));
  }
  
  if(message.indexOf("Lng:") != -1) {
    int lngStart = message.indexOf("Lng:") + 4;
    int lngEnd = message.indexOf(",", lngStart);
    if(lngEnd == -1) lngEnd = message.indexOf("\n", lngStart);
    if(lngEnd == -1) lngEnd = message.length();
    
    String lngValue = message.substring(lngStart, lngEnd);
    lngValue.trim();
    lngValue.toCharArray(incoming_data.lng, sizeof(incoming_data.lng));
  }
  
  if(message.indexOf("Temp:") != -1) {
    int tempStart = message.indexOf("Temp:") + 5;
    int tempEnd = message.indexOf(",", tempStart);
    if(tempEnd == -1) tempEnd = message.indexOf("\n", tempStart);
    if(tempEnd == -1) tempEnd = message.length();
    
    String tempValue = message.substring(tempStart, tempEnd);
    tempValue.trim();
    tempValue.toCharArray(incoming_data.temp, sizeof(incoming_data.temp));
  }
  
  if(message.indexOf("Hum:") != -1) {
    int humStart = message.indexOf("Hum:") + 4;
    int humEnd = message.indexOf(",", humStart);
    if(humEnd == -1) humEnd = message.indexOf("\n", humStart);
    if(humEnd == -1) humEnd = message.length();
    
    String humValue = message.substring(humStart, humEnd);
    humValue.trim();
    humValue.toCharArray(incoming_data.hum, sizeof(incoming_data.hum));
  }
  
  newDataAvailable = true;
}

// WebSocket event handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    
    case WStype_CONNECTED:
      {
        IPAddress ip = web_socket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        web_socket.sendTXT(num, "Connected to ESP32 WebSocket Server");
      }
      break;
    
    case WStype_TEXT:
      {
        String message = String((char*)payload);
        Serial.printf("[%u] Received text: %s\n", num, payload);
        
        // Check if message contains sensor data
        if(message.indexOf("ID:") != -1 || message.indexOf("Lat:") != -1 || 
           message.indexOf("Temp:") != -1) {
          // This looks like sensor data, parse it
          parseIncomingData(message);
          
          // Acknowledge receipt
          web_socket.sendTXT(num, "Data received");
        }
      }
      break;
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.mode(WIFI_STA);

  WiFi.begin(wifi_ssid, wifi_password);

  Serial.print("Booting...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.println("WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  web_socket.begin();
  web_socket.onEvent(webSocketEvent);
  Serial.println("Web Socket server started...");

  // Initialize incoming_data
  memset(&incoming_data, 0, sizeof(incoming_data));
  strcpy(incoming_data.id, "No data");
  strcpy(incoming_data.lat, "0.0");
  strcpy(incoming_data.lng, "0.0");
  strcpy(incoming_data.temp, "0.0");
  strcpy(incoming_data.hum, "0.0");
}

void loop() {
  web_socket.loop();
  String lat_str, lng_str;

  if (newDataAvailable) {
    newDataAvailable = false;

    // Convert lat/lng to float and format to 3 decimals
    float lat = atof(incoming_data.lat);
    float lng = atof(incoming_data.lng);
    lat_str = String(lat, 3);
    lng_str = String(lng, 3);

    Serial.println("====== RECEIVED ======");
    Serial.println("ID: " + String(incoming_data.id));
    Serial.println("Lat: " + lat_str);
    Serial.println("Lng: " + lng_str);
    Serial.println("Temp: " + String(incoming_data.temp));
    Serial.println("Hum: " + String(incoming_data.hum));
    Serial.println("======================");

  }

  static unsigned long lastSensorTime = 0;
  if (millis() - lastSensorTime > 2000) {
    lastSensorTime = millis();

    String sensorData = "ID: " + String(incoming_data.id) + "\n";
    sensorData += "Latitude: " + String(incoming_data.lat) + "\n";
    sensorData += "Longitude: " + String(incoming_data.lng) + "\n";
    sensorData += "Temperature: " + String(incoming_data.temp) + "°C" + "\n";
    sensorData += "Humidity: " + String(incoming_data.hum) + "\n";
    web_socket.broadcastTXT(sensorData);
  }
}
