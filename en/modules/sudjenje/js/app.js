const suspects = [
  { id:'aleksandar', name:'Aleksandar Ilić', role:'Aca Slina', img:'assets/img/suspects/aleksandar_ilic.jpg' },
  { id:'nebojsa', name:'Nebojša Janković', role:'Knez', img:'assets/img/suspects/nebojsa_jankovic.jpg' },
 { id:'nenad', name:'Unknown Person', role:'Identity unknown', img:'assets/img/suspects/nn_lice.png' },
  { id:'danijel', name:'Danijel Ilić', role:'Waiter', img:'assets/img/suspects/danijel_ilic.jpg' },
  { id:'milan', name:'Milan Stojanović', role:'Restaurant owner', img:'assets/img/suspects/milan_stojanovic.jpg' },
  { id:'iva', name:'Iva Mitrović', role:'Associate', img:'assets/img/suspects/iva_mitrovic.jpg' }
];

const categories = [
  { id:'dokumenti', title:'Documents', required:1, icon:'📁' },
  { id:'izjave', title:'Statements and Interviews', required:4, icon:'🗣️' },
  { id:'telekom', title:'Telecommunications', required:1, icon:'📱' },
  { id:'video', title:'Surveillance Footage', required:3, icon:'🎥' },
  { id:'foto', title:'Photographs', required:1, icon:'📷' },
  { id:'forenzika', title:'Forensics / DNA', required:1, icon:'🧬' },
  { id:'dosijei', title:'Intelligence Files', required:1, icon:'🗂️' }
];

const state = {
  step: 0,
  confirmed: [false,false,false,false,false],
  selectedSuspect: null,
  files: Object.fromEntries(categories.map(c => [c.id, []])),
  categoryStatus: Object.fromEntries(categories.map(c => [c.id, 'empty']))
};

// Svaki poznati dokaz sme da pripada samo jednoj kategoriji.
// Ovo ne otkriva igraču skriveno rešenje, samo sprečava pogrešno razvrstavanje fajlova.
const evidenceRules = [
  { category:'dokumenti', patterns:[/uvi[dđ]jaj/i, /sluzbena|službena/i, /bele[sš]ka/i, /zapisnik.*uvi/i] },
  { category:'izjave', patterns:[/izjava/i, /saslu[sš]anje/i, /razgovor.*svedok/i, /danijel.*ili/i, /milan.*stojanovi/i] },
  { category:'telekom', patterns:[/prepiska/i, /poru[cč]nik/i, /listing/i, /poziv/i, /poruka/i, /telefon/i, /slina.*porucnik/i] },
  { category:'video', patterns:[/kamera/i, /cam/i, /video/i, /nadzor/i] },
  { category:'foto', patterns:[/fotograf/i, /slika/i, /pronadjen|pronađen/i, /telo/i, /mesto.*dogadj|mesto.*događ/i] },
  { category:'forenzika', patterns:[/obdukc/i, /dnk/i, /forenz/i, /balistik/i, /gsr/i, /ve[sš]ta[cč]enje/i] },
  { category:'dosijei', patterns:[/dosije/i, /sba/i, /aleksandar.*ili/i, /aco.*slina/i] }
];

function detectCategory(fileName){
  const normalized = fileName.toLowerCase();
  for(const rule of evidenceRules){
    if(rule.patterns.some(pattern => pattern.test(normalized))) return rule.category;
  }
  return null;
}

function fileAlreadyAdded(fileName){
  const target = fileName.toLowerCase();
  for(const cat of categories){
    if(state.files[cat.id].some(f => f.name.toLowerCase() === target)) return cat.id;
  }
  return null;
}

const screens = [...document.querySelectorAll('.screen')];
const stepButtons = [...document.querySelectorAll('.step')];
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const confirmBtn = document.getElementById('confirmBtn');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');

