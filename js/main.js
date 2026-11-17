(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const ss = { get(k){try{return sessionStorage.getItem(k)}catch(e){return null}}, set(k,v){try{sessionStorage.setItem(k,v)}catch(e){}} };

  /* ---------- Preloader / page enter ---------- */
  const pre = $('#preloader'), pt = $('.pt');
  const ready = () => body.classList.add('ready');
  if (pre && !ss.get('seen')) {
    body.classList.add('loading');
    const num = $('#plCount'), bar = $('#plBar'), start = performance.now(), dur = 2400;
    const tick = t => {
      const p = Math.min((t - start) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = Math.round(e * 100);
      num.textContent = v; bar.style.width = v + '%';
      if (p < 1) return requestAnimationFrame(tick);
      setTimeout(() => {
        pre.classList.add('done'); body.classList.remove('loading'); ss.set('seen', 1);
        setTimeout(ready, 500); setTimeout(() => pre.remove(), 1400);
      }, 250);
    };
    requestAnimationFrame(tick);
  } else {
    pre && pre.remove();
    pt.classList.add('cover');
    requestAnimationFrame(() => requestAnimationFrame(() => { pt.classList.remove('cover'); pt.classList.add('reveal'); setTimeout(ready, 300); }));
  }

  /* ---------- Page leave transition ---------- */
  $$('a[href]').forEach(a => {
    const h = a.getAttribute('href');
    if (!h || h.startsWith('#') || h.startsWith('mailto') || h.startsWith('tel') || a.target === '_blank' || /^https?:/.test(h)) return;
    a.addEventListener('click', e => {
      e.preventDefault(); body.classList.remove('menu-open');
      pt.classList.remove('reveal'); void pt.offsetWidth; pt.classList.add('leave');
      setTimeout(() => location.href = h, 750);
    });
  });
  window.addEventListener('pageshow', e => { if (e.persisted) { pt.classList.remove('leave'); pt.classList.add('reveal'); } });

  /* ---------- Active nav ---------- */
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(a => a.getAttribute('href') === page && a.classList.add('active'));

  /* ---------- Menu ---------- */
  $('.menu-btn')?.addEventListener('click', () => body.classList.toggle('menu-open'));

  /* ---------- Cursor ---------- */
  const dot = $('.cursor'), ring = $('.cursor-ring');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx - 4}px,${my - 4}px)`; });
  (function loop(){ rx += (mx - rx) * .15; ry += (my - ry) * .15; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(loop); })();
  dot.style.transform = 'translate(-50%,-50%)'; dot.style.left = dot.style.top = 0;
  $$('a,button,.srv-row,label,.acc-head').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { ring.classList.add('view'); ring.textContent = el.dataset.cursor; });
    el.addEventListener('mouseleave', () => { ring.classList.remove('view'); ring.textContent = ''; });
  });

  /* ---------- Header hide + progress ---------- */
  const header = $('.header'), prog = $('.progress'); let last = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('hide', y > last && y > 200); last = y;
    prog.style.width = (y / (document.documentElement.scrollHeight - innerHeight)) * 100 + '%';
    scrub(); parallax();
  }, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.reveal,.reveal-lines,.line:not(.hero .line)').forEach(el => io.observe(el));

  /* ---------- Word scrub ---------- */
  const scrubs = $$('.scrub');
  scrubs.forEach(el => el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' '));
  function scrub(){
    scrubs.forEach(el => {
      const r = el.getBoundingClientRect(), p = Math.min(Math.max((innerHeight * .85 - r.top) / (r.height + innerHeight * .4), 0), 1);
      const ws = $$('.w', el), n = Math.floor(p * ws.length * 1.1);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    });
  }
  scrub();

  /* ---------- Parallax ---------- */
  const px = $$('[data-speed]');
  function parallax(){ px.forEach(el => { const r = el.getBoundingClientRect(); el.style.transform = `translateY(${(r.top + r.height / 2 - innerHeight / 2) * el.dataset.speed}px)`; }); }

  /* ---------- Hero arches mouse ---------- */
  const arches = $$('.arch,.orb');
  addEventListener('mousemove', e => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    arches.forEach((a, i) => a.style.transform = `translate(${x * (i + 1) * 14}px,${y * (i + 1) * 10}px)`);
  });

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, s = performance.now();
    const step = t => { const p = Math.min((t - s) / 1800, 1); el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * end) + (el.dataset.suffix || ''); p < 1 && requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Magnetic ---------- */
  $$('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    el.addEventListener('mouseleave', () => { el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 600); });
  });

  /* ---------- Testimonials ---------- */
  const ts = $$('.t-item'); let ti = 0;
  if (ts.length) {
    const go = d => { ts[ti].classList.remove('active'); ti = (ti + d + ts.length) % ts.length; ts[ti].classList.add('active'); };
    $('.t-prev').onclick = () => go(-1); $('.t-next').onclick = () => go(1);
    setInterval(() => go(1), 6000);
  }

  /* ---------- Accordion ---------- */
  $$('.acc-head').forEach(h => h.addEventListener('click', () => {
    const it = h.parentElement, open = it.classList.contains('open');
    $$('.acc-item', it.parentElement).forEach(i => i.classList.remove('open'));
    !open && it.classList.add('open');
  }));

  /* ---------- Work filter ---------- */
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.remove('active')); b.classList.add('active');
    const f = b.dataset.filter;
    $$('.work-card').forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      c.style.transition = 'opacity .4s'; c.style.opacity = 0;
      setTimeout(() => { c.classList.toggle('hide', !show); requestAnimationFrame(() => c.style.opacity = 1); }, 400);
    });
  }));

  /* ---------- Hover preview list ---------- */
  const pv = $('.preview');
  if (pv) {
    const art = $('.art', pv); let px2 = 0, py2 = 0, cx = 0, cy = 0;
    $$('.wlist a').forEach(a => {
      a.addEventListener('mouseenter', () => { if (a.dataset.img) art.style.background = `url(${a.dataset.img}) center/cover, linear-gradient(135deg,#6C151E,#0F3D3A)`; pv.classList.add('show'); });
      a.addEventListener('mouseleave', () => pv.classList.remove('show'));
    });
    addEventListener('mousemove', e => { px2 = e.clientX; py2 = e.clientY; });
    (function l(){ cx += (px2 - cx) * .12; cy += (py2 - cy) * .12; pv.style.left = cx + 'px'; pv.style.top = cy + 'px'; requestAnimationFrame(l); })();
  }

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', e => {
    e.preventDefault(); let ok = true;
    $$('.field', form).forEach(f => {
      const i = $('input,textarea', f), s = $('small', f); let msg = '';
      if (i.required && !i.value.trim()) msg = 'This field is required';
      else if (i.type === 'email' && i.value && !/^\S+@\S+\.\S+$/.test(i.value)) msg = 'Enter a valid email';
      f.classList.toggle('err', !!msg); s.textContent = msg; if (msg) ok = false;
    });
    const out = $('.form-msg');
    if (!ok) return out.textContent = '';
    const sbtn = $('button[type=submit]', form), label = $('span', sbtn);
    sbtn.disabled = true; label.textContent = 'Sending…'; out.textContent = '';
    // FormSubmit AJAX endpoint (same email as the form's action)
    const ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    fetch(ajaxUrl, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(r => r.json())
      .then(d => {
        if (String(d.success) !== 'true') throw new Error(d.message || 'Failed');
        form.reset(); out.textContent = '✦ Message sent — Kevin or Sandeep will reply within 24 hours.';
        setTimeout(() => { pt.classList.remove('reveal'); pt.classList.add('leave'); setTimeout(() => location.href = 'thank-you.html', 700); }, 1200);
      })
      .catch(() => {
        // Fallback: normal POST to FormSubmit (works even if AJAX is blocked)
        const next = $('input[name="_next"]', form);
        if (next && location.protocol.startsWith('http')) next.value = new URL('thank-you.html', location.href).href;
        else next && next.remove();
        form.submit();
      })
      .finally(() => { sbtn.disabled = false; label.textContent = 'Send message'; });
  });

  /* ---------- Image fallback (shows brand gradient if a photo fails) ---------- */
  $$('.ph img').forEach(img => {
    const fail = () => img.parentElement.classList.add('fail');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0 && img.src) fail();
  });

  /* ---------- Year ---------- */
  $$('.year').forEach(y => y.textContent = new Date().getFullYear());
})();

