# Kashif Pay (كاشف) — Vérifie avant de payer

> **Bouclier anti-fraude pour les paiements financiers marocains & audit d'exposition**  
> *Développé pour l'AI Fintech Hackathon (Alliance Access, El Jadida)*

---

## 📌 Présentation

**Kashif Pay (كاشف)** est un bouclier d'intelligence artificielle et de sécurité déterministe conçu spécifiquement pour le contexte financier marocain. Il intervient avant chaque virement, paiement instantané ou scan QR pour protéger les utilisateurs et les institutions financières contre l'ingénierie sociale et la fraude aux paiements.

---

## 🛡️ Fonctionnalités Clés

### 1. Scam Shield — Paiements & Fraude Marocaine
- **Catégorisation ciblée des attaques :**
  - `fake_bank_sms` (faux SMS bancaire CIH, Attijariwafa, BCP, BMCE, Barid Bank)
  - `otp_request` (demandes et interceptions de codes de validation OTP / 3D-Secure)
  - `fake_delivery_fee` (faux frais de douane et de livraison Amana Colis avec liens courts)
  - `fake_buyer_or_seller` (acheteurs WhatsApp / Avito prétendant avoir surpayé ou demandant une différence)
  - `fake_payment_link_or_qr` (liens et codes QR contrefaits masquant la destination réelle)
  - `sim_swap_pretext` (prétextes de renouvellement SIM ou de mise à jour opérateur Inwi / IAM / Orange)
  - `other` (autres tentatives d'escroquerie financière)
- **Raisonnement en Darija & multilingue :** Compréhension native des expressions dialectales marocaines (arabe et arabizi).
- **Ligne d'action immédiate :** *"Que faire maintenant"* affiché sur chaque verdict.
- **4 Scénarios Démo en 1 clic :** Test instantané des cas les plus fréquents au Maroc.
- **Garde-fous déterministes inviolables :** Règles strictes (requêtes CVV/PIN/OTP, urgence + virement, domaines bancaires contrefaits) pouvant **uniquement aggraver** la sévérité (`safe` → `suspicious` → `scam`), jamais la dégrader.

### 2. Vérification des QR Codes & Liens de Paiement
- Décodage des QR codes de facture ou de paiement via pipeline Node / Canvas / jsQR.
- Affichage de la **destination décodée avant le verdict**.
- Détection et signalement automatique des domaines imitateurs (look-alike), des raccourcisseurs d'URL (`bit.ly`, `tinyurl`, etc.) et des destinations de paiement non agréées au Maroc.

### 3. Profil d'Attaque Financière (Exposure Check)
- Calcul algorithmique côté code du top 3 des arnaques financières visant spécifiquement l'utilisateur en fonction des données exposées identifiées :
  1. *Usurpation bancaire (Bank Impersonation)*
  2. *Attaque SIM Swap (Détournement de ligne mobile)*
  3. *Arnaque faux acheteur / vendeur (Marketplace / Avito)*
- Scénario d'attaque étape par étape (Étape 1, Étape 2, Étape 3) basé sur les informations réelles trouvées.
- 3 mesures concrètes et immédiates de protection.

### 4. Intégration B2B pour Banques & Fintechs
- Documentation et bac à sable interactif pour l'API REST `POST /api/v1/check`.
- Permet aux banques et fintechs d'intercepter les virements douteux directement dans leur tunnel applicatif mobile.
- Console de surveillance pour les opérations de fraude avec étiquetage strict *"Données de démonstration"*.

---

## 🚀 Spécification API B2B (`POST /api/v1/check`)

```bash
curl -X POST http://localhost:3000/api/v1/check \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "sms",
    "sender": "CIH-BANK",
    "text": "CIH: Votre compte est restreint. Régularisez sur: http://cih-securite-login.com/auth",
    "language": "fr"
  }'
```

**Exemple de réponse :**
```json
{
  "verdict": "scam",
  "category": "fake_bank_sms",
  "risk_level": "high",
  "confidence": 0.98,
  "reason": "Tentative flagrante d'usurpation de la marque CIH Bank via un nom de domaine non officiel...",
  "action_recommendation": "Ne cliquez sous aucun prétexte sur ce lien. Contactez immédiatement votre agence CIH ou le 4747.",
  "red_flags": [
    {
      "flag": "Lien web bancaire contrefait ou domaine usurpateur",
      "quote_from_message": "http://cih-securite-login.com/auth"
    }
  ],
  "latency_ms": 380
}
```

---

## 🔒 Confidentialité & Conformité CNDP

- **Zéro persistance :** Toutes les analyses sont effectuées en mémoire éphémère.
- Aucune donnée bancaire, identifiant, RIB ou numéro de téléphone n'est stocké en base de données persistante.
- Bouton de purge instantanée de session accessible à tout moment dans l'en-tête de l'application.
