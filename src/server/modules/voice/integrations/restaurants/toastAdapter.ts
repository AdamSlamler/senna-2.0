import { createUnsupportedRestaurantProvider } from './restaurantReservationProvider.js';

export const toastAdapter = createUnsupportedRestaurantProvider({
  provider: 'toast',
  category: 'pos',
});
