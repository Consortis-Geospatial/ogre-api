const { Op } = require('sequelize');

const fs = require('fs-extra');
const path = require('path');

var utils = {
  mergeChunkFiles: async (file_path, folder_name, file_name, unique_upload_id) => {
    const chunkDir = process.cwd() + `/temp/${unique_upload_id}`;
    try {
      const dirName = folder_name ? `${file_path}/${folder_name}` : file_path;

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      let outputFile = fs.createWriteStream(path.join(dirName, file_name));
      const filenames = fs.readdirSync(chunkDir);
      filenames.forEach(function (tempName) {
        const data = fs.readFileSync(`${chunkDir}/${tempName}`);
        outputFile.write(data);
        //delete the chunk files we just handled
        fs.removeSync(`${chunkDir}/${tempName}`);
      });
      outputFile.end();
      fs.removeSync(`${chunkDir}`);

      return dirName;
    } catch (error) {
      fs.removeSync(`${chunkDir}`);
      throw new Error('Cannot get upload chunks!');
      // console.log(error);
    }
  },

  deleteChunkFiles: async (unique_upload_id) => {
    try {
      const chunkDir = process.cwd() + `/temp/${unique_upload_id}`;
      const filenames = fs.readdirSync(chunkDir);
      filenames.forEach(function (tempName) {
        //delete the chunk we just handled
        fs.removeSync(`${chunkDir}/${tempName}`);
      });
      fs.removeSync(`${chunkDir}`);
    } catch (error) {
      throw new Error('Cannot delete chunks files \r\n' + `${error.message}`);
    }
  },
};

module.exports = utils;
