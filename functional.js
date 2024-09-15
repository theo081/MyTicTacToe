var displayed = false;

// Function to fetch the name from the URL and set it in the user span
function setUserFromURL() {
  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  const name = decodeURIComponent(getQueryParam("name")) || "Player";
  document.getElementById("user").textContent = name;

  Player1.set(name);
}

// Function to handle "Create AI" button click
function createAI() {
  const aiName = prompt("Enter AI name:");
  if (aiName && aiName!="-") {
    document.getElementById("ai").textContent = aiName;
    document.getElementById("exp").textContent = "None";
    
    Player2.set(aiName);
  }
}

// Function to handle "Delete AI" button click
function deleteAI() {
  document.getElementById("ai").textContent = "-";
  document.getElementById("exp").textContent = "-";
  
  Player2.set("-");
}

// Function to handle "Clear Data" button click
function loadAI() {
  const loadInput = document.createElement("input");
  loadInput.type = "file";
  loadInput.style.display = "none";
  loadInput.accept = ".myttt";
  document.body.appendChild(loadInput);

  loadInput.addEventListener("change", () => {
    const file = loadInput.files[0];
    if (file && file.name.endsWith(".myttt")) {
      Player2.emulate(file);
      document.getElementById("ai").textContent = Player2.name;
      setTimeout(()=>qualify(),100);
      setTimeout(()=>Player2.createCharts(),100);
    } else {
      alert("Invalid file type. Please upload a .myttt file.");
    }
  });

  loadInput.click();
}

// Function to handle "Transfer Data" button click
function transferData() {
  if (Player2.available()) {
    Player2.transfer();
  } else {
    alert("Please create an AI first.");
  }
}

// Function to handle "Emulate Data" button click
function emulateData() {
  if (!Player2.available()) {
    alert("Please create an AI first.");
    return;
  }

  const emulatorInput = document.createElement("input");
  emulatorInput.type = "file";
  emulatorInput.style.display = "none";
  emulatorInput.accept = ".myttt";
  document.body.appendChild(emulatorInput);

  emulatorInput.addEventListener("change", async () => {
    const file = emulatorInput.files[0];
    if (file && file.name.endsWith(".myttt")) {
      if (Player2.available()) {
        Player3.emulate(file);
        Player3.select(null);
        autoplay(Player2,Player3,100,10,"emulate");
      } else {
        alert("Please create an AI first.");
      }
    } else {
      alert("Invalid file type. Please upload a .myttt file.");
    }
  });

  emulatorInput.click();
}

// Function to handle "Challenge" button click
function challenge() {
  if (!Player2.available()) {
    alert("Please create an AI first.");
    return;
  }
  
  const challengeInput = document.createElement("input");
  challengeInput.type = "file";
  challengeInput.style.display = "none";
  challengeInput.accept = ".myttt";
  document.body.appendChild(challengeInput);

  challengeInput.addEventListener("change",async () => {
    const file = challengeInput.files[0];
    if (file && file.name.endsWith(".myttt")) {
      if (Player2.available()) {

        Player3.emulate(file);
        Player3.select(null);
        autoplay(Player2,Player3,1000,1,"challenge");

      } else {
        alert("Please create an AI first.");
      }
    } else {
      alert("Invalid file type. Please upload a .myttt file.");
    }
  });

  challengeInput.click();
}

// Function to handle "Display Stats" button click
function backPage() {
  window.location.href = `index.html`;
}

// Add event listeners for buttons
document.addEventListener("DOMContentLoaded", () => {
  setUserFromURL();
});
