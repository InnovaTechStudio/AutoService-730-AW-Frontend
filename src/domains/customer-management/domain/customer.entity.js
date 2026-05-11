export const Customer = (data = {}) => ({
    id: data.id || null,
    workshopId: data.workshopId || '',
    fullName: data.fullName || '',
    dni: data.dni || '',
    email: data.email || '',
    phone: data.phone || ''
});