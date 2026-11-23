import type { GroundingSource } from '../types/career';

export interface RawGroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export function extractGroundingSources(
  chunks: ReadonlyArray<RawGroundingChunk> | undefined,
  maxItems = 8
): GroundingSource[] {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const results: GroundingSource[] = [];

  for (const chunk of chunks) {
    const rawUri = chunk?.web?.uri?.trim();
    if (!rawUri) continue;

    let parsed: URL;
    try {
      parsed = new URL(rawUri);
    } catch {
      continue;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      continue;
    }

    const normalizedUri = parsed.toString();
    if (seen.has(normalizedUri)) {
      continue;
    }
    seen.add(normalizedUri);

    const domain = parsed.hostname.replace(/^www\./, '');
    const rawTitle = chunk?.web?.title?.trim();
    const title = rawTitle && rawTitle.length > 0 ? rawTitle : domain;

    results.push({
      title,
      uri: normalizedUri,
      domain,
    });

    if (results.length >= maxItems) {
      break;
    }
  }

  return results;
}
