"use strict";

// создание элемента
function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

// создание поля ввода
function input(type, id) {
  const node = element("input");
  node.type = type;
  node.id = id;
  return node;
}

// поле вместе с подписью
function field(text, control) {
  const wrapper = element("div", "field");
  const label = element("label", "", text);
  label.htmlFor = control.id;
  wrapper.append(label, control);
  return wrapper;
}

// создание выпадающего списка
function select(id, options) {
  const node = element("select");
  node.id = id;

  options.forEach(function (item) {
    const option = element("option", "", item[1]);
    option.value = item[0];
    node.append(option);
  });

  return node;
}

// создание кнопки
function button(text, className = "") {
  const node = element("button", className, text);
  node.type = "button";
  return node;
}

// подключение оформления
const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "./style.css";
document.head.append(stylesheet);
document.title = "Список задач";

// заголовок страницы
const header = element("header", "page-header");
header.append(element("h1", "", "Список задач"));

const main = element("main", "container");

// форма добавления и редактирования
const formSection = element("section", "panel");
const formHeading = element("h2", "", "Новая задача");
const form = element("form", "task-form");

const titleInput = input("text", "task-title");
titleInput.required = true;
titleInput.placeholder = "Введите название задачи";

const dateInput = input("date", "task-date");
dateInput.required = true;

const submitButton = button("Добавить");
submitButton.type = "submit";

const cancelButton = button("Отменить редактирование", "secondary");
cancelButton.hidden = true;

const formActions = element("div", "form-actions");
formActions.append(submitButton, cancelButton);

form.append(
  field("Название задачи", titleInput),
  field("Дата задачи", dateInput),
  formActions
);
formSection.append(formHeading, form);

// поиск, фильтрация и сортировка
const searchInput = input("search", "task-search");
searchInput.placeholder = "Введите часть названия";

const filterSelect = select("task-filter", [
  ["all", "Все"],
  ["active", "Невыполненные"],
  ["completed", "Выполненные"]
]);

const sortSelect = select("task-sort", [
  ["manual", "Ручной порядок"],
  ["asc", "По дате: сначала ранние"],
  ["desc", "По дате: сначала поздние"]
]);

const toolbar = element("div", "toolbar");
toolbar.append(
  field("Поиск по названию", searchInput),
  field("Статус", filterSelect),
  field("Порядок", sortSelect)
);

// список задач
const listSection = element("section", "panel");
const list = element("ul", "task-list");
const emptyMessage = element("p", "empty-message");

listSection.append(
  element("h2", "", "Задачи"),
  toolbar,
  element(
    "p",
    "hint",
    "Для перетаскивания выберите ручной порядок, статус «Все» и очистите поиск."
  ),
  list,
  emptyMessage
);

main.append(formSection, listSection);
document.body.append(header, main);

// данные приложения
const STORAGE_KEY = "web-lab-2-tasks";
let tasks = loadTasks();
let editingId = null;
let draggedId = null;

// чтение сохранённых задач
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Не удалось загрузить задачи:", error);
    return [];
  }
}

// сохранение изменений
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Не удалось сохранить задачи:", error);
    alert("Браузер не смог сохранить задачи.");
  }

  renderTasks();
}

// возврат формы в режим добавления
function resetForm() {
  editingId = null;
  form.reset();
  titleInput.setCustomValidity("");
  formHeading.textContent = "Новая задача";
  submitButton.textContent = "Добавить";
  cancelButton.hidden = true;
}

// добавление или изменение задачи
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = titleInput.value.trim();

  if (!title) {
    titleInput.setCustomValidity("Введите название, а не только пробелы.");
    titleInput.reportValidity();
    return;
  }

  if (editingId === null) {
    tasks.push({
      id: crypto.randomUUID(),
      title: title,
      date: dateInput.value,
      completed: false
    });
  } else {
    const task = tasks.find(function (item) {
      return item.id === editingId;
    });

    if (task) {
      task.title = title;
      task.date = dateInput.value;
    }
  }

  resetForm();
  saveTasks();
});

titleInput.addEventListener("input", function () {
  titleInput.setCustomValidity("");
});

cancelButton.addEventListener("click", resetForm);

// условия, при которых разрешена ручная перестановка
function canDrag() {
  return (
    sortSelect.value === "manual" &&
    filterSelect.value === "all" &&
    searchInput.value.trim() === ""
  );
}

