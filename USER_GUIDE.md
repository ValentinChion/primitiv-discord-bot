# User Guide — Primitiv Discord Bot

This bot manages financial requests on your Discord server. Members submit expense requests via slash command; the treasurer is notified automatically. A daily report is posted every morning.

---

## Slash Commands

### `/demande` — Submit a financial request

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nom` | text | yes | Unique name for the request (e.g. `achat_stylos`) |
| `montant` | number | yes | Amount in euros (must be positive) |
| `description` | text | yes | What the money is for |

**Example:**
```
/demande nom:achat_stylos montant:12.50 description:Stylos pour la réunion du CA
```

**What happens:**
1. The request is saved to the database with status **PENDING**.
2. The treasurer receives a DM with the request details (name, amount, description, requester, ID).
3. You get a confirmation message (visible only to you) with the assigned ID.

**Validation rules:**
- `nom` must be unique — reusing a name that already exists will return an error.
- `montant` must be greater than 0.

---

## Daily Report

Every day at **4:00 AM UTC**, the bot automatically:
1. Fetches messages from the configured Discord channels.
2. Analyzes them with Claude AI (if `ANTHROPIC_API_KEY` is set).
3. Posts a summary report to the reports channel.

If there were no messages that day, it posts a simple "no activity" notice instead.

---

## Managing Requests (Dashboard)

Requests can be reviewed and updated via the web dashboard:

- **`/demandes`** — View all financial requests, update their status (PENDING / VALIDATED / DENIED).
- **`/paiements`** — View payments linked to validated requests, with Google Drive invoice links.

---

## Status Reference

| Status | Meaning |
|--------|---------|
| `PENDING` | Submitted, awaiting treasurer review |
| `VALIDATED` | Approved by the treasurer |
| `DENIED` | Rejected by the treasurer |

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Une demande avec le nom "X" existe déjà` | The `nom` is already taken | Choose a different unique name |
| `Le montant doit être positif` | Amount is 0 or negative | Enter a positive number |
| `Tous les paramètres sont requis` | A field was left blank | Fill in all three parameters |
| `Une erreur est survenue` | Internal server error | Try again; contact an admin if it persists |
