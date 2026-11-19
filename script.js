let cachedScale = Math.min(1, window.innerWidth / 1920);
let sectionOffsets = {};
let cachedLayers = { top:1688, height:678 };
let cachedSteps = { top:3072, height:4222 };

const ACCESS_KEY = 'b5aefd93-8fe3-4f54-b533-186e8dd7df55'; 
const signup = document.querySelector('.signup');
const signupEmail = signup.querySelector('[name="email"]');
const signupButton = signup.querySelector('.signup-button');
const signupButtonLabel = signupButton.querySelector('span');
const signupStatus = signup.querySelector('.signup-status');

signup.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (signupButton.disabled) return;

  signupStatus.textContent = '';
  signupEmail.value = signupEmail.value.trim();

  if (!signupEmail.checkValidity()) {
    signupStatus.textContent = 'Introduce un correo válido.';
    signupEmail.focus();
    return;
  }

  if (!ACCESS_KEY || ACCESS_KEY.includes('PEGA_AQUI')) {
    signupStatus.textContent = 'Configura la clave de acceso para activar el registro.';
    return;
  }

  const formData = new FormData(signup);
  formData.append('access_key', ACCESS_KEY);
  formData.append('subject', 'Nuevo registro en Waiting List - Entre Capas');

  const originalLabel = signupButtonLabel.textContent;
  signupButton.disabled = true;
  signupButtonLabel.textContent = 'ENVIANDO...';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();

    if (!response.ok || result.success !== true) {
      throw new Error(result.message || `Error HTTP ${response.status}`);
    }

    signupStatus.textContent = '¡Ya estás en la lista! Gracias por unirte.';
    signup.reset();
  } catch (error) {
    console.error('Error al registrar el correo:', error);
    signupStatus.textContent = 'No se pudo enviar. Inténtalo de nuevo.';
  } finally {
    signupButton.disabled = false;
    signupButtonLabel.textContent = originalLabel;
  }
});

function cacheLayout() {
  cachedScale = Math.min(1, window.innerWidth / 1920);
  document.documentElement.style.setProperty('--scale', String(cachedScale));
  sectionOffsets = {
    '#concepto': document.querySelector('.pilot')?.offsetTop || 1021,
    '#capas': document.querySelector('.layers')?.offsetTop || 1688,
    '#archivo': document.querySelector('.archive')?.offsetTop || 8452
  };
  const layers = document.querySelector('.layers');
  const steps = document.querySelector('.steps');
  cachedLayers = { top:layers?.offsetTop || 1688, height:layers?.offsetHeight || 678 };
  cachedSteps = { top:steps?.offsetTop || 3072, height:steps?.offsetHeight || 4222 };
}

function fitDesign() {
  const scale = Math.min(1, window.innerWidth / 1920);
  document.documentElement.style.setProperty('--scale', String(scale));
  document.documentElement.style.setProperty('--mobile-scale', String(document.documentElement.clientWidth / 390));
  cacheLayout();
}

fitDesign();
window.addEventListener('resize', fitDesign);

cacheLayout();
window.addEventListener('resize', cacheLayout);

const mobileTickerMedia = window.matchMedia('(max-width:768px)');
const tickers = Array.from(document.querySelectorAll('.ticker'), (ticker) => ({
  element: ticker,
  text: ticker.firstChild
}));
function updateMobileTickers() {
  tickers.forEach(({ element, text }) => {
    if (mobileTickerMedia.matches && text.parentNode === element) {
      const first = document.createElement('span');
      const duplicate = document.createElement('span');
      duplicate.textContent = text.textContent;
      duplicate.setAttribute('aria-hidden', 'true');
      first.appendChild(text);
      element.append(first, duplicate);
    } else if (!mobileTickerMedia.matches && text.parentNode !== element) {
      element.replaceChildren(text);
    }
  });
}
updateMobileTickers();
mobileTickerMedia.addEventListener('change', updateMobileTickers);

const archiveVideo = document.querySelector('.archive-video');
const archiveHeading = document.querySelector('.archive-heading');
const archiveSection = document.querySelector('.archive');
function placeArchiveVideo() {
  if (mobileTickerMedia.matches && archiveVideo.parentElement !== archiveHeading) {
    archiveHeading.prepend(archiveVideo);
  } else if (!mobileTickerMedia.matches && archiveVideo.parentElement !== archiveSection) {
    archiveSection.insertBefore(archiveVideo, archiveHeading);
  }
}
placeArchiveVideo();
mobileTickerMedia.addEventListener('change', placeArchiveVideo);

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const destinations = {
      '#concepto': '.pilot-title',
      '#capas': '.layer-title',
      '#como-funciona': '.steps-header h2',
      '#layers': '.steps-header h2',
      '#archivo': '.archive-title'
    };
    const isFooterHome = button.closest('.footer') && button.dataset.scroll === '#concepto';
    const target = document.querySelector(destinations[button.dataset.scroll]);
    const shell = document.querySelector('.stage-shell');
    const design = document.querySelector('.design');
    shell.scrollTop = 0;
    design.scrollTop = 0;
    closeMobileMenu();
    if (isFooterHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target) {
      const headerHeight = document.querySelector('.header-fixed').getBoundingClientRect().height;
      window.scrollTo({
        top: Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight),
        behavior: 'smooth'
      });
    }
  }, true);
});

