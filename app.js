if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
      path: __dirname + "/.env.local",
    });
  }
  
  const express = require("express");
  const path = require("path");
  const passport = require("passport");
  const session = require("express-session");
  const cookieParser = require("cookie-parser");
  const methodOverride = require("method-override");
  const expressLayouts = require("express-ejs-layouts");
  
  const { initializePassport } = require("./services/passport_init.service");
  const { connect_mongodb } = require("./services/mongodb_connect.service");
  
  const { passGlobalVarsToEjsPage } = require("./middlewares/global.middleware");
  
  const {
    allow_admins_only,
    allow_signedin_users_only,
  } = require("./middlewares/auth.middleware");
  
  const { AppError } = require("./utils/errors.util");
  
  const app = express();
  
  initializePassport(); // initialize passport using our own utils
  // connect to mongodb
  (async () => {
    try {
      await db();
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
  
  // Text Compression
  app.use(require("compression")());
  
  app.use(
    cookieParser(
      process.env.COOKIE_SECRET ||
        "5277b8f3d74c4839e3b9bc8074b60534c400fa803ae2587b1e96ab01316ff29fa7a0aad9159db704ad12c981bca759cd"
    )
  );
  
  app.use(
    session({
      // express session
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        // sameSite is set to lax, to prevent CSRF attack..
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs written in milliseconds
        secure: process.env.NODE_ENV === "production", // secure only on production environment
        signed: true, // signed cookie
      },
    })
  );
  
  // initialize passport and its respective session too, for having the auth management
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setting views
  app.set("view engine", "ejs");
  app.set("views", __dirname + "/views");
  
  // setting layout files for ejs
  app.use(expressLayouts);
  app.set("layout", "layouts/layout");
  
  app.use(express.static("public"));
  app.use(methodOverride("_method"));
  
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  
  // pass the global user settings or others to the res.locals so that we can render them in any ejs page
  app.use(passGlobalVarsToEjsPage);
  
  // Home Page
  app.get("/", async (req, res) => {
    return res.render("index");
  });
  
  // auth route for login and signup
  app.use("/auth", require("./routes/auth.route"));
  
  // user route for logout and delete user functionality
  app.use("/user", allow_signedin_users_only, require("./routes/user.route"));
  
  app.use("/books", require("./routes/books.route"));
  
  app.use(
    "/payment",
    allow_signedin_users_only,
    require("./routes/payment.route")
  );
  
  app.use("/admin", allow_admins_only, require("./routes/admin.route"));
  
  // send the robots.txt file for SEO
  app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(__dirname, "./robots.txt"));
  });
  
  // send 404 page for other paths
  app.get("/*", (req, res) => {
    res.render("404");
  });
  
  app.use((err, req, res, next) => {
    // console.error(err);
  
    const getPageFromUri = (targetUri = "/") => {
      return {
        "/": "index",
        "/auth/login": "auth/login",
        "/auth/signup": "auth/signup",
        "/auth/verify": "auth/verify",
        "/user/logout": "user/logout",
        "/user/delete": "user/delete",
        "/admin": "admin/index",
        404: "404",
      }[targetUri];
    };
  
    if (err instanceof AppError) {
      // if err is our own modified AppError, then get all our attributes
      // for the targetUri, we get the page and render that page with proper error message
      const pageToRender = getPageFromUri(err.targetUri);
  
      if (pageToRender) {
        return res.status(err.statusCode).render(pageToRender, {
          error_msg: err.message,
        });
      } else {
        return res.status(err.statusCode).render("index", {
          error_msg: err.message,
        });
      }
    }
  
    const pageToRender = getPageFromUri(req.originalUrl);
  
    // if we don't have any page for that url,
    // then we will get pageToRender as undefined, so we can render index.ejs page
    return res.status(500).render(pageToRender ?? "index", {
      error_msg: "Server encountered some error. Please try after sometime..",
    });
  });
  
  /*
  We have to keep the environment variable name as PORT only, 
  as heroku injects `PORT` environment variable automatically..
  and we don't need to pass PORT to the environment variables of Heroku explicitly.
  I have to research more if we can keep other environment names also.. 
  I think we should be able to, but would confirm after researching..
  */
  const PORT = process.env.PORT || 3000;
  
  /*
  Also we have to add hostname, as "0.0.0.0" or else heroku gives error as linked below:
  Issue mentioned online: https://github.com/keystonejs/keystone-classic/issues/3994
  */
  app.listen(PORT, "0.0.0.0", () => console.log(`Server started on ${PORT}`));