let turn = false;
let second = false;
let winner = null;

let games = null;
let moves = null;
let O_knowledge = null;
let X_knowledge = null;

class Player {
  constructor(name) {
    this.name = name;
    this.avatar = null;
  }
  getName() {
    return this.name;
  }
  getAvatar() {
    return this.avatar;
  }
  select(symbol) {
    this.avatar = symbol;
  }
}

class AI extends Player {
  constructor(name) {
    super(name);
    this.currentXIndices = [];
    this.currentOIndices = [];
    this.availableCells = [];
    this.ai = [];
    this.failedCounters = [];
    this.failedInitiations = [];
    this.possibleMoves = [];
    this.phase = 0;
    this.charts = [];
  }

  available() {
    return this.name !== "-";
  }

  calculateExpGained() {
    return this.ai.map((game, index) => {
      return (
        index +
        1 +
        this.possibleMoves.length * 3 +
        this.failedCounters.length * 2 +
        this.failedCounters.length * 2
      );
    });
  }

  calculateWinRate() {
    const winRate = [];
    let totalWins = 0;
    for (let i = 0; i < this.ai.length; i++) {
      if (this.ai[i].winner === this.name) {
        totalWins++;
      }
      winRate.push(totalWins);
    }
    return winRate;
  }
  calculateLostRate() {
    const lostRate = [];
    let totalLosses = 0;
    for (let i = 0; i < this.ai.length; i++) {
      if (this.ai[i].winner !== this.name && this.ai[i].winner !== "Draw") {
        totalLosses++;
      }
      lostRate.push(totalLosses);
    }
    return lostRate;
  }

  calculateDrawRate() {
    const drawRate = [];
    let totalDraws = 0;
    for (let i = 0; i < this.ai.length; i++) {
      if (this.ai[i].winner === "Draw") {
        totalDraws++;
      }
      drawRate.push(totalDraws);
    }
    return drawRate;
  }

