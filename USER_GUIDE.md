## Guide d'utilisation — Bot Primitiv

Ce bot gère les demandes de dépenses sur le serveur. Les membres soumettent leurs demandes via une commande slash. Je suis notifié automatiquement pour faire le paiement puis je vous renvoie un message quand c'est bon.

## Commandes

### `/demande` — Soumettre une demande de dépense

**Paramètres :**
- `nom` — Identifiant unique de la demande (ex : `achat_stylos`)
- `montant` — Montant en euros (doit être positif)
- `description` — Objet de la dépense
- `facture` *(optionnel)* — Devis ou facture à joindre (PDF, image…)

**Exemple :**
```
/demande nom:location_lights montant:30 description:Location des lights pour le bar Essentiel
```

**Ce qui se passe :**
1. La demande est enregistrée avec le statut **EN ATTENTE**.
2. Si un fichier est joint, je le recevrais directement pour faire le paiement plus rapidement.
3. Le trésorier reçoit un DM avec le nom, le montant, la description, le demandeur, l'ID, et le lien du fichier si présent.
4. Tu reçois un message de confirmation (visible uniquement par toi) avec l'ID attribué.

## Statuts des demandes

- **EN ATTENTE** — Soumise, en attente de validation par le trésorier
- **VALIDÉE** — Approuvée par le trésorier
- **REFUSÉE** — Rejetée par le trésorier

## Erreurs courantes

**`Une demande avec le nom "X" existe déjà`**

**`Tous les paramètres sont requis`**
→ Un champ a été laissé vide. Il faut absolument remplir les trois paramètres.

**`Une erreur est survenue`**
→ Une erreur du bot, réessayez une deuxième fois et si ça persiste, prévenez-moi !