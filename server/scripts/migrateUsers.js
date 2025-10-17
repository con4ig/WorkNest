// scripts/migrateUsers.js
// Uruchom: node scripts/migrateUsers.js

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hr-system';

async function migrateUsers() {
    try {
        console.log('🔄 Łączenie z bazą danych...');
        await mongoose.connect(mongoUri);
        console.log('✅ Połączono z bazą danych');

        console.log('📝 Aktualizowanie istniejących użytkowników...');
        
        const result = await User.updateMany(
            {},
            {
                $set: {
                    firstName: { $cond: [{ $ifNull: ['$firstName', false] }, '$firstName', ''] },
                    lastName: { $cond: [{ $ifNull: ['$lastName', false] }, '$lastName', ''] },
                    phoneNumber: { $cond: [{ $ifNull: ['$phoneNumber', false] }, '$phoneNumber', ''] },
                    position: { $cond: [{ $ifNull: ['$position', false] }, '$position', ''] },
                    department: { $cond: [{ $ifNull: ['$department', false] }, '$department', ''] },
                    hireDate: { $cond: [{ $ifNull: ['$hireDate', false] }, '$hireDate', null] },
                    salary: { $cond: [{ $ifNull: ['$salary', false] }, '$salary', 0] },
                    status: { $cond: [{ $ifNull: ['$status', false] }, '$status', 'active'] },
                    contractType: { $cond: [{ $ifNull: ['$contractType', false] }, '$contractType', 'full-time'] },
                    address: { $cond: [{ $ifNull: ['$address', false] }, '$address', ''] },
                    city: { $cond: [{ $ifNull: ['$city', false] }, '$city', ''] },
                    peselOrId: { $cond: [{ $ifNull: ['$peselOrId', false] }, '$peselOrId', ''] },
                    notes: { $cond: [{ $ifNull: ['$notes', false] }, '$notes', ''] },
                }
            }
        );

        console.log(`✅ Aktualizowano ${result.modifiedCount} użytkowników`);
        
        // Wyświetl próbkę
        const sample = await User.findOne().select('-password');
        console.log('\n📊 Przykład zaktualizowanego użytkownika:');
        console.log(JSON.stringify(sample, null, 2));

        console.log('\n✅ Migracja ukończona!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Błąd podczas migracji:', error);
        process.exit(1);
    }
}

migrateUsers();