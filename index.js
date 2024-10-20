var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
const action = process.argv[2];
const filePath = process.argv[3];
const password = process.argv[4];
const logPath = './logs/encrypt.log'; // Lokasi file log
// Membuat folder logs jika belum ada
function ensureLogDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.mkdir(path.dirname(logPath), { recursive: true });
        }
        catch (error) {
            console.error('Error saat membuat folder logs:', error);
        }
    });
}
function logMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const logEntry = `${new Date().toISOString()} - ${message}\n`;
        yield fs.appendFile(logPath, logEntry);
    });
}
function encryptFile(filePath, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile(filePath, 'utf8');
            const iv = crypto.randomBytes(16); // Membuat IV baru
            const key = crypto.scryptSync(password, 'salt', 32); // Membuat key dari password
            const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
            const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]); // Menyimpan IV bersama data terenkripsi
            yield fs.writeFile(`${filePath}.enc`, encrypted);
            console.log(`File ${filePath} berhasil dienkripsi.`);
            // Log hasil enkripsi
            yield logMessage(`File ${filePath} berhasil dienkripsi.`);
        }
        catch (error) {
            console.error('Error saat enkripsi file:', error);
            yield logMessage(`Error saat enkripsi file: ${error.message}`);
        }
    });
}
function decryptFile(filePath, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs.readFile(filePath);
            const iv = data.slice(0, 16); // Mengambil IV dari data terenkripsi
            const key = crypto.scryptSync(password, 'salt', 32); // Membuat key dari password
            const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
            const decrypted = Buffer.concat([decipher.update(data.slice(16)), decipher.final()]); // Dekripsi data tanpa IV
            yield fs.writeFile(filePath.replace('.enc', ''), decrypted);
            console.log(`File ${filePath} berhasil didekripsi.`);
            // Log hasil dekripsi
            yield logMessage(`File ${filePath} berhasil didekripsi.`);
        }
        catch (error) {
            console.error('Error saat dekripsi file:', error);
            yield logMessage(`Error saat dekripsi file: ${error.message}`);
        }
    });
}
// Memastikan folder logs ada
ensureLogDirectory().then(() => {
    if (action === 'encrypt') {
        encryptFile(filePath, password);
    }
    else if (action === 'decrypt') {
        decryptFile(filePath, password);
    }
    else {
        console.log('Action tidak valid. Gunakan "encrypt" atau "decrypt".');
    }
});
