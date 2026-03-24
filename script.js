const BASE_NIGHT = new Date(2026, 2, 25);
const MONTH_NAMES = [
  "Tammikuu",
  "Helmikuu",
  "Maaliskuu",
  "Huhtikuu",
  "Toukokuu",
  "Kesäkuu",
  "Heinäkuu",
  "Elokuu",
  "Syyskuu",
  "Lokakuu",
  "Marraskuu",
  "Joulukuu",
];

const statusAnswer = document.querySelector("#statusAnswer");
const statusDate = document.querySelector("#statusDate");
const calendarTitle = document.querySelector("#calendarTitle");
const calendarGrid = document.querySelector("#calendarGrid");
const prevMonthButton = document.querySelector("#prevMonthButton");
const nextMonthButton = document.querySelector("#nextMonthButton");

let visibleMonth = new Date();
let expandedDayKey = null;

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(firstDate, secondDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(firstDate) - startOfDay(secondDate)) / millisecondsPerDay);
}

function isIlkkaAwake(date) {
  const diffDays = daysBetween(date, BASE_NIGHT);
  return Math.abs(diffDays % 2) === 0;
}

function getNightLabel(date) {
  return isIlkkaAwake(date) ? "Hereillä" : "Nukkuu";
}

function getNightSentence(date) {
  return isIlkkaAwake(date) ? "Ilkka on hereillä." : "Ilkka nukkuu.";
}

function getDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat("fi-FI", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(date);
}

function updateTonightStatus() {
  const today = new Date();
  const awake = isIlkkaAwake(today);
  const sleeping = !awake;

  statusAnswer.textContent = sleeping ? "Kyllä, Ilkka nukkuu." : "Ei, Ilkka on hereillä.";
  statusAnswer.classList.toggle("awake-text", !sleeping);
  statusAnswer.classList.toggle("asleep-text", sleeping);
  statusDate.textContent = `Yö ${formatLongDate(today)}`;
}

function createDayCell(date, currentMonth, today) {
  const button = document.createElement("button");
  const awake = isIlkkaAwake(date);
  const outsideMonth = date.getMonth() !== currentMonth;
  const isToday = startOfDay(date).getTime() === startOfDay(today).getTime();
  const dateKey = getDateKey(date);
  const isExpanded = expandedDayKey === dateKey;

  button.type = "button";
  button.className = "calendar-day";
  button.classList.add(awake ? "awake" : "asleep");

  if (outsideMonth) {
    button.classList.add("outside-month");
  }

  if (isToday) {
    button.classList.add("today");
  }

  const dayNumber = document.createElement("span");
  dayNumber.className = "day-number";
  dayNumber.textContent = String(date.getDate());

  const dayStatus = document.createElement("span");
  dayStatus.className = "day-status";
  dayStatus.textContent = isExpanded ? getNightSentence(date) : getNightLabel(date);

  button.setAttribute(
    "aria-label",
    `${formatLongDate(date)}. ${isExpanded ? getNightSentence(date) : getNightLabel(date)}`
  );
  button.setAttribute("aria-pressed", isExpanded ? "true" : "false");
  button.addEventListener("click", () => {
    expandedDayKey = expandedDayKey === dateKey ? null : dateKey;
    renderCalendar();
  });

  button.append(dayNumber, dayStatus);

  return button;
}

function renderCalendar() {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - mondayBasedOffset);
  const totalCells = 42;
  const today = new Date();

  calendarTitle.textContent = `${MONTH_NAMES[month]} ${year}`;
  calendarGrid.replaceChildren();

  for (let index = 0; index < totalCells; index += 1) {
    const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index);
    calendarGrid.append(createDayCell(cellDate, month, today));
  }

  const visibleLastDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + totalCells - 1);
  const monthDescription = `${MONTH_NAMES[month]} ${year}, ${lastDay.getDate()} paivaa`;
  calendarGrid.setAttribute("aria-label", monthDescription);
  calendarTitle.setAttribute("data-range-end", visibleLastDate.toISOString());
}

prevMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton.addEventListener("click", () => {
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  renderCalendar();
});

updateTonightStatus();
renderCalendar();
