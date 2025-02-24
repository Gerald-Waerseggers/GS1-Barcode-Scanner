**Guide d'utilisation du site Web Barcode Scanner**

---

### Présentation

Le site Web Barcode Scanner est un outil permettant de gérer efficacement les processus de réception et d'inventaire des stocks. Ce guide fournit une procédure détaillée sur la manière de configurer et d'utiliser efficacement le scanner, notamment les flux de travail de numérisation, la gestion des mappages et l'exportation de données pour Sage X3.

---

### Configuration d'une session de numérisation

Avant de commencer la numérisation, configurez la session comme suit :

1. **Sélectionnez le type de numérisation** : choisissez entre **Réception de stock** ou **Inventaire de stock**.
2. **Sélectionnez le site de stockage**.
3. **Choisissez le code de mouvement**.
4. **Saisissez l'emplacement**.
5. **Activer le mode de saisie REF ?** : activez cette option si toutes les références (REF) ne sont pas connues à l'avance.

> **Remarque** : vous pouvez mettre à jour la configuration de la session à tout moment pendant le processus en cliquant sur **« Modifier la configuration »**. Les modifications s'appliqueront aux produits numérisés suivants.

---

### Démarrage du processus de numérisation

1. Cliquez sur **Démarrer la numérisation**.
2. **Préparer la numérisation** :

- Placez le curseur de la souris sur le champ de saisie.
- Utilisez le scanner pour scanner un code-barres.

3. **Gérer les données numérisées** :

- Une nouvelle ligne apparaît dans le tableau.
- Si aucune REF n'est associée au GTIN du code-barres, saisissez-la manuellement.
- Si une REF est déjà mappée, le focus ignorera automatiquement la colonne REF.

4. **Saisir la quantité** :

- Saisissez la quantité pour les produits ayant le même code-barres (pas seulement la même REF).
- Après avoir saisi la quantité, le focus reviendra automatiquement sur le champ de saisie du scanner.

5. Répétez le processus pour les produits supplémentaires.

#### Si le produit n'a pas de code-barres GS1 ou un code-barres segmenté

- Cliquez sur **Saisie manuelle**.
- Un nouvel écran apparaîtra dans lequel vous pourrez saisir les détails du produit.
- Cliquez sur **Ajouter** pour confirmer ou sur **Annuler** (ou sur l'icône en forme de croix) pour annuler.

---

### Modification des informations sur les produits numérisés

1. Pour modifier un produit numérisé :

- Cliquez sur l'**icône en forme de stylo bleu** à la fin de la ligne que vous souhaitez modifier.
- Un nouvel écran apparaîtra dans lequel vous pourrez mettre à jour les détails du produit.
- Cliquez sur **Enregistrer les modifications** pour confirmer ou sur **Annuler** (ou sur l'icône en forme de croix) pour annuler les modifications.

2. Pour supprimer une ligne :

- Cliquez sur l'**icône en forme de corbeille rouge** à la fin de la ligne que vous souhaitez supprimer.
- Un écran de confirmation apparaîtra.
- Cliquez sur **Supprimer** pour confirmer ou sur **Annuler** pour annuler.

---

### Finalisation de la session de numérisation

1. Examinez le tableau pour vous assurer que toutes les informations sont complètes et exactes.
2. Cliquez sur **Exporter CSV** :

- Un fichier CSV sera généré et enregistré dans le dossier de téléchargement de votre navigateur.
- Utilisez ce fichier pour mettre à jour Sage X3 en conséquence.

3. Pour démarrer une nouvelle session :

- Cliquez sur **Tout effacer**.
- Mettez à jour la configuration si nécessaire.

---

### Gestion des mappages GTIN-REF

Un mappage entre REF et GTIN est automatiquement créé chaque fois que vous numérisez un produit et ajoutez un REF. Pour les prochaines numérisations du même produit, le REF se remplira automatiquement après la numérisation.

1. **Accéder aux mappages** :

- Cliquez sur **Gérer les mappages** pour ouvrir l'écran Mappages GTIN-REF.

2. **Fonctionnalités de l'écran Mappages GTIN-REF** :

- Afficher le tableau GTIN-REF.
- Importer des mappages.
- Exporter des mappages.
- Ajouter des mappages manuels.
- Modifier ou supprimer des mappages.

#### Exporter des mappages

- Pour sauvegarder des mappages ou les transférer vers un autre PC/navigateur :

1. Cliquez sur **Exporter le mappage**.
2. Un fichier CSV sera généré et enregistré dans le dossier de téléchargement de votre navigateur.

#### Importation de mappages

- Pour importer des mappages après avoir changé de PC/navigateur :

1. Cliquez sur **Importer le mappage**.
2. Sélectionnez le fichier CSV exporté.
3. **Important** : Assurez-vous que le fichier contient les mappages les plus récents pour éviter les incohérences.

#### Modification et suppression de mappages

- **Modifier une valeur** : Double-cliquez sur la valeur que vous souhaitez modifier.
- **Supprimer une ligne** : Cliquez sur l'**icône de corbeille rouge** à côté de la ligne que vous souhaitez supprimer.
- **Enregistrer les modifications** : Cliquez toujours sur **Enregistrer** après avoir effectué des modifications pour vous assurer que les données sont mises à jour.

---

### Remarques clés

- **Sauvegardez vos mappages** : Exportez régulièrement les mappages pour éviter la perte de données et assurer une transition transparente entre les appareils.
- **Gérez les entrées manuelles avec précaution** : Utilisez la fonction de saisie manuelle pour les produits sans codes-barres afin de vous assurer qu'ils sont inclus dans les données de numérisation.
- **Vérifiez les fichiers exportés** : vérifiez le fichier CSV exporté avant de l'utiliser dans Sage X3.

---

### Dépannage

#### Le scanner ne détecte pas de code-barres :

- Assurez-vous que le scanner est connecté et fonctionne correctement.
- Vérifiez que le code-barres n'est pas endommagé ou mal imprimé.
- Ajustez les conditions d'éclairage pour une meilleure précision de numérisation.

#### Les mappages ne se synchronisent pas :

- Vérifiez si le fichier de mappage correct est importé.
- Assurez-vous que le fichier de mappage est la dernière version.

---

### Exemple de flux de travail

1. **Configurer la session** : sélectionnez le type de numérisation, le site de stockage, le code de mouvement et l'emplacement.
2. **Démarrer la numérisation** : numérisez les codes-barres et saisissez les détails nécessaires (REF et quantité).
3. **Exporter les données** : enregistrez la session sous forme de fichier CSV et utilisez-la dans Sage X3.
4. **Gérer les mappages** : mettez à jour et exportez régulièrement les mappages pour maintenir la cohérence.

---

Si vous avez des questions ou besoin d'aide supplémentaire, contactez Gérald Waerseggers à **geraldwae@gmail.com**.
