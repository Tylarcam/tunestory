# Virtual Environment Setup

This project uses a Python virtual environment to isolate dependencies and avoid conflicts.

## 🚀 Quick Setup

### Windows (PowerShell)
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (only Modal is needed for deployment)
pip install -r requirements.txt
# OR install Modal directly:
# pip install modal
```

### Windows (Command Prompt)
```cmd
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Install Modal CLI
pip install modal
```

### macOS/Linux
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Modal CLI
pip install modal
```

## ✅ Verify Installation

After activating the virtual environment, you should see `(venv)` in your terminal prompt:

```bash
(venv) C:\Users\tylar\code\tunestory-vibes>
```

Verify Modal is installed:
```bash
modal --version
```

## 📦 Installing Modal

If Modal isn't in requirements.txt yet:
```bash
# Make sure venv is activated
pip install modal

# Authenticate (will open browser)
modal token new
```

## 🔄 Deactivating

To exit the virtual environment:
```bash
deactivate
```

## 📝 Notes

- **Always activate the venv** before running Modal commands
- The `venv/` folder is gitignored (not committed to git)
- Each developer needs to create their own venv
- Modal token is stored in `~/.modal/token.json` (not in venv)

## 🐛 Troubleshooting

### "modal: command not found"
- Make sure the virtual environment is activated
- Verify Modal is installed: `pip list | grep modal`
- Reinstall if needed: `pip install modal`

### Permission errors on Windows
If you get an execution policy error when activating:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Virtual environment not found
If the venv folder was deleted, recreate it:
```bash
python -m venv venv
```

