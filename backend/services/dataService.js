    // In-memory array to store all bins
// Structured exactly as required.
let binsArray = [];

/**
 * Adds a new bin or updates an existing one without creating duplicates.
 * Forces the explicitly requested data structure.
 */
const updateBinData = (data) => {
    console.log('\n[DataService] Processing new data for ID:', data.id);

    // 1. Build the explicit structure requested by the frontend
    const newBinData = {
        id: data.id,
        fillLevel: Number(data.fillLevel) || 0, // Ensure it's a number
        lidStatus: data.lidStatus || 'unknown',
        lastUpdated: data.timestamp || new Date().toISOString(),
        location: {
            // Handle if device sends it as flat (data.lat) or nested (data.location.lat)
            lat: data.lat || (data.location && data.location.lat) || 0,
            lng: data.lng || (data.location && data.location.lng) || 0
        },
        alertSent: data.alertSent || false // used by smsService
    };

    // 2. Check if this bin already exists in our array
    const existingIndex = binsArray.findIndex(bin => bin.id === newBinData.id);

    if (existingIndex !== -1) {
        // OVERWRITE existing data correctly to avoid duplicates
        console.log(`[DataService] Updating EXISTING bin (Index: ${existingIndex}) -> ${newBinData.id}`);
        // Keep the previous SMS alert lock state so we don't spam
        newBinData.alertSent = binsArray[existingIndex].alertSent;
        binsArray[existingIndex] = newBinData;
    } else {
        // ADD new bin
        console.log(`[DataService] Adding NEW bin -> ${newBinData.id}`);
        binsArray.push(newBinData);
    }
    
    console.log('[DataService] Current Database State:', JSON.stringify(binsArray, null, 2));
    
    return newBinData;
};

const getAllBins = () => {
    return binsArray;
};

const getAlertBins = () => {
    return binsArray.filter(bin => bin.fillLevel >= 80);
};

const getRawBin = (id) => {
    return binsArray.find(bin => bin.id === id);
};

module.exports = {
    updateBinData,
    getAllBins,
    getAlertBins,
    getRawBin
};
