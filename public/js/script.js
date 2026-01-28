// =====================================================
// ELEMENTS
// =====================================================
const brewMethodSelect = document.getElementById("brew-method");
const espressoSection = document.getElementById("espresso-machine-section");
const grinderSelect = document.getElementById("grinder");
const espressoMachineSelect = document.getElementById("espresso-machine");
const userTypeSelect = document.getElementById("user-type");

const MACHINE_CAPABILITIES = {
  "la-marzocco-linea-mini": {
    pressureProfiling: false,
    flowControl: false,
    preInfusion: "mechanical",
    controlType: "fixed"
  },
  "slayer-steam": {
    pressureProfiling: "manual",
    flowControl: true,
    preInfusion: true,
    controlType: "flow-led"
  },
  "synesso-mvp-hydra": {
    pressureProfiling: true,
    flowControl: false,
    preInfusion: true,
    controlType: "pressure-led"
  },
  "decent-de1": {
    pressureProfiling: true,
    flowControl: true,
    preInfusion: true,
    controlType: "programmable"
  }
};

// =====================================================
// PRESSURE PROFILE DEFINITIONS
// =====================================================
const PRESSURE_PROFILES = {
  classic_9bar: {
    label: "Classic 9 Bar",
    requires: { pressureProfiling: false }
  },
  gentle_preinfusion: {
    label: "Gentle Pre-Infusion → 9 Bar",
    requires: { preInfusion: true }
  },
  declining_pressure: {
    label: "Declining Pressure (9 → 6 bar)",
    requires: { pressureProfiling: true }
  },
  slayer_style_flow: {
    label: "Slayer-Style Flow Control",
    requires: { flowControl: true }
  },
  blooming_espresso: {
    label: "Blooming Espresso (Low pressure soak)",
    requires: { pressureProfiling: true, preInfusion: true }
  },
  lever_style_profile: {
    label: "Lever-Style Decline",
    requires: { pressureProfiling: true }
  }
};

// =====================================================
// PRESSURE PROFILE COMPATIBILITY ENGINE
// =====================================================
function evaluatePressureProfile(machineId, profileId) {
  const machine = MACHINE_CAPABILITIES[machineId];
  const profile = PRESSURE_PROFILES[profileId];

  if (!machine || !profile) {
    return { compatible: false, reason: "Unknown machine or profile" };
  }

  const requirements = profile.requires;

  if (requirements.pressureProfiling && machine.pressureProfiling !== true) {
    return {
      compatible: false,
      reason: "Machine does not support programmable pressure profiling"
    };
  }

  if (requirements.flowControl && machine.flowControl !== true) {
    return {
      compatible: false,
      reason: "Machine lacks flow control capability"
    };
  }

  if (requirements.preInfusion && !machine.preInfusion) {
    return {
      compatible: false,
      reason: "Machine does not support pre-infusion"
    };
  }

  if (machine.pressureProfiling === "manual" && requirements.pressureProfiling) {
    return {
      compatible: true,
      warning: "Profile requires manual control during extraction"
    };
  }

  return { compatible: true };
}

// =====================================================
// SHOW / HIDE ESPRESSO MACHINE SECTION
// =====================================================
brewMethodSelect.addEventListener("change", function () {
  espressoSection.style.display = this.value === "espresso" ? "block" : "none";
});

brewMethodSelect.dispatchEvent(new Event("change"));

// =====================================================
// GRINDER & ESPRESSO MACHINE CATALOGS
// =====================================================

const HOME_GRINDERS = [
  "niche-zero",
  "fellow-opus",
  "baratza-sette-270",
  "df64-gen-2",
  "timemore-sculptor-064s",
  "df54",
  "eureka-mignon-specialita",
  "mahlkonig-x64-sd",
  "breville-smart-grinder-pro",
  "baratza-encore-esp",
  "baratza-virtuoso-plus",
  "baratza-vario",
  "oxo-brew-conical-burr",
  "wilfa-svart",
  "sage-breville-dose-control-pro",
  "baratza-encore",
  "cuisinart-dbm-8-supreme-grind",
  "krups-precision-burr",
  "shardor-conical-burr",
  "capresso-infinity",
  "1zpresso-k-ultra",
  "comandante-c40",
  "1zpresso-q-air",
  "timemore-c2",
  "javapresse-manual-burr",
  "hario-skerton-pro",
  "porlex-mini",
  "eureka-single-dose-pro",
  "varia-vs3",
  "hamilton-beach-fresh-grind",
  "aromaster-burr-grinder"
];

const CAFE_GRINDERS = [
  "mazzer-mini",
  "mazzer-super-jolly",
  "mazzer-major",
  "mazzer-robur",
  "mazzer-kony",
  "eureka-atom-65",
  "eureka-atom-75",
  "eureka-atom-pro",
  "mythos-one",
  "mythos-two",
  "ditting-804",
  "ditting-807",
  "ditting-1203",
  "mahlkonig-ek43",
  "mahlkonig-ek43s",
  "mahlkonig-k30",
  "mahlkonig-e65s",
  "mahlkonig-e80s",
  "compak-e10",
  "compak-f8",
  "compak-r120",
  "anfim-scody",
  "anfim-sp-ii",
  "anfim-luna",
  "anfim-pratica",
  "ceado-e37s",
  "ceado-e37z",
  "ceado-e92",
  "ceado-e37sd",
  "victoria-arduino-mythos"
];

const CAFE_ESPRESSO_MACHINES = [
  "la-marzocco-linea-pb",
  "la-marzocco-strada",
  "la-marzocco-gs3",
  "la-marzocco-linea-classic",
  "synesso-mvp-hydra",
  "synesso-es1",
  "slayer-steam",
  "slayer-single-group",
  "victoria-arduino-black-eagle",
  "victoria-arduino-white-eagle",
  "nuova-simonelli-aurelia",
  "nuova-simonelli-appia",
  "sanremo-cafe-racer",
  "sanremo-opera",
  "sanremo-f18",
  "rocket-r9",
  "rocket-r58",
  "kvdw-speedster",
  "kvdw-spirit",
  "wega-polaris",
  "wega-atlas",
  "rancilio-classe-11",
  "rancilio-classe-9",
  "ascaia-baby-t",
  "ascaia-steel-uno",
  "ascaia-steel-duo",
  "la-cimbali-m100",
  "la-cimbali-m39",
  "faema-e71",
  "faema-emblema"
];

