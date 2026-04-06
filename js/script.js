const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const gallery = document.getElementById("gallery");

const modal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");

setupDateInputs(startInput, endInput);

// Paste your NASA API key between the quotes below.
const nasaApiKey = "dU8QYmjdKB6ja3cU2yTa7DuyUndlqci0A6vb4Vf1";

// Use DEMO_KEY only if you have not pasted your own key yet.
const apiKeyToUse =
  nasaApiKey === "PASTE_YOUR_NASA_API_KEY_HERE" ? "DEMO_KEY" : nasaApiKey;

getImagesBtn.addEventListener("click", fetchSpaceImages);

async function fetchSpaceImages() {
  // Read both dates from the input fields.
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = `<p class="message">Please select both a start date and end date.</p>`;
    return;
  }

  // The start date must be the same day or earlier than the end date.
  if (startDate > endDate) {
    gallery.innerHTML = `<p class="message">Start date cannot be after end date.</p>`;
    return;
  }

  // Build a YYYY-MM-DD string for today's date.
  const today = new Date().toISOString().split("T")[0];

  // Stop early if either selected date is in the future.
  if (startDate > today || endDate > today) {
    gallery.innerHTML = `<p class="message">Please choose dates that are not in the future.</p>`;
    return;
  }

  // Show a loading message while the API request is running.
  gallery.innerHTML = `<p class="loading-message">Loading space photos...</p>`;

  try {
    // Add the required query parameters for NASA APOD.
    const params = new URLSearchParams({
      api_key: apiKeyToUse,
      start_date: startDate,
      end_date: endDate
    });

    const url = `https://api.nasa.gov/planetary/apod?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Read NASA's error message so we can show a clearer reason.
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch NASA data.");
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [data];

    // APOD can return videos too, so keep only image entries.
    const imageItems = items.filter((item) => item.media_type === "image");

    if (imageItems.length === 0) {
      gallery.innerHTML = `<p class="message">No image entries found for this date range.</p>`;
      return;
    }

    // Clear the loading text before adding cards.
    gallery.innerHTML = "";

    // Loop through each result and create a card in the gallery.
    imageItems.reverse().forEach((item) => {
      const card = document.createElement("div");
      card.className = "gallery-card";

      card.innerHTML = `
        <img src="${item.url}" alt="${item.title}" class="gallery-image">
        <div class="gallery-info">
          <h3>${item.title}</h3>
          <p>${item.date}</p>
        </div>
      `;

      // Open the modal when a card is clicked.
      card.addEventListener("click", () => openModal(item));
      gallery.appendChild(card);
    });
  } catch (error) {
    const nasaErrorDetail = error.message ? `<br><small>${error.message}</small>` : "";
    gallery.innerHTML = `<p class="message">Could not load images. Try an older date range.${nasaErrorDetail}</p>`;
    console.error("NASA API error:", error.message || error);
  }
}

function openModal(item) {
  modalImg.src = item.hdurl || item.url;
  modalImg.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});