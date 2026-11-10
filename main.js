/**
 * Mohit Portfolio — Interactions
 * - Smart Scroll-Direction Navbar (hides on scroll down, reveals on scroll up)
 * - Hero Skill Cards Hover/Tap
 * - Mobile Menu Toggle
 * - Projects Expanding Gallery (1440x1024 active ratio) & Dynamic Descriptions
 * - Work Process Split Panel Timeline & Tag Buttons
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initSkillCards();
  initFloatingTags();
  initAboutRoleCards();
  initAboutTabs();
  initWhatIDoScrollSelection();
  initContactForm();
  initQuickQueryDrawer();
  initMobileMenu();
  initProjectsGallery();
  initWorkProcessTimeline();
  initFluidHoverCard();
  initProjectCaseStudy();
  initCaseStudyTimeline();
  initTextToSpeechTool();
  initCalculatorTool();
});

/**
 * Smart Navbar Scroll Behavior
 * - In Hero section: docked at top
 * - When scrolling DOWN: smoothly slides up out of view
 * - When scrolling UP: immediately slides down into view from above
 */
function initNavbarScroll() {
  const navBar = document.querySelector('.nav-bar');
  if (!navBar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const desktopNav = document.getElementById('desktopNav');
        if (desktopNav && desktopNav.classList.contains('mobile-open')) {
          ticking = false;
          return;
        }

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        // When at the very top of the page
        if (currentScrollY <= 15) {
          navBar.classList.remove('nav-hidden');
          navBar.classList.remove('nav-scrolled');
        }
        // When scrolling DOWN
        else if (scrollDelta > 3 && currentScrollY > 70) {
          navBar.classList.add('nav-hidden');
          navBar.classList.add('nav-scrolled');
        }
        // When scrolling UP
        else if (scrollDelta < -3) {
          navBar.classList.remove('nav-hidden');
          navBar.classList.add('nav-scrolled');
        }

        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/**
 * Project Data Store with exact reference content
 */
const projectsData = {
  brew: {
    id: 'brew',
    title: '7 Brew Café',
    subtitle: 'Website',
    description: 'Researched café websites and visual references through Pinterest, Dribbble, and other sources before designing the complete experience in Figma. I then developed the design in Wix Studio, making it responsive and bringing the final website live.'
  },
  model: {
    id: 'model',
    title: "Model's",
    subtitle: 'Protfolio',
    description: 'Researched model portfolios, layouts, imagery, and presentation styles using ChatGPT and other visual references. I created an initial rough wireframe and then built the complete portfolio directly in Wix Studio, including the visual presentation and responsive layout.'
  },
  musico: {
    id: 'musico',
    title: 'Atsuko -',
    subtitle: 'Play Offline',
    description: 'Atsuko is an offline music player app I designed for Windows, with a focus on making local music feel cleaner and easier to use. I designed the app in Figma and then built the live web app using Antigravity IDE with AI prompting. The final version works as a PWA and can play music from a local folder even when offline.'
  },
  atsuko: {
    id: 'atsuko',
    title: 'Atsuko -',
    subtitle: 'Play Offline',
    description: 'Atsuko is an offline music player app I designed for Windows, with a focus on making local music feel cleaner and easier to use. I designed the app in Figma and then built the live web app using Antigravity IDE with AI prompting. The final version works as a PWA and can play music from a local folder even when offline.'
  },
  calc: {
    id: 'calc',
    title: 'JS Calculator',
    subtitle: 'WebApp',
    description: 'A functional calculator built using HTML, CSS, and JavaScript, featuring a modern interface and a clear button layout for performing everyday mathematical calculations.'
  },
  social: {
    id: 'social',
    title: 'SocialBook',
    subtitle: 'UI Clone',
    description: 'SocialBook is a Facebook-inspired social media UI clone built using HTML, CSS, and JavaScript. It features a home feed, a profile page, interactive navigation, and light and dark modes, with a responsive layout for desktop and tablet screens.'
  }
};

/**
 * Initialize Interactive Expanding Projects Gallery
 */
function initProjectsGallery() {
  const projectCards = document.querySelectorAll('.project-card');
  const descriptionElement = document.getElementById('projectDescription');

  if (!projectCards.length || !descriptionElement) return;

  let currentActiveId = 'brew';
  let switchTimeout = null;

  function setActiveProject(projectId) {
    if (projectId === currentActiveId) return;

    const data = projectsData[projectId];
    if (!data) return;

    currentActiveId = projectId;

    // Update active class on cards
    projectCards.forEach(card => {
      if (card.getAttribute('data-project') === projectId) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // Smooth description transition
    descriptionElement.classList.add('is-switching');

    if (switchTimeout) clearTimeout(switchTimeout);
    const switchDelay = window.innerWidth <= 768 ? 440 : 240;
    switchTimeout = setTimeout(() => {
      descriptionElement.textContent = data.description;
      descriptionElement.classList.remove('is-switching');
    }, switchDelay);
  }

  const isTouchDevice = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  let hoverTimeout = null;

  // Hover and Click Handlers
  projectCards.forEach(card => {
    const projectId = card.getAttribute('data-project');

    // Desktop hover: smoothly expands the hovered card with gentle hover intent
    card.addEventListener('mouseenter', () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        setActiveProject(projectId);
      }, 45);
    });

    card.addEventListener('mouseleave', () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    });

    // Click / Touch Handler:
    // On touch devices, first tap expands/previews the card, second tap opens the case study.
    // On desktop, click immediately navigates to projects.html.
    card.addEventListener('click', (e) => {
      // Do not navigate to case study if clicking the All Projects button or cutout notch
      if (e.target.closest('.all-projects-btn') || e.target.closest('.card-cutout-notch')) {
        return;
      }

      const isMobileView = window.innerWidth <= 768 || isTouchDevice();
      if (isMobileView && card.getAttribute('data-project') !== currentActiveId) {
        e.preventDefault();
        setActiveProject(projectId);
        return;
      }

      const targetKey = (projectId === 'atsuko' || projectId === 'musico') ? 'musico' : projectId;
      window.location.href = `projects.html?project=${targetKey}`;
    });

    // Keyboard accessibility: Enter or Space triggers navigation
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('.all-projects-btn') || e.target.closest('.card-cutout-notch')) {
          return;
        }
        e.preventDefault();
        const targetKey = (projectId === 'atsuko' || projectId === 'musico') ? 'musico' : projectId;
        window.location.href = `projects.html?project=${targetKey}`;
      }
    });
  });

  // Mobile Scroll-Driven Auto-Expansion (Mobile View Only)
  // When scrolling down, cards start closed and automatically expand when reaching the lower-middle zone (~58% of viewport height).
  // The previously open card collapses, and the same seamless behavior occurs when scrolling back up.
  let scrollTicking = false;

  function handleMobileProjectScroll() {
    if (window.innerWidth > 768) return;

    const vh = window.innerHeight;
    const focusY = vh * 0.58;

    const container = document.getElementById('projectsCards');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    if (containerRect.bottom < 0 || containerRect.top > vh) return;

    const cardsArray = Array.from(projectCards);
    const modelCard = cardsArray.find(c => c.getAttribute('data-project') === 'model');
    const musicoCard = cardsArray.find(c => c.getAttribute('data-project') === 'musico');

    if (modelCard && musicoCard) {
      const modelRect = modelCard.getBoundingClientRect();
      const musicoRect = musicoCard.getBoundingClientRect();

      let targetProjectId = 'brew';

      if (musicoRect.top <= focusY) {
        targetProjectId = 'musico';
      } else if (modelRect.top <= focusY) {
        targetProjectId = 'model';
      } else {
        targetProjectId = 'brew';
      }

      if (targetProjectId !== currentActiveId) {
        setActiveProject(targetProjectId);
      }
    }
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleMobileProjectScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
}

