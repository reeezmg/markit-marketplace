// api/address.ts
import api from './client';

export type Address = {
  id?: string;
  name?: string;
  formattedAddress?: string;
  houseDetails?: string;
  landmark?: string;
  type?: string;
  lat?: number;
  lng?: number;
  active: boolean;
  clientId?: string;
};

// ✅ GET all addresses (no clientId needed now)
export const getAddresses = async () => {
  const res = await api.get(`/address`);
  return res.data as Address[];
};

// ✅ CREATE new address
export const createAddress = async (data: Partial<Address>) => {
  const res = await api.post(`/address`, data);
  return res.data as Address;
};

// ✅ UPDATE address
export const updateAddress = async (id: string, data: Partial<Address>) => {
  const res = await api.put(`/address/${id}`, data);
  return res.data;
};

// ✅ DELETE address
export const deleteAddress = async (id: string) => {
  const res = await api.delete(`/address/${id}`);
  return res.data;
};
