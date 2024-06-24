import express from "express";
import productsRouter from "./routes/productsRouter.js"
import cartsRouter from "./routes/cartsRouter.js"
import loggerRouter from "./routes/loggerRouter.js"
import { engine } from 'express-handlebars';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users.js"
import router from "./routes/sessionRouter2.js"
import viewsRouter from "./routes/viewsRouter.js"
import passport from "passport";
import initializePassport from "./config/passport.config.js"
import { environment } from "./config/config.js"
import { generateProducts } from './services/mockService.js';
import { logger, addLogger } from "./utils/logger.js";
import swaggerUi from "swagger-ui-express";
import exphbs from 'express-handlebars';
import { eq } from './utils/helpers.js'
import swaggerJSDoc from "swagger-jsdoc";
import session from "express-session";
import MongoStore from "connect-mongo";
import { allowInsecurePrototypeAccess } from '@handlebars/allow-prototype-access';
import Handlebars from 'handlebars';    


const app = express();


// Configurar Handlebars
const hbs = exphbs.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
        eq,
    },
    defaultLayout: 'main',
    extname: '.handlebars',
});

// View engine
/* app.engine('handlebars', engine()); */
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', './src/views', './custom-views-path');



/* mongodb */

mongoose.connect(environment.mongoUrl)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
    console.log("Connected to MongoDB Atlas");
});
/* documentacion Swagger */

const swaggerOptions = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: "Documentacion ecommerce SucuRex",
            description: "Pensado para documentar los procesos de productos y carrito",
        }
    },
    apis: ["./src/docs/**/*.yaml"]
}

const specs = swaggerJSDoc(swaggerOptions);

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(specs));


/* middlewares */

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("./src/public"));
app.use(cookieParser("cookieS3cR3tC0D3"));
app.use(session({
    secret: "secretCoder",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: environment.mongoUrl,
        ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
        maxAge: 3600000
    }

}))
initializePassport();
app.use(passport.initialize());
app.use(passport.session());



app.use(addLogger)

// Routers
const routerproducts = productsRouter;
const routercarts = cartsRouter;
const routerSession = router;
const routerLogger = loggerRouter;
const routerUser = userRouter;



app.use("/api/products", routerproducts)
app.use("/api/carts", routercarts)
app.use("/api/sessions", routerSession)
app.use("/", viewsRouter)
app.use("/loggerTest", routerLogger)
app.use("/mail", routerSession)
app.use("/api/users", routerUser);

/* para probar si manda la cookie */
app.get('/ruta', (req, res) => {
    res.cookie('cookie_de_chocolate', 'valor100pesos', { httpOnly: true });
    res.redirect('/current');
});
// Home del sitio
app.get("/", (req, res) => {
    res.redirect("/home");

});

app.get("/loggerTest", (req, res) => {
    req.logger.error("no se pudo renderizar la pagina");
    res.send({ message: "prueba de logger" })
});
app.get("/home", (req, res) => {
    let cartId = null;
    if (req.session.user) {
        cartId = req.session.user.cartId; // Retrieve cartId from session if logged in
    }

    res.render("home", {
        cartId,
        style: "style.css"
    });
});

app.get('/mail', (req, res) => {
    res.render("mail", {
        style: "style.css"
    });
});

app.get("/ping", (req, res) => {
    res.send("Pong!");
});

// Pagina error 404
app.use((req, res, next) => {
    res.render("404", {
        style: "style.css"
    });
});


// Ruta para obtener el usuario actual y la cookie
app.get('/current', (req, res) => {
    const userCookie = req.cookies.user;
    res.status(200).json({ message: 'Usuario obtenido correctamente', userCookie });
    console.log(userCookie)
});

// Endpoint para generar productos falsos
app.get('/mockingproducts', (req, res) => {
    const products = generateProducts(100);
    res.json(products);
});

const PORT = environment.port || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
