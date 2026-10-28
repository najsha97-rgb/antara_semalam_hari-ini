/* ==========================================================================
   ANTARA SEMALAM DAN HARI INI - PWA CLIENT SCRIPT (app.js)
   ========================================================================== */

(function () {
  'use strict';

  let appData = window.ANTARA_SEMALAM_DATA || null;

  const state = {
    currentChapter: 0,
    currentSubtopic: 0,
    mode: 'layer1', // 'layer1' (Penuh), 'layer2' (Ringkasan), 'layer3' (Mutiara)
    fontScale: 1.0,
    theme: localStorage.getItem('antara_semalam_theme') || 'dark',
    searchQuery: ''
  };

  // DOM Elements
  const appSidebar = document.getElementById('appSidebar');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const themeToggle = document.getElementById('themeToggle');
  const btnFontInc = document.getElementById('btnFontInc');
  const btnFontDec = document.getElementById('btnFontDec');
  const searchInput = document.getElementById('searchInput');
  const chapterAccordion = document.getElementById('chapterAccordion');

  const btnModePenuh = document.getElementById('btnModePenuh');
  const btnModeRingkasan = document.getElementById('btnModeRingkasan');
  const btnModeHikmah = document.getElementById('btnModeHikmah');

  const readerMain = document.getElementById('readerMain');
  const heroChBadge = document.getElementById('heroChBadge');
  const heroMainTitle = document.getElementById('heroMainTitle');
  const heroArabicTitle = document.getElementById('heroArabicTitle');
  const articleContent = document.getElementById('articleContent');
  const hikmahSection = document.getElementById('hikmahSection');
  const ringkasanSection = document.getElementById('ringkasanSection');
  const readerHero = document.getElementById('readerHero');

  const btnPrevSub = document.getElementById('btnPrevSub');
  const btnNextSub = document.getElementById('btnNextSub');
  const bottomNav = document.getElementById('bottomNav');

  // Initialize Theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // Initialize Font
  const savedScale = localStorage.getItem('antara_semalam_font_scale');
  if (savedScale) {
    state.fontScale = parseFloat(savedScale);
    document.documentElement.style.setProperty('--font-scale', state.fontScale);
  }

  // Load Data
  if (!appData) {
    fetch('./data/antara_semalam_data.json')
      .then(res => res.json())
      .then(data => {
        appData = data;
        initApp();
      })
      .catch(err => {
        console.error('Failed to load data json:', err);
        articleContent.innerHTML = '<p style="color:red;">Ralat memuatkan pangkalan data. Sila muat semula halaman.</p>';
      });
  } else {
    initApp();
  }

  function initApp() {
    renderSidebar();
    renderContent();
    setupEventListeners();
  }

  function setupEventListeners() {
    // Mobile Menu Toggle
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        appSidebar.classList.toggle('open');
      });
    }

    // Theme Toggle
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('antara_semalam_theme', state.theme);
        themeToggle.textContent = state.theme === 'dark' ? '🌙' : '☀️';
      });
    }

    // Font Sizing
    if (btnFontInc) {
      btnFontInc.addEventListener('click', () => {
        if (state.fontScale < 1.4) {
          state.fontScale += 0.08;
          document.documentElement.style.setProperty('--font-scale', state.fontScale);
          localStorage.setItem('antara_semalam_font_scale', state.fontScale);
        }
      });
    }

    if (btnFontDec) {
      btnFontDec.addEventListener('click', () => {
        if (state.fontScale > 0.85) {
          state.fontScale -= 0.08;
          document.documentElement.style.setProperty('--font-scale', state.fontScale);
          localStorage.setItem('antara_semalam_font_scale', state.fontScale);
        }
      });
    }

    // Mode Buttons
    btnModePenuh.addEventListener('click', () => switchMode('layer1'));
    btnModeRingkasan.addEventListener('click', () => switchMode('layer2'));
    btnModeHikmah.addEventListener('click', () => switchMode('layer3'));

    // Search Input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim().toLowerCase();
        renderSidebar();
      });
    }

    // Bottom Navigation
    if (btnPrevSub) {
      btnPrevSub.addEventListener('click', navigatePrev);
    }
    if (btnNextSub) {
      btnNextSub.addEventListener('click', navigateNext);
    }
  }

  function switchMode(newMode) {
    state.mode = newMode;
    btnModePenuh.classList.toggle('active', newMode === 'layer1');
    btnModeRingkasan.classList.toggle('active', newMode === 'layer2');
    btnModeHikmah.classList.toggle('active', newMode === 'layer3');
    renderContent();
    renderSidebar();
  }

  // Render Sidebar Tree
  function renderSidebar() {
    chapterAccordion.innerHTML = '';

    if (!appData || !appData.chapters) return;

    if (state.mode === 'layer3') {
      // Mod Mutiara Kata
      chapterAccordion.innerHTML = `
        <div style="padding: 10px; font-size: 0.88rem; color: var(--gold-primary);">
          ✨ <strong>Koleksi Mutiara Kata</strong> (${appData.quotes ? appData.quotes.length : 0} Kalam Pilihan Imam Hasan al-Banna)
        </div>
      `;
      return;
    }

    if (state.mode === 'layer2') {
      // Mod Ringkasan
      chapterAccordion.innerHTML = `
        <div style="padding: 10px; font-size: 0.88rem; color: var(--emerald-light);">
          📋 <strong>Ringkasan 27 Prinsip Risalah</strong>
        </div>
      `;
      return;
    }

    appData.chapters.forEach((ch, chIdx) => {
      // Filter search jika ada
      let matches = true;
      if (state.searchQuery) {
        const query = state.searchQuery;
        const matchTitle = ch.title.toLowerCase().includes(query) || ch.number.toLowerCase().includes(query);
        const matchSubs = ch.subtopics.some(s => s.title.toLowerCase().includes(query) || (s.paragraphs && s.paragraphs.some(p => p.toLowerCase().includes(query))));
        matches = matchTitle || matchSubs;
      }

      if (!matches) return;

      const itemEl = document.createElement('div');
      itemEl.className = `chapter-nav-item ${chIdx === state.currentChapter ? 'open' : ''}`;

      const headerEl = document.createElement('div');
      headerEl.className = 'chapter-nav-header';
      headerEl.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span class="ch-badge">${ch.number}</span>
          <span>${ch.title}</span>
        </div>
        <span class="chevron" style="transition: transform 0.25s ease;">▼</span>
      `;

      headerEl.addEventListener('click', () => {
        itemEl.classList.toggle('open');
      });

      const subListEl = document.createElement('div');
      subListEl.className = 'subtopic-menu-list';

      ch.subtopics.forEach((sub, sIdx) => {
        const subBtn = document.createElement('button');
        subBtn.className = `subtopic-nav-btn ${chIdx === state.currentChapter && sIdx === state.currentSubtopic ? 'active' : ''}`;
        
        // Paparan ringkas dan kemas di menu skrol
        const displayMenuTitle = sub.menu_title || sub.title;
        subBtn.innerHTML = `<span>•</span> <span>${displayMenuTitle}</span>`;
        subBtn.title = sub.title;

        subBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.currentChapter = chIdx;
          state.currentSubtopic = sIdx;
          renderContent();
          renderSidebar();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (window.innerWidth <= 900) {
            appSidebar.classList.remove('open');
          }
        });

        subListEl.appendChild(subBtn);
      });

      itemEl.appendChild(headerEl);
      itemEl.appendChild(subListEl);
      chapterAccordion.appendChild(itemEl);
    });
  }

  // Render Reader Content
  function renderContent() {
    if (!appData) return;

    // Reset visibility
    readerHero.style.display = 'block';
    articleContent.style.display = 'block';
    hikmahSection.style.display = 'none';
    ringkasanSection.style.display = 'none';
    bottomNav.style.display = 'flex';

    if (state.mode === 'layer3') {
      // Mod Mutiara Kata Hikmah
      renderHikmahView();
      return;
    }

    if (state.mode === 'layer2') {
      // Mod Ringkasan
      renderRingkasanView();
      return;
    }

    // Mod Versi Penuh
    const ch = appData.chapters[state.currentChapter];
    if (!ch) return;
    const sub = ch.subtopics[state.currentSubtopic];
    if (!sub) return;

    heroChBadge.textContent = `${ch.number} • SUBTOPIK ${state.currentSubtopic + 1}`;
    heroMainTitle.textContent = sub.title;
    heroArabicTitle.textContent = ch.title_ar || '';

    // Render Perenggan
    articleContent.innerHTML = '';
    sub.paragraphs.forEach(p => {
      const pClean = p.trim();
      if (!pClean) return;

      if (pClean.startsWith('<!-- PAGE')) {
        const pageBadge = document.createElement('div');
        pageBadge.style.margin = '2rem 0 1rem 0';
        pageBadge.style.textAlign = 'center';
        pageBadge.innerHTML = `<span style="background: rgba(52, 211, 153, 0.15); color: var(--emerald-light); font-size: 0.76rem; font-weight: 700; padding: 3px 12px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.3);">${pClean.replace('<!--', '').replace('-->', '').trim()}</span>`;
        articleContent.appendChild(pageBadge);
      } else if (pClean.startsWith('"') || pClean.startsWith('“') || pClean.includes('Firman Allah')) {
        const quoteBox = document.createElement('blockquote');
        quoteBox.textContent = pClean;
        articleContent.appendChild(quoteBox);
      } else {
        const paraEl = document.createElement('p');
        paraEl.textContent = pClean;
        articleContent.appendChild(paraEl);
      }
    });

    updateBottomNav();
  }

  function renderRingkasanView() {
    heroChBadge.textContent = 'RINGKASAN EKSEKUTIF';
    heroMainTitle.textContent = '27 Prinsip Kebangkitan & Penyelamat';
    heroArabicTitle.textContent = 'خلاصة الرسالة: دعوتنا دعوة بعث وإنقاذ';
    articleContent.style.display = 'none';
    hikmahSection.style.display = 'none';
    ringkasanSection.style.display = 'block';
    bottomNav.style.display = 'none';

    // Cari bab terakhir (Bab 12) yang mengandungi ringkasan 27 perkara
    const lastCh = appData.chapters[appData.chapters.length - 1];
    ringkasanSection.innerHTML = '';

    const introBox = document.createElement('div');
    introBox.style.background = 'rgba(5, 150, 105, 0.1)';
    introBox.style.border = '1px solid rgba(52, 211, 153, 0.3)';
    introBox.style.borderRadius = '14px';
    introBox.style.padding = '1.25rem 1.5rem';
    introBox.style.marginBottom = '2rem';
    introBox.innerHTML = `
      <p style="font-weight: 600; color: var(--gold-primary); margin-bottom: 0.4rem;">💡 Rumusan Asas Perjuangan:</p>
      <p style="font-size: 0.95rem; color: var(--text-secondary);">Berikut adalah 27 rumusan padat yang disusun khas oleh Al-Imam Hasan al-Banna pada penghujung risalah ini sebagai garis panduan utama para aktivis dakwah.</p>
    `;
    ringkasanSection.appendChild(introBox);

    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '1rem';

    if (lastCh && lastCh.subtopics) {
      lastCh.subtopics.forEach(st => {
        st.paragraphs.forEach(p => {
          if (p.trim() && !p.startsWith('<!-- PAGE')) {
            const card = document.createElement('div');
            card.style.background = 'var(--bg-card)';
            card.style.border = '1px solid var(--border-color)';
            card.style.borderRadius = '12px';
            card.style.padding = '1.15rem 1.4rem';
            card.style.lineHeight = '1.8';
            card.innerHTML = `<span style="color: var(--gold-primary); font-weight: 700; margin-right: 8px;">📌</span> ${p}`;
            listContainer.appendChild(card);
          }
        });
      });
    }

    ringkasanSection.appendChild(listContainer);
  }

  function renderHikmahView() {
    heroChBadge.textContent = 'KOLEKSI EMAS DAKWAH';
    heroMainTitle.textContent = 'Mutiara Hikmah Imam Hasan al-Banna';
    heroArabicTitle.textContent = 'درر الحكمة والجهاد';
    articleContent.style.display = 'none';
    ringkasanSection.style.display = 'none';
    hikmahSection.style.display = 'block';
    bottomNav.style.display = 'none';

    hikmahSection.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'hikmah-grid';

    if (appData.quotes) {
      appData.quotes.forEach(q => {
        const card = document.createElement('div');
        card.className = 'hikmah-card';
        card.innerHTML = `
          <div>
            <div class="hikmah-badge">${q.topic}</div>
            <div class="hikmah-quote-text">"${q.text}"</div>
          </div>
          <div>
            <div class="hikmah-author">— ${q.author}</div>
            <div class="hikmah-lesson">💡 <strong>Iktibar:</strong> ${q.lesson}</div>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    hikmahSection.appendChild(grid);
  }

  function updateBottomNav() {
    const ch = appData.chapters[state.currentChapter];
    if (!ch) return;

    // Previous Button
    if (state.currentSubtopic > 0) {
      btnPrevSub.disabled = false;
      const prevSub = ch.subtopics[state.currentSubtopic - 1];
      btnPrevSub.textContent = `← ${prevSub.menu_title || prevSub.title}`;
    } else if (state.currentChapter > 0) {
      const prevCh = appData.chapters[state.currentChapter - 1];
      btnPrevSub.disabled = false;
      btnPrevSub.textContent = `← ${prevCh.number}`;
    } else {
      btnPrevSub.disabled = true;
      btnPrevSub.textContent = '← Awal Risalah';
    }

    // Next Button
    if (state.currentSubtopic < ch.subtopics.length - 1) {
      btnNextSub.disabled = false;
      const nextSub = ch.subtopics[state.currentSubtopic + 1];
      btnNextSub.textContent = `${nextSub.menu_title || nextSub.title} →`;
    } else if (state.currentChapter < appData.chapters.length - 1) {
      const nextCh = appData.chapters[state.currentChapter + 1];
      btnNextSub.disabled = false;
      btnNextSub.textContent = `${nextCh.number} →`;
    } else {
      btnNextSub.disabled = true;
      btnNextSub.textContent = 'Tamat Risalah →';
    }
  }

  function navigatePrev() {
    if (state.currentSubtopic > 0) {
      state.currentSubtopic--;
    } else if (state.currentChapter > 0) {
      state.currentChapter--;
      const prevCh = appData.chapters[state.currentChapter];
      state.currentSubtopic = prevCh.subtopics.length - 1;
    }
    renderContent();
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function navigateNext() {
    const ch = appData.chapters[state.currentChapter];
    if (state.currentSubtopic < ch.subtopics.length - 1) {
      state.currentSubtopic++;
    } else if (state.currentChapter < appData.chapters.length - 1) {
      state.currentChapter++;
      state.currentSubtopic = 0;
    }
    renderContent();
    renderSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

})();

