var isRegisterMode = false;

var authScreen = document.getElementById("auth-screen");
var appScreen = document.getElementById("app-screen");
var authForm = document.getElementById("auth-form");
var authTitle = document.getElementById("auth-title");
var authSubtitle = document.getElementById("auth-subtitle");
var authSubmit = document.getElementById("auth-submit");
var authError = document.getElementById("auth-error");
var nameField = document.getElementById("name-field");
var nameInput = document.getElementById("name");
var emailInput = document.getElementById("email");
var passwordInput = document.getElementById("password");
var toggleBtn = document.getElementById("toggle-btn");
var toggleText = document.getElementById("toggle-text");
var userNameEl = document.getElementById("user-name");
var taskInput = document.getElementById("task-input");
var addBtn = document.getElementById("add-btn");
var taskList = document.getElementById("task-list");
var emptyState = document.getElementById("empty-state");
var progressCount = document.getElementById("progress-count");
var logoutBtn = document.getElementById("logout-btn");

function getUsers() {
  var data = localStorage.getItem("todolist_users");
  if (data == null) {
    return [];
  }
  return JSON.parse(data);
}

function saveUsers(users) {
  localStorage.setItem("todolist_users", JSON.stringify(users));
}

function getTasks(email) {
  var data = localStorage.getItem("todolist_tasks_" + email);
  if (data == null) {
    return [];
  }
  return JSON.parse(data);
}

function saveTasks(email, tasks) {
  localStorage.setItem("todolist_tasks_" + email, JSON.stringify(tasks));
}

function achaUsuarioPorEmail(users, email) {
  for (var i = 0; i < users.length; i++) {
    if (users[i].email == email) {
      return users[i];
    }
  }
  return null;
}

function alternarModo() {
  isRegisterMode = !isRegisterMode;
  authError.textContent = "";
  authForm.reset();

  if (isRegisterMode == true) {
    authTitle.textContent = "Criar conta";
    authSubtitle.textContent = "Cadastre-se para começar a organizar suas tarefas";
    nameField.style.display = "block";
    nameInput.required = true;
    authSubmit.textContent = "Criar conta";
    toggleText.textContent = "Já tem conta?";
    toggleBtn.textContent = "Entrar";
  } else {
    authTitle.textContent = "Entrar";
    authSubtitle.textContent = "Acesse sua conta para ver suas tarefas";
    nameField.style.display = "none";
    nameInput.required = false;
    authSubmit.textContent = "Entrar";
    toggleText.textContent = "Não tem conta?";
    toggleBtn.textContent = "Crie sua conta";
  }
}

toggleBtn.addEventListener("click", alternarModo);

function enviarFormulario(e) {
  e.preventDefault();
  authError.textContent = "";

  var email = emailInput.value.trim().toLowerCase();
  var password = passwordInput.value;
  var users = getUsers();

  if (isRegisterMode == true) {
    var name = nameInput.value.trim();
    var jaExiste = achaUsuarioPorEmail(users, email);

    if (jaExiste != null) {
      authError.textContent = "Já existe uma conta com esse e-mail.";
      return;
    }

    var novoUsuario = {};
    novoUsuario.name = name;
    novoUsuario.email = email;
    novoUsuario.password = password;

    users.push(novoUsuario);
    saveUsers(users);
    localStorage.setItem("todolist_session", email);
    entrarNoApp(name, email);
  } else {
    var user = achaUsuarioPorEmail(users, email);

    if (user == null || user.password != password) {
      authError.textContent = "E-mail ou senha incorretos.";
      return;
    }

    localStorage.setItem("todolist_session", email);
    entrarNoApp(user.name, email);
  }
}

authForm.addEventListener("submit", enviarFormulario);

function entrarNoApp(name, email) {
  authScreen.style.display = "none";
  appScreen.style.display = "flex";
  appScreen.style.flexDirection = "column";
  appScreen.style.alignItems = "center";

  if (name) {
    userNameEl.textContent = name;
  } else {
    userNameEl.textContent = email;
  }

  mostrarTarefas(email);
}

function sair() {
  localStorage.removeItem("todolist_session");
  appScreen.style.display = "none";
  authScreen.style.display = "flex";
  isRegisterMode = false;
  authForm.reset();
}

logoutBtn.addEventListener("click", sair);

function formatarData(d) {
  var data = new Date(d);
  var dia = data.getDate();
  var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var mes = meses[data.getMonth()];
  var ano = data.getFullYear();
  return dia + " de " + mes + " de " + ano;
}

function mostrarTarefas(email) {
  var tasks = getTasks(email);
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

  var email = localStorage.getItem("todolist_session");
  var tasks = getTasks(email);

  var novaTarefa = {};
  novaTarefa.id = Date.now().toString();
  novaTarefa.name = name;
  novaTarefa.done = false;
  novaTarefa.createdAt = new Date().toISOString();
  novaTarefa.completedAt = null;

  tasks.unshift(novaTarefa);

  saveTasks(email, tasks);
  taskInput.value = "";
  mostrarTarefas(email);
}

addBtn.addEventListener("click", adicionarTarefa);

taskInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    adicionarTarefa();
  }
});

taskList.addEventListener("change", function (e) {
  if (e.target.type == "checkbox") {
    var email = localStorage.getItem("todolist_session");
    var tasks = getTasks(email);
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

    saveTasks(email, tasks);
    mostrarTarefas(email);
  }
});

taskList.addEventListener("click", function (e) {
  if (e.target.className == "delete-btn") {
    var email = localStorage.getItem("todolist_session");
    var tasks = getTasks(email);
    var id = e.target.dataset.id;
    var novaLista = [];

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id != id) {
        novaLista.push(tasks[i]);
      }
    }

    saveTasks(email, novaLista);
    mostrarTarefas(email);
  }
});

window.addEventListener("DOMContentLoaded", function () {
  var email = localStorage.getItem("todolist_session");
  if (email) {
    var users = getUsers();
    var user = achaUsuarioPorEmail(users, email);
    if (user) {
      entrarNoApp(user.name, email);
    } else {
      entrarNoApp(email, email);
    }
  }
});
