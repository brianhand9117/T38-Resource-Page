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
const timeZoneSelect = document.getElementById('timeZoneSelect');
const selectedZoneName = document.getElementById('selectedZoneName');
const selectedZoneClock = document.getElementById('selectedZoneClock');
const selectedZoneDate = document.getElementById('selectedZoneDate');

const usTimeZoneLabels = {
  'America/New_York': 'Eastern (ET)',
  'America/Chicago': 'Central (CT)',
  'America/Denver': 'Mountain (MT)',
  'America/Phoenix': 'Arizona (MST)',
  'America/Los_Angeles': 'Pacific (PT)',
  'America/Anchorage': 'Alaska (AKT)',
  'Pacific/Honolulu': 'Hawaii (HST)'
};

const padTwoDigits = (value) => String(value).padStart(2, '0');

function updateUtcClock() {
  if (!utcClock && !utcDate && !selectedZoneClock && !selectedZoneDate) {
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

  if (timeZoneSelect && selectedZoneName && selectedZoneClock && selectedZoneDate) {
    const selectedTimeZone = timeZoneSelect.value;
    const selectedLabel = usTimeZoneLabels[selectedTimeZone] || selectedTimeZone;

    const selectedTimeParts = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedTimeZone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).formatToParts(now);

    const selectedDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: selectedTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(now);

    const selectedHour = selectedTimeParts.find((part) => part.type === 'hour')?.value || '00';
    const selectedMinute = selectedTimeParts.find((part) => part.type === 'minute')?.value || '00';
    const selectedSecond = selectedTimeParts.find((part) => part.type === 'second')?.value || '00';

    const selectedYear = selectedDateParts.find((part) => part.type === 'year')?.value || '0000';
    const selectedMonth = selectedDateParts.find((part) => part.type === 'month')?.value || '00';
    const selectedDay = selectedDateParts.find((part) => part.type === 'day')?.value || '00';

    selectedZoneName.textContent = selectedLabel;
    selectedZoneClock.textContent = `${selectedHour}:${selectedMinute}:${selectedSecond}`;
    selectedZoneDate.textContent = `${selectedYear}-${selectedMonth}-${selectedDay}`;
  }
}

updateUtcClock();
setInterval(updateUtcClock, 1000);

if (timeZoneSelect) {
  timeZoneSelect.addEventListener('change', updateUtcClock);
}

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
