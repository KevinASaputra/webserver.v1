
CREATE DATABASE TodoListApp; --Membuat Database

USE TodoListApp; -- Open Database habis di buat

CREATE TABLE Accounts (
    id INT PRIMARY KEY IDENTITY,
    email VARCHAR(255) NOT NULL,
    nama VARCHAR(100) NOT NULL,
    nim VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create Table