# Інструкція з налаштування GitHub MCP Server для Claude Code

## Передумови
- Node.js та npm встановлені
- Claude Code CLI встановлений
- GitHub Personal Access Token

## Крок 1: Створення GitHub Personal Access Token

1. Відкрийте https://github.com/settings/tokens
2. Натисніть "Generate new token" → "Generate new token (classic)"
3. Назва токена: `Claude MCP`
4. Виберіть права доступу:
   - ✅ `repo` (повний доступ до приватних репозиторіїв)
   - ✅ `read:org` (читання організацій)
   - ✅ `read:user` (читання профілю)
5. Натисніть "Generate token"
6. **ВАЖЛИВО:** Скопіюйте токен одразу (він більше не показуватиметься)

## Крок 2: Встановлення GitHub MCP Server

### Для Linux/WSL:

```bash
# Налаштування npm для глобальних пакетів у домашній директорії
npm config set prefix ~/.npm-global
echo 'export PATH=$PATH:~/.npm-global/bin' >> ~/.bashrc
source ~/.bashrc

# Встановлення GitHub MCP server
npm install -g @modelcontextprotocol/server-github
```

### Для Windows (нативно):

```bash
# Встановлення в глобальну Windows npm директорію
npm install -g @modelcontextprotocol/server-github
```

## Крок 3: Налаштування для Claude Code CLI

### Варіант А: Через команду CLI (рекомендовано)

```bash
# Перейдіть в робочу директорію проєкту
cd /path/to/your/project

# Видаліть попередню конфігурацію (якщо є)
claude mcp remove github 2>/dev/null

# Додайте GitHub MCP з токеном
GITHUB_PERSONAL_ACCESS_TOKEN="ваш_токен_тут" claude mcp add github node ~/.npm-global/lib/node_modules/@modelcontextprotocol/server-github/dist/index.js
```

### Варіант Б: Через конфігураційний файл

Створіть файл `.mcp.json` в кореневій директорії проєкту:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["/home/ваше_імя/.npm-global/lib/node_modules/@modelcontextprotocol/server-github/dist/index.js"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ваш_токен_тут"
      }
    }
  }
}
```

## Крок 4: Налаштування для Claude Desktop (Windows)

Створіть або відредагуйте файл:
`C:\Users\ВашеІм'я\AppData\Roaming\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": [
        "C:\\Users\\ВашеІм'я\\AppData\\Roaming\\npm\\lib\\node_modules\\@modelcontextprotocol\\server-github\\dist\\index.js"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ваш_токен_тут"
      }
    }
  }
}
```

## Крок 5: Перевірка роботи

### Для Claude Code CLI:

```bash
# Перезапустіть Claude Code
exit
claude

# Перевірте список MCP серверів
claude mcp list

# У Claude Code перевірте через команду
/mcp
```

### Для Claude Desktop:

1. Повністю закрийте Claude Desktop
2. Запустіть знову
3. Відкрийте налаштування → Developer → перевірте статус MCP серверів

## Усунення проблем

### Проблема 1: "Server github not found"

**Рішення:**
```bash
# Перевірте, чи встановлений пакет
ls ~/.npm-global/lib/node_modules/@modelcontextprotocol/server-github

# Якщо немає, перевстановіть
npm uninstall -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-github
```

### Проблема 2: Помилки з правами доступу при встановленні

**Рішення для Linux/WSL:**
```bash
# НЕ використовуйте sudo! Налаштуйте npm для користувача:
mkdir ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=$PATH:~/.npm-global/bin' >> ~/.bashrc
source ~/.bashrc
```

### Проблема 3: MCP server не з'являється після налаштування

**Рішення:**
1. Переконайтеся, що ви в правильній директорії проєкту
2. Перевірте шлях до index.js:
   ```bash
   # Linux/WSL
   ls -la ~/.npm-global/lib/node_modules/@modelcontextprotocol/server-github/dist/index.js
   
   # Windows
   dir C:\Users\ВашеІм'я\AppData\Roaming\npm\lib\node_modules\@modelcontextprotocol\server-github\dist\index.js
   ```
3. Перезапустіть Claude Code/Desktop повністю

### Проблема 4: Токен не працює

**Перевірте:**
- Термін дії токена не закінчився
- Токен має правильні права (repo, read:org, read:user)
- Правильна назва змінної: `GITHUB_PERSONAL_ACCESS_TOKEN`

## Швидке налаштування (все в одній команді)

### Для Linux/WSL:
```bash
# Встановлення та налаштування одразу
npm config set prefix ~/.npm-global && \
echo 'export PATH=$PATH:~/.npm-global/bin' >> ~/.bashrc && \
source ~/.bashrc && \
npm install -g @modelcontextprotocol/server-github && \
echo "Введіть ваш GitHub token:" && \
read -s GITHUB_TOKEN && \
GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" claude mcp add github node ~/.npm-global/lib/node_modules/@modelcontextprotocol/server-github/dist/index.js
```

## Корисні команди

```bash
# Перевірити статус MCP серверів
claude mcp list

# Видалити MCP сервер
claude mcp remove github

# Переглянути конфігурацію
cat .mcp.json

# Перевірити логи (якщо є помилки)
ls -la mcp-server-*.log
```

## Примітки

- GitHub token зберігається локально в конфігураційних файлах
- Не коммітьте `.mcp.json` з токеном в Git
- Додайте `.mcp.json` до `.gitignore`
- Для різних проєктів можна використовувати різні токени