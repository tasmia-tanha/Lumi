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
const totalHoursText = document.querySelector("#totalHoursText");
const hoursDisplay = document.querySelector("#hours");
const minsDisplay = document.querySelector("#minutes");
const secsDisplay = document.querySelector("#seconds");
const timerMessage = document.querySelector("#timerMessage");
const timerStatus = document.querySelector(".timerStatus");
const modeButtons = document.querySelectorAll(".timerModeSelector .modeBtn");
const durationButtons = document.querySelectorAll(
  ".durationOptions .durationBtn[data-duration]",
);
const customDurationBox = document.querySelector("#customDurationBox");
const customDurationInput = document.querySelector("#customDurationInput");
const saveGoalBtn = document.querySelector("#saveDailyGoalBtn");
const goalHoursInput = document.querySelector("#goalHoursInput");
const goalMinutesInput = document.querySelector("#goalMinutesInput");
const goalSettingsMessage = document.querySelector("#goalSettingsMessage");
const studyDurationText = document.querySelector("#studyDurationText");

const MINUTE = 60 * 1000;
const DEFAULT_FOCUS_DURATION = 25 * MINUTE;
const BREAK_DURATION = 5 * MINUTE;
const STATE_KEY = "lumiTimerState";

let elapsedMs = 0;
let startTime = null;
let timerInterval = null;
let isRunning = false;
let isStopped = false;
let currentMode = "free";
let timerType = "study";
let focusDuration = DEFAULT_FOCUS_DURATION;
let remainingTime = focusDuration;
let pomodoroCompleted = false;
let sessionSaved = false;

function showToast(text, duration = 2400) {
  Toastify({
    text,
    duration,
    gravity: "top",
    position: "right",
  }).showToast();
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h,
    m,
    s,
  };
}

function renderCountUp() {
  const { h, m, s } = formatDuration(
    elapsedMs + (isRunning && startTime ? Date.now() - startTime : 0),
  );
  hoursDisplay.textContent = String(h).padStart(2, "0");
  minsDisplay.textContent = String(m).padStart(2, "0");
  secsDisplay.textContent = String(s).padStart(2, "0");
}

function renderCountdown() {
  const ms = Math.max(
    0,
    remainingTime - (isRunning && startTime ? Date.now() - startTime : 0),
  );
  const { h, m, s } = formatDuration(ms);
  hoursDisplay.textContent = String(h).padStart(2, "0");
  minsDisplay.textContent = String(m).padStart(2, "0");
  secsDisplay.textContent = String(s).padStart(2, "0");
}

function renderTimer() {
  if (currentMode === "pomodoro") renderCountdown();
  else renderCountUp();
  if (timerStatus) {
    timerStatus.textContent = isRunning
      ? timerType === "break"
        ? "Break in progress"
        : "Focus session in progress"
      : pomodoroCompleted && timerType === "study"
        ? "Session complete"
        : isStopped
          ? "Session stopped"
          : "Ready when you are";
  }
}

function persistTimerState() {
  const state = {
    elapsedMs,
    startTime,
    isRunning,
    isStopped,
    currentMode,
    timerType,
    focusDuration,
    remainingTime,
    pomodoroCompleted,
    sessionSaved,
  };
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save timer state:", error);
  }
}

function stopInterval() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

async function saveStudySession(durationMs) {
  const duration = Math.floor(durationMs);
  if (duration < 1000) return false;
  try {
    const response = await fetch("/focusSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        duration,
        mode: currentMode,
      }),
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Failed to save study session.");
    await loadFocusStats();
    return true;
  } catch (error) {
    console.error("Could not save study session:", error);
    showToast("Could not save your study session. Please try again.");
    return false;
  }
}

async function completePomodoroStudy() {
  if (sessionSaved) return;
  sessionSaved = true;
  const saved = await saveStudySession(focusDuration);
  if (!saved) sessionSaved = false;
}

