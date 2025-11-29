export interface RichCityData {
  location: { lat: number; lng: number };
  names: {
    en: string;
    az: string;
    ru: string;
    ar: string;
  };
  geoJson: any | null;
  googlePlaceId: string;
  countryCode: string;
}

/**
 * Fetches translations from Google and GeoJSON boundaries from OpenStreetMap
 */
export async function fetchRichCityData(placeId: string): Promise<RichCityData> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('Google Maps API Key missing');

  // 1. Fetch Basic Details (English) + Location
  // We need the Country Code to help Nominatim find the correct city
  const baseRes = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents,displayName&languageCode=en&key=${apiKey}`
  );
  const baseData = await baseRes.json();

  const lat = baseData.location.latitude;
  const lng = baseData.location.longitude;
  const nameEn = baseData.displayName?.text || '';

  // Extract Country Code for Nominatim accuracy (e.g., "AE" or "AZ")
  const countryComponent = baseData.addressComponents?.find((c: any) => c.types.includes('country'));
  const countryCode = countryComponent?.shortText || '';
  const countryName = countryComponent?.longText || '';

  // 2. Parallel Fetch for Translations (AZ, RU, AR)
  // We already have EN from baseData
  const langs = ['az', 'ru', 'ar'];
  const translationPromises = langs.map((lang) =>
    fetch(
      `https://places.googleapis.com/v1/places/${placeId}?fields=displayName&languageCode=${lang}&key=${apiKey}`
    ).then((res) => res.json())
  );

  // 3. Parallel Fetch for GeoJSON (Nominatim)
  // We search by City + Country to avoid ambiguity (e.g., "Baku" exists in multiple places?)
  const geoJsonPromise = fetch(
    `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(nameEn)}&country=${encodeURIComponent(countryName)}&format=geojson&polygon_geojson=1&limit=1`,
    {
      headers: { 'Accept-Language': 'en' }, // Force OSM to match against English name
    }
  )
    .then((res) => res.json())
    .catch(() => []);

  // Execute all
  const [azData, ruData, arData] = await Promise.all(translationPromises);
  const osmData = await geoJsonPromise;

  // 4. Process GeoJSON
  let geoJson = null;
  if (Array.isArray(osmData) && osmData.length > 0) {
    // Nominatim returns a feature collection or array of matches.
    // We take the one that is a 'boundary' or just the first highly relevant one.
    geoJson = osmData[0].geojson;
  }

  return {
    googlePlaceId: placeId,
    countryCode,
    location: { lat, lng },
    names: {
      en: nameEn,
      az: azData.displayName?.text || nameEn,
      ru: ruData.displayName?.text || nameEn,
      ar: arData.displayName?.text || nameEn,
    },
    geoJson,
  };
}