function toast(text){
  const t = document.getElementById('toast');
  t.textContent = text; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

function renderSuspects(){
  const grid = document.getElementById('suspectGrid');
  grid.innerHTML = suspects.map(s => `
    <article class="suspect-card ${state.selectedSuspect===s.id?'selected':''}" data-id="${s.id}">
      <div class="checkmark">✓</div>
      <img src="${s.img}" alt="${s.name}">
      <div class="suspect-role">${s.role}</div>
      <h4>${s.name}</h4>
      <p>Suspect in the Kaldrma restaurant case.</p>
    </article>
  `).join('');
  grid.querySelectorAll('.suspect-card').forEach(card => card.addEventListener('click', () => {
    state.selectedSuspect = card.dataset.id;
    state.confirmed[1] = false;
    renderSuspects(); updateUI(); toast('Suspect selected. Click Confirm.');
  }));
}

function renderEvidence(){
  const grid = document.getElementById('evidenceGrid');
  grid.innerHTML = categories.map(cat => {
    const count = state.files[cat.id].length;
    const complete = count >= cat.required;
    const wrong = state.categoryStatus[cat.id] === 'wrong';
    return `
      <article class="evidence-card ${complete?'complete':''} ${wrong?'wrong':''}" data-cat="${cat.id}">
        <div class="ev-head">
          <div class="ev-title">${cat.icon} ${cat.title}</div>
          <div class="counter">${Math.min(count, cat.required)}/${cat.required}</div>
        </div>
        <label class="drop">
          <input type="file" multiple data-cat="${cat.id}">
          <b>+ Add file</b><br><small>PDF, DOCX, JPG, PNG, MP4 or TXT</small>
        </label>
        ${wrong ? '<div class="category-warning">This evidence belongs in a different category.</div>' : ''}
        <div class="file-list">
          ${state.files[cat.id].map((file, i) => `
            <div class="file-item"><span>📎 ${file.name}</span><button class="remove-file" data-cat="${cat.id}" data-index="${i}">Remove</button></div>
          `).join('')}
        </div>
      </article>
    `;
  }).join('');
  grid.querySelectorAll('input[type=file]').forEach(input => input.addEventListener('change', e => {
    const cat = e.target.dataset.cat;
    const files = Array.from(e.target.files);
    let added = 0;
    let rejected = 0;

    for(const file of files){
      const existingCat = fileAlreadyAdded(file.name);
      const detectedCat = detectCategory(file.name);

      if(existingCat && existingCat !== cat){
        rejected++;
        state.categoryStatus[cat] = 'wrong';
        continue;
      }

      if(detectedCat && detectedCat !== cat){
        rejected++;
        state.categoryStatus[cat] = 'wrong';
        continue;
      }

      if(!state.files[cat].some(f => f.name.toLowerCase() === file.name.toLowerCase())){
        state.files[cat].push(file);
        added++;
      }
    }

    if(added > 0){
      state.categoryStatus[cat] = state.files[cat].length >= categories.find(c => c.id === cat).required ? 'complete' : 'partial';
      toast(added === 1 ? 'File added.' : 'Files added.');
    }
    if(rejected > 0){
      toast('This evidence is in the wrong category or has already been added.');
    }

    state.confirmed[2] = false;
    e.target.value = '';
    renderEvidence(); updateUI();
  }));
  grid.querySelectorAll('.remove-file').forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    state.files[cat].splice(Number(btn.dataset.index), 1);
    state.categoryStatus[cat] = state.files[cat].length ? 'partial' : 'empty';
    state.confirmed[2] = false;
    renderEvidence(); updateUI(); toast('File removed.');
  }));
}

function validateStep(step){
  if(step === 0) return document.getElementById('caseNumber').value.trim().length >= 3 || 'Enter the case number.';
  if(step === 1) return !!state.selectedSuspect || 'Select a suspect.';
  if(step === 2){
    const missing = categories.filter(c => state.files[c.id].length < c.required);
    return missing.length === 0 || 'Some evidence categories are incomplete.';
  }
  if(step === 3) return document.getElementById('motive').value.trim().length >= 8 || 'Enter the motive for the offence.';
  return true;
}

function confirmStep(){
  const valid = validateStep(state.step);
  if(valid === true){
    state.confirmed[state.step] = true;
    toast('Step confirmed.');
  } else {
    toast(valid);
  }
  updateUI();
}

function setStep(n){
  if(n < 0 || n >= screens.length) return;
  state.step = n;
  screens.forEach((s,i)=>s.classList.toggle('active', i===n));
  updateUI();
}

function updateUI(){
  stepButtons.forEach((b,i)=>{
    b.classList.toggle('active', i===state.step);
    b.classList.toggle('confirmed', !!state.confirmed[i]);
  });
  progressBar.style.width = `${((state.step+1)/screens.length)*100}%`;
  backBtn.disabled = state.step === 0;
  confirmBtn.style.display = state.step === 4 ? 'none' : '';
  nextBtn.style.display = state.step === 4 ? 'none' : '';
  nextBtn.disabled = !state.confirmed[state.step];
  if(state.step === 4){ statusText.textContent = 'The case is ready for court review.'; }
  else if(state.confirmed[state.step]){ statusText.textContent = 'Step confirmed. You can continue.'; }
  else { statusText.textContent = 'Fill in the information and click Confirm.'; }
}

function normalizeText(value){
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj');
}

function allPreviousStepsConfirmed(){
  return state.confirmed[0] && state.confirmed[1] && state.confirmed[2] && state.confirmed[3];
}

