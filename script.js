var taskInput = document.getElementById("task-input");
var addBtn = document.getElementById("add-btn");
var taskList = document.getElementById("task-list");
var emptyState = document.getElementById("empty-state");
var progressCount = document.getElementById("progress-count");

function getTasks() {
  var data = localStorage.getItem("todolist_tasks");
  if (data == null) {
    return [];
  }
  return JSON.parse(data);
}

function saveTasks(tasks) {
  localStorage.setItem("todolist_tasks", JSON.stringify(tasks));
}

function formatarData(d) {
  var data = new Date(d);
  var dia = data.getDate();
  var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var mes = meses[data.getMonth()];
  var ano = data.getFullYear();
  return dia + " de " + mes + " de " + ano;
}

function mostrarTarefas() {
  var tasks = getTasks();
  taskList.innerHTML = "";

  if (tasks.length == 0) {
    emptyState.style.display = "block";
    taskList.style.display = "none";
  } else {
    emptyState.style.display = "none";
    taskList.style.display = "flex";

    for (var i = 0; i < tasks.length; i++) {
      var task = tasks[i];
      var li = document.createElement("li");

      if (task.done == true) {
        li.className = "task-item done";
      } else {
        li.className = "task-item";
      }

      var textoData = "";
      if (task.done == true) {
        textoData = "Concluída em: " + formatarData(task.completedAt);
      } else {
        textoData = "Criada em: " + formatarData(task.createdAt);
      }

      var checkedAtributo = "";
      if (task.done == true) {
        checkedAtributo = "checked";
      }

      li.innerHTML = "<input type='checkbox' " + checkedAtributo + " data-id='" + task.id + "'>" +
        "<div class='task-info'>" +
        "<div class='task-name'>" + task.name + "</div>" +
        "<div class='task-date'>" + textoData + "</div>" +
        "</div>" +
        "<button class='delete-btn' data-id='" + task.id + "'>x</button>";

      taskList.appendChild(li);
    }
  }

  var doneCount = 0;
  for (var j = 0; j < tasks.length; j++) {
    if (tasks[j].done == true) {
      doneCount = doneCount + 1;
    }
  }

  progressCount.innerHTML = doneCount + " de " + tasks.length + " <span>concluídas</span>";
}

function adicionarTarefa() {
  var name = taskInput.value.trim();
  if (name == "") {
    return;
  }

  var tasks = getTasks();

  var novaTarefa = {};
  novaTarefa.id = Date.now().toString();
  novaTarefa.name = name;
  novaTarefa.done = false;
  novaTarefa.createdAt = new Date().toISOString();
  novaTarefa.completedAt = null;

  tasks.unshift(novaTarefa);

  saveTasks(tasks);
  taskInput.value = "";
  mostrarTarefas();
}

addBtn.addEventListener("click", adicionarTarefa);

taskInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    adicionarTarefa();
  }
});

taskList.addEventListener("change", function (e) {
  if (e.target.type == "checkbox") {
    var tasks = getTasks();
    var id = e.target.dataset.id;

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id == id) {
        tasks[i].done = e.target.checked;
        if (tasks[i].done == true) {
          tasks[i].completedAt = new Date().toISOString();
        } else {
          tasks[i].completedAt = null;
        }
      }
    }

    saveTasks(tasks);
    mostrarTarefas();
  }
});

taskList.addEventListener("click", function (e) {
  if (e.target.className == "delete-btn") {
    var tasks = getTasks();
    var id = e.target.dataset.id;
    var novaLista = [];

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id != id) {
        novaLista.push(tasks[i]);
      }
    }

    saveTasks(novaLista);
    mostrarTarefas();
  }
});

window.addEventListener("DOMContentLoaded", function () {
  mostrarTarefas();
});