const mobileTrigger = document.querySelector('.mobile-nav-trigger');
const mobileDropdown = document.querySelector('.mobile-dropdown');

function closeMobileMenu() {
  mobileTrigger.classList.remove('is-open');
  mobileDropdown.classList.remove('is-open');
  mobileTrigger.setAttribute('aria-expanded', 'false');
  mobileTrigger.setAttribute('aria-label', 'Abrir menú');
}

mobileTrigger.addEventListener('click', () => {
  const isOpen = mobileTrigger.classList.toggle('is-open');
  mobileDropdown.classList.toggle('is-open', isOpen);
  mobileTrigger.setAttribute('aria-expanded', String(isOpen));
  mobileTrigger.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.mobile-nav-actions')) closeMobileMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMobileMenu();
});

document.querySelectorAll('.archive-screen, .app-phone-mockup').forEach((screen) => {
  const tilt = screen.querySelector('[data-phone-tilt]');
  const glare = screen.querySelector('[data-phone-glare]');
  if (!tilt) return;

  const applyTilt = (clientX, clientY) => {
    const rect = screen.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    const rotateY = x * 14;
    const rotateX = y * -14;

    tilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    if (glare) {
      glare.style.transform = `translate(${rotateY * 0.8}px, ${rotateX * -0.5}px) rotate(4deg)`;
      glare.style.opacity = '1';
    }
  };

  const resetTilt = () => {
    tilt.style.transform = 'rotateX(0deg) rotateY(0deg)';
    if (glare) {
      glare.style.transform = 'translate(0, 0) rotate(4deg)';
    }
  };

  screen.addEventListener('mousemove', (event) => applyTilt(event.clientX, event.clientY));
  screen.addEventListener('mouseleave', resetTilt);
  screen.addEventListener('touchmove', (event) => {
    if (event.touches.length) {
      const touch = event.touches[0];
      applyTilt(touch.clientX, touch.clientY);
    }
  }, { passive: true });
  screen.addEventListener('touchend', resetTilt);
  screen.addEventListener('touchcancel', resetTilt);
});


