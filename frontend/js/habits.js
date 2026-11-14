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
const today = new Date();

const currentYear = today.getFullYear();

const currentMonth = today.getMonth();

const currentDate = today.getDate();

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthName = monthNames[currentMonth];

document.getElementById("currentMonthYear").textContent =
  `${monthName} ${currentYear}`;

const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

const headerRow = document.getElementById("habitDaysHeader");

for (let day = 1; day <= daysInMonth; day++) {
  const th = document.createElement("th");

  th.textContent = day;

  if (day === currentDate) {
    th.classList.add("currentDayCol");
  }

  headerRow.appendChild(th);
}

let habits = JSON.parse(document.getElementById("habits-data").textContent);
console.log(habits);

const checkIns = JSON.parse(
  document.getElementById("checkins-data").textContent,
);

let savedData = {};

checkIns.forEach((checkIn) => {
  const date = new Date(`${checkIn.date}T00:00:00`);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (year === currentYear && month === currentMonth) {
    if (!savedData[checkIn.habitId]) {
      savedData[checkIn.habitId] = {};
    }

    savedData[checkIn.habitId][String(day)] = true;
  }
});

function createHabitRow(habit) {
  const row = document.createElement("tr");

  row.dataset.habitId = habit.id;

  const nameCell = document.createElement("td");

  nameCell.className = "habitLabel";

  const nameWrapper = document.createElement("div");

  nameWrapper.style.display = "flex";

  nameWrapper.style.alignItems = "center";

  nameWrapper.style.justifyContent = "space-between";

  const nameText = document.createElement("span");

  nameText.textContent = habit.name;

  const deleteButton = document.createElement("button");

  deleteButton.className = "deleteHabitBtn";

  deleteButton.textContent = "×";

  deleteButton.title = "Remove habit";

  deleteButton.addEventListener("click", function () {
    habitToDelete = habit;

    deleteHabitModalMessage.textContent = `Are you sure you want to permanently delete "${habit.name}"?`;

    deleteHabitModal.hidden = false;
    cancelDeleteHabit.focus();
  });

  nameWrapper.appendChild(nameText);

  nameWrapper.appendChild(deleteButton);

  nameCell.appendChild(nameWrapper);

  row.appendChild(nameCell);

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("td");

    if (day === currentDate) {
      cell.classList.add("currentDayCol");
    }

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    const dayKey = String(day);

    if (savedData[habit.id] && savedData[habit.id][dayKey]) {
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", async function () {
      const date = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      checkbox.disabled = true;
      cell.classList.add("is-updating");
      try {
        const response = await fetch(`/dailyHabits/${habit.id}/check-in`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date,
            completed: checkbox.checked,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not save check-in");
        }

        if (!savedData[habit.id]) {
          savedData[habit.id] = {};
        }

        savedData[habit.id][String(day)] = checkbox.checked;

        saveData();
        updateStats();
        await loadHabitStats();
      } catch (error) {
        console.error("Check-in failed:", error);
        checkbox.checked = !checkbox.checked;
        showToast("Could not save the check-in. Please try again.", true);
      } finally {
        checkbox.disabled = false;
        cell.classList.remove("is-updating");
      }
    });

    cell.appendChild(checkbox);

    row.appendChild(cell);
  }

  return row;
}
const deleteHabitModal = document.getElementById("deleteHabitModal");
const deleteHabitModalMessage = document.getElementById(
  "deleteHabitModalMessage",
);
const cancelDeleteHabit = document.getElementById("cancelDeleteHabit");
const confirmDeleteHabit = document.getElementById("confirmDeleteHabit");

let habitToDelete = null;

// Cancel button
cancelDeleteHabit.addEventListener("click", () => {
  deleteHabitModal.hidden = true;
  habitToDelete = null;
});

// Close when clicking outside the modal
deleteHabitModal.addEventListener("click", (event) => {
  if (event.target === deleteHabitModal) {
    deleteHabitModal.hidden = true;
    habitToDelete = null;
  }
});

// Close with Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !deleteHabitModal.hidden) {
    deleteHabitModal.hidden = true;
    habitToDelete = null;
  }
});

