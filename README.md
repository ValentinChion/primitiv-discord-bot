## **📋 Guide de Test du Bot Discord**

_(Pour les développeurs - Version 1.0)_

---

## **1️⃣ Préparation du Test**

### **A. Vérifiez votre environnement**

```bash
# Depuis le dossier du bot
pnpm install          # Installe les dépendances
pnpm prisma generate  # Génère le client Prisma
pnpm build             # Compile le TypeScript
```

### \*\*B. Vérifiez votre `.env`

```env
DISCORD_TOKEN=votre_token_bot_ici       # Remplacez par votre token réel
DATABASE_URL="postgresql://..."         # Vérifiez que la base est accessible
GOOGLE_DRIVE_FOLDER_ID="votre_id_dossier" # ID du dossier Google Drive
```

### **C. Lancez le bot en mode développement**

```bash
pnpm dev
```

_→ Vous devriez voir :_

```
🔵 Bot connecté en tant que NomDuBot#1234
```

---

## **2️⃣ Testez les Commandes Principales**

### **A. Créer une demande (`!demande`)**

1. **Dans Discord** (sur votre serveur de test) :

   ```plaintext
   !demande achat_stylos 15.99 "Achat de 10 stylos pour l'atelier"
   ```

   _→ Réponse attendue :_

   ```
   ✅ Demande enregistrée : Votre demande achat_stylos (#1) a été enregistrée : 15.99€ pour "Achat de 10 stylos pour l'atelier".
   ```

2. **Vérifiez dans la base de données** :

   ```bash
   pnpm prisma studio
   ```

   _→ Une entrée doit apparaître dans la table `Demande` avec :_

   - `name`: "achat_stylos"
   - `type`: "DEMANDE"
   - `statut`: "PENDING"

3. **Vérifiez que le trésorier reçoit un DM** :
   - Le trésorier (vous, en mode test) doit recevoir un message avec :
     - Un embed décrivant la demande
     - Deux boutons : **"Accepter"** et **"Refuser"**

---

### **B. Valider une demande (Trésorier)**

1. **Cliquez sur "Accepter"** dans le DM reçu.
   _→ Réponse attendue :_

   ```
   Demande #1 acceptée. L'utilisateur a été notifié.
   ```

2. **Vérifiez le DM reçu par l'utilisateur** :

   ```
   🎉 Votre demande achat_stylos (#1) a été validée. Vous pouvez maintenant :
   - Payer avec la carte de l'association : !confirm achat_stylos [montant_exact] + [facture]
   - Payer avec votre carte personnelle : !remboursement achat_stylos [montant_exact] + [facture]
   ⚠️ La facture est OBLIGATOIRE dans les deux cas.
   ```

3. **Vérifiez dans Prisma Studio** :
   - Le `type` doit être passé à `"PAIEMENT"`
   - Le `statut` reste `"PENDING"`

---

### **C. Confirmer un paiement (`!confirm`)**

1. **Joignez un fichier PDF** (ou image) et envoyez :

   ```plaintext
   !confirm achat_stylos 15.99
   ```

   _(Joignez un fichier `facture.pdf` au message)_

2. **Réponse attendue** :

   ```
   ✅ Demande confirmée : Votre demande achat_stylos a été confirmée avec succès.
   ```

3. **Vérifiez dans Prisma Studio** :

   - Le `statut` doit être `"VALIDATED"`
   - Une entrée doit exister dans la table `Paiement` avec :
     - `demandeId`: 1
     - `factureUrl`: Une URL Google Drive valide

4. **Vérifiez sur Google Drive** :
   - Un fichier `facture_1_facture.pdf` doit apparaître dans votre dossier partagé.

---

### **D. Demander un remboursement (`!remboursement`)**

1. **Si l'utilisateur a payé avec sa CB perso** :

   ```plaintext
   !remboursement achat_stylos 15.99
   ```

   _(Joignez un fichier `facture_perso.pdf`)_

2. **Réponse attendue** :

   ```
   ✅ Demande de remboursement enregistrée : Votre demande de remboursement #2 a été enregistrée.
   ```

3. **Vérifiez** :
   - Une nouvelle entrée dans `Demande` avec :
     - `type`: "REMBOURSEMENT"
     - `statut`: "PENDING"
     - `paiementId`: 1 (lien vers la demande originale)
   - Le trésorier reçoit un DM pour traiter le remboursement.

---

## **3️⃣ Testez les Cas d'Erreur**

### **A. Commande incomplète**

```plaintext
!demande
```

_→ Réponse attendue :_

```
❌ Erreur : Utilisation : `!demande [nom] [montant] [description]`
```

### **B. Montant invalide**

```plaintext
!demande achat_cahiers pas_un_nombre "Achat de cahiers"
```

_→ Réponse attendue :_

```
❌ Erreur : Le montant doit être un nombre positif.
```

### **C. Demande inexistante**

```plaintext
!confirm demande_inexistante 10.00
```

_→ Réponse attendue :_

```
❌ Erreur : Aucune demande trouvée avec le nom "demande_inexistante".
```

### **D. Fichier manquant**

```plaintext
!confirm achat_stylos 15.99
```

_(Sans joindre de fichier)_
_→ Réponse attendue :_

```
❌ Erreur : Veuillez joindre une facture (PDF).
```

---

## **4️⃣ Vérifications Finales**

### **A. Base de données**

```bash
pnpm prisma studio
```

_Vérifiez que :_

- Toutes les demandes ont un `statut` cohérent.
- Les URLs des factures sont valides (cliquez dessus pour vérifier).

