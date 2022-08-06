const Grid = require("gridfs-stream");
const mongoose = require("mongoose");

let gfs = null;

function get_mongodb_url() {
  return process.env.MONGO_URL;
}

async function connect_mongodb() {
  return new Promise((resolve, reject) => {
    let url = get_mongodb_url();

    mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

    const conn = mongoose.connection;

    conn.once("open", () => {
      console.log("Connected");
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection("uploads");
      resolve(gfs);
    });

    conn.on("error", (err) => {
      reject("Mongodb connection failed");
    });
  });
}

async function get_gridfs_ref() {
  if (gfs === null) {
    gfs = await connect_mongodb();
  }

  return gfs;
}

module.exports = {
  connect_mongodb,
  get_gridfs_ref,
  get_mongodb_url,
};