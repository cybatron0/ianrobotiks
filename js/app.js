// IanRobotiks — Enhanced Application
let currentSection = 'parts';
let selectedParts = [];
let xp = parseInt(localStorage.getItem('ianrobotiks-xp') || '0');
let badges = JSON.parse(localStorage.getItem('ianrobotiks-badges') || '[]');
let completedLessons = JSON.parse(localStorage.getItem('ianrobotiks-lessons') || '[]');

const PART_ICONS = {
  "arduino-uno":"🟦","esp32":"📗","rpi-zero":"🟥","arduino-nano":"🔷","pico":"💚",
  "sg90":"🦾","mg996r":"💪","tt-motor":"⚙️","n20-motor":"🔹","nema17":"🔲","nema23":"⬛",
  "hc-sr04":"📡","vl53l0x":"🔴","mpu6050":"📐","mpu9250":"🧭","ir-line":"👁️",
  "pir":"👻","dht22":"🌡️","camera-module":"📷",
  "9v-battery":"🔋","lipo-2s":"🔋","lipo-3s":"🔋","18650-holder":"🔋","buck-5v":"⚡",
  "l298n":"🔌","a4988":"🎛️","tb6600":"🎛️","relay-module":"🔗",
  "chassis-2wd":"🚗","chassis-4wd":"🚙","wheel-65mm":"🛞","omni-wheel":"⭕",
  "servo-bracket":"📎","breadboard":"🧩","ssd1306":"📺","ws2812b":"💡"
};

const SAFETY = {
  "lipo-2s":"⚠️ LiPo: charge in a fireproof bag, never puncture, never over-discharge below 3.0V/cell.",
  "lipo-3s":"⚠️ LiPo: use a proper balance charger. Store at ~3.8V/cell.",
  "nema17":"⚠️ Stepper motors and drivers can get hot. Ensure adequate cooling.",
  "nema23":"⚠️ High current — use proper wire gauge and a heatsink on the driver.",
  "l298n":"⚠️ L298N drops ~2V and gets warm under load. Consider a heatsink.",
  "mg996r":"⚠️ High-torque servo can draw large current spikes. Use a separate power supply if possible.",
  "ws2812b":"⚠️ Addressable LEDs can draw significant current. Calculate total draw before connecting.",
  "relay-module":"⚠️ Relays switch high voltage/current — keep mains wiring isolated and insulated."
};

const QUIZZES = {
  electronics: [
    { q:"Ohm's Law states:", options:["V = I × R","P = I × R","V = I / R","R = V × I"], a:0 },
    { q:"In a series circuit, current is:", options:["The same through all components","Split between components","Zero","Infinite"], a:0 }
  ],
  microcontrollers: [
    { q:"Which board has built-in WiFi?", options:["Arduino Uno","ESP32","Arduino Nano","None"], a:1 },
    { q:"PWM is commonly used to control:", options:["Motor speed & LED brightness","Only temperature","Only I²C devices","Battery voltage"], a:0 }
  ],
  sensors: [
    { q:"HC-SR04 measures distance using:", options:["Laser","Ultrasonic sound","Infrared light","Magnetic fields"], a:1 },
    { q:"An IMU typically contains:", options:["Only a camera","Gyro + accelerometer","Only a temperature sensor","A motor driver"], a:1 }
  ],
  motors: [
    { q:"A servo is controlled by:", options:["A continuous voltage","Pulse width (PWM timing)","Only I²C","Only SPI"], a:1 },
    { q:"An H-bridge is needed to:", options:["Measure temperature","Change DC motor direction","Power an OLED","Read an encoder"], a:1 }
  ],
  power: [
    { q:"Approximate runtime formula is:", options:["Capacity / Current","Current × Voltage","Voltage / Resistance","Torque × Speed"], a:0 },
    { q:"A buck converter:", options:["Steps voltage up","Steps voltage down","Stores energy","Measures current"], a:1 }
  ],
  safety: [
    { q:"When wiring a robot you should:", options:["Leave power connected","Disconnect power first","Ignore polarity","Use the thinnest wire"], a:1 },
    { q:"LiPo batteries should be charged:", options:["With any charger","In a fireproof bag with a balance charger","While punctured","At any voltage"], a:1 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initPartsLibrary();
  initBuilder();
  initPrintStudio();
  initLessons();
  initGlossary();
  updateXP();
  updateBadgesUI();
});

function initTheme() {
  const saved = localStorage.getItem('ianrobotiks-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ianrobotiks-theme', next);
  });
}

function initNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`section-${btn.dataset.section}`).classList.add('active');
      currentSection = btn.dataset.section;
    });
  });
}

function initPartsLibrary() {
  const grid = document.getElementById('parts-grid');
  const search = document.getElementById('part-search');
  const catFilter = document.getElementById('category-filter');
  function render(parts) {
    grid.innerHTML = parts.map(p => `
      <div class="part-card" data-id="${p.id}">
        <span class="part-icon">${PART_ICONS[p.id] || '🔩'}</span>
        <h3>${p.name}</h3>
        <span class="category-tag">${CATEGORIES[p.category] || p.category}</span>
        <div class="specs-preview">${p.voltage || ''} ${p.torque ? '• ' + p.torque : ''}</div>
      </div>`).join('');
    grid.querySelectorAll('.part-card').forEach(card => {
      card.addEventListener('click', () => showPartDetail(PARTS.find(p => p.id === card.dataset.id)));
    });
  }
  render(PARTS);
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    const cat = catFilter.value;
    render(PARTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q);
      return matchQ && (cat === 'all' || p.category === cat);
    }));
  });
  catFilter.addEventListener('change', () => search.dispatchEvent(new Event('input')));
}

function showPartDetail(p) {
  if (!p) return;
  const safety = SAFETY[p.id] ? `<div class="safety-note">${SAFETY[p.id]}</div>` : '';
  document.getElementById('part-detail').innerHTML = `
    <div class="detail-header">
      <span style="font-size:2.2rem">${PART_ICONS[p.id] || '🔩'}</span>
      <h2>${p.name}</h2>
      <span class="category-tag">${CATEGORIES[p.category] || p.category}</span>
    </div>
    <p style="margin:0.75rem 0;color:var(--text-muted)">${p.description || ''}</p>
    <div class="detail-grid">
      ${p.voltage ? `<div class="detail-row"><span>Voltage</span><span>${p.voltage}</span></div>` : ''}
      ${p.current ? `<div class="detail-row"><span>Current</span><span>${p.current}</span></div>` : ''}
      ${p.torque ? `<div class="detail-row"><span>Torque</span><span>${p.torque}</span></div>` : ''}
      ${p.weight ? `<div class="detail-row"><span>Weight</span><span>${p.weight}</span></div>` : ''}
      ${p.dimensions ? `<div class="detail-row"><span>Dimensions</span><span>${p.dimensions}</span></div>` : ''}
      ${p.range ? `<div class="detail-row"><span>Range</span><span>${p.range}</span></div>` : ''}
      ${p.capacity ? `<div class="detail-row"><span>Capacity</span><span>${p.capacity}</span></div>` : ''}
      ${p.pins ? `<div class="detail-row"><span>I/O</span><span>${p.pins}</span></div>` : ''}
    </div>
    ${p.pinout ? `<div style="margin-top:1rem"><strong>Pinout</strong><p style="font-family:monospace;font-size:0.9rem;margin-top:0.35rem">${p.pinout}</p></div>` : ''}
    ${p.useCases ? `<div style="margin-top:1rem"><strong>Typical Use Cases</strong><p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.35rem">${p.useCases}</p></div>` : ''}
    ${p.compatible ? `<div style="margin-top:1rem"><strong>Compatible With</strong><p style="font-size:0.9rem;margin-top:0.35rem">${p.compatible.join(', ')}</p></div>` : ''}
    ${safety}
    <button class="primary-btn" style="margin-top:1rem;width:100%" onclick="addPartToBuild('${p.id}');document.querySelector('[data-section=builder]').click()">➕ Add to Robot Builder</button>
  `;
}

function initBuilder() {
  const list = document.getElementById('builder-parts-list');
  list.innerHTML = PARTS.map(p => `<div class="builder-part-item" data-id="${p.id}"><span class="mini-icon">${PART_ICONS[p.id]||'🔩'}</span> ${p.name}</div>`).join('');
  list.querySelectorAll('.builder-part-item').forEach(item => item.addEventListener('click', () => addPartToBuild(item.dataset.id)));
  document.getElementById('clear-build').addEventListener('click', clearBuild);
  document.getElementById('validate-build').addEventListener('click', validateBuild);
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBuilderView(btn.dataset.mode);
    });
  });
  document.querySelectorAll('.preset-btn').forEach(btn => btn.addEventListener('click', () => loadPreset(btn.dataset.preset)));
}

function addPartToBuild(id) {
  const part = PARTS.find(p => p.id === id);
  if (!part) return;
  selectedParts.push({ ...part, _uid: id + '-' + Date.now() });
  updateBuildStatus();
  renderBuilderView(document.querySelector('.mode-btn.active')?.dataset.mode || 'assembly');
  showSafetyForBuild();
  addXP(5);
  checkBadges();
}

function clearBuild() {
  selectedParts = [];
  updateBuildStatus();
  document.getElementById('builder-canvas').innerHTML = `<div class="canvas-placeholder">Click parts from the list to add them to your robot</div>`;
  document.getElementById('compatibility-notes').innerHTML = '';
  const sn = document.getElementById('safety-panel');
  if (sn) sn.innerHTML = '';
}

function updateBuildStatus() {
  const el = document.getElementById('build-status');
  if (!el) return;
  el.textContent = selectedParts.length === 0 ? 'No parts added yet' :
    `${selectedParts.length} part(s): ${selectedParts.map(p => p.name).join(', ')}`;
}

function showSafetyForBuild() {
  const panel = document.getElementById('safety-panel');
  if (!panel) return;
  const notes = [...new Set(selectedParts.map(p => SAFETY[p.id]).filter(Boolean))];
  panel.innerHTML = notes.length ? notes.map(n => `<div class="safety-note">${n}</div>`).join('') : '';
}

function renderBuilderView(mode) {
  const canvas = document.getElementById('builder-canvas');
  if (!canvas) return;
  if (selectedParts.length === 0) {
    canvas.innerHTML = `<div class="canvas-placeholder">Click parts from the list to start building</div>`;
    return;
  }
  if (mode === 'wiring') renderWiringView(canvas);
  else if (mode === 'assembly') renderAssemblyView(canvas);
  else if (mode === 'code') renderCodeView(canvas);
}

function renderAssemblyView(canvas) {
  canvas.innerHTML = `
    <h3 class="view-title">Visual Assembly — Component Replicas</h3>
    <div class="visual-parts" id="assembly-area">
      ${selectedParts.map((p,i) => `
        <div class="visual-part" data-uid="${p._uid}" style="animation-delay:${i*0.05}s">
          <span class="vp-icon">${PART_ICONS[p.id]||'🔩'}</span>
          <div class="vp-name">${p.name}</div>
          <div class="vp-cat">${CATEGORIES[p.category]||p.category}</div>
          <div class="vp-wire" title="Connection point"></div>
          <button class="remove-part" onclick="removePart('${p._uid}')" title="Remove">×</button>
        </div>`).join('')}
    </div>
    <p class="hint-text">Green dots = connection points. Switch to <strong>Wiring</strong> for pin-level diagram or <strong>Code</strong> for firmware.</p>
  `;
}

function removePart(uid) {
  selectedParts = selectedParts.filter(p => p._uid !== uid);
  updateBuildStatus();
  renderBuilderView(document.querySelector('.mode-btn.active')?.dataset.mode || 'assembly');
  showSafetyForBuild();
}

function renderWiringView(canvas) {
  const nodes = selectedParts.map((p, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return { p, x: 80 + col * 160, y: 60 + row * 120, i };
  });
  let svgWires = '';
  const ctrl = nodes.find(n => n.p.category === 'microcontroller');
  if (ctrl) {
    nodes.forEach(n => {
      if (n.p === ctrl.p) return;
      const isPower = n.p.category === 'power';
      const color = isPower ? '#ff4466' : (n.p.category === 'motor' || n.p.category === 'actuator' ? '#00e5ff' : '#00ff88');
      svgWires += `<line x1="${ctrl.x}" y1="${ctrl.y}" x2="${n.x}" y2="${n.y}" stroke="${color}" stroke-width="2" stroke-dasharray="6 4" opacity="0.7"/>`;
    });
  }
  canvas.innerHTML = `
    <h3 class="view-title">Wiring / Circuit View</h3>
    <div class="wiring-canvas-wrap">
      <svg class="wiring-svg" viewBox="0 0 700 320" preserveAspectRatio="xMidYMid meet">
        ${svgWires}
        ${nodes.map(n => `
          <g transform="translate(${n.x},${n.y})">
            <rect x="-55" y="-28" width="110" height="56" rx="8" fill="#162016" stroke="#00ff88" stroke-width="1.5"/>
            <text text-anchor="middle" y="-6" fill="#00ff88" font-size="18">${PART_ICONS[n.p.id]||'🔩'}</text>
            <text text-anchor="middle" y="14" fill="#e8ffe8" font-size="9">${n.p.name.length>14?n.p.name.slice(0,13)+'…':n.p.name}</text>
          </g>`).join('')}
      </svg>
    </div>
    <div class="wiring-list" style="margin-top:1rem">
      ${selectedParts.map(p => `
        <div class="wire-card">
          <strong style="color:var(--primary)">${PART_ICONS[p.id]||'🔩'} ${p.name}</strong><br>
          <span class="wire-power">PWR</span> / <span class="wire-gnd">GND</span> / <span class="wire-signal">SIG</span>: ${p.pinout || 'See datasheet'}
        </div>`).join('')}
      <p class="hint-text" style="margin-top:0.75rem">
        <span class="wire-power">Red dashed</span> ≈ power ·
        <span class="wire-signal">Cyan</span> ≈ signal/motor ·
        <span style="color:var(--primary)">Green</span> ≈ sensors
      </p>
    </div>
  `;
}

function renderCodeView(canvas) {
  const code = generateSmartCode();
  canvas.innerHTML = `
    <h3 class="view-title">Generated Starter Code</h3>
    <div class="code-actions">
      <button class="secondary-btn" onclick="copyCode()">📋 Copy Code</button>
    </div>
    <pre id="generated-code" class="code-block">${escapeHtml(code)}</pre>
  `;
}

function escapeHtml(s) {
  return s.replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
}

function copyCode() {
  const el = document.getElementById('generated-code');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    addXP(2);
    alert('Code copied to clipboard!');
  }).catch(() => alert('Copy failed — select the code manually.'));
}

function generateSmartCode() {
  const has = id => selectedParts.some(p => p.id === id);
  const controller = selectedParts.find(p => p.category === 'microcontroller');
  if (!controller) return '// Add a microcontroller (Arduino / ESP32 / Pico / Pi) to generate code.\n';
  if (controller.id === 'rpi-zero') {
    return `# Auto-generated Python (Raspberry Pi) — IanRobotiks\n# Parts: ${selectedParts.map(p=>p.name).join(', ')}\n\nfrom gpiozero import Motor, DistanceSensor, Servo\nfrom time import sleep\n\n${has('tt-motor')||has('n20-motor') ? 'motor = Motor(forward=17, backward=18)\n' : ''}${has('hc-sr04') ? 'ultrasonic = DistanceSensor(echo=24, trigger=23)\n' : ''}${has('sg90')||has('mg996r') ? 'servo = Servo(25)\n' : ''}\nprint("IanRobotiks robot starting...")\n\nwhile True:\n${has('hc-sr04') ? '    dist = ultrasonic.distance * 100\n    print(f"Distance: {dist:.1f} cm")\n    if dist < 20:\n        motor.backward()\n    else:\n        motor.forward()\n' : '    sleep(0.1)\n'}    sleep(0.1)\n`;
  }
  let code = `// Auto-generated starter code — IanRobotiks\n// Controller: ${controller.name}\n// Parts: ${selectedParts.map(p=>p.name).join(', ')}\n\n`;
  if (has('sg90') || has('mg996r')) code += `#include <Servo.h>\nServo myServo;\n`;
  code += `\n// ---- Pin definitions ----\n`;
  if (has('hc-sr04')) code += `#define TRIG_PIN 7\n#define ECHO_PIN 6\n`;
  if (has('l298n')) code += `#define ENA 5\n#define IN1 4\n#define IN2 3\n#define ENB 9\n#define IN3 8\n#define IN4 10\n`;
  if (has('sg90') || has('mg996r')) code += `#define SERVO_PIN 11\n`;
  if (has('ir-line')) code += `#define IR_PIN A0\n`;
  code += `\nvoid setup() {\n  Serial.begin(115200);\n  Serial.println("IanRobotiks robot booting...");\n`;
  if (has('hc-sr04')) code += `  pinMode(TRIG_PIN, OUTPUT);\n  pinMode(ECHO_PIN, INPUT);\n`;
  if (has('l298n')) code += `  pinMode(ENA, OUTPUT); pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n  pinMode(ENB, OUTPUT); pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n`;
  if (has('sg90') || has('mg996r')) code += `  myServo.attach(SERVO_PIN);\n  myServo.write(90);\n`;
  if (has('ir-line')) code += `  pinMode(IR_PIN, INPUT);\n`;
  code += `}\n\nvoid loop() {\n`;
  if (has('hc-sr04')) {
    code += `  digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);\n  digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);\n  digitalWrite(TRIG_PIN, LOW);\n  long duration = pulseIn(ECHO_PIN, HIGH);\n  float distance = duration * 0.034 / 2;\n  Serial.print("Distance: "); Serial.println(distance);\n\n`;
  }
  if (has('l298n') && has('hc-sr04')) {
    code += `  if (distance < 25) {\n    digitalWrite(IN1, LOW); digitalWrite(IN2, HIGH);\n    digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n    analogWrite(ENA, 150); analogWrite(ENB, 150);\n  } else {\n    digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n    digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n    analogWrite(ENA, 180); analogWrite(ENB, 180);\n  }\n\n`;
  } else if (has('l298n')) {
    code += `  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n  analogWrite(ENA, 180); analogWrite(ENB, 180);\n\n`;
  }
  if (has('sg90') || has('mg996r')) code += `  myServo.write(90);\n\n`;
  if (has('ir-line')) code += `  int irValue = analogRead(IR_PIN);\n  Serial.print("IR: "); Serial.println(irValue);\n\n`;
  code += `  delay(50);\n}\n`;
  return code;
}

