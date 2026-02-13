// ===== MOBILE NAV TOGGLE =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ===== SCROLL REVEAL =====
const revealElements = document.querySelectorAll('.obra-card, .sobre-content, .contato-form');
revealElements.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => observer.observe(el));

// ===== STAT COUNTER ANIMATION =====
const statNumbers = document.querySelectorAll('.stat-number');
let statAnimated = false;

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statAnimated) {
      statAnimated = true;
      statNumbers.forEach(num => {
        const target = parseInt(num.dataset.target);
        const duration = 1500;
        const step = target / (duration / 16);
        let current = 0;

        const counter = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          num.textContent = Math.floor(current);
        }, 16);
      });
    }
  });
}, { threshold: 0.5 });

statNumbers.forEach(num => statObserver.observe(num));

// ===== EXTRACT DOMINANT COLOR & SET DYNAMIC BLUR BG =====
function extractColor(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Sample at small size for performance
  canvas.width = 64;
  canvas.height = 64;
  ctx.drawImage(img, 0, 0, 64, 64);

  const data = ctx.getImageData(0, 0, 64, 64).data;
  let r = 0, g = 0, b = 0, count = 0;

  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);

  return { r, g, b };
}

function applyDynamicBlur() {
  document.querySelectorAll('.obra-card').forEach(card => {
    const blurBg = card.querySelector('.obra-blur-bg');
    const mainImg = card.querySelector('.obra-image-wrapper img');

    if (!mainImg.complete) {
      mainImg.addEventListener('load', () => applyColorToCard(mainImg, blurBg, card));
    } else {
      applyColorToCard(mainImg, blurBg, card);
    }
  });
}

function applyColorToCard(img, blurBg, card) {
  try {
    const { r, g, b } = extractColor(img);

    // Apply a radial gradient glow using the image's dominant color
    blurBg.style.background = `
      radial-gradient(ellipse at 50% 30%, rgba(${r},${g},${b}, 0.5) 0%, transparent 70%),
      radial-gradient(ellipse at 30% 80%, rgba(${r},${g},${b}, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 60%, rgba(${r},${g},${b}, 0.25) 0%, transparent 50%),
      rgba(${r},${g},${b}, 0.08)
    `;

    // Also add a subtle border glow
    card.style.boxShadow = `0 4px 40px rgba(${r},${g},${b}, 0.12)`;
    card.style.border = `1px solid rgba(${r},${g},${b}, 0.1)`;

    // Hide the blur <img> since we're using extracted color gradients
    const blurImg = blurBg.querySelector('img');
    if (blurImg) blurImg.style.display = 'none';
  } catch (e) {
    // If canvas extraction fails (CORS), keep the blur image fallback
  }
}

applyDynamicBlur();

// ===== NAVBAR BG ON SCROLL =====
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(10, 10, 10, 0.92)';
  } else {
    nav.style.background = 'rgba(10, 10, 10, 0.7)';
  }
});

// ===== PÁGINA FULL-PAGE DE ETAPAS =====
const obrasData = {
  1: { title: 'Casa em Alvenaria', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'] },
  2: { title: 'Área de Lazer', images: ['3.jpg', '1.jpg', '4.jpg', '2.jpg'] },
  3: { title: 'Sobrado Completo', images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'] }
};

const pageOverlay = document.getElementById('pageOverlay');
const pageTitle = pageOverlay.querySelector('.page-title');
const pageGallery = pageOverlay.querySelector('.page-gallery');
const pageBack = pageOverlay.querySelector('.page-back');

function openPage(obraId) {
  const obra = obrasData[obraId];
  if (!obra) return;

  pageTitle.textContent = obra.title;
  pageGallery.innerHTML = '';

  const images = Array.isArray(obra.images)
    ? obra.images
    : Array.from({ length: obra.total || 0 }, (_, idx) => `${idx + 1}.jpg`);

  images.forEach((fileName, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${index * 0.08}s`;

    const img = document.createElement('img');
    img.src = `img/obra${obraId}/${fileName}`;
    img.alt = `${obra.title} - Etapa ${index + 1}`;

    const label = document.createElement('span');
    label.className = 'etapa-label';
    label.textContent = `Etapa ${index + 1}`;

    item.appendChild(img);
    item.appendChild(label);
    pageGallery.appendChild(item);
  });

  pageOverlay.classList.add('active');
  pageOverlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closePage() {
  pageOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Card clicks
document.querySelectorAll('.obra-card').forEach(card => {
  card.addEventListener('click', () => openPage(card.dataset.obra));
});

// Close
pageBack.addEventListener('click', closePage);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && pageOverlay.classList.contains('active')) closePage();
});