// =====================================================
// POPULATE DROPDOWNS
// =====================================================
function populateSelect(selectEl, values) {
  selectEl.innerHTML = `<option value="">-- Choose --</option>`;
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v.replace(/-/g, " ").toUpperCase();
    selectEl.appendChild(opt);
  });
}

// =====================================================
// USER TYPE LOGIC (HOME vs CAFE)
// =====================================================
userTypeSelect.addEventListener("change", function () {
  const isCafe = this.value === "cafe";

  populateSelect(
    grinderSelect,
    isCafe ? CAFE_GRINDERS : HOME_GRINDERS
  );

  populateSelect(
    espressoMachineSelect,
    isCafe ? CAFE_ESPRESSO_MACHINES : []
  );

  if (isCafe) {
    brewMethodSelect.value = "espresso";
    brewMethodSelect.dispatchEvent(new Event("change"));
  }
});

// =====================================================
// SMART BREW MAPPING TABLE
// =====================================================
const brewRecommendations = {
  espresso: { dose: "18-20g", yield: "36-40g", time: "25-30s", grind: "fine" },
  v60: { dose: "15-18g", yield: "250-300ml", time: "2:30-3:30 min", grind: "medium-fine" },
  chemex: { dose: "20-25g", yield: "400-500ml", time: "3:30-4:30 min", grind: "medium-coarse" },
  "french-press": { dose: "30g", yield: "500ml", time: "4-5 min", grind: "coarse" },
  aeropress: { dose: "16g", yield: "250ml", time: "1:30-2:00 min", grind: "medium" },
  "moka-pot": { dose: "15-20g", yield: "150-250ml", time: "3-5 min", grind: "fine" },
  turkish: { dose: "10g", yield: "100ml", time: "2-3 min", grind: "extra-fine" },
  "balance-siphon": { dose: "20g", yield: "300ml", time: "3-4 min", grind: "medium" },
  syphon: { dose: "20g", yield: "300ml", time: "3-4 min", grind: "medium" },
  "cold-brew": { dose: "100g", yield: "1L", time: "12-18 hr", grind: "coarse" }
};

const grinderSettings = {
  "baratza-encore": {
    espresso: 0,
    v60: 18,
    chemex: 20,
    "french-press": 25,
    aeropress: 19,
    "moka-pot": 15,
    turkish: 0,
    "balance-siphon": 20,
    syphon: 20,
    "cold-brew": 30
  },
  "baratza-sette-270": {
    espresso: 4,
    v60: 8,
    chemex: 12,
    "french-press": 16,
    aeropress: 10,
    "moka-pot": 6,
    turkish: 0,
    "balance-siphon": 12,
    syphon: 12,
    "cold-brew": 18
  },
  "mazzer-mini": {
    espresso: 4,
    v60: 12,
    chemex: 16,
    "french-press": 20,
    aeropress: 14,
    "moka-pot": 6,
    turkish: 0,
    "balance-siphon": 16,
    syphon: 16,
    "cold-brew": 25
  },
  "mazzer-super-jolly": {
    espresso: 5,
    v60: 13,
    chemex: 17,
    "french-press": 21,
    aeropress: 15,
    "moka-pot": 7,
    turkish: 0,
    "balance-siphon": 17,
    syphon: 17,
    "cold-brew": 26
  },
  "fellow-ode": {
    espresso: 0,
    v60: 5,
    chemex: 7,
    "french-press": 11,
    aeropress: 6,
    "moka-pot": 4,
    turkish: 0,
    "balance-siphon": 8,
    syphon: 8,
    "cold-brew": 11
  }
};

// =====================================================
// SCA DIAGNOSIS ENGINE
// =====================================================
const scaWeights = {
  aroma: 0.5,
  flavor: 1.5,
  aftertaste: 1.2,
  acidity: 1.3,
  body: 1.0,
  balance: 1.5,
  sweetness: 1.4,
  overall: 1.0
};

const extractionMapping = {
  aroma: "both",
  flavor: "both",
  aftertaste: "both",
  acidity: "under",
  sweetness: "under",
  body: "both",
  balance: "both",
  overall: "both"
};

function normalizeScore(score) {
  return (score - 5) / 5;
}

function diagnoseExtraction(scaFeedback) {
  let underScore = 0;
  let overScore = 0;
  const signals = {};

  for (const key in scaWeights) {
    const raw = parseFloat(scaFeedback[key]);
    if (isNaN(raw)) continue;

    const normalized = normalizeScore(raw);
    const weighted = normalized * scaWeights[key];
    signals[key] = weighted;

    const mapping = extractionMapping[key];
    if (mapping === "under" && weighted < 0) {
      underScore += Math.abs(weighted);
    }
    if (mapping === "over" && weighted > 0) {
      overScore += weighted;
    }
    if (mapping === "both") {
      if (weighted < 0) underScore += Math.abs(weighted);
      if (weighted > 0) overScore += weighted;
    }
  }

  let extractionState = "balanced";
  if (underScore > overScore + 0.2) extractionState = "under";
  if (overScore > underScore + 0.2) extractionState = "over";

  const confidenceValue = Math.abs(underScore - overScore);

  return {
    extractionState,
    confidence: confidenceValue,
    confidenceDisplay: confidenceValue.toFixed(2),
    signals
  };
}