### **B. Google Drive**

- Allez dans votre dossier partagé et vérifiez que :
  - Les fichiers sont bien nommés (`facture_[ID]_[nom].pdf`).
  - Les fichiers sont accessibles (pas d'erreur 404).

### **C. Logs du Bot**

_Dans votre terminal où `pnpm dev` est lancé, vérifiez l'absence d'erreurs :_

```
🔵 Bot connecté en tant que NomDuBot#1234
```

_(Pas de messages d'erreur en rouge)_

---

## \*\*5️⃣ Checklist de Validation

| Étape                            | ✅ Validé | ❌ Échec | Notes                   |
| -------------------------------- | --------- | -------- | ----------------------- |
| Bot se connecte                  |           |          |                         |
| `!demande` fonctionne            |           |          |                         |
| DM au trésorier                  |           |          |                         |
| Validation par le trésorier      |           |          |                         |
| Notification utilisateur         |           |          |                         |
| `!confirm` fonctionne            |           |          |                         |
| Facture uploadée sur Drive       |           |          |                         |
| `!remboursement` fonctionne      |           |          |                         |
| DM de remboursement au trésorier |           |          |                         |
| Gestion des erreurs              |           |          | Testez 2-3 cas d'erreur |

---

## **6️⃣ Dépannage**

### **Problème : Le bot ne répond pas**

1. Vérifiez que le token dans `.env` est correct.
2. Vérifiez que le bot a bien les **intents** nécessaires activés dans le [Portail Développeur Discord](https://discord.com/developers/applications).
3. Redémarrez le bot :
   ```bash
   pnpm dev
   ```

### **Problème : Les DMs ne sont pas envoyés**

1. Vérifiez que le trésorier (vous) et l'utilisateur test **partagent un serveur** avec le bot.
2. Vérifiez que l'utilisateur n'a pas **bloqué les DMs** du bot (Paramètres Discord → Confidentialité).

### **Problème : Les factures ne s'uploadent pas**

1. Vérifiez que le fichier `google-drive-credentials.json` est bien placé dans `bot/config/`.
2. Vérifiez que le dossier Google Drive est **partagé avec le compte de service** (en tant qu'éditeur).
3. Testez manuellement l'upload :
   ```typescript
   // Dans un fichier test.ts
   import { uploadToDrive } from "./services/googleDrive";
   const testUrl = await uploadToDrive(
     {
       url: "https://example.com/test.pdf",
       name: "test.pdf",
       contentType: "application/pdf",
     } as any,
     "votre_dossier_id",
     "test_file.pdf"
   );
   console.log(testUrl);
   ```

### **Problème : Erreurs Prisma**

1. Vérifiez que la base de données PostgreSQL est **accessible**.
2. Exécutez les migrations :
   ```bash
   pnpm prisma migrate dev
   ```
3. Vérifiez les logs pour des erreurs spécifiques.

---

## **7️⃣ Test en Conditions Réelles**

Une fois que tout fonctionne en local :

1. **Invitez le bot sur un serveur de test** (créé exprès).
2. **Ajoutez 2-3 utilisateurs tests** (vous + 2 comptes alternatifs).
3. **Simulez un workflow complet** :
   - Utilisateur 1 : `!demande`
   - Trésorier (vous) : Validez la demande
   - Utilisateur 1 : `!confirm` ou `!remboursement`
   - Trésorier : Traitez le remboursement

---

## **8️⃣ Exemple de Session de Test Complète**

```plaintext
[Utilisateur] !demande achat_crayons 8.99 "Achat de crayons de couleur"
[Bot] ✅ Demande enregistrée : achat_crayons (#1) - 8.99€

[Trésorier] *Clique sur "Accepter" dans le DM*
[Bot] Demande #1 acceptée. L'utilisateur a été notifié.

[Utilisateur] *Reçoit un DM* :
🎉 Votre demande achat_crayons (#1) a été validée. Vous pouvez maintenant :
- Payer avec la carte de l'association : !confirm achat_crayons 8.99 + [facture]
- Payer avec votre carte personnelle : !remboursement achat_crayons 8.99 + [facture]

[Utilisateur] !confirm achat_crayons 8.99 + [facture.pdf]
[Bot] ✅ Demande confirmée : achat_crayons a été confirmée avec succès.
```

---

## **9️⃣ Outils Recommandés pour le Test**

| Outil              | Utilisation                         | Lien                                         |
| ------------------ | ----------------------------------- | -------------------------------------------- |
| **Prisma Studio**  | Vérifier les données en base        | `pnpm prisma studio`                         |
| **Postman**        | Tester les requêtes API (si besoin) | [postman.com](https://www.postman.com)       |
| **Discord Tester** | Simuler plusieurs utilisateurs      | [Discord Tester](https://discordtester.com)  |
| **Google Drive**   | Vérifier les fichiers uploadés      | [drive.google.com](https://drive.google.com) |

---

## **10️⃣ Checklist Pré-Déploiement**

Avant de déployer en production, vérifiez :

- [ ] Toutes les commandes fonctionnent sans erreur.
- [ ] Les DMs sont envoyés correctement.
- [ ] Les factures sont bien stockées sur Google Drive.
- [ ] Les statuts dans la base de données sont cohérents.
- [ ] Les erreurs sont gérées gracieusement (messages clairs pour l'utilisateur).
- [ ] Les logs ne montrent aucune erreur critique.

---

**Problème persistant ?** Décrivez-moi :

- La commande testée
- Le message d'erreur exact
- Les logs du terminal
  Je vous aiderai à le résoudre ! 🚀
