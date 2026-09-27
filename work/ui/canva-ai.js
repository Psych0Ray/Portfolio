/* Canva AI: the redesign's key moment, replayed in the rebuilt editor.
   The words are the prototype's own, from the recording (work/vid/canva-ai.mp4, 0:24 to 0:34):
   the user's "monotonous" message, Orb's diagnosis, "Yes please.", and the rearranged poster.
   "scanning design..." with the sheen over the poster is the redesign's processing state
   (deck frame 2001:1887). Send is the only input: this is a demonstration of one real
   conversation, so the field does not pretend to take anything else. */
(function () {
  var ui = document.getElementById('cva');
  if (!ui) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var chat = ui.querySelector('.cv-chat'), input = ui.querySelector('.cv-input input'), send = ui.querySelector('.send');
  var replay = document.querySelector('.cv-replay');
  var thumb = ui.querySelector('.cv-pages .thumb img');
  var FIRST = 'I am all out of content to put and this poster still feels monotonous.';
  var DIAG = 'Align the heading to the left. Move the date and venue further down the bottom to the left. That keeps the expo name bold and clear. Entry price can be moved further down. Want me to show you how?';
  var YES = 'Yes please.';
  var DONE = 'Here’s the result! Is there something else you need?';
  var step = 0, timers = [];

  function wait(ms, fn) { timers.push(setTimeout(fn, reduced ? 0 : ms)); }
  function say(cls, text) {
    var p = document.createElement('p');
    p.className = cls + ' in';
    p.textContent = text;
    chat.appendChild(p);
    while (chat.children.length > 4) chat.removeChild(chat.firstChild);
    return p;
  }

  function reset() {
    timers.forEach(clearTimeout); timers = [];
    step = 0;
    chat.innerHTML = '<p class="ai old">Applied. The heading and subheadings now use the same font styles as previous projects for consistency. Anything else?</p>';
    ui.classList.remove('after', 'scan');
    ui.classList.add('ready');
    thumb.src = 'ui/canva/poster-a.webp';
    input.value = FIRST;
    send.disabled = false;
    if (replay) replay.hidden = true;
  }

  send.addEventListener('click', function () {
    if (send.disabled) return;
    ui.classList.remove('ready');
    send.disabled = true;
    if (step === 0) {
      step = 1;
      say('me', FIRST);
      input.value = '';
      var status;
      wait(500, function () { ui.classList.add('scan'); status = say('status', 'scanning design...'); });
      wait(2300, function () {
        ui.classList.remove('scan');
        if (status) status.remove();
        say('ai', DIAG);
        input.value = YES;
        send.disabled = false;
        ui.classList.add('ready');
      });
    } else if (step === 1) {
      step = 2;
      say('me', YES);
      input.value = '';
      wait(700, function () { ui.classList.add('after'); thumb.src = 'ui/canva/poster-b.webp'; });
      wait(1500, function () {
        say('ai', DONE);
        if (replay) replay.hidden = false;
      });
    }
  });
  if (replay) replay.addEventListener('click', reset);

  reset();
  if (window.LUCIDE) window.LUCIDE(ui);
  if (window.FIT_STAGES) window.FIT_STAGES();
})();

/* the redesign, step by step: pressing a step shows its frame from the recording and opens its
   explanation; the arrow keys move between steps */
(function () {
  var box = document.querySelector('[data-steps]');
  if (!box) return;
  var btns = [].slice.call(box.querySelectorAll('[data-step]'));
  var imgs = [].slice.call(box.querySelectorAll('.cv-steps-view img'));
  function show(i) {
    btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
  }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { show(i); });
    b.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? i - 1 : -1;
      if (j < 0 || j >= btns.length) return;
      e.preventDefault(); show(j); btns[j].focus();
    });
  });
})();
