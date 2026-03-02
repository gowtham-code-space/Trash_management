import apiWorker from "./workers/apiWorker.js";
import auditWorker from "./workers/auditWorker.js";
import eventWorker from "./workers/eventWorker.js";
import metricsWorker from "./workers/metricsWorker.js";

export const startWorkers = () => {
    console.log("Starting all log workers...\n");

    apiWorker.start();
    auditWorker.start();
    eventWorker.start();
    metricsWorker.start();
};