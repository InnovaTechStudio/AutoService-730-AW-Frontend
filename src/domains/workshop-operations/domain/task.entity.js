export const createTask = (data = {}) => ({
    id: data.id || null,
    workOrderId: data.workOrderId || null,
    description: data.description || '',
    status: data.status || 'Pendiente',
    mechanicId: data.mechanicId || null,
    price: data.price || 0,
    photo: data.photo || ''
});