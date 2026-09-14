// IanRobotiks — Main Application
let currentSection = 'parts';
let selectedParts = [];
let xp = parseInt(localStorage.getItem('ianrobotiks-xp') || '0');

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initPartsLibrary();
  initBuilder();
  initPrintStudio();
  initLessons();
  initGlossary();
  updateXP();
});

function initTheme() {
  const saved = localStorage.getItem('ianrobotiks-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
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
      const section = btn.dataset.section;
      document.getElementById(`section-${section}`).classList.add('active');
      currentSection = section;
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
        <h3>${p.name}</h3>
        <span class="category-tag">${CATEGORIES[p.category] || p.category}</span>
        <div class="specs-preview">${p.voltage || ''} ${p.torque ? '• ' + p.torque : ''}</div>
      </div>
    `).join('');

    grid.querySelectorAll('.part-card').forEach(card => {
      card.addEventListener('click', () => {
        const part = PARTS.find(p => p.id === card.dataset.id);
        showPartDetail(part);
      });
    });
  }

  render(PARTS);

  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    const cat = catFilter.value;
    const filtered = PARTS.filter(p => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const matchC = cat === 'all' || p.category === cat;
      return matchQ && matchC;
    });
    render(filtered);
  });

  catFilter.addEventListener('change', () => search.dispatchEvent(new Event('input')));
}

function showPartDetail(p) {
  const detail = document.getElementById('part-detail');
  detail.innerHTML = `
    <div class="detail-header">
      <h2>${p.name}</h2>
      <span class="category-tag">${CATEGORIES[p.category] || p.category}</span>
    </div>
    <p style="margin:0.75rem 0;color:var(--text-muted);">${p.description || ''}</p>
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
    ${p.pinout ? `<div style="margin-top:1rem;"><strong>Pinout</strong><p style="font-family:monospace;font-size:0.9rem;margin-top:0.35rem;">${p.pinout}</p></div>` : ''}
    ${p.useCases ? `<div style="margin-top:1rem;"><strong>Typical Use Cases</strong><p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.35rem;">${p.useCases}</p></div>` : ''}
    ${p.compatible ? `<div style="margin-top:1rem;"><strong>Compatible With</strong><p style="font-size:0.9rem;margin-top:0.35rem;">${p.compatible.join(', ')}</p></div>` : ''}
  `;
}

function initBuilder() {
  const list = document.getElementById('builder-parts-list');
  list.innerHTML = PARTS.map(p => `<div class="builder-part-item" data-id="${p.id}">${p.name}</div>`).join('');

  list.querySelectorAll('.builder-part-item').forEach(item => {
    item.addEventListener('click', () => addPartToBuild(item.dataset.id));
  });

  document.getElementById('clear-build').addEventListener('click', clearBuild);
  document.getElementById('validate-build').addEventListener('click', validateBuild);

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderBuilderView(btn.dataset.mode);
    });
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => loadPreset(btn.dataset.preset));
  });
}

function addPartToBuild(id) {
  const part = PARTS.find(p => p.id === id);
  if (!part) return;
  if (selectedParts.find(p => p.id === id)) return;
  selectedParts.push(part);
  updateBuildStatus();
  renderBuilderView(document.querySelector('.mode-btn.active').dataset.mode);
  addXP(5);
}

function clearBuild() {
  selectedParts = [];
  updateBuildStatus();
  document.getElementById('builder-canvas').innerHTML = `<div class="canvas-placeholder">Drag parts here or click them from the list to add</div>`;
  document.getElementById('compatibility-notes').innerHTML = '';
}

function updateBuildStatus() {
  const status = document.getElementById('build-status');
  if (selectedParts.length === 0) status.textContent = 'No parts added yet';
  else status.textContent = `${selectedParts.length} part(s): ${selectedParts.map(p => p.name).join(', ')}`;
}

function renderBuilderView(mode) {
  const canvas = document.getElementById('builder-canvas');
  if (selectedParts.length === 0) {
    canvas.innerHTML = `<div class="canvas-placeholder">Add parts from the list to start building</div>`;
    return;
  }

  if (mode === 'wiring') {
    canvas.innerHTML = `
      <h3 style="margin-bottom:0.75rem;">Wiring / Circuit View</h3>
      <div style="font-family:monospace;font-size:0.9rem;line-height:1.7;">
        ${selectedParts.map(p => `<div>• <strong>${p.name}</strong> — ${p.pinout || 'See datasheet'}</div>`).join('')}
        <hr style="margin:1rem 0;border-color:var(--border);">
        <p style="color:var(--text-muted);">Connect power (VCC/VIN) and ground (GND) first. Then signal wires. Always check voltage compatibility.</p>
      </div>
    `;
  } else if (mode === 'assembly') {
    canvas.innerHTML = `
      <h3 style="margin-bottom:0.75rem;">3D Assembly View (Simplified)</h3>
      <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
        ${selectedParts.map(p => `
          <div style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:0.75rem;min-width:120px;text-align:center;">
            <div style="font-size:1.5rem;margin-bottom:0.35rem;">${p.category === 'motor' ? '⚙️' : p.category === 'sensor' ? '📡' : p.category === 'microcontroller' ? '🧠' : p.category === 'power' ? '🔋' : '🔩'}</div>
            <div style="font-size:0.85rem;font-weight:600;">${p.name}</div>
          </div>
        `).join('')}
      </div>
      <p style="margin-top:1rem;color:var(--text-muted);font-size:0.9rem;">Full 3D CAD-style preview will be enhanced in future updates using Three.js.</p>
    `;
  } else if (mode === 'code') {
    const hasServo = selectedParts.some(p => p.id === 'sg90');
    const hasUltrasonic = selectedParts.some(p => p.id === 'hc-sr04');
    const hasMotorDriver = selectedParts.some(p => p.id === 'l298n');
    const hasController = selectedParts.some(p => p.category === 'microcontroller');

    let code = `// Auto-generated starter code — IanRobotiks\n\n`;
    if (hasController) {
      code += `#include <Arduino.h>\n`;
      if (hasServo) code += `#include <Servo.h>\nServo myServo;\n`;
      code += `\nvoid setup() {\n  Serial.begin(9600);\n`;
      if (hasServo) code += `  myServo.attach(9);\n`;
      if (hasUltrasonic) code += `  pinMode(7, OUTPUT); // Trig\n  pinMode(6, INPUT);  // Echo\n`;
      if (hasMotorDriver) code += `  pinMode(5, OUTPUT); // ENA\n  pinMode(4, OUTPUT); // IN1\n  pinMode(3, OUTPUT); // IN2\n`;
      code += `}\n\nvoid loop() {\n`;
      if (hasUltrasonic) code += `  digitalWrite(7, LOW); delayMicroseconds(2);\n  digitalWrite(7, HIGH); delayMicroseconds(10);\n  digitalWrite(7, LOW);\n  long duration = pulseIn(6, HIGH);\n  float distance = duration * 0.034 / 2;\n  Serial.println(distance);\n`;
      if (hasServo) code += `  myServo.write(90);\n`;
      if (hasMotorDriver) code += `  digitalWrite(4, HIGH); digitalWrite(3, LOW); analogWrite(5, 180);\n`;
      code += `  delay(100);\n}\n`;
    } else {
      code += `// Add a microcontroller to generate code.\n`;
    }

    canvas.innerHTML = `
      <h3 style="margin-bottom:0.75rem;">Generated Starter Code</h3>
      <pre style="background:var(--bg);padding:1rem;border-radius:8px;overflow:auto;font-size:0.85rem;line-height:1.5;font-family:'JetBrains Mono',monospace;">${code}</pre>
    `;
  }
}