/**
 * Initialize Work Process Split Panel Timeline & Tag Buttons
 */
function initWorkProcessTimeline() {
  const steps = document.querySelectorAll('.timeline-step');
  const tagBtns = document.querySelectorAll('.process-tag-btn');
  const processViews = document.querySelectorAll('.process-view');

  function switchProcessView(tag) {
    // Update active button state and accessibility attributes
    tagBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-tag') === tag;
      btn.classList.toggle('is-selected', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    // Update active content view
    processViews.forEach(view => {
      const isMatch = view.getAttribute('data-panel') === tag;
      view.classList.toggle('is-active', isMatch);
      if (isMatch) {
        view.removeAttribute('hidden');
      } else {
        view.setAttribute('hidden', '');
      }
    });
  }

  // Tag buttons click & keyboard selection
  tagBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      switchProcessView(tag);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const tag = btn.getAttribute('data-tag');
        switchProcessView(tag);
      }
    });
  });

  // Timeline Step activation scoped to each timeline container (Works for Home and Case Study)
  const timelineContainers = document.querySelectorAll('.process-timeline');
  timelineContainers.forEach((container) => {
    // Leave case study progressive timeline to initCaseStudyTimeline
    if (container.closest('.case-timeline-container')) return;

    const containerSteps = container.querySelectorAll('.timeline-step');
    containerSteps.forEach((step) => {
      step.addEventListener('click', () => {
        containerSteps.forEach(s => s.classList.remove('is-active'));
        step.classList.add('is-active');
      });

      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          containerSteps.forEach(s => s.classList.remove('is-active'));
          step.classList.add('is-active');
        }
      });
    });
  });
}

/**
 * Initialize Interactive Floating Skill Cards
 * Supports mouse hover, mobile tap toggle, and keyboard accessibility.
 */
function initSkillCards() {
  const skillCards = document.querySelectorAll('.skill-card');

  skillCards.forEach((card) => {
    // Mobile tap & click toggle
    card.addEventListener('click', (e) => {
      const isCurrentlyActive = card.classList.contains('is-active');

      // Close all other cards first
      skillCards.forEach(c => c.classList.remove('is-active'));

      // Toggle current
      if (!isCurrentlyActive) {
        card.classList.add('is-active');
      }
    });

    // Keyboard support (Enter / Space to toggle)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isCurrentlyActive = card.classList.contains('is-active');
        skillCards.forEach(c => c.classList.remove('is-active'));
        if (!isCurrentlyActive) {
          card.classList.add('is-active');
        }
      }
    });
  });

  // Tap/Click outside to collapse active cards
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.skill-card')) {
      skillCards.forEach(card => card.classList.remove('is-active'));
    }
  });
}

/**
 * Initialize Floating Dotted Tag Chips Click/Tap Interaction
 * Tapping a chip increases its opacity to 100%, tapping outside or another resets it
 */
function initFloatingTags() {
  const tags = document.querySelectorAll('.floating-tag-chip');
  if (!tags.length) return;

  tags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyActive = tag.classList.contains('is-active');
      tags.forEach(t => t.classList.remove('is-active'));
      if (!isCurrentlyActive) {
        tag.classList.add('is-active');
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.floating-tag-chip')) {
      tags.forEach(t => t.classList.remove('is-active'));
    }
  });
}

/**
 * Initialize Mobile Hamburger Navigation Toggle
 */
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const desktopNav = document.getElementById('desktopNav');
  const navBar = document.querySelector('.nav-bar');

  if (!hamburgerBtn || !desktopNav) return;

  function closeMenu() {
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.classList.remove('is-active');
    desktopNav.classList.remove('mobile-open');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.classList.add('is-active');
    desktopNav.classList.add('mobile-open');
    document.body.classList.add('menu-open');
    if (navBar) {
      navBar.classList.remove('nav-hidden');
    }
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close mobile nav when clicking a link
  desktopNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-bar') && desktopNav.classList.contains('mobile-open')) {
      closeMenu();
    }
  });
}

/**
 * Initialize About Me Interactive Stretched Role Cards (Designer, Creator, Learner)
 */
function initAboutRoleCards() {
  const roleCards = document.querySelectorAll('.about-role-card');
  if (!roleCards.length) return;

  roleCards.forEach((card) => {
    // Mobile tap & click toggle
    card.addEventListener('click', () => {
      const isCurrentlyActive = card.classList.contains('is-active');
      roleCards.forEach(c => c.classList.remove('is-active'));
      if (!isCurrentlyActive) {
        card.classList.add('is-active');
      }
    });

    // Keyboard accessibility (Enter / Space to toggle)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isCurrentlyActive = card.classList.contains('is-active');
        roleCards.forEach(c => c.classList.remove('is-active'));
        if (!isCurrentlyActive) {
          card.classList.add('is-active');
        }
      }
    });
  });

  // Tap/Click outside to collapse active role cards
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.about-role-card')) {
      roleCards.forEach(card => card.classList.remove('is-active'));
    }
  });
}

/**
 * About Me Page Details Tab Data Store
 */