function validateBuild() {
  const notes = document.getElementById('compatibility-notes');
  if (!notes) return;
  if (selectedParts.length === 0) {
    notes.innerHTML = '<p style="color:var(--text-muted)">Add some parts first.</p>';
    return;
  }
  const issues = [];
  const hasController = selectedParts.some(p => p.category === 'microcontroller');
  const hasPower = selectedParts.some(p => p.category === 'power');
  const hasMotor = selectedParts.some(p => p.category === 'motor');
  const hasDriver = selectedParts.some(p => p.id === 'l298n' || p.id === 'a4988' || p.id === 'tb6600');
  const hasServo = selectedParts.some(p => p.id === 'sg90' || p.id === 'mg996r');
  if (!hasController) issues.push('No microcontroller — the robot needs a brain.');
  if (!hasPower) issues.push('No power source — the robot needs energy.');
  if (hasMotor && !hasDriver && !hasServo) issues.push('DC/stepper motor present but no motor driver (L298N / A4988 / TB6600).');
  if (selectedParts.some(p => p.id === 'esp32') && selectedParts.some(p => p.id === 'hc-sr04'))
    issues.push('ESP32 is 3.3V logic; HC-SR04 is 5V. Use a level shifter or a 3.3V-safe ultrasonic.');
  if (selectedParts.some(p => p.id === 'camera-module') && !selectedParts.some(p => p.id === 'rpi-zero'))
    issues.push('Pi Camera Module requires a Raspberry Pi (CSI connector).');
  if (issues.length === 0) {
    notes.innerHTML = '<p style="color:var(--primary);font-weight:600">✓ Design looks viable! No major compatibility issues detected.</p>';
    addXP(25);
    unlockBadge('first-valid-build');
  } else {
    notes.innerHTML = `<div style="color:var(--danger)"><strong>Potential Issues:</strong><ul style="margin-top:0.5rem;padding-left:1.2rem">${issues.map(i=>`<li>${i}</li>`).join('')}</ul></div>`;
  }
}

