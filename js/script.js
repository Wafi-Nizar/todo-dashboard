let tasks = [
    {
        id: 1,
        title: "Task Name",
        subtitle: "Task Description",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        color: "blue",
        status: "ongoing",
        subtasks: [
            { id: 101, title: "Design layout", done: true },
            { id: 102, title: "Build modal", done: false }
        ]
    },
    {
        id: 2,
        title: "UI Polish",
        subtitle: "Task Description",
        description: "Refine spacing, borders, and card layout to better match the design reference.",
        color: "yellow",
        status: "in-process",
        subtasks: [
            { id: 201, title: "Fix spacing", done: true },
            { id: 202, title: "Improve task card", done: false }
        ]
    }
];

let selectedTaskId = null;

const tasksGrid = document.querySelector(".tasks-grid");
const addButton = document.querySelector("#add-button");
const cancelButton = document.querySelector("#cancel-button");
const deleteButton = document.querySelector("#delete-button");

const taskViewModal = document.querySelector('#task-view-modal');
const closeTaskViewButton = document.querySelector('#close-task-view');
const viewTaskTitle = document.querySelector("#view-task-title");
const viewTaskSubtitle = document.querySelector("#view-task-subtitle");
const viewTaskDescription = document.querySelector("#view-task-description");
const viewTaskProgress = document.querySelector("#view-task-progress");
const subtasksList = document.querySelector("#subtasks-list");
const addSubtaskButton = document.querySelector("#add-subtask-button");
const newSubtaskTitle = document.querySelector("#new-subtask-title");

let openedTaskId = null;

const savedTasks = localStorage.getItem("tasks");

const taskStatusSelect = document.querySelector("#task-status-select");

if (savedTasks) {
    tasks = JSON.parse(savedTasks);
}

function createTaskCard(task) {
    const selectClass = task.id === selectedTaskId ? " selected" : "";
    const progress = getTaskProgress(task);
    const progressDegrees = progress * 3.6;
    const progressColor = getProgressColor(task);

    return `
        <div class="task-card${selectClass}" data-id="${task.id}">
            <div class="task-details">
                <div class="task-info">
                    <div class="task-name">${task.title}</div>
                    <div class="task-description-title">${task.subtitle}</div>
                </div>

                <p class="task-description">
                    ${task.description}
                </p>

                <div class="task-footer">
                    <img src="./assets/check.svg" class="task-footer-icon">
                    <span>${task.subtasks.length} tasks</span>
                </div>

                <div class="status-pill ${task.status}">
                    ${formatStatus(task.status)}
                </div>
            </div>

            <div 
                class="progress-circle" 
                style="background: conic-gradient(${progressColor} 0deg ${progressDegrees}deg, #d9d9d9 ${progressDegrees}deg 360deg);"
            >
                <span>${progress}%</span>
            </div>
        </div>
    `;
}

function formatStatus(status) {
    if (status === "ongoing") return "On Going";
    if (status === "in-process") return "In Process";
    if (status === "completed") return "Completed";
    if (status === "canceled") return "Canceled";
    return status;
}

function renderSubtasks(task) {
    subtasksList.innerHTML = task.subtasks.map((subtask) => `
        <div class="subtasks-item" data-subtasks-id="${subtask.id}">
            <div class="subtasks-left">
                <input
                    type="checkbox"
                    class="subtask-checkbox"
                    data-subtask-id="${subtask.id}"
                    ${subtask.done ? "checked" : ""}
                >
            
                <span class="${subtask.done ? "subtasks-done" : ""}">
                    ${subtask.title}
                </span>
            </div>
        </div>
    `).join("");
            
    const checkboxes = document.querySelectorAll(".subtask-checkbox");
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const subtaskId = Number(checkbox.dataset.subtaskId);
            toggleSubtask(subtaskId);
        });
    });
}

function renderTasks() {
    if (tasks.length === 0) {
        tasksGrid.innerHTML = "<p>No tasks yet. Add one 🚀</p>";
        updateStatusCards();
        return;
    }

    tasksGrid.innerHTML = tasks.map(createTaskCard).join("");

    const cards = document.querySelectorAll(".task-card");

    cards.forEach((card) => {
        let clickTimer = null;
        const taskId = Number(card.dataset.id)

        card.addEventListener("click", () => {
            clickTimer = setTimeout(() => {
                selectedTaskId = taskId;
                renderTasks();
            }, 200);
        });

        card.addEventListener("dblclick", () => {
            clearTimeout(clickTimer);
            selectedTaskId = taskId;
            renderTasks();
            openTaskView(taskId);
        });
    });

    updateStatusCards();
}

