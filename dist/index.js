import { promises as fs } from 'fs';
import * as path from 'path';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
const ALGORITHM = 'aes-256-cbc';
// Fungsi untuk membuat salt dari password
function getSalt(password) {
    return new Promise((resolve, reject) => {
        scrypt(password, 'salt', 32, (err, key) => {
            if (err)
                reject(err);
            resolve(key);
        });
    });
}
// Fungsi untuk enkripsi file
async function encryptFile(filePath, password) {
    const salt = await getSalt(password);
    const iv = randomBytes(16); // Inisialisasi vector
    const cipher = createCipheriv(ALGORITHM, salt, iv);
    const input = await fs.readFile(filePath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const encryptedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}_encrypted${path.extname(filePath)}`);
    await fs.writeFile(encryptedFilePath, Buffer.concat([iv, encrypted])); // Simpan iv bersama data terenkripsi
    console.log(`File '${filePath}' berhasil dienkripsi menjadi '${encryptedFilePath}'`);
}
// Fungsi untuk dekripsi file
async function decryptFile(filePath, password) {
    const data = await fs.readFile(filePath);
    const iv = data.slice(0, 16); // Ambil iv dari data
    const encryptedText = data.slice(16);
    const salt = await getSalt(password);
    const decipher = createDecipheriv(ALGORITHM, salt, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    const decryptedFilePath = path.join(path.dirname(filePath), `${path.basename(filePath, path.extname(filePath))}_decrypted${path.extname(filePath)}`);
    await fs.writeFile(decryptedFilePath, decrypted);
    console.log(`File '${filePath}' berhasil didekripsi menjadi '${decryptedFilePath}'`);
}
// Fungsi utama
async function main() {
    const [command, filePath, password] = process.argv.slice(2);
    try {
        if (command === 'encrypt') {
            await encryptFile(filePath, password);
        }
        else if (command === 'decrypt') {
            await decryptFile(filePath, password);
        }
        else {
            console.error('Perintah tidak dikenal. Gunakan "encrypt" atau "decrypt".');
        }
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
    }
}
main();
