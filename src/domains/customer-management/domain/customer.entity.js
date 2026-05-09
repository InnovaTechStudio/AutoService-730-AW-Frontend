export const createCustomer = (data = {}) => ({
    id: data.id || null,
    fullName: data.fullName || '',
    dni: data.dni || '',
    email: data.email || '',
    phone: data.phone || ''
});