{
  const layers = document.querySelector('.layers');
  const bandTransforms = [
    [document.querySelector('.band-pink'), -777],
    [document.querySelector('.band-orange'), -1282],
    [document.querySelector('.band-blue'), -1536]
  ];
  const titleTransforms = [
    [document.querySelector('.band-title-one'), -768],
    [document.querySelector('.band-title-two'), -1282],
    [document.querySelector('.band-title-three'), -1536]
  ];
  let bandFrame = 0;

  const updateBands = () => {
    bandFrame = 0;
    if (!layers) return;
    const mobile = window.matchMedia('(max-width:768px)').matches;
    const layerRect = layers.getBoundingClientRect();
    const rectTop = mobile ? layerRect.top : cachedLayers.top * cachedScale - window.scrollY;
    const rectHeight = mobile ? layerRect.height : cachedLayers.height * cachedScale;
    const rawProgress = (window.innerHeight - rectTop) / (rectHeight + window.innerHeight * .35);
    const progress = Math.max(0, Math.min(1, rawProgress * (mobile ? 1.2 : 1)));
    bandTransforms.forEach(([element, desktopOffset], index) => {
      const offset = mobile ? [-468, -312, -156][index] : desktopOffset;
      if (element) element.style.transform = `translateY(${(offset * progress).toFixed(2)}px)`;
    });
    titleTransforms.forEach(([element, desktopOffset], index) => {
      const offset = mobile ? [-468, -312, -156][index] : desktopOffset;
      if (element) element.style.transform = `translateY(${(offset * progress).toFixed(2)}px)`;
    });

    const stepsContainer = document.querySelector('.steps');
    const stepElements = [
      document.querySelector('.step-one'),
      document.querySelector('.step-two'),
      document.querySelector('.step-three'),
      document.querySelector('.step-four')
    ];
    if (stepsContainer) {
      const scaleProperty = mobile ? '--mobile-scale' : '--scale';
      const scale = Math.max(.01, parseFloat(getComputedStyle(document.documentElement).getPropertyValue(scaleProperty)) || 1);
      const scrollY = window.scrollY;

      stepElements.forEach((step, index) => {
        if (!step) return;
        const naturalTop = stepsContainer.offsetTop + step.offsetTop;
        const stepsBottom = stepsContainer.offsetTop + stepsContainer.offsetHeight - step.offsetHeight;
        const anchorY = mobile ? 40 + index * 20 : 20 + index * 2;

        let clampedOffset = 0;
        if (scrollY / scale > naturalTop - anchorY) {
          const offset = (scrollY / scale) - naturalTop + anchorY;
          const lastStep = stepElements[stepElements.length - 1];
          const maxTravel = mobile && lastStep
            ? Math.max(0, stepsContainer.offsetTop + lastStep.offsetTop - naturalTop + (index - 3) * 20)
            : stepsBottom - naturalTop;
          clampedOffset = Math.max(0, Math.min(offset, maxTravel));
        }

        const nextStep = stepElements[index + 1];
        let overlap = 0;
        if (nextStep) {
          const nextNaturalTop = stepsContainer.offsetTop + nextStep.offsetTop;
          const nextAnchorY = mobile ? 40 + (index + 1) * 20 : 20 + (index + 1) * 2;
          const nextStop = nextNaturalTop - nextAnchorY;
          const cardHeight = step.offsetHeight || 920;
          const rawProgress = (scrollY / scale - (nextStop - cardHeight)) / cardHeight;
          overlap = Math.max(0, Math.min(1, rawProgress));
        }

        const cardScale = 1 - overlap * 0.06;
        const cardOpacity = 1 - overlap * 0.18;
        step.style.transform = `translate3d(0, ${clampedOffset.toFixed(2)}px, 0) scale(${cardScale.toFixed(4)})`;
        step.style.opacity = cardOpacity.toFixed(3);
      });
    }
  };
  const requestBandUpdate = () => {
    if (!bandFrame) bandFrame = requestAnimationFrame(updateBands);
  };
  addEventListener('scroll', requestBandUpdate, { passive:true });
  addEventListener('resize', requestBandUpdate);
  updateBands();

  document.querySelectorAll('.sense-button').forEach((button) => {
    const activate = () => {
      document.querySelectorAll('.sense-button').forEach((item) => {
        item.classList.remove('is-active');
        item.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');
    };
    button.addEventListener('click', activate);
  });

  const steps = document.querySelectorAll('.step');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold:.18 });
    steps.forEach((step) => observer.observe(step));
  }
}