  calculateSuperChartData() {
    const experienceGained = this.calculateExpGained();
    const winRate = this.calculateWinRate();
    const lostRate = this.calculateLostRate();
    const drawRate = this.calculateDrawRate();

    return [
      {
        label: "Win Rate",
        data: winRate,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Learning Rate",
        data: experienceGained,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
      {
        label: "Lost Rate",
        data: lostRate,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "Draw Rate",
        data: drawRate,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ];
  }

  renderChart(data, labels, elementId, label, summary = false) {
    const ctx = document.querySelector(`#${elementId}`).getContext("2d");

    // Check if there's an existing chart instance and destroy it
    if (this.charts[elementId]) {
      this.charts[elementId].destroy();
    }

    if (summary) {
      const newChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: data.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.borderColor || "rgba(75, 192, 192, 1)",
            backgroundColor:
              dataset.backgroundColor || "rgba(75, 192, 192, 0.2)",
            fill: false,
          })),
        },
        options: {
          scales: {
            x: {
              title: { display: true, text: "Number of Games" },
            },
            y: {
              title: { display: true, text: "Value" },
              beginAtZero: true,
            },
          },
        },
      });
      // Store the new chart instance in the charts array
      this.charts[elementId] = newChart;
    } else {
      const newChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: label,
              data: data,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              title: { display: true, text: "Number of Games" },
            },
            y: {
              title: { display: true, text: "Value" },
              beginAtZero: true,
            },
          },
        },
      });
      // Store the new chart instance in the charts array
      this.charts[elementId] = newChart;
    }
  }
  createCharts() {
    const gamesCount = this.ai.length;
    const labels = Array.from({ length: gamesCount }, (_, i) => i + 1);

    // Super Chart (1st chart)
    const superChartData = this.calculateSuperChartData();
    //console.log(superChartData);
    this.renderChart(superChartData, labels, "chart0", "Analysis", true);

    // Experience Gained Chart
    const experienceGained = this.calculateExpGained();
    //console.log(experienceGained);
    this.renderChart(experienceGained, labels, "chart1", "Learning Rate");

    // Win Rate Chart
    const winRate = this.calculateWinRate();
    //console.log(winRate);
    this.renderChart(winRate, labels, "chart2", "Win Rate");

    // Lost Rate Chart
    const lostRate = this.calculateLostRate();
    //console.log(lostRate);
    this.renderChart(lostRate, labels, "chart3", "Lost Rate");

    // Draw Rate Chart
    const drawRate = this.calculateDrawRate();
    //console.log(drawRate);
    this.renderChart(drawRate, labels, "chart4", "Draw Rate");
  }

  set(name) {
    this.name = name;
    this.avatar = null;
    this.cleanse();
  }

  cleanse() {
    this.currentXIndices = [];
    this.currentOIndices = [];
    this.availableCells = [];
    this.ai = [];
    this.failedCounters = [];
    this.failedInitiations = [];
    this.possibleMoves = [];
    this.phase = 0;
    Player2.createCharts();
  }

  assess() {
    if (this.ai.length <= 0) {
      return "None";
    } else if (this.ai.length <= 10) {
      return "Low";
    } else if (this.ai.length <= 25) {
      return "Beginner";
    } else if (this.ai.length < 50) {
      return "Junior";
    } else if (this.ai.length < 100) {
      return "Mid";
    } else if (this.ai.length < 200) {
      return "Strong";
    } else if (this.ai.length < 300) {
      return "High";
    } else {
      return "Senior";
    }
  }

  transfer() {
    const games = this.ai;
    const moves = this.possibleMoves;
    const X_knowledge = this.failedCounters;
    const O_knowledge = this.failedInitiations;

    // Create an object with the necessary data
    const data = {
      games,
      moves,
      X_knowledge,
      O_knowledge,
    };

     // Convert the object to JSON
     const jsonString = JSON.stringify(data);

     // Encode JSON string to Base64
     const base64String = btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode('0x' + p1)));
 
     // Optionally, you can add further obfuscation
     const obfuscatedString = base64String.split("").reverse().join("");
 
     // Create a Blob with the obfuscated data
     const blob = new Blob([obfuscatedString], { type: "text/plain" });
 
     // Create a URL for the Blob
     const url = URL.createObjectURL(blob);

    // Create a link to download the file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${this.name}.myttt`;
    a.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  emulate(file) {
    this.set(file.name.split(".myttt")[0]);

    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        try {
          const obfuscatedString = event.target.result;

          // Reverse the obfuscation applied in the encoding function
          const encodedString = obfuscatedString.split("").reverse().join("");

          // Decode the Base64 string
          const utf8string = atob(encodedString);

           // Decode UTF-8 to JSON
          const jsonString = decodeURIComponent(escape(utf8string));

          // Parse the JSON string
          const data = JSON.parse(jsonString);

          // Append new data to existing properties
          this.ai = [
            ...(this.ai || []),
            ...(data.games || [])
          ];
          this.possibleMoves = [
            ...(this.possibleMoves || []),
            ...(data.moves || []),
          ];
          this.failedCounters = [
            ...(this.failedCounters || []),
            ...(data.X_knowledge || []),
          ];
          this.failedInitiations = [
            ...(this.failedInitiations || []),
            ...(data.O_knowledge || []),
          ];

          //console.log("Data successfully loaded and parsed.");
        } catch (error) {
          console.error("Error processing file:", error);
        }
      }.bind(this); // Bind 'this' to ensure it refers to the AI object

      reader.readAsText(file);
    } else {
      console.warn("No file provided.");
    }
  }

  prep() {
    this.ai.push({
      steps: [],
      winner: null,
    });
  }
  refresh() {
    this.learn();
    this.phase = 0;
    this.currentXIndices = [];
    this.currentOIndices = [];
    this.prep();
  }

  play() {
    if (this.avatar === null) return;

    const cells = Array.from(document.querySelectorAll(".grid"));
    this.availableCells = cells
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => !cell.innerText)
      .map(({ index }) => index);

    if (this.availableCells.length === 0) return;

    this.analyse();

    const move = this.blocker() !== null ? this.blocker() : this.striker();

    if (move !== null) {
      cells[move].innerText = this.avatar;
    } else {
      const randomCell =
        this.availableCells[
          Math.floor(Math.random() * this.availableCells.length)
        ];
      randomCell.innerText = this.avatar;
    }

    if (!check()) {
      turn = true;
    }

    this.record();
    this.phase++;
  }

  analyse() {
    if (this.ai.length === 0) return null;

    const cells = Array.from(document.querySelectorAll(".grid"));

    cells.forEach((cell, index) => {
      if (
        cell.innerText === this.avatar &&
        !this.currentXIndices.includes(index)
      ) {
        this.currentXIndices.push(index);
      }
    });

    cells.forEach((cell, index) => {
      if (
        cell.innerText !== "" &&
        cell.innerText !== this.avatar &&
        !this.currentOIndices.includes(index)
      ) {
        this.currentOIndices.push(index);
      }
    });
  }

  learn() {
    if (this.ai.length === 0) return;

    const memorize = (cell, index) => {
      if (this.avatar === "X") {
        if (
          cell !== null &&
          cell !== this.avatar &&
          !dominant_step.includes(index)
        ) {
          dominant_step.push(index);
        }

        if (cell === this.avatar && !failed_counter.includes(index)) {
          failed_counter.push(index);
        }
      } else if (this.avatar === "O") {
        if (
          cell !== null &&
          cell !== this.avatar &&
          !dominant_counter.includes(index)
        ) {
          dominant_counter.push(index);
        }

        if (cell === this.avatar && !failed_initiation.includes(index)) {
          failed_initiation.push(index);
        }
      }
    };

    const allocate = () => {
      if (this.avatar === "X") {
        this.failedCounters.push({
          initiation: dominant_step,
          counter: failed_counter,
        });
      } else if (this.avatar === "O") {
        this.failedInitiations.push({
          initiation: failed_initiation,
          counter: dominant_counter,
        });
      }
    };

    let game = this.ai[this.ai.length - 1];
    let set = [];

    let dominant_step = [];
    let failed_counter = [];

    let failed_initiation = [];
    let dominant_counter = [];

    if (game.winner !== this.name) {
      // Collect all 'O' moves from games where Player won
      game.steps.forEach((step) => {
        step.forEach((cell, index) => {
          if (cell !== null && cell !== this.avatar && !set.includes(index)) {
            set.push(index);
          }
          memorize(cell, index);
        });
      });
      allocate();
    } else if (game.winner === this.name) {
      // Collect all 'X' moves from games where AI won
      game.steps.forEach((step) => {
        step.forEach((cell, index) => {
          if (cell === this.avatar && !set.includes(index)) {
            set.push(index);
          }
        });
      });
    }
    this.possibleMoves.push(set);

    //console.log(this.avatar,this.ai);

    //console.log("FI:", this.failedInitiations);

    this.possibleMoves = this.possibleMoves
      .filter((set) => set.length > 0)
      .map((set) => ({ set, length: set.length }))
      .sort((a, b) => a.length - b.length)
      .map(({ set }) => set);

    //console.log("Possible Moves: ", this.possibleMoves);
  }

  blocker() {
    // Check if any of the player's winning move sets can be blocked
    let blockingMove = null;

    for (const moveSet of this.possibleMoves) {
      const MovesDone = moveSet.filter((index) =>
        this.currentOIndices.includes(index)
      );
      //console.log("O. MD: ", MovesDone);

      const remainingMoves = moveSet.filter(
        (index) => !this.currentOIndices.includes(index)
      );
      //console.log("O. RM: ", remainingMoves);

      const availableRemainingMoves = remainingMoves.filter((index) =>
        this.availableCells.includes(index)
      );
      //console.log("O. ARM: ", availableRemainingMoves);

      if (availableRemainingMoves.length === 1) {
        const fullSet = MovesDone.concat(availableRemainingMoves[0]);
        const equalsCheck = (a, b) => {
          return JSON.stringify(a) === JSON.stringify(b);
        };

        if (equalsCheck(fullSet.sort(), moveSet.sort())) {
          blockingMove = availableRemainingMoves[0];
          //console.log(this.avatar, " block!!!");
          //console.log(blockingMove);
          //console.log("O. block: ", blockingMove);
        }
      }
    }

    return this.neglect(blockingMove);
  }

  striker() {
    let bestMove = null;
    let maxOccupiedMoves = -1;

    // Find the best move based on the feasibility of occupying most moves
    for (const moveSet of this.possibleMoves) {
      const remainingMoves = moveSet.filter(
        (index) => !this.currentXIndices.includes(index)
      );
      //console.log("RM: ", remainingMoves);

      const availableRemainingMoves = remainingMoves.filter((index) =>
        this.availableCells.includes(index)
      );
      //console.log("ARM: ", availableRemainingMoves);

      const occupiedMovesCount = moveSet.filter(
        (index) => !this.availableCells.includes(index)
      ).length;
      //console.log("OMC: ", occupiedMovesCount);

      if (
        availableRemainingMoves.length > 0 &&
        occupiedMovesCount > maxOccupiedMoves
      ) {
        maxOccupiedMoves = occupiedMovesCount;
        bestMove = availableRemainingMoves[0];
      }
    }

    if (bestMove === null) {
      // If no suitable move found based on majority occupation, fallback to random move
      if (this.availableCells.length > 0) {
        bestMove =
          this.availableCells[
            Math.floor(Math.random() * this.availableCells.length)
          ];
      }
    }

    return this.avatar === "X"
      ? this.override(bestMove)
      : this.support(bestMove);
  }

  support(bestMove) {
    let best_move = bestMove;

    // Check if the current best_move is in the failed_initiations
    let moveValid = !this.failedInitiations.some(
      ({ initiation, counter }) =>
        initiation[this.phase] === bestMove &&
        this.availableCells.includes(counter[this.phase])
    );

    if (!moveValid) {
      // Find a valid alternative move
      let alternativeMove = null;

      for (let i = 0; i < 9; i++) {
        if (
          !this.currentOIndices.includes(i) &&
          !this.currentXIndices.includes(i) &&
          !this.failedInitiations.some(
            ({ initiation, counter }) =>
              initiation[this.phase] === i &&
              this.availableCells.includes(counter[this.phase])
          )
        ) {
          alternativeMove = i;
          console.log(this.ai);
          console.log(i);
          break;
        }
      }

      // Update the best_move to an alternative valid move
      if (alternativeMove !== null) {
        best_move = alternativeMove;
      } else {
        // Find a false valid best move from records
        let minCount = Infinity;
        let solutions = [];

        for (let i = 0; i < 9; i++) {
          if (
            !this.currentOIndices.includes(i) &&
            !this.currentXIndices.includes(i)
          ) {
            const count = this.failedInitiations.filter(
              ({ initiation, counter }) =>
                initiation[this.phase] === i &&
                this.availableCells.includes(counter[this.phase])
            ).length;

           


            if (count < minCount) {
              minCount = count;
              solutions = [i];
            } else if (count == minCount) {
              solutions.push(i);
            }

            // Randomly select an index from the solutions array
            if (solutions.length > 0) {
              best_move =
                solutions[Math.floor(Math.random() * solutions.length)];
            }
          }
        }
      }
    }
    return this.neglect(best_move);
  }

  override(bestMove) {
    let best_move = bestMove;

    // Check if the current best_move is in the failed_counters
    let moveValid = !this.failedCounters.some(
      ({ initiation, counter }) =>
        initiation[this.phase] === this.currentOIndices[this.phase] &&
        counter[this.phase] === bestMove
    );

    if (!moveValid) {
      // Find a valid alternative move
      let alternativeMove = null;

      for (let i = 0; i < 9; i++) {
        if (
          !this.currentOIndices.includes(i) &&
          !this.currentXIndices.includes(i) &&
          !this.failedCounters.some(
            ({ initiation, counter }) =>
              initiation[this.phase] === this.currentOIndices[this.phase] &&
              counter[this.phase] === i
          )
        ) {
          alternativeMove = i;
          break;
        }
      }

      // Update the best_move to an alternative valid move
      if (alternativeMove !== null) {
        best_move = alternativeMove;
      } else {
        // Find a false valid best move from records
        let minCount = Infinity;
        let solutions = [];

        for (let i = 0; i < 9; i++) {
          if (
            !this.currentOIndices.includes(i) &&
            !this.currentXIndices.includes(i)
          ) {
            const count = this.failedCounters.filter(
              ({ initiation, counter }) =>
                initiation[this.phase] === this.currentOIndices[this.phase] &&
                counter[this.phase] === i
            ).length;

            if (count < minCount) {
              minCount = count;
              solutions = [i];
            } else if (count == minCount) {
              solutions.push(i);
            }

            // Randomly select an index from the solutions array
            if (solutions.length > 0) {
              best_move =
                solutions[Math.floor(Math.random() * solutions.length)];
            }
          }
        }
      }
    }

    return this.neglect(best_move);
  }

  neglect(blockingMove) {
    let bestMove = blockingMove;

    // Find the best move based on the feasibility of occupying most moves
    for (const moveSet of this.possibleMoves) {
      const totalMovesCount = moveSet.length;
      //console.log("TMC: ", totalMovesCount);

      const remainingMoves = moveSet.filter(
        (index) => !this.currentXIndices.includes(index)
      );
      //console.log("RM: ", remainingMoves);

      const availableRemainingMoves = remainingMoves.filter((index) =>
        this.availableCells.includes(index)
      );
      //console.log("ARM: ", availableRemainingMoves);

      const occupiedMovesCount = moveSet
        .filter((index) => !this.availableCells.includes(index))
        .filter((index) => this.currentXIndices.includes(index)).length;
      //console.log("OMC: ", occupiedMovesCount);

      if (
        availableRemainingMoves.length == 1 &&
        totalMovesCount - occupiedMovesCount == 1
      ) {
        bestMove = availableRemainingMoves[0];
      }
    }
    return bestMove;
  }

  record() {
    const cells = document.querySelectorAll(".grid");
    const steps = Array.from(cells).map((cell) => cell.innerText || null);

    this.ai[this.ai.length - 1].steps.push(steps);
    this.ai[this.ai.length - 1].winner = winner;

    if(winner!==null){
      Player2.createCharts();
    }
  }
}