function validateBuild() {
  const notes = document.getElementById('compatibility-notes');
  if (selectedParts.length === 0) {
    notes.innerHTML = `<p style="color:var(--text-muted);">Add some parts first.</p>`;
    return;
  }

  const issues = [];
  const hasController = selectedParts.some(p => p.category === 'microcontroller');
  const hasPower = selectedParts.some(p => p.category === 'power');
  const hasMotor = selectedParts.some(p => p.category === 'motor');
  const hasDriver = selectedParts.some(p => p.id === 'l298n');

  if (!hasController) issues.push('No microcontroller selected. You need a brain for the robot.');
  if (!hasPower) issues.push('No power source selected. The robot needs energy.');
  if (hasMotor && !hasDriver && !selectedParts.some(p => p.id === 'sg90')) {
    issues.push('You have a DC/stepper motor but no motor driver (e.g. L298N). Servos are an exception.');
  }

  if (issues.length === 0) {
    notes.innerHTML = `<p style="color:#10b981;font-weight:600;">✓ Design looks viable! No major compatibility issues detected.</p>`;
    addXP(20);
  } else {
    notes.innerHTML = `<div style="color:#ef4444;"><strong>Potential Issues:</strong><ul style="margin-top:0.5rem;padding-left:1.2rem;">${issues.map(i => `<li>${i}</li>`).join('')}</ul></div>`;
  }
}

function loadPreset(name) {
  clearBuild();
  const presets = {
    'line-follower': ['arduino-uno', 'tt-motor', 'l298n', 'ir-line', '9v-battery', 'chassis-2wd', 'wheel-65mm'],
    'obstacle-avoider': ['arduino-uno', 'tt-motor', 'l298n', 'hc-sr04', '9v-battery', 'chassis-2wd'],
    'robotic-arm': ['arduino-uno', 'sg90', 'sg90', 'sg90', '9v-battery']
  };
  (presets[name] || []).forEach(id => {
    const part = PARTS.find(p => p.id === id);
    if (part) selectedParts.push({ ...part });
  });
  updateBuildStatus();
  renderBuilderView('wiring');
  addXP(10);
}

