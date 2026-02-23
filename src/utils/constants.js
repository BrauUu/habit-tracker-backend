export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?]).{8,}$/
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

export const incrementalResetFrequencyTypes = {
    'daily': 0,
    'weekly': 1,
};

export function isValidUUID(id) {
    return uuidRegex.test(id)
}

export function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date) && date instanceof Date;
}

export function formatResetFrequencyText(incremental) {
    const resetFrequencyText = Object.keys(incrementalResetFrequencyTypes).find((key) =>
        incrementalResetFrequencyTypes[key] === incremental.reset_frequency
    )
    return { ...incremental, reset_frequency: resetFrequencyText }
}

export function formatResetFrequencyEnum(incremental) {
    return { ...incremental, reset_frequency: incrementalResetFrequencyTypes[incremental.reset_frequency] }
}