// =====================================================
// NEW: EXTRACTION EXPLANATION GENERATOR
// =====================================================
function generateExtractionExplanation(scaFeedback, extractionDiagnosis) {
  const ratings = [];
  const issues = [];
  
  for (const key in scaFeedback) {
    const val = parseFloat(scaFeedback[key]);
    if (isNaN(val)) continue;
    
    let status = "✓";
    let label = "good";
    
    if (val < 4) {
      status = "✗";
      label = "low";
      issues.push(`${key}: ${val}/10 (${label})`);
    } else if (val > 7) {
      status = "✓";
      label = "excellent";
    } else if (val >= 4 && val < 5.5) {
      status = "~";
      label = "acceptable";
    }
    
    ratings.push(`${status} ${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}/10 (${label})`);
  }
  
  let diagnosisText = "";
  let explanationText = "";
  let whyText = "";
  
  if (extractionDiagnosis.extractionState === "under") {
    diagnosisText = "UNDER-EXTRACTED";
    explanationText = "Coffee didn't spend enough time with water. Not enough flavor compounds dissolved.";
    whyText = `<p><strong>Why this happened:</strong></p>
<ul>
<li>Grind too coarse (water flowed too fast)</li>
<li>OR brew time too short</li>
<li>OR water temperature too low</li>
</ul>`;
  } else if (extractionDiagnosis.extractionState === "over") {
    diagnosisText = "OVER-EXTRACTED";
    explanationText = "Coffee spent too much time with water. Extracted bitter, astringent compounds.";
    whyText = `<p><strong>Why this happened:</strong></p>
<ul>
<li>Grind too fine (water couldn't flow)</li>
<li>OR brew time too long</li>
<li>OR water temperature too high</li>
</ul>`;
  } else {
    diagnosisText = "BALANCED";
    explanationText = "Your extraction is in the sweet spot! Good balance of flavors.";
    whyText = `<p><strong>Keep doing what you're doing:</strong></p>
<ul>
<li>Grind size is appropriate</li>
<li>Brew time is correct</li>
<li>Temperature is suitable</li>
</ul>`;
  }
  
  return `<div class="explanation-card">
<h3>🔍 EXTRACTION ANALYSIS</h3>

<div class="ratings-summary">
<p><strong>Your Ratings Summary:</strong></p>
${ratings.map(r => `<p>${r}</p>`).join('')}
${issues.length > 0 ? `<p style="margin-top:0.5em;"><strong>Key Issues:</strong> ${issues.join(', ')}</p>` : ''}
</div>

<div class="diagnosis-box">
<p><strong>Diagnosis:</strong> <span class="diagnosis-${extractionDiagnosis.extractionState}">${diagnosisText}</span></p>
<p style="font-size:0.95em; margin-top:0.5em;">${explanationText}</p>
</div>

${whyText}

<p style="font-size:0.9em; color:#666; margin-top:1em;">
<strong>Confidence:</strong> ${extractionDiagnosis.confidenceDisplay} (higher = more certain)
</p>
</div>`;
}

// =====================================================
// NEW: RECIPE EXPLANATION GENERATOR
// =====================================================
function generateRecipeExplanation(selections) {
  const brewMethod = selections.brewMethod;
  const grinder = selections.grinder;
  
  const methodExplanations = {
    espresso: "High pressure extraction → requires fine grind for 25-30 second shot",
    v60: "Cone shape → requires medium-fine grind for proper 2:30-3:30 flow rate",
    chemex: "Thick paper filter → needs medium-coarse grind to prevent clogging",
    "french-press": "Full immersion → coarse grind prevents sediment in cup",
    aeropress: "Pressure-assisted → medium grind balances speed and extraction",
    "moka-pot": "Steam pressure → fine grind similar to espresso but slightly coarser",
    turkish: "Unfiltered → extra-fine grind creates traditional thick texture",
    "balance-siphon": "Vacuum brewing → medium grind for clean, tea-like cup",
    syphon: "Vapor pressure → medium grind highlights delicate flavors",
    "cold-brew": "12-18 hour immersion → coarse grind prevents over-extraction"
  };
  
  let explanation = `<div class="explanation-card">
<details open>
<summary>📖 Why This Recipe?</summary>
<div class="explanation-content">
<p><strong>Brew Method:</strong> ${brewMethod.toUpperCase()}</p>
<p>${methodExplanations[brewMethod] || "Standard brewing parameters for this method."}</p>`;
  
  if (grinder && grinderSettings[grinder] && grinderSettings[grinder][brewMethod] !== undefined) {
    explanation += `<p><strong>Your Grinder:</strong> ${grinder.replace(/-/g, ' ').toUpperCase()}</p>
<p>Setting ${grinderSettings[grinder][brewMethod]} is our baseline for this method with your grinder.</p>`;
  }
  
  explanation += `</div>
</details>
</div>`;
  
  return explanation;
}

// =====================================================
// NEW: LEARNING STATUS GENERATOR
// =====================================================
function generateLearningStatus(selections) {
  const key = `${selections.grinder}::${selections.brewMethod}`;
  const model = learningModel[key];
  
  if (!model || model.samples === 0) {
    return `<div class="learning-card">
<h3>🧠 LEARNING STATUS</h3>
<div class="progress-bar">
<div class="progress-fill" style="width: 0%"></div>
</div>
<p><strong>Brews with this setup:</strong> 0</p>
<p style="color:#666; font-size:0.95em;">Start building your personalized model by brewing and rating!</p>
</div>`;
  }
  
  const progressPercent = Math.min((model.samples / MIN_SAMPLES_TO_LEARN) * 100, 100);
  const isLearning = model.samples >= MIN_SAMPLES_TO_LEARN;
  
  let statusText = "";
  if (model.samples < MIN_SAMPLES_TO_LEARN) {
    statusText = `Gathering data (${model.samples}/${MIN_SAMPLES_TO_LEARN} brews needed)`;
  } else {
    statusText = `Active learning (${model.samples} brews recorded)`;
  }
  
  let learningsText = "";
  if (isLearning) {
    const insights = [];
    
    if (Math.abs(model.grindOffset) > 0.5) {
      const direction = model.grindOffset < 0 ? "finer" : "coarser";
      insights.push(`Your grinder runs ${Math.abs(model.grindOffset).toFixed(1)} clicks ${direction} than average`);
    }
    
    if (Math.abs(model.timeOffset) > 2) {
      const direction = model.timeOffset > 0 ? "longer" : "shorter";
      insights.push(`Your setup needs ${Math.abs(model.timeOffset).toFixed(0)}s ${direction} extraction time`);
    }
    
    if (insights.length === 0) {
      insights.push("Your setup aligns closely with standard recommendations");
    }
    
    learningsText = `<div class="learnings-list">
<p><strong>What we've learned about YOUR setup:</strong></p>
<ul>
${insights.map(i => `<li>${i}</li>`).join('')}
</ul>
</div>`;
  }
  
  return `<div class="learning-card">
<h3>🧠 LEARNING STATUS</h3>
<div class="progress-bar">
<div class="progress-fill" style="width: ${progressPercent}%"></div>
</div>
<p><strong>Brews with this setup:</strong> ${model.samples}</p>
<p><strong>Status:</strong> ${statusText}</p>
${learningsText}
</div>`;
}

