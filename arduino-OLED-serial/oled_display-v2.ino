// #include <SPI.h>
// #include <Wire.h>
// #include <Adafruit_GFX.h>
// #include <Adafruit_SSD1306.h>

// #define SCREEN_WIDTH 128 // OLED display width, in pixels
// #define SCREEN_HEIGHT 64 // OLED display height, in pixels

// // Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
// // The pins for I2C are defined by the Wire-library.
// // On an arduino LEONARDO: 2(SDA), 3(SCL)
// #define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)
// #define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32
// Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// String data = "";
// float currentPrice = 0.0;
// bool dataReceived = false;

// void setup() {
//   Serial.begin(115200);
  
//   if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3C for 128x32
//     Serial.println(F("SSD1306 allocation failed"));
//     for(;;);
//   }
  
//   delay(2000);
  
//   // Initial display
//   updateDisplay(0.0);
  
//   Serial.println("Arduino ready for data");
// }

// void loop() {
//   // Check for incoming serial data
//   if (Serial.available() > 0) {
//     data = Serial.readStringUntil('\n');
//     data.trim(); // Remove any whitespace/newlines
    
//     // Parse the received price
//     float newPrice = data.toFloat();
    
//     // Update display if we received a valid number
//     if (newPrice >= 0.0) {
//       currentPrice = newPrice;
//       updateDisplay(currentPrice);
//       Serial.print("Received price: £");
//       Serial.println(currentPrice, 4); // Print with 4 decimal places
//     }
//   }

// }

// void updateDisplay(float price) {
//   display.clearDisplay();
//   display.setTextSize(2);
//   display.setTextColor(WHITE);
//   display.setCursor(0, 20);
  
//   // Format price with pound sign and 4 decimal places
//   display.print("£");
//   display.println(price, 4);
  
//   // Add a title
//   display.setTextSize(1);
//   display.setCursor(0, 0);
//   display.println("Visitor Logbook");
  
//   // Add current time indicator (optional)
//   display.setCursor(0, 50);
//   display.print("Total: ");
//   display.print(millis() / 1000);
//   display.println("s");
  
//   display.display();
// }


#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
// The pins for I2C are defined by the Wire-library.
// On an arduino LEONARDO: 2(SDA), 3(SCL)
#define OLED_RESET -1 // Reset pin # (or -1 if sharing Arduino reset pin)
#define SCREEN_ADDRESS 0x3C ///< See datasheet for Address; 0x3D for 128x64, 0x3C for 128x32

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

String data = "";
float currentPrice = 0.0;
bool dataReceived = false;
bool displayInitialized = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize display - UNCOMMENTED AND IMPROVED
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS)) {
    Serial.println(F("SSD1306 allocation failed"));
    displayInitialized = false;
  } else {
    displayInitialized = true;
    Serial.println(F("Display initialized successfully"));
  }
  
  delay(2000);
  
  // Initial display
  if (displayInitialized) {
    updateDisplay(0.0);
  }
  
  Serial.println("Arduino ready for data");
}

void loop() {
  // Check for incoming serial data
  if (Serial.available() > 0) {
    data = Serial.readStringUntil('\n');
    data.trim(); // Remove any whitespace/newlines
    
    // Better validation - check if string contains valid number
    if (data.length() > 0 && (data.charAt(0) >= '0' && data.charAt(0) <= '9') || data.charAt(0) == '.') {
      float newPrice = data.toFloat();
      
      // Update display if we received a valid number > 0 OR exactly 0
      if (newPrice > 0.0 || data == "0" || data == "0.0") {
        currentPrice = newPrice;
        if (displayInitialized) {
          updateDisplay(currentPrice);
        }
        Serial.print("Received price: £");
        Serial.println(currentPrice, 4); // Print with 4 decimal places
      } else {
        Serial.print("Invalid price received: ");
        Serial.println(data);
      }
    } else {
      Serial.print("Invalid data format: ");
      Serial.println(data);
    }
  }
}

void updateDisplay(float price) {
  if (!displayInitialized) {
    return;
  }
  
  display.clearDisplay();
  
  // Add a title
  // display.setTextSize(1);
  
  // display.setCursor(0, 0);
  // display.println("Visitor Logbook");
  
  // Display price
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 20);
  display.print("GBP  ");
  display.setTextSize(3);
  display.println(price, 2);
  
  // Add current time indicator
  // display.setTextSize(1);
  // display.setCursor(0, 50);
  // display.print("Total: ");
  // display.print(millis() / 1000);
  // display.println("s");
  
  display.display();
}

// Optional: Add a function to test display without serial input
void testDisplay() {
  if (displayInitialized) {
    updateDisplay(123.4567);
    delay(2000);
    updateDisplay(0.0);
  }
}

// void setup() {
//   Serial.begin(9600);
// }
// void loop() {
//   Serial.println("Hello");
//   delay(1000);
// }