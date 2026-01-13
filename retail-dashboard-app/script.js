/**
 * Hamburger Menu Toggle Functionality
 * Handles the mobile menu toggle for responsive navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  // Verify elements exist before attaching listeners
  if (!hamburgerBtn || !navMenu) {
    console.warn('Hamburger button or nav menu not found');
    return;
  }

  // Toggle menu on hamburger click
  hamburgerBtn.addEventListener('click', () => {
    const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('nav-open');
    hamburgerBtn.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('nav-open');
      hamburgerBtn.classList.remove('active');
    }
  });

  // Close menu when window is resized to tablet/desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('nav-open');
      hamburgerBtn.classList.remove('active');
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('nav-open')) {
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('nav-open');
      hamburgerBtn.classList.remove('active');
    }
  });
});