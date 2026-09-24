const slides = [...document.querySelectorAll('.slide')];
const prevBtn = document.querySelector('#prevBtn');
const nextBtn = document.querySelector('#nextBtn');
const slideCounter = document.querySelector('#slideCounter');
const slideTitle = document.querySelector('#slideTitle');
const progressBar = document.querySelector('#progressBar');
const menuBtn = document.querySelector('#menuBtn');
const closeMenuBtn = document.querySelector('#closeMenuBtn');
const menuPanel = document.querySelector('#menuPanel');
const menuScrim = document.querySelector('#menuScrim');
const sectionNav = document.querySelector('#sectionNav');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
const restartBtn = document.querySelector('#restartBtn');
const restartEndBtn = document.querySelector('#restartEndBtn');
const presenterBtn = document.querySelector('#presenterBtn');
const menuPresenterBtn = document.querySelector('#menuPresenterBtn');

let index = 0;
let touchStartX = 0;
let touchStartY = 0;
const revealedCount = new Map();
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('translanguaging-presenter') : null;

function stepsFor(slide = slides[index]) {
  return [...slide.querySelectorAll('.step')];
}

function revealThrough(slide, count) {
  const steps = stepsFor(slide);
  steps.forEach((el, i) => el.classList.toggle('is-revealed', i < count));
  revealedCount.set(slides.indexOf(slide), Math.min(count, steps.length));
}

function initialRevealCount(slide) {
  // Keep slides visually anchored: reveal the first step on entry.
  return Math.min(2, stepsFor(slide).length);
}

function enterSlide(newIndex, { preserve = false } = {}) {
  newIndex = Math.max(0, Math.min(slides.length - 1, newIndex));
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === newIndex);
    slide.setAttribute('aria-hidden', i === newIndex ? 'false' : 'true');
  });
  index = newIndex;
  const slide = slides[index];
  if (!preserve) revealThrough(slide, revealedCount.get(index) ?? initialRevealCount(slide));
  slide.scrollTop = 0;
  updateChrome();
  broadcastState();
  history.replaceState(null, '', `#slide-${index + 1}`);
}

function revealNext() {
  const slide = slides[index];
  const steps = stepsFor(slide);
  const count = revealedCount.get(index) ?? initialRevealCount(slide);
  if (count < steps.length) {
    revealThrough(slide, count + 1);
    broadcastState();
    return true;
  }
  return false;
}

function hidePreviousStep() {
  const slide = slides[index];
  const count = revealedCount.get(index) ?? initialRevealCount(slide);
  if (count > initialRevealCount(slide)) {
    revealThrough(slide, count - 1);
    return true;
  }
  return false;
}

function goNext() {
  if (!revealNext() && index < slides.length - 1) enterSlide(index + 1);
}

function goPrev() {
  if (!hidePreviousStep() && index > 0) enterSlide(index - 1, { preserve: true });
}

function updateChrome() {
  const number = String(index + 1).padStart(2, '0');
  const total = String(slides.length).padStart(2, '0');
  slideCounter.textContent = `${number} / ${total}`;
  slideTitle.textContent = slides[index].dataset.title || '';
  progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
  prevBtn.disabled = index === 0 && (revealedCount.get(index) ?? 1) <= 1;
  nextBtn.setAttribute('aria-label', index === slides.length - 1 ? 'Reveal next step' : 'Next step or slide');
  document.title = `${number} · ${slides[index].dataset.title} · Translanguaging`;
}

function getSlideState(i = index) {
  const slide = slides[i];
  const notes = slide.querySelector('.speaker-notes')?.textContent.trim() || 'No speaker notes for this slide.';
  return {
    index: i,
    number: `${i + 1} / ${slides.length}`,
    title: slide.dataset.title || `Slide ${i + 1}`,
    section: slide.dataset.section || '',
    notes,
    nextTitle: slides[i + 1]?.dataset.title || 'End of presentation'
  };
}

function broadcastState() {
  channel?.postMessage({ type: 'state', payload: getSlideState() });
  try { localStorage.setItem('translanguaging-presenter-state', JSON.stringify(getSlideState())); } catch {}
}

