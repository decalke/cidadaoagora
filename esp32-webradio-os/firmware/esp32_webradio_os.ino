/*
 * ESP32-S3 RadioOS • Firmware Oficial
 * Placa: ESP32-S3-N8R2 (8MB Flash, 2MB PSRAM)
 * Framework: Arduino ESP32
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Credenciais de Wi-Fi padrão (ou modo AP se não conectar)
const char* default_ssid = "SUA_REDE_WIFI";
const char* default_pass = "SUA_SENHA_WIFI";

WebServer server(80);

// Status da Rádio
bool isPlaying = false;
int currentVolume = 80;
String currentStation = "Antena 1 FM";
String currentUrl = "https://stream.zeno.fm/f3wvbbqmdg8uv";

// Endpoints da API REST para a Interface Web
void handleApiStatus() {
  DynamicJsonDocument doc(1024);
  
  doc["online"] = true;
  doc["soc"] = "ESP32-S3 (Dual-Core LX7 240MHz)";
  doc["cpu_freq_mhz"] = getCpuFrequencyMhz();
  doc["free_heap_kb"] = ESP.getFreeHeap() / 1024;
  doc["total_heap_kb"] = ESP.getHeapSize() / 1024;
  doc["free_psram_kb"] = ESP.getFreePsram() / 1024;
  doc["total_psram_kb"] = ESP.getPsramSize() / 1024;
  doc["wifi_rssi"] = WiFi.status() == WL_CONNECTED ? WiFi.RSSI() : -99;
  doc["ip"] = WiFi.status() == WL_CONNECTED ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  doc["uptime_sec"] = millis() / 1000;
  
  // Sensor de temperatura interno do ESP32-S3
  #ifdef ESP32
  doc["temperature_c"] = temperatureRead();
  #else
  doc["temperature_c"] = 42.0;
  #endif
  
  doc["is_playing"] = isPlaying;
  doc["volume"] = currentVolume;
  doc["station"] = currentStation;

  String json;
  serializeJson(doc, json);
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

void handlePlay() {
  if (server.hasArg("url")) {
    currentUrl = server.arg("url");
  }
  if (server.hasArg("name")) {
    currentStation = server.arg("name");
  }
  isPlaying = true;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"playing\"}");
}

void handleStop() {
  isPlaying = false;
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"stopped\"}");
}

void handleVolume() {
  if (server.hasArg("val")) {
    currentVolume = server.arg("val").toInt();
  }
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", "{\"status\":\"ok\"}");
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=================================");
  Serial.println("  ESP32-S3 RadioOS Inicializado  ");
  Serial.println("=================================");

  // Iniciar PSRAM (2MB)
  if (psramInit()) {
    Serial.printf("PSRAM detectada com sucesso! Total: %d KB\n", ESP.getPsramSize() / 1024);
  } else {
    Serial.println("PSRAM não disponível ou desativada no menu.");
  }

  // Conectar ao Wi-Fi ou subir Access Point próprio
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(default_ssid, default_pass);
  
  Serial.print("Conectando ao Wi-Fi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 15) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConectado ao Wi-Fi com sucesso!");
    Serial.print("IP na rede local: http://");
    Serial.println(WiFi.localIP());
  } else {
    // Modo Ponto de Acesso de emergência
    WiFi.softAP("ESP32-RadioOS-Setup", "12345678");
    Serial.println("\nWi-Fi não conectado. Criado Ponto de Acesso:");
    Serial.println("Rede: ESP32-RadioOS-Setup (Senha: 12345678)");
    Serial.print("Acesse: http://");
    Serial.println(WiFi.softAPIP());
  }

  // Rotas HTTP
  server.on("/api/status", HTTP_GET, handleApiStatus);
  server.on("/api/play", HTTP_GET, handlePlay);
  server.on("/api/stop", HTTP_GET, handleStop);
  server.on("/api/volume", HTTP_GET, handleVolume);
  
  server.begin();
  Serial.println("Servidor Web HTTP ativo na porta 80.");
}

void loop() {
  server.handleClient();
  delay(2);
}
