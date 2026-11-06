import JSZip from 'jszip';
import exifr from 'exifr';
import { FullExportData, LocationTimelineItem, ExposureReport, ExposureImageAnalysis } from './types.ts';
import { analyzeExposureImage, computeFinancialAttackProfile } from './exposure.ts';
import { maskPII } from './masking.ts';

// Helper to safely parse JSON from UTF-8 string or fix Instagram's latin1/utf8 escaped text
function parseInstagramJson(rawStr: string): any {
  try {
    // Instagram exports sometimes encode UTF-8 as escaped latin1 bytes \u00e9 etc.
    const parsed = JSON.parse(rawStr);
    return parsed;
  } catch (err) {
    return null;
  }
}

// Decode Instagram's escaped UTF-8 strings if needed
function fixIgEncoding(str: string): string {
  if (!str) return '';
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

export async function parseSocialArchiveZip(zipBuffer: Buffer): Promise<{
  exportData: FullExportData;
  photos: Array<{ buffer: Buffer; name: string; mimeType: string }>;
}> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBuffer);

  const fileNames = Object.keys(loadedZip.files);
  const rawFileTree = fileNames.slice(0, 50);

  let platform: FullExportData['platform'] = 'generic';
  if (fileNames.some((f) => f.includes('instagram') || f.includes('personal_information'))) {
    platform = 'instagram';
  } else if (fileNames.some((f) => f.includes('facebook') || f.includes('your_facebook_activity'))) {
    platform = 'facebook';
  } else if (fileNames.some((f) => f.includes('tiktok') || f.includes('user_data'))) {
    platform = 'tiktok';
  }

  const exportData: FullExportData = {
    platform,
    account: {
      username: '',
    },
    captions_history: [],
    comments_history: [],
    search_history: [],
    location_timeline: [],
    ad_interests: [],
    total_posts_found: 0,
    total_comments_found: 0,
    total_searches_found: 0,
    total_photos_found: 0,
    analyzed_photos_count: 0,
    raw_file_tree: rawFileTree,
  };

  const imageFiles: Array<{ name: string; file: JSZip.JSZipObject }> = [];

  for (const [relativePath, file] of Object.entries(loadedZip.files)) {
    if (file.dir) continue;
    const lower = relativePath.toLowerCase();

    // 1. Account / Profile Info
    if (
      lower.includes('personal_information.json') ||
      lower.includes('profile_information.json') ||
      lower.includes('account_information.json') ||
      lower.endsWith('profile.json')
    ) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        if (json) {
          const profileObj = json.profile_user?.[0]?.string_map_data || json;
          exportData.account.username =
            profileObj['Username']?.value ||
            json.username ||
            profileObj['Nom d’utilisateur']?.value ||
            exportData.account.username;
          exportData.account.full_name =
            profileObj['Name']?.value || json.name || profileObj['Nom']?.value;
          exportData.account.bio =
            profileObj['Bio']?.value || json.bio || profileObj['Biographie']?.value;
          exportData.account.email =
            profileObj['Email']?.value || json.email || profileObj['Adresse e-mail']?.value;
          exportData.account.phone =
            profileObj['Phone Number']?.value || json.phone_number || profileObj['Numéro de téléphone']?.value;
          exportData.account.created_at =
            profileObj['Date joined']?.value || json.registration_date || 'Past history';
        }
      } catch (e) {
        console.warn('Error parsing profile json:', e);
      }
    }

    // 2. Posts and Captions
    if (lower.includes('posts_') && lower.endsWith('.json') || lower.includes('content/posts') && lower.endsWith('.json')) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        if (Array.isArray(json)) {
          exportData.total_posts_found += json.length;
          for (const item of json) {
            const mediaList = item.media || [item];
            for (const m of mediaList) {
              const caption = fixIgEncoding(m.title || item.title || m.caption || '');
              const timestamp = m.creation_timestamp
                ? new Date(m.creation_timestamp * 1000).toISOString().split('T')[0]
                : undefined;
              const locationName = m.location_data?.name || m.location;

              if (caption) {
                exportData.captions_history.push({
                  text: caption,
                  timestamp,
                  location_name: locationName,
                });
              }

              if (locationName) {
                exportData.location_timeline.push({
                  timestamp: timestamp || 'Publication passée',
                  name: locationName,
                  city: locationName.includes(',') ? locationName.split(',')[0].trim() : undefined,
                  source: 'Instagram Post Location Tag',
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing posts json:', e);
      }
    }

    // 3. Comments History
    if (lower.includes('comments') && lower.endsWith('.json')) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        const commentsList = json.comments_post_comments || json.post_comments || (Array.isArray(json) ? json : []);
        if (Array.isArray(commentsList)) {
          exportData.total_comments_found += commentsList.length;
          for (const c of commentsList.slice(0, 50)) {
            const commentText =
              c.string_map_data?.Comment?.value ||
              c.data?.[0]?.comment?.comment ||
              c.comment ||
              '';
            const timestamp = c.string_map_data?.Comment?.timestamp
              ? new Date(c.string_map_data.Comment.timestamp * 1000).toISOString().split('T')[0]
              : undefined;
            if (commentText) {
              exportData.comments_history.push({
                text: fixIgEncoding(commentText),
                timestamp,
                to_account: c.title || undefined,
              });
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing comments json:', e);
      }
    }

    // 4. Search History
    if (lower.includes('searches') && lower.endsWith('.json') || lower.includes('recent_searches.json')) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        const searches = json.searches_user || json.recent_searches || (Array.isArray(json) ? json : []);
        if (Array.isArray(searches)) {
          exportData.total_searches_found += searches.length;
          for (const s of searches.slice(0, 30)) {
            const query = s.string_map_data?.Search?.value || s.search_click || s.query;
            const timestamp = s.string_map_data?.Search?.timestamp
              ? new Date(s.string_map_data.Search.timestamp * 1000).toISOString().split('T')[0]
              : undefined;
            if (query) {
              exportData.search_history.push({ query: fixIgEncoding(query), timestamp });
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing searches json:', e);
      }
    }

    // 5. Explicit Location History
    if (lower.includes('location_history.json') || lower.includes('past_instagram_insights') || lower.includes('device_locations')) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        const locations = json.location_history || (Array.isArray(json) ? json : []);
        if (Array.isArray(locations)) {
          for (const loc of locations) {
            const name = loc.name || loc.city || loc.string_map_data?.Location?.value || 'Emplacement enregistré';
            const timestamp = loc.timestamp || loc.string_map_data?.Time?.timestamp;
            const dateStr = timestamp
              ? new Date(timestamp * 1000).toISOString().split('T')[0]
              : 'Historique de connexion';
            exportData.location_timeline.push({
              timestamp: dateStr,
              name,
              lat: loc.latitude,
              lon: loc.longitude,
              source: 'Instagram Device & Session Tracking',
            });
          }
        }
      } catch (e) {
        console.warn('Error parsing location history json:', e);
      }
    }

    // 6. Ad Interests & Profiling
    if (lower.includes('ads_interests') || lower.includes('topics_your_activity_suggests')) {
      try {
        const content = await file.async('string');
        const json = parseInstagramJson(content);
        const topics = json.inferred_data_ig_interests || json.topics || (Array.isArray(json) ? json : []);
        if (Array.isArray(topics)) {
          for (const t of topics.slice(0, 20)) {
            const topicName = t.string_map_data?.Name?.value || t.name || t;
            if (typeof topicName === 'string') {
              exportData.ad_interests.push(fixIgEncoding(topicName));
            }
          }
        }
      } catch (e) {
        console.warn('Error parsing ad interests json:', e);
      }
    }

    // 7. Image files collection
    if (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.webp')
    ) {
      exportData.total_photos_found += 1;
      imageFiles.push({ name: relativePath, file });
    }
  }

  // Pick up to 20 most relevant photos to analyze
  const selectedPhotos: Array<{ buffer: Buffer; name: string; mimeType: string }> = [];
  const limitPhotos = Math.min(imageFiles.length, 20);

  for (let i = 0; i < limitPhotos; i++) {
    const item = imageFiles[i];
    try {
      const buf = await item.file.async('nodebuffer');
      const ext = item.name.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      selectedPhotos.push({
        buffer: buf,
        name: item.name.split('/').pop() || `photo_${i + 1}.jpg`,
        mimeType,
      });
    } catch (err) {
      console.warn('Could not extract image buffer:', err);
    }
  }

  exportData.analyzed_photos_count = selectedPhotos.length;

  return {
    exportData,
    photos: selectedPhotos,
  };
}

// Compile a comprehensive full-export exposure report
export async function compileFullExportReport(
  exportData: FullExportData,
  photos: Array<{ buffer: Buffer; name: string; mimeType: string }>,
  verifiedViaEmail = false,
  totalLatencyMs = 2400
): Promise<ExposureReport> {
  let score = 0; // Deterministic calculation calibrated to risk factors
  const findings: ExposureReport['findings'] = [];
  const imageAnalyses: ExposureImageAnalysis[] = [];

  const username = exportData.account.username || 'Utilisateur';

  // 1. Phone number (Critical smishing / SIM swapping vector: +18)
  if (exportData.account.phone && exportData.account.phone.trim().length > 0) {
    score += 18;
    findings.push({
      category: 'contact_leakage',
      severity: 'critical',
      title: 'Numéro de téléphone mobile lié au profil',
      detail: `Numéro "${maskPII(exportData.account.phone)}" exposé dans les données techniques. Vecteur direct pour les attaques de Smishing (SMS phishing) et tentative de SIM swap.`,
      where_seen: 'Export JSON: personal_information.json',
      weight_points: 18,
    });
  }

  // 2. Email address (+8)
  if (exportData.account.email && exportData.account.email.trim().length > 0) {
    score += 8;
    findings.push({
      category: 'contact_leakage',
      severity: 'high',
      title: 'Email personnel présent dans les métadonnées du compte',
      detail: `Adresse email "${maskPII(exportData.account.email)}" trouvée dans l'export. Utilisable pour du credential stuffing ou tentatives de récupération de compte.`,
      where_seen: 'Export JSON: personal_information.json',
      weight_points: 8,
    });
  }

  // 3. Bio & Identifiers (+4 to +28)
  if (exportData.account.bio && exportData.account.bio.trim().length > 0) {
    const bioText = exportData.account.bio;
    const hasCin = /CIN|#BK|\b[A-Z]{1,2}\d{5,7}\b/i.test(bioText);
    const hasWork = /@|technopark|fintech|ocp|attijariwafa|maroc telecom|alstom|um6p|engineer|manager|director/i.test(bioText);
    const hasFamily = /dad|mom|père|mère|enfants|kids|papa|maman/i.test(bioText);

    if (hasCin) {
      score += 20;
      findings.push({
        category: 'visible_documents',
        severity: 'critical',
        title: 'Numéro de CIN ou document officiel dans la biographie',
        detail: `Le numéro de pièce d'identité apparaît en clair dans votre biographie : "${maskPII(bioText)}".`,
        where_seen: 'Export JSON: profile.json',
        weight_points: 20,
      });
    }

    if (hasWork || hasFamily) {
      score += 8;
      findings.push({
        category: 'workplace_or_school',
        severity: 'medium',
        title: 'Affiliation professionnelle ou situation familiale dans la bio',
        detail: `Détails visibles : "${maskPII(bioText)}". Permet d'alimenter un scénario d'ingénierie sociale ciblé.`,
        where_seen: 'Export JSON: profile.json',
        weight_points: 8,
      });
    } else if (!hasCin) {
      score += 4;
      findings.push({
        category: 'profile_bio',
        severity: 'low',
        title: 'Historique de biographie publique',
        detail: `Contenu : "${maskPII(bioText)}".`,
        where_seen: 'Export JSON: profile.json',
        weight_points: 4,
      });
    }
  }

  // 4. Location Timeline (+8 to +22)
  if (exportData.location_timeline && exportData.location_timeline.length > 0) {
    const locCount = exportData.location_timeline.length;
    const hasDeviceTracking = exportData.location_timeline.some(
      (l) => l.source?.includes('Device') || l.source?.includes('Session') || (l.lat && l.lon)
    );

    let locPoints = 8;
    let locSeverity: 'medium' | 'high' | 'critical' = 'medium';
    let locTitle = `Historique de géolocalisation (${locCount} lieu(x) public(s) répertorié(s))`;

    if (hasDeviceTracking || locCount >= 5) {
      locPoints = 22;
      locSeverity = 'critical';
      locTitle = `Traçage géographique intensif (${locCount} lieux et sessions tracés)`;
    } else if (locCount >= 3) {
      locPoints = 12;
      locSeverity = 'high';
      locTitle = `Historique de déplacements récurrents (${locCount} lieux répertoriés)`;
    }

    score += locPoints;
    const topLocations = exportData.location_timeline
      .slice(0, 3)
      .map((l) => `${l.name} (${l.timestamp})`)
      .join(', ');

    findings.push({
      category: 'geographic_location',
      severity: locSeverity,
      title: locTitle,
      detail: `L'export révèle vos déplacements : ${topLocations}.`,
      where_seen: 'Export JSON: location_history & tagged posts',
      weight_points: locPoints,
    });
  }

  // 5. Search History (+6 to +14)
  if (exportData.search_history && exportData.search_history.length > 0) {
    const sensitiveRegex = /cin|passeport|opposition|carte|guichet|crèche|garderie|amana|virement|banque|police/i;
    const sensitiveSearches = exportData.search_history.filter((s) => sensitiveRegex.test(s.query));

    if (sensitiveSearches.length > 0) {
      score += 14;
      const sample = sensitiveSearches.slice(0, 3).map((s) => `"${maskPII(s.query)}"`).join(', ');
      findings.push({
        category: 'search_intent',
        severity: 'high',
        title: `Recherches sensibles et démarches privées (${sensitiveSearches.length} requêtes critiques)`,
        detail: `Requêtes sensibles conservées : ${sample}. Révèle des démarches administratives, bancaires ou familiales exploitables pour des prétextes d'urgence.`,
        where_seen: 'Export JSON: recent_searches.json',
        weight_points: 14,
      });
    } else {
      score += 6;
      const sample = exportData.search_history.slice(0, 3).map((s) => `"${s.query}"`).join(', ');
      findings.push({
        category: 'search_intent',
        severity: 'low',
        title: `Historique de requêtes de recherche (${exportData.search_history.length} requêtes)`,
        detail: `Recherches d'intérêt général : ${sample}.`,
        where_seen: 'Export JSON: recent_searches.json',
        weight_points: 6,
      });
    }
  }

  // 6. Comments History (+4 to +12)
  if (exportData.comments_history && exportData.comments_history.length > 0) {
    const familyRegex = /pédiatre|crèche|bébé|enfant|fils|fille|famille|maman|papa/i;
    const workRegex = /bureau|sprint|collègue|8h30|demain matin|réunion|client|boulot/i;

    const hasFamily = exportData.comments_history.some((c) => familyRegex.test(c.text));
    const hasWork = exportData.comments_history.some((c) => workRegex.test(c.text));

    if (hasFamily) {
      score += 12;
      findings.push({
        category: 'minor_presence',
        severity: 'high',
        title: 'Cercle familial et proches révélés dans les commentaires',
        detail: `Des commentaires publics font référence à votre entourage familial ou enfants (pédiatre, crèche).`,
        where_seen: 'Export JSON: post_comments_1.json',
        weight_points: 12,
      });
    } else if (hasWork) {
      score += 8;
      findings.push({
        category: 'social_connections',
        severity: 'medium',
        title: 'Horaires et relations professionnelles dans les commentaires',
        detail: `Des commentaires font référence à vos collègues et horaires de présence au bureau.`,
        where_seen: 'Export JSON: post_comments_1.json',
        weight_points: 8,
      });
    } else {
      score += 4;
      findings.push({
        category: 'social_connections',
        severity: 'low',
        title: `Commentaires et interactions publiques (${exportData.comments_history.length} commentaires)`,
        detail: `Vos interactions publiques révèlent votre réseau de contacts.`,
        where_seen: 'Export JSON: post_comments_1.json',
        weight_points: 4,
      });
    }
  }

  // 7. Ad Interests (+2 to +5)
  if (exportData.ad_interests && exportData.ad_interests.length > 0) {
    const financialRegex = /banque|crédit|immobilier|leasing|finance/i;
    const hasFinancial = exportData.ad_interests.some((a) => financialRegex.test(a));

    if (hasFinancial) {
      score += 5;
      findings.push({
        category: 'behavioral_profiling',
        severity: 'medium',
        title: `Profilage publicitaire financier (${exportData.ad_interests.length} centres d'intérêt)`,
        detail: `Catégories déduites par la plateforme : ${exportData.ad_interests.slice(0, 4).join(', ')}.`,
        where_seen: 'Export JSON: ads_interests.json',
        weight_points: 5,
      });
    } else {
      score += 2;
      findings.push({
        category: 'behavioral_profiling',
        severity: 'low',
        title: `Centres d'intérêt publicitaires (${exportData.ad_interests.length} centres)`,
        detail: `Intérêts généraux : ${exportData.ad_interests.slice(0, 4).join(', ')}.`,
        where_seen: 'Export JSON: ads_interests.json',
        weight_points: 2,
      });
    }
  }

  // 8. Vision Analysis on Photos (capped at 20)
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    try {
      const analysis = await analyzeExposureImage(p.buffer, p.mimeType, i, username);
      imageAnalyses.push(analysis);

      // Check for GPS EXIF in photos
      if (analysis.exif_data?.has_exif && analysis.exif_data.gps) {
        score += 25;
        findings.push({
          category: 'metadata_gps',
          severity: 'critical',
          title: `Coordonnées GPS exactes dans l'image ${p.name}`,
          detail: `Lat: ${analysis.exif_data.gps.latitude.toFixed(4)}, Lon: ${analysis.exif_data.gps.longitude.toFixed(4)}. Vos coordonnées spatiales brutes étaient incrustées dans le fichier.`,
          where_seen: `Photo exportée : ${p.name}`,
          weight_points: 25,
        });

        exportData.location_timeline.push({
          timestamp: analysis.exif_data.timestamp || 'Photo EXIF',
          name: `Coordonnées précises (${analysis.exif_data.gps.latitude.toFixed(3)}, ${analysis.exif_data.gps.longitude.toFixed(3)})`,
          lat: analysis.exif_data.gps.latitude,
          lon: analysis.exif_data.gps.longitude,
          source: `EXIF GPS Photo (${p.name})`,
        });
      }

      if (analysis.documents_visible.length > 0) {
        score += 25;
        findings.push({
          category: 'visible_documents',
          severity: 'critical',
          title: `Document ou badge officiel visible dans ${p.name}`,
          detail: `Document détecté : ${analysis.documents_visible.map((d) => d.type).join(', ')}. Risque critique d'usurpation d'identité ou fraude bancaire.`,
          where_seen: `Photo exportée : ${p.name}`,
          weight_points: 25,
        });
      }
    } catch (e) {
      console.warn('Error analyzing export photo:', e);
    }
  }

  // Sort location timeline chronologically (or reverse)
  exportData.location_timeline.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  let level: ExposureReport['level'] = 'low';
  if (score >= 76) level = 'critical';
  else if (score >= 51) level = 'high';
  else if (score >= 26) level = 'medium';

  // Realistic Attack Paths based on actual findings
  const attack_paths: ExposureReport['attack_paths'] = [];

  const hasPhone = !!exportData.account.phone;
  const hasWork = findings.some((f) => f.category === 'workplace_or_school');
  const hasLoc = findings.some((f) => f.category === 'geographic_location' || f.category === 'metadata_gps');
  const hasFamily = findings.some((f) => f.category === 'minor_presence');
  const hasDoc = findings.some((f) => f.category === 'visible_documents');

  if (hasDoc) {
    attack_paths.push({
      title: "Usurpation d'identité et SIM swapping via pièce d'identité",
      description:
        "L'exposition du numéro de CIN ou d'un badge officiel permet à un fraudeur de contacter votre opérateur télécom ou support bancaire pour initier une réinitialisation de mot de passe frauduleuse.",
      exploited_clues: findings.filter((f) => f.category === 'visible_documents').map((f) => f.title),
    });
  }

  if (hasPhone && hasLoc) {
    attack_paths.push({
      title: "Smishing ciblé de fausse livraison ou colis Amana / Barid",
      description:
        `En combinant votre numéro de téléphone mobile et vos zones de déplacement récentes (${exportData.location_timeline[0]?.name || 'votre ville'}), un escroc envoie un SMS prétendant un colis bloqué réclamant des frais de dédouanement.`,
      exploited_clues: ['Numéro de mobile lié', 'Lieux et sessions récents'],
    });
  }

  if (hasFamily) {
    attack_paths.push({
      title: "Arnaque à la fausse urgence familiale / crèche",
      description:
        "Un escroc exploitant les mentions de pédiatre ou de garde d'enfants contacte la victime en prétendant une urgence médicale immédiate nécessitant un virement rapide.",
      exploited_clues: ['Cercle familial révélé', 'Recherche de garde d\'enfants'],
    });
  }

  if (hasWork && hasPhone) {
    attack_paths.push({
      title: "Spear-phishing par usurpation de relation professionnelle",
      description:
        "Un attaquant se faisant passer pour un cadre ou collègue contacte la victime en exploitant son affiliation professionnelle et ses horaires habituels.",
      exploited_clues: ['Affiliation professionnelle', 'Numéro de mobile'],
    });
  }

  if (attack_paths.length === 0) {
    attack_paths.push({
      title: "Reconnaissance passive et hameçonnage opportuniste",
      description:
        "Votre profil présente une surface d'attaque très réduite. Le risque principal reste le phishing générique non ciblé exploitant votre pseudonyme public.",
      exploited_clues: ['Pseudonyme public'],
    });
  }

  // Actionable prioritized checklist based on actual findings
  const fix_checklist: ExposureReport['fix_checklist'] = [];
  let prio = 1;

  if (hasDoc) {
    fix_checklist.push({
      priority: prio++,
      action: "Supprimer immédiatement toute mention de numéro de CIN ou badge officiel de votre profil",
      reason: "Les identifiants officiels sont irréversibles et permettent des usurpations d'identité bancaires et administratives.",
    });
  }

  if (hasPhone) {
    fix_checklist.push({
      priority: prio++,
      action: "Retirer votre numéro de téléphone mobile des données de profil et métadonnées publiques",
      reason: "Le numéro de mobile est le vecteur privilégié des attaques par SMS frauduleux (Smishing) et vol de carte SIM.",
    });
  }

  if (hasLoc) {
    fix_checklist.push({
      priority: prio++,
      action: "Désactiver la géolocalisation précise et purger l'historique des lieux enregistrés",
      reason: "Dans Réglages → Autorisations, coupez l'accès à la position en arrière-plan pour stopper l'enregistrement passif de vos déplacements.",
    });
  }

  if (findings.some((f) => f.category === 'search_intent')) {
    fix_checklist.push({
      priority: prio++,
      action: "Effacer l'historique des recherches récentes dans le Centre de Comptes",
      reason: "Votre historique de recherche reste conservé sur les serveurs de la plateforme tant qu'il n'est pas manuellement vidé.",
    });
  }

  if (hasFamily) {
    fix_checklist.push({
      priority: prio++,
      action: "Restreindre les publications et commentaires mentionnant des enfants à vos amis proches",
      reason: "Protège les mineurs contre les scénarios d'extorsion émotionnelle ou d'urgence familiale simulée.",
    });
  }

  if (hasWork) {
    fix_checklist.push({
      priority: prio++,
      action: "Éviter de mentionner vos horaires d'arrivée ou logos d'entreprise dans les publications",
      reason: "Limite les attaques ciblées se faisant passer pour les ressources humaines ou un service informatique.",
    });
  }

  fix_checklist.push({
    priority: prio++,
    action: "Activer l'authentification à deux facteurs (2FA) via une application d'authentification",
    reason: "Protège l'accès à votre compte même en cas de compromission d'identifiants.",
  });

  return {
    score,
    level,
    images_analyzed: photos.length,
    findings,
    attack_paths: attack_paths.slice(0, 3),
    fix_checklist: fix_checklist.slice(0, 8),
    financial_attack_profile: computeFinancialAttackProfile(findings, imageAnalyses, username),
    per_image_results: imageAnalyses,
    provider_used: 'Local deterministic JSON parser + Vision model',
    model_used: 'gemini-3.1-flash-lite',
    total_latency_ms: totalLatencyMs,
    verified_via_email: verifiedViaEmail,
    claimed_username: username,
    is_full_export: true,
    export_platform: exportData.platform === 'generic' ? 'instagram' : exportData.platform,
    export_summary: {
      total_posts: exportData.total_posts_found || exportData.captions_history.length,
      total_comments: exportData.total_comments_found || exportData.comments_history.length,
      total_searches: exportData.total_searches_found || exportData.search_history.length,
      total_photos: exportData.total_photos_found,
      photos_analyzed: exportData.analyzed_photos_count,
      account_created: exportData.account.created_at,
    },
    location_timeline: exportData.location_timeline,
    search_history_highlights: exportData.search_history.slice(0, 10).map((s) => s.query),
    comments_highlights: exportData.comments_history.slice(0, 8),
    ad_interests: exportData.ad_interests,
  };
}
