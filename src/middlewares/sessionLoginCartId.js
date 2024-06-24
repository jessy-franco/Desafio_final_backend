// Middleware para verificar si el usuario está logueado
export function isLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login?Tu_sesión_ha_expirado. Inicia_sesión_nuevamente');
    }
}