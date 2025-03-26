**Guide d'utilisation du site web du lecteur de codes-barres**

---

### Présentation

Le site web du lecteur de codes-barres est un outil puissant pour gérer efficacement les processus de réception et d'inventaire des stocks. Ce guide explique en détail comment configurer et utiliser efficacement le lecteur, notamment les flux de travail de numérisation, la gestion des mappages et l'exportation des données vers Sage X3.

---

### Configuration d'une session de numérisation

Avant de commencer la numérisation, configurez la session comme suit :

1. **Sélectionnez le type de numérisation** : choisissez entre **Réception** et **Inventaire**.
2. **Sélectionnez le site de stockage**.
3. **Choisissez le code de mouvement**.
4. **Saisissez l'emplacement**.
5. **Activer le mode de saisie des références ?** : activez cette option si toutes les références (REF) ne sont pas connues au préalable.
6. **En mode inventaire**, vous devez **sélectionner un fichier d'extraction** depuis Sage X3. Cliquez sur le lien fourni pour télécharger le fichier à l'aide du modèle d'exportation YSTLOTLOC. Assurez-vous que le fichier téléchargé commence par « F17... » avant de le charger dans le scanner.

> **Remarque** : Vous pouvez modifier la configuration de la session à tout moment en cliquant sur **« Modifier la configuration »**. Les modifications s'appliqueront aux produits scannés suivants.

---

### Démarrage du processus de numérisation

1. Cliquez sur **Démarrer la numérisation**.
2. **Préparation de la numérisation** :

- Positionnez le curseur de la souris sur le champ de saisie.
- Utilisez le scanner pour scanner un code-barres.

3. **Gestion des données scannées** :

- Une nouvelle ligne apparaît dans le tableau.
- Si aucune référence n'est associée au GTIN du code-barres, saisissez-la manuellement.
- Si une référence est déjà associée, la colonne RÉF. est automatiquement ignorée et le champ de saisie est réactivé.

4. Poursuivez la numérisation du produit suivant. Si le produit scanné possède une référence et un lot correspondants dans le tableau, sa quantité est automatiquement incrémentée d'une unité.

#### Si le produit n'a pas de code-barres GS1 ou un code-barres segmenté