function openPresenter() {
  const w = window.open('./presenter.html', 'translanguagingPresenter', 'width=1100,height=760');
  if (w) setTimeout(broadcastState, 500);
}

function buildSectionNav() {
  const seen = new Set();
  slides.forEach((slide, i) => {
    const section = slide.dataset.section || 'Section';
    if (seen.has(section)) return;
    seen.add(section);
    const firstIndex = slides.findIndex(s => s.dataset.section === section);
    const count = slides.filter(s => s.dataset.section === section).length;
    const btn = document.createElement('button');
    btn.innerHTML = `<span>${section}</span><span>${count} slide${count > 1 ? 's' : ''}</span>`;
    btn.addEventListener('click', () => { enterSlide(firstIndex); closeMenu(); });
    sectionNav.append(btn);
  });
}

function openMenu() {
  menuPanel.classList.add('open');
  menuPanel.setAttribute('aria-hidden', 'false');
  menuBtn.setAttribute('aria-expanded', 'true');
  menuScrim.hidden = false;
  closeMenuBtn.focus();
}
function closeMenu() {
  menuPanel.classList.remove('open');
  menuPanel.setAttribute('aria-hidden', 'true');
  menuBtn.setAttribute('aria-expanded', 'false');
  menuScrim.hidden = true;
}

function restart() {
  revealedCount.clear();
  slides.forEach(slide => revealThrough(slide, 0));
  enterSlide(0);
  closeMenu();
}

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {}
}

function isTypingTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
}

prevBtn.addEventListener('click', goPrev);
nextBtn.addEventListener('click', goNext);
menuBtn.addEventListener('click', openMenu);
closeMenuBtn.addEventListener('click', closeMenu);
menuScrim.addEventListener('click', closeMenu);
fullscreenBtn.addEventListener('click', toggleFullscreen);
restartBtn.addEventListener('click', restart);
restartEndBtn?.addEventListener('click', restart);
presenterBtn.addEventListener('click', openPresenter);
menuPresenterBtn.addEventListener('click', openPresenter);

window.addEventListener('keydown', (e) => {
  if (isTypingTarget(e.target)) return;
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goNext(); }
  else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goPrev(); }
  else if (e.key.toLowerCase() === 'f') toggleFullscreen();
  else if (e.key.toLowerCase() === 'p') openPresenter();
  else if (e.key.toLowerCase() === 'm') menuPanel.classList.contains('open') ? closeMenu() : openMenu();
  else if (e.key === 'Escape' && menuPanel.classList.contains('open')) closeMenu();
});

window.addEventListener('touchstart', e => {
  if (e.target.closest('button, a, [role="tab"]')) return;
  touchStartX = e.changedTouches[0].clientX;
  touchStartY = e.changedTouches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', e => {
  if (!touchStartX) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  touchStartX = 0; touchStartY = 0;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.35) dx < 0 ? goNext() : goPrev();
}, { passive: true });

// Interactive benefits.
document.querySelectorAll('.benefit-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.benefit-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelector('#benefitDetail').textContent = btn.dataset.benefit;
  });
});

// Strategy tiles jump into the lab with the chosen tab active.
document.querySelectorAll('.strategy-tile').forEach(btn => {
  btn.addEventListener('click', () => {
    const labIndex = slides.findIndex(s => s.dataset.title === 'Strategy lab');
    enterSlide(labIndex);
    revealThrough(slides[labIndex], stepsFor(slides[labIndex]).length);
    activateStrategy(btn.dataset.strategy);
  });
});

