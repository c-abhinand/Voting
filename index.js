// ---------------- CONFIG ----------------

// Max rows to show (like physical ballot unit)
const MAX_ROWS = 10;

// Example candidates – change as needed
const candidates = [
  {
    slno: 1,
    name_ml: "ഒന്നാം സ്ഥാനാര്‍ത്ഥി",
    name_en: "Onnam Sthanarthi",
    party: "Sample Party A",
    symbol: "/assets/chihnam.png",
  },
  {
    slno: 2,
    name_ml: "രാഹുൽ",
    name_en: "Rahul",
    party: "Sample Party A",
    symbol: "assets/randila.png",
  },
  {
    slno: 3,
    name_ml: "അനീഷ്",
    name_en: "Aneesh",
    party: "Sample Party B",
    symbol: "assets/symbol-hand.png",
  },
  {
    slno: 4,
    name_ml: "ഇന്ദു",
    name_en: "Indu",
    party: "Independent",
    symbol: "assets/symbol-star.png",
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
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmNameMl = document.getElementById("confirmNameMl");
const confirmNameEn = document.getElementById("confirmNameEn");
const confirmOkBtn = document.getElementById("confirmOkBtn");


// ---------------- INIT ----------------

function init() {
  renderRows();
  updateStatus();
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

function resetBallotUnit() {
  hasVoted = false;
  selectedCandidate = null;

  // Clear row highlight
  document.querySelectorAll(".evm-row").forEach((r) => {
    r.classList.remove("evm-row--selected");
  });

  // Reset LEDs: all non-off LEDs back to red
  document.querySelectorAll(".led-dot").forEach((l) => {
    if (!l.classList.contains("led-dot--off")) {
      l.classList.remove("led-dot--green");
      l.classList.add("led-dot--red");
    }
  });

  // Re-enable vote buttons
  // Lock all buttons
  document.querySelectorAll(".vote-button").forEach((b) => {
    b.classList.add("vote-button--disabled");
    b.disabled = true;
  });

  // Show confirmation overlay with candidate name
  if (confirmOverlay && confirmNameMl && confirmNameEn) {
    confirmNameMl.textContent = candidate.name_ml;
    confirmNameEn.textContent = candidate.name_en;
    confirmOverlay.classList.add("confirm-overlay--show");
  }

  showToast();
}

// Attach OK button listener (if element exists)
if (confirmOkBtn) {
  confirmOkBtn.addEventListener("click", () => {
    if (confirmOverlay) {
      confirmOverlay.classList.remove("confirm-overlay--show");
    }
    resetBallotUnit(); // ready for next voter
  });
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
  showVVPAT(candidate); // NEW

}

function showToast() {

  toast.classList.add("toast--show");
  setTimeout(() => {
    toast.classList.remove("toast--show");
  }, 1500);
}



// ---------------- START ----------------
init();




/* ================================
   VVPAT PAGE FUNCTIONS (NEW)
================================ */

function showVVPAT(candidate) {
  const page = document.getElementById("vvpatPage");
  const nameMl = document.getElementById("vvpatNameMl");
  const nameEn = document.getElementById("vvpatNameEn");
  const ward = document.getElementById("vvpatWard");
  const photo = document.getElementById("vvpatPhoto");
  const symbolBig = document.getElementById("vvpatSymbolBig");

  // FILL DETAILS
  nameMl.textContent = candidate.name_ml;
  nameEn.textContent = candidate.name_en;
  ward.textContent = candidate.party + " • Ward 1"; // you can replace ward data later
  photo.src = candidate.photo || "assets/default.jpg"; // fallback image
  symbolBig.src = candidate.symbol;

  // SHOW PAGE
  page.classList.remove("hidden");
}

// CLOSE VVPAT PAGE
document.getElementById("vvpatCloseBtn").addEventListener("click", () => {
  document.getElementById("vvpatPage").classList.add("hidden");
  // If you want restart voting: window.location.reload();
});


