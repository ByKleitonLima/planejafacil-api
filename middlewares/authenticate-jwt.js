export async function authenticateToken(req, res, next, auth) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Usuário não autorizado' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedIdToken = await auth.verifyIdToken(token, true);
        req.user = { uid: decodedIdToken.uid };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Usuário não autorizado' });
    }
}