async function loadFocusStats() {
  try {
    const response = await fetch("/focusSession/total");
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to load study statistics.");

    const todayMs = Number(data.todayMilliseconds) || 0;
    const goalMinutes = Number(data.dailyGoalMinutes) || 120;
    const goalMs = goalMinutes * MINUTE;
    const todayMinutes = Math.floor(todayMs / MINUTE);
    totalHoursText.textContent = (todayMs / 3600000).toFixed(2);
    document.querySelector("#todayStudyMinutes").textContent =
      `${todayMinutes} min`;

    const goalHours = Math.floor(goalMinutes / 60);
    const goalRemainder = goalMinutes % 60;
    const goalParts = [];
    if (goalHours) goalParts.push(`${goalHours} hr`);
    if (goalRemainder) goalParts.push(`${goalRemainder} min`);
    document.querySelector("#dailyGoalTarget").textContent =
      `of ${goalParts.join(" ")}`;
    document.querySelector("#dailyGoalOverview").textContent =
      goalRemainder === 0
        ? String(goalHours)
        : `${goalHours}:${String(goalRemainder).padStart(2, "0")}`;
    document.querySelector("#streakDays").textContent = data.streak ?? 0;
    document.querySelector("#goalProgressFill").style.width =
      `${Math.min(100, (todayMs / goalMs) * 100)}%`;
    document.querySelector("#goalMessage").textContent = data.goalMet
      ? "Daily goal completed! Amazing work 🌱"
      : "You've got this! Keep growing 🌿";

    goalHoursInput.value = String(Math.floor(goalMinutes / 60));
    goalMinutesInput.value = String(goalMinutes % 60);
    if (
      goalSettingsMessage &&
      goalSettingsMessage.textContent === "Saving..."
    ) {
      goalSettingsMessage.textContent = "Daily goal saved successfully!";
    }

    const title = document.querySelector("#lastSessionTitle");
    const details = document.querySelector("#lastSessionDetails");
    if (data.lastSession) {
      const session = data.lastSession;
      const modeNames = {
        free: "Free Study",
        pomodoro: "Pomodoro",
        deep: "Deep Focus",
      };
      const mins = Math.round((Number(session.duration) || 0) / MINUTE);
      title.textContent = modeNames[session.mode] || "Study Session";
      details.textContent = `${mins} min · ${new Date(session.createdAt).toLocaleString()}`;
    } else {
      title.textContent = "No sessions yet";
      details.textContent = "Your first study session starts here 🌱";
    }
    document.querySelectorAll(".focusSkeleton").forEach((element) => {
      element.classList.remove("focusSkeleton");
    });
  } catch (error) {
    console.error("Could not load focus statistics:", error);

    document.querySelectorAll(".focusSkeleton").forEach((element) => {
      element.classList.remove("focusSkeleton");
      element.textContent = "—";
    });

    const progressFill = document.querySelector("#goalProgressFill");
    progressFill.style.width = "0%";
  }
}

saveGoalBtn.addEventListener("click", async () => {
  const hours = Number(goalHoursInput.value);
  const minutes = Number(goalMinutesInput.value);
  const totalMinutes = hours * 60 + minutes;

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    totalMinutes < 1 ||
    totalMinutes > 1440
  ) {
    goalSettingsMessage.textContent =
      "Choose a goal between 1 minute and 24 hours.";
    return;
  }

  const originalHTML = saveGoalBtn.innerHTML;

  goalSettingsMessage.textContent = "Saving...";
  saveGoalBtn.disabled = true;
  saveGoalBtn.innerHTML = `
  <span class="loadingSpinner"></span>
  Saving...
`;
  try {
    const response = await fetch("/focusSession/goal", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hours,
        minutes,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Could not save goal.");
    goalSettingsMessage.textContent = data.message;
    await loadFocusStats();
  } catch (error) {
    goalSettingsMessage.textContent = error.message;
  } finally {
    saveGoalBtn.disabled = false;
    saveGoalBtn.innerHTML = originalHTML;
  }
});

goalHoursInput.addEventListener("change", () => {
  if (Number(goalHoursInput.value) === 24) goalMinutesInput.value = "0";
});

function updateStudyDurationLabel() {
  if (studyDurationText)
    studyDurationText.textContent = `${Math.round(focusDuration / MINUTE)} min`;
}

function resetSessionState() {
  elapsedMs = 0;
  remainingTime = focusDuration;
  timerType = "study";
  pomodoroCompleted = false;
  sessionSaved = false;
  isStopped = false;
  startTime = null;
}

