import css from "./style/main.css"

const apiUrl = `http://localhost:3000/api`;
let todos = [];

const signinSignupPage = document.querySelector('.signinSignup');
const signinButtom = document.querySelector('.signinButtom');
const signupButtom = document.querySelector('.signupButtom');
const signinPage = document.querySelector('.signinForm');
const signupPage = document.querySelector('.signupForm');

const inputRequired  = document.querySelectorAll('.inputRequired');
const signinEmail = document.querySelector('.signinEmail');
const signinPassword = document.querySelector('.signinPassword');

const signupEmail = document.querySelector('.signupEmail');
const signupNickname = document.querySelector('.signupNickname');
const signupPassword = document.querySelector('.signupPassword');
const confirmPassword = document.querySelector('.confirmPassword');

const toSignup = document.querySelector('.toSignup');
const toSignin = document.querySelector('.toSignin');

const TodoListTitle = document.querySelector('.TodoListTitle');
const logoutButton = document.querySelector('.logoutButton');
const todoListPage = document.querySelector('.todoListPage');
const todosNothing = document.querySelector('.todosNothing');
const addTodoButton = document.querySelector('.addTodoButton');
const todoInput = document.querySelector('.todoInput');
const todosCard = document.querySelector('.todosCard');
const todosTab = document.querySelector('.todosTab');
let currentTab = document.querySelector('.currentTab');
const todosList = document.querySelector('.todosList');
const todoContent = document.querySelector('.todoContent');
const itemDone = document.querySelector('.itemDone');
const removeAllDone = document.querySelector('.removeAllDone');



toSignin.addEventListener('click', function(e) {
  addClass(signupPage);
  removeClass(signinPage);
});
toSignup.addEventListener('click', function(e) {
  addClass(signinPage);
  removeClass(signupPage);
});

inputRequired.forEach(element => {
  element.addEventListener('blur',function(e) {
    checkContent(e.target);
  })
})

function checkContent(e) {
  if (e.value.trim() === '') {
    e.parentElement.classList.add('requiredInput');
    return false;
  } else {
    e.parentElement.classList.remove('requiredInput');
    return true;
  }
}

signinButtom?.addEventListener('click', function(e) {
  const email = signinEmail?.children[1].value.trim();
  const password = signinPassword?.children[1].value.trim();
  checkContent(signinEmail?.children[1]);
  checkContent(signinPassword?.children[1]);
  if (email !== '' && password!== '') {
    login(email, password);
  }
})

signupButtom?.addEventListener('click', function(e) {
  const email = signupEmail?.children[1].value.trim();
  const nickname = signupNickname?.children[1].value.trim();
  const password = signupPassword?.children[1].value.trim();
  const password2 = confirmPassword?.children[1].value.trim();
  if(checkContent(signupEmail?.children[1]) && 
  checkContent(signupNickname?.children[1]) && 
  checkContent(signupPassword?.children[1]) && 
  checkContent(confirmPassword?.children[1])){
    if (password2 === password) {
      signUp(email, nickname, password);
    }else{
      Swal.fire({
        icon: 'error',
        title: '密碼輸入不相同，請確認',
      })
    }
  }
})

logoutButton.addEventListener('click', function(e) {
  logout();
  addClass(todoListPage);
  removeClass(signinSignupPage);
})

addTodoButton.addEventListener('click', function(e) {
 let value = todoInput.value.trim();
 if(value) {
  console.log('addvalue',value);
  addTodo(value);
 } else {
  Swal.fire({
    icon: 'error',
    title: '無法新增',
    text: '請輸入待辦事項',
  })
 }
});

todoInput.addEventListener("keydown", function(e) {
  if (e.key === 'Enter') {
    addTodoButton.click();
  }
});


function signUp(email, nickname, password) {
  axios.post(`${apiUrl}/users`,
  {
    "user": {
      "email": email,
      "nickname": nickname,
      "password": password
    }
  }
  )
    .then(res => {
      Swal.fire({
        icon: 'success',
        title: '註冊成功',
        text: '請在登入頁進行登入',
      })
      signupEmail.children[1].value='';
      signupNickname.children[1].value='';
      signupPassword.children[1].value='';
      confirmPassword.children[1].value='';
      addClass(signupPage);
      removeClass(signinPage);
    })
    .catch(error => {
      let errorDetail = '';
      console.log(error);
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `註冊失敗`,
        html:`${errorDetail}`
      })
    })
}

function login(email, password) {
  axios.post(`${apiUrl}/users/sign_in`,{
    "user": {
      "email": email,
      "password": password
    }
  })
    .then(res => {
      Swal.fire({
        icon: 'success',
        title: `${res.data.message}`,
      })
      axios.defaults.headers.common['Authorization'] = res.headers.authorization;
      localStorage.setItem("token",res.headers.authorization);
      localStorage.setItem("nickname",res.data.user.nickname);
      signinEmail.children[1].value='';
      signinPassword.children[1].value='';
      toTodoList();
      getTodos();
    })
    .catch(error => {
      let errorDetail = '';
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `登入失敗`,
        html:`${errorDetail}`
      })
    })
}

function logout() {
  axios.delete(`${apiUrl}/users/sign_out`)
  .then(res => {
    Swal.fire({
      icon: 'success',
      title: '已登出',
    })
    axios.defaults.headers.common['Authorization']  = "";
    localStorage.removeItem("token");
    localStorage.removeItem("nickname");
  })
  .catch(error => {
    console.log(error);
  })
}