function loadPreset(name) {
  clearBuild();
  const presets = {
    'line-follower': ['arduino-uno','tt-motor','tt-motor','l298n','ir-line','9v-battery','chassis-2wd','wheel-65mm'],
    'obstacle-avoider': ['arduino-uno','tt-motor','tt-motor','l298n','hc-sr04','9v-battery','chassis-2wd','ssd1306'],
    'robotic-arm': ['arduino-uno','sg90','sg90','sg90','mg996r','9v-battery','servo-bracket'],
    'balance-bot': ['esp32','mpu6050','n20-motor','n20-motor','lipo-2s','l298n'],
    'vision-bot': ['rpi-zero','camera-module','chassis-2wd','tt-motor','tt-motor','l298n','lipo-2s']
  };
  (presets[name]||[]).forEach(id => {
    const p = PARTS.find(x => x.id === id);
    if (p) selectedParts.push({ ...p, _uid: id + '-' + Date.now() + Math.random() });
  });
  updateBuildStatus();
  renderBuilderView('assembly');
  showSafetyForBuild();
  addXP(15);
  unlockBadge('used-preset');
}

function initPrintStudio() {
  const grid = document.getElementById('print-parts-grid');
  if (!grid) return;
  grid.innerHTML = PRINTABLE_PARTS.map(p => `
    <div class="part-card" data-id="${p.id}">
      <span class="part-icon">🧊</span>
      <h3>${p.name}</h3>
      <span class="category-tag">Printable</span>
      <div class="specs-preview">${p.material} • ${p.time}</div>
    </div>`).join('');
  grid.querySelectorAll('.part-card').forEach(card => {
    card.addEventListener('click', () => {
      const part = PRINTABLE_PARTS.find(p => p.id === card.dataset.id);
      document.getElementById('print-3d-viewer').innerHTML = `
        <div style="text-align:center">
          <div style="font-size:3.5rem;margin-bottom:0.5rem">🧊</div>
          <strong>${part.name}</strong>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.5rem">Printable part · ${part.material}</p>
        </div>`;
      const settings = document.getElementById('print-settings');
      settings.style.display = 'block';
      settings.innerHTML = `
        <h4 style="margin:1rem 0 0.5rem;color:var(--primary)">Recommended Print Settings</h4>
        <div class="detail-grid">
          <div class="detail-row"><span>Material</span><span>${part.material}</span></div>
          <div class="detail-row"><span>Layer Height</span><span>${part.layer}</span></div>
          <div class="detail-row"><span>Infill</span><span>${part.infill}</span></div>
          <div class="detail-row"><span>Est. Time</span><span>${part.time}</span></div>
        </div>
        ${part.notes ? `<p style="margin-top:0.75rem;font-size:0.85rem;color:var(--text-muted)">${part.notes}</p>` : ''}`;
    });
  });
}