function tick() {
  if (currentMode === "pomodoro") {
    const remaining = Math.max(0, remainingTime - (Date.now() - startTime));
    if (remaining <= 0) {
      remainingTime = 0;
      stopInterval();
      isRunning = false;
      startTime = null;
      if (timerType === "study") {
        pomodoroCompleted = true;
        timerMessage.textContent =
          "Pomodoro complete! Your session is being saved. Start your break when ready ☕";
        renderTimer();
        persistTimerState();
        completePomodoroStudy().then(() => {
          showToast("Pomodoro complete! Study time saved 🌱", 3000);
          persistTimerState();
        });
      } else {
        timerType = "study";
        remainingTime = focusDuration;
        elapsedMs = 0;
        pomodoroCompleted = false;
        sessionSaved = false;
        timerMessage.textContent =
          "Break complete! Ready for another Pomodoro? 🌱";
        renderTimer();
        persistTimerState();
        showToast("Break complete! 🌱");
      }
      return;
    }
  } else {
    elapsedMs += Date.now() - startTime;
    startTime = Date.now();
  }
  renderTimer();
  persistTimerState();
}

function startTimer() {
  if (isRunning) return;
  if (
    currentMode === "pomodoro" &&
    timerType === "study" &&
    pomodoroCompleted
  ) {
    showToast("Take your break before starting another Pomodoro ☕");
    return;
  }
  if (isStopped) {
    resetSessionState();
  }
  isRunning = true;
  startTime = Date.now();
  stopInterval();
  timerInterval = setInterval(tick, 250);

  timerMessage.textContent =
    timerType === "break"
      ? "Enjoy your 5-minute break ☕"
      : currentMode === "pomodoro"
        ? `Focus for ${Math.round(focusDuration / MINUTE)} minutes`
        : "You're in Free Study. Keep going at your own pace 🌱";

  renderTimer();
  persistTimerState();
}

function pauseTimer() {
  if (!isRunning) return;
  const delta = Math.max(0, Date.now() - startTime);
  if (currentMode === "pomodoro")
    remainingTime = Math.max(0, remainingTime - delta);
  else elapsedMs += delta;
  stopInterval();
  isRunning = false;
  startTime = null;
  renderTimer();
  persistTimerState();
}

function resetTimer() {
  stopInterval();
  isRunning = false;
  resetSessionState();

  timerMessage.textContent =
    currentMode === "pomodoro"
      ? `Ready for a ${Math.round(focusDuration / MINUTE)}-minute session?`
      : "Ready to focus?";

  renderTimer();
  persistTimerState();
}

async function stopTimer() {
  if (timerType === "break" && currentMode === "pomodoro") {
    stopInterval();
    isRunning = false;
    isStopped = false;
    startTime = null;
    timerType = "study";
    remainingTime = focusDuration;
    elapsedMs = 0;
    pomodoroCompleted = false;
    sessionSaved = false;
    timerMessage.textContent = "Break ended. Ready for another Pomodoro? 🌱";
    renderTimer();
    persistTimerState();
    return;
  }
  if (isStopped) return;

  let durationMs;
  if (currentMode === "pomodoro") {
    const currentRemaining = isRunning
      ? Math.max(0, remainingTime - (Date.now() - startTime))
      : remainingTime;
    durationMs = Math.max(0, focusDuration - currentRemaining);
    remainingTime = currentRemaining;
  } else {
    durationMs =
      elapsedMs + (isRunning && startTime ? Date.now() - startTime : 0);
    elapsedMs = durationMs;
  }

  stopInterval();
  isRunning = false;
  isStopped = true;
  startTime = null;
  renderTimer();
  persistTimerState();

  if (durationMs >= 1000 && !sessionSaved) {
    const stopBtn = document.querySelector("#stopBtn");
    const originalHTML = stopBtn.innerHTML;

    stopBtn.disabled = true;
    stopBtn.innerHTML = `
    <span class="loadingSpinner"></span>
    Saving...
  `;

    try {
      const saved = await saveStudySession(durationMs);
      if (saved) sessionSaved = true;
      persistTimerState();
    } finally {
      stopBtn.disabled = false;
      stopBtn.innerHTML = originalHTML;
    }
  }
  timerMessage.textContent =
    durationMs >= 1000
      ? "Session stopped. Your study time has been logged 🌱"
      : "No study time to save yet.";
}

function startBreak() {
  if (
    currentMode !== "pomodoro" ||
    isRunning ||
    timerType !== "study" ||
    !pomodoroCompleted ||
    remainingTime > 0
  ) {
    showToast("Finish a Pomodoro session before starting your break.");
    return;
  }
  timerType = "break";
  remainingTime = BREAK_DURATION;
  elapsedMs = 0;
  isStopped = false;
  startTime = null;
  timerMessage.textContent = "Enjoy your 5-minute break ☕";
  renderTimer();
  persistTimerState();
  startTimer();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isRunning) {
      showToast("Pause the timer before changing modes.");
      return;
    }
    stopInterval();
    currentMode = button.dataset.mode;
    modeButtons.forEach((btn) =>
      btn.classList.toggle("active", btn === button),
    );
    resetSessionState();

    timerMessage.textContent =
      currentMode === "pomodoro"
        ? `Ready for a ${Math.round(focusDuration / MINUTE)}-minute session?`
        : "Ready to focus?";

    renderTimer();
    persistTimerState();
  });
});

durationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isRunning) {
      showToast("Pause the timer before changing duration.");
      return;
    }
    if (currentMode !== "pomodoro") {
      showToast("Select Pomodoro mode to change the focus duration.");
      return;
    }
    const value = button.dataset.duration;
    if (value === "custom") {
      customDurationBox.hidden = false;
      customDurationInput.focus();
      durationButtons.forEach((btn) =>
        btn.classList.toggle("active", btn === button),
      );
      return;
    }
    focusDuration = Number(value) * MINUTE;
    durationButtons.forEach((btn) =>
      btn.classList.toggle("active", btn === button),
    );
    customDurationBox.hidden = true;
    resetSessionState();
    updateStudyDurationLabel();
    timerMessage.textContent = `Ready for a ${value}-minute session?`;
    renderTimer();
    persistTimerState();
  });
});

document.querySelector("#applyCustomDuration").addEventListener("click", () => {
  if (isRunning) {
    showToast("Pause the timer before changing duration.");
    return;
  }
  if (currentMode !== "pomodoro") {
    showToast("Select Pomodoro mode to change the focus duration.");
    return;
  }
  const customMinutes = Number(customDurationInput.value);
  if (
    !Number.isInteger(customMinutes) ||
    customMinutes < 1 ||
    customMinutes > 180
  ) {
    showToast("Enter a whole number between 1 and 180.");
    return;
  }
  focusDuration = customMinutes * MINUTE;
  durationButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.duration === "custom"),
  );
  customDurationBox.hidden = true;
  resetSessionState();
  updateStudyDurationLabel();
  timerMessage.textContent = `Ready for a ${customMinutes}-minute session?`;
  renderTimer();
  persistTimerState();
});

document.querySelector("#startBreakBtn").addEventListener("click", startBreak);
document.querySelector("#startBtn").addEventListener("click", startTimer);
document.querySelector("#pauseBtn").addEventListener("click", pauseTimer);
document.querySelector("#resetBtn").addEventListener("click", resetTimer);
document.querySelector("#stopBtn").addEventListener("click", stopTimer);

function restoreTimerState() {
  let state;
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) {
      renderTimer();
      updateStudyDurationLabel();
      return;
    }
    state = JSON.parse(raw);
  } catch (error) {
    console.error("Could not restore timer state:", error);
    renderTimer();
    return;
  }

  elapsedMs = Math.max(0, Number(state.elapsedMs) || 0);
  isStopped = Boolean(state.isStopped);
  currentMode = ["free", "pomodoro"].includes(state.currentMode)
    ? state.currentMode
    : "free";
  timerType = state.timerType === "break" ? "break" : "study";
  focusDuration = Math.min(
    180 * MINUTE,
    Math.max(MINUTE, Number(state.focusDuration) || DEFAULT_FOCUS_DURATION),
  );
  remainingTime = Number.isFinite(Number(state.remainingTime))
    ? Math.max(0, Number(state.remainingTime))
    : focusDuration;
  pomodoroCompleted = Boolean(state.pomodoroCompleted);
  sessionSaved = Boolean(state.sessionSaved);
  modeButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.mode === currentMode),
  );

  durationButtons.forEach((btn) => {
    const val = btn.dataset.duration;
    const selected =
      (val === "25" && focusDuration === 25 * MINUTE) ||
      (val === "50" && focusDuration === 50 * MINUTE) ||
      (val === "custom" &&
        focusDuration !== 25 * MINUTE &&
        focusDuration !== 50 * MINUTE);
    btn.classList.toggle("active", selected);
  });
  if (focusDuration !== 25 * MINUTE && focusDuration !== 50 * MINUTE)
    customDurationInput.value = String(Math.round(focusDuration / MINUTE));
  updateStudyDurationLabel();

  if (state.isRunning && state.startTime) {
    const delta = Math.max(0, Date.now() - Number(state.startTime));
    if (currentMode === "pomodoro") {
      remainingTime = Math.max(0, remainingTime - delta);
      if (remainingTime <= 0) {
        isRunning = false;
        startTime = null;
        if (timerType === "study") {
          remainingTime = 0;
          pomodoroCompleted = true;
          timerMessage.textContent =
            "Pomodoro complete! Your session is being saved. Start your break when ready ☕";
          renderTimer();
          completePomodoroStudy();
        } else {
          timerType = "study";
          remainingTime = focusDuration;
          pomodoroCompleted = false;
          timerMessage.textContent =
            "Break complete! Ready for another Pomodoro? 🌱";
        }
      } else {
        isRunning = false;
        startTime = null;
        startTimer();
        return;
      }
    } else {
      elapsedMs += delta;
      isRunning = false;
      startTime = null;
      startTimer();
      return;
    }
  } else {
    isRunning = false;
    startTime = null;
  }

  timerMessage.textContent =
    currentMode === "pomodoro"
      ? timerType === "break"
        ? "Break paused. Resume when ready ☕"
        : pomodoroCompleted
          ? "Pomodoro complete! Start your break when ready ☕"
          : `Ready for a ${Math.round(focusDuration / MINUTE)}-minute session?`
      : "Ready to focus?";

  renderTimer();
  persistTimerState();
}

