import axios from "axios";

/**
 * Calls backend API to get forward & backward distance
 * @param shops Array of coordinates as strings "lat,lng"
 * @param customer A coordinate string "lat,lng"
 */
export async function getDistanceInKm(
  shops: string[] | string,
  customer: string
) {
  try {
    const API_URL =
      import.meta.env.VITE_API_URL || "https://api.markit.co.in";

    const shopCoords = Array.isArray(shops) ? shops : [shops];

    const { data } = await axios.post(`${API_URL}/distance`, {
      shops: shopCoords,
      customer,
    });

    if (!data || !data.success) {
      throw new Error("Invalid response from backend");
    }

    return {
      forwardKm: data.forwardKm,
      backwardKm: data.backwardKm,
    };
  } catch (error: any) {
    console.error("Distance API failed:", error.message);
    throw new Error("Failed to calculate distance");
  }
}