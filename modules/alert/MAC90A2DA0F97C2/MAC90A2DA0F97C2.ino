// Date de publication : 27th October 2014  11:17:47
#include <SPI.h>
#include <Dhcp.h>
#include <Dns.h>
#include <Ethernet.h>
#include <EthernetClient.h>

#include <EthernetUdp.h>
#include <util.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.
byte mac[]                = {  0x90, 0xA2, 0xDA, 0x0F, 0x97, 0xC2 }; // { 0x90, 0xA2, 0xDA, 0x0F, 0x98, 0x27 }
byte mqttServerIP[]       = { 192, 168, 12, 104 }; // { 192, 168, 0, 154 }
byte relayPin[4] = {2, 7, 8};
char id[]                      = "alert_2ndfloor_d";
char topic_status_ip[]         = "/status/ip";
char topic_status_enabled[]    = "/status/enabled";
char topic_status_turned_on[]  = "/status/turned_on";
char topic_turn_on[]           = "/alert/turn_on";
char topic_turn_off[]          = "/alert/turn_off";
char topic_disable[]           = "/alert/disable";
char topic_enable[]            = "/alert/enable";
char topic_reconnect[]         = "/command/reconnect";

// State vars
boolean state_enabled = true;
boolean state_turned_on = false;

String readSerialString = "";

EthernetClient ethClient;
//byte ip[] = { 172, 16, 0, 100 };

PubSubClient mqttClient(mqttServerIP, 1883, onMessage, ethClient);


String getIPString(){
    String ip = "";
    for (byte index = 0; index < 4; index++) {
        ip += String(Ethernet.localIP()[index]);
        if(index < 3){
            ip += ".";
        }
    }

    return ip;
}

String getStringfromBytes(byte* somebytes, unsigned int length){
    String result = "";
    for (byte index = 0; index < length; index++) {
        result.concat(char(somebytes[index]));
    }

    return result;
}

void publishState(){
    char on[]         = "true";
    char off[]         = "false";
    char ip[15];
    getIPString().toCharArray(ip, 15);
    mqttClient.publish(topic_status_ip, ip);
    mqttClient.publish(topic_status_enabled, state_enabled ? on : off);
    mqttClient.publish(topic_status_turned_on, state_turned_on ? on : off);
}

void connect() {
    if (mqttClient.connect(id)) {
        char ip[15];
        getIPString().toCharArray(ip, 15);
        Serial.print("IP address : ");
        Serial.write(ip);
        Serial.println("");
        mqttClient.subscribe(topic_turn_on);
        mqttClient.subscribe(topic_turn_off);
        mqttClient.subscribe(topic_disable);
        mqttClient.subscribe(topic_enable);
        mqttClient.subscribe(topic_reconnect);

        publishState();
    }
}

void reconnect(){
    Serial.println("Reconnect");
    turnLightOFF();
    // Simply disconnect ; reconnection will occure at next loop
    mqttClient.disconnect();
}

void turnLightON(){
    if(state_enabled == true){
        Serial.println("Turn light ON");
        digitalWrite(relayPin[1], HIGH);
        state_turned_on = true;
        return;
    }
    Serial.println("Bypassing turn light ON : module is disabled");
}

void turnLightOFF(){
    Serial.println("Turn light OFF");
    digitalWrite(relayPin[1], LOW);
    state_turned_on = false;
}

void disable(){
    Serial.println("Disable");
    turnLightOFF();
    state_enabled = false;
}

void enable(){
    Serial.println("Enable");
    state_enabled = true;
}


void processMessage(char* topic, byte* payload, unsigned int length){
    Serial.println("Process");
    if(String(topic) == String(topic_disable)){
        disable();
    }

    if(String(topic) == String(topic_enable)){
        enable();
    }

    if(String(topic) == String(topic_turn_on)){
        turnLightON();
    }

    if(String(topic) == String(topic_turn_off)){
        turnLightOFF();
    }

    if(String(topic) == String(topic_reconnect)){
        reconnect();
    }

    publishState();
}


void onMessage(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message received (topic | payload) : (");
    Serial.print(topic);
    Serial.print(" | ");
    Serial.write(payload, length);
    Serial.println(")");
    // Message is for all modules
    if(length == 0){
        processMessage(topic, payload, length);

        return;
    }

    String payLoadStr = getStringfromBytes(payload, length);

    // Message is specific to this module
    if(payLoadStr == String(id)){
        processMessage(topic, payload, length);

        return;
    }

    Serial.println("Bypassing incoming message (" + String(topic) + "), not for me. (" + payLoadStr + ")");
}

void setup() {
    for(int i = 0; i < 4; i++)  {
        pinMode(relayPin[i], OUTPUT);
    }
    //Ethernet.begin(mac, ip);
    Ethernet.begin(mac);
    Serial.begin(9600);
}

void loop() {
    if(!mqttClient.connected()) {
        Serial.println("MQTT not connected, trying to reconnect...");
        connect();
    }

    mqttClient.loop();
}

void serialEvent() {
    while (Serial.available()) {
        char inChar = (char)Serial.read();

        if(inChar == '&'){
            Serial.println("Echo serial : " + readSerialString);

            if(readSerialString == "reconnect"){
                reconnect();
            }

            if(readSerialString == "disable"){
                disable();
            }

            if(readSerialString == "enable"){
                enable();
            }

            if(readSerialString == "on"){
                turnLightON();
            }

            if(readSerialString == "off"){
                turnLightOFF();
            }

            readSerialString = "";

            publishState();

            return;
        }

        readSerialString += inChar;
    }
}











