function showToast(message, isError = false) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: isError ? "#b85f73" : "#84a282",
      },
    }).showToast();
  } else {
    console.error(message);
  }
}
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Could not log out. Please try again.");
    }

    window.location.href = "/";
  } catch (error) {
    showToast(error.message, true);
  }
});

const selectedYear = document.querySelector("#yearSelect");
const currentYear = new Date().getFullYear();

for (let year = currentYear - 10; year <= currentYear + 10; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  if (year === currentYear) {
    option.selected = true;
  }
  selectedYear.appendChild(option);
}

const selectedMonth = document.querySelector("#monthSelect");
const calendarGrid = document.querySelector(".calendarGrid");

const datePopupOverlay = document.querySelector("#datePopupOverlay");
const popupDateTitle = document.querySelector("#popupDateTitle");
const eventTitle = document.querySelector("#eventTitle");
const pinDate = document.querySelector("#pinDate");
const closeDatePopup = document.querySelector("#closeDatePopup");
const addTimeEntry = document.querySelector("#addTimeEntry");
const timeEntryList = document.querySelector("#timeEntryList");
const saveDateDetails = document.querySelector("#saveDateDetails");
let pinnedDates = [];
async function loadPinnedDates() {
  try {
    const response = await fetch("/calendar/pinned");
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load pinned dates");
    }

    pinnedDates = result.data;
    renderCalendar();
    calendarGrid.classList.remove("is-loading");
  } catch (error) {
    console.error("Error loading pinned dates:", error);
    calendarGrid.classList.remove("is-loading");
  }
}
const upcomingEventsList = document.querySelector("#upcomingEventsList");

async function loadUpcomingEvents() {
  try {
    const response = await fetch("/calendar/upcoming");
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load upcoming events");
    }

    upcomingEventsList.innerHTML = "";
    if (result.data.length === 0) {
      upcomingEventsList.innerHTML = `
    <li class="emptyAgenda">
      <span class="emptyIcon">🌷</span>
      No upcoming events yet.
      <br>
      Pin an important date to see it here!
    </li>
  `;
      return;
    }
    result.data.forEach((event) => {
      const eventItem = document.createElement("li");
      eventItem.className = "eventItem";

      const eventDate = new Date(event.date);
      const dateBadge = eventDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });

      eventItem.innerHTML = `
        <span class="eventDateBadge">${dateBadge}</span>
        <div class="eventDetails">
          <span class="eventTitle"></span>
        </div>
      `;

      eventItem.querySelector(".eventTitle").textContent = event.title;

      upcomingEventsList.appendChild(eventItem);
    });
  } catch (error) {
    console.error("Error loading upcoming events:", error);

    upcomingEventsList.innerHTML = `
    <li class="emptyAgenda">
      Could not load upcoming events.
      <br>
      Please refresh the page and try again.
    </li>
  `;
  }
}
const todayDate = document.querySelector("#todayDate");
const todayAgendaList = document.querySelector("#todayAgendaList");