class Human extends Player {
  constructor(name) {
    super(name);
  }
  set(name) {
    this.name = name;
    this.avatar = null;
    reset();
  }
  play(cell) {
    if (cell.innerText) return true;
    cell.innerText = this.avatar;
    turn = false;
  }
}

async function autoplay(AI, opponent, rate = 100, duration = 100, type = "final") {
  turn = false;

  if (AI.avatar==null || opponent.avatar==null){
    clear();
    AI.select("O");
    opponent.select("X");

    if(type=="challenge" || type=="emulate"){
      alert(`${AI.name} picks ${AI.avatar}\n${opponent.name} picks ${opponent.avatar}`);
    }
  } 

  document.getElementById("start").disabled = true;

  
  await new Promise((resolve) =>
    setTimeout(() => {
      AI.play();
      opponent.record();
      resolve();
    }, rate)
  );

  if (!check()) {
    autoplay(opponent, AI,rate,duration,type);
  } else {
    let remain = duration - 1;
    if(remain>0){
      await new Promise((resolve) =>
        setTimeout(() => {
         clear();
         resolve();
        }, 200)
      );
      autoplay(AI,opponent,rate,remain,type);
      
    }else{
      if(type==="emulate"){
        await new Promise((resolve) =>
          setTimeout(() => {
            alert(`${AI.name} picks ${opponent.avatar}\n${opponent.name} picks ${AI.avatar}`);
           resolve();
          }, 300)
        );
        
        Player3.select(null);
        autoplay(Player3,Player2,rate,10,"final");
      }else if(type==="challenge"){

        await new Promise((resolve) =>
          setTimeout(() => {
            if(winner == Player3.name){
              alert(`${Player3.avatar} ${Player3.name} won!`);
            }else if(winner == Player2.name){
              alert(`${Player2.avatar} ${Player2.name} won!`);
            }else{
              alert(`It's a draw!`)
            }
           
           resolve();
          }, 500)
        );
        await new Promise((resolve) =>
          setTimeout(() => {
           
           clear();
           resolve();
          }, 500)
        );
        
        if(Player2.avatar!=="X"){
          Player3.select("O");
          Player2.select("X");
  
          alert(`${AI.name} picks ${AI.avatar}\n${opponent.name} picks ${opponent.avatar}`);
          
          autoplay(Player3,Player2,rate,1,"challenge");
        }else{
          document.getElementById("start").disabled = false;
        }
       
      }

      else{
        document.getElementById("start").disabled = false;
      }
      
    }
    
  }
}

