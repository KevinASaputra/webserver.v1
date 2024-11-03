document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("toggle-password");
  const eyeOpenIcon = document.getElementById("eye-open");
  const eyeClosedIcon = document.getElementById("eye-closed");

  togglePassword.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeOpenIcon.classList.add("hidden");
      eyeClosedIcon.classList.remove("hidden");
    } else {
      passwordInput.type = "password";
      eyeOpenIcon.classList.remove("hidden");
      eyeClosedIcon.classList.add("hidden");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const accountForm = document.getElementById("account-form");

  accountForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("account-id").value;
    if (id) {
      updateAccount(id);
    } else {
      createAccount();
    }
  });

  fetchAccounts();
});

async function fetchAccounts() {
  try {
    const response = await fetch("server.php?action=read");
    const accounts = await response.json();
    console.log(accounts); // Debug response
    const accountList = document.getElementById("account-list");
    accountList.innerHTML = "";
    accounts.forEach((account) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border-b">${account.id}</td>
        <td class="py-2 px-4 border-b">${account.email}</td>
        <td class="py-2 px-4 border-b">${account.nama}</td>
        <td class="py-2 px-4 border-b">${account.nim}</td>
        <td class="py-2 px-4 border-b">
          <button onclick="editAccount(${account.id})" class="text-blue-500">Edit</button> |
          <button onclick="deleteAccount(${account.id})" class="text-red-500">Delete</button>
        </td>
      `;
      accountList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
  }
}

function sanitizeInput(input) {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function createAccount() {
  const email = sanitizeInput(document.getElementById("email").value);
  const nama = sanitizeInput(document.getElementById("nama").value);
  const nim = sanitizeInput(document.getElementById("nim").value);
  const password = sanitizeInput(document.getElementById("password").value);

  if (!email || !nama || !nim || !password) {
    alert("Input tidak valid.");
    return;
  }

  try {
    const response = await fetch("server.php?action=create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nama, nim, password }),
    });

    const result = await response.json();
    if (result.status === "error") {
      alert(result.message);
    } else {
      alert(result.message);
      document.getElementById("account-form").reset();
      fetchAccounts();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function editAccount(id) {
  const response = await fetch(`server.php?action=readOne&id=${id}`);
  const account = await response.json();
  document.getElementById("account-id").value = account.id;
  document.getElementById("email").value = account.email;
  document.getElementById("nama").value = account.nama;
  document.getElementById("nim").value = account.nim;
  document.getElementById("password").value = ""; // Password tetap kosong saat edit
}

async function updateAccount(id) {
  const email = document.getElementById("email").value;
  const nama = document.getElementById("nama").value;
  const nim = document.getElementById("nim").value;
  const password = document.getElementById("password").value;

  if (!password) {
    alert("Password diperlukan untuk menyimpan perubahan.");
    return;
  }

  try {
    const response = await fetch("server.php?action=update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email, nama, nim, password }),
    });

    const result = await response.json();
    if (result.status === "error") {
      alert(result.message);
    } else {
      alert(result.message);
      document.getElementById("account-form").reset();
      fetchAccounts();
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function deleteAccount(id) {
  await fetch(`server.php?action=delete&id=${id}`);
  fetchAccounts();
}

// tampilan buat input ( Index.html)
// => script.js(encode dulu dan mengirim data dari tampilan HTML ke Database lewat perantara server.php)
// => server.php(decode dulu dari script.js(json))
// => db.php(funsi dari DB.php(connect ke dalam database))
// create database.sql
