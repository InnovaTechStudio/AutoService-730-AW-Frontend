export const createVehicle = (data = {}) => ({
    id: data.id || null,
    plate: data.plate || '',
    brand: data.brand || '',
    model: data.model || '',
    year: data.year || '',
    color: data.color || '',
    status: data.status || 'En Taller',
    customerId: data.customerId || null
});