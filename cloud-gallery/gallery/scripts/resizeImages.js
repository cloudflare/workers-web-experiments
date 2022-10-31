import sharp from "sharp";
import crypto from "crypto";
import fs from "fs";

const directory = "./images";
const outDir = "./public/images";

// clean
fs.rmdirSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);

fs.readdirSync(directory).forEach(async (file) => {
	const baseName = file.split(".")[0];
	const hash = crypto
		.createHash("md5")
		.update(baseName)
		.update(new Date().toUTCString())
		.digest("hex");

	await sharp(`${directory}/${file}`)
		.resize(600, 900)
		.webp()
		.toFile(`${outDir}/${baseName}-${hash}.webp`);

	console.log(`${baseName}-${hash}.webp`);
});
