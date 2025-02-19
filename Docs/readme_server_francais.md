**Guide d'exécution et d'utilisation du serveur Python local avec une icône de barre d'état système**

---

### Présentation

Ce guide explique comment utiliser un serveur HTTP local basé sur Python avec une icône de barre d'état système. Le serveur sert les fichiers du même répertoire que celui où réside le script. Il comprend une icône de barre d'état système pour un contrôle facile et lance un navigateur pour accéder au serveur.

---

### Fonctionnalités

- Sert les fichiers (par exemple, `index.html`) du même dossier que le script.
- Comprend une icône de barre d'état système avec des options pour :
- Ouvrir le serveur dans un navigateur.
- Arrêter le serveur.
- Exécuter un serveur local accessible à `http://localhost:8000`.

---

### Exigences

1. Un système Windows.
2. Python installé (version 3.6 ou plus récente).
3. Bibliothèques Python requises :
- `pystray`
- `Pillow`
4. Le script `launch.pyw`.

Pour installer les bibliothèques requises, exécutez la commande suivante dans un terminal :

```
pip install pystray Pillow
```

---

### Instructions étape par étape

#### 1. Configuration

1. Copiez le script `launch.pyw` fourni dans un dossier.
2. Placez vos fichiers (par exemple, `index.html`, `server_with_tray.py`) dans le même dossier.

#### 2. Démarrez le serveur

1. Double-cliquez sur le fichier `launch.pyw` pour démarrer le serveur.
2. Une icône de la barre d'état système (un carré bleu avec un cercle blanc) apparaît dans la barre des tâches.

#### 3. Ouvrez le serveur dans un navigateur

1. Cliquez avec le bouton droit sur l'icône de la barre d'état système.
2. Sélectionnez **Ouvrir le navigateur**.
3. Le navigateur ouvrira `http://localhost:8000`, affichant votre `index.html`.

#### 4. Arrêtez le serveur

1. Cliquez avec le bouton droit sur l'icône de la barre d'état système.
2. Sélectionnez **Quitter** pour arrêter le serveur et fermer l'application.

---

### Remarques

- **Comportement par défaut** : le serveur sert automatiquement les fichiers du dossier contenant le script `launch.pyw`. Si votre `index.html` ne se charge pas, assurez-vous qu'il se trouve dans le même répertoire que le script.
- **Port** : le serveur fonctionne sur le port `8000`. Si ce port est utilisé, vous devrez le libérer ou utiliser une configuration de serveur différente.
- **Dépannage** :
- Si le navigateur affiche « ERR\_EMPTY\_RESPONSE », vérifiez que le script se trouve dans le bon dossier.
- Assurez-vous que votre pare-feu ne bloque pas les connexions locales.

---

### FAQ

#### Q1 : Comment modifier les fichiers servis ?

A : Remplacez les fichiers (par exemple, `index.html`) dans le dossier contenant le script. Redémarrez le serveur si nécessaire.

#### Q2 : Puis-je l'utiliser sur un autre ordinateur ?

R : Oui, copiez le script « launch.pyw » et vos fichiers sur l'ordinateur cible. Installez Python et les bibliothèques requises, puis suivez les étapes de ce guide.\
\
Important ! Avant de le faire, veuillez exporter le mappage GTINREF afin de pouvoir l'importer sur le nouvel ordinateur. À partir de maintenant, les mappages ne seront plus synchronisés les uns avec les autres.

#### Q3 : Le serveur ne fonctionne pas. Que dois-je faire ?

R :

1. Assurez-vous que le script se trouve dans le même dossier que vos fichiers.
2. Recherchez l'icône du serveur dans la barre d'état système.
3. Vérifiez qu'aucune autre application n'utilise le port « 8000 ».
4. Contactez le service informatique (Gérald Waerseggers) pour obtenir de l'aide.

---

### Exemple de structure de dossier

```
ScannerFolder
├── index.html
├── server_with_tray.py
└── launch.pyw
```

Placez tous vos fichiers de projet à côté du script `launch.pyw`. Lancez ensuite le script pour diffuser votre projet localement.

---

Merci d'utiliser cet outil ! Si vous avez des questions ou si vous avez besoin d'aide supplémentaire, contactez l'équipe informatique.