const aboutTabsData = {
  what: {
    id: 'what',
    text: 'I design user-focused interfaces and responsive websites, starting with research and visual exploration before moving into structured UI design. Figma is my main design tool, while Wix Studio, HTML/CSS, and AI tools help me turn designs into working web experiences. I also create personalized logos and visual assets when a project needs them.'
  },
  journey: {
    id: 'journey',
    text: 'My journey started with exploring web design and learning how digital interfaces are structured and built. I began creating designs in Figma and gradually moved into responsive website building with Wix Studio and HTML/CSS. I’m now expanding my UX knowledge through structured learning and personal projects while working toward becoming a stronger UI/UX and product designer.'
  },
  stats: {
    id: 'stats',
    text: ''
  }
};

/**
 * Initialize About Me Interactive Details Tabs (What do i do? / Journey / Stats)
 */
function initAboutTabs() {
  const tabBtns = document.querySelectorAll('.about-tab-btn');
  const dynamicText = document.getElementById('aboutDynamicText');
  const dynamicPanel = document.getElementById('about-tab-panel');
  const tabPanels = {
    what: document.getElementById('tab-panel-what'),
    journey: document.getElementById('tab-panel-journey'),
    stats: document.getElementById('tab-panel-stats')
  };

  if (!tabBtns.length) return;

  let currentTab = 'what';
  let switchTimeout = null;

  function switchTab(tabId) {
    if (tabId === currentTab) return;
    currentTab = tabId;

    const data = aboutTabsData[tabId];
    if (!data) return;

    // Update tab button active states & ARIA attributes
    tabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    if (dynamicPanel) {
      dynamicPanel.setAttribute('aria-labelledby', `tab-${tabId}`);
    }

    // Switch tab list panels (What do i do | Journey | Stats)
    Object.keys(tabPanels).forEach(key => {
      const panel = tabPanels[key];
      if (!panel) return;
      if (key === tabId) {
        panel.hidden = false;
        panel.classList.remove('is-tab-hidden');
        // Reset selection to first item of active list
        if (typeof window.setTabListActiveItem === 'function') {
          window.setTabListActiveItem(key, 0);
        }
      } else {
        panel.hidden = true;
        panel.classList.add('is-tab-hidden');
      }
    });

    // Smooth description transition
    if (dynamicText) {
      dynamicText.classList.add('is-switching');

      if (switchTimeout) clearTimeout(switchTimeout);
      switchTimeout = setTimeout(() => {
        if (data.text && data.text.trim().length > 0) {
          dynamicText.textContent = data.text;
          dynamicText.classList.remove('is-hidden');
          if (dynamicPanel) dynamicPanel.classList.remove('is-empty');
        } else {
          dynamicText.textContent = '';
          dynamicText.classList.add('is-hidden');
          if (dynamicPanel) dynamicPanel.classList.add('is-empty');
        }
        dynamicText.classList.remove('is-switching');
      }, 160);
    }
  }

  // Click & Keyboard handlers
  tabBtns.forEach((btn, index) => {
    const tabId = btn.getAttribute('data-tab');

    btn.addEventListener('click', () => {
      switchTab(tabId);
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchTab(tabId);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (index + 1) % tabBtns.length;
        const nextTab = tabBtns[nextIndex];
        const nextTabId = nextTab.getAttribute('data-tab');
        switchTab(nextTabId);
        nextTab.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (index - 1 + tabBtns.length) % tabBtns.length;
        const prevTab = tabBtns[prevIndex];
        const prevTabId = prevTab.getAttribute('data-tab');
        switchTab(prevTabId);
        prevTab.focus();
      }
    });
  });
}

/**
 * Initialize What I Do, Journey & Stats Interactive Lists
 * - Ultra-responsive pointer detection on hover & real-time trackpad 2-finger scroll
 * - Hides both top and bottom dashed lines around the selected item in all 3 tabs
 * - Fluid smooth auto-selection across mouse, trackpad, touch, and keyboard navigation
 */
function initWhatIDoScrollSelection() {
  const panelIds = ['what', 'journey', 'stats'];
  const hasPanels = panelIds.some(key => document.getElementById(`tab-panel-${key}`));
  if (!hasPanels) return;

  const tabControllers = {};

  let isTicking = false;
  let lastPointerX = null;
  let lastPointerY = null;

  panelIds.forEach(tabKey => {
    const panel = document.getElementById(`tab-panel-${tabKey}`);
    if (!panel) return;
    const servicesList = panel.querySelector('.what-i-do-services-list');
    const items = panel.querySelectorAll('.what-i-do-item');
    if (!items.length) return;

    let activeIndex = 0;

    function setActiveItem(index) {
      if (index < 0 || index >= items.length) return;
      if (index === activeIndex && items[index].classList.contains('is-selected')) return;

      activeIndex = index;

      items.forEach((item, idx) => {
        const isSelected = (idx === index);
        const isBeforeSelected = (idx === index - 1);

        item.classList.toggle('is-selected', isSelected);
        item.classList.toggle('is-before-selected', isBeforeSelected);
        item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      });
    }

    tabControllers[tabKey] = {
      panel,
      servicesList,
      items,
      setActiveItem,
      getActiveIndex: () => activeIndex
    };

    // Instant pointer hover detection on list items
    if (servicesList) {
      servicesList.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') return;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        const targetItem = e.target.closest('.what-i-do-item');
        if (targetItem) {
          const itemIndex = parseInt(targetItem.getAttribute('data-index'), 10);
          if (!isNaN(itemIndex)) {
            setActiveItem(itemIndex);
          }
        }
      }, { passive: true });
    }

    // Hover, Click & Keyboard handlers on each individual item
    items.forEach((item, idx) => {
      item.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        setActiveItem(idx);
      });

      item.addEventListener('click', () => {
        setActiveItem(idx);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveItem(idx);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = Math.min(items.length - 1, idx + 1);
          setActiveItem(nextIdx);
          items[nextIdx].focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = Math.max(0, idx - 1);
          setActiveItem(prevIdx);
          items[prevIdx].focus();
        }
      });
    });

    // Set initial active state for item 0
    setActiveItem(0);
  });

  // Global helper to switch active item from outside (e.g. on tab change)
  window.setTabListActiveItem = function (tabKey, index) {
    if (tabControllers[tabKey]) {
      tabControllers[tabKey].setActiveItem(index);
    }
  };

  // Track global pointer position (ignoring touch devices)
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    lastPointerX = e.clientX;
    lastPointerY = e.clientY;
  }, { passive: true });

  function handleScrollOrWheel() {
    if (isTicking) return;
    isTicking = true;

    window.requestAnimationFrame(() => {
      // Find currently visible tab panel
      let currentActiveController = null;
      for (const key of panelIds) {
        const ctrl = tabControllers[key];
        if (ctrl && !ctrl.panel.hidden && !ctrl.panel.classList.contains('is-tab-hidden')) {
          currentActiveController = ctrl;
          break;
        }
      }

      if (!currentActiveController) {
        isTicking = false;
        return;
      }

      const items = currentActiveController.items;

      // 1. If cursor is over an item during trackpad 2-finger scroll or wheel scroll:
      if (lastPointerX !== null && lastPointerY !== null) {
        const elUnderCursor = document.elementFromPoint(lastPointerX, lastPointerY);
        const hoveredItem = elUnderCursor ? elUnderCursor.closest('.what-i-do-item') : null;
        if (hoveredItem && currentActiveController.panel.contains(hoveredItem)) {
          const itemIndex = parseInt(hoveredItem.getAttribute('data-index'), 10);
          if (!isNaN(itemIndex)) {
            currentActiveController.setActiveItem(itemIndex);
            isTicking = false;
            return;
          }
        }
      }

      // 2. Otherwise, use viewport focal trigger line (~48% from top of screen)
      const triggerY = window.innerHeight * 0.48;
      let closestIndex = 0;
      let minDistance = Infinity;

      const firstRect = items[0].getBoundingClientRect();
      const lastRect = items[items.length - 1].getBoundingClientRect();

      if (firstRect.top > triggerY) {
        closestIndex = 0;
      } else if (lastRect.bottom < triggerY) {
        closestIndex = items.length - 1;
      } else {
        items.forEach((item, idx) => {
          const rect = item.getBoundingClientRect();
          const itemCenter = rect.top + rect.height / 2;
          const distance = Math.abs(itemCenter - triggerY);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = idx;
          }
        });
      }

      currentActiveController.setActiveItem(closestIndex);
      isTicking = false;
    });
  }

  window.addEventListener('scroll', handleScrollOrWheel, { passive: true });
  window.addEventListener('wheel', handleScrollOrWheel, { passive: true });
  window.addEventListener('resize', handleScrollOrWheel, { passive: true });

  // Run initial state calculation
  handleScrollOrWheel();
}

