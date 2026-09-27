/* Relique: the Featured Artifacts row and the My Story viewer, working.
   Hovering the armour card turns it white and offers My story (0:50 in the walkthrough);
   My story opens the armour's title card (1:06): its museum, age and place, its key frames and
   Start Story. Start Story, or any key frame, opens the seven-part narration (1:20 to 4:30),
   word for word.
   In four of the scenes, a person or object opens its own card, as in the prototype:
   Emperor Akbar, the Emperor's Sword, Raja Man Singh I and Akbar's Sparring Set. */
(function () {
  var ui = document.getElementById('rlq');
  if (!ui) return;
  var home = ui.querySelector('.rl-home'), story = ui.querySelector('.rl-story');
  var imgs = ui.querySelector('.rl-imgs'), text = ui.querySelector('.rl-text'), hot = ui.querySelector('.rl-hot');
  var bars = [].slice.call(ui.querySelectorAll('.rl-bars i'));
  var prev = ui.querySelector('[data-prev]'), next = ui.querySelector('[data-next]');
  var card = ui.querySelector('.rl-card.live');
  var ov = ui.querySelector('.rl-ov');

  var FRAMES = [
    { t: 'Forged in 1581 CE under Emperor Akbar’s command, I was a steel cuirass adorned with gold damascene and Quranic inscriptions. My high-neck collar shielded his throat, while my contours mirrored his form. More than armor, I embodied divine protection, imperial authority, and the unmatched craftsmanship of Mughal artisans.',
      spot: { l: 47, t: 4, w: 27, h: 78, n: 'Emperor Akbar', p: 'Emperor Akbar (1542–1605), the third Mughal emperor, was a visionary ruler known for his military conquests, administrative reforms, and promotion of cultural and religious harmony. . .', cl: 7.9, ct: 13.2 } },
    { t: 'Before earning my place, I endured Akbar’s rigorous trials—sword strikes, arrow pierces, and crushing blows. My steel held firm, my gold damascene remained pristine, and my high water marks reflected Mughal precision. More than ornamentation, I was the chosen armor of an emperor who demanded nothing less than perfection.' },
    { t: 'I debuted in Akbar’s North Indian campaign, shielding his chest, back, and throat from enemy strikes. Quranic inscriptions offered spiritual protection as I gleamed under the sun. With unmatched strategy and valor, Akbar led his army to victory, and together, we shaped the expanding might of the Mughal Empire.',
      spot: { l: 48, t: 1, w: 15, h: 26, n: 'Emperor’s Sword', p: 'Akbar’s sword was a finely crafted weapon with curved blade, intricate engravings, and ornate hilt, symbolizing Mughal strength, valor, and royal authority in battles and ceremonies . . .', cl: 16, ct: 12 } },
    { t: 'Beyond battle, I graced Akbar’s courts and diplomatic missions, symbolizing his authority and divine favor. Nobles marveled at my koftgari arm guards and my helmet’s golden spike. Every detail—crafted with precision—whispered of an emperor who saw beauty in war’s armor and valued artistry as much as conquest.' },
    { t: 'After Akbar’s reign, I was carefully preserved as part of his legacy. The dents and scratches I bore from countless battles became stories etched into my steel. I rested in royal collections, a relic of an era that shaped India’s history. My gold damascene remained radiant, a testament to the skill of Mughal artisans.',
      spot: { l: 43, t: 8, w: 17, h: 40, n: 'Raja Man Singh I', p: 'Raja Man Singh I was a trusted commander in Akbar’s army, leading many successful campaigns. He played a crucial role in expanding the Mughal Empire and ensuring . . .', cl: 62.6, ct: 16.8 } },
    { t: 'In Akbar’s pursuit of harmony, I witnessed history unfold. As he met religious leaders in his Ibadat Khana, I rested beside him. My Quranic inscriptions and intricate Mughal craftsmanship embodied the fusion of faith and culture, reflecting the visionary empire Akbar sought—where diversity thrived under his enlightened rule.' },
    { t: 'Now part of the Sir Ratan Tata Art Collection, I am a testament to Akbar’s vision. My intricate Mughal craftsmanship and Quranic inscriptions reflect a prosperous, united empire where faith and culture blended. A symbol of diversity, I continue to inspire through Akbar’s enlightened rule and enduring legacy.',
      spot: { l: 27, t: 26, w: 30, h: 52, n: 'Akbar’s Sparring Set', p: 'Akbar’s sparring set was likely custom-made, adorned with Mughal craftsmanship, and designed for both training , and demonstration. His court...', cl: 67.1, ct: 9.2 } }
  ];
  var at = 0, built = false;

  function build() {
    if (built) return;
    built = true;
    FRAMES.forEach(function (f, i) {
      var im = new Image();
      im.src = 'ui/relique/story-' + (i + 1) + '.webp';
      im.width = 1200; im.height = 536; im.alt = ''; im.decoding = 'async';
      imgs.appendChild(im);
    });
  }

  function show(i) {
    at = Math.max(0, Math.min(FRAMES.length - 1, i));
    [].forEach.call(imgs.children, function (im, k) { im.classList.toggle('on', k === at); });
    bars.forEach(function (b, k) { b.classList.toggle('on', k === at); });
    text.textContent = FRAMES[at].t;
    text.classList.remove('in'); void text.offsetWidth; text.classList.add('in');
    prev.hidden = at === 0;
    next.hidden = at === FRAMES.length - 1;
    var s = FRAMES[at].spot;
    hot.innerHTML = s ? '<span class="rl-spot" tabindex="0" role="button" aria-label="' + s.n + '" style="left:' + s.l + '%;top:' + s.t + '%;width:' + s.w + '%;height:' + s.h + '%"></span>' +
      '<div class="rl-pop" style="left:' + s.cl + '%;top:' + s.ct + '%"><b>' + s.n + '</b><p>' + s.p + '</p><span>Discover the story</span></div>' : '';
    var spot = hot.querySelector('.rl-spot'), pop = hot.querySelector('.rl-pop');
    if (spot) {
      var on = function () { pop.classList.add('on'); }, off = function () { pop.classList.remove('on'); };
      spot.addEventListener('mouseenter', on); spot.addEventListener('focus', on);
      spot.addEventListener('mouseleave', off); spot.addEventListener('blur', off);
      spot.addEventListener('click', function () { pop.classList.toggle('on'); });
    }
  }

  function card0() {
    ov.hidden = false;
    ov.querySelector('[data-start]').focus({ preventScroll: true });
  }
  function uncard() {
    ov.hidden = true;
    card.focus({ preventScroll: true });
  }
  function open(i) {
    build();
    ov.hidden = true; home.hidden = true; story.hidden = false;
    show(i || 0);
    next.focus({ preventScroll: true });
    if (window.FIT_STAGES) window.FIT_STAGES();
  }
  function close() {
    story.hidden = true; home.hidden = false;
    card.classList.remove('on');
    if (window.FIT_STAGES) window.FIT_STAGES();
    card.focus({ preventScroll: true });
  }

  ui.addEventListener('click', function (e) {
    if (e.target.closest('[data-open]')) { card0(); return; }
    if (e.target.closest('[data-start]')) { open(0); return; }
    var kf = e.target.closest('[data-kf]');
    if (kf) { open(+kf.getAttribute('data-kf')); return; }
    if (e.target.closest('[data-ovclose]')) { uncard(); return; }
    if (e.target.closest('[data-next]')) { show(at + 1); if (next.hidden) prev.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-prev]')) { show(at - 1); if (prev.hidden) next.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-close]')) { close(); return; }
    /* a tap on the card (touch has no hover) turns it over first */
    if (e.target.closest('.rl-card.live') && !card.classList.contains('on')) card.classList.add('on');
  });
  card.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target === card) card0(); });
  ui.addEventListener('keydown', function (e) {
    if (!ov.hidden && e.key === 'Escape') { uncard(); return; }
    if (story.hidden) return;
    if (e.key === 'ArrowRight') { show(at + 1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { show(at - 1); e.preventDefault(); }
    else if (e.key === 'Escape') close();
  });
})();
