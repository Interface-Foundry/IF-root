var status = {}

function setStatus(success, delay_ms) {
	status = { success: !!success, delay_ms: delay_ms || 10000 };
}

function getStatus() {
  return { ready: status.success === true && status.delay_ms <= 3000 };
}

module.exports = {
	set: setStatus,
	get: getStatus
};
