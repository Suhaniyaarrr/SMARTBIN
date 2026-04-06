require('dotenv').config();
const twilio = require('twilio');

// Initialize Twilio client ONLY if keys are actually configured in the .env file
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_ACCOUNT_SID !== 'your_twilio_account_sid_here') {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Evaluates bin data and sends an SMS alert if needed.
 * Important: Implements deduplication to avoid spamming text messages.
 * 
 * @param {Object} rawBinData - The internal bin data object
 */
const sendSMSAlert = async (rawBinData) => {
    // --- 1. DEDUPLICATION CHECK ---
    // If we've already sent an alert for this bin being full, do not send another one
    // until it gets emptied
    if (rawBinData.alertSent === true) {
        console.log(`[SMS Service] Alert already active for ${rawBinData.id}. SMS skipped to prevent spam.`);
        return;
    }

    // --- 2. PREPARE THE MESSAGE ---
    // Fallback static map URL provided by user
    const staticMapUrl = 'https://www.google.com/maps/dir//K.R.+Mangalam+University,+Badshahpur+Sohna+Rd,+Gurugram,+Sohna+Rural,+Haryana+122103/@28.2495789,77.0708516,14z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x390d25a4b2bc03f9:0x9f642d679654b239!2m2!1d77.069847!2d28.2715766';
    
    // Use dynamic coordinates if ESP32 provided them correctly, else use the static URL
    let locationUrl = staticMapUrl;
    if (rawBinData.lat && rawBinData.lng) {
        locationUrl = `https://www.google.com/maps?q=${rawBinData.lat},${rawBinData.lng}`;
    }

    // Format the final SMS text exactly as requested
    const messageBody = `⚠️ SmartBin Alert:\n${rawBinData.id} is ${rawBinData.fillLevel}% full.\nLocation: ${locationUrl}`;

    try {
        // --- 3. SEND THE SMS ---
        if (!client) {
            // Mock Behavior: If Twilio isn't set up yet, simulate the SMS in console
            console.warn('[SMS Service] Twilio missing in .env. Simulating SMS send:');
            console.log('----------------------------------------------------');
            console.log(messageBody);
            console.log('----------------------------------------------------');
            
             // Even when mocking, we must track that we sent it
            rawBinData.alertSent = true;
            return;
        }

        // Live Behavior: Execute the real Twilio API call
        await client.messages.create({
            body: messageBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.ALERT_RECIPIENT_NUMBER
        });

        console.log(`[SMS Service] Successfully dispatched real SMS for ${rawBinData.id}`);
        
        // --- 4. RECORD STATE TO PREVENT DUPLICATES ---
        rawBinData.alertSent = true;

    } catch (error) {
        console.error(`[SMS Service] Failed to dispatch SMS for ${rawBinData.id}:`, error.message);
    }
};

/**
 * Clears the alert state. Allows the system to send an SMS again
 * if the bin fills up repeatedly (e.g. after it gets emptied).
 * 
 * @param {Object} rawBinData 
 */
const resetAlertState = (rawBinData) => {
    if (rawBinData.alertSent === true) {
        console.log(`[SMS Service] Bin ${rawBinData.id} was emptied below threshold. Resetting SMS lock.`);
        rawBinData.alertSent = false;
    }
};

module.exports = {
    sendSMSAlert,
    resetAlertState
};
