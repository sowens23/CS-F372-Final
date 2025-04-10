// loginEditor.js
function showForm(formId, event) {
    document.querySelectorAll('.form-box').forEach(box => box.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(formId).classList.remove('hidden');
    event.target.classList.add('active');
  }
  