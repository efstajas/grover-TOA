#include <Adafruit_NeoPixel.h>
#include <AsyncDelay.h>

AsyncDelay blinkDelay;
bool blinking = false;

#include <Arduino.h>

int r = 255;
int g = 0;
int b = 0;

#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>

#include <SocketIoClient.h>

ESP8266WiFiMulti WiFiMulti;
SocketIoClient webSocket;

Adafruit_NeoPixel strip = Adafruit_NeoPixel(30, D1, NEO_GRB + NEO_KHZ800);

void event(const char * payload, size_t length) {
  //Serial.println("event!");
  if (String(payload) == "true") {
    startBlink();
  } else if (String(payload) == "false") {
    endBlink();
  }
}

void identify(const char * payload, size_t length) {
  webSocket.emit("light","true");
}

void setup() {
    pinMode(16,OUTPUT);
    digitalWrite(16,LOW);
    
    for(uint8_t t = 4; t > 0; t--) {
      delay(1000);
    }

    WiFiMulti.addAP("Grover_TOA", "ja25bi30");

    while(WiFiMulti.run() != WL_CONNECTED) {
        delay(100);
    }

    webSocket.on("blink", event);
    webSocket.on("connect", identify);
    webSocket.on("color", changeColor);
    webSocket.begin("192.168.1.139",3000);

    strip.begin();
    
    for(uint16_t i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(r,g,b));
    }
    strip.show();
}

void startBlink() {
  //Serial.println("starting blink");
  blinking = true;
  blinkDelay.start(100, AsyncDelay::MILLIS);
}

void endBlink() {
  blinking = false;
  for(uint16_t i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(r,g,b));
  }
  strip.show();
}

void blinkEm() {
  //Serial.println("blinkem");
  for(uint16_t i=0; i<strip.numPixels(); i++) {
      int offset = random(-50,50);
      strip.setPixelColor(i, strip.Color(constrain(r + offset,0,255), constrain(g + offset,0,255), constrain(b + offset,0,255)));
  }
  strip.show();
}

void changeColor(const char * payload, size_t length) {
  String myString = payload;
  myString.replace("[","");
  myString.replace("]","");
  int commaIndex = myString.indexOf(',');
  int secondCommaIndex = myString.indexOf(',', commaIndex + 1);

  String firstValue = myString.substring(0, commaIndex);
  String secondValue = myString.substring(commaIndex + 1, secondCommaIndex);
  String thirdValue = myString.substring(secondCommaIndex + 1);

  r = firstValue.toInt();
  g = secondValue.toInt();
  b = thirdValue.toInt();

  for(uint16_t i=0; i<strip.numPixels(); i++) {
      strip.setPixelColor(i, strip.Color(r,g,b));
  }
  strip.show();
}

void loop() {
    webSocket.loop();
    if (blinking && blinkDelay.isExpired()) {
      blinkEm();
      blinkDelay.repeat();
    }

    delay(20);
    
}

int getRandomOffset(int input) {
  return constrain(input + random(-10,10),0,255);
}