import { stat, readdir, readFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { unstable_dev, type UnstableDevWorker } from "wrangler";
import { parseTOML } from "./parse.js";

main(...process.argv.slice(2)).catch((e) => console.error(e));

interface WorkerInfo {
  name: string;
  script: string;
  path: string;
  dependencies: string[];
}

interface WranglerConfig {
  name: string;
  main: string;
  services?: { service: string }[];
}

async function main(name?: string, ...args: string[]) {
  if (args.length) {
    console.warn(`Unexpected additional args: "${args.join(" ")}."`);
  }
  const workers: Record<string, WorkerInfo> = {};
  for await (const workerConfigPath of findAllWorkerConfigPaths(
    process.cwd()
  )) {
    const workerConfig = await readWorkerConfig(workerConfigPath);
    workers[workerConfig.name] = workerConfig;
  }
  if (name === undefined) {
    console.log(
      "Please provide a root worker. The available workers are:" +
        Object.keys(workers).map((name) => `\n- ${name}`)
    );
    return;
  }

  const workersToRun = getWorkersToRun(name, workers);
  const runningWorkers: UnstableDevWorker[] = [];
  const cwd = process.cwd();
  for (const worker of workersToRun) {
    try {
      process.chdir(dirname(worker.path));
      runningWorkers.push(await runWorker(worker, worker.name === name));
    } finally {
      process.chdir(cwd);
    }
  }
  await runningWorkers[runningWorkers.length - 1].waitUntilExit();
}

async function* findAllWorkerConfigPaths(path: string): AsyncGenerator<string> {
  const info = await stat(path);
  if (info.isFile() && basename(path) === "wrangler.toml") {
    yield path;
  } else if (info.isDirectory()) {
    for (const dir of await readdir(path)) {
      yield* findAllWorkerConfigPaths(resolve(path, dir));
    }
  }
}

async function readWorkerConfig(workerConfigPath: string): Promise<WorkerInfo> {
  const workerConfig = parseTOML(
    await readFile(workerConfigPath, "utf8"),
    workerConfigPath
  ) as unknown as WranglerConfig;
  if (!workerConfig.name) {
    console.log(
      `The worker config at "${workerConfigPath}" has no "name" property.`
    );
  }
  if (!workerConfig.name) {
    console.log(
      `The worker config at "${workerConfigPath}" has no "main" property.`
    );
  }
  return {
    name: workerConfig.name,
    script: workerConfig.main,
    path: workerConfigPath,
    dependencies: (workerConfig.services ?? []).map(({ service }) => service),
  };
}

function getWorkersToRun(
  root: string,
  workers: Record<string, WorkerInfo>,
  workerList: WorkerInfo[] = []
): WorkerInfo[] {
  if (workers[root] === undefined) {
    throw new Error(
      `Invalid worker name: ${root}.\nThe available workers are:` +
        Object.keys(workers).map((name) => `\n- ${name}`)
    );
  }
  if (!workerList.find((w) => w.name === root)) {
    for (const dep of workers[root].dependencies) {
      getWorkersToRun(dep, workers, workerList);
    }
    workerList.push(workers[root]);
  }
  return workerList;
}

async function runWorker(worker: WorkerInfo, root: boolean) {
  console.log("*********************************************************");
  console.log(`Starting worker: ${worker.name} ${root ? "(as root)" : ""}`);
  const dev = await unstable_dev(
    worker.script,
    { config: worker.path, watch: true },
    { disableExperimentalWarning: true }
  );
  console.log(`Worker running at: http://${dev.address}:${dev.port}`);
  console.log("*********************************************************");
  return dev;
}
