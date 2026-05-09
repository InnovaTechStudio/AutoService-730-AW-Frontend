export const createMechanic = (data = {}) => ({
    id: data.id || null,
    fullName: data.fullName || '',
    specialty: data.specialty || '',
    maxCapacity: data.maxCapacity || 5
});