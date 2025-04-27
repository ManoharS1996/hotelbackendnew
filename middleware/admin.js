module.exports = function(req, res, next) {
    // Assuming you have a role field in your User model
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  };