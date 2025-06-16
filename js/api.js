/* global init*/

const API_URL = window.VITE_API_URL || 'http://localhost:3001/api';

// --- FUNGSI GLOBAL ---

/**
 * Mengupdate tampilan UI berdasarkan status login pengguna.
 * @param {object|null} user - Objek pengguna atau null jika logout.
 */
window.updateUIForLoginState = function (user) {
  const loginRegisterButton = document.getElementById('login-register-button');
  const logoutButton = document.getElementById('logout-button');
  const buyChipButton = document.getElementById('buy-chip-button');
  const userInfoSpan = document.getElementById('user-info');
  const canvasOverlay = document.getElementById('canvas-overlay');
  const leaderboardButton = document.getElementById('leaderboard-button');
  const withdrawButton = document.getElementById('withdraw-button');
  const settingsButton = document.getElementById('settings-button');

  if (user) {
    userInfoSpan.textContent = `Hi, ${user.username} | Chips: ${user.chip_balance.toLocaleString('id-ID')}`;
    userInfoSpan.style.display = 'inline';
    logoutButton.style.display = 'inline-block';
    buyChipButton.style.display = 'inline-block';
    leaderboardButton.style.display = 'inline-block';
    withdrawButton.style.display = 'inline-block';
    settingsButton.style.display = 'inline-block';
    loginRegisterButton.style.display = 'none';
    if (canvasOverlay) {
      canvasOverlay.style.display = 'none';
    }
  } else {
    userInfoSpan.style.display = 'none';
    logoutButton.style.display = 'none';
    buyChipButton.style.display = 'none';
    leaderboardButton.style.display = 'inline-block'; // Peringkat bisa dilihat publik
    withdrawButton.style.display = 'none';
    settingsButton.style.display = 'none';
    loginRegisterButton.style.display = 'inline-block';
    if (canvasOverlay) {
      canvasOverlay.style.display = 'flex';
    }
  }
};

/**
 * Mengambil data user dari server.
 */
window.fetchUserInfo = async function () {
  const token = localStorage.getItem('token');
  if (!token) {
    window.updateUIForLoginState(null);
    return;
  }
  try {
    const response = await fetch(`${API_URL}/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      window.updateUIForLoginState(null);
      if (response.status === 401 || response.status === 403) {
        window.showNotification(
          'Sesi Anda berakhir, silakan login kembali.',
          'error'
        );
      }
      return;
    }

    const user = await response.json();
    window.currentUser = user; // Simpan data user secara global
    window.updateUIForLoginState(user);
    if (typeof init === 'function') {
      init(user);
    }
  } catch (error) {
    console.error('Network error saat fetch user info:', error);
    window.updateUIForLoginState(null);
    window.showNotification('Gagal terhubung ke server.', 'error');
  }
};

// --- Fungsi Helper untuk Form ---
function toggleButtonLoading(button, isLoading) {
  button.disabled = isLoading;
  if (isLoading) {
    button.classList.add('loading');
  } else {
    button.classList.remove('loading');
  }
}

function setFormMessage(form, message, isError = true) {
  const messageEl = form.querySelector('.form-message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = isError ? 'form-message' : 'form-message success';
  }
}

// --- Handler untuk Form-form ---

async function handleAuthFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const isRegister = form.id === 'register-form';
  const endpoint = isRegister ? `${API_URL}/register` : `${API_URL}/login`;

  const email =
    form.elements[isRegister ? 'register-email' : 'login-email'].value;
  const password =
    form.elements[isRegister ? 'register-password' : 'login-password'].value;
  const body = { email, password };
  if (isRegister) {
    body.username = form.elements['register-username'].value;
  }

  toggleButtonLoading(button, true);
  setFormMessage(form, '');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }
    if (isRegister) {
      window.showNotification('Registrasi berhasil! Silakan login.');
      form.reset();
      document.getElementById('show-login').click();
    } else {
      localStorage.setItem('token', data.token);
      window.showNotification('Login berhasil! Selamat datang.');
      window.closeModal(document.getElementById('auth-modal-overlay'));
      window.fetchUserInfo();
    }
  } catch (error) {
    setFormMessage(form, error.message);
  } finally {
    toggleButtonLoading(button, false);
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  window.currentUser = null;
  window.showNotification('Anda telah logout.');
  // Refresh halaman untuk mereset state game sepenuhnya
  setTimeout(() => (window.location.href = window.location.pathname), 500);
}

window.initiateXenditPayment = async function (paket) {
  const token = localStorage.getItem('token');
  if (!token) {
    return window.showNotification(
      'Sesi Anda telah berakhir. Silakan login kembali.',
      'error'
    );
  }
  try {
    window.showNotification('Mengarahkan ke halaman pembayaran...', 'success');
    const response = await fetch(`${API_URL}/payments/create-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paket),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Gagal membuat invoice.');
    }
    window.location.href = data.invoiceUrl;
  } catch (error) {
    window.showNotification(`Error: ${error.message}`, 'error');
  }
};


