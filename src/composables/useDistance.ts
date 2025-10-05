// api helper
import api from '../api/client';

export async function getDistanceInKm(origin: string, destination: string) {
  // Forward trip: origin → destination
  const { data: forward } = await api.get("/map/distance", {
    params: { 
      origin, 
      destination,
      mode: "driving",
      units: "metric",
    },
  });

  if (forward.rows[0].elements[0].status !== "OK") {
    throw new Error("Failed to calculate forward distance");
  }
  const forwardKm = forward.rows[0].elements[0].distance.value / 1000;

  // Return trip: destination → origin
  const { data: backward } = await api.get("/map/distance", {
    params: { 
      origin: destination, 
      destination: origin,
      mode: "driving",
      units: "metric",
    },
  });

  if (backward.rows[0].elements[0].status !== "OK") {
    throw new Error("Failed to calculate return distance");
  }
  const backwardKm = backward.rows[0].elements[0].distance.value / 1000;

  return { forwardKm, backwardKm };
}
