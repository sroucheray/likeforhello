// Date de publication : 30th October 2014  13:45:51
#include <SPI.h>
#include <Dhcp.h>
#include <Dns.h>
#include <Ethernet.h>
#include <EthernetClient.h>

#include <EthernetUdp.h>
#include <util.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.
byte mac[]                = {  0x90, 0xA2, 0xDA, 0x0F, 0x97, 0x85 }; // { 0x90, 0xA2, 0xDA, 0x0F, 0x98, 0x27 }
byte mqttServerIP[]       = { 192, 168, 12, 12 }; // { 192, 168, 0, 154 }
byte buttonPin[4] = {2, 3, 4};
char id[]                      = "button_ground";
char topic_status_ip[]         = "/status/ip";
char topic_status_enabled[]    = "/status/enabled";
char topic_status_pushed[]     = "/button/pushed";
char topic_disable[]           = "/button/disable";
char topic_enable[]            = "/button/enable";
char topic_reconnect[]         = "/command/reconnect";

unsigned long time;
unsigned long reconnectDelaySec = 60 * 60;

// State vars
boolean state_enabled = true;
int buttonState[] = {0, 0, 0, 0};         // current state of buttons
int lastButtonState[] = {0, 0, 0, 0};     // previous state of buttons

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
}

void connect() {
    if (mqttClient.connect(id)) {
        char ip[15];
        getIPString().toCharArray(ip, 15);
        Serial.print("IP address : ");
        Serial.write(ip);
        Serial.println("");
        mqttClient.subscribe(topic_disable);
        mqttClient.subscribe(topic_enable);
        mqttClient.subscribe(topic_reconnect);

        publishState();
    }
}

void reconnect(){
    Serial.println("Reconnect");
    for(int i = 0; i < 4; i++)  {
        buttonState[i] = 0;
        lastButtonState[i] = 0;
    }
    // Simply disconnect ; reconnection will occure at next loop
    mqttClient.disconnect();
}

void disable(){
    Serial.println("Disable");
    state_enabled = false;
}

void enable(){
    Serial.println("Enable");
    state_enabled = true;
}

void testButtonPushed(){
    for(int i = 0; i < 4; i++)  {
        // read the pushbutton input pin:
        buttonState[i] = digitalRead(buttonPin[i]);
        // compare the buttonState to its previous state
        if (buttonState[i] != lastButtonState[i]) {
            // if the state has changed, increment the counter
            if (buttonState[i] == HIGH) {
                publishButtonPushed(i);
            } else {
                // if the current state is LOW then the button
                // wend from on to off:
                Serial.println("Button released");
            }
        }
        // save the current state as the last state,
        //for next time through the loop
        lastButtonState[i] = buttonState[i];
    }
}

void publishButtonPushed(int buttonId){
    char buttonChar[2];   //declaring character array
    String str = String(buttonId);
    str.toCharArray(buttonChar, 2);

    Serial.print("Button pushed ");
    Serial.write(buttonChar);
    Serial.println("");
    mqttClient.publish(topic_status_pushed, buttonChar);
}


void processMessage(char* topic, byte* payload, unsigned int length){
    Serial.println("Process");
    if(String(topic) == String(topic_disable)){
        disable();
    }

    if(String(topic) == String(topic_enable)){
        enable();
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
    Serial.begin(9600);
    for(int i = 0; i < 4; i++)  {
        pinMode(buttonPin[i], INPUT);
    }
    //Ethernet.begin(mac, ip);
    int isConnected = Ethernet.begin(mac);
    if(isConnected == 0){
        Serial.println("DHCP failed");
    }else if(isConnected == 1){
        Serial.println("DHCP success");

    }
}

void loop() {
    if ((millis() > (time + reconnectDelaySec * 1000))) {
        Serial.println("Periodic reconnection");
        time = millis();
        reconnect();
    }

    if(!mqttClient.connected()) {
        Serial.println("MQTT not connected, trying to reconnect...");
        connect();
    }

    mqttClient.loop();

    testButtonPushed();
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

            if(readSerialString == "pushed1"){
                publishButtonPushed(1);
            }

            if(readSerialString == "pushed2"){
                publishButtonPushed(2);
            }

            if(readSerialString == "pushed3"){
                publishButtonPushed(3);
            }

            if(readSerialString == "pushed4"){
                publishButtonPushed(4);
            }

            readSerialString = "";

            publishState();

            return;
        }

        readSerialString += inChar;
    }
}











