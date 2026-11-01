/**
 * UI Design Elements 2D Infinite Canvas Engine (ui-canvas.js)
 * Implements smooth Figma/Miro-style pan, zoom, minimap radar, and lightbox.
 */
document.addEventListener('DOMContentLoaded', () => {
  const viewport = document.getElementById('canvasViewport');
  const board = document.getElementById('canvasBoard');
  const boardWrapper = document.getElementById('canvasBoardWrapper') || board;
  const centerZone = document.getElementById('zoneCenter');
  
  // Controls
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const btnZoomReset = document.getElementById('btnZoomReset');
  const btnCenter = document.getElementById('btnCenterCanvas');
  const zoomText = document.getElementById('zoomPercentText');
  const ctrlZoneBox = document.getElementById('ctrlZoneBox');
  const zoneBoxLabel = document.getElementById('zoneBoxLabel');

  // Minimap
  const minimap = document.getElementById('canvasMinimap');
  const minimapBoard = document.getElementById('minimapBoard');
  const minimapRadar = document.getElementById('minimapRadar');
  const miniZones = document.querySelectorAll('.mini-zone');

  // Zone configuration & active zone mapping
  const ZONE_CONFIG = {
    home: { label: 'Home', color: '#FFFFFF' },
    coding: { label: 'Front-End Projects', color: '#47F2E0' },
    sketches: { label: 'Sketchbook', color: '#FFB74D' },
    ui: { label: 'Design Projects', color: '#B388FF' },
    hire: { label: 'Hire Me', color: '#00E5FF' }
  };
  let currentZoneKey = 'home';
  let previewZoneKey = null;

  // Lightbox
  const lightbox = document.getElementById('canvasLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxCloseBtn');

  if (!viewport || !board) return;

  // Canvas state
  let currentZoom = 1.0;
  const minZoom = 0.45;
  const maxZoom = 2.0;
  const zoomStep = 0.15;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let scrollStartX = 0;
  let scrollStartY = 0;
  let hasMoved = false;

  // Board dimensions
  const boardWidth = 3632;
  const boardHeight = 2648;

  // Cached measurements to prevent synchronous layout recalculations during panning
  let cachedVpW = viewport.clientWidth;
  let cachedVpH = viewport.clientHeight;
  let cachedMiniW = minimapBoard ? minimapBoard.clientWidth : 200;
  let cachedMiniH = minimapBoard ? minimapBoard.clientHeight : 145;

  function refreshCachedDimensions() {
    cachedVpW = viewport.clientWidth;
    cachedVpH = viewport.clientHeight;
    if (minimapBoard) {
      cachedMiniW = minimapBoard.clientWidth;
      cachedMiniH = minimapBoard.clientHeight;
    }
  }

  /**
   * Smoothly Centers on the Initial Hero Focus Zone (Explore My Portfolio & Mayra Showcase)
   * Vertically frames Explore_ MyPortfolio clearly visible below the top navigation bar.
   */
  function centerHeroView(smooth = true) {
    if (!centerZone) return;
    refreshCachedDimensions();
    const vpWidth = cachedVpW;
    const vpHeight = cachedVpH;

    // Center zone coordinates on board
    const zoneLeft = centerZone.offsetLeft;
    const zoneTop = centerZone.offsetTop;
    const zoneWidth = centerZone.offsetWidth;

    // Horizontally position so Explore_ MyPortfolio has generous padding on the left and is never cut off
    let targetX = (zoneLeft + 30 - 70) * currentZoom;
    if (vpWidth > zoneWidth * currentZoom + 140) {
      targetX = (zoneLeft * currentZoom) - (vpWidth - zoneWidth * currentZoom) / 2;
    }

    // Vertically frame the hero header and showcase (Explore_ MyPortfolio clearly visible below top nav)
    const heroHeader = document.querySelector('.canvas-hero-header');
    const navBar = document.querySelector('.canvas-top-nav');
    const navHeight = navBar ? navBar.offsetHeight : 64;

    let heroTopOnBoard = zoneTop + 146; // Default hero top board Y: 582 + 146 = 728px
    if (heroHeader) {
      const headerH = heroHeader.offsetHeight || 244;
      heroTopOnBoard = zoneTop + heroHeader.offsetTop - headerH;
    }

    // Position Explore_ MyPortfolio ~26px below the fixed top navigation bar
    const targetY = (heroTopOnBoard * currentZoom) - (navHeight + 26);

    viewport.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: smooth ? 'smooth' : 'auto'
    });
  }

  // Initial load alignment (center hero view immediately)
  setTimeout(() => {
    centerHeroView(false);
    updateMinimap();
    updateZoneIndicator('home');
  }, 60);

  /**
   * Mouse Drag-to-Pan (Figma Hand Tool behavior)
   */
  viewport.addEventListener('mousedown', (e) => {
    // If clicking a control or button or link, don't drag
    if (e.target.closest('.canvas-controls-panel') || 
        e.target.closest('.canvas-minimap-wrap') || 
        e.target.closest('.canvas-top-nav') ||
        e.target.closest('.canvas-lightbox-modal') ||
        e.target.closest('.canvas-center-actions') ||
        e.target.closest('a, button, .hub-query-btn, .hub-account-card')) {
      return;
    }
    isDragging = true;
    hasMoved = false;
    viewport.classList.add('is-dragging');
    startX = e.clientX;
    startY = e.clientY;
    scrollStartX = viewport.scrollLeft;
    scrollStartY = viewport.scrollTop;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved = true;
    }

    viewport.scrollLeft = scrollStartX - dx;
    viewport.scrollTop = scrollStartY - dy;
    updateMinimap();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      viewport.classList.remove('is-dragging');
    }
  });

  /**
   * Touch Pan Support for Mobile / Tablets
   */
  let touchStartX = 0;
  let touchStartY = 0;
  let touchScrollX = 0;
  let touchScrollY = 0;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchScrollX = viewport.scrollLeft;
      touchScrollY = viewport.scrollTop;
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      viewport.scrollLeft = touchScrollX - dx;
      viewport.scrollTop = touchScrollY - dy;
      updateMinimap();
    }
  }, { passive: true });

  /**
   * Scroll listener to update minimap live
   */
  viewport.addEventListener('scroll', () => {
    requestAnimationFrame(updateMinimap);
  }, { passive: true });

  /**
   * Wheel Event: Ctrl+Wheel or Pinch zooms into cursor; regular wheel pans
   */
  viewport.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      applyZoom(currentZoom * zoomFactor, e.clientX, e.clientY);
    }
  }, { passive: false });

  /**
   * Zoom Controls Engine with Focal Point Support
   */
  function applyZoom(newZoom, focalClientX = null, focalClientY = null) {
    newZoom = Math.min(maxZoom, Math.max(minZoom, newZoom));
    if (Math.abs(newZoom - currentZoom) < 0.005) return;

    // Viewport relative focal coordinates
    let vpX = viewport.clientWidth / 2;
    let vpY = viewport.clientHeight / 2;

    if (focalClientX !== null && focalClientY !== null) {
      const rect = viewport.getBoundingClientRect();
      vpX = focalClientX - rect.left;
      vpY = focalClientY - rect.top;
    }

    // World coordinate at focal point
    const worldX = (viewport.scrollLeft + vpX) / currentZoom;
    const worldY = (viewport.scrollTop + vpY) / currentZoom;

    currentZoom = newZoom;

    // Apply scale to board & expand boardWrapper so scroll boundaries stay accurate
    board.style.transform = `scale(${currentZoom})`;
    board.style.transformOrigin = '0 0';
    if (boardWrapper && boardWrapper !== board) {
      boardWrapper.style.width = `${boardWidth * currentZoom}px`;
      boardWrapper.style.height = `${boardHeight * currentZoom}px`;
    }

    if (zoomText) {
      zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    // Re-align scroll so the point under cursor remains pinned
    viewport.scrollLeft = worldX * currentZoom - vpX;
    viewport.scrollTop = worldY * currentZoom - vpY;

    refreshCachedDimensions();
    updateMinimap();
  }

  btnZoomIn?.addEventListener('click', () => applyZoom(currentZoom + zoomStep));
  btnZoomOut?.addEventListener('click', () => applyZoom(currentZoom - zoomStep));
  btnZoomReset?.addEventListener('click', () => applyZoom(1.0));
  btnCenter?.addEventListener('click', () => {
    applyZoom(1.0);
    centerHeroView(true);
    updateZoneIndicator('home');
  });

  /**
   * Keyboard Navigation Shortcuts (+, -, 0, Space)
   */
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === '+' || e.key === '=') {
      applyZoom(currentZoom + zoomStep);
    } else if (e.key === '-' || e.key === '_') {
      applyZoom(currentZoom - zoomStep);
    } else if (e.key === '0') {
      applyZoom(1.0);
      centerHeroView(true);
    }
  });

  /**
   * Minimap Radar Synchronization & Click-to-Jump
   * Coalesced into requestAnimationFrame to prevent layout thrashing
   */
  let minimapRafPending = false;

  function updateMinimap() {
    if (minimapRafPending) return;
    minimapRafPending = true;
    requestAnimationFrame(renderMinimap);
  }

  function renderMinimap() {
    minimapRafPending = false;
    if (!minimapRadar || !minimapBoard) return;

    const totalBoardW = boardWidth * currentZoom;
    const totalBoardH = boardHeight * currentZoom;

    const radarW = Math.max(16, (cachedVpW / totalBoardW) * cachedMiniW);
    const radarH = Math.max(12, (cachedVpH / totalBoardH) * cachedMiniH);

    const radarX = (viewport.scrollLeft / totalBoardW) * cachedMiniW;
    const radarY = (viewport.scrollTop / totalBoardH) * cachedMiniH;

    minimapRadar.style.width = `${radarW}px`;
    minimapRadar.style.height = `${radarH}px`;
    minimapRadar.style.transform = `translate3d(${radarX}px, ${radarY}px, 0)`;

    // Check if active zone changed and update indicator
    const activeZone = previewZoneKey || detectActiveZone();
    if (activeZone !== currentZoneKey) {
      updateZoneIndicator(activeZone);
    }
  }

  /**
   * Dynamically detects which section/zone the user viewport is centered on.
   */
  function detectActiveZone() {
    const vpCenterX = (viewport.scrollLeft + cachedVpW / 2) / currentZoom;
    const vpCenterY = (viewport.scrollTop + cachedVpH / 2) / currentZoom;

    // 1. Coding Zone (Left side of board)
    if (vpCenterX < 740) {
      return 'coding';
    }
    // 2. Sketches Zone (Top strip of board)
    if (vpCenterY < 640) {
      return 'sketches';
    }
    // 3. UI Design Elements (Right side of board)
    if (vpCenterX >= 2150) {
      return 'ui';
    }
    // 4. Interactive Hub / Hire Me (Bottom-middle of board)
    if (vpCenterY >= 1480) {
      return 'hire';
    }
    // 5. Central Hero View (Home)
    return 'home';
  }

  /**
   * Updates the dynamic section badge with smooth transitions.
   */
  function updateZoneIndicator(forcedZone = null) {
    if (!ctrlZoneBox || !zoneBoxLabel) return;

    const targetZone = forcedZone || previewZoneKey || detectActiveZone();
    if (targetZone === currentZoneKey && !forcedZone) return;

    currentZoneKey = targetZone;
    const config = ZONE_CONFIG[targetZone] || ZONE_CONFIG.home;

    zoneBoxLabel.textContent = config.label;
    ctrlZoneBox.setAttribute('data-zone', targetZone);
  }

  /**
   * Smoothly navigates viewport to any zone
   */
  function jumpToZone(zoneKey) {
    if (zoneKey === 'home') {
      centerHeroView(true);
      updateZoneIndicator('home');
      return;
    }

    let targetX = 0;
    let targetY = 0;

    if (zoneKey === 'coding') {
      targetX = 60 * currentZoom;
      targetY = 252 * currentZoom;
    } else if (zoneKey === 'sketches') {
      targetX = 740 * currentZoom;
      targetY = 102 * currentZoom;
    } else if (zoneKey === 'ui') {
      targetX = (2180 - 40) * currentZoom;
      targetY = 592 * currentZoom;
    } else if (zoneKey === 'hire') {
      targetX = 800 * currentZoom;
      targetY = 1510 * currentZoom;
    }

    viewport.scrollTo({
      left: Math.max(0, targetX),
      top: Math.max(0, targetY),
      behavior: 'smooth'
    });

    setTimeout(() => {
      updateZoneIndicator(zoneKey);
    }, 150);
  }

  // Click on active section badge to re-focus that zone
  ctrlZoneBox?.addEventListener('click', () => {
    jumpToZone(currentZoneKey);
  });

  // Minimap zone interactive hover previews & clicks
  miniZones.forEach(zoneEl => {
    const zoneKey = zoneEl.getAttribute('data-zone');
    if (!zoneKey) return;

    // Hover preview in indicator box
    zoneEl.addEventListener('mouseenter', () => {
      previewZoneKey = zoneKey;
      updateZoneIndicator(zoneKey);
    });

    zoneEl.addEventListener('mouseleave', () => {
      previewZoneKey = null;
      updateZoneIndicator();
    });

    // Click to pan directly to that zone
    zoneEl.addEventListener('click', (e) => {
      e.stopPropagation();
      previewZoneKey = null;
      jumpToZone(zoneKey);
    });
  });

  // Minimap Click-to-Pan
  minimap?.addEventListener('click', (e) => {
    const rect = minimapBoard.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const ratioX = clickX / rect.width;
    const ratioY = clickY / rect.height;

    const totalBoardW = boardWidth * currentZoom;
    const totalBoardH = boardHeight * currentZoom;

    viewport.scrollTo({
      left: ratioX * totalBoardW - viewport.clientWidth / 2,
      top: ratioY * totalBoardH - viewport.clientHeight / 2,
      behavior: 'smooth'
    });
  });

  /**
   * Lightbox Modal for Full Artwork Inspection
   */
  const cards = document.querySelectorAll('.canvas-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // If user was dragging to pan, don't open modal
      if (hasMoved) return;
      if (e.target.closest('a, button')) return;

      const img = card.querySelector('.canvas-img');
      if (!img) return;

      const captionText = card.getAttribute('aria-label') || img.getAttribute('alt') || 'UI Design Artwork';
      const fullSrc = img.getAttribute('data-full-src') || img.src;
      const modalRotate = card.getAttribute('data-modal-rotate');

      lightboxImg.src = fullSrc;
      lightboxImg.alt = captionText;
      lightboxCaption.textContent = captionText;

      if (modalRotate) {
        lightboxImg.style.transform = `rotate(${modalRotate}deg)`;
        lightboxImg.style.maxWidth = '75vh';
        lightboxImg.style.maxHeight = '75vw';
      } else {
        lightboxImg.style.transform = '';
        lightboxImg.style.maxWidth = '';
        lightboxImg.style.maxHeight = '';
      }

      lightbox.showModal();
    });

    // Keyboard access
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  const resetLightbox = () => {
    lightbox.close();
    lightboxImg.style.transform = '';
    lightboxImg.style.maxWidth = '';
    lightboxImg.style.maxHeight = '';
  };

  lightboxClose?.addEventListener('click', resetLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) resetLightbox();
  });
  lightbox?.addEventListener('close', () => {
    lightboxImg.style.transform = '';
    lightboxImg.style.maxWidth = '';
    lightboxImg.style.maxHeight = '';
  });

  // Track window resizing with passive listener
  window.addEventListener('resize', () => {
    refreshCachedDimensions();
    updateMinimap();
  }, { passive: true });
});
