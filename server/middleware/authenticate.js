import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    console.log("❌ Brak tokena w cookies");
    return res.status(401).json({ message: "Brak tokena" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Dodaj zarówno _id jak i id dla kompatybilności
    req.user = {
      ...decoded,
      id: decoded._id // Dodaj 'id' jako alias do '_id'
    };
    
    console.log("✅ Token OK, user:", req.user._id);
    next();
  } catch (err) {
    console.error("❌ Błąd tokena:", err.message);
    res.status(403).json({ message: "Nieprawidłowy token" });
  }
};

export default authenticate;