const API_BASE = "/api";

function updateStatus() {
  const token = localStorage.getItem("token");
  document.getElementById("status").innerText = token ? "已登录" : "未登录";
}

function logout() {
  localStorage.removeItem("token");
  alert("已注销");
  document.getElementById("output").innerText = "";
  updateStatus();
}

updateStatus();

document.getElementById("registerBtn").addEventListener("click", register);
document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("profileBtn").addEventListener("click", getProfile);
document.getElementById("logoutBtn").addEventListener("click", logout);

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) { alert("用户名和密码不能为空！"); return; }

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) { alert("用户名和密码不能为空！"); return; }

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();

  if (data.token) localStorage.setItem("token", data.token);
  updateStatus();
  document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}

async function getProfile() {
  const token = localStorage.getItem("token");
  if (!token) { alert("请先登录！"); return; }

  const res = await fetch(`${API_BASE}/profile`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}
