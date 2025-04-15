import { MongoClient } from 'mongodb';
import md5 from 'md5';
import { find, insert, update } from './database.js';

export const checkUser = async (email, token) => {
  try {
    const user = await find('users', { email: email, token: token }, true);
    if (user) {
      const today = new Date().toISOString();
      const newToken = md5(today + Math.random() * 1000);
      const updateResult = await update('users',
        { email: user.email },
        { $set: { token: newToken, lastLogin: today } },
        true
      );

      if (updateResult === 1) {
        // Update was successful
        user.token = newToken; // Update the user object with the new token
        user.lastLogin = today; // Update the user object with the new lastLogin
        return user;
      } else {
        // Update failed
        console.error('Failed to update user token');
        return false;
      }
    } else {
      return false; // Token is invalid
    }
  } catch (error) {
    console.error('Error checking token:', error);
    return false;
  }
}

export const removeToken = async (email) => {
  try {
    const updateResult = await update('users',
      { email: email },
      { $set: { token: null } },
      true
    );
    return updateResult === 1;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
}

export const createUser = async (userData) => {
  userData.password = md5(userData.password);
  userData.lastLogin = new Date().toISOString();
  try {
    const result = await insert('users', userData);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    return false;
  }
}

export const getUser = async (email) => {
  try {
    const user = await find('users', { email: email }, true);
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return false;
  }
}