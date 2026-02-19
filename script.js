const ctaButton = document.getElementById('ctaBtn');
const message = document.getElementById('message');

if (ctaButton && message) {
  ctaButton.addEventListener('click', () => {
    message.textContent = 'Your site is working. Start building your pages from here.';
  });
}
