<?php
header("Content-Type: application/json");
include 'db.php';

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}
function validateNIM($nim) {
    return ctype_digit($nim);
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

$action = $_GET['action'] ?? '';

if ($action == 'create') {
    // Mendekode JSON input dari JavaScript
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validasi dan sanitasi input
    $email = validateEmail($data['email']) ? $data['email'] : null;
    $nama = sanitizeInput($data['nama']);
    $nim = validateNIM($data['nim']) ? $data['nim'] : null;
    $password = $data['password'];

    if (!$email || !$nama || !$nim || !$password) {
        echo json_encode(["status" => "error", "message" => "Input tidak valid. NIM harus berupa angka saja."]);
        exit();
    }

    // Hash password dengan algoritma yang aman
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Cek apakah ada data dengan email atau nim yang sama
    $checkStmt = $conn->prepare("SELECT * FROM Accounts WHERE email = ? OR nim = ?");
    $checkStmt->bind_param("ss", $email, $nim);
    $checkStmt->execute();
    $result = $checkStmt->get_result();

    if ($result->num_rows > 0) {
        // Jika ada email atau nim yang sama, kembalikan pesan error
        echo json_encode(["status" => "error", "message" => "Email atau NIM sudah ada, silakan gunakan data yang berbeda."]);
    } else {
        // Jika data belum ada, lakukan insert
        $stmt = $conn->prepare("INSERT INTO Accounts (email, nama, nim, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $email, $nama, $nim, $hashedPassword);
        $stmt->execute();
        echo json_encode(["status" => "success", "message" => "Account created"]);
    }
}

if ($action == 'read') {
    $result = $conn->query("SELECT id, email, nama, nim FROM Accounts");
    $accounts = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($accounts);
}

if ($action == 'readOne') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("SELECT id, email, nama, nim FROM Accounts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_assoc());
}

if ($action == 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id']);
    $email = validateEmail($data['email']) ? $data['email'] : null;
    $nama = sanitizeInput($data['nama']);
    $nim = validateNIM($data['nim']) ? $data['nim'] : null;
    $password = $data['password'];

    if (!$email || !$nama || !$nim || !$password) {
        echo json_encode(["status" => "error", "message" => "Input tidak valid. NIM harus berupa angka saja."]);
        exit();
    }

    // Ambil data akun berdasarkan ID
    $stmt = $conn->prepare("SELECT * FROM Accounts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $account = $result->fetch_assoc();

    // Validasi password lama
    if (!password_verify($password, $account['password'])) {
        echo json_encode(["status" => "error", "message" => "Password salah. Tidak dapat menyimpan perubahan."]);
        exit();
    }

    // Jika password benar, lanjutkan dengan update data
    $updateStmt = $conn->prepare("UPDATE Accounts SET email = ?, nama = ?, nim = ? WHERE id = ?");
    $updateStmt->bind_param("sssi", $email, $nama, $nim, $id);
    $updateStmt->execute();
    
    echo json_encode(["status" => "success", "message" => "Data berhasil diubah."]);
}

if ($action == 'delete') {
    $id = intval($_GET['id']);
    $stmt = $conn->prepare("DELETE FROM Accounts WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    echo json_encode(["status" => "success", "message" => "Account deleted"]);
}

$conn->close();
?>