/**
 * Initialize Contact Page Minimal Form Submission with Web3Forms & Custom Success Pop-Up
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusMsg = document.getElementById('formStatusMsg');
  const proceedBtn = document.getElementById('contactProceedBtn');
  const successModal = document.getElementById('contactSuccessModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalConfirmBtn = document.getElementById('modalConfirmBtn');

  if (!form) return;

  let isSubmitting = false;

  // Open custom success modal
  function openSuccessModal() {
    if (!successModal) return;
    successModal.classList.add('is-open');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalConfirmBtn) {
      setTimeout(() => modalConfirmBtn.focus(), 80);
    }
  }

  // Close custom success modal
  function closeSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove('is-open');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (proceedBtn) {
      proceedBtn.focus();
    }
  }

  // Dismiss modal via buttons
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeSuccessModal);
  }
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', closeSuccessModal);
  }

  // Dismiss modal by clicking outside on backdrop
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        closeSuccessModal();
      }
    });
  }

  // Dismiss modal via keyboard (Escape key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('is-open')) {
      closeSuccessModal();
    }
  });

  // Handle Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions while in progress
    if (isSubmitting) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    // Clear previous status
    if (statusMsg) {
      statusMsg.textContent = '';
      statusMsg.classList.remove('is-error', 'is-visible');
    }

    // Required fields validation
    if (!name || !email || !message) {
      if (statusMsg) {
        statusMsg.textContent = 'Please fill in all fields.';
        statusMsg.classList.add('is-error', 'is-visible');
      }
      if (!name && nameInput) nameInput.focus();
      else if (!email && emailInput) emailInput.focus();
      else if (!message && messageInput) messageInput.focus();
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (statusMsg) {
        statusMsg.textContent = 'Please enter a valid email address.';
        statusMsg.classList.add('is-error', 'is-visible');
      }
      if (emailInput) emailInput.focus();
      return;
    }

    // Lock submission & show loading state
    isSubmitting = true;
    if (proceedBtn) {
      proceedBtn.disabled = true;
      proceedBtn.innerHTML = '<span class="contact-btn-spinner" aria-hidden="true"></span>Sending...';
    }

    try {
      const formData = new FormData(form);
      const jsonObject = Object.fromEntries(formData.entries());

      // Ensure access_key is set to user's Web3Forms access key
      if (!jsonObject.access_key) {
        jsonObject.access_key = '92028fcf-a97e-41ae-a2ba-775df10412e0';
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jsonObject)
      });

      const result = await response.json();

      if (response.status === 200 && result.success) {
        // Success: Reset form inputs and open success pop-up
        form.reset();

        if (statusMsg) {
          statusMsg.textContent = '';
          statusMsg.classList.remove('is-error', 'is-visible');
        }

        openSuccessModal();
      } else {
        // Handled submission error from Web3Forms
        const errorMsg = (result && result.message) ? result.message : 'Submission failed. Please try again.';
        if (statusMsg) {
          statusMsg.textContent = errorMsg;
          statusMsg.classList.add('is-error', 'is-visible');
        }
      }
    } catch (err) {
      // Network error or unexpected rejection
      if (statusMsg) {
        statusMsg.textContent = 'Network error. Please check your connection or reach out on socials.';
        statusMsg.classList.add('is-error', 'is-visible');
      }
    } finally {
      // Unlock submission and restore proceed button
      isSubmitting = false;
      if (proceedBtn) {
        proceedBtn.disabled = false;
        proceedBtn.innerHTML = 'Proceed';
      }
    }
  });
}

/**
 * Initialize Contact Page Quick Query Expandable Drawer (#7F7F7F)
 * Supports URL query parameters & homepage footer shortcuts to auto-fill the message textarea
 */
