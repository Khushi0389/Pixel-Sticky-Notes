document.addEventListener('DOMContentLoaded', async () => {
  // Globals
  const container = document.getElementById('notesContainer');
  const addBtn    = document.getElementById('addNote');

  // Load from electron-store via preload
  let notes = await window.store.getNotes();
  let topZ  = 1;

  // Persist notes array back to disk
  async function saveNotes() {
    await window.store.saveNotes(notes);
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

    // Bring to front
    el.addEventListener('mousedown', () => {
      topZ++;
      el.style.zIndex = topZ;
      note.z = topZ;
    });

    // Text auto-save
    const ta = el.querySelector('textarea');
    ta.addEventListener('input', async e => {
      note.text = e.target.value;
      await saveNotes();
    });

    // Delete note
    el.querySelector('.del').addEventListener('click', async () => {
      notes = notes.filter(n => n.id !== note.id);
      await saveNotes();
      render();
    });

    // Change background color
    el.querySelector('.color').addEventListener('click', () => {
      const picker = document.createElement('input');
      picker.type = 'color';
      picker.value = note.bg.length === 7 ? note.bg : '#fff9c4';
      picker.style.position = 'fixed';
      picker.style.left = '-9999px';
      document.body.appendChild(picker);

      picker.addEventListener('input', async () => {
        note.bg = picker.value;
        await saveNotes();
        render();
      });

      picker.click();
      picker.addEventListener('blur', () => picker.remove());
    });

    // Drag-to-move
    let dragging = false, offsetX = 0, offsetY = 0;
    el.addEventListener('mousedown', e => {
      if (['TEXTAREA','BUTTON'].includes(e.target.tagName)) return;
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
    document.addEventListener('mouseup', async () => {
      if (dragging) await saveNotes();
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
  addBtn.addEventListener('click', async () => {
    const id = Date.now();
    notes.push({
      id,
      x: 50,
      y: 80,
      z: topZ,
      text: '',
      bg: '#fff9c4'
    });
    await saveNotes();
    render();
  });

  // Initial render
  render();
});