// отображение списка
function renderTasks() {
  list.replaceChildren();

  const query = searchInput.value.trim().toLowerCase();

  const visibleTasks = tasks.filter(function (task) {
    const matchesSearch = task.title.toLowerCase().includes(query);
    const matchesStatus =
      filterSelect.value === "all" ||
      (filterSelect.value === "active" && !task.completed) ||
      (filterSelect.value === "completed" && task.completed);

    return matchesSearch && matchesStatus;
  });

  if (sortSelect.value !== "manual") {
    visibleTasks.sort(function (first, second) {
      if (sortSelect.value === "asc") {
        return first.date.localeCompare(second.date);
      }

      return second.date.localeCompare(first.date);
    });
  }

  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = tasks.length === 0
    ? "Задач пока нет."
    : "По заданным условиям задачи не найдены.";

  visibleTasks.forEach(function (task) {
    const item = element("li", "task-item");
    item.dataset.id = task.id;
    item.draggable = canDrag();
    item.classList.toggle("completed", task.completed);

    const checkbox = input("checkbox", "done-" + task.id);
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Выполнено: " + task.title);

    const content = element("div", "task-content");
    const date = element(
      "time",
      "task-date",
      task.date.split("-").reverse().join(".")
    );
    date.dateTime = task.date;
    content.append(element("p", "task-title", task.title), date);

    const editButton = button("Редактировать", "secondary");
    editButton.dataset.action = "edit";

    const deleteButton = button("Удалить", "danger");
    deleteButton.dataset.action = "delete";

    const actions = element("div", "task-actions");
    actions.append(editButton, deleteButton);

    item.append(checkbox, content, actions);
    list.append(item);
  });
}

// один обработчик для кнопок всех задач
list.addEventListener("click", function (event) {
  const clickedButton = event.target.closest("button");

  if (!clickedButton) {
    return;
  }

  const id = clickedButton.closest("li").dataset.id;

  if (clickedButton.dataset.action === "delete") {
    tasks = tasks.filter(function (task) {
      return task.id !== id;
    });

    if (editingId === id) {
      resetForm();
    }

    saveTasks();
  } else {
    const task = tasks.find(function (item) {
      return item.id === id;
    });

    editingId = id;
    titleInput.value = task.title;
    dateInput.value = task.date;
    titleInput.setCustomValidity("");
    formHeading.textContent = "Редактирование задачи";
    submitButton.textContent = "Сохранить";
    cancelButton.hidden = false;
    form.scrollIntoView({ block: "center" });
    titleInput.focus();
  }
});

// отметка о выполнении
list.addEventListener("change", function (event) {
  if (!event.target.matches(".task-checkbox")) {
    return;
  }

  const id = event.target.closest("li").dataset.id;
  const task = tasks.find(function (item) {
    return item.id === id;
  });

  task.completed = event.target.checked;
  saveTasks();
});

// поиск, фильтр и сортировка обновляют отображение
searchInput.addEventListener("input", renderTasks);
filterSelect.addEventListener("change", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// начало перетаскивания
list.addEventListener("dragstart", function (event) {
  const item = event.target.closest(".task-item");

  if (!item || !canDrag()) {
    event.preventDefault();
    return;
  }

  draggedId = item.dataset.id;
  event.dataTransfer.setData("text/plain", draggedId);
  event.dataTransfer.effectAllowed = "move";
  item.classList.add("dragging");
});

// разрешаем сброс на карточку
list.addEventListener("dragover", function (event) {
  if (canDrag() && draggedId !== null) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }
});

// перестановка задач
list.addEventListener("drop", function (event) {
  event.preventDefault();

  const target = event.target.closest(".task-item");

  if (!target || !canDrag() || draggedId === null) {
    return;
  }

  if (target.dataset.id === draggedId) {
    return;
  }

  const sourceIndex = tasks.findIndex(function (task) {
    return task.id === draggedId;
  });

  if (sourceIndex === -1) {
    return;
  }

  const rectangle = target.getBoundingClientRect();
  const insertAfter =
    event.clientY > rectangle.top + rectangle.height / 2;

  const movedTask = tasks.splice(sourceIndex, 1)[0];

  let targetIndex = tasks.findIndex(function (task) {
    return task.id === target.dataset.id;
  });

  if (insertAfter) {
    targetIndex++;
  }

  tasks.splice(targetIndex, 0, movedTask);
  draggedId = null;
  saveTasks();
});

list.addEventListener("dragend", function () {
  draggedId = null;

  const item = list.querySelector(".dragging");
  if (item) {
    item.classList.remove("dragging");
  }
});

// начальное отображение
renderTasks();