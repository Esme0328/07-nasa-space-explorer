const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const getImagesBtn = document.getElementById("getImagesBtn");
const gallery = document.getElementById("gallery");
const spaceFactText = document.getElementById("spaceFactText");

const modal = document.getElementById("imageModal");
const closeModalBtn = document.getElementById("closeModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalExplanation = document.getElementById("modalExplanation");

setupDateInputs(startInput, endInput);

// Paste your NASA API key between the quotes below.
const nasaApiKey = "DEMO_KEY";

// Use DEMO_KEY only if you have not pasted your own key yet.
const apiKeyToUse = "DEMO_KEY";

// Simple list of facts used for the random "Did You Know?" section.
const spaceFacts = [
  "One day on Venus is longer than one year on Venus.",
  "Neutron stars can spin more than 600 times every second.",
  "Jupiter is so big that more than 1,300 Earths could fit inside it.",
  "The footprints left on the Moon can last for millions of years.",
  "A teaspoon of a neutron star would weigh about a billion tons on Earth.",
  "Saturn would float in water because its average density is lower than water.",
  "The International Space Station travels around Earth about every 90 minutes.",
  "Sunlight takes about 8 minutes and 20 seconds to reach Earth."
];

showRandomSpaceFact();

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
    const baseParams = {
      start_date: startDate,
      end_date: endDate
    };

    let keyToTry = apiKeyToUse;
    let params = new URLSearchParams({
      ...baseParams,
      api_key: keyToTry
    });

    let url = `https://api.nasa.gov/planetary/apod?${params.toString()}`;
    let response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      const errorCode = errorData.error?.code;

      // If the personal key is invalid, try DEMO_KEY once as a fallback.
      if (errorCode === "API_KEY_INVALID" && keyToTry !== "DEMO_KEY") {
        keyToTry = "DEMO_KEY";
        params = new URLSearchParams({
          ...baseParams,
          api_key: keyToTry
        });
        url = `https://api.nasa.gov/planetary/apod?${params.toString()}`;
        response = await fetch(url);

        if (!response.ok) {
          const fallbackErrorData = await response.json();
          throw new Error(fallbackErrorData.error?.message || "Failed to fetch NASA data.");
        }
      } else {
        throw new Error(errorData.error?.message || "Failed to fetch NASA data.");
      }
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : [data];

    if (items.length === 0) {
      gallery.innerHTML = `<p class="message">No APOD entries found for this date range.</p>`;
      return;
    }

    // Clear the loading text before adding cards.
    gallery.innerHTML = "";

    // Loop through each result and create a card.
    // If it's an image, show the image card.
    // If it's a video, show a clear link card to open the video.
    items.reverse().forEach((item) => {
      if (item.media_type === "video") {
        const videoCard = document.createElement("div");
        videoCard.className = "gallery-card video-card";

        videoCard.innerHTML = `
          <div class="video-placeholder">🎬 Video Entry</div>
          <div class="gallery-info">
            <h3>${item.title}</h3>
            <p>${item.date}</p>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="video-link">Watch Video</a>
          </div>
        `;

        gallery.appendChild(videoCard);
        return;
      }

      if (item.media_type !== "image") {
        return;
      }

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

    // If all entries were non-image/non-video, show a fallback message.
    if (gallery.children.length === 0) {
      gallery.innerHTML = `<p class="message">No viewable APOD entries found for this date range.</p>`;
    }
  } catch (error) {
    const nasaErrorDetail = error.message ? `<br><small>${error.message}</small>` : "";
    gallery.innerHTML = `<p class="message">Could not load images. Try an older date range.${nasaErrorDetail}</p>`;
    console.error("NASA API error:", error.message || error);
  }
}

function showRandomSpaceFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  spaceFactText.textContent = spaceFacts[randomIndex];
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