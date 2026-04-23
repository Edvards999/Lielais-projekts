const monthDays = [31,29,31,30,31,30,31,31,30,31,30,31];
const daySelect  = document.getElementById('day');

function updateDays() {
  const m = parseInt(document.getElementById('month').value);
  daySelect.innerHTML = '';
  for (let i = 1; i <= monthDays[m - 1]; i++) {
    const o = document.createElement('option');
    o.value = i; o.textContent = i;
    daySelect.appendChild(o);
  }
}

document.getElementById('month').addEventListener('change', updateDays);
updateDays();

function goToRezultats() {
  const m = document.getElementById('month').value;
  const d = document.getElementById('day').value;
  window.location.href = `rezultats.html?month=${m}&day=${d}`;
}

document.getElementById('submitBtn').addEventListener('click', goToRezultats);

function display_c(){
   var refresh=1000;
   mytime=setTimeout('display_ct()',refresh)
}

function display_ct() {
  var CDate = new Date()
  var NewDate=CDate.toDateString(); 
  NewDate = NewDate + " - " + CDate.toLocaleTimeString();
  document.getElementById('ct').innerHTML = NewDate;
  display_c();
}
