const tenantMiddleware = (req, res, next) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(400).json({ message: 'Tenant context missing' });
  }
  req.tenantId = req.user.tenantId;
  next();
};

module.exports = { tenantMiddleware };