function toTodoList() {
  addClass(signinSignupPage);
  removeClass(todoListPage);
  TodoListTitle.textContent=`${localStorage.getItem("nickname")}的代辦事項`;
}

function getTodos() {
  axios.get(`${apiUrl}/todos`)
    .then((res) => {
      todos = res.data
      console.log(todos);
      if (todos.length !== 0) {
        renderTodo(todos);
        getCurrentTab(currentTab.getAttribute('value'))
        countUndo(todos);
        addClass(todosNothing);
        removeClass(todosCard);
      } else {
        addClass(todosCard);
        removeClass(todosNothing);
      }
    })
    .catch(error => {
      let errorDetail = '';
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `失敗`,
        html:`${errorDetail}`
      })
    })
}

function renderTodo(item) {
  let todosElement = '';
  item.forEach((todo) => {
    let isChecked = todo.completed_at === null? '':'checked';
    todosElement += `
        <li>
          <label class="todoContent" data-id="${todo.id}">
            <input type="checkbox" ${isChecked}/> 
            <div value="done">
              ${todo.content}
            </div>
            <input type="text" value="${todo.content}" class="displayNone editTodoInput"/>
            <button type="button" class="lightButton" value="edit">編輯</button>
            <button type="button" class="lightButton" value="remove"">刪除</button>
          </label>
        </li>`;
  })
  todosList.innerHTML = todosElement;
}

function countUndo(item) {
  let todoNum = 0;
  item.forEach((todo) => {
    if (todo.completed_at === null) {
      todoNum += 1;
    } 
  })
  itemDone.textContent = `${todoNum}個待完成項目`;
}

function addTodo(todocontent) {
  console.log('todocontent',todocontent);
  axios.post(`${apiUrl}/todos`,
    {'content': todocontent,}
  )
    .then((res) => {
      todos = res.data;
      todoInput.value = ""
      getTodos();
    })
    .catch(error => {
      let errorDetail = '';
      console.log(error.response.data);
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `失敗`,
        html:`${errorDetail}`
      })
    })
}

function editTodo(todoId, todocontent) {

  axios.put(`${apiUrl}/todos/edit/${todoId}`,{
    'content': todocontent,
  })
    .then((res) => {
      console.log(res)
      getTodos();
      Swal.fire({
        icon: 'success',
        title: '修改成功',
      })
    })
    .catch(error => {
      let errorDetail = '';
      console.log(error.response.data);
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `失敗`,
        html:`${errorDetail}`
      })
    })
}

function deleteTodo(todoId) {
  axios.delete(`${apiUrl}/todos/${todoId}`)
    .then((res) => {
      console.log(res)
      getTodos();
      Swal.fire({
        icon: 'success',
        title: '已刪除',
      })
    })
    .catch(error => {
      let errorDetail = '';
      console.log(error.response.data);
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `失敗`,
        html:`${errorDetail}`
      })
    })
}

function toggleTodo(todoId) {
  axios.put(`${apiUrl}/todos/complete/${todoId}`,{})
    .then((res) => {
      console.log(res);
      getTodos();
    })
    .catch(error => {
      let errorDetail = '';
      console.log(error.response.data);
      error.response.data.errors.forEach((element) => {
        errorDetail += `<li>${element.msg}</li>`
      })
      Swal.fire({
        icon: 'error',
        title: `失敗`,
        html:`${errorDetail}`
      })
    })
}


function addClass(element) {
  element.classList.add("displayNone");
}
function removeClass(element) {
  element.classList.remove("displayNone");
}

removeAllDone.addEventListener('click', function(e) {
  const doneTodos = todos.filter((todo) => todo.completed_at !== null );
  doneTodos.forEach((element) => {
    deleteTodo(element.id);
  })
})

let edit = false;
todosList.addEventListener('click', function(e) {
  const closestElement = e.target.closest('label');
  const targetItem = closestElement.getAttribute('data-id');
  const todo = e.target.parentElement.childNodes[3];
  const editItem = e.target.parentElement.childNodes[5];
  console.log(e.target);
  if(e.target.getAttribute('value') === 'remove') {
    if (edit) {
      getTodos();
      edit = false;
    } else {
      deleteTodo(targetItem);

    }
  }
  else if(e.target.nodeName === 'INPUT' && e.target.getAttribute('type') === 'checkbox') {
    toggleTodo(targetItem);
  }
  else if(e.target.getAttribute('value') === 'edit') {
    if (edit) {
      let value = editItem.value.trim();
      if (value) {
        editTodo(targetItem, editItem.value);
        edit = false;
      } else {
        Swal.fire({
          icon: 'error',
          title: '無法修改',
          text: '請輸入待辦事項',
        })
      }
    } else {
      todo.classList.add('displayNone');
      editItem.classList.remove('displayNone');
      e.target.textContent = '確認';
      e.target.parentElement.childNodes[9].textContent = '取消';
      edit = true;
    }
  } 
})

todosTab.addEventListener('click', function(e) {
  currentTab.classList.remove('currentTab');
  currentTab = e.target;
  currentTab.classList.add('currentTab');
  getCurrentTab(currentTab.getAttribute('value'))
})

function getCurrentTab(tab) {
  if(tab === 'all') {
    renderTodo(todos);
  } else 
  if(tab === 'processing') {
    const processingTodos = todos.filter((todo) => todo.completed_at === null );
    renderTodo(processingTodos);
  } else if(tab === 'done') {
    const doneTodos = todos.filter((todo) => todo.completed_at !== null );
    renderTodo(doneTodos);
  }
}