function initLessons() {
  const grid = document.getElementById('modules-grid');
  if (!grid) return;
  grid.innerHTML = MODULES.map(m => {
    const done = completedLessons.includes(m.id);
    return `<div class="module-card ${done?'completed':''}" data-id="${m.id}">
      <h3>${m.title} ${done?'✅':''}</h3>
      <p>${m.desc}</p>
    </div>`;
  }).join('');
  grid.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => openLesson(card.dataset.id));
  });
}

function openLesson(id) {
  const mod = MODULES.find(m => m.id === id);
  if (!mod) return;
  const content = document.getElementById('lesson-content');
  content.style.display = 'block';
  const quiz = QUIZZES[id];
  let quizHtml = '';
  if (quiz) {
    quizHtml = `<div class="quiz-box" id="quiz-${id}">
      <h3 style="color:var(--primary);margin-bottom:0.75rem">Quick Quiz</h3>
      ${quiz.map((item, qi) => `
        <div class="quiz-q" data-qi="${qi}">
          <p><strong>${qi+1}. ${item.q}</strong></p>
          ${item.options.map((opt, oi) => `
            <label class="quiz-opt"><input type="radio" name="q${qi}" value="${oi}"> ${opt}</label>
          `).join('')}
        </div>`).join('')}
      <button class="primary-btn" style="margin-top:1rem" onclick="gradeQuiz('${id}')">Submit Answers</button>
      <div id="quiz-result-${id}" style="margin-top:0.75rem"></div>
    </div>`;
  }
  content.innerHTML = `
    <div class="lesson-panel">
      <h2 style="color:var(--primary)">${mod.title}</h2>
      <p style="color:var(--text-muted);margin:0.5rem 0 1rem">${mod.desc}</p>
      <div style="line-height:1.75">${mod.content}</div>
      ${quizHtml}
      <div style="margin-top:1.25rem;display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="primary-btn" onclick="completeLesson('${id}')">Mark Complete (+XP)</button>
        <button class="secondary-btn" onclick="document.getElementById('lesson-content').style.display='none'">Close</button>
      </div>
    </div>`;
  content.scrollIntoView({ behavior: 'smooth' });
}

