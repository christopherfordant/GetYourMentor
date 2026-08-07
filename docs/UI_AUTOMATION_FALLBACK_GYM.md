# UI Automation Fallback GYM

## Objectif

Mettre en place un **secours local** pour les confirmations UI non sensibles :

- tentative prioritaire via `Power Automate Desktop` si vous creez un flux
- secours local via `AutoHotkey` si PAD n'est pas disponible ou ne capte pas la fenetre

## Limite de securite

Ce mecanisme ne doit **pas** etre utilise pour :

- les boites UAC
- les elevations administrateur
- les fenetres Windows Security
- les demandes de consentement systeme sensibles

Dans ces cas-la, la validation doit rester humaine.

## Etat actuel

- `AutoHotkey` est installe
- `Power Automate Desktop` est installe
- un fallback local est disponible dans `scripts/ui_accept_fallback.ahk`

## Utilisation AutoHotkey

1. Lancer :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_ui_accept_fallback.ps1
```

2. Mettre la fenetre cible au premier plan.
3. Appuyer sur `F9`.
4. Le script tente de cliquer dans la zone d'action en bas a droite si un libelle compatible est detecte :
   - `Accepter`
   - `Accept`
   - `OK`
   - `Oui`

5. `Esc` ferme le script.

## Mode focus sans clic

Pour le besoin de prompts applicatifs type VS Code / Codex, un helper se contente de :

- detecter une fenetre compatible
- la remettre au premier plan
- deplacer la souris vers l'action probable
- ne jamais cliquer

Lancement :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_focus_authorization_prompt.ps1
```

Raccourcis :

- `F8` : pause / reprise
- `F9` : forcer un scan immediat
- `Esc` : fermer le helper

Important :

- ce helper est reserve a des prompts applicatifs non sensibles
- il ne doit pas servir pour UAC, elevation admin ou securite Windows

## Helper "continue"

Pour eviter les temps morts quand tu veux simplement repondre `continue` dans une zone de texte active :

Lancement :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_type_continue_helper.ps1
```

Raccourcis :

- `F6` : ecrit `continue`
- `F7` : ecrit `continue` puis appuie sur `Entree`
- `Ctrl + Alt + C` : vise la zone de chat active, ecrit `continue`, puis envoie
- `F12` : raccourci de secours si `Ctrl + Alt + C` est absorbe par VS Code ou Windows
- `F10` ou `Pause` : debug rapide de la fenetre active
- `Esc` : ferme le helper

Usage recommande :

- `F6` si tu veux relire avant d'envoyer
- `F7` si tu veux envoyer directement
- `Ctrl + Alt + C` si tu veux viser directement le composeur du chat dans le navigateur ou VS Code
- `F12` si le raccourci principal ne remonte pas jusqu'au helper

## Mode debug visible

Si les raccourcis ne reagissent pas dans VS Code, utiliser le helper de debug visible :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_type_continue_debug.ps1
```

Raccourcis :

- `Ctrl + Shift + 9` : affiche une boite visible de confirmation
- `Ctrl + Shift + 0` : ecrit `continue`
- `Ctrl + Alt + 0` : ecrit `continue` puis envoie

## Panneau cliquable

Si les raccourcis clavier ne fonctionnent pas correctement sur le poste, utiliser le panneau cliquable :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_type_continue_panel.ps1
```

Boutons disponibles :

- `Test`
- `Continue`
- `Continue + Envoi`
- `Quitter`

Cette methode evite totalement les problemes de raccourcis globaux ou de touches `Fn`.

## Panneau WinForms

Si le panneau AutoHotkey reste inaudible ou invisible alors que le script se lance, utiliser la version Windows native :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_type_continue_panel_winforms.ps1
```

Boutons disponibles :

- `Test`
- `Continue`
- `Continue + Envoi`
- `Quitter`

Cette version repose sur `System.Windows.Forms`, souvent plus fiable pour afficher un panneau visible sur Windows.

## Fallback presse-papiers

Si les raccourcis complexes et les panneaux visibles ne sont pas fiables sur le poste, utiliser le helper base sur le presse-papiers :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_clipboard_continue.ps1
```

Raccourcis :

- `F6` : copie `continue` dans le presse-papiers
- `F7` : colle `continue` dans le champ actif
- `F8` : colle `continue` puis appuie sur `Entree`

Cette methode est la plus simple pour un poste qui bloque :

- les panneaux visibles
- certains raccourcis globaux
- certaines fenetres AutoHotkey

## Strategie recommandee

1. Essayer `Power Automate Desktop` sur une vraie fenetre d'application non sensible.
2. Si PAD ne reconnait pas l'element, utiliser le fallback AutoHotkey.
3. Garder cette automatisation reservee aux confirmations repetitives non critiques.

## Lanceur unique

Un lanceur est prevu pour le duo :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_ui_accept_stack.ps1
```

Comportement :

- si `Power Automate Desktop` est present, le lanceur ouvre PAD
- si tu veux forcer le secours, utilise :

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start_ui_accept_stack.ps1 -ForceFallback
```

- dans ce cas, le script AutoHotkey est lance directement

## Suite possible

Si besoin, on pourra ajouter :

- une liste blanche de fenetres autorisees
- une detection par titre exact de la fenetre
- un mode journalisation des clics
- un lanceur unique `PAD -> AHK fallback`
