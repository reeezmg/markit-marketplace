// hooks/useAddresses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { getAddresses, createAddress, updateAddress, deleteAddress, Address } from "../api/address";

export const useAddresses = (clientId: string) => {
  return useQuery({
    queryKey: ["addresses", clientId],
    queryFn: () => getAddresses(clientId),
  });
};

export const useCreateAddress = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Address>) => createAddress(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", clientId] });
    },
  });
};

export const useUpdateAddress = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Address> }) =>
      updateAddress(clientId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", clientId] });
    },
  });
};

export const useDeleteAddress = (clientId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses", clientId] });
    },
  });
};
