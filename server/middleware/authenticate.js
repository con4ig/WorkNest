import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Brak tokena, autoryzacja odrzucona" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Pobierz pełne dane użytkownika z bazy, włącznie z firmą
    const user = await User.findById(decoded._id).select("-password").populate("company");

    if (!user) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    req.user = user; // Przypisz cały obiekt użytkownika
    
    console.log("✅ Token OK, user uwierzytelniony:", req.user._id);
    next();
  } catch (err) {
    console.error("❌ Błąd tokena:", err.message);
    res.status(401).json({ message: "Nieprawidłowy token" });
  }
};

export default authenticate;