function gradeQuiz(id) {
  const quiz = QUIZZES[id];
  if (!quiz) return;
  let correct = 0;
  quiz.forEach((item, qi) => {
    const selected = document.querySelector(`input[name="q${qi}"]:checked`);
    if (selected && parseInt(selected.value) === item.a) correct++;
  });
  const result = document.getElementById(`quiz-result-${id}`);
  const pct = Math.round((correct / quiz.length) * 100);
  if (pct === 100) {
    result.innerHTML = `<p style="color:var(--primary);font-weight:600">Perfect! ${correct}/${quiz.length} correct. +30 XP</p>`;
    addXP(30);
    unlockBadge('quiz-master');
  } else {
    result.innerHTML = `<p style="color:var(--warning)">You got ${correct}/${quiz.length} (${pct}%). Review and try again.</p>`;
    addXP(5);
  }
}

function completeLesson(id) {
  if (!completedLessons.includes(id)) {
    completedLessons.push(id);
    localStorage.setItem('ianrobotiks-lessons', JSON.stringify(completedLessons));
    addXP(20);
    unlockBadge('student');
    if (completedLessons.length >= 5) unlockBadge('dedicated-learner');
    if (completedLessons.length >= MODULES.length) unlockBadge('graduate');
  }
  initLessons();
  document.getElementById('lesson-content').style.display = 'none';
}

