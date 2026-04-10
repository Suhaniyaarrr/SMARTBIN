const fs = require('fs');
const path = require('path');

const DATA_FILE_PATH = path.join(__dirname, '..', 'data', 'bins.json');

const createDefaultBins = () => [
    {
        id: 'BIN-001',
        location: { lat: 28.2715766, lng: 77.069847 },
        fillLevel: 20,
        status: 'Low',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'BIN-002',
        location: { lat: 28.4601, lng: 77.0281 },
        fillLevel: 55,
        status: 'Medium',
        lastUpdated: new Date().toISOString()
    },
    {
        id: 'BIN-003',
        location: { lat: 28.4622, lng: 77.0302 },
        fillLevel: 85,
        status: 'Full',
        lastUpdated: new Date().toISOString()
    }
];

const writeBinsFile = (bins) => {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(bins, null, 2));
};

const readBinsFile = () => {
    try {
        if (!fs.existsSync(DATA_FILE_PATH)) {
            const defaults = createDefaultBins();
            writeBinsFile(defaults);
            return defaults;
        }

        const fileContents = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        const parsed = JSON.parse(fileContents);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            const defaults = createDefaultBins();
            writeBinsFile(defaults);
            return defaults;
        }

        return parsed;
    } catch (error) {
        console.error('[DataService] Failed to read bins file, falling back to defaults:', error.message);
        const defaults = createDefaultBins();
        writeBinsFile(defaults);
        return defaults;
    }
};

// Global in-memory bin store required for fast, database-free updates.
let binsData = readBinsFile();

const computeStatus = (fillLevel) => {
    if (fillLevel >= 80) return 'Full';
    if (fillLevel >= 50) return 'Medium';
    return 'Low';
};

const normalizeFillLevel = (value) => {
    const fillLevel = Number(value);
    return Number.isFinite(fillLevel) ? Math.max(0, Math.min(100, fillLevel)) : null;
};

const toBinResponse = (bin) => ({
    id: bin.id,
    location: bin.location,
    fillLevel: bin.fillLevel,
    status: bin.status,
    lastUpdated: bin.lastUpdated
});

const updateBin = (id, fillLevel, extra = {}) => {
    const normalizedId = String(id || '').trim();
    const normalizedFillLevel = normalizeFillLevel(fillLevel);

    if (!normalizedId) {
        return { error: 'Bin id is required.' };
    }

    if (normalizedFillLevel === null) {
        return { error: 'fillLevel must be a valid number.' };
    }

    const binIndex = binsData.findIndex((bin) => bin.id === normalizedId);
    if (binIndex === -1) {
        return { error: `Bin not found: ${normalizedId}` };
    }

    const currentBin = binsData[binIndex];
    const updatedBin = {
        ...currentBin,
        ...extra,
        id: normalizedId,
        fillLevel: normalizedFillLevel,
        status: computeStatus(normalizedFillLevel),
        lastUpdated: new Date().toISOString()
    };

    binsData[binIndex] = updatedBin;
    writeBinsFile(binsData);
    console.log(`[DataService] Updated bin ${normalizedId}:`, updatedBin);

    return updatedBin;
};

const upsertBin = (data) => {
    const normalizedId = String(data.id || '').trim();
    const normalizedFillLevel = normalizeFillLevel(data.fillLevel);

    if (!normalizedId || normalizedFillLevel === null) {
        return { error: 'Bin id and fillLevel are required.' };
    }

    const nextBin = {
        id: normalizedId,
        location: {
            lat: Number(data.lat ?? (data.location && data.location.lat) ?? 0),
            lng: Number(data.lng ?? (data.location && data.location.lng) ?? 0)
        },
        fillLevel: normalizedFillLevel,
        status: computeStatus(normalizedFillLevel),
        lastUpdated: new Date().toISOString()
    };

    const binIndex = binsData.findIndex((bin) => bin.id === normalizedId);
    if (binIndex === -1) {
        binsData.push(nextBin);
    } else {
        binsData[binIndex] = { ...binsData[binIndex], ...nextBin };
    }

    writeBinsFile(binsData);

    return nextBin;
};

const getAllBins = () => binsData.map(toBinResponse);

const getAlertBins = () => binsData.filter((bin) => bin.fillLevel >= 80).map(toBinResponse);

const getRawBin = (id) => binsData.find((bin) => bin.id === id);

module.exports = {
    binsData,
    updateBin,
    upsertBin,
    getAllBins,
    getAlertBins,
    getRawBin,
    computeStatus,
    normalizeFillLevel
};