function initQuickQueryDrawer() {
  const queryCard = document.getElementById('quickQueryCard');
  const queryButtons = document.querySelectorAll('.qq-option-btn');
  const messageInput = document.getElementById('contactMessage');

  // Check URL parameters or session storage for pre-filling query from footer buttons (e.g. contact.html?query=meet)
  if (messageInput) {
    let rawQuery = '';
    try {
      const urlParams = new URLSearchParams(window.location.search);
      rawQuery = urlParams.get('query') || urlParams.get('q') || urlParams.get('message') || '';
      if (!rawQuery) {
        rawQuery = sessionStorage.getItem('contact_prefill_query') || '';
        sessionStorage.removeItem('contact_prefill_query');
      }
    } catch (e) {
      console.warn('Query param inspection error:', e);
    }

    if (rawQuery) {
      const qLower = rawQuery.toLowerCase();
      let textToFill = '';

      if (qLower === 'meet' || qLower.includes('meet')) {
        textToFill = 'I would like to book a Google Meet to discuss a new design project.';
      } else if (qLower === 'brand' || qLower.includes('brand')) {
        textToFill = 'I want to create a brand identity and logo design for my business.';
      } else if (qLower === 'site' || qLower.includes('site')) {
        textToFill = 'I need a quick, modern, and responsive website built efficiently.';
      } else if (qLower === 'template' || qLower.includes('template')) {
        textToFill = 'I want a custom Figma or Wix Studio template tailored to my specifications.';
      } else if (qLower === 'mobile' || qLower.includes('mobile')) {
        textToFill = 'I want a dedicated mobile version and responsive optimization for my website.';
      } else {
        textToFill = rawQuery;
      }

      if (textToFill) {
        messageInput.value = textToFill;
        // Position cursor at end of input
        setTimeout(() => {
          messageInput.focus();
          messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
        }, 120);
      }
    }
  }

  // Footer Action Buttons navigation & sessionStorage fallback (runs on index.html)
  const footerActionRow = document.querySelector('.footer-action-row');
  if (footerActionRow) {
    footerActionRow.querySelectorAll('.footer-dashed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const href = btn.getAttribute('href');
        if (href && href.includes('query=')) {
          const match = href.match(/query=([^&]+)/);
          if (match && match[1]) {
            try {
              sessionStorage.setItem('contact_prefill_query', match[1]);
            } catch (err) {}
          }
        }
      });
    });
  }

  if (!queryCard) return;

  // Mobile / Touch click toggle
  queryCard.addEventListener('click', (e) => {
    if (!e.target.closest('.qq-option-btn')) {
      queryCard.classList.toggle('is-active');
    }
  });

  // Keyboard accessibility (Enter / Space)
  queryCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!e.target.closest('.qq-option-btn')) {
        e.preventDefault();
        queryCard.classList.toggle('is-active');
      }
    }
  });

  // Clicking a Quick Query option pre-fills the message field
  queryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const queryText = btn.getAttribute('data-query');
      if (messageInput && queryText) {
        messageInput.value = queryText;
        messageInput.focus();
        // Collapse the card on mobile after selection
        queryCard.classList.remove('is-active');
      }
    });
  });

  // Click outside to close on mobile
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#quickQueryCard')) {
      queryCard.classList.remove('is-active');
    }
  });
}

/**
 * Projects Page: Fluid Mouse-Following Hover Card for 7 Brew Café Project
 * - Sticks above the mouse cursor top-tip when hovering over the first project
 * - Smooth lerp tracking (buttery-smooth fluid motion)
 * - Viewport edge collision detection to prevent overflow
 */
