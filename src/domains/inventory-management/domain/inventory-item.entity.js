export const createInventoryItem = (data = {}) => ({
    id: data.id || null,
    workshopId: data.workshopId || null,
    name: data.name || '',
    category: data.category || '',
    brand: data.brand || '',
    compatibleVehicleBrands: data.compatibleVehicleBrands || [],
    description: data.description || '',
    unitPrice: Number(data.unitPrice || 0),
    stock: Number(data.stock || 0),
    minStock: Number(data.minStock || 0),
    image: data.image || '',
    status: data.status || 'Disponible',
    lastUpdated: data.lastUpdated || null
});