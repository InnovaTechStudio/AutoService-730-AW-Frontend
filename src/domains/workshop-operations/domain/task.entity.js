export const createTask = (data = {}) => ({
    id: data.id || null,
    workshopId: data.workshopId || null,
    workOrderId: data.workOrderId || null,
    description: data.description || '',
    status: data.status || 'Pendiente',
    mechanicId: data.mechanicId || null,
    priority: data.priority || 'Media',
    estimatedTime: data.estimatedTime || 'No definido',
    price: Number(data.price || 0),
    photo: data.photo || '',

    technicalDiagnosis: data.technicalDiagnosis || '',
    customerExplanation: data.customerExplanation || '',
    internalObservation: data.internalObservation || '',
    evidenceRegistered: data.evidenceRegistered || '',

    requiredMaterials: data.requiredMaterials || [],
    usedMaterials: data.usedMaterials || [],
    materialsTotal: Number(data.materialsTotal || 0),
    materialRequestStatus: data.materialRequestStatus || 'Sin materiales',

    adminReviewStatus: data.adminReviewStatus || 'Sin enviar',
    customerReportStatus: data.customerReportStatus || 'No visible',
    completedAt: data.completedAt || null
});