document.addEventListener('DOMContentLoaded', () => {
    const notepadArea = document.getElementById('notepad-area');
    const btnNew = document.getElementById('btn-new');
    const btnOpen = document.getElementById('btn-open');
    const btnSave = document.getElementById('btn-save');
    const btnPrint = document.getElementById('btn-print');

    const btnUndo = document.getElementById('btn-undo');
    const btnRedo = document.getElementById('btn-redo');
    const btnCut = document.getElementById('btn-cut');
    const btnCopy = document.getElementById('btn-copy');
    const btnPaste = document.getElementById('btn-paste');
    const btnSelectAll = document.getElementById('btn-select-all');
    const btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');

    const btnFontDecrease = document.getElementById('btn-font-decrease');
    const btnFontIncrease = document.getElementById('btn-font-increase');
    const currentFontSizeSpan = document.getElementById('current-font-size');
    const themeSwitcher = document.getElementById('theme-switcher');

    const wordCountSpan = document.getElementById('word-count');
    const charCountSpan = document.getElementById('char-count');
    
    // Updated to point to the new span in the top navigation bar
    const topBarCurrentFileName = document.getElementById('top-bar-current-file-name'); 
    // const fileListUl = document.getElementById('file-list'); // Removed

    const fileInput = document.getElementById('file-input');

    let currentFileName = "Untitled.txt";
    let currentFontSize = 14; // Default font size in px

    // --- Initialization ---
    function init() {
        loadTheme();
        updateStatus();
        updateFontSizeDisplay();
        updateFileNameDisplay(currentFileName); // This will now update the top bar display
        notepadArea.style.fontSize = `${currentFontSize}px`; // Apply initial font size
    }

    // --- Event Listeners ---
    notepadArea.addEventListener('input', updateStatus);

    btnNew.addEventListener('click', newFile);
    btnOpen.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', openFile);
    btnSave.addEventListener('click', saveFile);
    btnPrint.addEventListener('click', printContent);

    btnUndo.addEventListener('click', () => execCmd('undo'));
    btnRedo.addEventListener('click', () => execCmd('redo'));
    btnCut.addEventListener('click', () => execCmd('cut'));
    btnCopy.addEventListener('click', () => execCmd('copy'));
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const start = notepadArea.selectionStart;
            const end = notepadArea.selectionEnd;
            const currentText = notepadArea.value;
            notepadArea.value = currentText.substring(0, start) + text + currentText.substring(end);
            notepadArea.selectionStart = notepadArea.selectionEnd = start + text.length;
            updateStatus();
        } catch (err) {
            console.error('Failed to paste text: ', err);
            alert('Failed to paste. Your browser might not support this or permission was denied.');
        }
    });
    btnSelectAll.addEventListener('click', () => notepadArea.select());
    btnToggleFullscreen.addEventListener('click', toggleFullscreen);

    btnFontDecrease.addEventListener('click', () => changeFontSize(-1));
    btnFontIncrease.addEventListener('click', () => changeFontSize(1));
    themeSwitcher.addEventListener('change', switchTheme);

    // --- Core Functions ---
    function updateStatus() {
        const text = notepadArea.value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        wordCountSpan.textContent = `Words: ${words}`;
        charCountSpan.textContent = `Characters: ${chars}`;
    }

    function newFile() {
        if (confirm("Are you sure you want to start a new file? Unsaved changes will be lost.")) {
            notepadArea.value = '';
            currentFileName = "Untitled.txt";
            updateFileNameDisplay(currentFileName);
            updateStatus();
        }
    }

    function openFile(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                notepadArea.value = e.target.result;
                currentFileName = file.name;
                updateFileNameDisplay(currentFileName);
                updateStatus();
            };
            reader.onerror = (e) => {
                alert("Error reading file.");
                console.error("File reading error:", e);
            }
            reader.readAsText(file);
            fileInput.value = null; // Reset file input
        }
    }

    function saveFile() {
        const textToSave = notepadArea.value;
        const blob = new Blob([textToSave], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let suggestedName = prompt("Enter file name:", currentFileName || "Untitled.txt");
        if (suggestedName === null) { // User pressed cancel
            URL.revokeObjectURL(url);
            return;
        }
        if (!suggestedName.toLowerCase().endsWith('.txt') && !suggestedName.includes('.')) {
            suggestedName += '.txt';
        }
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        currentFileName = suggestedName; // Update current file name after successful save
        updateFileNameDisplay(currentFileName);
    }

    function printContent() {
        const iframe = document.createElement('iframe');
        iframe.style.height = '0';
        iframe.style.width = '0';
        iframe.style.position = 'absolute';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write('<html><head><title>Print</title>');
        iframeDoc.write('<style>body { font-family: monospace; white-space: pre-wrap; }</style>');
        iframeDoc.write('</head><body><pre>');
        iframeDoc.write(notepadArea.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        iframeDoc.write('</pre></body></html>');
        iframeDoc.close();

        iframe.contentWindow.focus();
        iframe.contentWindow.print();

        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }

    function execCmd(command, value = null) {
        try {
            if (!document.execCommand(command, false, value)) {
                if (command === 'paste') {
                    alert('Pasting via execCommand failed. Try Ctrl+V or use the dedicated paste button.');
                }
            }
            notepadArea.focus();
            updateStatus();
        } catch (e) {
            console.error(`Error executing command '${command}':`, e);
            alert(`Could not execute command: ${command}`);
        }
    }

    function changeFontSize(delta) {
        currentFontSize += delta;
        if (currentFontSize < 8) currentFontSize = 8;
        if (currentFontSize > 72) currentFontSize = 72;
        notepadArea.style.fontSize = `${currentFontSize}px`;
        updateFontSizeDisplay();
    }

    function updateFontSizeDisplay() {
        currentFontSizeSpan.textContent = currentFontSize;
    }

    function switchTheme(event) {
        const selectedTheme = event ? event.target.value : localStorage.getItem('notepad-theme') || 'light';
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('notepad-theme', selectedTheme);
        if (themeSwitcher.value !== selectedTheme) {
            themeSwitcher.value = selectedTheme;
        }
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('notepad-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeSwitcher.value = savedTheme;
    }

    // Updated function to target the new span in the top navigation bar
    function updateFileNameDisplay(fileName) {
        if (topBarCurrentFileName) {
            topBarCurrentFileName.textContent = fileName;
        }
        // Old code removed:
        // currentFileNameStatusSpan.textContent = `File: ${fileName}`;
        // fileListUl.innerHTML = `<li class="active-file">${fileName}</li>`; 
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
             // btnToggleFullscreen.textContent = "Exit Fullscreen"; // Handled by event listener
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                 // btnToggleFullscreen.textContent = "Fullscreen"; // Handled by event listener
            }
        }
    }
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            btnToggleFullscreen.textContent = "Fullscreen";
        } else {
            btnToggleFullscreen.textContent = "Exit Fullscreen";
        }
    });

    // Initialize
    init();
});