async function loadTodayAgenda() {
  try {
    const now = new Date();

    todayDate.textContent = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const response = await fetch("/calendar/today-agenda");
    const result = await response.json();

    if (!response.ok) {
      throw new Error("Failed to load today's agenda");
    }

    todayAgendaList.innerHTML = "";

    const agenda = result.data;

    if (
      !agenda ||
      !agenda.timeEntries.some((entry) => entry.time || entry.description)
    ) {
      todayAgendaList.innerHTML = `
    <li class="emptyAgenda">
      <span class="emptyIcon">🌱</span>
      No plans for today yet.
      <br>
      Add a time entry to get your day started!
    </li>
  `;
      return;
    }

    agenda.timeEntries
      .filter((entry) => entry.time || entry.description)
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((entry) => {
        const eventItem = document.createElement("li");
        eventItem.className = "eventItem";

        const time = document.createElement("span");
        time.className = "eventTime";
        time.textContent = entry.time
          ? new Date(`2000-01-01T${entry.time}`).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "";

        const description = document.createElement("span");
        description.className = "eventTitle";
        description.textContent = entry.description || "Untitled activity";

        eventItem.append(time, description);
        todayAgendaList.appendChild(eventItem);
      });
  } catch (error) {
    console.error("Error loading today's agenda:", error);

    todayAgendaList.innerHTML = `
    <li class="emptyAgenda">
      Could not load today's agenda.
      <br>
      Please refresh the page and try again.
    </li>
  `;
  }
}
saveDateDetails.addEventListener("click", async function () {
  const title = eventTitle.value.trim();
  const pinned = pinDate.checked;

  const timeEntries = [...timeEntryList.querySelectorAll(".timeEntryRow")].map(
    (row) => ({
      time: row.querySelector(".entryTime").value,
      description: row.querySelector(".entryDescription").value.trim(),
    }),
  );
  const hasIncompleteEntry = timeEntries.some(
    (entry) => !entry.time || !entry.description,
  );

  if (hasIncompleteEntry) {
    showToast(
      "Please enter both a time and a description for every time entry.",
      true,
    );
    return;
  }
  saveDateDetails.disabled = true;
  saveDateDetails.innerHTML = `
  <span class="loadingSpinner"></span>
  Saving...
`;
  try {
    const response = await fetch(`/calendar/${selectedDate}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        pinned,
        timeEntries,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save date details");
    }

    console.log("Saved successfully:", result.data);
    datePopupOverlay.hidden = true;
    await loadPinnedDates();
    await loadUpcomingEvents();
    await loadTodayAgenda();
  } catch (error) {
    console.error("Error saving date:", error);
    showToast("Could not save date details. Please try again.", true);
  } finally {
    saveDateDetails.disabled = false;
    saveDateDetails.textContent = "Save";
  }
});
let selectedDate = null;

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const month = Number(selectedMonth.value);
  const year = Number(selectedYear.value);
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    const day = document.createElement("div");
    day.className = "calDay prevMonth";
    day.textContent = previousMonthDays - i;
    calendarGrid.appendChild(day);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const day = document.createElement("div");
    day.className = "calDay";
    day.textContent = i;
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;

    const isPinned = pinnedDates.some((item) => {
      const savedDate = new Date(item.date);
      const savedDateString = [
        savedDate.getUTCFullYear(),
        String(savedDate.getUTCMonth() + 1).padStart(2, "0"),
        String(savedDate.getUTCDate()).padStart(2, "0"),
      ].join("-");

      return savedDateString === dateString;
    });

    if (isPinned) {
      day.classList.add("pinnedDay");
    }
    const today = new Date();

    if (
      i === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add("currentDay");
    }
    day.style.cursor = "pointer";
    day.addEventListener("click", async function () {
      selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      day.classList.add("is-loading");
      day.style.pointerEvents = "none";

      popupDateTitle.textContent = selectedDate;

      eventTitle.value = "";
      pinDate.checked = false;
      timeEntryList.innerHTML = "";

      try {
        const response = await fetch(`/calendar/${selectedDate}/details`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load date details");
        }

        const savedDate = result.data;

        if (savedDate) {
          eventTitle.value = savedDate.title || "";
          pinDate.checked = savedDate.pinned || false;

          savedDate.timeEntries.forEach((entry) => {
            const entryRow = document.createElement("div");
            entryRow.className = "timeEntryRow";

            entryRow.innerHTML = `
          <input type="time" class="entryTime" required>
          <input
            type="text"
            class="entryDescription"
            placeholder="What will you do?"
            maxlength="100"
          >
          <button type="button" class="removeTimeEntry">×</button>
        `;

            entryRow.querySelector(".entryTime").value = entry.time || "";
            entryRow.querySelector(".entryDescription").value =
              entry.description || "";

            entryRow
              .querySelector(".removeTimeEntry")
              .addEventListener("click", function () {
                entryRow.remove();
              });

            timeEntryList.appendChild(entryRow);
          });
        }

        datePopupOverlay.hidden = false;
      } catch (error) {
        console.error("Error loading date details:", error);
        showToast(
          "Could not load this date's details. Please try again.",
          true,
        );
      } finally {
        day.classList.remove("is-loading");
        day.style.pointerEvents = "auto";
      }
    });
    calendarGrid.appendChild(day);
  }
  const totalCells = 42;

  for (let i = calendarGrid.children.length; i < totalCells; i++) {
    const day = document.createElement("div");
    day.className = "calDay nextMonth";
    day.textContent = i - firstDay - daysInMonth + 1;
    calendarGrid.appendChild(day);
  }
}
selectedMonth.addEventListener("change", renderCalendar);
selectedYear.addEventListener("change", renderCalendar);
closeDatePopup.addEventListener("click", function () {
  datePopupOverlay.hidden = true;
});
addTimeEntry.addEventListener("click", function () {
  const entryRow = document.createElement("div");
  entryRow.className = "timeEntryRow";

  entryRow.innerHTML = `
      <input type="time" class="entryTime"  required>
      <input
        type="text"
        class="entryDescription"
        placeholder="What will you do?"
        maxlength="100"
      >
      <button type="button" class="removeTimeEntry">×</button>
    `;

  timeEntryList.appendChild(entryRow);

  entryRow
    .querySelector(".removeTimeEntry")
    .addEventListener("click", function () {
      entryRow.remove();
    });
});
renderCalendar();
loadPinnedDates();
loadTodayAgenda();
loadUpcomingEvents();