async function updateBalanceOnServer(newBalance) {
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }
  try {
    await fetch(`${API_URL}/game/update-balance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newBalance: Math.round(newBalance) }),
    });
  } catch (error) {
    console.error('Gagal sinkronisasi saldo ke server:', error);
  }
}

async function handleWithdrawRequest(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const requestData = {
    chipAmount: form.elements['withdraw-chip-amount'].value,
    bankCode: form.elements['withdraw-bank-code'].value,
    accountNumber: form.elements['withdraw-account-number'].value,
    accountHolderName: form.elements['withdraw-account-name'].value,
  };

  toggleButtonLoading(button, true);
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/payouts/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Gagal membuat permintaan.');
    }
    window.showNotification(result.message, 'success');
    // Update UI dengan saldo baru dari respons server
    if (window.currentUser) {
      window.currentUser.chip_balance = result.newBalance;
      window.updateUIForLoginState(window.currentUser);
    }
    if (typeof player !== 'undefined') {
      player.funds = result.newBalance;
    }
    window.closeModal(document.getElementById('withdraw-modal-overlay'));
    form.reset();
  } catch (error) {
    window.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    toggleButtonLoading(button, false);
  }
}

window.fetchAndDisplayLeaderboard = async function () {
  const tableBody = document.getElementById('leaderboard-table-body');
  tableBody.innerHTML =
    '<tr><td colspan="3" class="loading-leaderboard">Memuat data...</td></tr>';
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari server.');
    }
    const players = await response.json();
    tableBody.innerHTML = '';
    if (players.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="3" class="loading-leaderboard">Belum ada data.</td></tr>';
      return;
    }
    players.forEach((p, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${index + 1}</td><td>${p.username}</td><td>${p.chip_balance.toLocaleString('id-ID')}</td>`;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    tableBody.innerHTML =
      '<tr><td colspan="3" class="loading-leaderboard">Gagal memuat data.</td></tr>';
  }
};

// --- [[BARU]] Fungsi API untuk Pengaturan ---
async function handleChangeUsername(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const newUsername = form.elements['new-username'].value;

  toggleButtonLoading(button, true);
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/user/update-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newUsername }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }

    localStorage.setItem('token', result.token); // Simpan token baru
    if (window.currentUser) {
      window.currentUser.username = result.newUsername;
      window.updateUIForLoginState(window.currentUser);
    }
    window.showNotification(result.message, 'success');
    form.reset();
  } catch (error) {
    window.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    toggleButtonLoading(button, false);
  }
}

async function handleChangePassword(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const oldPassword = form.elements['old-password'].value;
  const newPassword = form.elements['new-password'].value;

  toggleButtonLoading(button, true);
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_URL}/user/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }

    window.showNotification(result.message, 'success');
    form.reset();
  } catch (error) {
    window.showNotification(`Error: ${error.message}`, 'error');
  } finally {
    toggleButtonLoading(button, false);
  }
}

// --- Event Listener Utama ---
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    window.showNotification(
      'Pembayaran Anda berhasil! Chip akan segera ditambahkan.',
      'success'
    );
    window.history.replaceState(null, '', window.location.pathname);
  } else if (urlParams.get('payment') === 'failed') {
    window.showNotification('Pembayaran Anda gagal atau dibatalkan.', 'error');
    window.history.replaceState(null, '', window.location.pathname);
  }

  document
    .getElementById('login-form')
    ?.addEventListener('submit', handleAuthFormSubmit);
  document
    .getElementById('register-form')
    ?.addEventListener('submit', handleAuthFormSubmit);
  document
    .getElementById('logout-button')
    ?.addEventListener('click', handleLogout);
  document
    .getElementById('withdraw-form')
    ?.addEventListener('submit', handleWithdrawRequest);
  document
    .getElementById('change-username-form')
    ?.addEventListener('submit', handleChangeUsername);
  document
    .getElementById('change-password-form')
    ?.addEventListener('submit', handleChangePassword);

  if (localStorage.getItem('token')) {
    window.fetchUserInfo();
  } else {
    window.updateUIForLoginState(null);
  }
});

// Fungsi utilitas untuk populate modal withdraw
window.populateWithdrawModal = function () {
  const currentChipsSpan = document.getElementById('withdraw-current-chips');
  const chipAmountInput = document.getElementById('withdraw-chip-amount');
  const userFunds = window.currentUser?.chip_balance || 0;

  if (currentChipsSpan) {
    currentChipsSpan.textContent = userFunds.toLocaleString('id-ID');
  }
  if (chipAmountInput) {
    chipAmountInput.max = userFunds;
  }
};
