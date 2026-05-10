export function createVehicle(data) {
    return {
        id: data.id,
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        year: data.year,
        color: data.color,
        status: data.status,
        customerId: data.customerId,
        image: data.image || ''
    };
}