function initFluidHoverCard() {
  const hoverCard = document.getElementById('fluidHoverCard');
  if (!hoverCard) return;

  const hoverTitle = hoverCard.querySelector('.hover-card-title');
  const hoverDesc = hoverCard.querySelector('.hover-card-description');

  const cardData = {
    brew: {
      title: '<span class="hover-title-underlined">Design.</span> Wix Studio.',
      desc: 'Researched café websites and visual references through Pinterest, Dribbble, and other sources before designing the complete experience in Figma. I then developed the design in Wix Studio, making it responsive and bringing the final website live.'
    },
    model: {
      title: '<span class="hover-title-underlined">Design.</span> Wix Studio.',
      desc: 'Researched model portfolios, layouts, imagery, and presentation styles using ChatGPT and other visual references. I created an initial rough wireframe and then built the complete portfolio directly in Wix Studio, including the visual presentation and responsive layout.'
    },
    art: {
      title: '',
      desc: 'Working and building my own personal brand.'
    },
    watson: {
      title: '<span class="hover-title-underlined">Design.</span> Figma.',
      desc: "Writer's Portfolio is a simple and minimal portfolio website concept for a book writer. The goal was to create a clean space to showcase the writer, their books, and important information in a simple way."
    },
    mohit: {
      title: '<span class="hover-title-underlined">UI/UX.</span> Web Design.',
      desc: 'A personal portfolio designed in Figma to showcase my projects, design skills, and creative work through a clean, minimal, and interactive experience.'
    },
    coffee: {
      title: '<span class="hover-title-underlined">Concept.</span> Figma.',
      desc: 'A minimal login page concept designed in Figma, featuring a custom logo, a dark visual theme, and a clean, focused layout. The design aims to create a simple and visually appealing login experience.'
    },
    artist: {
      title: '<span class="hover-title-underlined">Artist.</span> Scrapbook UI.',
      desc: 'A custom-designed portfolio concept for Sarah, an artist, combining a scrapbook-inspired aesthetic with a clean, personalized layout. Designed to showcase her artwork, creative process, and personality.'
    },
    gallery: {
      title: '<span class="hover-title-underlined">Photo.</span> Gallery App.',
      desc: 'Photos is an offline photo gallery app concept designed to make browsing, organizing, and viewing images easier with square albums, poster collections, and an immersive photo viewer.'
    },
    musico: {
      title: '<span class="hover-title-underlined">Music.</span> Web & Mobile.',
      desc: 'Musico is a modern music web app and mobile experience designed for discovering, organizing, and playing tracks effortlessly with intuitive controls and playlist curation.'
    },
    notes: {
      title: '<span class="hover-title-underlined">Notes.</span> Journal WebApp.',
      desc: 'Notes is an offline note-taking app concept designed to help users write, organize, and manage their ideas privately featuring folders, journals, and a distraction-free writing canvas.'
    },
    speech: {
      title: '<span class="hover-title-underlined">Tool.</span> Web Speech API.',
      desc: 'A simple text-to-speech tool built using HTML, CSS, and Javascript. It allows users to enter text, select a voice, and convert written content into speech through a clean, straightforward interface.'
    },
    calc: {
      title: '<span class="hover-title-underlined">JS.</span> Calculator.',
      desc: 'A functional calculator built using HTML, CSS, and JavaScript, featuring a modern interface and a clear button layout for performing everyday mathematical calculations.'
    },
    social: {
      title: '<span class="hover-title-underlined">Social.</span> Media UI Clone.',
      desc: 'SocialBook is a Facebook-inspired social media UI clone built using HTML, CSS, and JavaScript with feed, profile page, interactive navigation, and dark/light modes.'
    }
  };

  const interactiveCards = document.querySelectorAll('[data-hover-project]');
  if (!interactiveCards.length) return;

  let isHovered = false;
  let currentCard = null;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let cardW = 320;
  let cardH = 140;
  let winWidth = window.innerWidth;
  let rafId = null;

  window.addEventListener('resize', () => {
    winWidth = window.innerWidth;
  }, { passive: true });

  function isAnyOverlayOpen() {
    const openOverlay = document.querySelector('.project-case-overlay.is-open');
    return !!openOverlay;
  }

  function calculateTargetPosition(clientX, clientY) {
    let x = clientX - cardW / 2;
    let y = clientY - cardH - 14;

    const minX = 16;
    const maxX = winWidth - cardW - 16;
    x = Math.max(minX, Math.min(x, maxX));

    if (y < 75) {
      y = clientY + 22;
    }

    targetX = x;
    targetY = y;
  }

  function renderLoop() {
    if (!isHovered) {
      rafId = null;
      return;
    }

    const dx = targetX - currentX;
    const dy = targetY - currentY;

    if (Math.abs(dx) < 0.25 && Math.abs(dy) < 0.25) {
      currentX = targetX;
      currentY = targetY;
      hoverCard.style.transform = `translate3d(${Math.round(currentX)}px, ${Math.round(currentY)}px, 0)`;
      rafId = null;
      return;
    }

    currentX += dx * 0.22;
    currentY += dy * 0.22;

    hoverCard.style.transform = `translate3d(${Math.round(currentX)}px, ${Math.round(currentY)}px, 0)`;

    rafId = requestAnimationFrame(renderLoop);
  }

  interactiveCards.forEach(card => {
    const projectKey = card.getAttribute('data-hover-project');
    const data = cardData[projectKey];
    if (!data) return;

    card.addEventListener('mouseenter', (e) => {
      if (isAnyOverlayOpen()) return;

      isHovered = true;
      currentCard = card;

      if (hoverTitle) {
        if (data.title && data.title.trim()) {
          hoverTitle.innerHTML = data.title;
          hoverTitle.style.display = '';
        } else {
          hoverTitle.innerHTML = '';
          hoverTitle.style.display = 'none';
        }
      }
      if (hoverDesc) hoverDesc.textContent = data.desc;

      cardW = hoverCard.offsetWidth || 320;
      cardH = hoverCard.offsetHeight || 140;

      calculateTargetPosition(e.clientX, e.clientY);

      currentX = targetX;
      currentY = targetY;
      hoverCard.style.transform = `translate3d(${Math.round(currentX)}px, ${Math.round(currentY)}px, 0)`;
      hoverCard.classList.add('is-visible');

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(renderLoop);
    });

    card.addEventListener('mousemove', (e) => {
      if (!isHovered || currentCard !== card) return;
      calculateTargetPosition(e.clientX, e.clientY);
      if (!rafId) {
        rafId = requestAnimationFrame(renderLoop);
      }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      if (currentCard === card) {
        isHovered = false;
        currentCard = null;
        hoverCard.classList.remove('is-visible');
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    });

    card.addEventListener('focus', () => {
      if (isAnyOverlayOpen()) return;
      const rect = card.getBoundingClientRect();
      isHovered = true;
      currentCard = card;

      if (hoverTitle) {
        if (data.title && data.title.trim()) {
          hoverTitle.innerHTML = data.title;
          hoverTitle.style.display = '';
        } else {
          hoverTitle.innerHTML = '';
          hoverTitle.style.display = 'none';
        }
      }
      if (hoverDesc) hoverDesc.textContent = data.desc;

      cardW = hoverCard.offsetWidth || 320;
      cardH = hoverCard.offsetHeight || 140;

      calculateTargetPosition(rect.left + rect.width / 2, rect.top + 80);
      currentX = targetX;
      currentY = targetY;
      hoverCard.style.transform = `translate3d(${Math.round(currentX)}px, ${Math.round(currentY)}px, 0)`;
      hoverCard.classList.add('is-visible');
    });

    card.addEventListener('blur', () => {
      if (currentCard === card) {
        isHovered = false;
        currentCard = null;
        hoverCard.classList.remove('is-visible');
      }
    });
  });
}

/**
 * Project Case Study Slide-Up Overlay Interactions (Supports Multi-Project: 7 Brew Café & Amilia Moralise)
 * - State 1: Slides up smoothly from bottom on project card click (covers header, full width)
 * - State 2: Minimizes to a sticky bottom bar ('Project Overview' + Up arrow) when clicking toggle arrow
 * - Clicking the minimized bar / arrow slides it back up to top
 * - Closes / minimizes on Escape key or clicking backdrop
 */
function initProjectCaseStudy() {
  const backdrop = document.getElementById('caseOverlayBackdrop');
  const hoverCard = document.getElementById('fluidHoverCard');

  let activeOverlay = null;
  let activeProjectId = null;
  let isCaseMinimized = false;

  function openCaseStudy(projectId) {
    const targetOverlay = document.getElementById(`projectCaseOverlay-${projectId}`);
    if (!targetOverlay) return;

    // If another overlay is open, close it
    if (activeOverlay && activeOverlay !== targetOverlay) {
      activeOverlay.classList.remove('is-open', 'is-minimized');
      activeOverlay.setAttribute('aria-hidden', 'true');
    }

    activeOverlay = targetOverlay;
    activeProjectId = projectId;
    isCaseMinimized = false;
    document.body.style.overflow = 'hidden';

    // Immediately hide cursor hover card
    if (hoverCard) {
      hoverCard.classList.remove('is-visible');
    }

    requestAnimationFrame(() => {
      targetOverlay.classList.add('is-open');
      targetOverlay.classList.remove('is-minimized');
      if (backdrop) backdrop.classList.add('is-visible');
      targetOverlay.setAttribute('aria-hidden', 'false');

      const headerBar = targetOverlay.querySelector('.case-header-bar');
      if (headerBar) headerBar.setAttribute('aria-expanded', 'true');

      // Trigger progressive scroll check after slide-up
      if (window.checkActiveCaseTimeline) {
        setTimeout(() => window.checkActiveCaseTimeline(targetOverlay), 450);
      }
    });
  }

  function minimizeCaseStudy() {
    if (!activeOverlay) return;

    const scrollBody = activeOverlay.querySelector('.case-scroll-body');
    if (scrollBody) {
      scrollBody.scrollTop = 0;
    }

    isCaseMinimized = true;
    activeOverlay.classList.remove('is-open');
    activeOverlay.classList.add('is-minimized');
    if (backdrop) backdrop.classList.remove('is-visible');

    const headerBar = activeOverlay.querySelector('.case-header-bar');
    if (headerBar) headerBar.setAttribute('aria-expanded', 'false');

    if (window.resetCaseTimeline) {
      window.resetCaseTimeline(activeOverlay);
    }
    document.body.style.overflow = '';

    // If page had a project URL parameter, clean it up smoothly so user stays on projects list
    try {
      if (window.location.search.includes('project=') || window.location.search.includes('open=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (_) { }
  }

  function toggleCaseStudy() {
    if (isCaseMinimized) {
      if (activeProjectId) openCaseStudy(activeProjectId);
    } else if (activeOverlay && activeOverlay.classList.contains('is-open')) {
      minimizeCaseStudy();
    }
  }

  // Click on Project Cards (Projects 1 to 10)
  const projectCardBindings = [
    { id: 'featuredProjectCard', key: 'brew' },
    { id: 'projectCardAmilia', key: 'model' },
    { id: 'projectCardWatson', key: 'watson' },
    { id: 'projectCardMohit', key: 'mohit' },
    { id: 'projectCardCoffee', key: 'coffee' },
    { id: 'projectCardArtist', key: 'artist' },
    { id: 'projectCardGallery', key: 'gallery' },
    { id: 'projectCardMusico', key: 'musico' },
    { id: 'projectCardNotes', key: 'notes' },
    { id: 'projectCardSpeech', key: 'speech' },
    { id: 'projectCardCalc', key: 'calc' },
    { id: 'projectCardSocial', key: 'social' }
  ];

  projectCardBindings.forEach(({ id, key }) => {
    const cardEl = document.getElementById(id);
    if (cardEl) {
      cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openCaseStudy(key);
      });

      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCaseStudy(key);
        }
      });
    }
  });

  // Bind controls on each case study overlay
  const overlays = document.querySelectorAll('.project-case-overlay');
  overlays.forEach(overlay => {
    const headerBar = overlay.querySelector('.case-header-bar');
    const toggleBtn = overlay.querySelector('.case-toggle-btn');

    if (headerBar) {
      headerBar.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCaseStudy();
      });

      headerBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCaseStudy();
        }
      });
    }

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCaseStudy();
      });
    }

    // Clicking the minimized bar anywhere expands it back up
    overlay.addEventListener('click', () => {
      if (isCaseMinimized && activeProjectId) {
        openCaseStudy(activeProjectId);
      }
    });

    // View live site / design button inside tech card scrolls smoothly to relevant step (unless it links to an external site)
    const liveSiteBtn = overlay.querySelector('.case-live-btn');
    if (liveSiteBtn) {
      liveSiteBtn.addEventListener('click', (e) => {
        if (liveSiteBtn.hasAttribute('href') || liveSiteBtn.hasAttribute('onclick')) {
          e.stopPropagation();
          return;
        }
        e.stopPropagation();
        const targetStep = overlay.querySelector('.timeline-step[data-step="4"]') || overlay.querySelector('.timeline-step[data-step="3"]');
        if (targetStep) {
          const stepNum = parseInt(targetStep.getAttribute('data-step'), 10);
          const steps = overlay.querySelectorAll('.timeline-step');
          steps.forEach((s, idx) => {
            if (idx < stepNum) s.classList.add('is-active');
          });
          targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  });

  // Backdrop click minimizes the active case study
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      if (activeOverlay && !isCaseMinimized) {
        minimizeCaseStudy();
      }
    });
  }

  // Escape key minimizes the active case study
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeOverlay && !isCaseMinimized) {
      minimizeCaseStudy();
    }
  });

  // URL parameter / hash auto-open support (e.g. projects.html?project=brew, projects.html?project=model, projects.html?project=musico)
  try {
    const validProjects = ['brew', 'model', 'watson', 'mohit', 'coffee', 'artist', 'gallery', 'musico', 'notes', 'speech', 'calc', 'social'];
    const urlParams = new URLSearchParams(window.location.search);
    let targetProject = urlParams.get('project') || urlParams.get('open') || (window.location.hash ? window.location.hash.replace('#', '') : null);
    if (targetProject === 'atsuko') {
      targetProject = 'musico';
    }
    if (targetProject && validProjects.includes(targetProject)) {
      setTimeout(() => {
        openCaseStudy(targetProject);
      }, 250);
    }
  } catch (err) {
    // Graceful fallback
  }
}