function initPrintStudio() {
  const grid = document.getElementById('print-parts-grid');
  grid.innerHTML = PRINTABLE_PARTS.map(p => `
    <div class="part-card" data-id="${p.id}">
      <h3>${p.name}</h3>
      <span class="category-tag">Printable</span>
      <div class="specs-preview">${p.material} • ${p.time}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.part-card').forEach(card => {
    card.addEventListener('click', () => {
      const part = PRINTABLE_PARTS.find(p => p.id === card.dataset.id);
      const viewer = document.getElementById('print-3d-viewer');
      const settings = document.getElementById('print-settings');
      viewer.innerHTML = `
        <div style="text-align:center;">
          <div style="font-size:3rem;margin-bottom:0.5rem;">🧊</div>
          <strong>${part.name}</strong>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-top:0.5rem;">3D preview placeholder — Three.js model coming soon</p>
        </div>
      `;
      settings.style.display = 'block';
      settings.innerHTML = `
        <h4 style="margin:1rem 0 0.5rem;">Recommended Print Settings</h4>
        <div class="detail-grid">
          <div class="detail-row"><span>Material</span><span>${part.material}</span></div>
          <div class="detail-row"><span>Layer Height</span><span>${part.layer}</span></div>
          <div class="detail-row"><span>Infill</span><span>${part.infill}</span></div>
          <div class="detail-row"><span>Est. Time</span><span>${part.time}</span></div>
        </div>
      `;
    });
  });
}

function initLessons() {
  const grid = document.getElementById('modules-grid');
  grid.innerHTML = MODULES.map(m => `
    <div class="module-card" data-id="${m.id}">
      <h3>${m.title}</h3>
      <p>${m.desc}</p>
    </div>
  `).join('');

  grid.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', () => {
      const mod = MODULES.find(m => m.id === card.dataset.id);
      const content = document.getElementById('lesson-content');
      content.style.display = 'block';
      content.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.5rem;margin-top:1.5rem;">
          <h2>${mod.title}</h2>
          <p style="color:var(--text-muted);margin:0.5rem 0 1rem;">${mod.desc}</p>
          <div style="line-height:1.7;">${mod.content}</div>
          <button class="secondary-btn" style="margin-top:1rem;" onclick="document.getElementById('lesson-content').style.display='none'">Close</button>
        </div>
      `;
      content.scrollIntoView({ behavior: 'smooth' });
      addXP(8);
    });
  });
}

function initGlossary() {
  const list = document.getElementById('glossary-list');
  const search = document.getElementById('glossary-search');
  function render(items) {
    list.innerHTML = items.map(g => `<div class="glossary-item"><h4>${g.term}</h4><p>${g.def}</p></div>`).join('');
  }
  render(GLOSSARY);
  search.addEventListener('input', () => {
    const q = search.value.toLowerCase().trim();
    render(GLOSSARY.filter(g => g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q)));
  });
}

function calcOhms() {
  const v = parseFloat(document.getElementById('ohm-v').value);
  const i = parseFloat(document.getElementById('ohm-i').value);
  if (isNaN(v) || isNaN(i) || i === 0) { document.getElementById('ohm-result').textContent = 'Enter valid V and I'; return; }
  document.getElementById('ohm-result').textContent = `R = ${(v / i).toFixed(2)} Ω`;
  addXP(3);
}
function calcBattery() {
  const cap = parseFloat(document.getElementById('batt-cap').value);
  const draw = parseFloat(document.getElementById('batt-draw').value);
  if (isNaN(cap) || isNaN(draw) || draw === 0) { document.getElementById('batt-result').textContent = 'Enter valid values'; return; }
  document.getElementById('batt-result').textContent = `≈ ${(cap / draw).toFixed(1)} hours`;
  addXP(3);
}
function calcGear() {
  const driven = parseFloat(document.getElementById('gear-driven').value);
  const driving = parseFloat(document.getElementById('gear-driving').value);
  if (isNaN(driven) || isNaN(driving) || driving === 0) { document.getElementById('gear-result').textContent = 'Enter valid tooth counts'; return; }
  document.getElementById('gear-result').textContent = `Ratio = ${(driven / driving).toFixed(2)} : 1`;
  addXP(3);
}
function calcTorque() {
  const f = parseFloat(document.getElementById('torque-f').value);
  const r = parseFloat(document.getElementById('torque-r').value);
  if (isNaN(f) || isNaN(r)) { document.getElementById('torque-result').textContent = 'Enter valid values'; return; }
  document.getElementById('torque-result').textContent = `Torque = ${(f * r).toFixed(3)} N·m`;
  addXP(3);
}

function addXP(amount) { xp += amount; localStorage.setItem('ianrobotiks-xp', xp); updateXP(); }
function updateXP() { document.getElementById('xp-value').textContent = xp; }