/* ---------- Story: growing stem + chapter indicator ---------- */
(() => {
  const story = document.querySelector('.story'); if (!story) return;
  const path = story.querySelector('.stem path'), ind = document.querySelector('.chapter-ind'), label = ind.querySelector('span');
  path.setAttribute('pathLength', 1);
  const upd = () => {
    const r = story.getBoundingClientRect();
    const p = Math.min(Math.max((innerHeight * .6 - r.top) / r.height, 0), 1);
    path.style.strokeDashoffset = 1 - p;
    ind.classList.toggle('show', r.top < innerHeight * .5 && r.bottom > innerHeight * .5);
  };
  addEventListener('scroll', upd, { passive: true }); upd();
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); const t = e.target.querySelector('.chap-tag'); t && (label.textContent = t.dataset.chapter); }
  }), { rootMargin: '-45% 0px -45% 0px' });
  story.querySelectorAll('.chapter').forEach(c => cio.observe(c));
})();

/* ---------- Brand page: horizontal mockup scroll ---------- */
(() => {
  const hs = document.querySelector('.hscroll'); if (!hs) return;
  const track = hs.querySelector('.hs-track'), bar = hs.querySelector('.hs-bar i');
  const size = () => { hs.style.height = (track.scrollWidth - innerWidth + innerHeight * 1.2) + 'px'; };
  const upd = () => {
    const r = hs.getBoundingClientRect(), max = hs.offsetHeight - innerHeight;
    const p = Math.min(Math.max(-r.top / max, 0), 1);
    track.style.transform = `translateX(${-p * Math.max(track.scrollWidth - innerWidth, 0)}px)`;
    bar.style.width = p * 100 + '%';
  };
  size(); upd(); addEventListener('resize', () => { size(); upd(); }); addEventListener('scroll', upd, { passive: true });
  addEventListener('load', () => { size(); upd(); });
})();

/* ---------- Lightbox for logo styles ---------- */
(() => {
  const lb = document.querySelector('.lightbox'); if (!lb) return;
  const items = [...document.querySelectorAll('.lg-item')], img = lb.querySelector('img'), cap = lb.querySelector('.lb-cap'); let i = 0;
  const show = n => { i = (n + items.length) % items.length; img.src = items[i].dataset.full; cap.textContent = items[i].querySelector('span').textContent; };
  items.forEach((b, n) => b.addEventListener('click', () => { show(n); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); }));
  const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
  lb.querySelector('.lb-close').onclick = close;
  lb.querySelector('.lb-prev').onclick = () => show(i - 1);
  lb.querySelector('.lb-next').onclick = () => show(i + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
})();

/* ---------- Copy colour hex ---------- */
document.querySelectorAll('.sw').forEach(s => s.addEventListener('click', () => {
  const hex = s.dataset.hex; try { navigator.clipboard.writeText(hex); } catch (e) {}
  const t = document.createElement('div'); t.className = 'copied'; t.textContent = hex + ' copied'; document.body.appendChild(t); setTimeout(() => t.remove(), 1400);
}));
