import { expect, test } from "@playwright/test";
import { distanceKm, isWithinCoachServiceRadius, normalizeRadiusKm, parseCoordinates } from "@/lib/location";

test("la recherche géolocalisée valide les coordonnées et les rayons MVP", () => {
  expect(parseCoordinates("43.2965", "5.3698")).toEqual({ latitude: 43.2965, longitude: 5.3698 });
  expect(parseCoordinates("91", "5.3698")).toBeNull();
  expect(normalizeRadiusKm("1")).toBe(1);
  expect(normalizeRadiusKm("3")).toBe(10);
  expect(distanceKm({ latitude: 43.2965, longitude: 5.3698 }, { latitude: 43.2965, longitude: 5.3698 })).toBe(0);
  expect(isWithinCoachServiceRadius(4, 10, 5)).toBe(true);
  expect(isWithinCoachServiceRadius(6, 10, 5)).toBe(false);
  expect(isWithinCoachServiceRadius(2, 1, 10)).toBe(false);
});
