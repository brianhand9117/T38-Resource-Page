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

function updateUtcClock() {
  if (!utcClock || !utcDate) {
    return;
  }

  const now = new Date();

  utcClock.textContent = now.toLocaleTimeString('en-GB', {
    hour12: false,
    timeZone: 'UTC'
  });

  utcDate.textContent = now.toLocaleDateString('en-CA', {
    timeZone: 'UTC'
  });
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