/**
 * Progressive Scroll-Driven Case Study Timeline (Supports both 7 Brew Café and Amilia Moralise)
 * - Research (Step 1) is active by default with the black circle node
 * - Steps 2-6 start inactive with the white circle node
 * - As user scrolls down inside overlay .case-scroll-body, each step activates progressively
 * - CRITICAL REQUIREMENT: Previous steps REMAIN OPEN and do not close!
 * - Clicking a step header also activates it and all preceding steps immediately
 */
function initCaseStudyTimeline() {
  const overlays = document.querySelectorAll('.project-case-overlay');
  if (!overlays.length) return;

  overlays.forEach(overlay => {
    const scrollBody = overlay.querySelector('.case-scroll-body');
    const caseTimeline = overlay.querySelector('.case-timeline-container .process-timeline');
    if (!scrollBody || !caseTimeline) return;

    const steps = Array.from(caseTimeline.querySelectorAll('.timeline-step'));
    if (steps.length === 0) return;

    // Step 1 active by default; subsequent steps start inactive
    steps[0].classList.add('is-active');
    for (let i = 1; i < steps.length; i++) {
      steps[i].classList.remove('is-active');
    }

    let isTicking = false;
    let lastActivationTime = 0;
    let activeTimer = null;
    let activePendingStep = null;

    function evaluateScrollProgress() {
      const scrollRect = scrollBody.getBoundingClientRect();
      const triggerY = scrollRect.bottom - 45;

      const nextInactiveIdx = steps.findIndex((s) => !s.classList.contains('is-active'));
      if (nextInactiveIdx === -1) {
        isTicking = false;
        return;
      }

      const now = performance.now();
      if (now - lastActivationTime < 650) {
        isTicking = false;
        return;
      }

      const nextStep = steps[nextInactiveIdx];
      const stepRect = nextStep.getBoundingClientRect();

      if (stepRect.top <= triggerY) {
        if (activePendingStep !== nextStep) {
          if (activeTimer) clearTimeout(activeTimer);
          activePendingStep = nextStep;
          activeTimer = setTimeout(() => {
            nextStep.classList.add('is-active');
            lastActivationTime = performance.now();
            activeTimer = null;
            activePendingStep = null;
          }, 450);
        }
      } else if (stepRect.top > triggerY + 70) {
        if (activePendingStep === nextStep) {
          if (activeTimer) clearTimeout(activeTimer);
          activeTimer = null;
          activePendingStep = null;
        }
      }

      isTicking = false;
    }

    scrollBody.addEventListener('scroll', () => {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(evaluateScrollProgress);
      }
    }, { passive: true });

    const activateUpTo = (targetIdx) => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
        activePendingStep = null;
      }
      for (let i = 0; i <= targetIdx; i++) {
        steps[i].classList.add('is-active');
      }
      lastActivationTime = performance.now();
    };

    steps.forEach((step, idx) => {
      step.addEventListener('click', () => {
        activateUpTo(idx);
      });

      step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activateUpTo(idx);
        }
      });
    });

    overlay._resetCaseTimeline = () => {
      if (activeTimer) {
        clearTimeout(activeTimer);
        activeTimer = null;
        activePendingStep = null;
      }
      lastActivationTime = 0;
      steps[0].classList.add('is-active');
      for (let i = 1; i < steps.length; i++) {
        steps[i].classList.remove('is-active');
      }
    };

    overlay._checkCaseTimelineProgress = () => {
      requestAnimationFrame(evaluateScrollProgress);
    };
  });

  window.resetCaseTimeline = (overlay) => {
    if (overlay && overlay._resetCaseTimeline) {
      overlay._resetCaseTimeline();
    }
  };

  window.checkActiveCaseTimeline = (overlay) => {
    if (overlay && overlay._checkCaseTimelineProgress) {
      overlay._checkCaseTimelineProgress();
    }
  };
}

