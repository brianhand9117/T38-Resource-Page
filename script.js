const ctaButton = document.getElementById('ctaBtn');
const message = document.getElementById('message');
/*
const subscribeForm = document.getElementById('subscribeForm');
const subscribeEmail = document.getElementById('subscribeEmail');
const subscribeMessage = document.getElementById('subscribeMessage');
*/

if (ctaButton && message) {
  ctaButton.addEventListener('click', () => {
    message.textContent = 'Your site is working. Start building your pages from here.';
  });
}

const utcClock = document.getElementById('utcClock');
const utcDate = document.getElementById('utcDate');

const padTwoDigits = (value) => String(value).padStart(2, '0');

function updateUtcClock() {
  if (!utcClock && !utcDate) {
    return;
  }

  const now = new Date();

  if (utcClock) {
    const hours = padTwoDigits(now.getUTCHours());
    const minutes = padTwoDigits(now.getUTCMinutes());
    const seconds = padTwoDigits(now.getUTCSeconds());
    utcClock.textContent = `${hours}:${minutes}:${seconds}`;
  }

  if (utcDate) {
    const year = now.getUTCFullYear();
    const month = padTwoDigits(now.getUTCMonth() + 1);
    const day = padTwoDigits(now.getUTCDate());
    utcDate.textContent = `${year}-${month}-${day}`;
  }
}

updateUtcClock();
setInterval(updateUtcClock, 1000);

/*
if (subscribeForm && subscribeEmail && subscribeMessage) {
  subscribeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!subscribeEmail.checkValidity()) {
      subscribeMessage.textContent = 'Please enter a valid email address.';
      return;
    }

    subscribeMessage.textContent = `Subscribed: ${subscribeEmail.value}. You will receive monthly updates.`;
    subscribeForm.reset();
  });
}
*/
