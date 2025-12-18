import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Brak tokenu lub nieprawidłowy format." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Znajdź użytkownika i dołącz dane firmy
    const user = await User.findById(decoded._id)
      .populate("company") // KLUCZOWA ZMIANA: Zawsze dołączaj pełne dane firmy
      .select("-password");

    if (!user) {
      return res.status(401).json({ message: "Użytkownik nie znaleziony" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token jest nieprawidłowy lub wygasł." });
  }
};

export default authenticate;