/**
 * Project 10: Interactive Web Speech API Text To Speech Engine
 * - Populates system voices into the voice selector dropdown
 * - Speaks user-entered text with instant playback
 */
function initTextToSpeechTool() {
  const playBtns = document.querySelectorAll('.speech-tool-play-btn, .speech-preview-btn');
  const textarea = document.getElementById('speechToolText');
  const voiceSelect = document.getElementById('speechToolVoice');

  if (!textarea && !playBtns.length) return;
  if (!('speechSynthesis' in window)) return;

  let voices = [];

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
    if (voiceSelect) {
      voiceSelect.innerHTML = '';
      voices.forEach((v, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = `${v.name} (${v.lang})`;
        if (v.default) opt.selected = true;
        voiceSelect.appendChild(opt);
      });
      if (voices.length === 0) {
        const opt = document.createElement('option');
        opt.textContent = 'Default Browser Voice';
        voiceSelect.appendChild(opt);
      }
    }
  }

  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;

  playBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let text = 'Hello! Welcome to Mohit\'s design portfolio.';
      if (textarea && textarea.value.trim()) {
        text = textarea.value.trim();
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (voiceSelect && voices[voiceSelect.value]) {
        utterance.voice = voices[voiceSelect.value];
      }
      window.speechSynthesis.speak(utterance);
    });
  });
}

/**
 * Interactive JS Calculator (Project 11)
 * Powers both the case study hero device and live site testing keypad
 */
function initCalculatorTool() {
  function setupCalcInstance(keypadId, displayId, initialVal = '0') {
    const keypad = document.getElementById(keypadId);
    const display = document.getElementById(displayId);
    if (!keypad || !display) return;

    let currentExp = initialVal;
    let justCalculated = false;

    function updateDisplay(val) {
      display.textContent = val;
    }

    function evaluateExpression(exp) {
      if (!/^[\d\s+\-*/.]+$/.test(exp)) return 'Error';
      try {
        const sanitized = exp.replace(/([+\-*/])\s*([+\-*/])/g, '$2');
        const res = new Function(`'use strict'; return (${sanitized})`)();
        if (isNaN(res) || !isFinite(res)) return 'Error';
        return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(6)).toString();
      } catch (err) {
        return 'Error';
      }
    }

    const buttons = keypad.querySelectorAll('[data-calc]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-calc');

        if (action === 'ac') {
          currentExp = '0';
          justCalculated = false;
        } else if (action === 'de') {
          if (justCalculated) {
            currentExp = '0';
            justCalculated = false;
          } else {
            currentExp = currentExp.length > 1 ? currentExp.slice(0, -1) : '0';
          }
        } else if (action === '=') {
          const result = evaluateExpression(currentExp);
          currentExp = result;
          justCalculated = true;
        } else {
          // Numbers and operators
          const isOperator = ['+', '-', '*', '/'].includes(action);
          if (justCalculated && !isOperator) {
            currentExp = action === '.' ? '0.' : action;
            justCalculated = false;
          } else {
            justCalculated = false;
            if (currentExp === '0' && action !== '.') {
              currentExp = action;
            } else {
              // Avoid multiple consecutive operators
              if (isOperator && ['+', '-', '*', '/'].includes(currentExp.slice(-1))) {
                currentExp = currentExp.slice(0, -1) + action;
              } else if (action === '.') {
                const parts = currentExp.split(/[+\-*/]/);
                const lastNum = parts[parts.length - 1];
                if (!lastNum.includes('.')) {
                  currentExp += action;
                }
              } else {
                currentExp += action;
              }
            }
          }
        }

        updateDisplay(currentExp);
      });
    });
  }

  // Setup instances for case study overlay
  setupCalcInstance('caseCalcKeypad', 'caseCalcDisplay', '275');
  setupCalcInstance('liveCalcKeypad', 'liveCalcDisplay', '0');

  // Explore buttons smooth feedback
  const exploreCalcBtn = document.getElementById('exploreCalcProjectBtn');
  if (exploreCalcBtn) {
    exploreCalcBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const liveDevice = document.getElementById('liveCalcDevice');
      if (liveDevice) {
        liveDevice.scrollIntoView({ behavior: 'smooth', block: 'center' });
        liveDevice.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        liveDevice.style.transform = 'scale(1.04)';
        liveDevice.style.boxShadow = '0 0 30px rgba(56, 228, 210, 0.4)';
        setTimeout(() => {
          liveDevice.style.transform = '';
          liveDevice.style.boxShadow = '';
        }, 600);
      }
    });
  }

  const exploreSocialBtn = document.getElementById('exploreSocialProjectBtn');
  if (exploreSocialBtn) {
    exploreSocialBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mockImg = document.querySelector('.social-livesite-img');
      if (mockImg) {
        mockImg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        mockImg.style.transition = 'transform 0.4s ease';
        mockImg.style.transform = 'scale(1.03)';
        setTimeout(() => {
          mockImg.style.transform = '';
        }, 600);
      }
    });
  }
}