function initGlossary() {
  const list = document.getElementById('glossary-list');
  const search = document.getElementById('glossary-search');
  if (!list) return;
  function render(items) {
    list.innerHTML = items.map(g => `<div class="glossary-item"><h4>${g.term}</h4><p>${g.def}</p></div>`).join('');
  }
  render(GLOSSARY);
  if (search) search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    render(GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)));
  });
}

function calcOhms() {
  const v = parseFloat(document.getElementById('ohm-v').value);
  const i = parseFloat(document.getElementById('ohm-i').value);
  if (isNaN(v)||isNaN(i)||i===0) { document.getElementById('ohm-result').textContent = 'Enter valid V and I'; return; }
  document.getElementById('ohm-result').textContent = `R = ${(v/i).toFixed(2)} Ω`; addXP(3);
}
function calcBattery() {
  const cap = parseFloat(document.getElementById('batt-cap').value);
  const draw = parseFloat(document.getElementById('batt-draw').value);
  if (isNaN(cap)||isNaN(draw)||draw===0) { document.getElementById('batt-result').textContent = 'Enter valid values'; return; }
  document.getElementById('batt-result').textContent = `≈ ${(cap/draw).toFixed(1)} hours (${((cap/draw)*60).toFixed(0)} min)`; addXP(3);
}
function calcGear() {
  const driven = parseFloat(document.getElementById('gear-driven').value);
  const driving = parseFloat(document.getElementById('gear-driving').value);
  if (isNaN(driven)||isNaN(driving)||driving===0) { document.getElementById('gear-result').textContent = 'Enter valid tooth counts'; return; }
  document.getElementById('gear-result').textContent = `Ratio = ${(driven/driving).toFixed(2)} : 1`; addXP(3);
}
function calcTorque() {
  const f = parseFloat(document.getElementById('torque-f').value);
  const r = parseFloat(document.getElementById('torque-r').value);
  if (isNaN(f)||isNaN(r)) { document.getElementById('torque-result').textContent = 'Enter valid values'; return; }
  document.getElementById('torque-result').textContent = `Torque = ${(f*r).toFixed(3)} N·m`; addXP(3);
}
function calcPWM() {
  const duty = parseFloat(document.getElementById('pwm-duty').value);
  if (isNaN(duty)||duty<0||duty>100) { document.getElementById('pwm-result').textContent = 'Enter 0–100%'; return; }
  const bar = document.getElementById('pwm-bar');
  if (bar) bar.style.width = duty + '%';
  document.getElementById('pwm-result').textContent = `Duty cycle ${duty}% → effective ≈ ${(duty/100*5).toFixed(2)} V (on 5V logic)`;
  addXP(3);
}
function calcDivider() {
  const vin = parseFloat(document.getElementById('div-vin').value);
  const r1 = parseFloat(document.getElementById('div-r1').value);
  const r2 = parseFloat(document.getElementById('div-r2').value);
  if (isNaN(vin)||isNaN(r1)||isNaN(r2)|| (r1+r2)===0) { document.getElementById('div-result').textContent = 'Enter valid values'; return; }
  document.getElementById('div-result').textContent = `Vout = ${(vin * (r2 / (r1 + r2))).toFixed(3)} V`;
  addXP(3);
}

