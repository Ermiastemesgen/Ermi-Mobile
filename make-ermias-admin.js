// Make ermias616@gmail.com an admin with new password
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./emobile.db');

const email = 'ermias616@gmail.com';
const newPassword = 'Ermi@0211';
const role = 'admin';

async function updateUser() {
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password and role
        db.run(
            'UPDATE users SET password = ?, role = ? WHERE email = ?',
            [hashedPassword, role, email],
            function(err) {
                if (err) {
                    console.error('❌ Error:', err.message);
                } else if (this.changes === 0) {
                    console.log('❌ User not found');
                } else {
                    console.log('✅ User updated successfully!\n');
                    console.log('📧 Email:', email);
                    console.log('🔑 Password:', newPassword);
                    console.log('👑 Role:', role);
                    console.log('\n💡 You can now login as admin with these credentials!');
                }
                
                db.close();
            }
        );
    } catch (error) {
        console.error('❌ Error:', error.message);
        db.close();
    }
}

console.log('🔐 Making ermias616@gmail.com an admin...\n');
updateUser();
