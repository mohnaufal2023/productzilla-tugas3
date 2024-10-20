import { promises as fs } from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';

const action = process.argv[2];
const filePath = process.argv[3];
const password = process.argv[4];
const logPath = './logs/encrypt.log';  // Lokasi file log


async function ensureLogDirectory() {
    try {
        await fs.mkdir(path.dirname(logPath), { recursive: true });
    } catch (error) {
        console.error('Error saat membuat folder logs:', error);
    }
}

async function logMessage(message: string) {
    const logEntry = `${new Date().toISOString()} - ${message}\n`;
    await fs.appendFile(logPath, logEntry);
}

async function encryptFile(filePath: string, password: string) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const iv = crypto.randomBytes(16); 
        const key = crypto.scryptSync(password, 'salt', 32); 
        const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
        const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]); 
        
        await fs.writeFile(`${filePath}.enc`, encrypted);
        console.log(`File ${filePath} berhasil dienkripsi.`);
        
        // Log hasil enkripsi
        await logMessage(`File ${filePath} berhasil dienkripsi.`);
    } catch (error) {
        console.error('Error saat enkripsi file:', error);
        await logMessage(`Error saat enkripsi file: ${error.message}`);
    }
}

async function decryptFile(filePath: string, password: string) {
    try {
        const data = await fs.readFile(filePath);
        const iv = data.slice(0, 16); 
        const key = crypto.scryptSync(password, 'salt', 32); 
        const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
        const decrypted = Buffer.concat([decipher.update(data.slice(16)), decipher.final()]); // Dekripsi data tanpa IV

        await fs.writeFile(filePath.replace('.enc', ''), decrypted);
        console.log(`File ${filePath} berhasil didekripsi.`);
        
        // Log hasil dekripsi
        await logMessage(`File ${filePath} berhasil didekripsi.`);
    } catch (error) {
        console.error('Error saat dekripsi file:', error);
        await logMessage(`Error saat dekripsi file: ${error.message}`);
    }
}

// Memastikan folder logs ada
ensureLogDirectory().then(() => {
    if (action === 'encrypt') {
        encryptFile(filePath, password);
    } else if (action === 'decrypt') {
        decryptFile(filePath, password);
    } else {
        console.log('Action tidak valid. Gunakan "encrypt" atau "decrypt".');
    }
});
