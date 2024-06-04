

export function isAdmin(req, res) {
    return req.session.user && req.session.user.role === "admin";
}

export function isPremium(req, res) {
    return req.session.user && req.session.user.role === "premium";
}