- Cliquez sur **Saisie manuelle**.
- Un nouvel écran s'affiche pour vous permettre de saisir les informations du produit.
- Cliquez sur **Ajouter** pour confirmer ou sur **Annuler** (ou sur l'icône en forme de croix) pour annuler.

--

### Gestion des articles à quantité nulle dans l'inventaire

Si un produit est manquant en rayon et doit être enregistré avec une quantité nulle :

1. Cliquez sur **« Sélectionner les articles à quantité nulle »**.
2. Utilisez le champ de filtre pour rechercher le produit souhaité.
3. Sélectionnez le produit, qui inclura également toutes les références associées.
4. Cliquez sur **« Ajouter une quantité nulle »**.
5. Les produits sélectionnés apparaîtront désormais dans le tableau avec une quantité nulle.

--

### Modification des informations sur un produit scanné

1. Pour modifier un produit scanné :

- Cliquez sur l'icône en forme de stylo bleu\*\* à la fin de la ligne à modifier.
- Un nouvel écran apparaîtra pour vous permettre de mettre à jour les informations du produit.
- Cliquez sur **Enregistrer les modifications** pour confirmer ou sur **Annuler** (ou sur l'icône en forme de croix) pour annuler les modifications.

2. Pour supprimer une ligne :

- Cliquez sur l'**icône de corbeille rouge** à la fin de la ligne à supprimer.
- Un écran de confirmation apparaîtra.
- Cliquez sur **Supprimer** pour confirmer ou sur **Annuler** pour annuler.

---

### Finalisation de la session de numérisation

1. Vérifiez que toutes les informations du tableau sont complètes et exactes.

2. Cliquez sur **Exporter CSV** :

- Un fichier CSV sera généré et enregistré dans le dossier de téléchargement de votre navigateur.
- Utilisez ce fichier pour mettre à jour Sage X3 avec le modèle **YINV ou YFTISMR**.

3. **Pour les inventaires** :

1. Après avoir téléchargé votre fichier CSV dans Sage, il est **nécessaire** de fermer la session d'inventaire. 2. Accédez à **Stock > Inventaires > Inventaires**.
1. Localisez le document d'inventaire enregistré dans le fichier journal.
1. Cliquez sur **Fermer** pour finaliser l'inventaire.

1. Pour démarrer une nouvelle session :

- Cliquez sur **Effacer tout**.
- Mettez à jour la configuration si nécessaire.

---

### Gestion des correspondances GTIN-REF

Une correspondance entre la référence et le GTIN est automatiquement créée chaque fois que vous scannez un produit et ajoutez une référence. Pour les numérisations ultérieures du même produit, la référence sera automatiquement renseignée après la numérisation.

1. **Accéder aux correspondances** :

- Cliquez sur **Gérer les correspondances** pour ouvrir l'écran correspondant.

2. **Fonctionnalités de l'écran correspondant** :

- Afficher le tableau GTIN-REF.
- Importer des correspondances.
- Exporter des correspondances.
- Ajouter des correspondances manuelles.
- Filtrer les correspondances pour en trouver une plus facilement.
- Modifier ou supprimer des mappages.

#### Exporter des mappages

- Pour sauvegarder des mappages ou les transférer vers un autre ordinateur/navigateur :

1. Cliquez sur **Exporter le mappage**.
2. Un fichier CSV sera généré et enregistré dans le dossier de téléchargement de votre navigateur.

#### Importer des mappages

- Pour importer des mappages après avoir changé d'ordinateur/navigateur :

1. Cliquez sur **Importer le mappage**.
2. Sélectionnez le fichier CSV exporté.
3. **Important** : Assurez-vous que le fichier contient les mappages les plus récents pour éviter les incohérences.

#### Modifier et supprimer des mappages

- **Modifier une valeur** : Double-cliquez sur la valeur à modifier.
- **Supprimer une ligne** : Cliquez sur l'**icône de corbeille rouge** à côté de la ligne à supprimer.
- **Enregistrer les modifications** : Cliquez toujours sur **Enregistrer** après avoir effectué des modifications pour garantir la mise à jour des données.

---

### Remarques clés

- **Sauvegardez vos mappages** : Exportez régulièrement les mappages pour éviter toute perte de données et garantir une transition fluide entre les appareils.
- **Gérez les saisies manuelles avec précaution** : Utilisez la fonction de saisie manuelle pour les produits sans code-barres afin de vous assurer qu'ils sont inclus dans les données de numérisation.
- **Vérifiez les fichiers exportés** : Vérifiez le fichier CSV exporté avant de l'utiliser dans Sage X3.

---

### Dépannage

#### Le lecteur ne détecte pas de code-barres :

- Assurez-vous que le lecteur est connecté et qu'il fonctionne correctement.
- Vérifiez que le code-barres n'est pas endommagé ou mal imprimé.
- Ajustez les conditions d'éclairage pour une meilleure précision de numérisation.

#### Les mappages ne se synchronisent pas :

- Vérifiez que le fichier de mappage correct est importé.
- Assurez-vous que la version du fichier de mappage est la plus récente.

---

### Exemple de workflow

1. **Configurer la session** : Sélectionnez le type de numérisation, le code de mouvement et l'emplacement. 2. **Démarrer la numérisation** : Scannez les codes-barres et saisissez les informations nécessaires (REF).
2. **Exporter les données** : Enregistrez la session au format CSV et utilisez-la dans Sage X3.
3. **Gérer les mappages** : Mettez à jour et exportez régulièrement les mappages pour garantir la cohérence.

--

Pour toute question ou assistance supplémentaire, contactez Gérald Waerseggers à l'adresse **[geraldwae@gmail.com](mailto:geraldwae@gmail.com)**.
