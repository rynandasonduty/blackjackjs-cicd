// file: server/index.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const db = require('./db');

// === INISIALISASI XENDIT CLIENT ===
// Client Xendit tetap ada untuk webhook pembayaran, tapi tidak untuk payout
// const { Xendit } = require('xendit-node');
// const xenditClient = new Xendit({
//   secretKey: process.env.XENDIT_API_KEY,
// });

const app = express();
const port = process.env.PORT || 3001;
// === MIDDLEWARE SETUP ===
app.use(cors());
app.use(express.json());

// === MIDDLEWARE AUTHENTICATION ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token === null) {
    return res.sendStatus(401);
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// === API ENDPOINTS (Registrasi, Login, User, Update Balance tidak berubah) ===
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const startingChips = 100;
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, chip_balance) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, startingChips]
    );
    res
      .status(201)
      .json({ message: 'User berhasil didaftarkan', userId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res
        .status(409)
        .json({ message: 'Username atau Email sudah terdaftar' });
    }
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ message: 'Login berhasil', token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, email, chip_balance FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get User Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post('/api/game/update-balance', authenticateToken, async (req, res) => {
  const { newBalance } = req.body;
  const userId = req.user.id;
  if (typeof newBalance === 'undefined' || newBalance < 0) {
    return res.status(400).json({ message: 'Nilai saldo baru tidak valid.' });
  }
  try {
    await db.execute('UPDATE users SET chip_balance = ? WHERE id = ?', [
      newBalance,
      userId,
    ]);
    res.json({ message: 'Saldo berhasil diperbarui' });
  } catch (error) {
    console.error('Update Balance Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui saldo di server.' });
  }
});