let audioContext = null;
let ambienceNodes = [];
let ambienceSource = null;
let pianoInterval = null;

function stopAmbience() {
  if (pianoInterval) {
    clearInterval(pianoInterval);
    pianoInterval = null;
  }

  ambienceNodes.forEach((node) => {
    try {
      if (node.stop) node.stop();
    } catch (_) {}

    try {
      node.disconnect();
    } catch (_) {}
  });

  ambienceNodes = [];
  ambienceSource = null;

  if (audioContext && audioContext.state !== "closed") {
    audioContext.suspend().catch(() => {});
  }
}

function makeNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
  const output = buffer.getChannelData(0);

  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createMasterGain() {
  const master = audioContext.createGain();
  master.gain.value = 0.35;
  master.connect(audioContext.destination);
  ambienceNodes.push(master);

  return master;
}

function playRain() {
  const master = createMasterGain();

  const source = audioContext.createBufferSource();
  source.buffer = makeNoiseBuffer(audioContext);
  source.loop = true;

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 850;

  const gain = audioContext.createGain();
  gain.gain.value = 0.12;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  source.start();

  ambienceNodes.push(source, filter, gain);
  ambienceSource = "rain";
}

function playForest() {
  const master = createMasterGain();

  const wind = audioContext.createBufferSource();
  wind.buffer = makeNoiseBuffer(audioContext);
  wind.loop = true;

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 450;

  const windGain = audioContext.createGain();
  windGain.gain.value = 0.08;

  wind.connect(filter);
  filter.connect(windGain);
  windGain.connect(master);

  wind.start();

  ambienceNodes.push(wind, filter, windGain);
  ambienceSource = "forest";
}

function playPiano() {
  const master = createMasterGain();

  const notes = [
    [261.63, 329.63, 392.0],
    [293.66, 349.23, 440.0],
    [261.63, 329.63, 392.0],
    [220.0, 261.63, 329.63],
  ];

  let chordIndex = 0;

  function playChord() {
    if (ambienceSource !== "piano") return;

    const now = audioContext.currentTime;

    notes[chordIndex].forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.045, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      oscillator.connect(gain);
      gain.connect(master);

      oscillator.start(now);
      oscillator.stop(now + 2.5);

      ambienceNodes.push(oscillator, gain);
    });

    chordIndex = (chordIndex + 1) % notes.length;
  }

  ambienceSource = "piano";
  playChord();
  pianoInterval = setInterval(playChord, 2500);
}

async function playAmbience(kind) {
  stopAmbience();

  if (kind === "none") return;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    showToast("Audio isn't supported by this browser.");
    return;
  }

  try {
    if (!audioContext || audioContext.state === "closed") {
      audioContext = new AudioContextClass();
    }

    await audioContext.resume();

    if (kind === "rain") playRain();
    else if (kind === "forest") playForest();
    else if (kind === "piano") playPiano();
  } catch (error) {
    console.error("Could not start ambience:", error);
    showToast("Couldn't start ambience. Try clicking the option again.");
  }
}

document.querySelectorAll(".ambienceBtn").forEach((button, index) => {
  const kinds = ["none", "rain", "piano", "forest"];

  button.addEventListener("click", () => {
    document.querySelectorAll(".ambienceBtn").forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });

    playAmbience(kinds[index]);
  });
});

updateStudyDurationLabel();
loadFocusStats();
restoreTimerState();