// =====================================================
// RECIPE ADJUSTMENT ENGINE
// =====================================================
function adjustRecipe(extractionDiagnosis, selections) {
  if (extractionDiagnosis.extractionState === "balanced") {
    return `<h3>Adjustment for Next Brew</h3>
<p>Your extraction appears balanced. No changes recommended.</p>`;
  }

  let grindAdvice = "";
  let timeAdvice = "";

  if (extractionDiagnosis.extractionState === "under") {
    grindAdvice = "Go 1–2 clicks finer.";
    timeAdvice = "Increase brew time slightly (≈ +3 seconds).";
  }

  if (extractionDiagnosis.extractionState === "over") {
    grindAdvice = "Go 1–2 clicks coarser.";
    timeAdvice = "Reduce brew time slightly (≈ −3 seconds).";
  }

  return `<h3>Adjustment for Next Brew</h3>
<p><strong>Diagnosis:</strong> ${extractionDiagnosis.extractionState} extraction</p>
<p><strong>Grind Adjustment:</strong> ${grindAdvice}</p>
<p><strong>Time Adjustment:</strong> ${timeAdvice}</p>
<p><strong>Confidence:</strong> ${extractionDiagnosis.confidenceDisplay}</p>`;
}

// =====================================================
// LEARNING ENGINE
// =====================================================
let brewHistory = [];
let learningModel = {};

const MIN_SAMPLES_TO_LEARN = 3;

function applyLearning(selections, baseGrind, baseTimeSeconds) {
  const key = `${selections.grinder}::${selections.brewMethod}`;
  const learned = learningModel[key];

  if (!learned) {
    return {
      grind: baseGrind,
      time: baseTimeSeconds,
      learningApplied: false,
      reason: "No learning data yet"
    };
  }

  if (learned.samples < MIN_SAMPLES_TO_LEARN) {
    return {
      grind: baseGrind,
      time: baseTimeSeconds,
      learningApplied: false,
      reason: `Learning in progress (${learned.samples}/${MIN_SAMPLES_TO_LEARN})`
    };
  }

  return {
    grind: baseGrind + learned.grindOffset,
    time: baseTimeSeconds + learned.timeOffset,
    learningApplied: true,
    reason: "Learning applied"
  };
}

function normalizeConfidence(confidence) {
  const MAX_CONFIDENCE = 3;
  return Math.min(confidence / MAX_CONFIDENCE, 1);
}

const MAX_GRIND_OFFSET = 4;
const MAX_TIME_OFFSET = 12;

function updateLearningModel(selections, extractionDiagnosis) {
  const key = `${selections.grinder}::${selections.brewMethod}`;

  if (!learningModel[key]) {
    learningModel[key] = {
      grindOffset: 0,
      timeOffset: 0,
      samples: 0
    };
  }

  const model = learningModel[key];

  const learningStrength = normalizeConfidence(extractionDiagnosis.confidence);

  if (learningStrength < 0.15) {
    model.samples += 1;
    return;
  }

  const GRIND_STEP = 0.5;
  const TIME_STEP = 1;

  if (extractionDiagnosis.extractionState === "under") {
    model.grindOffset -= GRIND_STEP * learningStrength;
    model.timeOffset += TIME_STEP * learningStrength;
  }

  if (extractionDiagnosis.extractionState === "over") {
    model.grindOffset += GRIND_STEP * learningStrength;
    model.timeOffset -= TIME_STEP * learningStrength;
  }

  model.grindOffset = Math.max(
    -MAX_GRIND_OFFSET,
    Math.min(MAX_GRIND_OFFSET, model.grindOffset)
  );

  model.timeOffset = Math.max(
    -MAX_TIME_OFFSET,
    Math.min(MAX_TIME_OFFSET, model.timeOffset)
  );

  model.samples += 1;
}

// =====================================================
// PERSISTENCE LAYER
// =====================================================
const STORAGE_KEYS = {
  history: "coffee_brew_history",
  learning: "coffee_learning_model",
  accessLevel: "coffee_access_level",
  privacyConsent: "coffee_privacy_consent",
  dataSharingPreference: "coffee_data_sharing"
};

(function loadPersistedData() {
  const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
  const savedLearning = localStorage.getItem(STORAGE_KEYS.learning);

  if (savedHistory) {
    try {
      brewHistory = JSON.parse(savedHistory);
    } catch (e) {
      console.warn("Failed to load brew history");
    }
  }

  if (savedLearning) {
    try {
      learningModel = JSON.parse(savedLearning);
    } catch (e) {
      console.warn("Failed to load learning model");
    }
  }
})();

function persistLearningData() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(brewHistory));
  localStorage.setItem(STORAGE_KEYS.learning, JSON.stringify(learningModel));
}

// =====================================================
// LEARNING RESET & CONTROL
// =====================================================
function resetLearningFor(selections) {
  const key = `${selections.grinder}::${selections.brewMethod}`;
  if (learningModel[key]) {
    delete learningModel[key];
    persistLearningData();
    console.info(`Learning reset for ${key}`);
  }
}

function resetAllLearning() {
  learningModel = {};
  persistLearningData();
  alert("All learning data has been reset.");
  location.reload();
}

function resetBrewHistory() {
  brewHistory = [];
  persistLearningData();
  alert("Brew history has been reset.");
  location.reload();
}

function resetEverything() {
  brewHistory = [];
  learningModel = {};
  persistLearningData();
  alert("All data has been reset.");
  location.reload();
}

// =====================================================
// LEARNING PORTABILITY
// =====================================================
const EXPORT_VERSION = 1;

