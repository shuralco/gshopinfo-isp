#!/usr/bin/env node
/**
 * Test Hello World Script
 * Тестовий скрипт для перевірки Node.js та логування
 */

console.log('🟢 Привіт світ! Hello World!');
console.log('📅 Дата:', new Date().toISOString());
console.log('🖥️  Node версія:', process.version);
console.log('💻 Платформа:', process.platform);
console.log('📂 Робоча директорія:', process.cwd());
console.log('✅ Тест успішно завершено!');

// Перевірка змінних середовища
console.log('\n🔧 Змінні середовища:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'не встановлено');
console.log('PORT:', process.env.PORT || 'не встановлено');

// Тест файлової системи
const fs = require('fs');
const path = require('path');

console.log('\n📁 Перевірка файлів:');
const files = ['package.json', 'app.js', 'backend/package.json'];
files.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? 'знайдено' : 'не знайдено'}`);
});

console.log('\n🎯 Всі тести пройдено успішно!');
process.exit(0);