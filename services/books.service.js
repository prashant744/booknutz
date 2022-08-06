const crypto = require("crypto");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");

const {
  get_mongodb_url,
  get_gridfs_ref,
} = require("./mongodb_connect.service");

const { get_supported_image_mimes } = require("../utils/general.util");
const mongoose = require("mongoose");

let gridfs_storage = null,
  mongodb_upload_function = null;

function get_mongodb_uploads_storage() {
  if (gridfs_storage === null) {
    // Create storage engine
    const mongodb_url = get_mongodb_url();

    gridfs_storage = new GridFsStorage({
      url: mongodb_url,
      file: (req, file) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              return reject(err);
            }

            const filename =
              buf.toString("hex") + path.extname(file.originalname);
            const fileInfo = {
              filename: filename,
              bucketName: "uploads", // bucketName is kept same as the collection name
            };

            resolve(fileInfo);
          });
        });
      },
    });
  }

  return gridfs_storage;
}

function get_mongodb_upload_function() {
  if (mongodb_upload_function === null) {
    const storage = get_mongodb_uploads_storage();
    const imageMimeTypes = get_supported_image_mimes();

    mongodb_upload_function = multer({
      storage,
      limits: {
        fileSize: 1024 * 1024 * 3,
      },
      fileFilter: (req, file, callback) => {
        if (imageMimeTypes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            "Cannot upload file other than the file formats *.jpeg/*.jpg/*.png/*.webp",
            false
          );
        }
      },
    });
  }

  return mongodb_upload_function;
}

async function fetch_all_books(reverse_order = true) {
  return new Promise(async (resolve, reject) => {
    const gfs = await get_gridfs_ref();

    gfs.files.find().toArray((err, files) => {
      if (!files || files.length === 0) {
        reject("Failed fetching the list of books");
      } else {
        if (reverse_order === true) {
          files.reverse();
        }

        files = files.map((file) => ({
          // default values of No title or No description is given, as mostly we will have the title and description in the database
          title: file?.metadata?.title ?? "No title",
          description: file?.metadata?.description ?? "No description",
          filename: file.filename,
          _id: file._id,
          bookId: "" + file._id,
        }));

        resolve(files);
      }
    });
  });
}

async function fetch_single_book(bookId) {
  return new Promise(async (resolve, reject) => {
    const gfs = await get_gridfs_ref();

    const _id = mongoose.Types.ObjectId(bookId);

    gfs.files.findOne({ _id }, (err, file) => {
      if (!file) {
        reject("No file exists with the provided filename");
      }

      if (get_supported_image_mimes().includes(file.contentType)) {
        // Read output to browser
        const coverImageStream = gfs.createReadStream(file.filename);

        const bookObj = {
          // default values of No title or No description is given, as mostly we will have the title and description in the database
          title: file?.metadata?.title ?? "No title",
          description: file?.metadata?.description ?? "No description",
          filename: file.filename,
          _id: file._id,
          bookId: "" + file._id,
        };

        resolve({ coverImageStream, book: bookObj });
      }
    });
  });
}

async function upload_book(req, res) {
  return new Promise((resolve, reject) => {
    get_mongodb_upload_function().single("file")(req, res, async (err) => {
      /*
      default values of "No title" or "No description" is given just for safety..
      But, admins would obviously provide both the title and description while uploading book..
      */
      const title = req.body?.title ?? "No title";
      const description = req.body?.description ?? "No description";

      if (err) {
        reject("Could not upload the provided book. Please try again!!");
      } else {
        const gfs = await get_gridfs_ref();

        gfs.files.update(
          { filename: req.file?.filename },
          {
            $set: {
              metadata: {
                title,
                description,
              },
            },
          }
        );

        resolve(`Uploaded the book with title: ${title}`);
      }
    });
  });
}

async function delete_book(bookId) {
  return new Promise(async (resolve, reject) => {
    const gfs = await get_gridfs_ref();

    const _id = mongoose.Types.ObjectId(bookId);

    // here `root` field is the mandatory field requiring the collection name
    gfs.remove({ _id, root: "uploads" }, (err) => {
      if (err) {
        reject("Unable to delete this book. Please try again after sometime!!");
      }

      resolve("Deleted the requested book");
    });
  });
}

module.exports = {
  get_mongodb_upload_function,
  upload_book,
  fetch_all_books,
  fetch_single_book,
  delete_book,
};