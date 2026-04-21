#!/bin/bash
# Chess Prep – GitHub Pages Setup
# Dieses Skript einmal im Terminal ausführen.
# Vorher: Repo auf github.com erstellt haben (Name: chess-prep)

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Chess Prep → GitHub Pages Setup   ║"
echo "╚══════════════════════════════════════╝"
echo ""

# GitHub Benutzername abfragen
read -p "👤 Dein GitHub-Benutzername: " GHUSER
echo ""

# In das Projektverzeichnis wechseln
# (Skript liegt bereits drin, also aktueller Ordner)
cd "$(dirname "$0")"

echo "📁 Projektordner: $(pwd)"
echo ""

# Git initialisieren falls noch nicht vorhanden
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Git-Identität setzen
git config user.name "$GHUSER"
git config user.email "$GHUSER@users.noreply.github.com"

# Dateien stagen und committen
git add index.html chess-umd.js
git commit -m "Chess Prep London System Trainer" 2>/dev/null || \
git commit --allow-empty -m "Chess Prep London System Trainer"

# Remote setzen
REMOTE="https://github.com/$GHUSER/chess-prep.git"
git remote remove origin 2>/dev/null
git remote add origin "$REMOTE"

echo "🚀 Push zu GitHub..."
echo "   (Bitte GitHub-Passwort oder Token eingeben wenn gefragt)"
echo ""
git push -u origin main

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Erfolgreich hochgeladen!"
    echo ""
    echo "🌐 Deine App-URL (in ~2 Min aktiv):"
    echo "   https://$GHUSER.github.io/chess-prep/"
    echo ""
    echo "⚙️  Noch ein Schritt: GitHub Pages aktivieren"
    echo "   → github.com/$GHUSER/chess-prep/settings/pages"
    echo "   → Branch: main  |  Folder: / (root)  →  Save"
    echo ""
else
    echo "❌ Push fehlgeschlagen. Bitte Token prüfen."
    echo "   Token erstellen: https://github.com/settings/tokens/new"
    echo "   Scope: 'repo' anhaken → Token als Passwort verwenden"
fi