if (window.Matter) {
  const Matter = window.Matter;
  const footer = document.querySelector('.footer');
  if (footer) {
    if (getComputedStyle(footer).position === 'static') {
      footer.style.position = 'relative';
    }

    const originalEls = Array.from(footer.querySelectorAll('.shape-one, .shape-two, .shape-three'));
    const extractedSrcs = originalEls
      .map((el) => (el.tagName === 'IMG' ? el.src : el.querySelector('img')?.src))
      .filter(Boolean);

    footer.classList.add('has-footer-physics');
    originalEls.forEach((el) => {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });

    const shapeConfigs = [
      { type: 'triangle', color: '#FF6B4A', src: extractedSrcs[0] || 'assets/icons/ff8e3.svg' },
      { type: 'circle',   color: '#FFD166', src: extractedSrcs[1] || 'assets/icons/c57cb.svg' },
      { type: 'hexagon',  color: '#06D6A0', src: extractedSrcs[2] || 'assets/icons/56429.svg' }
    ];

    const images = {};
    shapeConfigs.forEach((cfg) => {
      const img = new Image();
      img.src = cfg.src;
      images[cfg.type] = img;
    });

    const canvas = document.createElement('canvas');
    canvas.className = 'footer-matter-canvas';
    canvas.width = 1920;
    canvas.height = 1552;
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1920px',
      height: '1552px',
      pointerEvents: 'none',
      zIndex: '1'
    });
    footer.insertBefore(canvas, footer.firstChild);
    const context = canvas.getContext('2d');

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.2, scale: 0.001 }
    });
    const world = engine.world;

    const wallOptions = { isStatic: true, restitution: 0.65, friction: 0.15 };
    const bodies = [];
    const timers = [];
    let rainStarted = false;
    let mobilePhysics = window.matchMedia('(max-width:768px)').matches;

    const configurePhysics = () => {
      const width = mobilePhysics ? 390 : 1920;
      const height = mobilePhysics ? 346 : 1552;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      Matter.Composite.add(world, [
        Matter.Bodies.rectangle(-40, height / 2, 80, height + 248, wallOptions),
        Matter.Bodies.rectangle(width + 40, height / 2, 80, height + 248, wallOptions),
        Matter.Bodies.rectangle(width / 2, mobilePhysics ? 347 : 1441, width, 80, wallOptions)
      ]);
    };
    configurePhysics();

    const spawnRain = () => {
      if (rainStarted) return;
      rainStarted = true;

      for (let i = 0; i < 48; i++) {
        timers.push(setTimeout(() => {
          const cfg = shapeConfigs[i % shapeConfigs.length];
          const scale = 0.6 + Math.random() * 0.35;
          const radius = mobilePhysics ? (14 + Math.random() * 5) * scale : (68 + Math.random() * 24) * scale;
          const x = mobilePhysics ? 25 + Math.random() * 340 : 140 + Math.random() * 1640;
          const y = mobilePhysics ? 10 + Math.random() * 15 : 30 + Math.random() * 60;

          const bodyOptions = {
            restitution: 0.65,
            friction: 0.15,
            frictionAir: 0.01,
            density: 0.0015
          };

          const body = cfg.type === 'circle'
            ? Matter.Bodies.circle(x, y, radius, bodyOptions)
            : Matter.Bodies.polygon(x, y, cfg.type === 'triangle' ? 3 : 6, radius, bodyOptions);

          body.plugin.shapeType = cfg.type;
          body.plugin.shapeColor = cfg.color;
          body.plugin.displayRadius = radius;

          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 6,
            y: 2 + Math.random() * 3
          });
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);

          bodies.push(body);
          Matter.Composite.add(world, body);
        }, i * 45));
      }
    };

    const checkFooterScroll = () => {
      if (rainStarted) return;
      const rect = footer.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        spawnRain();
        window.removeEventListener('scroll', checkFooterScroll);
      }
    };
    window.addEventListener('scroll', checkFooterScroll, { passive: true });
    checkFooterScroll();
    window.addEventListener('resize', () => {
      const nextMobile = window.matchMedia('(max-width:768px)').matches;
      if (nextMobile === mobilePhysics) return;
      timers.forEach(clearTimeout);
      timers.length = 0;
      bodies.length = 0;
      Matter.Composite.clear(world, false);
      mobilePhysics = nextMobile;
      rainStarted = false;
      configurePhysics();
      window.addEventListener('scroll', checkFooterScroll, { passive: true });
      checkFooterScroll();
    });

    let pointer = null;
    const updatePointer = (clientX, clientY) => {
      const rect = footer.getBoundingClientRect();
      const scale = mobilePhysics ? rect.width / footer.offsetWidth : Math.max(
        0.01,
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--scale')) || 1
      );
      pointer = {
        x: (clientX - rect.left) / scale,
        y: (clientY - rect.top) / scale
      };
    };
    footer.addEventListener('mousemove', (event) => updatePointer(event.clientX, event.clientY));
    footer.addEventListener('mouseleave', () => {
      pointer = null;
    });
    footer.addEventListener('touchstart', (event) => {
      if (event.touches.length) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });
    footer.addEventListener('touchmove', (event) => {
      if (event.touches.length) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });
    footer.addEventListener('touchend', () => { pointer = null; });
    footer.addEventListener('touchcancel', () => { pointer = null; });

    Matter.Events.on(engine, 'beforeUpdate', () => {
      if (!pointer) return;
      bodies.forEach((body) => {
        const dx = body.position.x - pointer.x;
        const dy = body.position.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const range = mobilePhysics ? 65 : 230;
        if (distance > 0 && distance < range) {
          const strength = 0.0022 * (1 - distance / range) * body.mass;
          Matter.Body.applyForce(body, body.position, {
            x: (dx / distance) * strength,
            y: (dy / distance) * strength - strength * 0.5
          });
          Matter.Body.setAngularVelocity(
            body,
            body.angularVelocity + (dx < 0 ? -0.025 : 0.025)
          );
        }
      });
    });

    const animatePhysics = () => {
      Matter.Engine.update(engine, 16.667);
      context.clearRect(0, 0, canvas.width, canvas.height);

      bodies.forEach((body) => {
        const img = images[body.plugin.shapeType];
        const size = body.plugin.displayRadius * 2.3;

        context.save();
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);

        if (img && img.complete && img.naturalWidth > 0) {
          context.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
          context.fillStyle = body.plugin.shapeColor;
          context.beginPath();
          const r = body.plugin.displayRadius;
          if (body.plugin.shapeType === 'circle') {
            context.arc(0, 0, r, 0, Math.PI * 2);
          } else {
            const sides = body.plugin.shapeType === 'triangle' ? 3 : 6;
            for (let s = 0; s < sides; s++) {
              const a = (s * 2 * Math.PI) / sides - Math.PI / 2;
              if (s === 0) context.moveTo(r * Math.cos(a), r * Math.sin(a));
              else context.lineTo(r * Math.cos(a), r * Math.sin(a));
            }
            context.closePath();
          }
          context.fill();
        }
        context.restore();
      });

      requestAnimationFrame(animatePhysics);
    };
    requestAnimationFrame(animatePhysics);
  }
}