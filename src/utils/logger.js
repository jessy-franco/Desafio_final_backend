import winston from "winston";
import {environment} from "../config/config.js"

const LOG_LEVEL  = (environment.LOG_LEVEL);

const customLevelsOptions = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    }, 
    colors: {
        fatal: "brightRed",
        error: "red",
        warning: "yellow",
        info: "blue",
        http: "magenta",
        debug: "white"
    }
}

export const logger = winston.createLogger({
    levels: customLevelsOptions.levels,
    transports: [
        new winston.transports.Console({
            level: LOG_LEVEL || 'debug',
            format: winston.format.combine(
                winston.format.colorize({ colors:customLevelsOptions.colors}),
                winston.format.simple(),
            ),
        }),
        
        new winston.transports.File({
            filename: "./errors.log",
            level: "error",
            format: winston.format.simple()
        })
    ]
})

export const addLogger = (req, res, next)=>{
    req.logger = logger;
    req.logger.http(`${req.method} en ${req.url} - ${new Date().toLocaleTimeString}`)
    next();
}
console.log(`soy: ${LOG_LEVEL}`)