// Confirm deletion
confirmDeleteHabit.addEventListener("click", async () => {
  if (!habitToDelete) return;

  const habit = habitToDelete;

  confirmDeleteHabit.disabled = true;
  confirmDeleteHabit.innerHTML = `
  <span class="loadingSpinner"></span>
  Deleting...
`;

  try {
    const response = await fetch(`/dailyHabits/${habit.id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not delete habit");
    }

    habits = habits.filter((item) => item.id !== habit.id);
    delete savedData[habit.id];

    deleteHabitModal.hidden = true;
    habitToDelete = null;

    renderHabits();
    await loadHabitStats();
  } catch (error) {
    console.error("Delete habit failed:", error);
    showToast("Could not delete the habit. Please try again.", true);
  } finally {
    confirmDeleteHabit.disabled = false;
    confirmDeleteHabit.textContent = "Yes, Delete";
  }
});

const addHabitModal = document.getElementById("addHabitModal");
const newHabitName = document.getElementById("newHabitName");
const cancelAddHabit = document.getElementById("cancelAddHabit");
const confirmAddHabit = document.getElementById("confirmAddHabit");
document.getElementById("addHabitBtn").addEventListener("click", () => {
  if (habits.length >= 10) {
    showToast("You can have a maximum of 10 habits.", true);
    return;
  }

  addHabitModal.hidden = false;
  newHabitName.value = "";
  newHabitName.focus();
});

cancelAddHabit.addEventListener("click", () => {
  addHabitModal.hidden = true;
});

addHabitModal.addEventListener("click", (event) => {
  if (event.target === addHabitModal) {
    addHabitModal.hidden = true;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !addHabitModal.hidden) {
    addHabitModal.hidden = true;
  }
});

function renderHabits() {
  const body = document.getElementById("habitTableBody");

  body.innerHTML = "";

  habits.forEach((habit) => {
    body.appendChild(createHabitRow(habit));
  });

  updateStats();
}

function saveData() {}

function updateTodayProgress() {
  let total = habits.length;

  let completed = 0;

  habits.forEach((habit) => {
    if (savedData[habit.id] && savedData[habit.id][currentDate]) {
      completed++;
    }
  });

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("todayCompleted").textContent =
    `${completed} / ${total}`;

  document.getElementById("todayProgressPercent").textContent =
    `${percentage}%`;

  document.getElementById("todayProgressBar").style.width = `${percentage}%`;

  document.getElementById("todayProgressCircle").style.background =
    `conic-gradient(
            #7f9f7a ${percentage}%,
            #dbe6d8 ${percentage}%
          )`;

  const message = document.getElementById("monthlyMessage");

  if (percentage === 100 && total > 0) {
    message.textContent = "✨ Amazing! All habits done today!";
  } else if (percentage >= 75) {
    message.textContent = "🌿 You're doing great today!";
  } else if (percentage >= 50) {
    message.textContent = "🌱 You're halfway there!";
  } else if (percentage > 0) {
    message.textContent = "✨ Every check-in counts!";
  } else {
    message.textContent = "🌱 Start growing your habits!";
  }
}

function updateMonthlyProgress() {
  const totalPossible = habits.length * currentDate;
  let totalCompleted = 0;

  habits.forEach((habit) => {
    if (!savedData[habit.id]) {
      return;
    }

    for (let day = 1; day <= currentDate; day++) {
      if (savedData[habit.id][String(day)] === true) {
        totalCompleted++;
      }
    }
  });

  const percentage =
    totalPossible === 0
      ? 0
      : Math.round((totalCompleted / totalPossible) * 100);

  document.getElementById("monthlyCompletion").textContent = `${percentage}%`;

  document.getElementById("monthlyCheckins").textContent = totalCompleted;
}

function updateStreak() {
  let currentStreak = 0;
  let bestStreak = 0;
  let runningStreak = 0;

  function allHabitsCompleted(day) {
    const dateToCheck = new Date(currentYear, currentMonth, day);

    const habitsForThatDay = habits.filter((habit) => {
      const createdAt = new Date(habit.createdAt);

      return createdAt < new Date(currentYear, currentMonth, day + 1);
    });

    if (habitsForThatDay.length === 0) {
      return false;
    }

    return habitsForThatDay.every((habit) => {
      return savedData[habit.id] && savedData[habit.id][String(day)] === true;
    });
  }

  for (let day = 1; day <= currentDate; day++) {
    if (allHabitsCompleted(day)) {
      runningStreak++;
      bestStreak = Math.max(bestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  for (let day = currentDate; day >= 1; day--) {
    if (allHabitsCompleted(day)) {
      currentStreak++;
    } else {
      break;
    }
  }

  document.getElementById("streakValue").textContent = currentStreak;

  document.getElementById("bestStreak").textContent = `${bestStreak} days`;
}

function updateStats() {
  loadHabitStats();
}

async function loadHabitStats() {
  try {
    const response = await fetch("/dailyHabits/stats");

    if (!response.ok) {
      throw new Error("Failed to load habit statistics");
    }

    const stats = await response.json();
    // Remove skeleton loading effects
    document.querySelectorAll(".habitStatSkeleton").forEach((element) => {
      element.classList.remove(
        "habitStatSkeleton",
        "skeletonStreak",
        "skeletonBestStreak",
        "skeletonProgressNumber",
        "skeletonProgressBar",
        "skeletonMonthlyNumber",
        "skeletonProgressCircle",
      );
    });

    document.getElementById("todayCompleted").textContent =
      `${stats.todayCompleted} / ${stats.totalHabits}`;

    document.getElementById("todayProgressPercent").textContent =
      `${stats.todayProgress}%`;

    document.getElementById("todayProgressBar").style.width =
      `${stats.todayProgress}%`;

    document.getElementById("todayProgressCircle").style.background =
      `conic-gradient(#7f9f7a ${stats.todayProgress}%, #dbe6d8 ${stats.todayProgress}%)`;

    document.getElementById("monthlyCompletion").textContent =
      `${stats.monthlyCompletion}%`;

    document.getElementById("monthlyCheckins").textContent =
      stats.monthlyCheckins;

    // Update streak statistics
    document.getElementById("streakValue").textContent = stats.currentStreak;

    document.getElementById("bestStreak").textContent = stats.bestStreak;
  } catch (error) {
    console.error("Failed to load habit statistics:", error);

    // Remove skeleton loading effects
    document.querySelectorAll(".habitStatSkeleton").forEach((element) => {
      element.classList.remove(
        "habitStatSkeleton",
        "skeletonStreak",
        "skeletonBestStreak",
        "skeletonProgressNumber",
        "skeletonProgressBar",
        "skeletonMonthlyNumber",
        "skeletonProgressCircle",
      );
    });

    // Show fallback values
    document.getElementById("streakValue").textContent = "—";
    document.getElementById("bestStreak").textContent = "—";
    document.getElementById("todayCompleted").textContent = "— / —";
    document.getElementById("todayProgressPercent").textContent = "—";
    document.getElementById("monthlyCompletion").textContent = "—";
    document.getElementById("monthlyCheckins").textContent = "—";
  }
}
confirmAddHabit.addEventListener("click", async () => {
  const habitName = newHabitName.value.trim();

  if (!habitName) {
    newHabitName.focus();
    return;
  }

  if (habits.length >= 10) {
    showToast("You can have a maximum of 10 habits.", true);
    addHabitModal.hidden = true;
    return;
  }

  confirmAddHabit.disabled = true;
  confirmAddHabit.innerHTML = `
  <span class="loadingSpinner"></span>
  Adding...
`;

  try {
    const response = await fetch("/dailyHabits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: habitName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Could not add habit.");
    }

    habits.push({
      id: data.habit._id,
      name: data.habit.name,
      createdAt: data.habit.createdAt,
    });

    addHabitModal.hidden = true;
    renderHabits();
    await loadHabitStats();
  } catch (error) {
    console.error("Failed to add habit:", error);
    showToast(error.message || "Could not connect to the server.", true);
  } finally {
    confirmAddHabit.disabled = false;
    confirmAddHabit.textContent = "Add Habit";
  }
});

renderHabits();
loadHabitStats();
