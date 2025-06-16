/* global toggleMusic */

// =================================================================
//        FILE: js/ui-controller.js (Versi dengan Settings & Notifikasi)
// =================================================================

// --- [[BARU]] Fungsi untuk menampilkan notifikasi ---
window.showNotification = function (message, type = 'success') {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`; // 'success' atau 'error'
  notification.textContent = message;

  container.appendChild(notification);

  // Hapus notifikasi setelah animasi selesai
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

document.addEventListener('DOMContentLoaded', function () {
  // --- 1. Ambil semua elemen UI ---
  const helpButton = document.getElementById('help-button');
  const helpModalOverlay = document.getElementById('help-modal-overlay');
  const closeModalButton = document.getElementById('close-modal-button');

  const authModalOverlay = document.getElementById('auth-modal-overlay');
  const loginRegisterButton = document.getElementById('login-register-button');
  const closeAuthModalButton = document.getElementById(
    'close-auth-modal-button'
  );

  const buyChipButton = document.getElementById('buy-chip-button');
  const shopModalOverlay = document.getElementById('shop-modal-overlay');
  const closeShopModalButton = document.getElementById(
    'close-shop-modal-button'
  );
  const packageCards = document.querySelectorAll('.shop-package-card');

  const leaderboardButton = document.getElementById('leaderboard-button');
  const leaderboardModalOverlay = document.getElementById(
    'leaderboard-modal-overlay'
  );
  const closeLeaderboardModalButton = document.getElementById(
    'close-leaderboard-modal-button'
  );

  const withdrawButton = document.getElementById('withdraw-button');
  const withdrawModalOverlay = document.getElementById(
    'withdraw-modal-overlay'
  );
  const closeWithdrawModalButton = document.getElementById(
    'close-withdraw-modal-button'
  );
  const chipAmountInput = document.getElementById('withdraw-chip-amount');
  const idrEquivalentText = document.getElementById('withdraw-idr-equivalent');

  // [[BARU]] Elemen untuk Modal Pengaturan
  const settingsButton = document.getElementById('settings-button');
  const settingsModalOverlay = document.getElementById(
    'settings-modal-overlay'
  );
  const closeSettingsModalButton = document.getElementById(
    'close-settings-modal-button'
  );
  const musicToggle = document.getElementById('music-toggle');

  const loginView = document.getElementById('login-view');
  const registerView = document.getElementById('register-view');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const hamburgerButton = document.getElementById('hamburger-button');
  const hamburgerMenu = document.getElementById('hamburger-menu');

  // --- 2. Fungsi Umum untuk Mengontrol Modal ---
  window.openModal = (modalOverlay) => {
    if (!modalOverlay) {
      return;
    }
    modalOverlay.style.display = 'flex';
    setTimeout(() => modalOverlay.classList.add('active'), 10);
  };

  window.closeModal = (modalOverlay) => {
    if (!modalOverlay) {
      return;
    }
    modalOverlay.classList.remove('active');
    setTimeout(() => (modalOverlay.style.display = 'none'), 400);
  };

  // Fungsi untuk menutup semua modal
  const closeAllModals = () => {
    document
      .querySelectorAll('.modal-overlay.active')
      .forEach(window.closeModal);
  };

  // --- 3. Logika untuk semua modal ---
  const setupModal = (button, overlay, closeButton, onOpen) => {
    if (button) {
      button.addEventListener('click', () => {
        closeAllModals();
        if (onOpen) {
          onOpen();
        }
        window.openModal(overlay);
      });
    }
    if (closeButton) {
      closeButton.addEventListener('click', () => window.closeModal(overlay));
    }
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          window.closeModal(overlay);
        }
      });
    }
  };

  setupModal(helpButton, helpModalOverlay, closeModalButton);
  setupModal(
    loginRegisterButton,
    authModalOverlay,
    closeAuthModalButton,
    () => {
      loginView.style.display = 'block';
      registerView.style.display = 'none';
    }
  );
  setupModal(buyChipButton, shopModalOverlay, closeShopModalButton);
  setupModal(
    leaderboardButton,
    leaderboardModalOverlay,
    closeLeaderboardModalButton,
    window.fetchAndDisplayLeaderboard
  );
  setupModal(
    withdrawButton,
    withdrawModalOverlay,
    closeWithdrawModalButton,
    window.populateWithdrawModal
  );
  setupModal(settingsButton, settingsModalOverlay, closeSettingsModalButton);

  // --- 4. Logika untuk Hamburger Menu ---
  if (hamburgerButton && hamburgerMenu) {
    hamburgerButton.addEventListener('click', function (event) {
      event.stopPropagation();
      hamburgerButton.classList.toggle('active');
      hamburgerMenu.classList.toggle('active');
    });

    document.addEventListener('click', function (event) {
      const isClickInsideMenu = hamburgerMenu.contains(event.target);
      const isClickOnButton = hamburgerButton.contains(event.target);
      if (
        !isClickInsideMenu &&
        !isClickOnButton &&
        hamburgerMenu.classList.contains('active')
      ) {
        hamburgerButton.classList.remove('active');
        hamburgerMenu.classList.remove('active');
      }
    });
  }

  // --- 5. Event Listeners untuk konten modal ---
  packageCards.forEach((card) => {
    card.addEventListener('click', () => {
      window.initiateXenditPayment({
        packageId: card.dataset.packageId,
        amount: parseInt(card.dataset.amount, 10),
        chipAmount: parseInt(card.dataset.chipAmount, 10),
      });
      window.closeModal(shopModalOverlay);
    });
  });

  if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
      e.preventDefault();
      loginView.style.display = 'none';
      registerView.style.display = 'block';
    });
  }
  if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      registerView.style.display = 'none';
      loginView.style.display = 'block';
    });
  }

  if (chipAmountInput) {
    chipAmountInput.addEventListener('input', () => {
      const chips = parseInt(chipAmountInput.value, 10) || 0;
      if (chips >= 7000) {
        const idr = (chips / 7000) * 100000;
        idrEquivalentText.textContent = `Rp ${idr.toLocaleString('id-ID')}`;
      } else {
        idrEquivalentText.textContent = 'Rp 0';
      }
    });
  }

  // [[BARU]] Event Listener untuk Pengaturan
  if (musicToggle) {
    musicToggle.addEventListener('change', (e) => {
      if (typeof toggleMusic === 'function') {
        toggleMusic(e.target.checked);
      }
    });
  }

  console.log('UI Controller (v2) berhasil dimuat.');
});
