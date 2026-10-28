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

      if (pClean.startsWith('<!-- PAGE') || (pClean.startsWith('*<!--') && pClean.endsWith('-->*'))) {
        const pageBadge = document.createElement('div');
        pageBadge.style.margin = '2rem 0 1rem 0';
        pageBadge.style.textAlign = 'center';
        pageBadge.innerHTML = `<span style="background: rgba(52, 211, 153, 0.15); color: var(--emerald-light); font-size: 0.76rem; font-weight: 700; padding: 3px 12px; border-radius: 9999px; border: 1px solid rgba(52, 211, 153, 0.3);">${pClean.replace(/\*|<!--|-->/g, '').trim()}</span>`;
        articleContent.appendChild(pageBadge);
      } else if (pClean.startsWith('"') || pClean.startsWith('“') || pClean.startsWith('”') || pClean.startsWith('«') || pClean.startsWith('> ')) {
        const quoteBox = document.createElement('blockquote');
        quoteBox.textContent = pClean.replace(/^>\s*/, '');
        articleContent.appendChild(quoteBox);
      } else if (/^(?:i|ii|iii|iv|v|vi|vii)\)/i.test(pClean)) {
        const h4El = document.createElement('h4');
        h4El.style.color = 'var(--gold-primary)';
        h4El.style.fontSize = '1.1rem';
        h4El.style.fontWeight = '700';
        h4El.style.margin = '2.2rem 0 0.75rem 0';
        h4El.style.paddingBottom = '6px';
        h4El.style.borderBottom = '1px solid rgba(245, 197, 66, 0.25)';
        h4El.textContent = pClean;
        articleContent.appendChild(h4El);
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

    ringkasanSection.innerHTML = '';

    const introBox = document.createElement('div');
    introBox.style.background = 'rgba(5, 150, 105, 0.1)';
    introBox.style.border = '1px solid rgba(52, 211, 153, 0.3)';
    introBox.style.borderRadius = '14px';
    introBox.style.padding = '1.25rem 1.5rem';
    introBox.style.marginBottom = '2rem';
    introBox.innerHTML = `
      <p style="font-weight: 700; color: var(--gold-primary); margin-bottom: 0.4rem; font-size: 1.05rem;">💡 Rumusan 27 Prinsip Kebangkitan:</p>
      <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">Berikut adalah rumusan padat 27 prinsip yang digariskan oleh Al-Imam Hasan al-Banna di bahagian akhir risalah 'Antara Semalam dan Hari Ini' sebagai panduan kebangkitan umat, tersusun rapi dari nombor 1 hingga 27 dari atas ke bawah.</p>
    `;
    ringkasanSection.appendChild(introBox);

    const listContainer = document.createElement('div');
    listContainer.className = 'ringkasan-list';
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = '1rem';

    const items = (appData.ringkasan_27 && appData.ringkasan_27.length > 0) 
      ? appData.ringkasan_27 
      : [];

    if (items.length > 0) {
      items.forEach(it => {
        const card = document.createElement('div');
        card.className = 'ringkasan-item';
        card.innerHTML = `
          <div class="ringkasan-num-badge">${it.num}</div>
          <div class="ringkasan-text" style="color: var(--text-primary); font-size: 1rem; line-height: 1.8; flex: 1;">
            ${it.text}
          </div>
        `;
        listContainer.appendChild(card);
      });
    } else {
      // Fallback sekiranya tiada array ringkasan_27
      const lastCh = appData.chapters[appData.chapters.length - 1];
      if (lastCh && lastCh.subtopics) {
        let count = 1;
        lastCh.subtopics.forEach(st => {
          st.paragraphs.forEach(p => {
            const pClean = p.trim();
            if (pClean && !pClean.startsWith('<!-- PAGE')) {
              const card = document.createElement('div');
              card.className = 'ringkasan-item';
              card.innerHTML = `
                <div class="ringkasan-num-badge">${count++}</div>
                <div class="ringkasan-text" style="color: var(--text-primary); font-size: 1rem; line-height: 1.8; flex: 1;">${pClean}</div>
              `;
              listContainer.appendChild(card);
            }
          });
        });
      }
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

