function selectFromList(list, idx) {
  list.forEach((elem) => elem.classList.remove("selected"));
  list[idx].classList.add("selected");
}

function initCareers() {
  const careerList = document.querySelectorAll("#career_list > li");
  const careerDetailList = document.querySelectorAll(
    "#career_detail_list > main"
  );
  careerList.forEach((item, idx) => {
    item.addEventListener("click", () => {
      selectFromList(careerList, idx);
      selectFromList(careerDetailList, idx);
    });
  });
}

function initProjects() {
  const projectList = document.querySelectorAll("#project_list > li");
  const projectThumbnailList = document.querySelectorAll(
    "#project_thumbnail_list > div"
  );
  const projectDetailList = document.querySelectorAll(
    "#project_detail_list > article"
  );
  projectList.forEach((item, idx) => {
    item.addEventListener("click", () => {
      selectFromList(projectList, idx);
      selectFromList(projectThumbnailList, idx);
      selectFromList(projectDetailList, idx);
    });
  });
}

function prefillEditForm(id) {
  const editForm = document.querySelector("#contacts_edit_form");
  const name = document.querySelector(`#post_${id}_name`).textContent;
  const title = document.querySelector(`#post_${id}_title`).textContent;
  const content = document.querySelector(`#post_${id}_content`).textContent;
  editForm.querySelector("#name_edit").value = name;
  editForm.querySelector("#title_edit").value = title;
  editForm.querySelector("#content_edit").value = content;
}

function initContacts() {
  const contactsForm = document.querySelector("#contacts_form");
  contactsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = contactsForm.querySelector("input#name").value;
    const password = contactsForm.querySelector("input#password").value;
    const title = contactsForm.querySelector("input#title").value;
    const content = contactsForm.querySelector("textarea#content").value;
    createPost(name, password, title, content);
  });

  const editBtns = document.querySelectorAll("button.btn-edit[type='button']");
  const deleteBtns = document.querySelectorAll(
    "button.btn-delete[type='button']"
  );
  const editDialog = document.querySelector("dialog#edit");
  const deleteDialog = document.querySelector("dialog#delete");
  const editCloseBtn = document.querySelector("#close_edit");
  const deleteCloseBtn = document.querySelector("#close_delete");
  const editForm = document.querySelector("#contacts_edit_form");
  const deleteForm = document.querySelector("#contacts_delete_form");
  editBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      operationTarget = btn.getAttribute("key");
      resetDialogAlert("alert_edit");
      prefillEditForm(operationTarget);
      editDialog.open = true;
      deleteDialog.open = false;
    });
  });
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      operationTarget = btn.getAttribute("key");
      resetDialogAlert("alert_delete");
      deleteDialog.open = true;
      editDialog.open = false;
    });
  });

  editCloseBtn.addEventListener("click", () => {
    editDialog.open = false;
  });

  deleteCloseBtn.addEventListener("click", () => {
    deleteDialog.open = false;
  });

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = operationTarget;
    const name = editForm.querySelector("input#name_edit").value;
    const password = editForm.querySelector("input#password_edit").value;
    const title = editForm.querySelector("input#title_edit").value;
    const content = editForm.querySelector("textarea#content_edit").value;
    editPost(id, name, password, title, content);
  });

  deleteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = operationTarget;
    const name = document.querySelector(`#post_${id}_name`).textContent;
    const password = deleteForm.querySelector("input#password_delete").value;
    deletePost(id, name, password);
  });
}

function resetDialogAlert(id) {
  const elem = document.querySelector(`#${id}`);
  elem.textContent = "";
}

function setAlert(id, message) {
  const elem = document.querySelector(`#${id}`);
  elem.textContent = message;
}

function toBinary(string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

function createPost(name, password, title, content) {
  if (name.length < 1 || password.length < 1) {
    setAlert("alert_post", "이름과 비밀번호를 한 자 이상 입력하세요.");
    return;
  }
  fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      password,
      title,
      content,
    }),
  })
    .then(() => setTimeout(() => window.location.reload(), 1000))
    .catch((err) => {
      console.error(err);
    });
}

function editPost(id, name, password, title, content) {
  const auth = toBinary(`${name}:${password}`);
  fetch(`/api/posts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      name,
      title,
      content,
    }),
  })
    .then((res) => {
      if (res.status === 200) {
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setAlert("alert_edit", "비밀번호가 잘못되었습니다.");
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

function deletePost(id, name, password) {
  const auth = toBinary(`${name}:${password}`);
  fetch(`/api/posts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
    .then((res) => {
      if (res.status === 200) {
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setAlert("alert_delete", "비밀번호가 잘못되었습니다.");
      }
    })
    .catch((err) => {
      console.error(err);
    });
}

let operationTarget = undefined;

window.addEventListener("DOMContentLoaded", () => {
  initCareers();
  initProjects();
  initContacts();
});
