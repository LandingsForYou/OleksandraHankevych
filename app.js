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

  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}
