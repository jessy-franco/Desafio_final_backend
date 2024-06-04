

export const generateTokenForPasswordReset = (req, email) => {
    const token = Math.random().toString(36).substr(2) + Date.now().toString(36); 
    req.session.resetToken = {
        token: token,
        email: email,
        timestamp: Date.now(),
    };
};

export const verifyEmailToken = (req) => {
    const { resetToken } = req.session;
    if (!resetToken) {
        return false;
    }

    const { timestamp } = resetToken;
    const currentTime = Date.now();
    return currentTime - timestamp < 60 * 60 * 1000;
};