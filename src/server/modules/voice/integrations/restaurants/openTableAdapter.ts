import { createUnsupportedRestaurantProvider } from './restaurantReservationProvider.js';

export const openTableAdapter = createUnsupportedRestaurantProvider({
  provider: 'open_table',
  category: 'reservation',
});
