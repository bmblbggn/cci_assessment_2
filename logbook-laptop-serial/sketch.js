let port;              // Variable to hold serial port object
let connectBtn;  

let d, m, y, h, min;

let currentPage = 'home'; // 'home', 'keyboard', 'form', or 'thankyou'
let playerName = '';
let maxNameLength = 20;

// Virtual keyboard layout
let keyboardKeys = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

let specialKeys = [
  { key: 'SPACE', x: 0, y: 0, w: 200, h: 60 },
  { key: '←', x: 0, y: 0, w: 100, h: 60 },     // Backspace
  { key: 'ENTER', x: 0, y: 0, w: 150, h: 60 }
];

let keySize = 70;
let keySpacing = 10;
let keyboardStartY = 400;

let inputs = []; // array of input 
let dropdowns = []; // Array of dropdown objects with metadata

let submitButton;
let newEntryButton;
let backHomeButton;

let validationErrors = {
  name: false,
  rating: false
};

let visitorList = [];
let overallTotal = 0;

let thankYouTimer = 0;


function setup() {
  createCanvas(1024, 1280);

  port = createSerial();
  
  // Creates a connect button for user to open/close the serial port connection
  connectBtn = createButton('Connect to Arduino');
  connectBtn.position(850, 70);
  connectBtn.mousePressed(connectBtnClick);

  //input fields
  const inputData = [
    { label: 'Name', id: 'name'},
  ];
  //create inputs
  inputData.forEach((data, index) => {
    const input = createInput('');
    input.position(370, 200 + index * 40);
    input.hide();

    inputs.push({
      label: data.label,
      id: data.id,
      input: input,
      y: 200 + index * 40
    });
  });

  //dropdown fields
  const dropdownData = [
    { datapt: 'Rate the show', //value tbc
      options: [
        { label: 'Select', value: 0},
        { label: '1', value: 0.001 },
        { label: '2', value: 0.001 },
        { label: '3', value: 0.001},
        { label: '4', value: 0.001 },
        { label: '5', value: 0.001 }
      ] },
    { datapt: 'Age group', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'Under 18', value: 0 },
        { label: '18-24', value: 0.36 },
        { label: '25-34', value: 0.11 },
        { label: '35-44', value: 0.12 },
        { label: '45-54', value: 0.27 },
        { label: '55-64', value: 0.05 },
        { label: '64+', value: 0.05 }
      ] },
    { datapt: 'Gender', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'Male', value: 0.15 },
        { label: 'Female', value: 0.14},
        { label: 'Non-binary', value: 0 } //check value
      ] },
    { datapt: 'Ethnicity', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'White', value: 0.19 },
        { label: 'Black', value: 0.57 },
        { label: 'Hispanic', value: 0.01 },
        { label: 'Asian', value: 0.05 },
        { label: 'Native american', value: 0.09 },
        { label: 'Middle eastern', value: 0.62 },
        { label: 'Mixed', value: 0.03 },
        { label: 'Other', value: 0.07 }
      ] },
    { datapt: 'Occupation', //check value
      options: [
        { label: 'Select', value: 0 },
        { label: 'student', value: 0.0660 },
        { label: 'Full-time employed', value: 0.0660 },
        { label: 'Part-time employed', value: 0.0660 },
        { label: 'self-employed', value: 0.0660 },
        { label: 'retired', value: 0.0660 }
      ] },
    { datapt: 'Annual Family Income', 
      options: [
        { label: 'Select', value: 0 },
        { label: '<$10,000', value: 0.1 },
        { label: '$10,000 - $19,999', value: 0.03 },
        { label: '$20,000 - $29,999', value: 0.04 },
        { label: '$30,000 - $39,999', value: 0.07 },
        { label: '$40,000 - $49,999', value: 0.02 },
        { label: '$50,000 - $59,999', value: 0.03 },
        { label: '$60,000 - $69,999', value: 0.05 },
        { label: '$70,000 - $79,999', value: 0.05 },
        { label: '$80,000 - $99,999', value: 0.05 },
        { label: '$100,000 - $119,999', value: 0.04 },
        { label: '$120,000 - $149,999', value: 0.33 },
        { label: '>$150,000', value: 0.22 }
      ] },
    { datapt: 'Are you pregnant or planning to be?', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'Yes', value: 0.11 },
        { label: 'No', value: 0 }
      ] },
    { datapt: 'Do you have any children?', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'Yes', value: 0.0313 },
        { label: 'No', value: 0.0313 }
      ] },
    { datapt: 'Do you own a car or planning to purchase one?', 
      options: [
        { label: 'Select', value: 0 },
        { label: 'Yes', value: 0.0021 },
        { label: 'No', value: 0 }
      ] },

  ]//dropdownData end
  // Create dropdowns with consistent vertical spacing
  dropdownData.forEach((data, index) => {
    const sel = createSelect();
    sel.position(470, 240 + index * 40); // Vertical spacing: 40px
    sel.hide();
    data.options.forEach(opt => sel.option(opt.label)); // Use label for display

    //store the dropdowns in the array
    dropdowns.push({
      datapt: data.datapt,
      options: data.options,
      select: sel,
      y: 240 + index * 40
    });
  });

  // submit button (form)
  submitButton = createButton('SUBMIT');
  submitButton.size(250, 100);
  submitButton.style('font-size', '30px');
  submitButton.position(385, 650);
  // submitButton.center();
  submitButton.mousePressed(handleSubmit);
  submitButton.hide(); // hide initially

  // entry button (home)
  newEntryButton = createButton('NEW ENTRY');
  newEntryButton.size(300, 100);
  newEntryButton.style('font-size', '30px');
  // newEntryButton.position(500, 400);
  newEntryButton.center();
  newEntryButton.mousePressed(showKeyboardPage);

  // home button (form)
  backHomeButton = createButton('BACK TO HOME');
  backHomeButton.position(100, 130);
  backHomeButton.mousePressed(showHomePage);
  backHomeButton.hide(); // hide initially

}//setup end