const strategies = {
  think: { n:'STRATEGY 01', title:'Think in Filipino, Write in English', body:'Reason or jot initial ideas in Filipino, then transform the thinking into an English response.', use:'writing · reflection · analysis', visual:['IDEA','FILIPINO','ENGLISH OUTPUT'] },
  brainstorm: { n:'STRATEGY 02', title:'Bilingual Brainstorming', body:'Generate ideas using any familiar language before organizing the strongest ideas in English.', use:'prewriting · problem-solving', visual:['IDEAS','ANY FAMILIAR LANGUAGE','ORGANIZE IN ENGLISH'] },
  vocab: { n:'STRATEGY 03', title:'Multilingual Vocabulary Wall', body:'Display key terms with learner-generated equivalents, explanations, examples, and visuals.', use:'academic vocabulary', visual:['KEY TERM','EQUIVALENTS','EXAMPLES + VISUALS'] },
  peer: { n:'STRATEGY 04', title:'Peer Discussion', body:'Allow flexible language use during complex reasoning, followed by a target-language synthesis.', use:'interpretation · debate', visual:['REASON TOGETHER','FLEXIBLE LANGUAGE','ENGLISH SYNTHESIS'] },
  reading: { n:'STRATEGY 05', title:'Reading Support', body:'Use bilingual annotation, paraphrasing, glossaries, and familiar-language discussion.', use:'difficult texts', visual:['ANNOTATE','PARAPHRASE / GLOSS','DISCUSS'] }
};
function activateStrategy(key) {
  const s = strategies[key]; if (!s) return;
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === key)));
  document.querySelector('#strategyNumber').textContent = s.n;
  document.querySelector('#strategyTitle').textContent = s.title;
  document.querySelector('#strategyBody').textContent = s.body;
  document.querySelector('#strategyUse').textContent = s.use;
  document.querySelector('#strategyVisual').innerHTML = s.visual.map((v,i) => `${i ? '<i>→</i>' : ''}<span>${v}</span>`).join('');
}
document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => activateStrategy(btn.dataset.tab)));

// Flip misconception cards.
document.querySelectorAll('.flip-card').forEach(card => card.addEventListener('click', () => {
  card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true'));
}));

// Quiz interactions.
const quizRationales = {
  q1: 'Think Filipino → Write English creates a bridge: the learner develops the idea using a familiar linguistic resource, then transforms that thinking into the required English output. The learning objective remains intact.',
  q2: 'The source speaker notes identify a multilingual vocabulary wall as the strongest move: it can surface language for motivation, emotion, and behavior, then connect those meanings to evidence in the English text.',
  q3: 'Flexible peer discussion can support complex reasoning; the group can then synthesize the agreed interpretation into an English evidence-based report.'
};
document.querySelectorAll('[data-quiz]').forEach(group => {
  const feedback = group.parentElement.querySelector('.quiz-feedback');
  group.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => {
    group.querySelectorAll('button').forEach(b => b.classList.remove('selected','correct','incorrect'));
    btn.classList.add('selected');
    const correct = btn.dataset.correct === 'true';
    btn.classList.add(correct ? 'correct' : 'incorrect');
    feedback.classList.remove('good','try');
    feedback.classList.add(correct ? 'good' : 'try');
    feedback.textContent = correct ? `✓ ${quizRationales[group.dataset.quiz]}` : 'Not the source deck’s strongest move. Try another option, then compare the rationale.';
  }));
});

// Reflection prompts.
const reflectionText = {
  before:'Before the task: consider bilingual brainstorming or a multilingual vocabulary wall.',
  during:'During thinking: consider Think in Filipino → Write in English.',
  discussion:'During discussion: consider flexible peer discussion before an English synthesis.',
  output:'Before final output: use a language bridge, then return to the required target-language response.'
};
document.querySelectorAll('[data-reflect]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-reflect]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelector('#reflectionResponse').textContent = reflectionText[btn.dataset.reflect];
}));

channel?.addEventListener('message', e => {
  if (e.data?.type === 'request-state') broadcastState();
});

buildSectionNav();
const hashMatch = location.hash.match(/slide-(\d+)/);
if (hashMatch) index = Math.max(0, Math.min(slides.length - 1, Number(hashMatch[1]) - 1));
slides.forEach((slide, i) => revealThrough(slide, i === index ? initialRevealCount(slide) : 0));
enterSlide(index, { preserve: true });
setTimeout(broadcastState, 250);
