// composables/useDistance.ts
import axios from "axios";

/**
 * Compute forward and backward total distance between customer and multiple shops using OSRM.
 * @param shops Array of coordinates as strings "lat,lng"
 * @param customer A coordinate string "lat,lng"
 */
export async function getDistanceInKm(shops: string[] | string, customer: string) {
  const OSRM_URL = import.meta.env.VITE_OSRM_URL || "http://localhost:5000";

  // Normalize input
  const shopCoords = Array.isArray(shops) ? shops : [shops];

  // Convert to OSRM format (lng,lat)
  const toLonLat = (coord: string) => {
    const [lat, lng] = coord.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) throw new Error(`Invalid coordinate: ${coord}`);
    return `${lng},${lat}`;
  };

  const osrmCoords = [...shopCoords.map(toLonLat), toLonLat(customer)];
  const coordString = osrmCoords.join(";");

  try {
    // 🚗 Request OSRM /table distances
    const url = `${OSRM_URL}/table/v1/driving/${coordString}?annotations=distance`;
    const { data } = await axios.get(url);
    console.log("OSRM /table response:", data);

    if (!data || data.code !== "Ok" || !Array.isArray(data.distances)) {
      console.error("OSRM /table bad response:", data);
      throw new Error("Invalid response from OSRM table");
    }

    const n = shopCoords.length;
    const customerIndex = n; // last coordinate in array

    // ✅ Calculate forward (shop → customer)
    let forwardMeters = 0;
    for (let i = 0; i < n; i++) {
      const dist = data.distances[i][customerIndex];
      if (typeof dist === "number" && dist < 1e7) forwardMeters += dist;
    }

    // ✅ Calculate backward (customer → shop)
    let backwardMeters = 0;
    for (let i = 0; i < n; i++) {
      const dist = data.distances[customerIndex][i];
      if (typeof dist === "number" && dist < 1e7) backwardMeters += dist;
    }

    const forwardKm = parseFloat((forwardMeters / 1000).toFixed(2));
    const backwardKm = parseFloat((backwardMeters / 1000).toFixed(2));

    return { forwardKm, backwardKm };
  } catch (error: any) {
    console.error("OSRM distance calculation failed:", error.message);
    throw new Error("Failed to calculate OSRM distance");
  }
}
