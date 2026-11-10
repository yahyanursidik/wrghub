export const normalizeVehiclePlate = (plate: string) => plate.toUpperCase().replace(/[\s.-]/g, '');
