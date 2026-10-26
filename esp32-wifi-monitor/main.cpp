#include <WiFi.h>
#include <WebServer.h>
#include <SPIFFS.h>

WebServer server(80);

const char* ssid = "SEU_WIFI_NOME";
const char* password = "SUA_SENHA_WIFI";

String readFile(const char* path) {
    File file = SPIFFS.open(path, "r");
    if (!file) {
        Serial.println("Erro ao abrir arquivo para leitura");
        return String();
    }
    String content = file.readString();
    file.close();
    return content;
}

void handleRoot() {
    String html = readFile("/index.html");
    if (html.length() > 0) {
        server.send(200, "text/html", html);
    } else {
        server.send(404, "text/plain", "index.html nao encontrado na SPIFFS");
    }
}

void setup() {
    Serial.begin(115200);

    if (!SPIFFS.begin(true)) {
        Serial.println("Erro ao montar SPIFFS");
        return;
    }

    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.print("Conectado! IP do ESP32: ");
    Serial.println(WiFi.localIP());

    server.on("/", handleRoot);
    server.begin();
    Serial.println("Servidor HTTP iniciado.");
}

void loop() {
    server.handleClient();
}
