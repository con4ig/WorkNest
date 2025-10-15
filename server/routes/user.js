import express from 'express';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Jeśli jest parametr search - filtruj po username lub email
    if (search && search.trim().length >= 2) {
      query = {
        $or: [
          { username: { $regex: search.trim(), $options: 'i' } }, // case-insensitive
          { email: { $regex: search.trim(), $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query).select('-password');
    res.json({ count: users.length, users: users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// PATCH /api/users/:id/role - zmiana roli użytkownika (tylko Admin)
router.patch('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  const { role } = req.body;
  
  // Walidacja roli
  if (!['employee', 'hr', 'admin'].includes(role)) {
    return res.status(400).json({ 
      message: 'Nieprawidłowa rola. Dozwolone: employee, hr, admin' 
    });
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true } // zwróć zaktualizowanego usera
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    res.json({ 
      message: 'Rola zmieniona pomyślnie', 
      user 
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

export default router;