function exportLearningData() {
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    brewHistory,
    learningModel
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "coffee-learning-backup.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.info("Learning data exported");
}

function importLearningData(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const parsed = JSON.parse(event.target.result);

      if (
        typeof parsed !== "object" ||
        parsed.version !== EXPORT_VERSION ||
        !Array.isArray(parsed.brewHistory) ||
        typeof parsed.learningModel !== "object"
      ) {
        alert("Invalid or incompatible learning file");
        return;
      }

      brewHistory = parsed.brewHistory;
      learningModel = parsed.learningModel;

      persistLearningData();

      console.info("Learning data imported successfully");
      alert("Learning data imported successfully");
      location.reload();
    } catch (err) {
      console.error("Import failed", err);
      alert("Failed to import learning data");
    }
  };

  reader.readAsText(file);
}


// =====================================================
// BUTTON 1: GET INITIAL RECIPE
// =====================================================
document.getElementById("submit-btn").addEventListener("click", function () {
  const output = document.getElementById("output");

  const selections = {
    userType: document.getElementById("user-type").value,
    brewMethod: document.getElementById("brew-method").value,
    grinder: document.getElementById("grinder").value,
    origin: document.getElementById("origin")?.value || "",
    altitude: document.getElementById("altitude")?.value || "",
    processing: document.getElementById("processing")?.value || "",
    roastLevel: document.getElementById("roast-level")?.value || ""
  };

  if (!selections.brewMethod || !selections.grinder) {
    output.innerHTML = `<p style="color:#b91c1c;">Please select a brew method and grinder first.</p>`;
    return;
  }

  const brewRec = brewRecommendations[selections.brewMethod];
  
  let baseGrindValue = null;
  let baseTimeSeconds = null;

  if (brewRec) {
    const baseTime = brewRec.time;
    if (baseTime.includes("s")) {
      baseTimeSeconds = parseInt(baseTime);
    } else if (baseTime.includes(":")) {
      const parts = baseTime.split(":");
      baseTimeSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
  }

  if (
    selections.grinder &&
    grinderSettings[selections.grinder] &&
    grinderSettings[selections.grinder][selections.brewMethod] !== undefined
  ) {
    baseGrindValue = grinderSettings[selections.grinder][selections.brewMethod];
  }

  let recipeHtml = `<div class="recipe-card">
<h3>Your Initial Recipe</h3>`;
  
  if (brewRec) {
    recipeHtml += `<p><strong>Dose:</strong> ${brewRec.dose}</p>
<p><strong>Yield:</strong> ${brewRec.yield}</p>
<p><strong>Time:</strong> ${brewRec.time}</p>
<p><strong>Grind:</strong> ${brewRec.grind}</p>`;
  }

  if (baseGrindValue !== null) {
    recipeHtml += `<p><strong>Grinder Setting:</strong> ${baseGrindValue}</p>`;
  }

  if (baseGrindValue !== null && baseTimeSeconds !== null) {
    const learnedResult = applyLearning(selections, baseGrindValue, baseTimeSeconds);
    
    if (learnedResult.learningApplied) {
      recipeHtml += `<div class="learned-adjustments">
<h4>🎯 Personalized Adjustments</h4>
<p><strong>Learned Grind:</strong> ${learnedResult.grind.toFixed(1)}</p>
<p><strong>Learned Time:</strong> ${learnedResult.time}s</p>
<p style="font-size:0.9em; color:#15803d;">Based on ${learningModel[`${selections.grinder}::${selections.brewMethod}`].samples} previous brews</p>
</div>`;
    }
  }

  recipeHtml += `</div>`;

  const explanationHtml = generateRecipeExplanation(selections);
  const learningStatusHtml = generateLearningStatus(selections);

  recipeHtml += `<p style="margin-top:1.5em; padding:1em; background:#f0f9ff; border-left:4px solid #0ea5e9; font-style:italic;">
Brew this recipe, then rate it below to help improve future recommendations.</p>`;

  output.innerHTML = recipeHtml + explanationHtml + learningStatusHtml;
});

// =====================================================
// BUTTON 2: SUBMIT FEEDBACK & LEARN
// =====================================================
document.getElementById("feedback-submit-btn").addEventListener("click", function () {
  const output = document.getElementById("output");

  const selections = {
    userType: document.getElementById("user-type").value,
    brewMethod: document.getElementById("brew-method").value,
    grinder: document.getElementById("grinder").value,
    origin: document.getElementById("origin")?.value || "",
    altitude: document.getElementById("altitude")?.value || "",
    processing: document.getElementById("processing")?.value || "",
    roastLevel: document.getElementById("roast-level")?.value || ""
  };

  if (!selections.brewMethod || !selections.grinder) {
    output.innerHTML = `<p style="color:#b91c1c;">Please get an initial recipe first.</p>`;
    return;
  }

  const scaFeedback = {
    aroma: document.getElementById("aroma").value,
    flavor: document.getElementById("flavor").value,
    aftertaste: document.getElementById("aftertaste").value,
    acidity: document.getElementById("acidity").value,
    body: document.getElementById("body").value,
    balance: document.getElementById("balance").value,
    sweetness: document.getElementById("sweetness").value,
    overall: document.getElementById("overall").value
  };

  const hasRatings = Object.values(scaFeedback).some(val => val !== "");

  if (!hasRatings) {
    output.innerHTML = `<p style="color:#b91c1c;">Please rate at least one attribute before submitting.</p>`;
    return;
  }

  const extractionDiagnosis = diagnoseExtraction(scaFeedback);
  const adjustmentAdvice = adjustRecipe(extractionDiagnosis, selections);
  const extractionExplanation = generateExtractionExplanation(scaFeedback, extractionDiagnosis);

  const brewData = {
    selections,
    scaFeedback,
    extractionDiagnosis,
    timestamp: Date.now()
  };

  brewHistory.push(brewData);

  // Collect universal data for research (if consent given)
  const roastDateEl = document.getElementById("roast-date");
  const doseUsedEl = document.getElementById("dose-used");
  const yieldUsedEl = document.getElementById("yield-used");
  const grindSettingEl = document.getElementById("grind-setting");
  const waterTempEl = document.getElementById("water-temp");
  
  const brewEntry = {
    brewMethod: selections.brewMethod,
    extractionDiagnosis: extractionDiagnosis,
    selections: selections,
    roastDate: roastDateEl?.value || null,
    doseUsed: doseUsedEl?.value ? parseFloat(doseUsedEl.value) : null,
    yieldUsed: yieldUsedEl?.value ? parseFloat(yieldUsedEl.value) : null,
    grindSetting: grindSettingEl?.value ? parseFloat(grindSettingEl.value) : null,
    waterTemp: waterTempEl?.value ? parseFloat(waterTempEl.value) : null
  };
  
  collectUniversalData(brewEntry);

  updateLearningModel(selections, extractionDiagnosis);
  persistLearningData();

  let baseGrindValue = null;
  let baseTimeSeconds = null;

  if (brewRecommendations[selections.brewMethod]) {
    const baseTime = brewRecommendations[selections.brewMethod].time;
    if (baseTime.includes("s")) {
      baseTimeSeconds = parseInt(baseTime);
    } else if (baseTime.includes(":")) {
      const parts = baseTime.split(":");
      baseTimeSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
  }

  if (
    selections.grinder &&
    grinderSettings[selections.grinder] &&
    grinderSettings[selections.grinder][selections.brewMethod] !== undefined
  ) {
    baseGrindValue = grinderSettings[selections.grinder][selections.brewMethod];
  }

  let learningHtml = "";
  if (baseGrindValue !== null && baseTimeSeconds !== null) {
    const learnedResult = applyLearning(selections, baseGrindValue, baseTimeSeconds);
    
    const key = `${selections.grinder}::${selections.brewMethod}`;
    const samplesNeeded = learningModel[key] ? MIN_SAMPLES_TO_LEARN - learningModel[key].samples : MIN_SAMPLES_TO_LEARN;

    learningHtml = `<div class="learning-results">
<h3>Personalized Learning Layer</h3>
<p><strong>Status:</strong> ${learnedResult.reason}</p>
<p><strong>Base Grind:</strong> ${baseGrindValue}</p>
<p><strong>Base Time:</strong> ${baseTimeSeconds}s</p>
${
  learnedResult.learningApplied
    ? `<p><strong>Learned Grind:</strong> ${learnedResult.grind.toFixed(1)}</p>
<p><strong>Learned Time:</strong> ${learnedResult.time}s</p>`
    : `<p><em>Learning not yet applied (need ${samplesNeeded} more brews)</em></p>`
}
</div>`;
  }

  const learningStatusHtml = generateLearningStatus(selections);

  output.innerHTML = extractionExplanation + adjustmentAdvice + learningHtml + learningStatusHtml;
  output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});


// =====================================================
// PRESSURE PROFILE UI WIRING (UNCHANGED)
// =====================================================
const pressureProfileSelect = document.getElementById("pressure-profile");
const pressureProfileSection = document.getElementById("pressure-profile-section");
const pressureProfileWarning = document.getElementById("pressure-profile-warning");

function populatePressureProfiles() {
  if (!pressureProfileSelect) return;
  pressureProfileSelect.innerHTML = `<option value="">-- Choose pressure profile --</option>`;

  Object.entries(PRESSURE_PROFILES).forEach(([id, profile]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = profile.label;
    pressureProfileSelect.appendChild(opt);
  });
}

brewMethodSelect.addEventListener("change", function () {
  const isEspresso = this.value === "espresso";
  espressoSection.style.display = isEspresso ? "block" : "none";
  if (pressureProfileSection) pressureProfileSection.style.display = "none";
  if (pressureProfileWarning) pressureProfileWarning.textContent = "";
});

if (espressoMachineSelect) {
  espressoMachineSelect.addEventListener("change", function () {
    if (!this.value) {
      if (pressureProfileSection) pressureProfileSection.style.display = "none";
      if (pressureProfileSelect) pressureProfileSelect.value = "";
      if (pressureProfileWarning) pressureProfileWarning.textContent = "";
      return;
    }
    
    // Ensure espresso section is visible first
    if (espressoSection) {
      espressoSection.style.display = "block";
    }
    
    populatePressureProfiles();
    if (pressureProfileSection) {
      pressureProfileSection.style.display = "block";
    }
    
    // Trigger update for compatibility check
    updatePressureProfileFeedback();
  });
}

function updatePressureProfileFeedback() {
  if (!pressureProfileWarning) return;
  
  const machineId = espressoMachineSelect.value;
  const profileId = pressureProfileSelect.value;

  pressureProfileWarning.textContent = "";
  pressureProfileWarning.style.color = "#444";

  if (!machineId || !profileId) return;

  const result = evaluatePressureProfile(machineId, profileId);

  if (!result.compatible) {
    pressureProfileWarning.textContent = `❌ ${result.reason}`;
    pressureProfileWarning.style.color = "#b91c1c";
    return;
  }

  if (result.warning) {
    pressureProfileWarning.textContent = `⚠️ ${result.warning}`;
    pressureProfileWarning.style.color = "#b45309";
    return;
  }

  pressureProfileWarning.textContent = "✅ Compatible with this machine";
  pressureProfileWarning.style.color = "#15803d";
}

if (pressureProfileSelect) {
  pressureProfileSelect.addEventListener("change", updatePressureProfileFeedback);
}

if (espressoMachineSelect) {
  espressoMachineSelect.addEventListener("change", updatePressureProfileFeedback);
}

// =====================================================
// ADMIN DASHBOARD SYSTEM
// =====================================================
const ADMIN_CODE = "NATethiopians100%"; // Change this to your secret admin code

function validateAdminCode(code) {
  return code && code.trim() === ADMIN_CODE;
}

function activateAdminAccess() {
  localStorage.setItem(STORAGE_KEYS.accessLevel, "admin");
  console.info("Admin access activated");
  showAdminDashboard();
}

function isAdmin() {
  const stored = localStorage.getItem(STORAGE_KEYS.accessLevel);
  return stored === "admin";
}

function handleAdminCodeSubmit(codeInput) {
  const code = codeInput.value.trim();
  if (validateAdminCode(code)) {
    activateAdminAccess();
    updateAccessLevelDisplay();
    alert("Admin access activated!");
    codeInput.value = "";
    return true;
  } else {
    alert("Invalid admin code.");
    return false;
  }
}

function showAdminDashboard() {
  const adminSection = document.getElementById("admin-dashboard-section");
  if (adminSection) {
    adminSection.style.display = "block";
    loadAdminDashboardData();
  }
}

function hideAdminDashboard() {
  const adminSection = document.getElementById("admin-dashboard-section");
  if (adminSection) {
    adminSection.style.display = "none";
  }
}

function loadAdminDashboardData() {
  if (!isAdmin()) {
    hideAdminDashboard();
    return;
  }

  // Load research data queue
  const researchQueue = JSON.parse(localStorage.getItem("coffee_research_queue") || "[]");
  
  // Load brew history
  const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
  const history = savedHistory ? JSON.parse(savedHistory) : [];
  
  // Load learning model
  const savedLearning = localStorage.getItem(STORAGE_KEYS.learning);
  const learning = savedLearning ? JSON.parse(savedLearning) : [];

  // Calculate statistics
  const stats = calculateAdminStats(researchQueue, history, learning);

  // Display data
  displayAdminStats(stats);
  displayResearchData(researchQueue);
  displayBrewHistory(history);
}

function calculateAdminStats(researchQueue, history, learning) {
  const totalBrews = history.length;
  const totalResearchEntries = researchQueue.length;
  const uniqueUsers = new Set(researchQueue.map(entry => entry.weekId)).size;
  
  // Brew method distribution
  const brewMethods = {};
  researchQueue.forEach(entry => {
    brewMethods[entry.brewMethod] = (brewMethods[entry.brewMethod] || 0) + 1;
  });

  // Extraction state distribution
  const extractionStates = {};
  researchQueue.forEach(entry => {
    extractionStates[entry.extractionState] = (extractionStates[entry.extractionState] || 0) + 1;
  });

  // Origin distribution
  const origins = {};
  researchQueue.forEach(entry => {
    origins[entry.origin] = (origins[entry.origin] || 0) + 1;
  });

  // Learning model stats
  const learningKeys = Object.keys(learning);
  const totalLearningModels = learningKeys.length;
  const totalSamples = learningKeys.reduce((sum, key) => sum + (learning[key].samples || 0), 0);

  return {
    totalBrews,
    totalResearchEntries,
    uniqueUsers,
    brewMethods,
    extractionStates,
    origins,
    totalLearningModels,
    totalSamples
  };
}

function displayAdminStats(stats) {
  const statsEl = document.getElementById("admin-stats");
  if (!statsEl) return;

  statsEl.innerHTML = `
    <div class="admin-stat-card">
      <h4>📊 Overview</h4>
      <p><strong>Total Brews Recorded:</strong> ${stats.totalBrews}</p>
      <p><strong>Research Data Entries:</strong> ${stats.totalResearchEntries}</p>
      <p><strong>Unique Week IDs:</strong> ${stats.uniqueUsers}</p>
      <p><strong>Learning Models:</strong> ${stats.totalLearningModels}</p>
      <p><strong>Total Learning Samples:</strong> ${stats.totalSamples}</p>
    </div>

    <div class="admin-stat-card">
      <h4>☕ Brew Methods</h4>
      ${Object.entries(stats.brewMethods)
        .sort((a, b) => b[1] - a[1])
        .map(([method, count]) => `<p>${method}: <strong>${count}</strong></p>`)
        .join('')}
    </div>

    <div class="admin-stat-card">
      <h4>⚖️ Extraction States</h4>
      ${Object.entries(stats.extractionStates)
        .map(([state, count]) => `<p>${state}: <strong>${count}</strong></p>`)
        .join('')}
    </div>

    <div class="admin-stat-card">
      <h4>🌍 Origins</h4>
      ${Object.entries(stats.origins)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([origin, count]) => `<p>${origin}: <strong>${count}</strong></p>`)
        .join('')}
    </div>
  `;
}

function displayResearchData(researchQueue) {
  const dataEl = document.getElementById("admin-research-data");
  if (!dataEl) return;

  if (researchQueue.length === 0) {
    dataEl.innerHTML = "<p>No research data collected yet.</p>";
    return;
  }

  const tableRows = researchQueue.slice(-50).reverse().map(entry => `
    <tr>
      <td>${entry.weekId}</td>
      <td>${entry.brewMethod}</td>
      <td>${entry.extractionState}</td>
      <td>${entry.origin}</td>
      <td>${entry.doseGrams || '-'}</td>
      <td>${entry.yieldGrams || '-'}</td>
      <td>${entry.roastAgeWeeks !== null ? entry.roastAgeWeeks + 'w' : '-'}</td>
      <td>${new Date(entry.timestamp).toLocaleDateString()}</td>
    </tr>
  `).join('');

  dataEl.innerHTML = `
    <p><strong>Showing last 50 entries (${researchQueue.length} total)</strong></p>
    <div style="overflow-x:auto;">
      <table class="admin-data-table">
        <thead>
          <tr>
            <th>Week ID</th>
            <th>Brew Method</th>
            <th>Extraction</th>
            <th>Origin</th>
            <th>Dose (g)</th>
            <th>Yield (g)</th>
            <th>Roast Age</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

function displayBrewHistory(history) {
  const historyEl = document.getElementById("admin-brew-history");
  if (!historyEl) return;

  if (history.length === 0) {
    historyEl.innerHTML = "<p>No brew history recorded yet.</p>";
    return;
  }

  historyEl.innerHTML = `
    <p><strong>Total entries: ${history.length}</strong></p>
    <p>Brew history is stored locally. Use export function to download full data.</p>
  `;
}

function exportAdminData() {
  const researchQueue = JSON.parse(localStorage.getItem("coffee_research_queue") || "[]");
  const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  const learning = JSON.parse(localStorage.getItem(STORAGE_KEYS.learning) || "{}");

  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    researchData: researchQueue,
    brewHistory: history,
    learningModel: learning
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `admin-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert("Admin data exported successfully!");
}

function updateAccessLevelDisplay() {
  const accessLevel = isAdmin() ? "admin" : (localStorage.getItem(STORAGE_KEYS.accessLevel) || "free");
  const displayEl = document.getElementById("access-level-display");
  if (displayEl) {
    displayEl.textContent = `Access Level: ${accessLevel.toUpperCase()}`;
    displayEl.className = `access-level access-${accessLevel}`;
  }
}

function handleFarmerCodeSubmit(codeInput) {
  const code = codeInput.value.trim();
  // Simple validation - you can add the actual farmer code check here
  if (code && code.toUpperCase() === "URENA") {
    localStorage.setItem(STORAGE_KEYS.accessLevel, "farmer");
    updateAccessLevelDisplay();
    alert("Farmer access activated!");
    codeInput.value = "";
    return true;
  } else {
    alert("Invalid farmer code.");
    return false;
  }
}

// =====================================================
// DATA COLLECTION FUNCTIONS
// =====================================================
let universalDataQueue = [];

(function loadDataQueue() {
  const savedDataQueue = localStorage.getItem("coffee_research_queue");
  if (savedDataQueue) {
    try {
      universalDataQueue = JSON.parse(savedDataQueue);
    } catch (e) {
      console.warn("Failed to load research data queue");
    }
  }
})();

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekIdentifier() {
  const now = new Date();
  const year = now.getFullYear();
  const week = getWeekNumber(now);
  return `${year}-W${week.toString().padStart(2, '0')}`;
}

function calculateRoastAge(roastDate) {
  if (!roastDate) return null;
  try {
    const roast = new Date(roastDate);
    const now = new Date();
    const diffTime = Math.abs(now - roast);
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  } catch (e) {
    return null;
  }
}

function anonymizeForResearch(data) {
  return {
    weekId: getWeekIdentifier(),
    brewMethod: data.brewMethod,
    extractionState: data.extractionDiagnosis?.extractionState || "unknown",
    confidence: data.extractionDiagnosis?.confidence || 0,
    origin: data.selections?.origin || "unknown",
    altitude: data.selections?.altitude || "unknown",
    processing: data.selections?.processing || "unknown",
    roastLevel: data.selections?.roastLevel || "unknown",
    doseGrams: data.doseUsed || null,
    yieldGrams: data.yieldUsed || null,
    actualGrindSetting: data.grindSetting || null,
    roastAgeWeeks: calculateRoastAge(data.roastDate) || null,
    waterTempC: data.waterTemp || null,
    timestamp: Date.now()
  };
}

function collectUniversalData(brewData) {
  if (!getUserDataSharingPreference()) {
    return; // Don't collect if user hasn't consented
  }
  
  const anonymized = anonymizeForResearch(brewData);
  universalDataQueue.push(anonymized);
  
  // Store queue in localStorage (limit to last 100 entries)
  if (universalDataQueue.length > 100) {
    universalDataQueue = universalDataQueue.slice(-100);
  }
  localStorage.setItem("coffee_research_queue", JSON.stringify(universalDataQueue));
}

// =====================================================
// PRIVACY & DATA SHARING FUNCTIONS
// =====================================================
function savePrivacySettings(consented, dataSharingEnabled) {
  if (!STORAGE_KEYS.privacyConsent) {
    STORAGE_KEYS.privacyConsent = "coffee_privacy_consent";
    STORAGE_KEYS.dataSharingPreference = "coffee_data_sharing";
  }
  
  localStorage.setItem(STORAGE_KEYS.privacyConsent, JSON.stringify({
    consented: consented,
    timestamp: Date.now(),
    dataSharingEnabled: dataSharingEnabled || false
  }));
  
  if (dataSharingEnabled) {
    localStorage.setItem(STORAGE_KEYS.dataSharingPreference, "enabled");
  } else {
    localStorage.setItem(STORAGE_KEYS.dataSharingPreference, "disabled");
  }
  
  console.info("Privacy settings saved");
}

function getUserDataSharingPreference() {
  if (!STORAGE_KEYS.dataSharingPreference) {
    STORAGE_KEYS.dataSharingPreference = "coffee_data_sharing";
  }
  const pref = localStorage.getItem(STORAGE_KEYS.dataSharingPreference);
  return pref === "enabled";
}

function checkFirstTimeConsent() {
  if (!STORAGE_KEYS.privacyConsent) {
    STORAGE_KEYS.privacyConsent = "coffee_privacy_consent";
  }
  const consent = localStorage.getItem(STORAGE_KEYS.privacyConsent);
  if (!consent) {
    const modal = document.getElementById("privacy-consent-modal");
    if (modal) {
      modal.style.display = "flex";
    } else {
      const consented = confirm("We collect anonymized brewing data for research. Do you consent?");
      const dataSharing = consented && confirm("Enable data sharing for research?");
      savePrivacySettings(consented, dataSharing);
    }
  }
}

// =====================================================
// BLEND DETAILS HANDLING
// =====================================================
function handleOriginChange() {
  const originSelect = document.getElementById("origin");
  const blendDetailsSection = document.getElementById("blend-details-section");
  
  if (!originSelect) return;
  
  const selectedValue = originSelect.value.toLowerCase();
  const isBlend = selectedValue.includes("blend") || selectedValue === "blend";
  
  if (blendDetailsSection) {
    blendDetailsSection.style.display = isBlend ? "block" : "none";
  }
}

// Check admin status on page load
document.addEventListener("DOMContentLoaded", function() {
  updateAccessLevelDisplay();
  
  // Check first-time privacy consent
  checkFirstTimeConsent();
  
  // Load privacy settings checkbox state
  const dataSharingCheckbox = document.getElementById("data-sharing-checkbox");
  if (dataSharingCheckbox) {
    dataSharingCheckbox.checked = getUserDataSharingPreference();
  }
  
  // Attach origin change listener for blend details
  const originSelect = document.getElementById("origin");
  if (originSelect) {
    originSelect.addEventListener("change", handleOriginChange);
    handleOriginChange(); // Check initial state
  }
  
  if (isAdmin()) {
    showAdminDashboard();
  } else {
    hideAdminDashboard();
  }
});
