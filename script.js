const roleCards = document.querySelectorAll('.role-card');

for (const card of roleCards) {
  card.addEventListener('click', () => {
    const roleRoutes = {
      renter: 'booking.html',
      owner: 'owner.html',
      driver: 'driver.html'
    };

    if (roleRoutes[card.dataset.role]) {
      window.location.href = roleRoutes[card.dataset.role];
      return;
    }

    for (const roleCard of roleCards) {
      roleCard.classList.remove('is-selected');
      roleCard.setAttribute('aria-pressed', 'false');
    }

    card.classList.add('is-selected');
    card.setAttribute('aria-pressed', 'true');
  });
}
