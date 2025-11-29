export const getCityFromAddressComponents = (
  addressComponents: google.maps.GeocoderAddressComponent[]
): string | undefined => {
  return (
    addressComponents.find((c) => c.types.includes('locality'))?.long_name ||
    addressComponents.find((c) => c.types.includes('administrative_area_level_1'))?.long_name
  );
};

export const getCountryFromAddressComponents = (
  addressComponents: google.maps.GeocoderAddressComponent[]
): string | undefined => {
  return addressComponents.find((c) => c.types.includes('country'))?.long_name;
};
