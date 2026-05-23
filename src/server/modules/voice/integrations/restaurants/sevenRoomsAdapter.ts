import { createUnsupportedRestaurantProvider } from './restaurantReservationProvider.js';

export const sevenRoomsAdapter = createUnsupportedRestaurantProvider({
  provider: 'seven_rooms',
  category: 'reservation',
});
