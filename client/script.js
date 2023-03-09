import bot from "./assets/bot.svg";
import user from "./assets/user_icon.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

// Bot message loader (...) from line 9 to 21
let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Bot will generate the message by typing every letter one by one, with a delay of 20ms, which will improve the user experience.
// To make it look more elegant.

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// We have to generate unique id for each message, to be able to map over them.

function generateId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Now we will be creating chatStripe function, through which we will be able to differentiate between the user and bot messages.

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class= "wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">
          <img src="${isAi ? bot : user}" alt="${isAi ? 'bot' : 'user'}" />
        </div>
        <div class= "message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    
    `;
}


const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // Generate the user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  // this one is to clear the textarea input
  form.reset();

  // Generate the bot's chatstripe
  const uniqueId = generateId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // to focus scroll to the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // specific message div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  //we can fetch the data from the server using fetch api and post method -> bot's response
  const response = await fetch("https://divynce.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

// `This is a template string`
// 'This is a normal string'