function submitIndictment(){
  const suspectOk = state.selectedSuspect === 'aleksandar';
  const motive = normalizeText(document.getElementById('motive').value);

const motiveKeywords = [
  'development land', 'building land', 'construction land', 'building plot',
  'construction site', 'building site', 'plot of land', 'land parcel',
  'real estate', 'property',
  'gradjevinsko zemljiste',
  'gradjevinskog zemljista',
  'gradjevinskom zemljistu',
  'gradjevinska parcela',
  'gradjevinske parcele',
  'gradjevinskoj parceli',
  'zemljiste za izgradnju',
  'plac za izgradnju',
  'plac',
  'placevi',
  'placa',
  'placu',
  'imanje',
  'imanja',
  'imanju',
  'gradiliste',
  'gradilista',
  'gradilistu',
  'gradjevina',
  'gradjevine',
  'gradjevini',
  'zemljiste',
  'zemljista',
  'zemljistu',
  'parcela',
  'parcele',
  'parceli',
  'nekretnina',
  'nekretnine',
  'nekretnini'
];
 const motiveOk = motiveKeywords.some(keyword => motive.includes(keyword));
  const evidenceOk = categories.every(c => state.files[c.id].length >= c.required);
  const noWrongCategory = categories.every(c => state.categoryStatus[c.id] !== 'wrong');
  const stepsOk = allPreviousStepsConfirmed();
  const text = document.getElementById('verdictText');

  text.classList.add('checking');
  text.innerHTML = `
    <b>Judge Ljiljana Marković is reviewing the case.</b><br>
    The court is checking the completeness of the case, the selected suspect, the evidence categories and the stated motive.
  `;

  setTimeout(()=>{
    text.classList.remove('checking');

    if(stepsOk && suspectOk && motiveOk && evidenceOk && noWrongCategory){
      text.innerHTML = `
        <b>INDICTMENT ACCEPTED.</b><br>
        The court finds that the indictment is complete, the evidence is correctly classified and the stated motive is consistent with the facts of the case.
      `;
      toast('Indictment accepted.');
      state.confirmed[4] = true;
      const submitBtn = document.getElementById('submitIndictment');
      submitBtn.textContent = 'Continue to the verdict';
      submitBtn.onclick = openEpilogue;
      return;
    }

    let explanation = 'The court finds that the proposed indictment does not meet the requirements for approval.';

    if(!stepsOk){
      explanation = 'Some earlier steps have yet to be confirmed.';
    } else if(!evidenceOk || !noWrongCategory){
      explanation = 'The evidence is incomplete or some of it is in the wrong category.';
    } else if(!suspectOk || !motiveOk){
      explanation = 'The evidence is complete, but the selected suspect or stated motive is insufficiently supported by the facts and evidence.';
    }

    text.innerHTML = `
      <b>INDICTMENT REJECTED.</b><br>
      ${explanation}<br><br>
      The case is returned to the public prosecutor for further work and review.
    `;
    toast('Indictment rejected.');
  }, 1800);
}

stepButtons.forEach(btn => btn.addEventListener('click', () => setStep(Number(btn.dataset.step))));
backBtn.addEventListener('click', () => setStep(state.step-1));
nextBtn.addEventListener('click', () => setStep(state.step+1));
confirmBtn.addEventListener('click', confirmStep);
document.getElementById('submitIndictment').addEventListener('click', submitIndictment);
document.getElementById('caseNumber').addEventListener('input', () => { state.confirmed[0]=false; updateUI(); });
document.getElementById('motive').addEventListener('input', () => { state.confirmed[3]=false; updateUI(); });
renderSuspects(); renderEvidence(); updateUI();


function addChatMessage(who, text, cls){
  const thread = document.getElementById('chatThread');
  const div = document.createElement('div');
  div.className = `message ${cls}`;
  div.innerHTML = `<b>${who}</b><p>${text}</p>`;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function setEpilogueAction(label, handler){
  const wrap = document.getElementById('epilogueActions');
  wrap.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'primary';
  btn.textContent = label;
  btn.addEventListener('click', handler);
  wrap.appendChild(btn);
}

function openEpilogue(){
  const overlay = document.getElementById('epilogueOverlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  document.getElementById('chatThread').innerHTML = '<div class="message milica"><b>Milica</b><p>Nikola… is it over?</p></div>';
  setEpilogueAction('The verdict is in.', epilogueStepTwo);
}

function epilogueStepTwo(){
  addChatMessage('Nikola', 'The verdict is in. The evidence was accepted.', 'nikola');
  setEpilogueAction('Nastavi', () => {
    addChatMessage('Milica', 'I kept quiet for months to protect the investigation. If the court has done its part, there’s no reason to keep the truth hidden.', 'milica');
    setEpilogueAction('Publish everything.', epiloguePublish);
  });
}

function epiloguePublish(){
  addChatMessage('Nikola', 'Publish everything.', 'nikola');
  setEpilogueAction('Open the article', () => {
    addChatMessage('Milica', 'I’m publishing tonight. Whatever happens now, they can’t make the evidence disappear. Thank you, Nikola.', 'milica');
    setTimeout(() => { window.location.href = 'blog/index.html?epilog=1'; }, 1800);
  });
}

document.getElementById('closeEpilogue').addEventListener('click', () => {
  document.getElementById('epilogueOverlay').classList.remove('open');
  document.body.classList.remove('modal-open');
});
