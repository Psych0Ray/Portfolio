/* ULS: the interactive parts of the rebuilt screens.

   Foreman console: the three tabs switch, attendance and payments can be marked and the
   counts follow, and the whole console switches between English and Hindi, because the
   deck designs it in both (Hindi first, for foremen on site). Every string below is the
   deck's own, from the English frames 2265:5100/5462/5323 and the Hindi frames
   2265:4758/4605/4929. Names and trades stay in English in both, as they do in the deck.

   Contractor dashboard: Ramesh Kumar's row opens and closes, and Hire Now hires him. */
(function () {
  var root = document.getElementById('uf');
  var U = 'ui/uls/';

  var T = {
    en: { title: 'Foreman Console', sub: 'Site Management', sync: 'Synced 2 min ago',
      present: 'Present', pending: 'Pending', absent: 'Absent', tabs: ['Attendance', 'Assign Work', 'Payments'],
      markH: 'Mark Attendance', ok: 'Present', no: 'Marked Absent', yes: 'Mark Present', nah: 'Mark Absent',
      totalK: 'Total Pending Today', waiting: function (n) { return n + ' workers awaiting payment'; },
      payH: 'Today’s Payments', due: 'Pending', paid: 'Paid', markPaid: 'Mark as Paid', remind: 'Send Reminder',
      payAll: 'Process All Pending Payments', areasH: 'Work Areas', newTask: '+ New Task',
      assigned: function (n) { return n + ' workers assigned'; }, ongoing: 'ongoing', waitChip: 'pending',
      view: 'View Details', assign: 'Assign Workers', need: 'Need more workers?', request: 'Request Workers from Naka',
      nav: ['Dashboard', 'Schedule', 'Workers'] },
    hi: { title: 'फोरमैन कंसोल', sub: 'साइट प्रबंधन', sync: 'सिंक किया 2 min ago',
      present: 'उपस्थित', pending: 'बकाया', absent: 'अनुपस्थित', tabs: ['उपस्थिति', 'कार्य सौंपें', 'भुगतान'],
      markH: 'उपस्थिति दर्ज करें', ok: 'उपस्थित', no: 'अनुपस्थित चिन्हित', yes: 'उपस्थित करें', nah: 'अनुपस्थित करें',
      totalK: 'आज का कुल बकाया', waiting: function (n) { return n + ' मज़दूर भुगतान की प्रतीक्षा में'; },
      payH: 'आज के भुगतान', due: 'बकाया', paid: 'भुगतान हो गया', markPaid: 'भुगतान किया चिन्हित करें', remind: 'रिमाइंडर भेजें',
      payAll: 'सभी बकाया भुगतान करें', areasH: 'कार्य क्षेत्र', newTask: '+ नया कार्य',
      assigned: function (n) { return n + ' मज़दूर नियुक्त'; }, ongoing: 'चल रहा है', waitChip: 'बकाया',
      view: 'विवरण देखें', assign: 'मज़दूर सौंपें', need: 'और मज़दूर चाहिए?', request: 'नाके से मज़दूर मंगाएं',
      nav: ['डैशबोर्ड', 'शेड्यूल', 'मज़दूर'] }
  };

  var crew = [
    { n: 'Ramesh Kumar', job: 'Mason', wage: 750, s: 'present', at: '07:30 AM', img: 'av-ramesh.jpg' },
    { n: 'Prakash Sharma', job: 'Plumber', wage: 680, s: 'pending', img: 'av-ramesh.jpg' },
    { n: 'Sunita Devi', job: 'Helper', wage: 500, s: 'present', at: '07:45 AM', img: 'av-sunita.jpg' },
    { n: 'Vijay Singh', job: 'Carpenter', wage: 700, s: 'absent', img: 'av-vijay.jpg' },
    { n: 'Amit Patel', job: 'Electrician', wage: 800, s: 'present', at: '07:20 AM', img: 'av-amit.jpg' }
  ];
  var pay = [
    { n: 'Ramesh Kumar', amt: 750, paid: false },
    { n: 'Sunita Devi', amt: 500, paid: false },
    { n: 'Amit Patel', amt: 800, paid: true }
  ];
  var areas = [
    { n: 'Floor 1 - Masonry', c: 3, on: true },
    { n: 'Floor 2 - Electrical', c: 2, on: true },
    { n: 'Floor 3 - Plumbing', c: 1, on: false }
  ];
  var lang = 'en', tab = 0, fresh = null;

  function img(f, w, cls) { return '<img class="ico' + (cls ? ' ' + cls : '') + '" src="' + U + f + '" width="' + w + '" height="' + w + '" alt="">'; }
  function rs(n) { return '₹' + n.toLocaleString('en-IN'); }
  function now() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes(), ap = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  function counts() {
    var c = { present: 0, pending: 0, absent: 0 };
    crew.forEach(function (w) { c[w.s]++; });
    return c;
  }

  function attendance(t) {
    return '<div class="uf-h"><h4>' + t.markH + '</h4><span>7 Apr</span></div><div class="uf-list">' +
      crew.map(function (w, i) {
        var state;
        if (w.s === 'present') state = '<button type="button" class="uf-ok" data-undo="' + i + '"' + (w.undo ? '' : ' disabled') + '><span>' +
          img('f-check.svg', 17.5) + t.ok + '</span><time>' + w.at + '</time></button>';
        else if (w.s === 'absent') state = '<button type="button" class="uf-no" data-undo="' + i + '"' + (w.undo ? '' : ' disabled') + '>' + t.no + '</button>';
        else state = '<div class="uf-pair"><button type="button" class="yes" data-mark="' + i + '">' + t.yes +
          '</button><button type="button" class="nah" data-miss="' + i + '">' + t.nah + '</button></div>';
        return '<div class="uf-w' + (fresh === i ? ' uf-enter' : '') + '"><div class="uf-who"><img src="' + U + w.img + '" alt="" width="42" height="42">' +
          '<div class="n">' + w.n + '<small>' + w.job + ' • ' + rs(w.wage) + '/day</small></div></div>' + state + '</div>';
      }).join('') + '</div>';
  }

  function payments(t) {
    var due = pay.filter(function (p) { return !p.paid; });
    var total = due.reduce(function (s, p) { return s + p.amt; }, 0);
    return '<div class="uf-total"><small>' + t.totalK + '</small><b>' + rs(total) + '</b><small>' + t.waiting(due.length) + '</small></div>' +
      '<div class="uf-h"><h4 class="lg">' + t.payH + '</h4></div><div class="uf-list">' +
      pay.map(function (p, i) {
        var tag = p.paid ? '<span class="uf-tag paid">' + img('f-check.svg', 17.5) + t.paid + '</span>'
                         : '<span class="uf-tag due">' + img('f-clock.svg', 17.5) + t.due + '</span>';
        var btns = p.paid ? '' : '<div class="uf-pair"><button type="button" class="paidbtn" data-pay="' + i + '">' + t.markPaid +
          '</button><button type="button" class="nah">' + t.remind + '</button></div>';
        return '<div class="uf-pay' + (fresh === 'p' + i ? ' uf-enter' : '') + '"><div class="top"><div class="n">' + p.n + '<b>' + rs(p.amt) + '</b></div>' + tag + '</div>' + btns + '</div>';
      }).join('') + '</div>' +
      '<button type="button" class="uf-big" data-payall' + (due.length ? '' : ' disabled') + '>' + t.payAll + '</button>';
  }

  function assign(t) {
    return '<div class="uf-h"><h4 class="lg">' + t.areasH + '</h4><button type="button" class="new">' + t.newTask + '</button></div>' +
      '<div class="uf-list">' + areas.map(function (a) {
        return '<div class="uf-area"><div class="top"><div class="n">' + a.n + '<small>' + img('f-users-sm.svg', 14) + t.assigned(a.c) + '</small></div>' +
          '<span class="uf-chip ' + (a.on ? 'on">' + t.ongoing : 'wait">' + t.waitChip) + '</span></div>' +
          '<div class="uf-pair"><button type="button" class="v">' + t.view + '</button><button type="button" class="a">' + t.assign + '</button></div></div>';
      }).join('') +
      '<div class="uf-more">' + img('f-users-lg.svg', 42) + '<p>' + t.need + '</p><button type="button">' + t.request + '</button></div></div>';
  }

  function render(bump) {
    var t = T[lang], c = counts();
    var icons = [['f-attend-on.svg', 'f-attend-off.svg'], ['f-assign-on.svg', 'f-assign.svg'], ['f-pay-on.svg', 'f-pay.svg']];
    root.setAttribute('lang', lang === 'hi' ? 'hi' : 'en');
    root.innerHTML =
      '<div class="uf-head"><div class="uf-row"><div><div class="uf-title">' + t.title + '</div><div class="uf-sub">' + t.sub + '</div></div>' +
        '<div class="uf-tools"><span class="rf">' + img('f-refresh.svg', 17.5) + '</span><span class="me">FK</span></div></div>' +
        '<div class="uf-site">' + img('f-pin.svg', 17.5) + '<div class="t">Residential Complex - Phase 2<small>Andheri West, Mumbai</small></div>' + img('f-down.svg', 17.5) + '</div>' +
        '<div class="uf-sync">' + t.sync + '</div></div>' +
      '<div class="uf-body" data-lenis-prevent>' +
        '<div class="uf-stats"><div><b class="g' + (bump === 'present' ? ' bump' : '') + '">' + c.present + '</b><small>' + t.present + '</small></div>' +
          '<div><b class="y' + (bump ? ' bump' : '') + '">' + c.pending + '</b><small>' + t.pending + '</small></div>' +
          '<div><b class="r' + (bump === 'absent' ? ' bump' : '') + '">' + c.absent + '</b><small>' + t.absent + '</small></div></div>' +
        '<div class="uf-tabs" role="tablist">' + t.tabs.map(function (n, i) {
          return '<button type="button" role="tab" aria-selected="' + (i === tab) + '" data-tab="' + i + '"' + (i === tab ? ' class="on"' : '') + '>' +
            img(icons[i][0], 17.5, 'ic-on') + img(icons[i][1], 17.5, 'ic-off') + n + '</button>';
        }).join('') + '</div>' +
        (tab === 0 ? attendance(t) : tab === 1 ? assign(t) : payments(t)) +
      '</div>' +
      '<div class="uf-nav"><span class="on">' + img('fn-dash.svg', 21) + t.nav[0] + '</span><span>' + img('fn-schedule.svg', 21) + t.nav[1] +
        '</span><span>' + img('fn-workers.svg', 21) + t.nav[2] + '</span></div>';
    fresh = null;
    if (bump) setTimeout(function () { [].forEach.call(root.querySelectorAll('.bump'), function (b) { b.classList.remove('bump'); }); }, 220);
  }

  if (root) {
    var body = function () { return root.querySelector('.uf-body'); };
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var keep = body() ? body().scrollTop : 0, bump = null;
      if (b.hasAttribute('data-tab')) { tab = +b.getAttribute('data-tab'); keep = 0; }
      else if (b.hasAttribute('data-mark')) { var w = crew[+b.getAttribute('data-mark')]; w.s = 'present'; w.at = now(); w.undo = true; fresh = +b.getAttribute('data-mark'); bump = 'present'; }
      else if (b.hasAttribute('data-miss')) { var x = crew[+b.getAttribute('data-miss')]; x.s = 'absent'; x.undo = true; fresh = +b.getAttribute('data-miss'); bump = 'absent'; }
      else if (b.hasAttribute('data-undo')) { var u = crew[+b.getAttribute('data-undo')]; if (!u.undo) return; u.s = 'pending'; u.undo = false; fresh = +b.getAttribute('data-undo'); bump = 'pending'; }
      else if (b.hasAttribute('data-pay')) { pay[+b.getAttribute('data-pay')].paid = true; fresh = 'p' + b.getAttribute('data-pay'); }
      else if (b.hasAttribute('data-payall')) { pay.forEach(function (p) { p.paid = true; }); }
      else return;
      render(bump);
      if (body()) body().scrollTop = keep;
      var f = root.querySelector('[data-tab="' + tab + '"]');
      if (b.hasAttribute('data-tab') && f) f.focus();
    });
    render();

    [].forEach.call(document.querySelectorAll('.u-lang button'), function (b, i, all) {
      b.addEventListener('click', function () {
        lang = b.getAttribute('data-lang');
        [].forEach.call(all, function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        var keep = body().scrollTop; render(); body().scrollTop = keep;
      });
    });
  }

  /* contractor dashboard */
  var dash = document.querySelector('.ud');
  if (dash) {
    dash.addEventListener('click', function (e) {
      var head = e.target.closest('.ud-wh[aria-expanded]');
      if (head) {
        var row = head.parentNode, open = !row.classList.contains('open');
        row.classList.toggle('open', open);
        head.setAttribute('aria-expanded', open);
        if (window.FIT_STAGES) window.FIT_STAGES();
        return;
      }
      var hire = e.target.closest('.h[data-hire]');
      if (hire && !hire.classList.contains('done')) {
        hire.classList.add('done');
        hire.textContent = 'Hired';
        var k = dash.querySelector('[data-kpi="hired"]');
        if (k) k.textContent = String(+k.textContent + 1);
      }
    });
  }

  if (window.LUCIDE) window.LUCIDE(document.querySelector('.p-uls'), 1.75);
  if (window.FIT_STAGES) window.FIT_STAGES();
})();
