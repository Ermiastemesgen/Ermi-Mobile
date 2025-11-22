// Update admin credentials
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

const oldEmail = 'admin@ermimobile.com';
const newEmail = 'ermias616@gmail.com';
const newPassword = 'Ermi@0211';

async function updateAdmin() {
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update email and password
        db.run(
            'UPDATE users SET email = ?, password = ? WHERE email = ?',
            [newEmail, hashedPassword, oldEmail],
            function(err) {
                if (err) {
                    console.error('❌ Error updating admin:', err.message);
                } else if (this.changes === 0) {
                    console.log('❌ Admin account not found');
                } else {
                    console.log('✅ Admin credentials updated successfully!\n');
                    console.log('📧 New Email:', newEmail);
                    console.log('🔑 New Password:', newPassword);
                    console.log('\n💡 You can now login with these credentials');
                }
                
                db.close();
            }
        );
    } catch (error) {
        console.error('❌ Error:', error.message);
        db.close();
    }
}

console.log('🔐 Updating Admin Credentials\n');
console.log('Old Email:', oldEmail);
console.log('New Email:', newEmail);
console.log('New Password: ********\n');

updateAdmin();
