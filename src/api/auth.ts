import { Preferences } from '@capacitor/preferences';
import api from './client';

export const login = async (phone) => {
  const res = await api.post("/auth/login", { phone });
  const data = res.data;

  if (data.token) {
    await Preferences.set({ key: 'token', value: data.token });
    await Preferences.set({ key: 'client', value: JSON.stringify(data.client) });
  }    

};

export const logout = async () => {
  await Preferences.remove({ key: 'token' });
  await Preferences.remove({ key: 'client' }); 
};

export const generateOtp = async (phone) => {
  try {
    const res = await api.post("/auth/otp", { phone });
    return res.data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    return error;
  }
};
