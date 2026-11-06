/**
 * Privacy-first PII masking helper.
 * Mask phone numbers, Moroccan CINs, emails, and bank cards in outputs.
 */

export function maskPII(text: string): string {
  if (!text) return text;

  let masked = text;

  // Mask Moroccan phone numbers (+212 or 06/07) as +212 6•• •• •• 82
  masked = masked.replace(/(?:(?:\+|00)212[\s.-]?|0)([5-7])(?:\d[\s.-]?){6}(\d{2})/g, (match, prefix, last2) => {
    return match.includes('212') ? `+212 ${prefix}•• •• •• ${last2}` : `0${prefix}•• •• •• ${last2}`;
  });
  masked = masked.replace(/(?:(?:\+|00)212|0)([5-7]\d)(\d{4})(\d{2,4})/g, (match, p1, p2, p3) => {
    const last2 = p3.slice(-2);
    const op = p1.charAt(0);
    return match.includes('212') ? `+212 ${op}•• •• •• ${last2}` : `0${op}•• •• •• ${last2}`;
  });

  // Mask email addresses
  masked = masked.replace(/([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, (match, firstLetter, domain) => {
    return `${firstLetter}***@${domain}`;
  });

  // Mask Moroccan CIN (e.g., AB123456, BK987654)
  masked = masked.replace(/\b([A-Z]{1,2})(\d{2})\d{2,4}(\d{2})\b/g, '$1$2****$3');

  // Mask Credit Cards / RIB (16 to 24 digits with spaces/hyphens)
  masked = masked.replace(/\b(\d{4})[\s-]?(?:\d{4}[\s-]?){2,4}(\d{4})\b/g, '$1 **** **** $2');

  return masked;
}
