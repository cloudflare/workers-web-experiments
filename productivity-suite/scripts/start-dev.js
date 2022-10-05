#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const child_process = require("child_process");
const open = require("open");

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).options(
    "v", {
        alias: "verbose",
        describe: "Show output from all the processes",
        type: "boolean"
    }
).argv;

const rootDir = path.join(__dirname, '..');
const appDir = path.join(rootDir, 'app');

const processes = [];

const verbose = !!argv.verbose;

runAllProcesses();

process.on("uncaughtException", terminateProcesses);
process.on("SIGINT", terminateProcesses);
process.on("SIGTERM", terminateProcesses);

async function runAllProcesses() {
    log('Building the shared libraries...');
    [
        path.join(rootDir, 'piercing-library'),
        path.join(appDir, 'shared')
    ].forEach(dir => runNpmScript(dir, 'build.watch'));

    await sleep(5000);

    const fragmentsDirPath = path.join(rootDir, 'app', 'fragments');
    const fragments = fs.readdirSync(fragmentsDirPath, { withFileTypes: true })
        .filter(file => file.isDirectory())

    for(const fragment of fragments) {
        log(`Serving the ${fragment.name} fragment...`);
		runNpmScript(path.join(fragmentsDirPath, fragment.name));
		await sleep(2000);
	}

    log('Serving the legacy application...');
    runNpmScript(path.join(appDir, 'legacy-app'), 'dev.react');

    await sleep(2000);

    log(`Serving the gateway worker...`);
    runNpmScript(path.join(appDir, 'legacy-app'), 'dev.worker');
    await sleep(2000);

    log("Ready to go! 🚀");

    open("http://localhost:8987/");
};

function runNpmScript(directory, scriptName = "start") {
    const newProcess = child_process.spawn("npm", ["run", scriptName], {
        cwd: directory,
        stdio: verbose ? "inherit" : undefined,
    });
    processes.push(newProcess);
}

function terminateProcesses() {
    processes.forEach(({ pid }) => {
        try {
            process.kill(pid);
        } catch {}
    });
}

function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
}

function log(message) {
   console.log(`\x1b[34m ${message}\n \x1b[0m`);
}
