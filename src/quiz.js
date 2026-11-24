(function () {
  var Q = JSON.parse(document.getElementById('quiz-data').textContent);
  var screens = document.querySelectorAll('.qz-screen');
  var $ = function (id) { return document.getElementById(id); };
  var answers = [];
  var idx = 0;
  var pillarName = {};
  Q.piliers.forEach(function (p) { pillarName[p.id] = p.nom; });

  function show(name) {
    screens.forEach(function (s) { s.hidden = s.dataset.screen !== name; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderQuestion() {
    var q = Q.questions[idx];
    $('count').textContent = 'Question ' + (idx + 1) + ' sur ' + Q.questions.length;
    $('bar').style.width = ((idx) / Q.questions.length * 100) + '%';
    $('pillar').textContent = pillarName[q.pilier] || '';
    $('qtext').textContent = q.question;
    $('back').style.visibility = idx === 0 ? 'hidden' : 'visible';
    var box = $('answers');
    box.innerHTML = '';
    q.reponses.forEach(function (r, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'qz-answer' + (answers[idx] === i ? ' sel' : '');
      b.innerHTML = '<span class="qz-letter">' + 'ABCD'.charAt(i) + '</span><span></span>';
      b.lastChild.textContent = r.texte;
      b.addEventListener('click', function () {
        answers[idx] = i;
        b.classList.add('sel');
        setTimeout(next, 220);
      });
      box.appendChild(b);
    });
  }

  function next() {
    if (idx < Q.questions.length - 1) { idx++; renderQuestion(); }
    else if (Q.capture && Q.capture.activer) { show('capture'); setTimeout(function () { $('prenom').focus(); }, 300); }
    else { showResult(); }
  }

  function compute() {
    var total = 0, max = 0, per = {};
    Q.questions.forEach(function (q, i) {
      var pts = q.reponses.map(function (r) { return Number(r.points) || 0; });
      var m = Math.max.apply(null, pts);
      var got = pts[answers[i]] || 0;
      total += got; max += m;
      per[q.pilier] = per[q.pilier] || { got: 0, max: 0 };
      per[q.pilier].got += got; per[q.pilier].max += m;
    });
    var score = max ? Math.round(total / max * 100) : 0;
    var profil = Q.profils.filter(function (p) { return score >= p.min && score <= p.max; })[0] || Q.profils[Q.profils.length - 1];
    return { score: score, per: per, profil: profil };
  }

  function showResult() {
    var r = compute();
    show('result');
    $('pname').textContent = r.profil.nom;
    $('ptitle').textContent = r.profil.titre;
    $('ptext').textContent = r.profil.texte;
    $('pbtn').textContent = r.profil.bouton;
    $('pcta').href = r.profil.lien || '/';
    var bars = $('bars');
    bars.innerHTML = '';
    Q.piliers.forEach(function (p) {
      var v = r.per[p.id] ? Math.round(r.per[p.id].got / r.per[p.id].max * 100) : 0;
      var row = document.createElement('div');
      row.className = 'qz-row' + (v < 50 ? ' low' : '');
      row.innerHTML = '<div class="qz-row-head"><b></b><span>' + v + ' %</span></div><div class="qz-track"><i style="width:' + v + '%"></i></div><p></p>';
      row.querySelector('b').textContent = p.nom;
      row.querySelector('p').textContent = v < 67 ? p.conseil_faible : p.conseil_fort;
      bars.appendChild(row);
    });
    var n = 0, target = r.score;
    var ring = $('ring');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { $('score').textContent = target; ring.style.strokeDashoffset = 326.7 * (1 - target / 100); return; }
    var t = setInterval(function () {
      n = Math.min(target, n + 2);
      $('score').textContent = n;
      ring.style.strokeDashoffset = 326.7 * (1 - n / 100);
      if (n >= target) clearInterval(t);
    }, 18);
    return r;
  }

  $('start').addEventListener('click', function () { idx = 0; answers = []; show('question'); renderQuestion(); });
  $('back').addEventListener('click', function () { if (idx > 0) { idx--; renderQuestion(); } });
  $('restart').addEventListener('click', function () { idx = 0; answers = []; show('intro'); });

  $('lead').addEventListener('submit', function (e) {
    e.preventDefault();
    var prenom = $('prenom').value.trim(), email = $('email').value.trim();
    var err = $('err');
    if (!prenom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'Indiquez votre prénom et une adresse e-mail valide.';
      err.hidden = false; return;
    }
    err.hidden = true;
    var r = compute();
    if (Q.capture.url_envoi) {
      var fd = new FormData();
      fd.append('prenom', prenom); fd.append('email', email);
      fd.append('score', r.score); fd.append('profil', r.profil.nom);
      Q.piliers.forEach(function (p) { if (r.per[p.id]) fd.append('pilier_' + p.id, Math.round(r.per[p.id].got / r.per[p.id].max * 100)); });
      fetch(Q.capture.url_envoi, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () {});
    }
    showResult();
  });

  var url = location.origin + location.pathname;
  $('share').value = url;
  $('copy').addEventListener('click', function () {
    var b = this;
    var done = function () { b.textContent = 'Lien copié'; setTimeout(function () { b.textContent = 'Copier le lien'; }, 2000); };
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, function () { $('share').select(); });
    else $('share').select();
  });
})();