function openTaskView(taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    openedTaskId = taskId;

    viewTaskTitle.textContent = task.title;
    viewTaskSubtitle.textContent = task.subtitle;
    viewTaskDescription.textContent = task.description;
    taskStatusSelect.value = task.status;

    updateTaskViewMeta(task);
    renderSubtasks(task);
    taskViewModal.classList.remove("hidden");
}

function toggleSubtask(subtaskId) {
    const task = tasks.find((t) => t.id === openedTaskId);
    if (!task) return;

    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    subtask.done = !subtask.done;

    saveTasks();
    renderSubtasks(task);
    renderTasks();
    updateTaskViewMeta(task);
}

function updateStatusCards() {
    const ongoingCount = tasks.filter(task => task.status === "ongoing").length;
    const inProcessCount = tasks.filter(task => task.status === "in-process").length;
    const completedCount = tasks.filter(task => task.status === "completed").length;
    const canceledCount = tasks.filter(task => task.status === "canceled").length;

    document.querySelector("#on-going .task-count").textContent = `${ongoingCount} Tasks`;
    document.querySelector("#in-process .task-count").textContent = `${inProcessCount} Tasks`;
    document.querySelector("#completed .task-count").textContent = `${completedCount} Tasks`;
    document.querySelector("#canceled .task-count").textContent = `${canceledCount} Tasks`;
}

function updateTaskViewMeta(task) {
    viewTaskProgress.textContent = `Progress: ${getTaskProgress(task)}%`
}

function getCompletedSubtaskCount(task) {
    return task.subtasks.filter((subtask) => subtask.done).length;
}

function getTaskProgress(task) {
    if (task.subtasks.length === 0) return 0;
    return Math.round((getCompletedSubtaskCount(task) / task.subtasks.length) * 100);
}

function getStatusColor(status) {
    if (status === "ongoing") return "blue";
    if (status === "in-process") return "yellow";
    if (status === "completed") return "green";
    if (status === "canceled") return "red";
    return "blue";
}

function getProgressColor(task) {
    if (task.status === "canceled") return "#ef4444";
    if (task.status === "completed") return "#22c55e";
    if (task.status === "in-process") return "#facc15";
    return "#3b82f6";
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

const taskModal = document.querySelector("#task-modal");
const taskForm = document.querySelector("#task-form")

addButton.addEventListener("click", () => {
    taskModal.classList.remove("hidden");
    document.querySelector("#task-title").focus();
});

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const taskTitle = document.querySelector('#task-title').value.trim();
    const taskSubtitle = document.querySelector('#task-subtitle').value.trim();
    const taskDescription = document.querySelector('#task-description').value.trim();

    if (!taskTitle || !taskSubtitle) return;

    const newTask = {
        id: Date.now(),
        title: taskTitle,
        subtitle: taskSubtitle,
        description: taskDescription,
        color: "green",
        status: "ongoing",
        subtasks: [],
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();

    taskForm.reset();
    taskModal.classList.add("hidden");
});

cancelButton.addEventListener("click", () => {
    taskModal.classList.add("hidden");
});

deleteButton.addEventListener("click", () => {
    if (selectedTaskId === null) return;

    const index = tasks.findIndex((t) => t.id === selectedTaskId);
    if (index === -1) return;

    tasks.splice(index, 1);
    saveTasks();
    selectedTaskId = null;
    renderTasks();
});

taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) {
        taskModal.classList.add("hidden");
    }
});

closeTaskViewButton.addEventListener("click", () => {
    taskViewModal.classList.add("hidden");
});

taskViewModal.addEventListener("click", (e) => {
    if (e.target === taskViewModal) {
        taskViewModal.classList.add("hidden");
    }
});

addSubtaskButton.addEventListener("click", () => {
    if (!openedTaskId) return;

    const title = newSubtaskTitle.value.trim();
    if (!title) return;

    const task = tasks.find((t) => t.id === openedTaskId);
    if (!task) return;

    task.subtasks.push({
        id: Date.now(),
        title,
        done: false
    });

    saveTasks();

    newSubtaskTitle.value = "";

    renderSubtasks(task);
    renderTasks();
    updateTaskViewMeta(task);
});

taskStatusSelect.addEventListener("change", () => {
    if (!openedTaskId) return;

    const task = tasks.find((t) => t.id === openedTaskId);
    if (!task) return;

    task.status = taskStatusSelect.value;
    task.color = getStatusColor(task.status);

    saveTasks();
    renderTasks();
    updateTaskViewMeta(task);
})

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        taskModal.classList.add("hidden");
        taskViewModal.classList.add("hidden");
    }
});

renderTasks();