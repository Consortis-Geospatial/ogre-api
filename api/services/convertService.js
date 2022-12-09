// db = require('../models'),
//   { Op } = require('sequelize'),
const result = require('../core/result');
const fs = require('fs-extra');
const formidable = require('formidable');
const AdmZip = require('adm-zip');
const ogr2ogr = require('ogr2ogr').default;
const archiver = require('archiver');
const p = require('path');
const createHttpError = require('http-errors');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

const ConvertService = {
  convert: async (req, res) => {
    // eslint-disable-next-line no-useless-catch

    // const uuid = req.params.uuid;

    const tempFile = process.cwd() + '\\temp';
    const chunkDir = `${tempFile}`;

    if (!fs.existsSync(tempFile)) {
      fs.mkdirSync(tempFile, { recursive: true });
    }
    // if (!fs.existsSync(chunkDir)) {
    //   fs.mkdirSync(chunkDir, { recursive: true });
    // }

    const form = formidable({ uploadDir: chunkDir });

    var { fields, files } = await new Promise(function (resolve, reject) {
      form.parse(req, function (err, fields, files) {
        if (err) {
          reject(err);
          return;
        }
        // console.log("within form.parse method, subject field of fields object is: " + fields.subjects);
        resolve({ fields, files });
      }); // form.parse
    });

    var originalFileMimetype = files.upload.mimetype;
    if (originalFileMimetype === 'application/octet-stream') {
      originalFileMimetype = mime.lookup(files.upload.originalFilename);

      if (!originalFileMimetype) {
        if (files.upload.originalFilename.endsWith('.shz')) {
          originalFileMimetype = 'application/x-zip-compressed';
        }
        if (files.upload.originalFilename.endsWith('.dgn')) {
          originalFileMimetype = 'image/vnd.dgn';
        }
        if (files.upload.originalFilename.endsWith('.dxf')) {
          originalFileMimetype = 'image/vnd.dxf';
        }
      }
    }

    if (
      originalFileMimetype === 'application/x-zip-compressed' ||
      originalFileMimetype === 'application/vnd.google-earth.kmz'
    ) {
      let newFilename = files.upload.newFilename;

      var zip = new AdmZip(tempFile + '/' + newFilename);
      var zipEntries = zip.getEntries(); // an array of ZipEntry records

      var shpFilename;
      zipEntries.forEach(function (zipEntry) {
        // console.log(zipEntry.toString()); // outputs zip entries information
        if (zipEntry.entryName.endsWith('.shp') || zipEntry.entryName.endsWith('.kml')) {
          //   console.log(zipEntry.getData().toString('utf8'));
          shpFilename = zipEntry.entryName;
        }
      });
      const folderzip = uuidv4();
      fs.mkdirSync(tempFile + '/' + folderzip, { recursive: true });
      // extracts everything
      zip.extractAllTo(/*target path*/ tempFile + '/' + folderzip, /*overwrite*/ true);

      let ogrOptions = {
        destination: tempFile + '/' + shpFilename.split('.')[0] + '.geojson',
        // options: ['--config', 'CPL_DEBUG', 'TRUE'],
        options: ['-t_srs', 'EPSG:4326'],
      };
      if (fields.hasOwnProperty('sourceSrs')) {
        ogrOptions.options.push('-s_srs');
        ogrOptions.options.push(fields.sourceSrs);
      }

      try {
        let data = await ogr2ogr(tempFile + '/' + folderzip + '/' + shpFilename, ogrOptions);
      } catch (err) {
        fs.removeSync(tempFile + '/' + folderzip);
        fs.removeSync(tempFile + '/' + newFilename);
        throw err;
      }

      let result = await new Promise(function (resolve, reject) {
        fs.readFile(tempFile + '/' + shpFilename.split('.')[0] + '.geojson', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            fs.removeSync(tempFile + '/' + folderzip);
            fs.removeSync(tempFile + '/' + shpFilename.split('.')[0] + '.geojson');
            fs.removeSync(tempFile + '/' + newFilename);
            reject(err);
            return;
          }
          console.log(data);
          resolve(data);
          return data;
        });
      });
      fs.removeSync(tempFile + '/' + folderzip);
      fs.removeSync(tempFile + '/' + shpFilename.split('.')[0] + '.geojson');
      fs.removeSync(tempFile + '/' + newFilename);

      return result;
    } else if (originalFileMimetype === 'application/vnd.google-earth.kml+xml') {
      let newFilename = files.upload.newFilename;

      fs.renameSync(tempFile + '/' + newFilename, tempFile + '/' + newFilename + '.kml');
      newFilename = newFilename + '.kml';

      const shpName = uuidv4();

      let ogrOptions = {
        destination: tempFile + '/' + shpName + '.geojson',
        // options: ['--config', 'CPL_DEBUG', 'TRUE'],
        options: ['-t_srs', 'EPSG:4326'],
      };
      // if (fields.hasOwnProperty('sourceSrs')) {
      //   ogrOptions.options.push('-s_srs');
      //   ogrOptions.options.push(fields.sourceSrs);
      // }
      try {
        let data = await ogr2ogr(tempFile + '/' + newFilename, ogrOptions);
        console.log(data);
      } catch (err) {
        fs.removeSync(tempFile + '/' + newFilename);
        throw err;
      }

      let result = await new Promise(function (resolve, reject) {
        fs.readFile(tempFile + '/' + shpName + '.geojson', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            fs.removeSync(tempFile + '/' + shpName + '.geojson');
            fs.removeSync(tempFile + '/' + newFilename);
            reject(err);
            return;
          }
          console.log(data);
          resolve(data);
          return data;
        });
      });
      fs.removeSync(tempFile + '/' + shpName + '.geojson');
      fs.removeSync(tempFile + '/' + newFilename);

      // //delete geojson file
      // await new Promise(function (resolve, reject) {
      //   fs.unlink(tempFile + '/' + shpName + '.geojson', (err) => {
      //     if (err) {
      //       reject(err);
      //       throw err;
      //     }
      //     console.log('geojson File is deleted.');
      //     resolve();
      //   });
      // });
      // //delete original zip
      // await new Promise(function (resolve, reject) {
      //   fs.unlink(tempFile + '/' + newFilename, (err) => {
      //     if (err) {
      //       reject(err);
      //       throw err;
      //     }
      //     console.log('zip File is deleted.');
      //     resolve();
      //   });
      // });
      return result;
    } else if (originalFileMimetype === 'image/vnd.dxf') {
      let newFilename = files.upload.newFilename;

      fs.renameSync(tempFile + '/' + newFilename, tempFile + '/' + newFilename + '.dxf');
      newFilename = newFilename + '.dxf';

      const shpName = uuidv4();

      let ogrOptions = {
        destination: tempFile + '/' + shpName + '.geojson',

        options: ['-t_srs', 'EPSG:4326'],
      };

      if (fields.hasOwnProperty('sourceSrs')) {
        ogrOptions.options.push('-s_srs');
        ogrOptions.options.push(fields.sourceSrs);
      } else {
        ogrOptions.options.push('-s_srs');
        ogrOptions.options.push('EPSG:4326');
      }

      try {
        let data = await ogr2ogr(tempFile + '/' + newFilename, ogrOptions);
      } catch (err) {
        fs.removeSync(tempFile + '/' + newFilename);
        throw err;
      }

      let result = await new Promise(function (resolve, reject) {
        fs.readFile(tempFile + '/' + shpName + '.geojson', 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            fs.removeSync(tempFile + '/' + shpName + '.geojson');
            fs.removeSync(tempFile + '/' + newFilename);
            reject(err);
            return;
          }
          console.log(data);
          resolve(data);
          return data;
        });
      });
      fs.removeSync(tempFile + '/' + shpName + '.geojson');
      fs.removeSync(tempFile + '/' + newFilename);

      return result;
    }
  },
  convertJson: async (req, res) => {
    const tempFile = process.cwd() + '\\temp';
    const chunkDir = `${tempFile}`;

    if (!fs.existsSync(tempFile)) {
      fs.mkdirSync(tempFile, { recursive: true });
    }

    var { forceUTF8, format, json } = req.body;
    let ogrOptions = {
      format: format ? format : 'ESRI Shapefile',
    };
    if (format == null || format == undefined) {
      format = 'ESRI Shapefile';
    }

    if (forceUTF8) {
      ogrOptions['options'] = ['-lco', 'ENCODING=UTF-8'];
    }

    if (format === 'CSV') {
      const csvName = uuidv4();
      fs.writeFileSync(tempFile + '/' + csvName + '.json', json);
      ogrOptions['destination'] = tempFile + '/' + csvName + '.csv';
      let data = await ogr2ogr(tempFile + '/' + csvName + '.json', ogrOptions);
      console.log(data);

      res.download(tempFile + '/' + csvName + '.csv', csvName + '.csv', options, function (err) {
        if (err) {
          fs.removeSync(tempFile + '/' + csvName + '.csv');
          fs.removeSync(tempFile + '/' + csvName + '.json');
          res.end();
        } else {
          fs.removeSync(tempFile + '/' + csvName + '.csv');
          fs.removeSync(tempFile + '/' + csvName + '.json');
          res.end();
        }
      });
    } else if (format === 'DXF') {
      //ARTAXANIDIS
      const dxfName = uuidv4();
      fs.writeFileSync(tempFile + '/' + dxfName + '.geojson', json);
      ogrOptions['destination'] = tempFile + '/' + dxfName + '.dxf';
      let data = await ogr2ogr(tempFile + '/' + dxfName + '.geojson', ogrOptions);
      console.log(data);
      res.download(tempFile + '/' + dxfName + '.dxf', dxfName + '.dxf', options, function (err) {
        if (err) {
          fs.removeSync(tempFile + '/' + dxfName + '.dxf');
          fs.removeSync(tempFile + '/' + dxfName + '.geojson');
          res.end();
        } else {
          fs.removeSync(tempFile + '/' + dxfName + '.dxf');
          fs.removeSync(tempFile + '/' + dxfName + '.geojson');
          res.end();
        }
      });
    } else if (format === 'ESRI Shapefile') {
      //SHAPEFILE
      const shpName = uuidv4();
      ogrOptions['destination'] = tempFile + '/' + shpName;
      fs.writeFileSync(tempFile + '/' + shpName + '.geojson', json);
      let data = await ogr2ogr(tempFile + '/' + shpName + '.geojson', ogrOptions);
      console.log(data);
      //zip

      // var archive = archiver('zip');

      // archive.on('error', function (err) {
      //   res.status(500).send({ error: err.message });
      // });

      // //on stream closed we can end the request
      // archive.on('end', function () {
      //   console.log('Archive wrote %d bytes', archive.pointer());
      // });

      // //set the archive name
      // res.attachment(zippath);

      // //this is the streaming magic
      // archive.pipe(res);

      // // archive.file(zippath, { name: p.basename(zippath) });
      // archive.directory(tempFile + '/tempshp/', false);
      // // var directories = [__dirname + '/fixtures/somedir'];

      // // for (var i in directories) {
      // //   archive.directory(directories[i], directories[i].replace(__dirname + '/fixtures', ''));
      // // }

      // archive.finalize();
      if (data) {
        const zipPath = await zipFiles(tempFile + '/' + shpName);

        const zipPathExists = await fs.pathExists(zipPath);

        if (!zipPathExists) {
          throw createHttpError(404, 'API_ERRORS.EXPROPRIATION_ZIP_FILE_FAIL');
        }
        // res.setHeader('Content-Type', 'application/octet-stream');
        var options = {
          headers: {
            'content-disposition': 'attachment; filename="ogre.shz"',
            'content-type': 'application/octet-stream',
          },
        };
        res.download(zipPath, shpName + '.zip', options, function (err) {
          if (err) {
            fs.removeSync(`${zipPath}`);
            fs.removeSync(tempFile + '/' + shpName);
            fs.removeSync(tempFile + '/' + shpName + '.geojson');
            res.end();
          } else {
            fs.removeSync(`${zipPath}`);
            fs.removeSync(tempFile + '/' + shpName);
            fs.removeSync(tempFile + '/' + shpName + '.geojson');
            res.end();
          }
        });
      } else {
        throw createHttpError(404, 'API_ERRORS.EXPROPRIATION_DOCUMENTS_NOT_FOUND');
        // throw new Error('No Documents in the database with this doc type id');
      }
    }
  },
};

async function zipFiles(path) {
  var zip = new AdmZip();

  // add file directly

  await zip.addLocalFolder(path);
  // or write everything to disk
  await zip.writeZip(/*target file name*/ path + '.zip');
  return path + '.zip';
}

module.exports = ConvertService;
