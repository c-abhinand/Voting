// ---------------- CONFIG ----------------

// Max rows to show (like physical ballot unit)
const MAX_ROWS = 10;

// Example candidates – change as needed
const candidates = [
  {
    slno: 1,
    name_ml: "എ ടി കുഞ്ഞമ്മദ്",
    name_en: "A T Kunjammed",
    party: "CPIM",
    symbol: "assets/randila.png",
    photo: "assets/candidate.JPG", // NEW: candidate image
  },
  {
    slno: 2,
   
  },
  {
    slno: 3,
    
  },
  {
    slno: 4,
    
  },
];

// ---------------- STATE ----------------

let hasVoted = false;
let selectedCandidate = null;

// ---------------- DOM ----------------

const rowsContainer = document.getElementById("evmRowsContainer");
const statusSelected = document.getElementById("statusSelected");
const statusVote = document.getElementById("statusVote");
const toast = document.getElementById("toast");
const beepSound = document.getElementById("beepSound");

// NEW: VVPAT DOM references
const vvpatOverlay = document.getElementById("vvpatOverlay");
const vvpatNameMl = document.getElementById("vvpatNameMl");
const vvpatNameEn = document.getElementById("vvpatNameEn");
const vvpatParty = document.getElementById("vvpatParty");
const vvpatSymbol = document.getElementById("vvpatSymbol");
const vvpatPhoto = document.getElementById("vvpatPhoto");
const vvpatOkBtn = document.getElementById("vvpatOkBtn");

// ---------------- INIT ----------------

function init() {
  renderRows();
  updateStatus();

  // NEW: OK button on VVPAT resets machine
  if (vvpatOkBtn) {
    vvpatOkBtn.addEventListener("click", resetMachineForNextVoter);
  }
}

function renderRows() {
  rowsContainer.innerHTML = "";

  // Build rows from 1..MAX_ROWS+1
  for (let position = 1; position <= MAX_ROWS + 1; position++) {
    const row = document.createElement("div");
    row.className = "evm-row";
    row.dataset.position = position;

    const slCell = document.createElement("div");
    slCell.className = "evm-cell evm-cell--slno";
    slCell.textContent = position;

    const candidateCell = document.createElement("div");
    candidateCell.className = "evm-cell evm-cell--candidate";

    const symbolCell = document.createElement("div");
    symbolCell.className = "evm-cell evm-cell--symbol";

    const ledCell = document.createElement("div");
    ledCell.className = "evm-cell evm-cell--led";

    const buttonCell = document.createElement("div");
    buttonCell.className = "evm-cell evm-cell--button";

    // Find candidate whose slno equals current position
    const candidate = candidates.find((c) => c.slno === position);

    if (candidate) {
      // Candidate text
      const wrapper = document.createElement("div");
      const ml = document.createElement("div");
      ml.className = "candidate-name-ml";
      ml.textContent = candidate.name_ml;

      const en = document.createElement("div");
      en.className = "candidate-name-en";
      en.textContent = candidate.name_en;

      const party = document.createElement("div");
      party.className = "candidate-party";
      party.textContent = candidate.party;

      wrapper.appendChild(ml);
      wrapper.appendChild(en);
      wrapper.appendChild(party);
      candidateCell.appendChild(wrapper);

      // Symbol
      const symBox = document.createElement("div");
      symBox.className = "symbol-box";

      if (candidate.symbol) {
        const img = document.createElement("img");
        img.src = candidate.symbol;
        img.alt = "Party Symbol";
        symBox.appendChild(img);
      } else {
        symBox.textContent = "—";
      }
      symbolCell.appendChild(symBox);

      // LED
      const led = document.createElement("div");
      led.className = "led-dot led-dot--red";
      ledCell.appendChild(led);

      // Button
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vote-button";
      btn.addEventListener("click", () =>
        handleVoteClick(candidate, row, led, btn)
      );
      buttonCell.appendChild(btn);
    } else {
      // Empty row (no candidate)
      candidateCell.textContent = "";
      symbolCell.innerHTML = "";

      const led = document.createElement("div");
      led.className = "led-dot led-dot--off";
      ledCell.appendChild(led);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vote-button vote-button--disabled";
      btn.disabled = true;
      buttonCell.appendChild(btn);
    }

    row.appendChild(slCell);
    row.appendChild(candidateCell);
    row.appendChild(symbolCell);
    row.appendChild(ledCell);
    row.appendChild(buttonCell);

    rowsContainer.appendChild(row);
  }
}

function updateStatus() {
  if (selectedCandidate) {
    statusSelected.textContent = selectedCandidate.name_en;
  } else {
    statusSelected.textContent = "None";
  }

  statusVote.textContent = hasVoted ? "Vote Cast" : "Not Cast";
}

// ---------------- HANDLERS ----------------

function handleVoteClick(candidate, rowEl, ledEl, btnEl) {
  if (hasVoted) return;

  // Clear previous selection
  document.querySelectorAll(".evm-row").forEach((r) => {
    r.classList.remove("evm-row--selected");
  });

  // Reset all red LEDs
  document.querySelectorAll(".led-dot").forEach((l) => {
    if (!l.classList.contains("led-dot--off")) {
      l.classList.remove("led-dot--green");
      l.classList.add("led-dot--red");
    }
  });

  // Highlight current row and LED
  rowEl.classList.add("evm-row--selected");
  ledEl.classList.remove("led-dot--red");
  ledEl.classList.add("led-dot--green");

  // Play beep sound
  if (beepSound) {
    beepSound.currentTime = 0;
    beepSound.play().catch(() => {});
  }

  selectedCandidate = candidate;
  hasVoted = true;
  updateStatus();

  // Lock all buttons
  document.querySelectorAll(".vote-button").forEach((b) => {
    b.classList.add("vote-button--disabled");
    b.disabled = true;
  });

  showToast();
  showVvpat(candidate); // NEW: open VVPAT page
}

function showToast() {
  toast.classList.add("toast--show");
  setTimeout(() => {
    toast.classList.remove("toast--show");
  }, 1500);
}

// NEW: show VVPAT overlay with candidate details
function showVvpat(candidate) {
  if (!vvpatOverlay) return;

  vvpatNameMl.textContent = candidate.name_ml || "";
  vvpatNameEn.textContent = candidate.name_en || "";
  vvpatParty.textContent = candidate.party || "";

  if (candidate.symbol) {
    vvpatSymbol.src = candidate.symbol;
    vvpatSymbol.style.display = "block";
  } else {
    vvpatSymbol.style.display = "none";
  }

  if (candidate.photo) {
    vvpatPhoto.src = candidate.photo;
  } else {
    vvpatPhoto.src = "";
  }

  vvpatOverlay.classList.remove("hidden");
}

// NEW: reset everything for the next voter
function resetMachineForNextVoter() {
  hasVoted = false;
  selectedCandidate = null;

  // Hide VVPAT page
  if (vvpatOverlay) {
    vvpatOverlay.classList.add("hidden");
  }

  // Re-render rows & status
  renderRows();
  updateStatus();
}

// ---------------- START ----------------
init();