function touchStarted() {
  // Call the same function as mousePressed for consistency
  mousePressed();
  
  // Prevent default touch behavior (like scrolling)
  return false;
}

function isTouchOverKey(x, y, w, h) {
  // Use touches array if available (for multi-touch)
  if (touches && touches.length > 0) {
    let touch = touches[0];
    return touch.x >= x && touch.x <= x + w && touch.y >= y && touch.y <= y + h;
  }
  return false;
}

// Prevent page scrolling/zooming on iPad
function touchMoved() {
  return false;
}


function connectBtnClick() {
  // Toggle connection to Arduino
  if (!port.opened()) {
    port.open('Arduino', 115200);  // Open serial port at 9600 baud
  } else {
    port.close();  // Close serial port
  }
}


function updateDateTime() {

  d = day();
  m = month();
  y = year();
  h = hour();
  min = minute();

}//dateTime end


function draw() {

  background(220);

  updateDateTime();

  //mouse position
  textSize(10);
  fill(0);
  text(`${mouseX}, ${mouseY}`, 20,20);

  //day and time
  // textAlign(LEFT);
  // text(d + '/' + m + '/' + y + ' ' + nf(h, 2, 0) + ':' + nf(min, 2, 0), 100, 20);
  
  //title
  textSize(50);
  textAlign(CENTER);
  fill(0);
  text('Visitor Logbook', width/2, 100);
  
  if (currentPage === 'home') {
    drawHomePage();
  } else if (currentPage === 'keyboard') {
    drawKeyboardPage();
  } else if (currentPage === 'form') {
    drawFormPage();
  } else if (currentPage === 'thankyou'){
   drawThankYouPage();
  }

  console.log(overallTotal);

  // Send price value to Arduino every 10 frames (to slow down data rate)
  if (frameCount % 10 == 0) {
    let overallTotalStr = String(overallTotal);    // Convert brightness to string
    port.write(overallTotalStr + '\n');          // Send brightness with newline
  }

  // Update button label based on connection status
  connectBtn.html(port.opened() ? 'Disconnect' : 'Connect to Arduino');

}// draw end


function drawHomePage() {

  newEntryButton.show();
  backHomeButton.hide();
  submitButton.hide();

  textSize(16);
  textAlign(LEFT);
  text('Recent Visitors: ', 300, 200);

  //show only last 8 visitors
  let maxDisplayed = 8;
  // let maxDisplayed = 1; // for test
  let startIndex = Math.max(0, visitorList.length - maxDisplayed);

  for (let i = startIndex; i < visitorList.length; i ++){
    let entry = visitorList[i];
    let displayIndex = i - startIndex; //for display positioning, so no extra space
    text(
      `${entry.name} - ${entry.date} ${entry.time}`, 300, 250 + displayIndex * 25
    );
  }

  if (visitorList.length > maxDisplayed) {
    let hiddenCount = visitorList.length - maxDisplayed;
    let lastDisplayIndex = Math.min(maxDisplayed, visitorList.length);
    fill(80);
    text(`and ${hiddenCount} more`, 300, 250 + lastDisplayIndex * 26);
  }

  if (visitorList.length <= 0) {
    text("no one's here yet :'(", 300, 250);
  }
  
  fill(0);
  textSize(20);
  textAlign(LEFT);
  text(`Total Visitors: ${visitorList.length}`, 50, height-80);
  text(`Logbook price: ${overallTotal.toFixed(4)}`, 50, height -50);

}// homepage end

