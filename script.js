const roleCards = document.querySelectorAll('.role-card');

const databaseKey = 'car_rental_marketplace_db';

const defaultDatabase = {
  ownerCars: [
    {
      id: 'seed-toyota',
      brand: 'Toyota',
      model: 'Rav4',
      year: 2019,
      bookings: 12,
      income: 1500000,
      status: 'Verified',
      price: 1500000
    },
    {
      id: 'seed-hyundai',
      brand: 'Hyundai',
      model: 'Tucson',
      year: 2023,
      bookings: 0,
      income: 0,
      status: 'Pending',
      price: 0
    }
  ]
};

function saveDatabase(database) {
  localStorage.setItem(databaseKey, JSON.stringify(database));
}

function getDatabase() {
  const saved = localStorage.getItem(databaseKey);

  if (!saved) {
    saveDatabase(defaultDatabase);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      ownerCars: Array.isArray(parsed.ownerCars) ? parsed.ownerCars : defaultDatabase.ownerCars
    };
  } catch (error) {
    saveDatabase(defaultDatabase);
    return JSON.parse(JSON.stringify(defaultDatabase));
  }
}

function formatMoney(value) {
  return `RwF ${Number(value || 0).toLocaleString('en-US')}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

function renderOwnerFleet() {
  const fleetList = document.querySelector('.fleet-list');

  if (!fleetList) {
    return;
  }

  const database = getDatabase();

  if (!database.ownerCars.length) {
    fleetList.innerHTML = '<p class="owner-empty">No cars added yet. Use the Add Car form to create your first listing.</p>';
    return;
  }

  fleetList.innerHTML = database.ownerCars
    .map((car) => {
      const statusClass = car.status === 'Verified' ? 'verified' : 'pending';
      const incomeClass = car.income === 0 ? 'zero' : '';
      const imageStyles = car.image ? `background-image: url('${car.image}'); background-size: cover; background-position: center;` : '';

      return `
        <article class="fleet-card" data-id="${car.id}">
          <div class="fleet-image" aria-label="${car.brand} ${car.model} image" style="${imageStyles}">${car.image ? '' : 'CAR'}</div>
          <div class="fleet-info">
            <h3>${car.brand} ${car.model} ${car.year}</h3>
            <p class="fleet-meta"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i> ${car.bookings} Bookings</p>
            <p class="fleet-income ${incomeClass} fleet-meta"><i class="fa-solid fa-money-bill-wave" aria-hidden="true"></i> ${formatMoney(car.income)}</p>
            <p class="fleet-status ${statusClass}">${car.status}</p>
          </div>
          <div class="fleet-side">
            <button type="button" class="fleet-status-toggle" data-car-id="${car.id}">Status</button>
            <button type="button" class="fleet-remove-toggle" data-car-id="${car.id}" aria-label="Remove ${car.brand} ${car.model}">Remove</button>
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('.fleet-status-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const database = getDatabase();
      const carId = button.dataset.carId;
      const targetCar = database.ownerCars.find((car) => car.id === carId);

      if (!targetCar) {
        return;
      }

      targetCar.status = targetCar.status === 'Verified' ? 'Pending' : 'Verified';
      saveDatabase(database);
      renderOwnerFleet();
    });
  });

  document.querySelectorAll('.fleet-remove-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const database = getDatabase();
      const carId = button.dataset.carId;

      database.ownerCars = database.ownerCars.filter((car) => car.id !== carId);
      saveDatabase(database);
      renderOwnerFleet();
    });
  });
}

function setupOwnerPage() {
  const addCarTrigger = document.querySelector('#add-car-trigger');
  const carModal = document.querySelector('#car-modal');
  const closeButton = document.querySelector('.modal-close');
  const cancelButton = document.querySelector('.modal-cancel');
  const ownerForm = document.querySelector('#owner-car-form');
  const imageInput = document.querySelector('#car-image');
  const imagePreview = document.querySelector('#car-image-preview');

  if (!addCarTrigger || !carModal || !ownerForm) {
    return;
  }

  const openModal = () => {
    carModal.hidden = false;
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    carModal.hidden = true;
    document.body.classList.remove('modal-open');
    ownerForm.reset();

    if (imagePreview) {
      imagePreview.src = '';
      imagePreview.hidden = true;
    }
  };

  if (imageInput && imagePreview) {
    imageInput.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        imagePreview.src = '';
        imagePreview.hidden = true;
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        imagePreview.src = dataUrl;
        imagePreview.hidden = false;
      } catch (error) {
        imagePreview.src = '';
        imagePreview.hidden = true;
      }
    });
  }

  addCarTrigger.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);
  cancelButton?.addEventListener('click', closeModal);

  carModal.addEventListener('click', (event) => {
    if (event.target === carModal) {
      closeModal();
    }
  });

  ownerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(ownerForm);
    const imageFile = formData.get('image');
    const database = getDatabase();

    let imageValue = '';

    if (imageFile instanceof File && imageFile.size > 0) {
      imageValue = await readFileAsDataUrl(imageFile);
    }

    const newCar = {
      id: `car-${Date.now()}`,
      brand: formData.get('brand')?.toString().trim() || 'Unknown',
      model: formData.get('model')?.toString().trim() || 'Model',
      year: Number(formData.get('year')) || new Date().getFullYear(),
      bookings: 0,
      income: 0,
      status: formData.get('status')?.toString() || 'Pending',
      price: Number(formData.get('price')) || 0,
      image: imageValue
    };

    database.ownerCars.unshift(newCar);
    saveDatabase(database);
    renderOwnerFleet();
    closeModal();
  });

  renderOwnerFleet();
}

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

if (document.body.classList.contains('owner-page')) {
  setupOwnerPage();
}
