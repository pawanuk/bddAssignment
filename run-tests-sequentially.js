const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const numberOfRuns = 10; // Number of times to run the tests
const logFilePath = path.join(__dirname, 'test-runs.log'); // Log file path

// Clear the log file if it exists
fs.writeFileSync(logFilePath, '', 'utf-8');

// Function to log messages to both the console and the log file
function logMessage(message) {
    console.log(message);
    fs.appendFileSync(logFilePath, message + '\n', 'utf-8');
}

// Function to run the tests sequentially
function runTestsSequentially(runNumber) {
    if (runNumber > numberOfRuns) {
        logMessage('All test runs completed.');
        return;
    }

    logMessage(`\nRun #${runNumber}\n`);
    
    exec('npm run test', (error, stdout, stderr) => {
        if (error) {
            logMessage(`Error during run #${runNumber}: ${error}`);
        }

        logMessage(`Run #${runNumber} completed successfully.`);
        logMessage(stdout);

        if (stderr) {
            logMessage(`stderr during run #${runNumber}: ${stderr}`);
        }

        // Run the next test after the current one finishes
        runTestsSequentially(runNumber + 1);
    });
}

// Start the sequential test runs
runTestsSequentially(1);
