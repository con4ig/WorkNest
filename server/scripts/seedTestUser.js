// scripts/seedTestUser.js
// Uruchom: node scripts/seedTestUser.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.DB_URI || 'mongodb://localhost:27017/hr-system';

async function seedTestUser() {
    try {
        console.log('🔄 Łączenie z bazą danych...');
        await mongoose.connect(mongoUri);
        console.log('✅ Połączono z bazą danych');

        // Sprawdź czy użytkownik już istnieje
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('⚠️  Użytkownik test@example.com już istnieje');
            process.exit(0);
        }

        // Haszuj hasło
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Utwórz testowego użytkownika
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            firstName: 'Jan',
            lastName: 'Kowalski',
            role: 'admin',
            phoneNumber: '+48123456789',
            position: 'Senior Developer',
            department: 'IT',
            hireDate: new Date('2023-01-15'),
            salary: 8000,
            status: 'active',
            contractType: 'full-time',
            address: 'ul. Warszawska 123',
            city: 'Warszawa',
            peselOrId: '12345678901',
            notes: 'To jest testowy użytkownik do debugowania'
        });

        await testUser.save();

        console.log('\n✅ Testowy użytkownik został utworzony!');
        console.log('\n📋 Dane logowania:');
        console.log('   Email: test@example.com');
        console.log('   Hasło: password123');
        console.log(`\n🔗 URL profilu: http://localhost:3000/employees/${testUser._id}`);
        console.log('\n📊 Dane profilu:');
        console.log(`   Imię i nazwisko: Jan Kowalski`);
        console.log(`   Stanowisko: Senior Developer`);
        console.log(`   Dział: IT`);
        console.log(`   Pensja: 8000 PLN`);
        console.log(`   Status: active`);
        console.log(`   Typ umowy: full-time`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd:', error.message);
        process.exit(1);
    }
}

seedTestUser();