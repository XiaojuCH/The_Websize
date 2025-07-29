 <?php
// session_start();
// require 'config.php';  // 包含 $pdo = new PDO(...);

// if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//     $u = trim($_POST['username']);
//     $p = $_POST['password'];

//     $stmt = $pdo->prepare("SELECT id, password, role FROM users WHERE username = ?");
//     $stmt->execute([$u]);
//     $user = $stmt->fetch(PDO::FETCH_ASSOC);

//     if ($user && password_verify($p, $user['password'])) {
//         // 登录成功
//         $_SESSION['user_id'] = $user['id'];
//         $_SESSION['username'] = $u;
//         $_SESSION['role'] = $user['role'];
//         header('Location: dashboard.php');
//         exit;
//     } else {
//         echo '<p style="color:red;">用户名或密码错误</p>';
//     }
// }
?> 