function addXP(amount) {
  xp += amount;
  localStorage.setItem('ianrobotiks-xp', xp);
  updateXP();
  checkBadges();
}
function updateXP() {
  const el = document.getElementById('xp-value');
  if (el) el.textContent = xp;
}
function unlockBadge(id) {
  if (badges.includes(id)) return;
  badges.push(id);
  localStorage.setItem('ianrobotiks-badges', JSON.stringify(badges));
  updateBadgesUI();
}
function checkBadges() {
  if (xp >= 100) unlockBadge('xp-100');
  if (xp >= 500) unlockBadge('xp-500');
}
function updateBadgesUI() {
  const el = document.getElementById('badges-display');
  if (!el) return;
  const names = {
    'first-valid-build':'🏅 First Build',
    'used-preset':'🎛️ Preset Pilot',
    'student':'📚 Student',
    'dedicated-learner':'🔥 Dedicated',
    'graduate':'🎓 Graduate',
    'quiz-master':'🧠 Quiz Master',
    'xp-100':'💯 Century',
    'xp-500':'⭐ High Achiever'
  };
  el.innerHTML = badges.length ? badges.map(b => `<span class="badge-pill">${names[b]||b}</span>`).join('') : '<span style="color:var(--text-muted);font-size:0.85rem">No badges yet</span>';
}
