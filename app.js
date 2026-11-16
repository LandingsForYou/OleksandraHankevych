"use strict";

const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-nav");

if (menuButton && mobileMenu) {
  const setMenuOpen = (isOpen) => {
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
    mobileMenu.classList.toggle("is-open", isOpen);
    mobileMenu.inert = !isOpen;
    document.body.classList.toggle("menu-open", isOpen);
  };

  menuButton.addEventListener("click", () => {
    setMenuOpen(menuButton.getAttribute("aria-expanded") !== "true");
  });

  mobileMenu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

const revealElements = document.querySelectorAll(".reveal");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      currentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px 30px 0px" });

  revealElements.forEach((element) => observer.observe(element));
}


// Approach timeline: one progressive line, five staggered markers and texts.
// Uses separate class names so the existing Hero reveal animations stay intact.
const approachTimeline = document.querySelector('.approach__timeline');
if (approachTimeline) {
  const approachItems = [...approachTimeline.querySelectorAll('.approach__item')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    approachTimeline.classList.add('is-active');
    approachItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const timelineObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        approachTimeline.classList.add('is-active');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    timelineObserver.observe(approachTimeline);

    const itemObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -25px 0px' });
    approachItems.forEach((item) => itemObserver.observe(item));
  }
}

// Trigger the photo's subtle one-time entrance without affecting other reveals.
const consultationSection = document.querySelector('.consultation-cta');
if (consultationSection) {
  if (reducedMotion || !('IntersectionObserver' in window)) {
    consultationSection.classList.add('is-visible');
  } else {
    const consultationObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    consultationObserver.observe(consultationSection);
  }
}

// Education: centered gallery with one prominent certificate; swipe and side-card navigation.
(() => {
  const root = document.querySelector('.education');
  if (!root) return;
  const viewport = root.querySelector('.education__viewport');
  const track = root.querySelector('.education__track');
  const desktopSlides = [...root.querySelectorAll('.education__slide')];
  // On phones the academic diploma leads; on desktop it occupies the middle of the first five.
  const mobileSlides = [desktopSlides[2], ...desktopSlides.filter((_, i) => i !== 2)];
  let slides = desktopSlides;
  const media = window.matchMedia('(min-width: 701px)');
  const arrange = () => {
    slides = media.matches ? desktopSlides : mobileSlides;
    slides.forEach((slide, i) => {
      track.append(slide);
      slide.querySelector('[data-certificate]').dataset.certificate = String(i);
      slide.setAttribute('aria-label', `Сертифікат ${i + 1} із ${slides.length}`);
    });
    activeIndex = media.matches ? 2 : 0;
    update();
    syncArrows();
  };
  const current = root.querySelector('[data-education-current]');
  const progress = root.querySelector('[data-education-progress]');
  let activeIndex = 0;
  const update = () => {
    slides.forEach((slide,i) => {
      const desktop = window.matchMedia('(min-width: 701px)').matches;
      const windowCenter = desktop ? Math.max(2, Math.min(slides.length - 3, activeIndex)) : activeIndex;
      const delta = i - windowCenter;
      const distance = desktop ? Math.min(Math.abs(delta), 3) : Math.min(Math.abs(i - activeIndex), 3);
      slide.dataset.active = String(i === activeIndex);
      slide.style.setProperty('--offset',String(Math.max(-3,Math.min(3,delta))));
      slide.dataset.distance = String(distance);
      slide.setAttribute('aria-hidden',distance > 2 ? 'true' : 'false');
      slide.querySelector('button').tabIndex = i === activeIndex ? 0 : -1;
    });
    current.textContent = String(activeIndex + 1).padStart(2,'0');
    progress.style.width = `${((activeIndex + 1)/slides.length)*100}%`;
  };
  const move = direction => {activeIndex=Math.max(0,Math.min(slides.length-1,activeIndex+direction));update();};
  let startX = null;
  viewport.addEventListener('pointerdown',e=>{startX=e.clientX;});
  viewport.addEventListener('pointerup',e=>{
    if(startX===null)return;
    const delta=e.clientX-startX;startX=null;
    if(Math.abs(delta)>35){move(delta<0?1:-1);viewport.dataset.swiped='true';setTimeout(()=>delete viewport.dataset.swiped,80);}
  });
  viewport.addEventListener('pointercancel',()=>{startX=null;});
  viewport.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);}
  });
  const prevButton = root.querySelector('[data-education-prev]');
  const nextButton = root.querySelector('[data-education-next]');
  prevButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));
  const syncArrows = () => {
    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  };
  // Keep arrow availability synchronized with swipe, click and keyboard navigation.
  const arrowObserver = new MutationObserver(syncArrows);
  arrowObserver.observe(current, {childList:true,characterData:true,subtree:true});
  media.addEventListener('change', arrange);
  arrange();
  const education = document.querySelector('#education-modal');
  const certificate = document.querySelector('#certificate-modal');
   const experience = document.querySelector('#experience-modal');
  const syncLock = () => document.body.classList.toggle('education-dialog-open', education.open || certificate.open || experience.open);
  const show = dialog => { dialog.showModal(); syncLock(); };
  document.querySelector('[data-open-education]').addEventListener('click', () => show(education));
   document.querySelector('[data-open-experience]').addEventListener('click', () => show(experience));
   experience.querySelector('[data-close-experience]').addEventListener('click', () => experience.close());
  education.querySelector('[data-close-education]').addEventListener('click', () => education.close());
  certificate.querySelector('[data-close-certificate]').addEventListener('click', () => certificate.close());
  [education,certificate,experience].forEach(dialog => {
    dialog.addEventListener('close', syncLock);
    dialog.addEventListener('click', e => {if (e.target === dialog) dialog.close();});
  });
  root.querySelectorAll('[data-certificate]').forEach(button => button.addEventListener('click', () => {
    if (viewport.dataset.swiped) return;
    const idx = Number(button.dataset.certificate);
    if (idx !== activeIndex) { activeIndex = idx; update(); return; }
    const img = button.querySelector('img');
    certificate.querySelector('[data-certificate-full]').src = img.src;
    certificate.querySelector('[data-certificate-full]').alt = img.alt;
    certificate.querySelector('[data-certificate-caption]').textContent = img.alt;
    show(certificate);
  }));
})();

// WayForPay hosted payment links. Insert the four links issued in the merchant dashboard.
// Do not place merchant secret keys or payment-signature generation in frontend code.
const wayForPayLinks = {
  individual: "",
  family: "",
  "individual-pack": "",
  "family-pack": ""
};
const pricingNote = document.querySelector("#pricing-payment-note");
document.querySelectorAll(".pricing__buy[data-payment]").forEach(button => {
  button.addEventListener("click", () => {
    const url = wayForPayLinks[button.dataset.payment];
    if (url && /^https:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (pricingNote) {
      pricingNote.hidden = false;
      pricingNote.textContent = "Оплата цієї послуги скоро буде доступна. Поки що для запису скористайтеся кнопкою «Записатися» у верхньому меню.";
      pricingNote.scrollIntoView({behavior: "smooth", block: "nearest"});
    }
  });
});
