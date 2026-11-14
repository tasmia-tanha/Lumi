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
// Add task loading state
const addTaskForm = document.querySelector("#addTaskForm");
const addTaskBtn = document.querySelector("#addTaskBtn");

addTaskForm.addEventListener("submit", function (event) {
  if (!addTaskForm.checkValidity()) return;

  addTaskBtn.disabled = true;
  addTaskBtn.innerHTML = `
    <span class="loadingSpinner"></span>
    Adding task...
  `;
});
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
// Clear completed tasks
const btn = document.querySelector(".clearButton");

btn.addEventListener("click", async function () {
  const completedTasks = [...document.querySelectorAll(".taskItem")].filter(
    (task) => task.querySelector("input[type='checkbox']").checked,
  );

  if (completedTasks.length === 0) return;

  btn.disabled = true;
  const originalHTML = btn.innerHTML;

  btn.innerHTML = `
    <span class="loadingSpinner"></span>
    Clearing...
  `;

  try {
    const results = await Promise.all(
      completedTasks.map(async (task) => {
        const id = task.querySelector("input[type='checkbox']").dataset.taskId;

        const response = await fetch(`/task/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete a completed task.");
        }

        return task;
      }),
    );

    results.forEach((task) => task.remove());

    updateTaskFilter();
    updateCapybaraImage();
  } catch (error) {
    console.error(error);
    showToast("Some tasks could not be cleared. Please try again.", true);

    // Refresh the page to show the actual server state.
    window.location.reload();
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

const deleteModal = document.querySelector("#deleteModal");
const deleteModalMessage = document.querySelector("#deleteModalMessage");
const cancelDelete = document.querySelector("#cancelDelete");
const confirmDelete = document.querySelector("#confirmDelete");

let taskToDelete = null;

document.querySelectorAll(".deleteTask").forEach((button) => {
  button.addEventListener("click", function () {
    const taskItem = this.closest(".taskItem");
    const taskId = this.dataset.taskId;
    const taskTitle = taskItem.querySelector(".taskInfo h3").textContent.trim();

    taskToDelete = {
      taskId,
      taskItem,
    };

    deleteModalMessage.textContent = `Are you sure you want to delete "${taskTitle}"?`;

    deleteModal.hidden = false;

    cancelDelete.focus();
  });
});

cancelDelete.addEventListener("click", () => {
  deleteModal.hidden = true;
  taskToDelete = null;
});

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    deleteModal.hidden = true;
    taskToDelete = null;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !deleteModal.hidden) {
    deleteModal.hidden = true;
    taskToDelete = null;
  }
});

confirmDelete.addEventListener("click", async () => {
  if (!taskToDelete) return;

  const { taskId, taskItem } = taskToDelete;

  confirmDelete.disabled = true;
  confirmDelete.innerHTML = `
  <span class="loadingSpinner"></span>
  Deleting...
`;

  try {
    const response = await fetch(`/task/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete task");
    }

    taskItem.remove();

    const remainingTasks = [...document.querySelectorAll(".taskItem")];

    const activeCount = remainingTasks.filter(
      (item) => !item.querySelector("input[type='checkbox']").checked,
    ).length;

    const completedCount = remainingTasks.length - activeCount;

    document.querySelector("#activeCount").textContent = activeCount;
    document.querySelector("#completedCount").textContent = completedCount;

    updateCapybaraImage();

    document.querySelector("#noActiveTasks").hidden = activeCount !== 0;
    document.querySelector("#noCompletedTasks").hidden = completedCount !== 0;

    deleteModal.hidden = true;
    taskToDelete = null;
  } catch (error) {
    console.error(error);
    showToast("Failed to delete task. Please try again.", true);
  } finally {
    confirmDelete.disabled = false;
    confirmDelete.textContent = "Yes, Delete";
  }
});

//filter
const priorityFilter = document.querySelector("#priorityFilter");

function updateTaskFilter() {
  let visibleActive = 0;
  let visibleCompleted = 0;
  const selectedPriority = priorityFilter.value;

  document.querySelectorAll(".taskItem").forEach((taskItem) => {
    const priority = taskItem.querySelector(".priority").textContent.trim();
    const isCompleted = taskItem.querySelector(
      "input[type='checkbox']",
    ).checked;
    const matches = selectedPriority === "all" || selectedPriority === priority;

    taskItem.style.display = matches ? "" : "none";

    if (matches && isCompleted) {
      visibleCompleted++;
    } else if (matches) {
      visibleActive++;
    }
  });

  const msgActive = document.querySelector("#noActiveTasks");
  const msgCompleted = document.querySelector("#noCompletedTasks");

  if (selectedPriority !== "all") {
    msgActive.textContent = `No active ${selectedPriority}-priority tasks 🌱`;
    msgCompleted.textContent = `No ${selectedPriority}-priority tasks completed yet`;
  } else {
    msgActive.textContent = "No active tasks. Time to relax 🌱";
    msgCompleted.textContent = "No tasks have been completed yet";
  }

  document.querySelector("#activeCount").textContent = visibleActive;
  document.querySelector("#completedCount").textContent = visibleCompleted;
  msgActive.hidden = visibleActive !== 0;
  msgCompleted.hidden = visibleCompleted !== 0;
}
priorityFilter.addEventListener("change", updateTaskFilter);

//checkbox change
document
  .querySelectorAll(".taskItem input[type='checkbox']")
  .forEach((checkbox) => {
    checkbox.addEventListener("change", async function () {
      const taskItem = this.closest(".taskItem");
      const taskId = this.dataset.taskId;
      const title = taskItem.querySelector(".taskInfo h3");
      const originalStatus = !this.checked;
      const newStatus = this.checked;

      this.disabled = true;
      taskItem.classList.add("is-updating");

      try {
        const response = await fetch(`/task/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update task.");
        }

        title.classList.toggle("completed", newStatus);

        const targetList = newStatus
          ? document.querySelector("#completedList")
          : document.querySelector("#activeList");

        targetList.appendChild(taskItem);

        updateTaskFilter();
        updateCapybaraImage();
      } catch (error) {
        this.checked = originalStatus;
        showToast("Failed to update task. Please try again.", true);
      } finally {
        this.disabled = false;
        taskItem.classList.remove("is-updating");
      }
    });
  });

//hide completed list
const toggleBtn = document.querySelector("#toggleCompleted");
const completedList = document.querySelector("#completedList");

console.log("Button:", toggleBtn);
console.log("Completed list:", completedList);

toggleBtn.addEventListener("click", function () {
  console.log("Toggle clicked");

  completedList.style.display =
    completedList.style.display === "none" ? "flex" : "none";
  toggleBtn.textContent =
    completedList.style.display === "none" ? "Show" : "Hide";
});

function updateCapybaraImage() {
  console.log(
    "Active count:",
    document.querySelector("#activeCount").textContent,
  );
  const activeCount = Number(
    document.querySelector("#activeCount").textContent,
  );

  const capybaraImage = document.querySelector("#capybaraImage");

  if (activeCount > 0) {
    capybaraImage.src = "/images/Sleepy Capybara’s Midnight Tasks.png";
    capybaraImage.alt = "Capybara studying with unfinished tasks";
  } else {
    capybaraImage.src = "/images/Cozy Capybara’s All Done Bedtime.png";
    capybaraImage.alt = "Sleeping capybara after completing tasks";
  }
}

updateCapybaraImage();