function clear(){
  winner = null;

  if (Player1 instanceof AI) Player1.refresh();
  if (Player2 instanceof AI) Player2.refresh();
  if (Player3 instanceof AI) Player3.refresh();

  const cells = document.querySelectorAll(".grid");
  cells.forEach((x) => (x.textContent = ""));
  cells.forEach((x) => (x.style.color = "black"));
}

function start() {
  if (!Player2.available()) {
    alert("Please create an AI first.");
    return;
  }
  const button = document.getElementById("start");
  
  clear();
  
  button.disabled = true;

  if (!second) {
    Player1.select("O");
    Player2.select("X");

    turn = true;
    button.disabled = false;
  } else {
    Player2.select("O");
    Player1.select("X");

    setTimeout(() => Player2.play(), 300);
    setTimeout(() => (button.disabled = false), 300);
  }
}

function action(cell) {
  if (!turn) return;

  if(Player1.play(cell)) return;

  if (!check()) {
    if (Player2 instanceof AI) setTimeout(() => Player2.play(), 300);
  }

  if (Player2 instanceof AI) Player2.record();
}

function check() {
  if (Player2.available()) qualify();

  const cells = document.querySelectorAll(".grid");
  const winConditions = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (
      cells[a].innerText &&
      cells[a].innerText === cells[b].innerText &&
      cells[a].innerText === cells[c].innerText
    ) {
      cells[a].style.color = "red";
      cells[b].style.color = "red";
      cells[c].style.color = "red";

      if (cells[a].innerText == Player1.getAvatar()) {
        winner = Player1.getName();
      } else {
        winner = Player2.getName();
      }

      if(Player3.available()){
        if (cells[a].innerText == Player3.getAvatar()) {
          winner = Player3.name;
        } else {
          winner = Player2.getName();
        }
      }

      return true;
    }
  }

  const isDraw = Array.from(cells).every((cell) => cell.innerText);
  if (isDraw) {
    winner = "Draw";

    return true;
  }

  return false;
}

function reset() {
  second = false;
  const checkbox = document.querySelector(".checkbox");

  if (second) {
    checkbox.checked = true;
  } else {
    checkbox.checked = false;
  }
}

function qualify() {
  document.getElementById("exp").textContent = Player2.assess();
}

document.addEventListener("DOMContentLoaded", function () {
  Player2.createCharts();
  const checkbox = document.querySelector(".checkbox");
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      second = true;
    } else {
      second = false;
    }
  });
});

const Player1 = new Human("-");
const Player2 = new AI("-");
const Player3 = new AI("-");
