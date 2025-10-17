import express from 'express';
import User from '../models/User.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = express.Router();

// ============================================
// GET /api/users
// Lista wszystkich pracowników (HR i Admin)
// ============================================
router.get('/', authenticate, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};
    
    // Jeśli jest parametr search - filtruj po username, email, firstName lub lastName
    if (search && search.trim().length >= 2) {
      query = {
        $or: [
          { username: { $regex: search.trim(), $options: 'i' } },
          { email: { $regex: search.trim(), $options: 'i' } },
          { firstName: { $regex: search.trim(), $options: 'i' } },
          { lastName: { $regex: search.trim(), $options: 'i' } }
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

// ============================================
// GET /api/users/:id
// Pobieranie danych konkretnego pracownika
// ============================================
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Sprawdzenie czy middleware authenticate ustawił req.user
    if (!req.user) {
      console.error('❌ req.user jest undefined - middleware authenticate nie działa');
      return res.status(401).json({ message: 'Nie jesteś zalogowany' });
    }

    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    // Sprawdzenie uprawnień: user może obejrzeć swoje dane, HR/Admin mogą obejrzeć każdego
    if (req.user._id.toString() !== req.params.id && !['hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Brak uprawnień do przeglądania tego profilu' });
    }
    
    // Zwróć wszystkie dostępne pola, nawet jeśli są puste
    res.json({
      _id: user._id,
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      position: user.position || '',
      department: user.department || '',
      hireDate: user.hireDate || null,
      salary: user.salary || 0,
      status: user.status || 'active',
      contractType: user.contractType || 'full-time',
      role: user.role || 'employee',
      address: user.address || '',
      city: user.city || '',
      peselOrId: user.peselOrId || '',
      notes: user.notes || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// ============================================
// PATCH /api/users/:id
// Aktualizacja danych pracownika
// - User może edytować swoje dane (bez roli)
// - HR/Admin mogą edytować wszystko (w tym rolę)
// ============================================
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    const isOwnProfile = req.user._id.toString() === userId;
    const isAdmin = ['hr', 'admin'].includes(req.user.role);

    // Sprawdzenie uprawnień: tylko HR/Admin mogą edytować cudze dane
    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ message: 'Możesz edytować tylko swoje dane' });
    }

    const { 
      username,
      email,
      firstName,
      lastName,
      phoneNumber,
      position,
      department,
      hireDate,
      salary,
      status,
      contractType,
      role,
      address,
      city,
      peselOrId,
      notes
    } = req.body;
    
    // Walidacja danych
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Nieprawidłowy format email' });
      }
    }
    
    if (status && !['active', 'inactive', 'on-leave', 'terminated'].includes(status)) {
      return res.status(400).json({ 
        message: 'Nieprawidłowy status. Dozwolone: active, inactive, on-leave, terminated' 
      });
    }
    
    if (contractType && !['full-time', 'part-time', 'contract', 'temporary'].includes(contractType)) {
      return res.status(400).json({ 
        message: 'Nieprawidłowy typ umowy. Dozwolone: full-time, part-time, contract, temporary' 
      });
    }
    
    if (role && !['employee', 'hr', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Nieprawidłowa rola. Dozwolone: employee, hr, admin' 
      });
    }

    // Pracownicy nie mogą zmieniać swojej roli
    if (!isAdmin && role) {
      return res.status(403).json({ message: 'Nie możesz zmieniać swoją rolę' });
    }
    
    if (salary !== undefined && salary < 0) {
      return res.status(400).json({ message: 'Pensja nie może być ujemna' });
    }
    
    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    // Sprawdzenie czy email już istnieje (jeśli zmienia się email)
    if (email && email !== existingUser.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email jest już w użyciu' });
      }
    }
    
    // Przygotowanie obiektu do aktualizacji (tylko niepuste pola)
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (position !== undefined) updateData.position = position;
    if (department !== undefined) updateData.department = department;
    if (hireDate !== undefined) updateData.hireDate = hireDate ? new Date(hireDate) : null;
    if (salary !== undefined) updateData.salary = salary;
    if (status !== undefined) updateData.status = status;
    if (contractType !== undefined) updateData.contractType = contractType;
    if (role !== undefined && isAdmin) updateData.role = role; // Tylko Admin może zmieniać rolę
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (peselOrId !== undefined) updateData.peselOrId = peselOrId;
    if (notes !== undefined) updateData.notes = notes;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ 
      message: 'Dane pracownika zaktualizowane pomyślnie', 
      user: updatedUser 
    });
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

// ============================================
// PATCH /api/users/:id/role
// Zmiana roli użytkownika (tylko Admin)
// ============================================
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
      { new: true }
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

// ============================================
// DELETE /api/users/:id
// Usunięcie pracownika (tylko Admin)
// ============================================
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Nie pozwól usunąć samego siebie
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Nie możesz usunąć własnego konta' });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    
    res.json({ message: 'Użytkownik usunięty pomyślnie' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
});

export default router;