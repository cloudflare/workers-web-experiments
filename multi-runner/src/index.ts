async function main(args: string[]) {
  const workers = await findAllWorkers(process.cwd());
}

main(process.argv).catch((e) => console.error(e));

async function* findAllWorkers(basePath: string) {}
