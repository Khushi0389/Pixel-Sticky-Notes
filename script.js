document.addEventListener('DOMContentLoaded', () => {
  // Globals
  const container = document.getElementById('notesContainer');
  const addBtn    = document.getElementById('addNote');

  let notes = JSON.parse(localStorage.getItem('pixelNotes') || '[]');
  let topZ = 1;

  // Persist notes array
  function saveNotes() {
    localStorage.setItem('pixelNotes', JSON.stringify(notes));
  }

  // Create one note DOM element
  function createNoteElement(note) {
    const el = document.createElement('div');
    el.className = 'note';
    el.style.left            = note.x + 'px';
    el.style.top             = note.y + 'px';
    el.style.backgroundColor = note.bg;
    el.style.zIndex          = note.z || 1;

    el.innerHTML = `
      <div class="tape"></div>
      <textarea>${note.text}</textarea>
      <div class="controls">
        <button class="del">×</button>
        <button class="color">🎨</button>
      </div>
    `;

    // Bring to front on mousedown
    el.addEventListener('mousedown', () => {
      topZ++;
      el.style.zIndex = topZ;
      note.z = topZ;
    });

    // Text auto-save
    const ta = el.querySelector('textarea');
    ta.addEventListener('input', e => {
      note.text = e.target.value;
      saveNotes();
    });

    // Delete note
    el.querySelector('.del').addEventListener('click', () => {
      notes = notes.filter(n => n.id !== note.id);
      saveNotes();
      render();
    });

    // Change background color via a hidden color input
    el.querySelector('.color').addEventListener('click', () => {
      // create a one-off color picker
      const picker = document.createElement('input');
      picker.type = 'color';
      // initialize with current bg (convert to #rrggbb if needed)
      picker.value = note.bg.length === 7 ? note.bg : '#fff9c4';
      picker.style.position = 'fixed';
      picker.style.left = '-9999px';
      document.body.appendChild(picker);
      picker.addEventListener('input', () => {
        note.bg = picker.value;
        saveNotes();
        render();
      });
      // simulate click
      picker.click();
      // cleanup after use
      picker.addEventListener('blur', () => picker.remove());
    });

    // Drag-to-move
    let dragging = false, offsetX = 0, offsetY = 0;
    el.addEventListener('mousedown', e => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'BUTTON') return;
      dragging = true;
      offsetX  = e.clientX - el.offsetLeft;
      offsetY  = e.clientY - el.offsetTop;
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      note.x = e.clientX - offsetX;
      note.y = e.clientY - offsetY;
      el.style.left = note.x + 'px';
      el.style.top  = note.y + 'px';
    });
    document.addEventListener('mouseup', () => {
      if (dragging) saveNotes();
      dragging = false;
    });

    return el;
  }

  // Render all notes
  function render() {
    container.innerHTML = '';
    notes.forEach(note => {
      container.appendChild(createNoteElement(note));
    });
  }

  // Add new note
  addBtn.addEventListener('click', () => {
    const id = Date.now();
    notes.push({
      id,
      x: 50,
      y: 80,
      z: topZ,
      text: '',
      bg: '#fff9c4'
    });
    saveNotes();
    render();
  });

  // Initial render
  render();
});