// === ENDPOINT PEMBAYARAN (Tidak Berubah) ===
app.post(
  '/api/payments/create-invoice',
  authenticateToken,
  async (req, res) => {
    const XENDIT_API_URL = 'https://api.xendit.co/v2/invoices';
    const SECRET_KEY = process.env.XENDIT_API_KEY;

    try {
      const { amount, chipAmount, packageId } = req.body;
      const externalId = `BJ-TXN-${packageId}-${Date.now()}-${req.user.id}`;

      const invoicePayload = {
        external_id: externalId,
        amount: parseInt(amount, 10),
        customer: {
          given_names: req.user.username,
          email: req.user.email,
        },
        description: `Pembelian ${chipAmount} Chips untuk game BlackjackJS`,
        // Ganti dengan URL Heroku Anda
        success_redirect_url: 'https://blackjackjs-22775fe9e0ef.herokuapp.com/?payment=success', // <-- UBAH BARIS INI
        failure_redirect_url: 'https://blackjackjs-22775fe9e0ef.herokuapp.com/?payment=failed', // <-- UBAH BARIS INI
      };

      const authToken = Buffer.from(`${SECRET_KEY}:`).toString('base64');
      const response = await axios.post(XENDIT_API_URL, invoicePayload, {
        headers: {
          Authorization: `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const invoice = response.data;

      await db.execute(
        'INSERT INTO transactions (user_id, type, amount, chip_amount, status, payment_gateway_id, payment_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [
          req.user.id,
          'purchase',
          invoicePayload.amount,
          chipAmount,
          'PENDING',
          externalId,
          invoice.invoice_url,
        ]
      );

      res.json({ invoiceUrl: invoice.invoice_url });
    } catch (error) {
      console.error('\n--- AXIOS REQUEST TO XENDIT FAILED ---');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error('Error:', error.message);
      }
      res.status(500).json({ message: 'Gagal membuat invoice pembayaran' });
    }
  }
);

// === ENDPOINT LEADERBOARD ===
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT username, chip_balance FROM users ORDER BY chip_balance DESC LIMIT 10'
    );
    res.json(rows);
  } catch (error) {
    console.error('Leaderboard Fetch Error:', error);
    res.status(500).json({ message: 'Gagal mengambil data papan peringkat' });
  }
});

// === [[MODIFIKASI]] ENDPOINT WITHDRAW (TANPA XENDIT) ===
// Endpoint ini hanya mencatat permintaan dan memotong chip.
app.post('/api/payouts/request', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { chipAmount, bankCode, accountHolderName, accountNumber } = req.body;
    const userId = req.user.id;

    if (!chipAmount || !bankCode || !accountHolderName || !accountNumber) {
      await connection.rollback();
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    const chipsToWithdraw = parseInt(chipAmount, 10);
    const MINIMUM_WITHDRAW = 7000;

    if (isNaN(chipsToWithdraw) || chipsToWithdraw < MINIMUM_WITHDRAW) {
      await connection.rollback();
      return res.status(400).json({
        message: `Withdraw minimal adalah ${MINIMUM_WITHDRAW} chips.`,
      });
    }

    const [rows] = await connection.execute(
      'SELECT chip_balance FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );
    const currentUser = rows[0];

    if (!currentUser || currentUser.chip_balance < chipsToWithdraw) {
      await connection.rollback();
      return res
        .status(400)
        .json({ message: 'Saldo chip Anda tidak mencukupi.' });
    }

    const idrAmount = (chipsToWithdraw / 7000) * 100000;
    const newBalance = currentUser.chip_balance - chipsToWithdraw;

    await connection.execute('UPDATE users SET chip_balance = ? WHERE id = ?', [
      newBalance,
      userId,
    ]);

    await connection.execute(
      'INSERT INTO withdrawals (user_id, chip_amount, idr_amount, bank_code, account_holder_name, account_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        chipsToWithdraw,
        idrAmount,
        bankCode,
        accountHolderName,
        accountNumber,
        'COMPLETED_DUMMY',
      ]
    );

    await connection.commit();

    res.status(200).json({
      message: `Permintaan withdraw ${chipsToWithdraw.toLocaleString('id-ID')} chips Anda telah dicatat.`,
      newBalance: newBalance,
    });
  } catch (error) {
    await connection.rollback();
    console.error('💥 Dummy Withdraw Request Error:', error.message);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memproses permintaan withdraw.',
    });
  } finally {
    connection.release();
  }
});

// === [[BARU]] ENDPOINTS UNTUK PENGATURAN ===
app.post('/api/user/update-username', authenticateToken, async (req, res) => {
  const { newUsername } = req.body;
  const userId = req.user.id;

  if (!newUsername || newUsername.length < 3) {
    return res.status(400).json({ message: 'Username minimal 3 karakter.' });
  }

  try {
    // Cek jika username sudah ada
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [newUsername, userId]
    );
    if (rows.length > 0) {
      return res
        .status(409)
        .json({ message: 'Username sudah digunakan oleh pengguna lain.' });
    }

    await db.execute('UPDATE users SET username = ? WHERE id = ?', [
      newUsername,
      userId,
    ]);

    // Buat token baru dengan username baru
    const [userRows] = await db.execute(
      'SELECT id, email, username FROM users WHERE id = ?',
      [userId]
    );
    const updatedUser = userRows[0];
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Username berhasil diperbarui.',
      newUsername: newUsername,
      token: token,
    });
  } catch (error) {
    console.error('Update Username Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui username.' });
  }
});

app.post('/api/user/update-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!oldPassword || !newPassword || newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: 'Password baru minimal 6 karakter.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password lama tidak sesuai.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [
      hashedNewPassword,
      userId,
    ]);

    res.json({ message: 'Password berhasil diperbarui.' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ message: 'Gagal memperbarui password.' });
  }
});

// === WEBHOOK XENDIT (Tidak Berubah) ===
app.post('/api/webhooks/xendit', async (req, res) => {
  try {
    const callbackToken = req.headers['x-callback-token'];
    if (callbackToken !== process.env.XENDIT_CALLBACK_VERIFICATION_TOKEN) {
      return res.status(401).send('Invalid callback token');
    }
    const notification = req.body;
    if (notification.status !== 'PAID') {
      return res.status(200).send('Event ignored, status is not PAID');
    }
    const { external_id: externalId, paid_amount } = notification;
    const [rows] = await db.execute(
      'SELECT * FROM transactions WHERE payment_gateway_id = ?',
      [externalId]
    );
    if (rows.length === 0) {
      return res.status(404).send('Transaction not found');
    }
    const transaction = rows[0];
    if (transaction.status.toUpperCase() !== 'PENDING') {
      return res.status(200).send('Transaction already processed');
    }
    if (paid_amount < transaction.amount) {
      await db.execute('UPDATE transactions SET status = ? WHERE id = ?', [
        'FAILED',
        transaction.id,
      ]);
      return res.status(200).send('Underpaid transaction');
    }
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
      await connection.execute(
        'UPDATE transactions SET status = ? WHERE id = ?',
        ['SUCCESS', transaction.id]
      );
      await connection.execute(
        'UPDATE users SET chip_balance = chip_balance + ? WHERE id = ?',
        [transaction.chip_amount, transaction.user_id]
      );
      await connection.commit();
      console.log(
        `✅ SUCCESS: ${transaction.chip_amount} chips ditambahkan ke user ${transaction.user_id}`
      );
    } catch (dbError) {
      await connection.rollback();
      console.error('💥 Database transaction failed:', dbError);
      return res.status(500).send('Database update failed');
    } finally {
      connection.release();
    }
    res.status(200).send('Webhook processed successfully');
  } catch (error) {
    console.error('💥 Webhook Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// === START SERVER ===
app.listen(port, () => {
  console.log(`🚀 Backend server berjalan di port ${port}`);
});