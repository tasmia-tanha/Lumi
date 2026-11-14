function showToast(message, isError = false) {
      if (window.Toastify) {
        Toastify({
          text: message,
          duration: 3000,
          gravity: "top",
          position: "right",
          style: {
            background: isError ? "#b85f73" : "#84a282"
          }
        }).showToast();
      } else {
        console.error(message);
      }
    }

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      try {
        const response = await fetch("/logout", {
          method: "DELETE"
        });
        if (!response.ok) throw new Error("Could not log out. Please try again.");
        window.location.href = "/";
      } catch (error) {
        showToast(error.message, true);
      }
    });

    document.querySelector(".taskList").addEventListener("change", async (event) => {
      if (!event.target.matches("input[type='checkbox']")) return;
      const checkbox = event.target;
      const taskId = checkbox.dataset.taskId;
      const taskItem = checkbox.closest(".todo");
      checkbox.disabled = true;
      taskItem.classList.add("is-updating");
      try {
        const response = await fetch(`/task/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            completed: checkbox.checked
          })
        });
        if (!response.ok) throw new Error("Failed to update task");
        taskItem.remove();
        const activeTasks = await loadActiveTasks();
        const displayedIds = [...document.querySelectorAll(".todo")].map(item => item.dataset.taskId);
        const nextTask = activeTasks.find(task => !displayedIds.includes(task._id.toString()));
        const taskList = document.querySelector(".taskList");

        if (nextTask) {
          const li = document.createElement("li");
          li.className = "todo";
          li.dataset.taskId = nextTask._id;

          const input = document.createElement("input");
          input.type = "checkbox";
          input.className = "taskCheckbox";
          input.dataset.taskId = nextTask._id;
          input.setAttribute("aria-label", `Complete ${nextTask.title}`);

          const title = document.createElement("span");
          title.className = "taskName";
          title.textContent = nextTask.title;

          const priority = document.createElement("span");
          priority.className = `priority ${nextTask.priority}`;
          priority.textContent = nextTask.priority;

          li.append(input, title, priority);

          taskList.appendChild(li);
        }

        // Show empty message when no tasks remain
        const emptyText = taskList.querySelector(".emptyTasks");

        if (taskList.querySelectorAll(".todo").length === 0) {
          if (!emptyText) {
            const message = document.createElement("li");
            message.className = "emptyTasks";
            message.textContent = "🌸 No active tasks. Time to relax!";
            taskList.appendChild(message);
          }
        } else if (emptyText) {
          emptyText.remove();
        }
        const taskCount = document.querySelector("#taskCount");
        const remaining = Math.max(0, Number(taskCount.dataset.count) - 1);
        taskCount.dataset.count = remaining;
        taskCount.textContent = `${remaining} tasks remaining`;

      } catch (error) {
        checkbox.checked = !checkbox.checked;
        showToast("Failed to update task. Please try again.", true);
        console.error(error);
      } finally {
        checkbox.disabled = false;
        taskItem.classList.remove("is-updating");
      }
    });

    async function loadActiveTasks() {
      try {
        const response = await fetch("/dashboard/tasks-data");
        if (!response.ok) throw new Error("Cannot load the tasks");
        const result = await response.json();
        return result.activeTasks || [];
      } catch (error) {
        console.error(error);
        return [];
      }
    }
    async function loadDashboardDeadlines() {
      const deadlineList = document.querySelector("#deadlineList");
      const deadlineCount = document.querySelector("#deadlineCount");

      try {
        const response = await fetch("/calendar/dashboard-deadlines");

        if (!response.ok) {
          throw new Error("Could not load deadlines");
        }

        const result = await response.json();
        const deadlines = result.data || [];
        const totalDeadlines = deadlines.length;
        const visibleDeadlines = deadlines.slice(0, 4);

        deadlineList.replaceChildren();

        if (deadlines.length === 0) {
          const emptyMessage = document.createElement("li");
          emptyMessage.className = "deadlineLoading";
          emptyMessage.textContent = "🌸 No upcoming deadlines. Enjoy your time!";
          deadlineList.appendChild(emptyMessage);
          deadlineCount.textContent = "Nothing due in the next 7 days";
          return;
        }

        deadlineCount.textContent =
          `${totalDeadlines} upcoming within the next 7 days`;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        visibleDeadlines.forEach((deadline) => {
          const deadlineDate = new Date(deadline.date);
          const daysLeft = Math.round(
            (Date.UTC(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate()) -
              Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())) /
            (1000 * 60 * 60 * 24)
          );

          const item = document.createElement("li");
          item.className = "deadLineItems";

          const name = document.createElement("span");
          name.className = "deadlineName";
          name.textContent = deadline.title;

          const badge = document.createElement("span");
          badge.className = daysLeft <= 2 ? "badge urgent" : "badge";

          if (daysLeft === 0) {
            badge.textContent = "Today";
          } else if (daysLeft === 1) {
            badge.textContent = "Tomorrow";
          } else {
            badge.textContent = `${daysLeft} days`;
          }

          item.append(name, badge);
          deadlineList.appendChild(item);
        });
      } catch (error) {
        console.error("Failed to load dashboard deadlines:", error);

        deadlineList.replaceChildren();

        const errorMessage = document.createElement("li");
        errorMessage.className = "deadlineLoading";
        errorMessage.textContent = "Couldn't load deadlines. Please try again.";
        deadlineList.appendChild(errorMessage);
      }
    }

    async function loadWeeklyStudyTime() {
      const totalElement = document.querySelector("#weeklyStudyTotal");
      const chart = document.querySelector("#weeklyStudyChart");
      const bars = document.querySelectorAll(".weeklyBarFill");

      try {
        const response = await fetch("/focusSession/weekly");

        if (!response.ok) {
          throw new Error("Failed to load weekly study time");
        }

        const data = await response.json();
        const dailyTotals = data.dailyTotals;
        const totalMinutes = Math.floor(data.totalMilliseconds / 60000);

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Replace the total skeleton with the actual study time
        totalElement.textContent = `${hours}h ${minutes}m`;

        const dailyScale = 4 * 60 * 60 * 1000; // 4 hours

        bars.forEach((bar) => {
          const dayIndex = Number(bar.dataset.day);
          const duration = dailyTotals[dayIndex] || 0;
          const tooltip = bar.parentElement.querySelector(".barTooltip");

          const dayMinutes = Math.floor(duration / 60000);
          const dayHours = Math.floor(dayMinutes / 60);
          const remainingMinutes = dayMinutes % 60;

          tooltip.textContent = `${dayHours}h ${remainingMinutes}m`;

          const height = Math.min(
            (duration / dailyScale) * 100,
            100
          );

          bar.style.height = `${height}%`;

          bar.classList.toggle(
            "today",
            dayIndex === new Date(
              Date.now() + 6 * 60 * 60 * 1000
            ).getUTCDay()
          );
        });

      } catch (error) {
        console.error("Failed to load weekly study time:", error);
        totalElement.textContent = "Unavailable";

      } finally {
        // Remove chart skeletons whether loading succeeds or fails
        chart.classList.remove("is-loading");
      }
    }

    loadWeeklyStudyTime();

    loadDashboardDeadlines();