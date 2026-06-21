// Minimal request/error logger. Expand later if needed (e.g. morgan, winston).

function logInfo(message) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

function logError(message) {
  console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
}

module.exports = { logInfo, logError };
