import { Language } from './types.ts';

export interface Translations {
  appName: string;
  appSubtitle: string;
  tabs: {
    exposureCheck: string;
    scamShield: string;
    b2b: string;
    benchmarks: string;
    monitoring: string;
  };
  header: {
    purgeBtn: string;
    purgeSuccess: string;
    debugToggle: string;
  };
  footer: {
    poweredBy: string;
    stackDesc: string;
    autoFallback: string;
    zeroPersistence: string;
    debugPanel: string;
    reliabilityLink: string;
  };
  hero: {
    eyebrow: string;
    headlinePrefix: string;
    headlineAccent: string;
    headlineSuffix: string;
    subheadline: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
    stat3Value: string;
    stat3Label: string;
    scamShieldSwitchPrompt: string;
    scamShieldSwitchSub: string;
    previewCaption: string;
    howItWorksEyebrow: string;
    howItWorksSub: string;
  };
  modes: {
    fullTab: string;
    fullBadge: string;
    quickTab: string;
    quickBadge: string;
    trustNotice: string;
    fullHeroTitle: string;
    fullHeroSub: string;
    quickHeroTitle: string;
    quickHeroSub: string;
  };
  fullDropzone: {
    title: string;
    subtitle: string;
    badge: string;
    processingNote: string;
    fileLoaded: string;
    sizeLabel: string;
    readyForAnalysis: string;
    changeFile: string;
    startBtn: string;
    scanning: string;
  };
  quickDropzone: {
    title: string;
    subtitle: string;
    badge: string;
    videoBadge: string;
    pasteHint: string;
    readyCount: string;
    videoLoaded: string;
    videoLimitNote: string;
    addReplace: string;
    startBtn: string;
    scanning: string;
    extractingFrames: string;
    transcribingAudio: string;
    analyzingContent: string;
  };
  exportGuide: {
    title: string;
    subtitle: string;
    tabs: {
      instagram: string;
      facebook: string;
      tiktok: string;
    };
    instagramLabel: string;
    instagramPath: string;
    instagramNote: string;
    facebookLabel: string;
    facebookPath: string;
    facebookNote: string;
    tiktokLabel: string;
    tiktokPath: string;
    tiktokNote: string;
  };
  demoProfiles: {
    callout: string;
    title: string;
    fullModeSub: string;
    quickModeSub: string;
    oneClickBadge: string;
    readyFull: string;
    readyQuick: string;
    selectedLabel: string;
    auditAction: string;
    tiers: {
      critical: string;
      high: string;
      medium: string;
      low: string;
    };
  };
  ownership: {
    title: string;
    expl: string;
    emailLabel: string;
    usernameLabel: string;
    otpBtn: string;
    verifyBtn: string;
    verifiedBadge: string;
    accountValidated: string;
    associatedWith: string;
  };
  report: {
    scoreTitle: string;
    prePublishScoreTitle: string;
    prePublishTitle: string;
    prePublishSub: string;
    recommendationsTitle: string;
    recommendationsSub: string;
    concreteEditLabel: string;
    impactLabel: string;
    videoHonestyNote: string;
    transcriptTitle: string;
    spokenRisksTitle: string;
    levelCritical: string;
    levelHigh: string;
    levelMedium: string;
    levelLow: string;
    simulatedScoreNote: string;
    actionsResolvedSuffix: string;
    accountLabel: string;
    captionsProcessed: string;
    archiveLabel: string;
    auditLatency: string;
    verifiedOwner: string;
    exifTitle: string;
    gdprNotice: string;
    findingsTitle: string;
    weightedBySeverity: string;
    sourceLabel: string;
    locationTimelineTitle: string;
    locationTimelineSub: string;
    searchHistoryTitle: string;
    searchHistorySub: string;
    commentsTitle: string;
    adInterestsTitle: string;
    attackPathsTitle: string;
    attackPathsSub: string;
    fixChecklistTitle: string;
    fixChecklistSub: string;
    simulationTitle: string;
    simulationSub: string;
    simulationBtn: string;
    simulatingBtn: string;
    simulationBadge: string;
    vectorLabel: string;
    senderLabel: string;
    deceptionMechanism: string;
    resetBtn: string;
    photosAnalyzedNotice: string;
    photosNoticeSub: string;
  };
  financialAttack: {
    title: string;
    subtitle: string;
    rankedTitle: string;
    rankPrefix: string;
    likelihoodLabel: string;
    exploitedCluesLabel: string;
    topScenarioTitle: string;
    topScenarioSub: string;
    topProtectionsTitle: string;
    stepPrefix: string;
  };
  scamShield: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    dropzoneTitle: string;
    dropzoneSubtitle: string;
    orPaste: string;
    pastePlaceholder: string;
    analyzeBtn: string;
    analyzing: string;
    trySample: string;
    samples: {
      cihBankSms: string;
      otpForwarding: string;
      amanaDeliveryFee: string;
      avitoBuyerOverpay: string;
      legitTransferNote: string;
    };
    categoryLabel: string;
    categories: {
      fake_bank_sms: string;
      otp_request: string;
      fake_delivery_fee: string;
      fake_buyer_or_seller: string;
      fake_payment_link_or_qr: string;
      sim_swap_pretext: string;
      other: string;
    };
    whatToDoNowTitle: string;
    qrDestinationTitle: string;
    qrDestinationSub: string;
    flagLookalike: string;
    flagShortened: string;
    flagUnknownDest: string;
    transcriptionTitle: string;
    redFlagsTitle: string;
    whatToDoTitle: string;
    reportToTitle: string;
    resetBtn: string;
    safeVerdict: string;
    safeRiskBadge: string;
    suspiciousVerdict: string;
    scamVerdict: string;
    confidence: string;
    guardrailBadge: string;
    personalizationRiskBadge: string;
    trust1: string;
    trust2: string;
    trust3: string;
    tryImageSample: string;
    demoBadge: string;
    removeImageBtn: string;
    decodedQrBanner: string;
    analyzingSteps: {
      reading: string;
      decoding: string;
      verdict: string;
    };
    imageSamples: {
      qrScam: {
        title: string;
        subtitle: string;
      };
      avitoChat: {
        title: string;
        subtitle: string;
      };
      qrLegit: {
        title: string;
        subtitle: string;
      };
    };
  };
  b2b: {
    badge: string;
    title: string;
    subtitle: string;
    demoNotice: string;
    apiTitle: string;
    apiSub: string;
    endpointLabel: string;
    sampleReqTitle: string;
    sampleResTitle: string;
    mockDashboardTitle: string;
    mockTransfersBlocked: string;
    mockAvgLatency: string;
    mockAccuracy: string;
    mockNotice: string;
    featuresTitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    testBtn: string;
    testingBtn: string;
    testSuccessNotice: string;
  };
  benchmarks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    runBtn: string;
    runningBtn: string;
    setHeldOut: string;
    setDev: string;
    accuracy: string;
    precision: string;
    recall: string;
    latencyAvg: string;
    latencyP95: string;
    guardrailPass: string;
    casesEvaluated: string;
  };
  monitoring: {
    title: string;
    subtitle: string;
    systemHealth: string;
    operational: string;
    totalRequests: string;
    avgLatency: string;
    guardrailEnforcements: string;
    liveLogs: string;
  };
  common: {
    deleteSession: string;
    sessionDeleted: string;
    aiNotice: string;
    debugView: string;
    realExecution: string;
  };
  qrCard: {
    title: string;
    decodedLabel: string;
    warningText: string;
    riskNoteUrl: string;
    riskNotePhone: string;
    riskNoteWifi: string;
    riskNoteText: string;
    kindLabels: {
      url: string;
      phone: string;
      wifi: string;
      text: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  fr: {
    appName: 'Kashif Pay · كاشف',
    appSubtitle: 'Vérifie avant de payer',
    tabs: {
      exposureCheck: 'Exposure Check',
      scamShield: 'Bouclier Paiement',
      b2b: 'Banques & Fintechs',
      benchmarks: 'Fiabilité & Tests',
      monitoring: 'Monitoring en direct',
    },
    header: {
      purgeBtn: 'Purger la session',
      purgeSuccess: 'Session effacée : toutes les données en mémoire ont été purgées.',
      debugToggle: 'Debug',
    },
    footer: {
      poweredBy: 'Analyse propulsée par',
      stackDesc: 'Architecture hybride multi-modèles Kashif (Gemini · Groq · Brev) avec garde-fous stricts',
      autoFallback: 'auto-fallback',
      zeroPersistence: 'Zéro persistance en mémoire · L’IA conseille, vous décidez',
      debugPanel: 'panneau de debug',
      reliabilityLink: "Voir les résultats de fiabilité et l'architecture technique →",
    },
    hero: {
      eyebrow: 'AUDIT DE VULNÉRABILITÉ FINANCIÈRE',
      headlinePrefix: 'Quelle arnaque financière',
      headlineAccent: 'peut viser',
      headlineSuffix: 'votre profil ?',
      subheadline: 'Déposez votre export de données : Kashif Pay calcule les arnaques de paiement auxquelles vous êtes le plus exposé, et simule comment elles se dérouleraient.',
      stat1Value: '3',
      stat1Label: 'Scénarios financiers simulés',
      stat2Value: '100%',
      stat2Label: 'Traitement en mémoire éphémère',
      stat3Value: '0',
      stat3Label: 'Donnée conservée',
      scamShieldSwitchPrompt: 'Vous suspectez plutôt un SMS ou un message direct ?',
      scamShieldSwitchSub: 'Basculez vers Scam Shield pour auditer un texto, lien de livraison ou faux OTP.',
      previewCaption: 'Aperçu — simulation de fraude financière',
      howItWorksEyebrow: 'COMMENT ÇA MARCHE',
      howItWorksSub: 'Détection d’indices & simulation d’attaque financière',
    },
    modes: {
      fullTab: 'Audit complet (.zip export)',
      fullBadge: 'Profil existant',
      quickTab: 'Vérifier avant de publier',
      quickBadge: 'Capture ou Vidéo',
      trustNotice: 'L’archive .zip est analysée localement sur le serveur sans persistance. Seules les captures d’écran sélectionnées sont transmises aux modèles d’IA pour l’analyse visuelle.',
      fullHeroTitle: 'Un profil ne montre que ce que vous choisissez. Votre export montre tout — même ce que vous avez oublié.',
      fullHeroSub: 'Instagram, Facebook et TikTok vous permettent de télécharger gratuitement votre archive officielle de données (aucun mot de passe nécessaire). Elle contient l’intégralité de vos publications, légendes, commentaires, historique de géolocalisation et recherches passées.',
      quickHeroTitle: 'Sur le point de publier ? Vérifiez d’abord ce que ce post révèle.',
      quickHeroSub: 'Déposez une capture ou une courte vidéo (jusqu’à 30s) que vous vous apprêtez à mettre en ligne : Kashif Pay analyse les indices de routine, documents visibles, visages de mineurs et métadonnées avant qu’ils ne deviennent publics.',
    },
    fullDropzone: {
      title: 'Déposez votre archive .zip',
      subtitle: 'Archive officielle Instagram, Facebook ou TikTok téléchargée depuis vos paramètres.',
      badge: 'Fichier .ZIP',
      processingNote: 'Archive traitée localement en mémoire sans conservation',
      fileLoaded: 'Fichier archive chargé',
      sizeLabel: 'Taille',
      readyForAnalysis: 'Prêt pour l’analyse approfondie',
      changeFile: 'Changer',
      startBtn: 'Lancer l’Audit Complet de l’Archive',
      scanning: 'Extraction directe des JSON & audit en cours...',
    },
    quickDropzone: {
      title: 'Déposez votre photo ou courte vidéo',
      subtitle: 'Capture du post à venir (1-3 images) ou courte vidéo (MP4/WebM jusqu’à 30s) avant publication.',
      badge: 'Photos (PNG, JPG, WebP)',
      videoBadge: 'Vidéo (max 30s / 50Mo)',
      pasteHint: 'ou collez (Ctrl+V)',
      readyCount: 'Fichiers prêts',
      videoLoaded: 'Vidéo chargée prête pour analyse',
      videoLimitNote: 'Vidéo analysée par échantillonnage d’images clés et transcription de la piste audio.',
      addReplace: '+ Ajouter / Remplacer',
      startBtn: 'Vérifier avant publication',
      scanning: 'Audit préventif avant publication...',
      extractingFrames: 'Extraction des images clés de la vidéo...',
      transcribingAudio: 'Transcription et analyse de la piste audio...',
      analyzingContent: 'Audit visuel et détection des indices...',
    },
    exportGuide: {
      title: 'Comment télécharger votre export de données officiel (Chemin exact)',
      subtitle: 'Aucun mot de passe n’est requis par Kashif. Vous téléchargez votre propre archive directement depuis la plateforme.',
      tabs: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        tiktok: 'TikTok',
      },
      instagramLabel: '📱 Sur l’application Instagram :',
      instagramPath: 'Profil → Menu (☰) → Espace Comptes (Meta) → Vos informations et autorisations → Télécharger vos informations → Format : JSON (Recommandé)',
      instagramNote: 'Instagram prépare le fichier et vous avertit par notification. Téléchargez le .zip puis glissez-le directement dans la boîte ci-dessus.',
      facebookLabel: '💻 Sur Facebook (Web ou Mobile) :',
      facebookPath: 'Paramètres et confidentialité → Paramètres → Vos informations Facebook → Télécharger vos informations de profil → Sélectionner format JSON',
      facebookNote: 'Inclut vos publications, commentaires, géolocalisations et interactions de groupes.',
      tiktokLabel: '🎵 Sur l’application TikTok :',
      tiktokPath: 'Profil → Menu (☰) → Paramètres et confidentialité → Compte → Télécharger vos données → Format : JSON',
      tiktokNote: 'Génère l’archive de vos vidéos, historiques de navigation et commentaires passés.',
    },
    demoProfiles: {
      callout: 'Pas encore votre export ? Testez avec un profil de démonstration ci-dessous.',
      title: 'Charger un profil marocain de démonstration',
      fullModeSub: '(Simule un export complet)',
      quickModeSub: '(Simule 1-3 captures)',
      oneClickBadge: '1 clic pour évaluer',
      readyFull: 'Export complet prêt',
      readyQuick: '3 captures prêtes',
      selectedLabel: 'Profil sélectionné :',
      auditAction: 'Auditer ce profil maintenant',
      tiers: {
        critical: 'Critique',
        high: 'Élevé',
        medium: 'Modéré',
        low: 'Faible',
      },
    },
    ownership: {
      title: 'Contrôle d’appartenance & anti-abus',
      expl: 'Si vous contrôlez l’email lié au compte, vous prouvez votre légitimité — le même modèle de confiance que la récupération de compte. Aucune donnée n’est conservée.',
      emailLabel: 'Votre adresse email',
      usernameLabel: 'Nom d’utilisateur du compte',
      otpBtn: 'Code OTP',
      verifyBtn: 'Vérifier',
      verifiedBadge: '✓ Vérifié',
      accountValidated: 'Compte validé',
      associatedWith: 'L’audit est associé à',
    },
    report: {
      scoreTitle: 'Score d’exposition globale',
      prePublishScoreTitle: 'Indice de risque avant publication',
      prePublishTitle: 'Ce que vous vous apprêtez à exposer',
      prePublishSub: 'Voici ce qu’un tiers pourra déduire de ce post — appliquez les recommandations concrètes ci-dessous avant de publier.',
      recommendationsTitle: 'Recommandations concrètes avant publication',
      recommendationsSub: 'Modifications chirurgicales recommandées (flou, recadrage, coupe audio) avant mise en ligne publique.',
      concreteEditLabel: 'Action recommandée :',
      impactLabel: 'Bénéfice sécurité :',
      videoHonestyNote: 'Échantillonnage vidéo certifié',
      transcriptTitle: 'Transcription de la piste audio',
      spokenRisksTitle: 'Informations révélées oralement dans la vidéo',
      levelCritical: 'CRITIQUE',
      levelHigh: 'ÉLEVÉ',
      levelMedium: 'MODÉRÉ',
      levelLow: 'FAIBLE',
      simulatedScoreNote: '✓ Score simulé après correction de',
      actionsResolvedSuffix: 'mesure(s) de sécurité.',
      accountLabel: 'Compte :',
      captionsProcessed: 'Captures traitées :',
      archiveLabel: 'Archive officielle :',
      auditLatency: 'Audit neuronal :',
      verifiedOwner: 'Propriétaire vérifié par OTP',
      exifTitle: 'Métadonnées & Confidentialité :',
      gdprNotice: 'Traitement en mémoire, aucune donnée conservée',
      findingsTitle: 'Indices & Fuites identifiés',
      weightedBySeverity: 'Pondération par gravité',
      sourceLabel: 'Source :',
      locationTimelineTitle: 'Chronologie des déplacements & Géolocalisations',
      locationTimelineSub: 'Lieux tracés dans l’archive',
      searchHistoryTitle: 'Recherches privées conservées dans l’export',
      searchHistorySub: 'Requêtes extraites',
      commentsTitle: 'Commentaires et interactions publiques',
      adInterestsTitle: 'Centres d’intérêt publicitaires déduits',
      attackPathsTitle: 'Scénarios d’attaque réalistes',
      attackPathsSub: 'Ingénierie sociale dérivée de vos données',
      fixChecklistTitle: 'Plan d’action correctif prioritaire',
      fixChecklistSub: 'Cochez pour simuler l’amélioration de votre score',
      simulationTitle: 'Simulation d’attaque défensive (Spear-Phishing éducatif)',
      simulationSub: 'Génère le message exact qu’un escroc pourrait vous envoyer en exploitant uniquement vos données trouvées ci-dessus.',
      simulationBtn: 'Générer la simulation',
      simulatingBtn: 'Génération...',
      simulationBadge: 'SIMULATION DÉFENSIVE : Conçue pour anticiper les pièges.',
      vectorLabel: 'Vecteur :',
      senderLabel: 'Expéditeur :',
      deceptionMechanism: 'Mécanisme de tromperie :',
      resetBtn: 'Auditer un autre profil ou archive',
      photosAnalyzedNotice: 'photos analysées sur',
      photosNoticeSub: 'Pour préserver la réactivité, l’audit vision cible les 20 plus récentes et les fichiers contenant des balises GPS.',
    },
    financialAttack: {
      title: 'Quelle arnaque financière vous vise le plus ?',
      subtitle: 'Classement algorithmique des vecteurs d’arnaques de paiement dérivés de vos données exposées',
      rankedTitle: 'Top 3 des menaces financières calculées pour vous :',
      rankPrefix: 'Rang #',
      likelihoodLabel: 'Probabilité calculée :',
      exploitedCluesLabel: 'Données exploitées :',
      topScenarioTitle: 'Scénario d’attaque ciblé (Étape par étape)',
      topScenarioSub: 'Comment un fraudeur utiliserait vos propres données exposées pour vous piéger',
      topProtectionsTitle: '3 gestes de protection immédiats',
      stepPrefix: 'Étape',
    },
    scamShield: {
      eyebrow: 'BOUCLIER ANTI-FRAUDE FINANCIÈRE',
      headline: 'Vérifiez avant de payer ou transférer',
      subheadline: 'Déposez une capture d’écran, un QR code de paiement, un lien ou un SMS (CIH, Attijari, Wafacash, Amana, Avito). Analyse immédiate en Darija, Français, Arabe et Anglais.',
      dropzoneTitle: 'Glissez un SMS, QR code ou capture de paiement',
      dropzoneSubtitle: 'Détecte automatiquement les QR codes, liens courts et faux prétextes (PNG, JPG, WebP ou Ctrl+V)',
      orPaste: 'ou écrivez / collez le message, lien ou coordonnées ci-dessous',
      pastePlaceholder: 'Ex: CIH: Compte bloqué... / Sift lik l-code dial Wafacash... / bit.ly/amana-pay... / https://...',
      analyzeBtn: 'Vérifier avant de payer',
      analyzing: 'Analyse neuronale & contrôle anti-fraude en cours...',
      trySample: 'Tester 4 scénarios d’arnaques financières marocaines :',
      samples: {
        cihBankSms: 'Faux SMS bancaire CIH (Phishing)',
        otpForwarding: 'Vol d’OTP Wafacash (Darija)',
        amanaDeliveryFee: 'Faux frais Amana 19.50 DH (Lien court)',
        avitoBuyerOverpay: 'Faux acheteur Avito & trop-perçu',
        legitTransferNote: 'Notification virement légitime (BCP)',
      },
      categoryLabel: 'Catégorie de fraude :',
      categories: {
        fake_bank_sms: 'Faux SMS Bancaire (Usurpation banque)',
        otp_request: 'Demande d’OTP ou données de carte',
        fake_delivery_fee: 'Frais de livraison factices (Amana / Barid)',
        fake_buyer_or_seller: 'Faux acheteur / vendeur marketplace',
        fake_payment_link_or_qr: 'Lien de paiement ou QR code suspect',
        sim_swap_pretext: 'Prétexte SIM Swap / Opérateur télécom',
        other: 'Autre tentative de fraude financière',
      },
      whatToDoNowTitle: 'Que faire maintenant ?',
      qrDestinationTitle: 'Destination décodée du QR Code',
      qrDestinationSub: 'Inspectée avant évaluation pour neutraliser les redirections masquées',
      flagLookalike: 'Domaine imitateur suspect détecté',
      flagShortened: 'Lien raccourci masquant la destination réelle',
      flagUnknownDest: 'Destination de paiement non certifiée',
      transcriptionTitle: 'Ce que le système a lu sur votre capture',
      redFlagsTitle: 'Indices de fraude identifiés',
      whatToDoTitle: 'Protocole de réaction recommandé',
      reportToTitle: 'Signaler auprès des autorités compétentes',
      resetBtn: 'Vérifier un autre paiement ou message',
      safeVerdict: 'Aucun signal de fraude détecté',
      safeRiskBadge: 'Risque Faible · Low Risk',
      suspiciousVerdict: 'Suspect — Ne payez pas sans vérification',
      scamVerdict: 'Arnaque financière confirmée',
      confidence: 'Indice de certitude',
      guardrailBadge: 'Verrouillé par garde-fou déterministe',
      personalizationRiskBadge: 'Risque de ciblage personnalisé détecté',
      trust1: '15+ typologies marocaines',
      trust2: '100% traitement en mémoire',
      trust3: 'Contrôles déterministes stricts',
      tryImageSample: 'Tester avec une image :',
      demoBadge: 'Exemple de démonstration',
      removeImageBtn: 'Retirer l’image',
      decodedQrBanner: 'Destination décodée du QR Code :',
      analyzingSteps: {
        reading: 'Lecture...',
        decoding: 'Décodage...',
        verdict: 'Verdict...',
      },
      imageSamples: {
        qrScam: {
          title: 'QR de paiement piégé',
          subtitle: 'Lien bancaire imitateur (CIH)',
        },
        avitoChat: {
          title: 'Capture : faux virement reçu (Avito)',
          subtitle: 'Acheteur simulant un trop-perçu',
        },
        qrLegit: {
          title: 'QR de paiement légitime',
          subtitle: 'Ticket commerçant neutre sans lien',
        },
      },
    },
    b2b: {
      badge: 'API & INTÉGRATION FINTECH',
      title: 'Kashif Pay pour les Banques & Fintechs',
      subtitle: 'Protégez vos clients en temps réel avant la confirmation de chaque virement, paiement instantané ou scan QR.',
      demoNotice: 'Données de démonstration — Environnement sandbox hackathon',
      apiTitle: 'Spécification de l’API POST /api/v1/check',
      apiSub: 'Intégrez le moteur en moins de 10 lignes de code dans votre tunnel de virement mobile.',
      endpointLabel: 'Point de terminaison :',
      sampleReqTitle: 'Requête type (JSON) :',
      sampleResTitle: 'Réponse Kashif Pay (Temps réel) :',
      mockDashboardTitle: 'Console de surveillance des fraudes interbancaires',
      mockTransfersBlocked: 'Virements frauduleux bloqués',
      mockAvgLatency: 'Latence médiane API',
      mockAccuracy: 'Taux de précision',
      mockNotice: 'Données de démonstration',
      featuresTitle: 'Pourquoi les institutions financières intègrent Kashif Pay',
      feature1Title: 'Détection en amont du virement',
      feature1Desc: 'Alerte instantanée sur l’écran de validation avant débit du compte, bloquant les escroqueries par faux RIB ou faux coursier.',
      feature2Title: 'Compréhension native de la Darija',
      feature2Desc: 'Traitement des subtilités du dialecte marocain (arabe et arabizi) et des expressions courantes d’urgence et de manipulation.',
      feature3Title: 'Zéro persistance & souveraineté',
      feature3Desc: 'Traitement volatil en mémoire éphémère respectant les exigences strictes de la CNDP et de Bank Al-Maghrib.',
      testBtn: 'Tester l’API en direct',
      testingBtn: 'Appel API en cours...',
      testSuccessNotice: 'Appel API réussi : réponse 200 OK reçue du moteur Kashif Pay.',
    },
    benchmarks: {
      eyebrow: 'ÉVALUATION & VALIDATION',
      title: 'Banc d’Essai Multi-Modèles & Garde-Fou',
      subtitle: 'Matrice de validation sur 40 scénarios certifiés (phishing bancaire, loterie, 2FA légitime, et profils d’exposition).',
      runBtn: 'Lancer le benchmark complet',
      runningBtn: 'Exécution des 40 cas en direct...',
      setHeldOut: '20 Cas Held-Out (Non vus)',
      setDev: '20 Cas Dev Set (Calibration)',
      accuracy: 'Précision globale',
      precision: 'Précision',
      recall: 'Rappel',
      latencyAvg: 'Latence moyenne',
      latencyP95: 'Latence P95',
      guardrailPass: 'Garde-fous activés',
      casesEvaluated: 'cas évalués',
    },
    monitoring: {
      title: 'Supervision & Observabilité en Direct',
      subtitle: 'Télémétrie en temps réel des requêtes multi-fournisseurs, latences et déclenchements de garde-fous.',
      systemHealth: 'État du système',
      operational: 'Opérationnel',
      totalRequests: 'Requêtes traitées',
      avgLatency: 'Latence moyenne',
      guardrailEnforcements: 'Garde-fous déclenchés',
      liveLogs: 'Journaux d’exécution récents',
    },
    common: {
      deleteSession: 'Purger la session',
      sessionDeleted: 'Toutes les données en mémoire ont été effacées.',
      aiNotice: 'L’intelligence artificielle peut se tromper : vous gardez le jugement final.',
      debugView: 'Mode débogage (?debug=1)',
      realExecution: 'Mesure réelle en direct',
    },
    qrCard: {
      title: 'Code QR Détecté',
      decodedLabel: 'Contenu décodé :',
      warningText: 'Ne scannez pas et n’ouvrez pas ce lien.',
      riskNoteUrl: 'Ce lien peut mener vers un portail de phishing, un faux paiement ou un téléchargement malveillant.',
      riskNotePhone: 'Ce numéro peut être surtaxé ou utilisé pour un échange d’ingénierie sociale.',
      riskNoteWifi: 'Un réseau Wi-Fi non sécurisé peut intercepter vos communications.',
      riskNoteText: 'Ce code QR contient des données brutes pouvant dissimuler des instructions frauduleuses.',
      kindLabels: {
        url: 'Lien web',
        phone: 'Numéro de téléphone',
        wifi: 'Configuration Wi-Fi',
        text: 'Texte brut',
      },
    },
  },

  ar: {
    appName: 'كاشف باي · Kashif Pay',
    appSubtitle: 'تحقق قبل ما تخلص',
    tabs: {
      exposureCheck: 'فحص البصمة',
      scamShield: 'درع الأداء والاحتيال',
      b2b: 'البنوك والـ Fintech',
      benchmarks: 'الموثوقية والتقييم',
      monitoring: 'المراقبة المباشرة',
    },
    header: {
      purgeBtn: 'مسح الجلسة',
      purgeSuccess: 'تم مسح الجلسة: تم تفريغ كافة البيانات من الذاكرة فوراً.',
      debugToggle: 'التصحيح',
    },
    footer: {
      poweredBy: 'التحليل مدعوم بواسطة',
      stackDesc: 'بنية كاشف الهجينة متعددة النماذج (Gemini · Groq · Brev) مع حواجز أمان صارمة',
      autoFallback: 'تحويل تلقائي',
      zeroPersistence: 'لا تخزين في الذاكرة الدائمة · الذكاء الاصطناعي يوجه وأنت تقرر',
      debugPanel: 'لوحة التصحيح',
      reliabilityLink: 'عرض نتائج اختبارات الموثوقية والهندسة التقنية ←',
    },
    hero: {
      eyebrow: 'تدقيق الثغرات المالية',
      headlinePrefix: 'ما هو الاحتيال المالي الذي',
      headlineAccent: 'قد يستهدف',
      headlineSuffix: 'حسابك؟',
      subheadline: 'أودع ملف تصدير بياناتك: يحسب Kashif Pay عمليات احتيال الدفع التي أنت معرض لها أكثر، ويحاكي كيفية حدوثها.',
      stat1Value: '3',
      stat1Label: 'سيناريوهات احتيال مالي محاكاة',
      stat2Value: '100%',
      stat2Label: 'معالجة مؤقتة في الذاكرة',
      stat3Value: '0',
      stat3Label: 'بيانات محفوظة',
      scamShieldSwitchPrompt: 'هل تشك في رسالة نصية أو رسالة مباشرة بدلاً من ذلك؟',
      scamShieldSwitchSub: 'انتقل إلى درع الاحتيال لفحص رسالة SMS أو رابط توصيل أو رمز بنكي مشبوه.',
      previewCaption: 'معاينة — محاكاة الاحتيال المالي',
      howItWorksEyebrow: 'كيف يعمل',
      howItWorksSub: 'كشف المؤشرات ومحاكاة الهجمات المالية',
    },
    modes: {
      fullTab: 'تدقيق شامل (تصدير zip.)',
      fullBadge: 'الحساب الحالي',
      quickTab: 'تحقق قبل النشر',
      quickBadge: 'صورة أو فيديو',
      trustNotice: 'يتم تحليل ملف .zip محلياً في الذاكرة دون حفظ. لقطات الشاشة المختارة فقط تُرسل لنماذج الذكاء الاصطناعي للتحليل البصري.',
      fullHeroTitle: 'الملف الشخصي يظهر ما تختاره فقط. ملف التصدير يكشف كل شيء — حتى ما نسيته.',
      fullHeroSub: 'تتيح لك منصات إنستغرام وفيسبوك وتيك توك تنزيل أرشيف بياناتك الرسمي مجاناً (دون الحاجة لكلمة سر). يحتوي على كافة المنشورات والتعليقات وسجل المواقع والبحث.',
      quickHeroTitle: 'على وشك النشر؟ تحقق أولاً مما قد يكشفه هذا المنشور.',
      quickHeroSub: 'ارفع صورة أو لقطة أو مقطع فيديو تنوي نشره: يفحص كاشف معالم المكان، والوثائق، والوجوه، والبيانات قبل إتاحتها للعامة.',
    },
    fullDropzone: {
      title: 'أفلت ملف الأرشيف zip.',
      subtitle: 'الأرشيف الرسمي لإنستغرام أو فيسبوك أو تيك توك المنزّل من إعدادات حسابك.',
      badge: 'ملف ZIP.',
      processingNote: 'معالجة محلية في الذاكرة دون حفظ',
      fileLoaded: 'تم تحميل ملف الأرشيف بنجاح',
      sizeLabel: 'الحجم',
      readyForAnalysis: 'جاهز للتدقيق الشامل والعميق',
      changeFile: 'تغيير',
      startBtn: 'بدء التدقيق الشامل للأرشيف',
      scanning: 'جاري استخراج ملفات JSON والتدقيق الفوري...',
    },
    quickDropzone: {
      title: 'أفلت صورتك أو مقطع الفيديو القصير',
      subtitle: 'صورة للمنشور المرتقب أو مقطع فيديو (MP4/WebM حتى 30 ثانية) قبل النشر للعامة.',
      badge: 'الصور (PNG, JPG, WebP)',
      videoBadge: 'فيديو (حتى 30 ثانية / 50 ميغابايت)',
      pasteHint: 'أو الصق مباشرة (Ctrl+V)',
      readyCount: 'ملفات جاهزة',
      videoLoaded: 'تم تحميل الفيديو بنجاح',
      videoLimitNote: 'يتم تحليل الفيديو عبر استخراج لقطات محددة وتفريغ المسار الصوتي.',
      addReplace: '+ إضافة / استبدال',
      startBtn: 'فحص المحتوى قبل النشر',
      scanning: 'تدقيق وقائي قبل النشر...',
      extractingFrames: 'جاري استخراج لقطات الفيديو الرئيسية...',
      transcribingAudio: 'جاري تفريغ الصوت والتحقق من التسريبات الشفهية...',
      analyzingContent: 'جاري فحص الأدلة البصرية وكشف المخاطر...',
    },
    exportGuide: {
      title: 'كيفية تنزيل أرشيف بياناتك الرسمي (المسار الدقيق)',
      subtitle: 'لا يطلب كاشف أي كلمة سر مطلقا. تقوم بتنزيل أرشيفك الشخصي مباشرة من المنصة الرسمية.',
      tabs: {
        instagram: 'إنستغرام',
        facebook: 'فيسبوك',
        tiktok: 'تيك توك',
      },
      instagramLabel: '📱 على تطبيق إنستغرام :',
      instagramPath: 'الملف الشخصي ← القائمة (☰) ← مركز الحسابات (Meta) ← معلوماتك وأذوناتك ← تنزيل معلوماتك ← التنسيق: JSON (موصى به)',
      instagramNote: 'يقوم إنستغرام بإعداد الأرشيف وإشعارك عند جهوزيته. نزّل ملف zip. ثم أفلته في المربع أعلاه.',
      facebookLabel: '💻 على فيسبوك (الويب أو الهاتف) :',
      facebookPath: 'الإعدادات والخصوصية ← الإعدادات ← معلوماتك على فيسبوك ← تنزيل معلومات الملف الشخصي ← حدد تنسيق JSON',
      facebookNote: 'يتضمن منشوراتك وتعليقاتك وسجل المواقع وتفاعلات المجموعات.',
      tiktokLabel: '🎵 على تطبيق تيك توك :',
      tiktokPath: 'الملف الشخصي ← القائمة (☰) ← الإعدادات والخصوصية ← الحساب ← تنزيل بياناتك ← التنسيق: JSON',
      tiktokNote: 'ينشئ أرشيفاً لفيديوهاتك وسجل التصفح والتعليقات السابقة.',
    },
    demoProfiles: {
      callout: 'ليس لديك ملف التصدير بعد؟ جرب ملفاً تجريبياً أدناه.',
      title: 'تحميل ملف تجريبي مغربي',
      fullModeSub: '(يحاكي تصديراً كاملاً)',
      quickModeSub: '(يحاكي 1-3 لقطات)',
      oneClickBadge: 'نقرة واحدة للتجربة',
      readyFull: 'التصدير الكامل جاهز',
      readyQuick: '3 لقطات جاهزة',
      selectedLabel: 'الملف المختار :',
      auditAction: 'تدقيق هذا الملف الآن',
      tiers: {
        critical: 'حرج',
        high: 'عالي',
        medium: 'متوسط',
        low: 'منخفض',
      },
    },
    ownership: {
      title: 'التحقق من ملكية الحساب ومنع إساءة الاستخدام',
      expl: 'إثبات تحكمك بالبريد الإلكتروني يمنحك حق فحص الحساب — نفس نموذج الأمان المتبع في استرجاع الحسابات. لا نخزن أي بيانات.',
      emailLabel: 'بريدك الإلكتروني',
      usernameLabel: 'اسم مستخدم الحساب',
      otpBtn: 'رمز OTP',
      verifyBtn: 'تأكيد',
      verifiedBadge: '✓ مؤكد',
      accountValidated: 'تم تأكيد الحساب',
      associatedWith: 'التدقيق مرتبط بـ',
    },
    report: {
      scoreTitle: 'مستوى تعرضك للمخاطر الإجمالي',
      prePublishScoreTitle: 'مؤشر الخطورة قبل النشر',
      prePublishTitle: 'ما أنت على وشك كشفه للعامة',
      prePublishSub: 'إليك ما يمكن لجهة مجهولة استنتاجه من هذا المنشور — يُنصح بإجراء التعديلات المقترحة قبل النشر.',
      recommendationsTitle: 'توصيات وتعديلات ملموسة قبل النشر',
      recommendationsSub: 'إجراءات محددة (تمويه، قص، قطع مقطع صوتي) ينصح بها قبل النشر العام.',
      concreteEditLabel: 'الإجراء الملموس :',
      impactLabel: 'الأثر الوقائي :',
      videoHonestyNote: 'عينة إطارات موثقة',
      transcriptTitle: 'تفريغ المسار الصوتي للفيديو',
      spokenRisksTitle: 'بيانات تم الإفصاح عنها شفهياً في المقطع',
      levelCritical: 'حرج للغاية',
      levelHigh: 'عالي',
      levelMedium: 'متوسط',
      levelLow: 'منخفض',
      simulatedScoreNote: '✓ النتيجة المحاكاة بعد تطبيق',
      actionsResolvedSuffix: 'إجراءات تصحيحية أمنية.',
      accountLabel: 'الحساب :',
      captionsProcessed: 'اللقطات المعالجة :',
      archiveLabel: 'الأرشيف الرسمي :',
      auditLatency: 'زمن الفحص العصبي :',
      verifiedOwner: 'مالك الحساب موثق عبر رمز OTP',
      exifTitle: 'البيانات الوصفية والخصوصية :',
      gdprNotice: 'معالجة في الذاكرة، لا يتم حفظ أي بيانات',
      findingsTitle: 'الأدلة والتسريبات المكتشفة',
      weightedBySeverity: 'مرتبة حسب درجة الخطورة',
      sourceLabel: 'المصدر :',
      locationTimelineTitle: 'الخط الزمني للمواقع والتنقلات',
      locationTimelineSub: 'الأماكن المرصودة في الأرشيف',
      searchHistoryTitle: 'عمليات البحث الخاصة المحفوظة في التصدير',
      searchHistorySub: 'الاستفسارات المستخرجة',
      commentsTitle: 'التعليقات والتفاعلات العامة',
      adInterestsTitle: 'الاهتمامات الإعلانية المستنتجة',
      attackPathsTitle: 'سيناريوهات الهجوم المحتملة',
      attackPathsSub: 'هندسة اجتماعية مشتقة من بياناتك المكشوفة',
      fixChecklistTitle: 'خطة الإجراءات التصحيحية ذات الأولوية',
      fixChecklistSub: 'حدد البنود لمحاكاة تحسن درجتك فوراً',
      simulationTitle: 'محاكاة هجوم دفاعي (تصيد موجه تعليمي)',
      simulationSub: 'يولد الرسالة الدقيقة التي قد يرسلها محتال باستغلال معطياتك المكشوفة أعلاه فقط.',
      simulationBtn: 'توليد المحاكاة الدفاعية',
      simulatingBtn: 'جاري التوليد...',
      simulationBadge: 'محاكاة دفاعية تعليمية: هدفها توضيح كيف يستغل المهاجم معلوماتك لتفادي الفخ.',
      vectorLabel: 'المسار :',
      senderLabel: 'المرسل :',
      deceptionMechanism: 'آلية الخداع والتضليل :',
      resetBtn: 'تدقيق حساب أو أرشيف آخر',
      photosAnalyzedNotice: 'صور تم فحصها من أصل',
      photosNoticeSub: 'للحفاظ على السرعة والاستجابة، يستهدف الفحص البصري أحدث 20 صورة والملفات المحتوية على إحداثيات GPS.',
    },
    financialAttack: {
      title: 'ما هي حيلة الاحتيال المالي التي تستهدفك أكثر ؟',
      subtitle: 'ترتيب حسابي لأخطر سيناريوهات الاحتيال المالي استناداً إلى معطياتك المكشوفة',
      rankedTitle: 'أخطر 3 تهديدات مالية تم احتسابها لك بالخوارزمية :',
      rankPrefix: 'الرتبة #',
      likelihoodLabel: 'احتمال الاستهداف :',
      exploitedCluesLabel: 'المعطيات المستغلة ضدك :',
      topScenarioTitle: 'سيناريو الهجوم الموجه (خطوة بخطوة)',
      topScenarioSub: 'كيف يمكن للمحتال توظيف بياناتك الحقيقية لإيقاعك في الفخ المالي',
      topProtectionsTitle: '3 خطوات وقائية فورية',
      stepPrefix: 'الخطوة',
    },
    scamShield: {
      eyebrow: 'درع الحماية من الاحتيال المالي',
      headline: 'تحقق قبل ما تخلص أو تصيفط الفلوس',
      subheadline: 'ضع لقطة شاشة، رمز QR للأداء، رابطاً أو نص رسالة بنكية أو تجارية (CIH، التجاري، وافاكاش، أمانة، أفيتو). فحص ذكي فوري بالدارجة المغربية، العربية، الفرنسية والإنجليزية.',
      dropzoneTitle: 'اسحب رسالة SMS أو رمز QR للأداء أو لقطة شاشة',
      dropzoneSubtitle: 'كشف فوري لرموز QR والروابط المختصرة ومصائد الأداء الاحتيالي (PNG, JPG, WebP أو Ctrl+V)',
      orPaste: 'أو الصق نص الرسالة أو الرابط المريب هنا',
      pastePlaceholder: 'مثال: CIH: حسابكم معلق... / صيفطت ليك كود وافاكاش بالغلط... / bit.ly/amana-pay... / https://...',
      analyzeBtn: 'تحقق قبل الدفع',
      analyzing: 'جاري الفحص المالي وقواعد الأمان الحتمية...',
      trySample: 'جرب 4 سيناريوهات احتيال مالي مغربي شائع :',
      samples: {
        cihBankSms: 'رسالة بنكية مزيفة CIH (تصيد)',
        otpForwarding: 'سرقة كود تأكيد وافاكاش (بالدارجة)',
        amanaDeliveryFee: 'رسوم طرد أمانة وهمية 19.50 درهم',
        avitoBuyerOverpay: 'مشتري وهمي على أفيتو وحيلة الفائض',
        legitTransferNote: 'إشعار تحويل بنكي سليم (BCP)',
      },
      categoryLabel: 'تصنيف الاحتيال :',
      categories: {
        fake_bank_sms: 'رسالة بنكية مزيفة (انتحال صفة بنك)',
        otp_request: 'طلب مريب لكود التأكيد OTP أو البطاقة',
        fake_delivery_fee: 'رسوم شحن وتوصيل وهمية (أمانة / بريد المغرب)',
        fake_buyer_or_seller: 'مشتري أو بائع وهمي في مواقع الإعلانات',
        fake_payment_link_or_qr: 'رابط دفع أو رمز QR خبيث',
        sim_swap_pretext: 'احتيال استبدال الشريحة SIM / الاتصالات',
        other: 'محاولة احتيال مالي أخرى',
      },
      whatToDoNowTitle: 'شنو دير دابا ؟',
      qrDestinationTitle: 'الوجهة الحقيقية المفكوكة لرمز QR',
      qrDestinationSub: 'يتم فحص الرابط أو المعطيات قبل الحكم لتحييد أي تحويل خفي',
      flagLookalike: 'رابط منتحل يحاكي مؤسسة مالية معروفة',
      flagShortened: 'رابط مختصر يخفي العنوان النهائي الحقيقي',
      flagUnknownDest: 'وجهة دفع غير معتمدة أو مجهولة المصدر',
      transcriptionTitle: 'ما قرأه النظام من الصورة أو رمز QR',
      redFlagsTitle: 'العلامات التحذيرية المكتشفة',
      whatToDoTitle: 'خطة التحرك الوقائية الموصى بها',
      reportToTitle: 'جهات التبليغ الرسمية المعنية',
      resetBtn: 'فحص رسالة أو أداء آخر',
      safeVerdict: 'لم يتم رصد أي مؤشر احتيال',
      safeRiskBadge: 'مستوى الخطر : منخفض',
      suspiciousVerdict: 'مريب — لا تدفع قبل التأكد',
      scamVerdict: 'احتيال مالي مؤكد',
      confidence: 'نسبة التأكيد',
      guardrailBadge: 'مؤكد بقواعد الأمان الحتمية',
      personalizationRiskBadge: 'تم رصد استهداف مخصص لمعلوماتك المكشوفة',
      trust1: 'أكثر من 15 نمط احتيال مغربي',
      trust2: 'معالجة مؤقتة في الذاكرة 100%',
      trust3: 'قواعد أمان حتمية صارمة',
      tryImageSample: 'اختبر عبر صورة :',
      demoBadge: 'نموذج توضيحي تجريبي',
      removeImageBtn: 'إزالة الصورة',
      decodedQrBanner: 'الوجهة المستخرجة من رمز QR :',
      analyzingSteps: {
        reading: 'قراءة المحتوى...',
        decoding: 'فك الشفرة...',
        verdict: 'النتيجة والتقييم...',
      },
      imageSamples: {
        qrScam: {
          title: 'رمز QR احتيالي مفخخ',
          subtitle: 'رابط بنكي منتحل (CIH)',
        },
        avitoChat: {
          title: 'لقطة شاشة: تحويل وهمي (أفيتو)',
          subtitle: 'مشتري يدعي إرسال فائض بالمصادفة',
        },
        qrLegit: {
          title: 'رمز QR دفع قانوني سليم',
          subtitle: 'وصل تجاري محايد بدون أي رابط',
        },
      },
    },
    b2b: {
      badge: 'واجهة برمجية وتكامل مع الفينتك',
      title: 'كاشف باي للبنوك وشركات الفينتك',
      subtitle: 'حماية عملاء الخدمات المصرفية في الوقت الفعلي قبل تأكيد أي تحويل مالي، أداء فوري أو مسح رمز QR.',
      demoNotice: 'بيانات تجريبية — بيئة العرض التوضيحي للهاكاثون',
      apiTitle: 'مواصفات الواجهة البرمجية POST /api/v1/check',
      apiSub: 'إدماج محرك التحقق في أقل من 10 أسطر برمجية داخل مسار التحويلات المصرفية.',
      endpointLabel: 'نقطة النهاية البرمجية :',
      sampleReqTitle: 'نموذج الطلب (JSON) :',
      sampleResTitle: 'استجابة كاشف باي الفورية :',
      mockDashboardTitle: 'لوحة مراقبة واعتراض الاحتيال المالي بين البنوك',
      mockTransfersBlocked: 'تحويلات احتيالية تم حظرها',
      mockAvgLatency: 'متوسط زمن استجابة الـ API',
      mockAccuracy: 'نسبة الدقة المصرفية',
      mockNotice: 'بيانات تجريبية توضيحية',
      featuresTitle: 'لماذا تعتمد المؤسسات المالية على كاشف باي',
      feature1Title: 'كشف مسبق قبل تنفيذ التحويل',
      feature1Desc: 'تنبيه فوري على شاشة التأكيد قبل خصم الرصيد، لمنع تحويل الأموال إلى حسابات احتيالية.',
      feature2Title: 'فهم عميق للدارجة المغربية',
      feature2Desc: 'معالجة ذكية للعبارات الدارجة والمصطلحات الشائعة للاستعجال والمناورة المالية بالمغرب.',
      feature3Title: 'سيادة المعطيات وعدم التخزين',
      feature3Desc: 'معالجة مؤقتة بالكامل في الذاكرة مطابقة لتعليمات بنك المغرب واللجنة الوطنية CNDP.',
      testBtn: 'تجربة الـ API مباشرة',
      testingBtn: 'جاري استدعاء الـ API...',
      testSuccessNotice: 'تم استدعاء الـ API بنجاح: تم استلام استجابة 200 OK من محرك كاشف باي.',
    },
    benchmarks: {
      eyebrow: 'التقييم والتحقق',
      title: 'منصة اختبار النماذج وحواجز الأمان',
      subtitle: 'مصفوفة تحقق عبر 40 سيناريو موثق (تصيد بنكي، جوائز وهمية، رموز حقيقية، وملفات بصمة رقمية).',
      runBtn: 'تشغيل الاختبار الكامل',
      runningBtn: 'جاري تشغيل 40 حالة مباشرة...',
      setHeldOut: '20 حالة غير مرئية مسبقاً (Held-Out)',
      setDev: '20 حالة لمعايرة النظام (Dev Set)',
      accuracy: 'الدقة العامة',
      precision: 'الدقة الموجبة',
      recall: 'نسبة الاسترجاع',
      latencyAvg: 'متوسط الاستجابة',
      latencyP95: 'استجابة P95',
      guardrailPass: 'الحواجز النشطة',
      casesEvaluated: 'حالة تم فحصها',
    },
    monitoring: {
      title: 'المراقبة الحية والرصد المباشر',
      subtitle: 'متابعة حية للطلبات متعددة النماذج والسرعات وحالات تفعيل حواجز الأمان الحتمية.',
      systemHealth: 'حالة النظام',
      operational: 'يعمل بكفاءة',
      totalRequests: 'إجمالي الطلبات',
      avgLatency: 'متوسط الاستجابة',
      guardrailEnforcements: 'الحواجز المفعلة',
      liveLogs: 'سجلات التشغيل الحديثة',
    },
    common: {
      deleteSession: 'مسح الجلسة فوراً',
      sessionDeleted: 'تم مسح جميع البيانات من الذاكرة بالكامل.',
      aiNotice: 'الذكاء الاصطناعي قد يخطئ — القرار النهائي بيدك دائماً.',
      debugView: 'لوحة التطوير (?debug=1)',
      realExecution: 'قياس زمني حقيقي',
    },
    qrCard: {
      title: 'تم رصد رمز QR',
      decodedLabel: 'المحتوى المفكوك:',
      warningText: 'لا تمسح هذا الرمز ولا تفتح هذا الرابط.',
      riskNoteUrl: 'هذا الرابط قد يقودك إلى صفحة تصيد احتيالي أو مصيدة أداء مزور أو موقع خبيث.',
      riskNotePhone: 'قد يكون هذا الرقم مكلفاً أو مستخدماً في مناورات الهندسة الاجتماعية.',
      riskNoteWifi: 'شبكة Wi-Fi غير آمنة يمكنها اعتراض بياناتك ومراسلاتك.',
      riskNoteText: 'يحتوي رمز QR على بيانات نصية قد تخفي تعليمات احتيالية.',
      kindLabels: {
        url: 'رابط إلكتروني',
        phone: 'رقم هاتف',
        wifi: 'إعدادات Wi-Fi',
        text: 'نص عادي',
      },
    },
  },

  en: {
    appName: 'Kashif Pay · كاشف',
    appSubtitle: 'Verify before you pay',
    tabs: {
      exposureCheck: 'Exposure Check',
      scamShield: 'Payment Fraud Shield',
      b2b: 'Banks & Fintechs',
      benchmarks: 'Reliability & Benchmarks',
      monitoring: 'Live Monitoring',
    },
    header: {
      purgeBtn: 'Purge Session',
      purgeSuccess: 'Session cleared: all memory data purged successfully.',
      debugToggle: 'Debug',
    },
    footer: {
      poweredBy: 'Analysis powered by',
      stackDesc: 'Kashif Hybrid Multi-Provider Architecture (Gemini · Groq · Brev) with strict deterministic guardrails',
      autoFallback: 'auto-fallback',
      zeroPersistence: 'Strict in-memory zero persistence · AI advises, you decide',
      debugPanel: 'debug panel',
      reliabilityLink: 'View reliability benchmark results & technical architecture →',
    },
    hero: {
      eyebrow: 'FINANCIAL VULNERABILITY AUDIT',
      headlinePrefix: 'Which financial scam',
      headlineAccent: 'could target',
      headlineSuffix: 'your profile?',
      subheadline: 'Drop your data export: Kashif Pay calculates the payment scams you are most exposed to, and simulates how they would unfold.',
      stat1Value: '3',
      stat1Label: 'Simulated financial scams',
      stat2Value: '100%',
      stat2Label: 'In-memory ephemeral audit',
      stat3Value: '0',
      stat3Label: 'Data stored',
      scamShieldSwitchPrompt: 'Suspecting a suspicious text or direct message instead?',
      scamShieldSwitchSub: 'Switch to Scam Shield to audit a text, delivery link, or fake banking OTP.',
      previewCaption: 'Preview — financial fraud simulation',
      howItWorksEyebrow: 'HOW IT WORKS',
      howItWorksSub: 'Evidence detection & financial scam simulation',
    },
    modes: {
      fullTab: 'Full Audit (.zip export)',
      fullBadge: 'Existing Profile',
      quickTab: 'Check Before Posting',
      quickBadge: 'Image or Video',
      trustNotice: 'The .zip archive is parsed locally in-memory without persistence. Only selected screenshots are sent to AI models for vision analysis.',
      fullHeroTitle: 'A profile only shows what you choose. Your export reveals everything — even what you’ve forgotten.',
      fullHeroSub: 'Instagram, Facebook, and TikTok allow you to download your official data archive for free (no passwords needed). It contains your complete posts, captions, comments on others, location history, and past searches.',
      quickHeroTitle: 'About to post? Check what it reveals first.',
      quickHeroSub: 'Drop a screenshot or short video (up to 30s) of a post you are about to publish: Kashif Pay analyzes routine clues, visible documents, people, and metadata before you share.',
    },
    fullDropzone: {
      title: 'Drop your .zip archive',
      subtitle: 'Official Instagram, Facebook, or TikTok archive downloaded from your account settings.',
      badge: '.ZIP File',
      processingNote: 'Archive parsed locally in-memory without storage',
      fileLoaded: 'Archive file loaded',
      sizeLabel: 'Size',
      readyForAnalysis: 'Ready for comprehensive audit',
      changeFile: 'Change',
      startBtn: 'Start Full Archive Audit',
      scanning: 'Parsing JSON fields & running audit...',
    },
    quickDropzone: {
      title: 'Drop your image or short video',
      subtitle: 'Screenshot of your upcoming post (1-3 images) or short video clip (MP4/WebM up to 30s) before posting.',
      badge: 'Photos (PNG, JPG, WebP)',
      videoBadge: 'Video (max 30s / 50MB)',
      pasteHint: 'or paste (Ctrl+V)',
      readyCount: 'Files ready',
      videoLoaded: 'Video loaded ready for audit',
      videoLimitNote: 'Video analyzed via keyframe sampling and audio track transcription.',
      addReplace: '+ Add / Replace',
      startBtn: 'Check Before Posting',
      scanning: 'Running pre-publish check...',
      extractingFrames: 'Extracting video keyframes...',
      transcribingAudio: 'Transcribing and analyzing audio track...',
      analyzingContent: 'Visual clues audit & threat detection...',
    },
    exportGuide: {
      title: 'How to download your official data export (Exact menu path)',
      subtitle: 'Zero passwords requested by Kashif. You download your own archive directly from the official platform.',
      tabs: {
        instagram: 'Instagram',
        facebook: 'Facebook',
        tiktok: 'TikTok',
      },
      instagramLabel: '📱 On the Instagram App:',
      instagramPath: 'Profile → Menu (☰) → Accounts Center (Meta) → Your information and permissions → Download your information → Format: JSON (Recommended)',
      instagramNote: 'Instagram prepares the archive and sends a notification. Download the .zip file and drop it directly into the box above.',
      facebookLabel: '💻 On Facebook (Web or Mobile):',
      facebookPath: 'Settings & privacy → Settings → Your Facebook information → Download profile information → Select JSON format',
      facebookNote: 'Includes your posts, comments, location tags, and group interactions.',
      tiktokLabel: '🎵 On the TikTok App:',
      tiktokPath: 'Profile → Menu (☰) → Settings and privacy → Account → Download your data → Format: JSON',
      tiktokNote: 'Generates an archive of your videos, browsing history, and past comments.',
    },
    demoProfiles: {
      callout: 'Don’t have your export yet? Try a demo profile below.',
      title: 'Load Synthetic Moroccan Demo Profiles',
      fullModeSub: '(Simulates a full export)',
      quickModeSub: '(Simulates 1-3 screenshots)',
      oneClickBadge: '1-click test',
      readyFull: 'Full export ready',
      readyQuick: '3 screenshots ready',
      selectedLabel: 'Selected profile:',
      auditAction: 'Audit this profile now',
      tiers: {
        critical: 'Critical',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      },
    },
    ownership: {
      title: 'Anti-Misuse & Ownership Check',
      expl: 'If you control the email tied to the account, you prove legitimate ownership — the same trust model platforms use for account recovery. We store nothing.',
      emailLabel: 'Your Email Address',
      usernameLabel: 'Account Username',
      otpBtn: 'OTP Code',
      verifyBtn: 'Verify',
      verifiedBadge: '✓ Verified',
      accountValidated: 'Account validated',
      associatedWith: 'Audit is associated with',
    },
    report: {
      scoreTitle: 'Global Exposure Threat Score',
      prePublishScoreTitle: 'Pre-Publish Threat Risk Index',
      prePublishTitle: 'What you are about to expose',
      prePublishSub: 'Here is what an adversary could infer from this post — apply the concrete edits below before posting.',
      recommendationsTitle: 'Concrete Recommendations Before Posting',
      recommendationsSub: 'Actionable edits (blurring, cropping, audio removal) to neutralize risks prior to publishing.',
      concreteEditLabel: 'Recommended Action:',
      impactLabel: 'Security Benefit:',
      videoHonestyNote: 'Certified Video Keyframe Sampling',
      transcriptTitle: 'Audio Track Transcript',
      spokenRisksTitle: 'Information Disclosed Aloud in Video',
      levelCritical: 'CRITICAL',
      levelHigh: 'HIGH',
      levelMedium: 'MEDIUM',
      levelLow: 'LOW',
      simulatedScoreNote: '✓ Simulated score after resolving',
      actionsResolvedSuffix: 'recommended security measures.',
      accountLabel: 'Account:',
      captionsProcessed: 'Captures processed:',
      archiveLabel: 'Official archive:',
      auditLatency: 'Neural audit time:',
      verifiedOwner: 'Verified account owner via OTP',
      exifTitle: 'Metadata & Privacy:',
      gdprNotice: 'In-memory processing, zero data stored',
      findingsTitle: 'Identified Clues & Leakages',
      weightedBySeverity: 'Weighted by severity',
      sourceLabel: 'Source:',
      locationTimelineTitle: 'Movement Timeline & Location History',
      locationTimelineSub: 'Tracked places in archive',
      searchHistoryTitle: 'Private searches preserved in export',
      searchHistorySub: 'Extracted queries',
      commentsTitle: 'Public comments and interactions',
      adInterestsTitle: 'Inferred advertising interests',
      attackPathsTitle: 'Realistic Attack Paths',
      attackPathsSub: 'Social engineering derived from your data',
      fixChecklistTitle: 'Prioritized Fix Checklist',
      fixChecklistSub: 'Check items to simulate improved security score',
      simulationTitle: 'Defensive Attack Simulation (Educational Spear-Phishing)',
      simulationSub: 'Generates the exact tailored message a scammer could craft by weaponizing only your discovered public data above.',
      simulationBtn: 'Generate Simulation',
      simulatingBtn: 'Generating...',
      simulationBadge: 'DEFENSIVE SIMULATION: Crafted exclusively to illustrate exploitation patterns.',
      vectorLabel: 'Vector:',
      senderLabel: 'Sender:',
      deceptionMechanism: 'Deception mechanism:',
      resetBtn: 'Audit another profile or archive',
      photosAnalyzedNotice: 'photos analyzed out of',
      photosNoticeSub: 'To maintain responsiveness, vision analysis targets the 20 most recent photos and files with GPS tags.',
    },
    financialAttack: {
      title: 'Which financial scam targets you the most?',
      subtitle: 'Algorithmic ranking of payment fraud vectors derived from your exposed data footprint',
      rankedTitle: 'Top 3 financial attack vectors computed by code:',
      rankPrefix: 'Rank #',
      likelihoodLabel: 'Exposure Likelihood:',
      exploitedCluesLabel: 'Exploited Clues:',
      topScenarioTitle: 'Targeted Attack Scenario (Step-by-Step)',
      topScenarioSub: 'How a fraudster would weaponize your own exposed data against you',
      topProtectionsTitle: '3 Immediate Defense Steps',
      stepPrefix: 'Step',
    },
    scamShield: {
      eyebrow: 'FINANCIAL FRAUD SHIELD',
      headline: 'Verify Before You Pay or Transfer',
      subheadline: 'Upload a screenshot, payment QR code, link, or banking SMS (CIH, Attijari, Wafacash, Amana, Avito). Instant multi-lingual analysis across Darija, French, Arabic, and English.',
      dropzoneTitle: 'Drop SMS, payment QR code, or transfer screenshot',
      dropzoneSubtitle: 'Automatically decodes QR codes, shortened links, and Moroccan payment traps (PNG, JPG, WebP, or Ctrl+V)',
      orPaste: 'or type / paste the message, payment link, or details below',
      pastePlaceholder: 'E.g. CIH: Compte bloqué... / Sift lik l-code dial Wafacash... / bit.ly/amana-pay... / https://...',
      analyzeBtn: 'Verify Before Paying',
      analyzing: 'Evaluating financial threat vectors & strict payment rules...',
      trySample: 'Try 4 Moroccan financial scam scenarios:',
      samples: {
        cihBankSms: 'Fake CIH Bank SMS (Phishing)',
        otpForwarding: 'Wafacash OTP Theft (Darija)',
        amanaDeliveryFee: 'Fake Amana Fee 19.50 DH (Shortlink)',
        avitoBuyerOverpay: 'Avito Fake Buyer & Overpayment Trap',
        legitTransferNote: 'Legitimate Transfer Note (BCP)',
      },
      categoryLabel: 'Fraud Category:',
      categories: {
        fake_bank_sms: 'Fake Bank SMS (Bank Impersonation)',
        otp_request: 'Fraudulent OTP / Card Data Request',
        fake_delivery_fee: 'Fake Delivery Fee Scam (Amana / Barid)',
        fake_buyer_or_seller: 'Marketplace Fake Buyer or Seller',
        fake_payment_link_or_qr: 'Rogue Payment Link or QR Code',
        sim_swap_pretext: 'SIM Swap Pretext / Telco Impersonation',
        other: 'Other Financial Fraud Vector',
      },
      whatToDoNowTitle: 'What to do right now?',
      qrDestinationTitle: 'Decoded QR Code Destination',
      qrDestinationSub: 'Inspected before the verdict to expose hidden redirects and payment traps',
      flagLookalike: 'Suspicious bank look-alike domain detected',
      flagShortened: 'Shortened URL hiding real payment destination',
      flagUnknownDest: 'Unverified or untrusted payment endpoint',
      transcriptionTitle: 'Extracted visual and QR payload data',
      redFlagsTitle: 'Identified Payment Red Flags',
      whatToDoTitle: 'Recommended Protective Actions',
      reportToTitle: 'Official Reporting Contacts',
      resetBtn: 'Check Another Payment or Message',
      safeVerdict: 'No fraud signals detected',
      safeRiskBadge: 'Low Risk',
      suspiciousVerdict: 'Suspicious — Do Not Pay Without Verification',
      scamVerdict: 'Confirmed Financial Scam',
      confidence: 'Confidence Score',
      guardrailBadge: 'Enforced by Deterministic Guardrail',
      personalizationRiskBadge: 'Targeted Spear-Phishing Risk Detected',
      trust1: '15+ Moroccan scam patterns',
      trust2: '100% in-memory processing',
      trust3: 'Strict deterministic guardrails',
      tryImageSample: 'Test with an image:',
      demoBadge: 'Demonstration Example',
      removeImageBtn: 'Remove Image',
      decodedQrBanner: 'Decoded QR Code Destination:',
      analyzingSteps: {
        reading: 'Reading...',
        decoding: 'Decoding...',
        verdict: 'Verdict...',
      },
      imageSamples: {
        qrScam: {
          title: 'Trapped Payment QR',
          subtitle: 'Bank look-alike link (CIH)',
        },
        avitoChat: {
          title: 'Screenshot: Fake transfer (Avito)',
          subtitle: 'Buyer claiming accidental overpayment',
        },
        qrLegit: {
          title: 'Legitimate Payment QR',
          subtitle: 'Neutral merchant ticket without links',
        },
      },
    },
    b2b: {
      badge: 'API & FINTECH INTEGRATION',
      title: 'Kashif Pay for Banks & Fintechs',
      subtitle: 'Protect retail banking customers in real-time before they confirm any wire transfer, instant payment, or QR scan.',
      demoNotice: 'Demonstration Data — Hackathon sandbox environment',
      apiTitle: 'POST /api/v1/check API Specification',
      apiSub: 'Integrate the fraud detection engine in less than 10 lines of code inside your mobile banking flow.',
      endpointLabel: 'API Endpoint:',
      sampleReqTitle: 'Sample Request (JSON):',
      sampleResTitle: 'Kashif Pay Response (Real-Time):',
      mockDashboardTitle: 'Interbank Fraud Interception Console',
      mockTransfersBlocked: 'Fraudulent transfers prevented',
      mockAvgLatency: 'Median API Latency',
      mockAccuracy: 'Precision Rate',
      mockNotice: 'Demonstration Data',
      featuresTitle: 'Why Moroccan Financial Institutions Integrate Kashif Pay',
      feature1Title: 'Pre-Transfer Interception',
      feature1Desc: 'Real-time warning on the transfer review screen before funds leave the account, halting fake RIB and mule account scams.',
      feature2Title: 'Native Moroccan Darija NLP',
      feature2Desc: 'Understands Moroccan Arabic and Arabizi nuances, colloquial slang, and social engineering urgency pretexts.',
      feature3Title: 'Zero-Persistence & Data Sovereignty',
      feature3Desc: 'Ephemeral in-memory processing complying fully with Bank Al-Maghrib and CNDP regulatory requirements.',
      testBtn: 'Test Live API Endpoint',
      testingBtn: 'Calling API...',
      testSuccessNotice: 'API Call Succeeded: received 200 OK from Kashif Pay engine.',
    },
    benchmarks: {
      eyebrow: 'BENCHMARK & VALIDATION',
      title: 'Multi-Model Benchmark & Guardrail Matrix',
      subtitle: 'System validation across 40 certified test cases (banking smishing, lottery scams, legit 2FA, and exposure profiles).',
      runBtn: 'Run Full Benchmark',
      runningBtn: 'Running 40 live cases...',
      setHeldOut: '20 Held-Out Cases (Unseen)',
      setDev: '20 Dev Set Cases (Calibration)',
      accuracy: 'Global Accuracy',
      precision: 'Precision',
      recall: 'Recall',
      latencyAvg: 'Avg Latency',
      latencyP95: 'P95 Latency',
      guardrailPass: 'Guardrails Active',
      casesEvaluated: 'cases evaluated',
    },
    monitoring: {
      title: 'Live Telemetry & Observability',
      subtitle: 'Real-time telemetry of multi-provider routing, latencies, and deterministic guardrail triggers.',
      systemHealth: 'System Health',
      operational: 'Operational',
      totalRequests: 'Total Requests',
      avgLatency: 'Avg Latency',
      guardrailEnforcements: 'Guardrails Enforced',
      liveLogs: 'Recent Execution Logs',
    },
    common: {
      deleteSession: 'Purge Session',
      sessionDeleted: 'All in-memory session traces purged successfully.',
      aiNotice: 'AI models can make mistakes — always exercise ultimate judgment.',
      debugView: 'Developer Panel (?debug=1)',
      realExecution: 'Real measured execution',
    },
    qrCard: {
      title: 'QR Code Detected',
      decodedLabel: 'Decoded content:',
      warningText: 'Do not scan or open this link.',
      riskNoteUrl: 'This link may lead to a credential phishing page, fake payment trap, or malware.',
      riskNotePhone: 'This phone number could be premium-rate or linked to social engineering.',
      riskNoteWifi: 'An insecure Wi-Fi network configuration can expose your network traffic.',
      riskNoteText: 'This QR code contains raw text that may hide deceptive instructions.',
      kindLabels: {
        url: 'Web link',
        phone: 'Phone number',
        wifi: 'Wi-Fi network',
        text: 'Raw text',
      },
    },
  },
};
