const title = document.querySelector('#p-title');
const number = document.querySelector('#p-number');
const current = document.querySelector('#p-current');
const next = document.querySelector('#p-next');
const notes = document.querySelector('#p-notes');
const timer = document.querySelector('#p-timer');
const reset = document.querySelector('#p-reset');
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('translanguaging-presenter') : null;
let start = performance.now();

function render(state) {
  if (!state) return;
  title.textContent = `${state.section || 'Presentation'} · ${state.title}`;
  number.textContent = state.number;
  current.textContent = state.title;
  next.textContent = state.nextTitle;
  notes.textContent = state.notes;
}

channel?.addEventListener('message', e => {
  if (e.data?.type === 'state') render(e.data.payload);
});
channel?.postMessage({ type: 'request-state' });
try { render(JSON.parse(localStorage.getItem('translanguaging-presenter-state'))); } catch {}

function updateTimer() {
  const elapsed = Math.max(0, performance.now() - start);
  const total = Math.floor(elapsed / 1000);
  const min = String(Math.floor(total / 60)).padStart(2,'0');
  const sec = String(total % 60).padStart(2,'0');
  timer.textContent = `${min}:${sec}`;
  requestAnimationFrame(updateTimer);
}
reset.addEventListener('click', () => { start = performance.now(); });
updateTimer();
