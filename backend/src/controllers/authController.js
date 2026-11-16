const db = require('../config/db');

exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = db.authenticate(email, password);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: `jwt-simulated-token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

exports.getMe = (req, res) => {
  res.json({
    user: db.data.users[0]
  });
};
