import { createUnsupportedRestaurantProvider } from './restaurantReservationProvider.js';

export const cloverAdapter = createUnsupportedRestaurantProvider({
  provider: 'clover',
  category: 'pos',
});
