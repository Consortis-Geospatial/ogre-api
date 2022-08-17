var path = require('path'),
  rootPath = path.normalize(__dirname + '/..'),
  env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    apiVersion: process.env.DEV_API_VERSION,
    root: rootPath,
    app: {
      name: 'mobiroad',
    },
    port: process.env.DEV_NODE_PORT,
    db: {
      database: process.env.DEV_DATABASE_NAME,
      user: process.env.DEV_USERNAME,
      password: process.env.DEV_PASSWORD,
      define: {
        timestamps: true,
        underscored: true,
      },
      options: {
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        dialect: 'postgres',
        minifyAliases: true,
        dialectOptions: {
          options: {
            requestTimeout: 10000,
          },
        },
        //logging: false,
        logQueryParameters: true, //A flag that defines if show bind patameters in log.
        // * https://dsinecos.github.io/blog/Debugging-ResourceRequest-Timed-Out-Error-In-Sequelize
        // * https://github.com/sequelize/sequelize/issues/7884
        pool: {
          max: 100,
          min: 0,
          idle: 10000,
          maxIdleTime: 10000,
          acquire: 20000,
        },
      },
    },
  },
  production: {
    apiVersion: process.env.API_VERSION,
    imagesPath: process.env.IMAGES_PATH,
    root: rootPath,
    app: {
      name: 'mobiroad',
    },
    port: process.env.NODE_PORT,
    db: {
      database: process.env.DATABASE_NAME,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      define: {
        timestamps: true,
        underscored: true,
      },
      options: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        minifyAliases: true,
        dialectOptions: {
          options: {
            requestTimeout: 10000,
          },
        },
        logging: false,
        pool: {
          max: 100,
          min: 0,
          idle: 10000,
          maxIdleTime: 10000,
          acquire: 20000,
        },
      },
    },
  },
};

module.exports = config[env];
