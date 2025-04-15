import { find, insert, update, remove } from './database.js';

export const getAllTrips = async () => {
  const trips = await find('trips');
  return trips;
}

export const getTripsByUserId = async (idUser) => {
  const trips = await find('trips', { idUser: idUser });
  return trips;
}

export const addTrip = async (trip) => {
  const newTrip = await insert('trips', trip);
  return newTrip;
}

export const updateTrip = async (query, data) => {
  const updatedTrip = await update('trips', query, data);
  return updatedTrip;
}

export const deleteTrip = async (query) => {
  const deletedTrip = await remove('trips', query);
  return deletedTrip;
}
