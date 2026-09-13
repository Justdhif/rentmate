export interface GeocodeLocationResult {
  lat: number;
  lng: number;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

/**
 * High-accuracy multi-tier reverse geocoder for Indonesian locations.
 * Tier 1: Nominatim OpenStreetMap (Full street name, building, RT/RW, village, district)
 * Tier 2: Photon Komoot OSM (Fast, CORS-permissive, rich street data)
 * Tier 3: BigDataCloud (Administrative level fallback)
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<GeocodeLocationResult> {
  // 1. Primary: Nominatim OpenStreetMap
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'id,en', 'User-Agent': 'Rentmate-App/1.0' },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      const road = addr.road || addr.pedestrian || addr.building || addr.footway || addr.path || '';
      const houseNumber = addr.house_number ? `No. ${addr.house_number}` : '';
      const village = addr.village || addr.suburb || addr.neighbourhood || addr.quarter || '';
      let city = addr.city || addr.town || addr.county || addr.city_district || '';
      let province = addr.state || '';
      const postalCode = addr.postcode || '';

      // Special handling for DKI Jakarta
      if (!province && (city.includes('Jakarta') || addr.state?.includes('Jakarta'))) {
        province = 'DKI Jakarta';
        if (addr.city_district) city = addr.city_district;
      } else if (city === 'Daerah Khusus Ibukota Jakarta') {
        province = 'DKI Jakarta';
        city = addr.city_district || 'Jakarta';
      }

      const roadPart = [road, houseNumber].filter(Boolean).join(' ');
      const detailedParts = [
        roadPart,
        village,
        addr.city_district,
        city,
        province,
      ].filter(Boolean);

      const uniqueParts = detailedParts.filter((item, idx, arr) => arr.indexOf(item) === idx);
      const cleanDisplay = data.display_name
        ? data.display_name.replace(/, Indonesia$/i, '').trim()
        : '';

      const formattedAddress = uniqueParts.length >= 2 ? uniqueParts.join(', ') : cleanDisplay;

      if (formattedAddress) {
        return {
          lat,
          lng,
          address: formattedAddress,
          city,
          province,
          postalCode,
        };
      }
    }
  } catch {
    // Continue to Tier 2
  }

  // 2. Secondary: Photon (Komoot OSM - reliable, fast, CORS enabled)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const p = data.features?.[0]?.properties;
      if (p) {
        const road = p.street || '';
        const houseNumber = p.housenumber ? `No. ${p.housenumber}` : '';
        const roadPart = [road, houseNumber].filter(Boolean).join(' ');
        const village = p.district || p.suburb || '';
        let city = p.city?.replace(/^Kelurahan\s+/i, '') || p.county || '';
        let province = p.state || '';
        const postalCode = p.postcode || '';

        if (!province && city.includes('Jakarta')) {
          province = 'DKI Jakarta';
        }

        const parts = [
          p.name && p.name !== road ? p.name : '',
          roadPart,
          village,
          city,
          province,
        ].filter(Boolean);
        const uniqueParts = parts.filter((item, idx, arr) => arr.indexOf(item) === idx);
        const formattedAddress = uniqueParts.join(', ');

        if (formattedAddress) {
          return {
            lat,
            lng,
            address: formattedAddress,
            city,
            province,
            postalCode,
          };
        }
      }
    }
  } catch {
    // Continue to Tier 3
  }

  // 3. Fallback: BigDataCloud (Reliable CORS, with fixed admin levels)
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
    );
    if (res.ok) {
      const bdcData = await res.json();
      const adminList = bdcData.localityInfo?.administrative || [];
      const provinceObj =
        adminList.find((a: any) => a.adminLevel === 4) ||
        adminList.find((a: any) => a.order === 7);
      const province = provinceObj?.name || bdcData.principalSubdivision || '';

      const cityObj = adminList.find((a: any) => a.adminLevel === 5 || a.adminLevel === 8);
      const city = cityObj?.name || bdcData.city || '';

      const subDistrictObj =
        adminList.find((a: any) => a.adminLevel === 9) || bdcData.locality;
      const locality = subDistrictObj?.name || bdcData.locality || '';
      const postalCode = bdcData.postcode || '';

      const parts = [locality, city, province].filter(Boolean);
      return {
        lat,
        lng,
        address: parts.join(', ') || `Titik Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
        city,
        province,
        postalCode,
      };
    }
  } catch {
    // Fail-safe
  }

  return {
    lat,
    lng,
    address: `Titik Koordinat [${lat.toFixed(5)}, ${lng.toFixed(5)}]`,
    city: '',
    province: '',
    postalCode: '',
  };
}
