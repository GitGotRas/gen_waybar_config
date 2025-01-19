require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs' }});
require(['vs/editor/editor.main'], function() {
    window.editor = monaco.editor.create(document.getElementById('editor'), {
        value: '{\n    "position": "top",\n    "height": 30,\n    "modules-left": [],\n    "modules-center": [],\n    "modules-right": []\n}',
        language: 'json',
        theme: 'vs-dark',
        automaticLayout: true
    });
    initDragAndDrop();
});

// Add handlers for module groups
document.querySelectorAll('.group-header').forEach(header => {
    header.addEventListener('click', () => {
        header.classList.toggle('expanded');
        const moduleList = header.nextElementSibling;
        if (moduleList) {
            moduleList.classList.toggle('expanded');
        }
    });
});

function initDragAndDrop() {
    const modules = document.querySelectorAll('.module');
    const dropzones = document.querySelectorAll('.dropzone');
    const deleteZone = document.getElementById('delete-zone');

    modules.forEach(module => {
        module.addEventListener('dragstart', dragStart);
        module.addEventListener('dragend', dragEnd);

        if (!module.closest('.dropzone')) {
            module.setAttribute('data-original', 'true');
        }
    });

    dropzones.forEach(dropzone => {
        dropzone.addEventListener('dragover', dragOver);
        dropzone.addEventListener('dragleave', dragLeave);
        dropzone.addEventListener('drop', drop);
    });

    deleteZone.addEventListener('dragover', dragOver);
    deleteZone.addEventListener('dragleave', dragLeave);
    deleteZone.addEventListener('drop', dropDelete);
}

function createModule(moduleType, isOriginal = false) {
    const newModule = document.createElement('div');
    newModule.className = 'module';
    newModule.setAttribute('draggable', 'true');
    newModule.setAttribute('data-module', moduleType);

    const moduleText = document.createElement('span');
    moduleText.textContent = moduleType.split('/').pop();
    newModule.appendChild(moduleText);

    if (!isOriginal) {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = function(e) {
            e.stopPropagation();
            newModule.remove();
            generateConfig();
        };
        newModule.appendChild(removeBtn);
    }

    newModule.addEventListener('dragstart', dragStart);
    newModule.addEventListener('dragend', dragEnd);

    return newModule;
}

function dragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.getAttribute('data-module'));
}

function dragEnd(e) {
    this.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
    this.classList.add('dragover');
}

function dragLeave(e) {
    this.classList.remove('dragover');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('dragover');

    const moduleType = e.dataTransfer.getData('text/plain');
    const draggingModule = document.querySelector('.module.dragging');

    // If dragging from the module list, create a new module
    if (draggingModule && draggingModule.hasAttribute('data-original')) {
        const newModule = createModule(moduleType);
        this.appendChild(newModule);
    } else if (draggingModule) {
        // If moving an existing module
        this.appendChild(draggingModule);
    }

    generateConfig();
}

function dropDelete(e) {
    e.preventDefault();
    this.classList.remove('dragover');

    const draggingModule = document.querySelector('.module.dragging');
    if (draggingModule && !draggingModule.hasAttribute('data-original')) {
        draggingModule.remove();
        generateConfig();
    }
}

function generateConfig() {
    const config = {
        position: document.getElementById('position').value,
        height: parseInt(document.getElementById('height').value),
        'modules-left': [],
        'modules-center': [],
        'modules-right': []
    };

    // Get modules from each dropzone
    const leftModules = document.getElementById('left-modules').querySelectorAll('.module');
    const centerModules = document.getElementById('center-modules').querySelectorAll('.module');
    const rightModules = document.getElementById('right-modules').querySelectorAll('.module');

    // Add modules to their respective arrays
    leftModules.forEach(module => {
        config['modules-left'].push(module.getAttribute('data-module'));
    });

    centerModules.forEach(module => {
        config['modules-center'].push(module.getAttribute('data-module'));
    });

    rightModules.forEach(module => {
        config['modules-right'].push(module.getAttribute('data-module'));
    });

    // Update the editor with the new configuration
    window.editor.setValue(JSON.stringify(config, null, 4));
}

function copyConfig() {
    const config = window.editor.getValue();
    navigator.clipboard.writeText(config).then(() => {
        const copyButton = document.querySelector('.copy-button');
        const originalText = copyButton.textContent;
        copyButton.textContent = 'Скопировано!';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    });
}