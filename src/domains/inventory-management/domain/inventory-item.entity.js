/**
 * Creates a normalized inventory item entity.
 * @param {Object} data
 * @returns {Object}
 */
export const createInventoryItem = (data = {}) => ({
    id: data.id || null,
    sku: data.sku || null,
    name: data.name || '',
    category: data.category || 'SPARE_PART',
    brand: data.brand || 'GENERIC',
    unitPrice: parseFloat(data.unitPrice) || 0.00,
    stock: parseInt(data.stock) || 0,
    minStock: parseInt(data.minStock) || 5,
    image: data.image || ''
});