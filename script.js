function speakText(btn){
  const text = btn.parentElement.textContent.replace("🔊", "").trim();
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// Backend configuration
const APP_URL = 'https://script.google.com/macros/s/AKfycbya0EHlfInCNU8toTn0nNeHxJSIesb9V7ms4t1ZC7dflc9AJuraEHg4tS897fNNBsRm/exec';
// Replace with the token configured in your Apps Script, or leave blank
const APP_TOKEN = 'OPTIONAL_SECRET_TOKEN';

// Simple custom modal utilities to avoid browser alert/prompt headings
function showAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <button id="modal-ok">OK</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-ok').addEventListener('click', () => {
      document.body.removeChild(overlay);
      resolve();
    });
  });
}

function showPrompt(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-content">
        <p>${message}</p>
        <input type="text" id="modal-input" />
        <div class="modal-buttons">
          <button id="modal-submit">Submit</button>
          <button id="modal-cancel">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const remove = () => document.body.removeChild(overlay);
    overlay.querySelector('#modal-submit').addEventListener('click', () => {
      const value = overlay.querySelector('#modal-input').value;
      remove();
      resolve(value);
    });
    overlay.querySelector('#modal-cancel').addEventListener('click', () => {
      remove();
      resolve(null);
    });
  });
}

    // Listen for clicks on nav links to toggle active sections
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove active class from all nav links and sections
        navLinks.forEach(nav => nav.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active'));
        // Add active class to clicked link and corresponding section
        link.classList.add('active');
        const targetID = link.getAttribute('data-section');
        document.getElementById(targetID).classList.add('active');
        // Scroll to top of the section for better user experience
        document.getElementById(targetID).scrollIntoView({ behavior: 'smooth' });
      });
    });

// Rewritten quiz submission logic
async function submitQuiz(button, week, level) {
  const studentName = await showPrompt('Please enter your full name:');
  if (!studentName || studentName.trim() === '') {
    await showAlert('You must enter your name to submit the quiz.');
    return;
  }

  const quiz = button.closest('.quiz');
  const questions = quiz.querySelectorAll('li');
  let correct = 0;
  const textResponses = [];

  questions.forEach(q => {
    const textarea = q.querySelector('textarea');
    const labels = q.querySelectorAll('label');
    labels.forEach(l => l.removeAttribute('data-result'));

    if (textarea) {
      textResponses.push({ answer: textarea.value });
      return;
    }

    const selected = q.querySelector('input[type="radio"]:checked');
    if (selected) {
      if (selected.hasAttribute('data-correct')) {
        correct++;
        selected.parentElement.setAttribute('data-result', 'right');
      } else {
        selected.parentElement.setAttribute('data-result', 'wrong');
      }
    }
  });

  const scoredQuestions = questions.length - textResponses.length;
  const scoreText = `${correct}/${scoredQuestions}`;

  const prefixes = { main: 'M', support: 'S', advanced: 'A' };
  const prefix = prefixes[level.toLowerCase()] || 'M';
  const weekNumMatch = week.match(/\d+/);
  const weekNum = weekNumMatch ? weekNumMatch[0] : '';
  const quizNumber = prefix + weekNum;

  const payload = { studentName, quizNumber };

  if (level.toLowerCase() === 'advanced' && textResponses.length) {
    payload.responses = textResponses;
  } else {
    payload.score = scoreText;
  }

  if (APP_TOKEN) {
    payload.token = APP_TOKEN;
  }

  try {
    await fetch(APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    quiz.querySelector('.quiz-msg').textContent = `You got ${scoreText} correct.`;
    await showAlert('Quiz responses submitted successfully!');
  } catch (err) {
    await showAlert('There was an error submitting the quiz.');
  }
}
