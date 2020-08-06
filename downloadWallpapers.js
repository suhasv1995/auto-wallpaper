require("isomorphic-fetch");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

// Available resolutions - 1920_1200, 1920_1080, 1280_1024
const RESOLUTION = "3840_2160";
const SITES_FILE = "sites.txt";
const WALLPAPERS_DIR = "wallpapers";

const createDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

const downloadAndExtractFile = async (url, filePath, renamePath) => {
  const zipPath = "temp.zip";
  console.log("Downloading", url);
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(zipPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", (err) => {
      reject(err);
    });
    fileStream.on("finish", function () {
      console.log("Writing to file", zipPath);
      const zip = new AdmZip(zipPath);
      console.log("Extracting", zipPath, "to", WALLPAPERS_DIR);
      zip.extractAllTo(WALLPAPERS_DIR);
      fs.unlinkSync(zipPath);
      fs.renameSync(filePath, renamePath);
      resolve();
    });
  });
};

const getImageZipUrl = (site, index) =>
  `http://di.update.sony.net/ACLK/wallpaper/${site}/${RESOLUTION}/fp/${site}_${RESOLUTION}_fp_${paddedIndex(
    index
  )}.zip`;

const getSites = () => {
  return fs.readFileSync(SITES_FILE, "utf-8").split(",");
};

const paddedIndex = (index) => (index < 10 ? `0${index}` : index);

const range = (start, end, step = 1) => {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
};

let sites = [];
try {
  sites = getSites();
} catch (_) {
  execSync("node fetchHeritageSites.js");
  sites = getSites();
}

createDir(WALLPAPERS_DIR);

(async () => {
  for (site of sites) {
    for (index of range(1, 13, 1)) {
      const filePath = path.join(
        WALLPAPERS_DIR,
        `${site}_${RESOLUTION}_fp_${paddedIndex(index)}.jpg`
      );
      const renamePath = path.join(
        WALLPAPERS_DIR,
        `${site}_${paddedIndex(index)}.jpg`
      );
      if (!fs.existsSync(renamePath)) {
        await downloadAndExtractFile(
          getImageZipUrl(site, index),
          filePath,
          renamePath
        );
      } else {
        console.log("Skipping", getImageZipUrl(site, index));
      }
    }
  }
})();