//for the buttons
function showHomePage() {
  
  resetForm();
  currentPage = 'home';
  
  // Hide form elements
  inputs.forEach(item => item.input.hide());
  dropdowns.forEach(item => item.select.hide());
  submitButton.hide();
  backHomeButton.hide();

  // Show home elements
  newEntryButton.show();
  
  // Clear validation errors
  validationErrors.name = false;
  validationErrors.rating = false;

}// showhomepage end


function drawFormPage() {

  newEntryButton.hide();
  backHomeButton.show();

  textSize(16);
  textAlign(LEFT);

  // Display input labels and input values
  inputs.forEach(item => {
    if (item.id === 'name' && validationErrors.name){
      fill(255, 0, 0);
    } else{
      fill(0);
    }
    text(item.label + ': ' + item.input.value().substring(0, 28), 100, item.y +15);
  }); //substring to only show the first 28 letters include space

  // Display dropdown labels and selected values
  dropdowns.forEach(item => {
    if (item.datapt === 'Rate the show' && validationErrors.rating){
      fill(255, 0, 0);
    } else {
      fill(0);
    }
    text(item.datapt, 100, item.y + 15);
    // text(item.datapt + item.select.value(), 100, item.y + 15);
  });

  //display total price of the current record
  fill(0);
  let thisTotal = calculateTotalPrice();
  textSize(18);
  text('Total Price: ' + thisTotal.toFixed(4), 25, 850);

}// formpage end

function showFormPage() {
  currentPage = 'form';
  
  // Show form elements
  // inputs.forEach(item => item.input.show());
  dropdowns.forEach(item => item.select.show());
  submitButton.show();
  backHomeButton.show();
  
  // Hide home elements
  newEntryButton.hide();

}//showformpage end


function drawKeyboardPage() {
  // Hide all other UI elements
  inputs.forEach(item => item.input.hide());
  dropdowns.forEach(item => item.select.hide());
  submitButton.hide();
  backHomeButton.hide();
  newEntryButton.hide();

  // Draw instruction
  textSize(24);
  textAlign(CENTER);
  fill(0);
  text('Enter your name:', width/2, 200);
  
  // Draw name display area with cursor
  textSize(32);
  fill(50);
  rect(200, 220, 624, 60, 10);
  
  fill(255);
  textAlign(LEFT);
  let displayName = playerName;
  if (frameCount % 60 < 30) { // Blinking cursor
    displayName += '_';
  }
  text(displayName, 220, 260);
  
  // Character count
  textSize(14);
  fill(100);
  textAlign(RIGHT);
  text(`${playerName.length}/${maxNameLength}`, 810, 290);
  
  // Draw keyboard
  drawVirtualKeyboard();
  
  // Draw back button
  fill(200);
  rect(50, 150, 100, 40, 5);
  fill(0);
  textAlign(CENTER);
  textSize(16);
  text('← BACK', 100, 175);
}

function showKeyboardPage() {
  currentPage = 'keyboard';
  playerName = ''; // Reset name
  
  // Hide all form elements
  inputs.forEach(item => item.input.hide());
  dropdowns.forEach(item => item.select.hide());
  submitButton.hide();
  backHomeButton.hide();
  newEntryButton.hide();
}

function drawVirtualKeyboard() {
  let startX = (width - (keyboardKeys[0].length * (keySize + keySpacing) - keySpacing)) / 2;
  
  // Draw letter keys
  for (let row = 0; row < keyboardKeys.length; row++) {
    let rowWidth = keyboardKeys[row].length * (keySize + keySpacing) - keySpacing;
    let rowStartX = (width - rowWidth) / 2;
    
    for (let col = 0; col < keyboardKeys[row].length; col++) {
      let x = rowStartX + col * (keySize + keySpacing);
      let y = keyboardStartY + row * (keySize + keySpacing);
      
      drawKey(keyboardKeys[row][col], x, y, keySize, keySize);
    }
  }
  
  // Draw special keys (bottom row)
  let specialY = keyboardStartY + keyboardKeys.length * (keySize + keySpacing) + 20;
  
  // Update special key positions
  specialKeys[0].x = width/2 - 100; // SPACE centered
  specialKeys[0].y = specialY;
  
  specialKeys[1].x = width/2 - 250; // Backspace left
  specialKeys[1].y = specialY;
  
  specialKeys[2].x = width/2 + 120; // ENTER right  
  specialKeys[2].y = specialY;
  
  // Draw special keys
  specialKeys.forEach(key => {
    drawKey(key.key, key.x, key.y, key.w, key.h);
  });
}

