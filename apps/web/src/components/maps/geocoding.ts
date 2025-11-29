import { getCityFromAddressComponents, getCountryFromAddressComponents } from './utils';

export interface GeocodedLocation {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  country?: string;
}

export const reverseGeocode = async (
  lat: number,
  lng: number,
  languageCode: string
): Promise<GeocodedLocation | null> => {
  if (!window || !window.google || !window.google.maps) return null;

  const geocoder = new window.google.maps.Geocoder();

  try {
    const response = await geocoder.geocode({
      location: { lat, lng },
      language: languageCode,
    });

    if (response.results && response.results[0]) {
      const result = response.results[0];

      const addressComponents = result.address_components;
      const city = getCityFromAddressComponents(addressComponents);
      const country = getCountryFromAddressComponents(addressComponents);

      return {
        lat,
        lng,
        address: result.formatted_address || '',
        city,
        country,
      };
    }

    return null;
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return null;
  }
};

export const searchPlaces = async (
  query: string,
  centerLocation: { latitude: number; longitude: number },
  languageCode: string,
  radius = 50_000
) => {
  const response = await fetch(`https://places.googleapis.com/v1/places:autocomplete?languageCode=${languageCode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    },
    body: JSON.stringify({
      input: query,
      locationBias: {
        circle: {
          center: centerLocation,
          radius,
        },
      },
    }),
  });
  const data = await response.json();
  return data.suggestions || [];
};

export const getPlaceDetails = async (placeId: string, languageCode: string) => {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}?fields=location,formattedAddress,addressComponents&languageCode=${languageCode}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      },
    }
  );
  return await response.json();
};
