import { createUnsupportedRestaurantProvider } from './restaurantReservationProvider.js';

export const squareAdapter = createUnsupportedRestaurantProvider({
  provider: 'square',
  category: 'pos',
});
