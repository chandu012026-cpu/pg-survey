// Hostel & PG survey page: one question per screen. Answers are saved through submit_survey (database part 11).
// Links:  survey.html             the resident survey: 25 questions, ₹25 by UPI when finished
//         survey.html?for=owner   the owner survey (add &full=1 for every question)
//   add &ch=tag  to see where people came from, e.g. &ch=whatsapp-kondapur (letters, numbers, - _ . only)
//   add &src=interview  when you fill it in for someone you're talking to
(function () {
  'use strict';
  const D = window.SURVEY, CFG = window.SURVEY_CONFIG;
  const P = new URLSearchParams(location.search);
  const $ = id => document.getElementById(id);
  const app = $('app'), nav = $('nav'), backBtn = $('back'), nextBtn = $('next'), prog = $('progress');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode: carry on without saving */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const KEY = who => 'pg-survey-v' + D.version + '-' + who;
  const DONE = who => 'pg-survey-done-v' + D.version + '-' + who;
  const source = P.get('src') === 'interview' ? 'interview' : 'link';
  const channel = (P.get('ch') || '').replace(/[^A-Za-z0-9 _.-]/g, '').slice(0, 40);
  const WHO = P.get('for') === 'owner' ? 'owner' : 'resident';
  const MODE = WHO === 'owner' && P.get('full') === '1' ? 'full' : 'core';
  const UPI = /^[a-z0-9._-]{1,64}@[a-z][a-z0-9]{1,63}$/i, MOBILE = /^(\+?91|0)?[6-9]\d{9}$/;
  const contactLine = () => (CFG.contact ? `<p class="muted" style="font-size:14px">Questions about the survey${D[WHO].payout ? ' or your payment' : ''}? ${esc(CFG.contact)}</p>` : '');
  let S = null, flat = [], screen = '', timer = 0, sb = null;

  const client = () => sb || (sb = window.supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: false } }));
  const fresh = (who, mode) => ({ who, mode, a: {}, other: {}, contact: {}, pos: -1, hist: [], consent: '', started: 0, v: D.version });
  const build = () => { flat = []; D[S.who].sections.forEach(sec => sec.qs.forEach(q => flat.push(Object.assign({ sec }, q)))); };
  const save = () => { if (S && S.consent === 'yes') LS.set(KEY(S.who), S); };
  const required = q => !!(q.req || D[S.who].required);
  const opts = q => {
    const o = (typeof q.o === 'function' ? q.o(S.a, S.mode) : (q.o || [])).slice();
    if (q.other && o.indexOf('Other') < 0) o.push('Other');
    return o;
  };
  // rows of a "rate each" question that apply to this person (e.g. Food only if their hostel serves food)
  const items = q => ((typeof q.items === 'function' ? q.items(S.mode) : q.items) || [])
    .map(x => (typeof x === 'string' ? { t: x } : x)).filter(x => !x.when || x.when(S.a)).map(x => x.t);

  function visible(q) {
    if (q.consent) return false;
    if (S.mode === 'core' && !q.core) return false;
    if (q.sec.when && !q.sec.when(S.a)) return false;
    if (q.when && !q.when(S.a)) return false;
    if ((q.t === 'one' || q.t === 'all' || q.t === 'top3') && !opts(q).length) return false;
    return true;
  }
  function answered(q) {
    if (q.toContact) return !!(S.contact[q.toContact] || '').trim();
    const v = S.a[q.id];
    if (v == null) return false;
    if (q.t === 'grid') {
      const its = items(q), n = its.filter(it => v[it] != null).length;
      return n > 0 && (!required(q) || n === its.length);
    }
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim().length >= (required(q) ? 2 : 1);
    return true;
  }
  const visList = () => flat.filter(visible);
  function nextPos(from) { for (let i = from + 1; i < flat.length; i++) if (visible(flat[i])) return i; return -1; }

  function hint(q) {
    const req = required(q);
    switch (q.t) {
      case 'one': return 'Pick one';
      case 'all': return q.max ? 'Pick up to ' + q.max : 'Pick all that apply';
      case 'top3': return 'Pick 3, in order: tap your first choice first';
      case 'stars': return q.lo ? '' : '1 star = lowest, 5 stars = highest';
      case 'nps': return 'Tap a number';
      case 'grid': return req ? 'Tap the stars for each row' : (q.scale === 'stars' ? "Tap the stars for each row. Skip any that don't apply." : "Answer each row. Skip any that don't apply.");
      case 'num': return 'Type an amount';
      case 'text': return req ? '' : 'Optional. A few words is fine.';
    }
    return '';
  }
  const starRow = (val, attr) => '<div class="stars">' + [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star${val >= n ? ' on' : ''}" ${attr(n)} aria-pressed="${val === n}">★</button>`).join('') + '</div>';

  function contactBox(fields) {
    let h = '<div class="contactbox">';
    if (fields.indexOf('gmail') >= 0) h += `<label>Gmail address<input id="c_gmail" type="email" inputmode="email" autocomplete="email" maxlength="120" placeholder="yourname@gmail.com" value="${esc(S.contact.gmail || '')}"></label><span class="note">Google Play needs a Gmail address to add you as a tester.</span>`;
    if (fields.indexOf('phone') >= 0) h += `<label>Mobile number<input id="c_phone" type="tel" inputmode="numeric" autocomplete="tel-national" maxlength="14" placeholder="98480 12345" value="${esc(S.contact.phone || '')}"></label>`;
    return h + '<span class="note">Kept apart from your answers, and deleted after the research.</span></div>';
  }

  function control(q) {
    const v = S.a[q.id];
    if (q.t === 'one' || q.t === 'all' || q.t === 'top3') {
      const list = opts(q), sel = q.t === 'one' ? (v != null ? [v] : []) : (v || []);
      const picked = sel.filter(x => x !== q.only).length;
      const full = (q.t === 'all' && q.max && picked >= q.max) || (q.t === 'top3' && picked >= 3);
      const kind = q.t === 'one' ? 'single' : q.t === 'top3' ? 'multi rank' : 'multi';
      let h = '<div class="opts" role="group" aria-labelledby="qt">';
      list.forEach((o, i) => {
        const on = sel.indexOf(o) >= 0, rank = q.t === 'top3' && on ? sel.indexOf(o) + 1 : '';
        h += `<button type="button" class="opt ${kind}" data-opt="${i}" aria-pressed="${on}"${!on && full && o !== q.only ? ' disabled' : ''}><span class="mk">${rank}</span><span>${esc(o)}</span></button>`;
      });
      h += '</div>';
      if (sel.indexOf('Other') >= 0) h += `<div class="othertext"><input id="othertext" maxlength="120" placeholder="Type it here" aria-label="Other, type it here" value="${esc(S.other[q.id] || '')}"></div>`;
      if (q.ask && q.t === 'one' && q.ask[v]) h += contactBox(q.ask[v]);
      return h;
    }
    if (q.t === 'stars') return starRow(v, n => `data-star="${n}" aria-label="${n} star${n > 1 ? 's' : ''}"`) +
      (q.lo ? `<div class="ends"><span>1 = ${esc(q.lo)}</span><span>5 = ${esc(q.hi)}</span></div>` : '');
    if (q.t === 'nps') return '<div class="nps">' + Array.from({ length: 11 }, (_, n) =>
      `<button type="button" class="${v === n ? 'on' : ''}" data-nps="${n}" aria-pressed="${v === n}">${n}</button>`).join('') +
      '</div><div class="ends"><span>0 = not at all likely</span><span>10 = definitely</span></div>';
    if (q.t === 'grid') {
      const cur = v || {};
      return items(q).map((it, r) => `<div class="grow"><div class="lbl">${esc(it)}</div>` + (q.scale === 'stars'
        ? starRow(cur[it], n => `data-row="${r}" data-val="${n}" aria-label="${esc(it)}: ${n} star${n > 1 ? 's' : ''}"`)
        : '<div class="pills">' + q.scale.map((s, c) => `<button type="button" class="pill" data-row="${r}" data-col="${c}" aria-pressed="${cur[it] === s}">${esc(s)}</button>`).join('') + '</div>') + '</div>').join('');
    }
    if (q.t === 'num') return `<div class="numrow"><span>${esc(q.unit || '')}</span><input id="numin" inputmode="numeric" maxlength="7" placeholder="e.g. 1500" aria-labelledby="qt" value="${v != null ? esc(v) : ''}"></div>`;
    if (q.t === 'text') {
      const val = esc(q.toContact ? S.contact[q.toContact] || '' : v || '');
      return q.short
        ? `<input id="textin" maxlength="80" autocomplete="off" placeholder="${esc(q.ph || '')}" aria-labelledby="qt" value="${val}">`
        : `<textarea id="textin" maxlength="300" placeholder="${esc(q.ph || '')}" aria-labelledby="qt">${val}</textarea>`;
    }
    return '';
  }

  function updateNext(q) {
    const a = answered(q), req = required(q);
    nextBtn.textContent = a || req ? 'Next' : 'Skip';
    nextBtn.disabled = req && !a;
  }

  function renderQ(top) {
    clearTimeout(timer);
    if (S.pos < 0) return renderFinish();
    const q = flat[S.pos], vis = visList(), k = Math.max(0, vis.indexOf(q));
    screen = 'q'; prog.hidden = false; nav.hidden = false;
    $('pbar').style.width = Math.round(100 * k / Math.max(1, vis.length)) + '%';
    $('psec').textContent = q.sec.title;
    $('pnum').textContent = (k + 1) + ' of ' + vis.length;
    const firstInSec = vis.find(x => x.sec === q.sec) === q;
    app.innerHTML = (firstInSec && q.sec.lead ? `<p class="seclead">${esc(q.sec.lead)}</p>` : '') +
      (q.lead ? `<p class="qlead">${esc(q.lead)}</p>` : '') +
      `<h1 class="qtext" id="qt">${esc(q.q)}</h1>` + (hint(q) ? `<p class="qhint">${esc(hint(q))}</p>` : '') + control(q);
    updateNext(q);
    app.onclick = e => onClick(e, q);
    app.oninput = e => onInput(e, q);
    if (top) window.scrollTo(0, 0);
  }

  function onClick(e, q) {
    const b = e.target.closest('button');
    if (!b || b.disabled || !app.contains(b)) return;
    const id = q.id;
    if (b.dataset.opt != null) {
      const o = opts(q)[+b.dataset.opt];
      if (q.t === 'one') {
        S.a[id] = S.a[id] === o ? undefined : o;
      } else {
        let cur = (S.a[id] || []).slice();
        const i = cur.indexOf(o);
        if (i >= 0) cur.splice(i, 1);
        else if (q.only && o === q.only) cur = [o];
        else {
          cur = cur.filter(x => x !== q.only);
          if ((q.t === 'top3' && cur.length >= 3) || (q.max && cur.length >= q.max)) return;
          cur.push(o);
        }
        S.a[id] = cur.length ? cur : undefined;
      }
    } else if (b.dataset.star) S.a[id] = +b.dataset.star;
    else if (b.dataset.nps != null) S.a[id] = +b.dataset.nps;
    else if (b.dataset.row != null) {
      const it = items(q)[+b.dataset.row], cur = Object.assign({}, S.a[id] || {});
      const val = b.dataset.val ? +b.dataset.val : q.scale[+b.dataset.col];
      if (cur[it] === val) delete cur[it]; else cur[it] = val;
      S.a[id] = Object.keys(cur).length ? cur : undefined;
    } else return;
    if (S.a[id] === undefined) delete S.a[id];
    save(); renderQ(false);
    const v = S.a[id];
    const auto = v !== undefined && ((q.t === 'one' && v !== 'Other' && !(q.ask && q.ask[v])) || q.t === 'stars' || q.t === 'nps');
    if (auto) { const at = S.pos; timer = setTimeout(() => { if (screen === 'q' && S.pos === at) goNext(); }, 280); }
    else if (q.t === 'one' && v === 'Other') { const t = $('othertext'); if (t) t.focus(); }
  }

  function onInput(e, q) {
    const t = e.target;
    if (t.id === 'othertext') S.other[q.id] = t.value;
    else if (t.id === 'c_gmail') S.contact.gmail = t.value.trim();
    else if (t.id === 'c_phone') S.contact.phone = t.value;
    else if (t.id === 'numin') {
      const d = t.value.replace(/[^0-9]/g, '').slice(0, 7);
      if (d !== t.value) t.value = d;
      if (d) S.a[q.id] = +d; else delete S.a[q.id];
    } else if (t.id === 'textin') {
      if (q.toContact) S.contact[q.toContact] = t.value;
      else if (t.value.trim()) S.a[q.id] = t.value; else delete S.a[q.id];
    } else return;
    save(); updateNext(q);
  }

  function goNext() {
    clearTimeout(timer);
    if (screen !== 'q') return;
    const q = flat[S.pos], v = S.a[q.id];
    if (required(q) && !answered(q)) return;
    if (q.end) {
      const hit = Object.keys(q.end).find(k => (Array.isArray(v) ? v.indexOf(k) >= 0 : v === k));
      if (hit) return renderEnd(q.end[hit]);
    }
    S.hist.push(S.pos);
    S.pos = nextPos(S.pos);
    save();
    if (S.pos < 0) renderFinish(); else renderQ(true);
  }
  function goBack() {
    clearTimeout(timer);
    while (S.hist.length) {
      const p = S.hist.pop();
      if (flat[p] && visible(flat[p])) { S.pos = p; save(); return renderQ(true); }
    }
    renderConsent();
  }

  // ---- what gets sent
  function valueOf(q) {
    let v = S.a[q.id];
    if (v == null) return undefined;
    const other = x => (x === 'Other' && (S.other[q.id] || '').trim() ? 'Other: ' + S.other[q.id].trim().slice(0, 120) : x);
    if (q.t === 'one') return opts(q).indexOf(v) >= 0 ? other(v) : undefined;
    if (q.t === 'all' || q.t === 'top3') { const o = opts(q); v = v.filter(x => o.indexOf(x) >= 0).map(other); return v.length ? v : undefined; }
    if (q.t === 'grid') { const o = {}; items(q).forEach(it => { if (v[it] != null) o[it] = v[it]; }); return Object.keys(o).length ? o : undefined; }
    if (q.t === 'text') { v = String(v).trim().slice(0, q.short ? 80 : 300); return v || undefined; }
    if (q.t === 'num') return typeof v === 'number' && isFinite(v) ? v : undefined;
    return v;
  }
  function collect() {
    const out = {};
    flat.forEach(q => {
      if (q.consent || q.toContact || !visible(q)) return;
      const v = valueOf(q);
      if (v !== undefined) out[q.id] = v;
    });
    return out;
  }
  function ownerContact() {
    const c = {}, need = {};
    flat.forEach(q => {
      if (!visible(q)) return;
      if (q.ask && q.flag && q.ask[S.a[q.id]]) { c[q.flag] = true; q.ask[S.a[q.id]].forEach(f => { need[f] = true; }); }
      if (q.toContact && (S.contact[q.toContact] || '').trim()) c[q.toContact] = S.contact[q.toContact].trim().slice(0, 500);
    });
    if (need.phone && (S.contact.phone || '').trim()) c.phone = S.contact.phone.trim();
    if (need.gmail && (S.contact.gmail || '').trim()) c.gmail = S.contact.gmail.trim();
    return c.phone || c.gmail || c.note ? c : null;
  }

  // ---- screens
  function start() {
    if (WHO === 'resident' && source !== 'interview' && LS.get(DONE(WHO))) {
      screen = 'already'; prog.hidden = true; nav.hidden = true;
      app.innerHTML = '<h1>Thank you!</h1><p id="already">You have already completed this survey on this phone.</p>' + contactLine();
      return;
    }
    const saved = LS.get(KEY(WHO));
    if (saved && saved.v === D.version && saved.consent === 'yes' && saved.a && saved.mode === MODE) {
      screen = 'resume'; prog.hidden = true; nav.hidden = true;
      const n = Object.keys(saved.a).length;
      app.innerHTML = `<h1>Welcome back</h1><p>You've answered ${n} question${n === 1 ? '' : 's'} so far. Carry on where you left off?</p>
        <div class="stack"><button type="button" id="cont">Continue</button><button type="button" class="ghost" id="restart">Start again</button></div>`;
      app.oninput = null;
      app.onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.id === 'cont') {
          S = saved; S.hist = S.hist || []; S.other = S.other || {}; S.contact = S.contact || {}; build();
          if (S.pos >= flat.length) S.pos = -1;
          if (S.pos >= 0 && !visible(flat[S.pos])) S.pos = nextPos(S.pos);
          if (S.pos < 0) renderFinish(); else renderQ(true);
        } else if (b.id === 'restart') { LS.del(KEY(WHO)); S = fresh(WHO, MODE); build(); renderConsent(); }
      };
      return;
    }
    S = fresh(WHO, MODE); build(); renderConsent();
  }

  function renderConsent() {
    clearTimeout(timer);
    screen = 'consent'; prog.hidden = true; nav.hidden = true;
    const info = D[S.who], m = info.minutes[S.mode], n = visList().length, pay = info.payout;
    const badge = source === 'interview' ? '<span class="badge">Interview</span>' : '';
    app.oninput = null;
    if (S.who === 'resident') {
      const elig = S.elig || {};
      app.innerHTML = badge + `<h1>${esc(info.title)}</h1>
        <p>Tell us about the hostel or PG you live in. <b>${n} quick questions, about ${m} minutes.</b>${pay ? ` Answer all ${n} and get <b>₹${pay} by UPI</b>.` : ''}</p>
        <ul class="tight">
          <li>Anonymous: we don't ask your name.</li>
          <li>Your answers are never shared with your hostel owner.</li>
          ${pay ? `<li>Your UPI ID or number is used only to send the ₹${pay}, and then deleted.</li><li>One payment per person.</li>` : ''}
        </ul>
        <p style="margin-bottom:8px"><b>To take part, tick both:</b></p>
        <div class="opts">
          <button type="button" class="opt multi" data-elig="adult" aria-pressed="${!!elig.adult}"><span class="mk"></span><span>I'm 18 or older</span></button>
          <button type="button" class="opt multi" data-elig="lives" aria-pressed="${!!elig.lives}"><span class="mk"></span><span>I live in a hostel or PG in Hyderabad now</span></button>
        </div>
        <div class="stack"><button type="button" id="yes"${elig.adult && elig.lives ? '' : ' disabled'}>Start the survey</button><button type="button" class="ghost" id="no">This isn't me</button></div>` + contactLine();
    } else {
      app.innerHTML = badge + `<h1>${esc(info.title)}</h1>
        <p><b>We're studying how PGs and hostels in Hyderabad are run, to build a simple app for owners.</b> This survey takes about ${m} minutes.</p>
        <ul class="tight">
          <li>Your answers are anonymous. We never ask for your name or ID.</li>
          <li>Skip any question you like.</li>
          <li>We use the answers only for this research, and never share them.</li>
          <li>At the end you can leave your number if you'd like to try the app. We delete it after the research.</li>
          <li>This survey is for people aged 18 and above.</li>
        </ul>
        <p><b>Shall we start?</b></p>
        <div class="stack"><button type="button" id="yes">Yes, let's start</button><button type="button" class="ghost" id="no">No, thanks</button></div>` + contactLine();
    }
    app.onclick = e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.dataset.elig) { S.elig = Object.assign({}, S.elig); S.elig[b.dataset.elig] = !S.elig[b.dataset.elig]; renderConsent(); }
      else if (b.id === 'yes') {
        if (S.consent !== 'yes') { S.consent = 'yes'; S.started = Date.now(); }
        S.hist = []; S.pos = nextPos(-1); save(); renderQ(true);
      } else if (b.id === 'no') renderEnd(S.who === 'resident' ? 'not_for_you' : 'declined');
    };
    window.scrollTo(0, 0);
  }

  const ENDS = {
    declined: ['No problem', 'Thank you for your time.'],
    not_for_you: ['Thank you!', 'This survey is for people aged 18 or older who live in a hostel or PG in Hyderabad.'],
    under18: ['Thank you!', 'This survey is for people aged 18 and above, so we stop here. Nothing you answered has been saved.']
  };
  function renderEnd(code) {
    clearTimeout(timer);
    LS.del(KEY(S.who));
    screen = 'end'; prog.hidden = true; nav.hidden = true;
    app.innerHTML = `<h1>${esc(ENDS[code][0])}</h1><p id="endmsg" data-end="${esc(code)}">${esc(ENDS[code][1])}</p>`;
    app.onclick = null; app.oninput = null;
    S = null;
  }

  function renderFinish() {
    clearTimeout(timer);
    screen = 'finish'; prog.hidden = false; nav.hidden = true;
    $('pbar').style.width = '100%'; $('psec').textContent = 'All done'; $('pnum').textContent = '';
    const n = Object.keys(collect()).length, pay = D[S.who].payout;
    app.innerHTML = pay
      ? `<h1>All ${n} questions done. Thank you!</h1>
        <p>Where should we send your <b>₹${pay}</b>?</p>
        <label for="payout">UPI ID or mobile number<input id="payout" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="80" placeholder="name@okaxis or 98480 12345" value="${esc(S.contact.payout || '')}"${S.contact.nopay ? ' disabled' : ''}></label>
        <p class="qhint" style="margin:6px 0 12px">We send it by UPI within a few days. One payment per person.</p>
        <button type="button" class="opt multi" id="nopay" aria-pressed="${!!S.contact.nopay}"><span class="mk"></span><span>I don't want the ₹${pay}</span></button>
        <div class="err" id="senderr" role="alert"></div>
        <div class="stack"><button type="button" id="send">Send my answers</button><button type="button" class="ghost" id="fback">Back to the questions</button></div>`
      : `<h1>That's everything. Thank you!</h1>
        <p>You answered ${n} question${n === 1 ? '' : 's'}. Tap <b>Send</b> to save your answers.</p>
        <div class="err" id="senderr" role="alert"></div>
        <div class="stack"><button type="button" id="send">Send my answers</button><button type="button" class="ghost" id="fback">Back to the questions</button></div>`;
    app.oninput = e => { if (e.target.id === 'payout') { S.contact.payout = e.target.value; save(); } };
    app.onclick = e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      if (b.id === 'nopay') { S.contact.nopay = !S.contact.nopay; save(); renderFinish(); }
      else if (b.id === 'send') send(b);
      else if (b.id === 'fback') goBack();
    };
    window.scrollTo(0, 0);
  }

  async function send(b) {
    const err = $('senderr'), pay = D[S.who].payout;
    err.textContent = '';
    let contact = null, payout = '';
    if (pay) {
      if (!S.contact.nopay) {
        payout = (S.contact.payout || '').replace(/\s/g, '');
        if (!UPI.test(payout) && !MOBILE.test(payout)) { err.textContent = 'Enter a UPI ID (like name@okaxis) or a 10-digit mobile number.'; return; }
        contact = { payout, payment: true };
      }
    } else contact = ownerContact();
    b.disabled = true; b.textContent = 'Sending…';
    const payload = {
      survey: S.who, version: S.mode, consent: 'yes', answers: collect(), contact,
      source, channel, lang: 'en', questions_version: D.version,
      seconds: Math.max(0, Math.round((Date.now() - (S.started || Date.now())) / 1000))
    };
    try {
      const { error } = await client().rpc('submit_survey', { p: payload });
      if (error) throw error;
      LS.del(KEY(S.who));
      renderThanks(payout);
    } catch (e) {
      const m = (e && e.message) || String(e);
      err.textContent = /payout_used/.test(m) ? 'This UPI ID or number has already been used for this survey. We pay once per person.'
        : /bad_payout/.test(m) ? 'Enter a UPI ID (like name@okaxis) or a 10-digit mobile number.'
        : /incomplete/.test(m) ? 'Please answer every question first.'
        : /busy/.test(m) ? 'Lots of people are answering right now. Please tap Send again in a minute.'
        : /fetch|network|load failed/i.test(m) ? "Couldn't send. Check your internet and tap Send again. Your answers are kept on this phone."
        : 'Something went wrong. Please tap Send again. (' + m + ')';
      b.disabled = false; b.textContent = 'Send my answers';
    }
  }

  function renderThanks(payout) {
    screen = 'thanks'; prog.hidden = true; nav.hidden = true;
    const who = S.who, mode = S.mode, pay = D[who].payout;
    if (who === 'resident' && source !== 'interview') LS.set(DONE(who), new Date().toISOString());
    app.innerHTML = '<div class="ok" id="done">Thank you! Your answers have been saved.</div>' +
      (pay && payout ? `<p id="paynote">We'll send <b>₹${pay}</b> to <b>${esc(payout)}</b> within a few days.</p>` : '') +
      contactLine() +
      (source === 'interview' ? '<button type="button" class="big" id="nextint">Start the next one</button>' : '');
    app.oninput = null;
    app.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'nextint') { S = fresh(who, mode); build(); renderConsent(); }
    };
    window.scrollTo(0, 0);
  }

  nextBtn.addEventListener('click', goNext);
  backBtn.addEventListener('click', goBack);
  start();
})();
