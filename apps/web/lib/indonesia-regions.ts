export interface RegionItem {
  id: string;
  name: string;
  displayName: string;
}

const cache: Record<string, RegionItem[]> = {};

export function formatRegionName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => {
      const upper = word.toUpperCase();
      if (['DKI', 'DI', 'D.I.', 'D.K.I.'].includes(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export async function fetchProvinces(): Promise<RegionItem[]> {
  const cacheKey = 'provinces';
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch('https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json');
    if (!res.ok) throw new Error('Failed to fetch provinces');
    const data: Array<{ id: string; name: string }> = await res.json();
    const items = data.map((d) => ({
      id: d.id,
      name: d.name,
      displayName: formatRegionName(d.name),
    }));
    cache[cacheKey] = items;
    return items;
  } catch (err) {
    console.warn('Fallback to static provinces', err);
    return [];
  }
}

export async function fetchRegencies(provinceId: string): Promise<RegionItem[]> {
  if (!provinceId) return [];
  const cacheKey = `regencies_${provinceId}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
    if (!res.ok) throw new Error('Failed to fetch regencies');
    const data: Array<{ id: string; province_id: string; name: string }> = await res.json();
    const items = data.map((d) => ({
      id: d.id,
      name: d.name,
      displayName: formatRegionName(d.name),
    }));
    cache[cacheKey] = items;
    return items;
  } catch (err) {
    console.warn('Failed to fetch regencies', err);
    return [];
  }
}

export async function fetchDistricts(regencyId: string): Promise<RegionItem[]> {
  if (!regencyId) return [];
  const cacheKey = `districts_${regencyId}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    const data: Array<{ id: string; regency_id: string; name: string }> = await res.json();
    const items = data.map((d) => ({
      id: d.id,
      name: d.name,
      displayName: formatRegionName(d.name),
    }));
    cache[cacheKey] = items;
    return items;
  } catch (err) {
    console.warn('Failed to fetch districts', err);
    return [];
  }
}

/**
 * Fuzzy match GPS/Nominatim names against official Kemendagri region lists
 */
export function findMatchingRegion(
  targetName: string,
  list: RegionItem[]
): RegionItem | undefined {
  if (!targetName || !list || list.length === 0) return undefined;
  const cleanTarget = targetName
    .toLowerCase()
    .replace(/^(kota|kabupaten|kab\.|provinsi|kecamatan|kelurahan|desa)\s+/i, '')
    .replace(/\s+/g, '')
    .trim();

  // 1. Exact or stripped match
  const match = list.find((item) => {
    const cleanItem = item.name
      .toLowerCase()
      .replace(/^(kota|kabupaten|kab\.|provinsi|kecamatan|kelurahan|desa)\s+/i, '')
      .replace(/\s+/g, '')
      .trim();
    return cleanItem === cleanTarget || cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem);
  });

  return match;
}
