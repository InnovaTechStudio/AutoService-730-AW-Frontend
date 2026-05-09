export const createWorkOrder = (data = {}) => ({
    id: data.id || null,
    trackingCode: data.trackingCode || `AS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    vehicleId: data.vehicleId || null,
    customerId: data.customerId || null,
    description: data.description || '',
    status: data.status || 'En Proceso',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    estimatedDate: data.estimatedDate || '',
    price: data.price || 0 
});