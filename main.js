const searchArea = document.getElementById('search-area');
const recordButton = document.getElementById('record-button');
const searchForm = document.getElementById('search-form');

let recognition;
function availabilityFunc() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('현재 브라우저는 음성 인식을 지원하지 않습니다.');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'ko';
  recognition.maxAlternatives = 1;
  recognition.continuous = false;
  recognition.interimResults = false;
}

function startRecord() {
  if (!recognition) {
    return;
  }

  recordButton.disabled = true;
  searchArea.value = '';
  recognition.onspeechend = () => {
    recognition.stop();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchArea.value = transcript;
  };

  recognition.onerror = (event) => {
    recordButton.disabled = false;
    alert('음성 인식에 실패했습니다. 다시 시도해주세요.');
    console.error('음성 인식 오류:', event.error);
  };

  recognition.onend = () => {
    recordButton.disabled = false;
  };

  recognition.start();
}

window.addEventListener('load', availabilityFunc);

const onSubmit = (event) => {
  event.preventDefault();
  const keyword = searchArea.value.trim();

  if (keyword) {
    window.location.href = `/resultPage/?keyword=${encodeURIComponent(
      keyword
    )}`;
  }

  searchArea.value = '';
};

searchForm.addEventListener('submit', onSubmit);
