// Script to change admin password
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const db = new sqlite3.Database('./emobile.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to database\n');
});

function changePassword() {
    rl.question('Enter admin email (default: admin@ermimobile.com): ', (email) => {
        const adminEmail = email.trim() || 'admin@ermimobile.com';
        
        rl.question('Enter new password: ', async (newPassword) => {
            if (newPassword.length < 6) {
                console.log('❌ Password must be at least 6 characters long');
                db.close();
                rl.close();
                return;
            }
            
            try {
                // Hash the new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                
                // Update the password in database
                db.run(
                    'UPDATE users SET password = ? WHERE email = ?',
                    [hashedPassword, adminEmail],
                    function(err) {
                        if (err) {
                            console.error('❌ Error updating password:', err.message);
                        } else if (this.changes === 0) {
                            console.log('❌ User not found with email:', adminEmail);
                        } else {
                            console.log('\n✅ Password updated successfully!');
                            console.log('📧 Email:', adminEmail);
                            console.log('🔑 New password:', newPassword);
                            console.log('\n💡 You can now login with the new password');
                        }
                        
                        db.close();
                        rl.close();
                    }
                );
            } catch (error) {
                console.error('❌ Error:', error.message);
                db.close();
                rl.close();
            }
        });
    });
}

console.log('🔐 Admin Password Change Tool\n');
changePassword();
