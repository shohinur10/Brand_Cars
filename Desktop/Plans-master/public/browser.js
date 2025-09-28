function addTemplate(item) {
  return `<li class="list-group-item list-group-item-indo d-flex align-items-center justify-content-between">
            <span class="item-text">${item.reja}</span>
            <div>
              <button data-id="${item._id}" class="edit-me btn btn-dark btn-md">Edit</button>
              <button data-id="${item._id}" class="delete-me btn btn-dark btn-md">Delete</button>
            </div>
          </li>`;
}

// Ensure elements exist before attaching event listeners
const createForm = document.getElementById("create-form");
const createField = document.getElementById("create-field");
const itemList = document.getElementById("item_ul");
const cleanAllBtn = document.getElementById("remove-all");

// Add new item
if (createForm && createField && itemList) {
  createForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newItemText = createField.value.trim();
    if (!newItemText) {
      alert("Input cannot be empty!");
      return;
    }

    axios // Axios asosiy vazifani bajaradi: yangi element yaratish uchun serverga POST so‘rovi yuborish
      .post("/create-item", { reja: newItemText }) //  sent to the server to create a new item.
      .then((response) => {// addTemplate  yordamida  HTML yaratadi.
        itemList.insertAdjacentHTML("beforeend", addTemplate(response.data)); // insertAdjacentHTML metodi  yordamida sahifaga qo‘shiladi.
        createField.value = "";// clears the text input = kiritilgan matn maydonini bo‘shatadi.
        createField.focus(); // foydalanuvchi keyingi matnni kiritishi uchun fokusni inputga qaytaradi.
      })
      .catch((error) => console.error(`Error in axios.post: ${error}`));
  });
}

// Delete or edit item (event delegation)
document.addEventListener("click", (e) => {
  const dataId = e.target.getAttribute("data-id");

  // Delete item
  if (e.target.classList.contains("delete-me")) {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .post("/delete-item", { id: dataId })
        .then(() => {  // then :Runs when the promise is resolved (successful request).
          e.target.closest("li").remove(); // Efficient way to remove the closest <li>
        })
        .catch((err) => console.error("Error deleting item:", err)); // catch :Runs when the promise is rejected (failed request).
    }
  }

  // Edit item
  if (e.target.classList.contains("edit-me")) {
    const itemText = e.target.closest("li").querySelector(".item-text");
    let userInput = prompt("Enter the new value", itemText.innerHTML.trim());

    if (userInput !== null && userInput.trim() !== "") {
      axios
        .post("/edit-item", {
          id: dataId,
          new_input: userInput.trim(),
        })
        .then(() => {
          itemText.innerHTML = userInput;
        })
        .catch((err) => console.error("Error updating item:", err));
    }
  }
});

// Remove all items
if (cleanAllBtn) {
  cleanAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all items?")) {
      axios
        .post("/remove-all", { delete_all: true })
        .then((response) => {
          alert(response.data.state);
          itemList.innerHTML = ""; // Efficiently clear the list without reloading
        })
        .catch((error) => console.error("Error deleting all:", error));
    }
  });
}
