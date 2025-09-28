let taskList = [];
let doNowTask = null;
let timerInterval = null;

function updateStats() {
  const total = taskList.length;
  const inProgress = taskList.filter(t => t.status === 'In Progress').length;
  const done = taskList.filter(t => t.status === 'Done').length;
  document.getElementById('stats').textContent = `${total} Task | ${inProgress} In progress | ${done} Done`;
}

function addTask() {
  const task = {
    id: Date.now(),
    status: 'To Do',
    title: '',
    priority: 'HIgh',
    dueDate: '',
    timeLeft: 0 
  };
  taskList.push(task);
  renderTasks();
  updateStats();
}

function renderTasks() {
  const taskListDiv = document.getElementById('taskList');
  taskListDiv.innerHTML = '';

  taskList.forEach((task, index) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.index = index;

    card.innerHTML = `
      <input type="text" class="task-title" placeholder="Enter task title" value="${task.title}" oninput="updateTitle(${task.id}, this.value)">
      <span class="status ${task.status}">${task.status}</span>
      <select class="status-select" onchange="updateStatus(${task.id}, this.value)">
        <option ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
        <option ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option ${task.status === 'Done' ? 'selected' : ''}>Done</option>
      </select>
      <select class="priority-select" onchange="updatePriority(${task.id}, this.value)">
      <option ${task.priority === 'High' ? 'selected' : ''}>High</option>
        <option ${task.priority === 'Mid' ? 'selected' : ''}>Mid</option>
          <option ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
      </select>
      <input type="date" class="date-input" onchange="updateDate(${task.id}, this.value)" value="${task.dueDate}">
      <div class="task-actions">
        <button class="btn btn-move" onclick="DoNow(${task.id})">Do Now</button>
        <button class="btn btn-delete" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    `;

    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('drop', drop);
    card.addEventListener('dragend', dragEnd);

    taskListDiv.appendChild(card);
  });
}

function updateTitle(id, value) {
  const task = taskList.find(t => t.id === id);
  if (task) task.title = value;
}

function updateStatus(id, value) {
  const task = taskList.find(t => t.id === id);
  if (task) {
    task.status = value;
    renderTasks();
    updateStats();
  }
}

function updatePriority(id, value) {
  const task = taskList.find(t => t.id === id);
  if (task) task.priority = value;
}

function updateDate(id, value) {
  const task = taskList.find(t => t.id === id);
  if (task) task.dueDate = value;
}

function deleteTask(id) {
  taskList = taskList.filter(t => t.id !== id);
  if (doNowTask && doNowTask.id === id) {
    clearDoNowTask();
  }
  renderTasks();
  updateStats();
}

function DoNow(id) {
  const task = taskList.find(t => t.id === id);
  if (task) {
    doNowTask = task;
    renderDoNow();
  }
}

function clearDoNowTask() {
  doNowTask = null;
  clearInterval(timerInterval);
  renderDoNow();
}

function renderDoNow() {
  const container = document.getElementById('doNowContent');
  if (!doNowTask) {
    container.innerHTML = 'No task selected';
    return;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  let timerHtml = '';
  if (doNowTask.timeLeft > 0) {
    timerHtml = `<p>Time Left: <span id="timerDisplay">${formatTime(doNowTask.timeLeft)}</span></p>`;
  }

  container.innerHTML = `
    <p><strong>${doNowTask.title || 'Untitled Task'}</strong></p>
    <p>Status: ${doNowTask.status}</p>
    <p>Priority: ${doNowTask.priority}</p>
    <p>Due Date: ${doNowTask.dueDate || 'N/A'}</p>
    ${timerHtml}
    <div>
      <input type="number" id="setMin" placeholder="Min" style="width:45%; padding:4px;" min="0">
      <input type="number" id="setSec" placeholder="Sec" style="width:45%; padding:4px; margin-left:5px;" min="0">
    </div>
    <button class="btn btn-timer" onclick="startTimer()">Set Timer</button>
    <button class="btn btn-delete" onclick="clearDoNowTask()">Delete</button>
  `;

  if (doNowTask.timeLeft > 0) {
    startCountdown();
  }
}

function startTimer() {
  const min = parseInt(document.getElementById('setMin').value) || 0;
  const sec = parseInt(document.getElementById('setSec').value) || 0;
  const totalSec = min * 60 + sec;
  if (totalSec <= 0) {
    alert('Set at least 1 second');
    return;
  }
  doNowTask.timeLeft = totalSec;
  renderDoNow();
}

function startCountdown() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!doNowTask) {
      clearInterval(timerInterval);
      return;
    }
    if (doNowTask.timeLeft > 0) {
      doNowTask.timeLeft--;
      const disp = document.getElementById('timerDisplay');
      if (disp) {
        const m = Math.floor(doNowTask.timeLeft / 60)
          .toString().padStart(2, '0');
        const s = (doNowTask.timeLeft % 60)
          .toString().padStart(2, '0');
        disp.textContent = `${m}:${s}`;
      }
    } else {
      clearInterval(timerInterval);
      alert('Time is up!');
    }
  }, 1000);
}

function dragStart(e) {
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.dataset.index);
}

function dragOver(e) {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const target = e.currentTarget;
  const list = target.parentNode;
  const draggingIdx = parseInt(dragging.dataset.index);
  const targetIdx = parseInt(target.dataset.index);

  if (dragging && list) {

    const temp = taskList[draggingIdx];
    taskList.splice(draggingIdx, 1);
    taskList.splice(targetIdx, 0, temp);
    renderTasks();
  }
}

function drop(e) {
  e.preventDefault();
}

function dragEnd(e) {
  this.classList.remove('dragging');
  renderTasks();
}

renderTasks();
updateStats();
renderDoNow();