function drawKey(letter, x, y, w, h) {
  // Key background
  if (isMouseOverKey(x, y, w, h)) {
    fill(180, 200, 255); // Hover color
  } else {
    fill(240);
  }
  
  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, 8);
  
  // Key text
  fill(0);
  noStroke();
  textAlign(CENTER);
  textSize(letter.length > 1 ? 16 : 24); // Smaller text for special keys
  text(letter, x + w/2, y + h/2 + 8);
}

function isMouseOverKey(x, y, w, h) {
  return mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h;
}

function mousePressed() {
  if (currentPage !== 'keyboard') return;
  
  // Check back button
  if (mouseX >= 50 && mouseX <= 150 && mouseY >= 150 && mouseY <= 190) {
    showHomePage();
    return;
  }
  
  // Check letter keys
  for (let row = 0; row < keyboardKeys.length; row++) {
    let rowWidth = keyboardKeys[row].length * (keySize + keySpacing) - keySpacing;
    let rowStartX = (width - rowWidth) / 2;
    
    for (let col = 0; col < keyboardKeys[row].length; col++) {
      let x = rowStartX + col * (keySize + keySpacing);
      let y = keyboardStartY + row * (keySize + keySpacing);
      
      if (isMouseOverKey(x, y, keySize, keySize)) {
        addLetter(keyboardKeys[row][col]);
        return;
      }
    }
  }
  
  // Check special keys
  specialKeys.forEach(key => {
    if (isMouseOverKey(key.x, key.y, key.w, key.h)) {
      handleSpecialKey(key.key);
    }
  });
}

function addLetter(letter) {
  if (playerName.length < maxNameLength) {
    playerName += letter;
  }
}

function handleSpecialKey(key) {
  switch(key) {
    case 'SPACE':
      if (playerName.length < maxNameLength && playerName.length > 0) {
        playerName += ' ';
      }
      break;
      
    case '←': // Backspace
      if (playerName.length > 0) {
        playerName = playerName.slice(0, -1);
      }
      break;
      
    case 'ENTER':
      if (playerName.trim().length > 0) {
        // Set the name in the original input field
        let nameField = inputs.find(input => input.id === 'name');
        if (nameField) {
          nameField.input.value(playerName.trim());
        }
        showFormPage(); // Go to dropdown form
      }
      break;
  }
}




function drawThankYouPage() {

  newEntryButton.hide();
  backHomeButton.hide();
  submitButton.hide();
  inputs.forEach(item => item.input.hide());
  dropdowns.forEach(item => item.select.hide());

  // Display thank you message
  textSize(40);
  textAlign(CENTER);
  fill(0, 150, 0);
  text('Thank you for your contribution :)', width/2, height/2 - 50);
  
  textSize(20);
  fill(0);
  text('Your submission has been recorded.', width/2, height/2);
  // text('Returning to home in ' + Math.ceil((5000 - thankYouTimer) / 1000) + ' seconds...', width/2, height/2 + 50);

  // // Handle timer
  thankYouTimer += 16.67; // Approximately 60 FPS (1000ms/60fps = 16.67ms)
  
  if (thankYouTimer >= 2000) { // 2 seconds
    thankYouTimer = 0;
    showHomePage();
  }
}


function calculateTotalPrice() {
  let sum = 0;
  dropdowns.forEach(item => {
    let selectedLabel = item.select.value();
    let match = item.options.find(opt => opt.label === selectedLabel);
    if (match) {
      sum += match.value;
    }
  });
  return sum;
}//function calculateTotalPrice end


function resetForm(){ //clean form after submit

  inputs.forEach(item => {
    item.input.value('');
  });

  dropdowns.forEach(item => {
    item.select.selected('Select');
  });

  validationErrors.name = false;
  validationErrors.rating = false;

}// resetform end


function handleSubmit(){

  validationErrors.name = false;
  validationErrors.rating = false;

  let nameField = inputs.find(input => input.id === 'name');
  let name = nameField ? nameField.input.value().trim() : '';

  let ratingDropdown = dropdowns.find(d => d.datapt === 'Rate the show');
  let rating = ratingDropdown ? ratingDropdown.select.value() : '';
  
  let hasErrors = false;
  
  if (name === ''){
    validationErrors.name = true;
    hasErrors = true;
  }

  if (rating === 'Select'){
    validationErrors.rating = true;
    hasErrors = true;
  }

  if (hasErrors){
    // alert('Please provide your name and rate the show before SUBMITTING :)');
    return;
  }

  let total = calculateTotalPrice();
  overallTotal += total *0.75;

  let dateStr = `${nf(d, 2)}/${nf(m, 2)}/${y}`;
  let timeStr = `${nf(h, 2)}:${nf(min, 2)}`;

  visitorList.push({
    name: name.substring(0, 28),
    date: dateStr,
    time: timeStr,
    total: total
  });

  resetForm();
  
  currentPage = 'thankyou';
  thankYouTimer = 0;
 
 

}//function handleSubmit end
