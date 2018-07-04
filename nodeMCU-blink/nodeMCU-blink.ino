#include <Arduino.h>

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <SocketIoClient.h>

#define USE_SERIAL Serial

ESP8266WiFiMulti WiFiMulti;
SocketIoClient webSocket;

void event(const char * payload, size_t length) {
  USE_SERIAL.printf("got message: %s\n", payload);
  digitalWrite(16,HIGH);
}

void identify(const char * payload, size_t length) {
  USE_SERIAL.println("IDENTIFYING AS LIGHT");
  webSocket.emit("light","true");
}

void setup() {
    pinMode(16,OUTPUT);
    digitalWrite(16,LOW);
    USE_SERIAL.begin(115200);

    USE_SERIAL.setDebugOutput(true);

    USE_SERIAL.println();
    USE_SERIAL.println();
    USE_SERIAL.println();

      for(uint8_t t = 4; t > 0; t--) {
          USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
          USE_SERIAL.flush();
          delay(1000);
      }

    WiFiMulti.addAP("rethink wifi", "20GetGrover18!");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    webSocket.on("blink", event);
    webSocket.on("connect", identify);
    webSocket.begin("192.168.2.138:3000");
}

void loop() {
    webSocket.loop();
}
