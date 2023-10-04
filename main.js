const API_URL_Random = "https://api.thedogapi.com/v1/images/search?limit=5&api_key=218d6a21-8922-4d5d-9913-2cb87bc4e3aa";
const API_URL_Favoritos = 'https://api.thedogapi.com/v1/favourites?api_key=218d6a21-8922-4d5d-9913-2cb87bc4e3aa';
const API_URL_Delete_Favoritos = (id) => `https://api.thedogapi.com/v1/favourites/${id}?api_key=218d6a21-8922-4d5d-9913-2cb87bc4e3aa`;

const toggleButton = document.getElementById('toggleDogsButton');
const dogContainer = document.getElementById('dogContainer');
const favaritoslomos = document.getElementById("favoritesDog");

const spanError = document.getElementById('error');
const loadingIndicator = document.getElementById('loadingIndicator');

let page = 1;
let loadMoreDogsEnabled = true; // Variable para controlar la carga de más perros

function createDogElement(data, index) {
  const div = document.createElement('div');
  div.className = 'div-img';
  dogContainer.style.display = 'block';
  favaritoslomos.style.display = "none";

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((lazyImage) => {
    lazyImage.src = lazyImage.dataset.src;
    lazyImage.removeAttribute('loading');
  });

  const img = document.createElement('img');
  img.id = `img${index}`;
  img.dataset.src = data.url;
  img.alt = 'Lomito Random';
  img.loading = 'lazy';
  
  const button = document.createElement('button');
  button.id = `btn${index}`;
  button.textContent = '❤️';
  button.onclick = () => saveFavoritosDogs(data.id);

  div.appendChild(img);
  div.appendChild(button);
  return div;
}

async function loadMoreDogs() {
  if (!loadMoreDogsEnabled) return; // No cargar más perros si loadMoreDogsEnabled es falso
  
  try {
    const res = await fetch(API_URL_Random + `&page=${page}`);
    const data = await res.json();
    favaritoslomos.style.display = "none";
    
    if (res.status !== 200) throw new Error('Hubo un error: ' + res.status);

    const section = document.getElementById('dogContainer');

    data.forEach((dog, index) => {
      const dogElement = createDogElement(dog, (page - 1) * 5 + index + 1);
      section.appendChild(dogElement);
      dogContainer.style.display = 'block';
    });

    page++;
  } catch (error) {
    spanError.innerHTML = error.message;
  }
}

async function FavoritosDogs() {
  try {
    const res = await fetch(API_URL_Favoritos);
    const data = await res.json();

    if (res.status !== 200) throw new Error("Hubo un error: " + res.status + data.message);

    const section = document.getElementById('favoritesDog');
    section.innerHTML = "";

    data.forEach(perrito => {
      const div = document.createElement('div');
      const img = document.createElement('img');
      const btn = document.createElement('button');
      const btnText = document.createTextNode('❌');

      img.src = perrito.image.url;
      img.width = 300;
      img.height = 300;
      btn.appendChild(btnText);
      btn.onclick = () => deleteFavoritosDogs(perrito.id);
      div.appendChild(img);
      div.appendChild(btn);
      section.appendChild(div);
    });
  } catch (error) {
    spanError.innerHTML = error.message;
  }
}

async function saveFavoritosDogs(id) {
  try {
    const res = await fetch(API_URL_Favoritos, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_id: id }),
    });
    if (res.status !== 200) throw new Error("Hubo un error: " + res.status);

    FavoritosDogs();
  } catch (error) {
    spanError.innerHTML = error.message;
  }
}

async function deleteFavoritosDogs(id) {
  try {
    const res = await fetch(API_URL_Delete_Favoritos(id), {
      method: 'DELETE',
    });
    if (res.status !== 200) return;

    FavoritosDogs();
  } catch (error) {
    spanError.innerHTML = error.message;
  }
}

async function onScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  // Ajusta el valor de 100 a la cantidad de píxeles que desees como umbral
  if (scrollPosition >= pageHeight - 100 && !loadingIndicator.classList.contains('loading')) {
    loadingIndicator.classList.add('loading');
    await loadMoreDogs();
    loadingIndicator.classList.remove('loading');
  }
}

// Agrega un listener de eventos al evento "scroll" en la ventana
window.addEventListener('scroll', onScroll);

toggleButton.addEventListener('click', () => {
  if (dogContainer.style.display === 'none' || dogContainer.style.display === '') {
    dogContainer.style.display = 'block';
    favaritoslomos.style.display = "none";
    toggleButton.innerText = "Mostrar favoritos";
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach((lazyImage) => {
      lazyImage.src = lazyImage.dataset.src;
      lazyImage.removeAttribute('loading');
    });
    loadMoreDogsEnabled = true; // Habilita la carga de más perros
  } else {
    dogContainer.style.display = 'none';
    favaritoslomos.style.display = "block";
    toggleButton.innerText = "Ocultar Favoritos";
    loadMoreDogsEnabled = false; // Deshabilita la carga de más perros
  }
});

// Cargar perros al cargar la página
loadMoreDogs();
FavoritosDogs();

