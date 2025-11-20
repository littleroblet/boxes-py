
/*** Thumbnails ******************************************/

function showThumbnail(img_link) {
    const img = document.getElementById("sample-preview");
    img.src = img_link;
    img.style.height = "auto";
    img.style.display = "block";
}

function showThumbnailEvt(evt) {
    const url = evt.target.getAttribute("data-thumbnail");
    showThumbnail(url);
}

function hideThumbnail() {
    const img = document.getElementById("sample-preview");
    img.style.display = "none";
}

/*** Expand/Collapse **************************************/

function expandId(id) {
    const e = document.getElementById(id);
    const h = document.getElementById("h-" + id);
    e.style.display = "block";
    h.classList.add("open");
    h.setAttribute("aria-expanded", "true");
}
function collapseId(id) {
    const e = document.getElementById(id);
    const h = document.getElementById("h-" + id);
    e.style.display = "none";
    h.classList.remove("open");
    h.setAttribute("aria-expanded", "false");
}

function toggleId(id) {
    const e = document.getElementById(id);
    const h = document.getElementById("h-" + id);
    if (e.style.display == null || e.style.display === "none") {
        expandId(id);
    } else {
        collapseId(id);
    }
}

function toggleEl(el) {
    const id = el.getAttribute("data-id");
    toggleId(id);
}

function toggleEvt(evt) {
    const id = evt.target.getAttribute("data-id");
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#examples
    if (evt instanceof MouseEvent) {
        toggleId(id);
    }
    if (evt instanceof KeyboardEvent && (evt.key === "Enter" || evt.key === " ")) {
        evt.preventDefault();
        toggleId(id);
    }
}

/*** Init page ***************************************/

function initToggle(el, hide = false) {
    // Add event handler.
    el.addEventListener("click", toggleEvt);
    el.addEventListener("keydown", toggleEvt);
    // Hide.
    if (hide) {
        toggleEl(el);
    }
}

function initThumbnail(el) {
    // Add event handler.
    el.addEventListener("mouseenter", showThumbnailEvt);
    el.addEventListener("mouseleave", hideThumbnail);
}

function initPage(num_hide = null) {
    const h = document.getElementsByClassName("toggle");
    let i = 0;
    for (let el of h) {
        if (num_hide === null || i < num_hide) {
            initToggle(el, true);
        } else {
            initToggle(el, false);
        }
        i++;
    }
    const t = document.getElementsByClassName("thumbnail");
    for (let el of t) initThumbnail(el);
}

function initArgsPage(num_hide = null) {
    initPage(num_hide);
    const i = document.querySelectorAll("td > input, td > select, td > textarea");
    for (let el of i) {
	el.addEventListener("change", refreshPreview);
    }
    refreshPreview();
    document.getElementById("preview_chk").addEventListener("change", togglePreview);
    
    // Populate material selector if it exists
    populateMaterialSelector();
}

/*** Preview ****************************************/

preview_scale=100;

function refreshPreview() {
    if (document.getElementById("preview_img").hidden)
	return;

    const form = document.querySelector("#arguments");
    const formData = new FormData(form);
    formData.set("format", "svg");

    const url = form.action + "?" + new URLSearchParams(formData).toString() + "&render=4";

    const preview = document.getElementById("preview_img");
    preview.src = url;
}

function togglePreview() {
    document.getElementById("preview").hidden = !event.target.checked;
    if (event.target.checked)
	refreshPreview();
}

/*** GrindFinity ******************************************/

function GridfinityTrayLayout_GenerateLayout(x, y, nx, ny, countx, county) {
    // x = width in mm
    // y = height in mm
    // nx # of gridfinity grids in X
    // ny # of gridfinity grids in Y
    // countx split x into this many
    // county split y into this many
    layout = '';
    if (countx == 0)
        countx = nx;
    if (county == 0)
        county = ny
    stepx = x / countx;
    stepy = y / county;
    for (i = 0; i < countx; i++) {
        line = ' |'.repeat(i) + ` ,> ${stepx}mm\n`;
        layout += line;
    }
    for (i = 0; i < county; i++) {
        layout += "+-".repeat(countx) + "+\n";
        layout += "| ".repeat(countx) + `|  ${stepy}mm\n`;
    }
    layout += "+-".repeat(countx) + "+\n";
    return layout
}

function GridfinityTrayUpdateLayout(event) {
    console.log("update");
    if (window.layoutUpdated == true) {
        // Don't do the update if the layout has been manually touched.
        if (confirm("You have manually updated the Layout.  Do you wish to regenerate it?")) {
            window.layoutUpdated = false;
        } else {
            return;
        }
    }
    console.log("updating");
    nx = document.getElementById('nx').value;
    ny = document.getElementById('ny').value;
    countx = document.getElementById('countx').value;
    county = document.getElementById('county').value;
    margin = document.getElementById('margin').value;
    x = nx*42 - margin
    y = ny*42 - margin
    layout_id = document.getElementById('layout');
    layout_id.value = GridfinityTrayLayout_GenerateLayout(x, y, nx, ny, countx, county);
}

function setUpdated() {
    console.log("this was updated");
    window.layoutUpdated=true;
}
function GridfinityTrayLayoutInit() {
    console.log("update init");
    ids = ['nx', 'ny', 'countx', 'county', 'margin'];
    window.layoutUpdated=false;
    for (id_string of ids) {
        id = document.getElementById(id_string);
        id.addEventListener('input', GridfinityTrayUpdateLayout);
    }
    layout_id = document.getElementById('layout');
    layout_id.addEventListener('change', setUpdated);
    layout_id.addEventListener('input', setUpdated);

    GridfinityTrayUpdateLayout();
    layout_id = document.getElementById('layout');
    layout_id.rows = 20;
    layout_id.cols = 24;
}

/*** PhotoFrame ******************************************/

function PhotoFrameInit() {
    console.log("PhotoFrameInit: setting event handlers for matting");
    window.photoFrameUserMattingW = null;
    window.photoFrameUserMattingH = null;
    window.photoFrameUserGlassW = null;
    window.photoFrameUserGlassH = null;

    for (const id_string of ['matting_w', 'matting_h']) {
        const id = document.getElementById(id_string);
        id.addEventListener('input', PhotoFrame_MattingUpdate);
        // id.addEventListener('change', PhotoFrame_MattingUpdate);
    }
    for (const id_string of ['glass_w', 'glass_h']) {
        const id = document.getElementById(id_string);
        id.addEventListener('input', PhotoFrame_GlassUpdate);
        id.addEventListener('change', PhotoFrame_GlassUpdate);
    }
    for (const id_string of ['golden_mat']) {
        const id = document.getElementById(id_string);
        id.addEventListener('change', PhotoFrame_GoldenMattingChange);
    }
    for (const id_string of ['matting_overlap', 'x', 'y']) {
        const id = document.getElementById(id_string);
        id.addEventListener('input', PhotoFrame_GoldenMattingChange);
        id.addEventListener('change', PhotoFrame_GoldenMattingChange);
    }

    // Set the initial values
    PhotoFrame_GoldenMattingChange();
}

function PhotoFrame_MattingUpdate(event) {
    // If the user manually updates the matting, save the values and turn off golden matting

    const golden_mat = document.getElementById('golden_mat').checked;
    const matting_w = document.getElementById('matting_w').value;
    const matting_h = document.getElementById('matting_h').value;

    console.log("PhotoFrame_MattingUpdate", matting_w, matting_h, golden_mat);
    window.photoFrameUserMattingW = matting_w;
    window.photoFrameUserMattingH = matting_h;

    if (golden_mat) {
        document.getElementById('golden_mat').checked = false;
    }
    if (matting_w || matting_h) {
        document.getElementById('glass_w').value = 0;
        document.getElementById('glass_h').value = 0;
    }
}

function PhotoFrame_GlassUpdate(event) {
    // If the user enters glass dimensions, save the values and turn off golden matting

    // console.log("PhotoFrame_GlassUpdate");

    const golden_mat = document.getElementById('golden_mat').checked;
    const glass_w = parseFloat(document.getElementById('glass_w').value);
    const glass_h = parseFloat(document.getElementById('glass_h').value);
    const matting_w = parseFloat(document.getElementById('matting_w').value);
    const matting_h = parseFloat(document.getElementById('matting_h').value);

    console.log("PhotoFrame_GlassUpdate", glass_w, glass_h, matting_w, matting_h, golden_mat);
    window.photoFrameUserGlassW = glass_w;
    window.photoFrameUserGlassH = glass_h;

    if (golden_mat) {
        document.getElementById('golden_mat').checked = false;
    }
    if (glass_w || glass_h) {
        document.getElementById('matting_w').value = 0;
        document.getElementById('matting_h').value = 0;
    }
}

function PhotoFrame_GoldenMattingChange(event) {
    // If the user turns on golden matting, calculate the values
    // If the user turns off golden matting, restore the manual matting values
    // If golden matting is on and the user changes the photo size or overlap, recalculate the matting

    const golden_mat = document.getElementById('golden_mat').checked;
    console.log("PhotoFrame_GoldenMattingChange", golden_mat);

    if (golden_mat) {
        try {
            const mattingWidth = PhotoFrame_GoldenMattingWidth();
            document.getElementById('matting_w').value = mattingWidth;
            document.getElementById('matting_h').value = mattingWidth;
        } catch (error) {
            document.getElementById('matting_w').value = 0;
            document.getElementById('matting_h').value = 0;
        }
        document.getElementById('glass_w').value = 0;
        document.getElementById('glass_h').value = 0;
    } else {
        if (window.photoFrameUserGlassW != null && window.photoFrameUserGlassH != null) {
            document.getElementById('glass_w').value = window.photoFrameUserGlassW;
            document.getElementById('glass_h').value = window.photoFrameUserGlassH;
            document.getElementById('matting_w').value = 0;
            document.getElementById('matting_h').value = 0;
        } else if (window.photoFrameUserMattingW != null && window.photoFrameUserMattingH != null) {
            document.getElementById('matting_w').value = window.photoFrameUserMattingW;
            document.getElementById('matting_h').value = window.photoFrameUserMattingH;
            document.getElementById('glass_w').value = 0;
            document.getElementById('glass_h').value = 0;
        }
    }
}

function PhotoFrame_GoldenMattingWidth() {
    // Calculate the width of the matting border. The border is around the hole in the matting
    // that the photo fits into, not the photo per se

    // Caller is responsible for catching errors

    let mattingWidth = goldenMattingWidth(PhotoFrame_MatHole("x"), PhotoFrame_MatHole("y"));
    mattingWidth = parseFloat(mattingWidth.toFixed(1));
    return mattingWidth;
}

function PhotoFrame_MatHole(element_id) {
    const photo_x = parseFloat(document.getElementById(element_id).value);
    const matting_overlap = parseFloat(document.getElementById('matting_overlap').value);
    return photo_x - 2 * matting_overlap;
}

function goldenMattingWidth(photoWidth, photoHeight) {
    // Validate input dimensions
    if (photoWidth <= 0 || photoHeight <= 0) {
        throw new Error("Photo dimensions must be positive values");
    }

    // Calculate the width of the matting border
    const phi = (1 + Math.sqrt(5)) / 2;
    const a = 4;
    const b = 2 * (photoWidth + photoHeight);
    const c = -(phi - 1) * photoWidth * photoHeight;

    // It is mathematically impossible to get complex roots
    // or for the other root to be the right answer, so relax
    const disc = b**2 - 4 * a * c;
    const x1 = (-b + Math.sqrt(disc)) / (2 * a);

    // Broad check for valid result in case user has achieved the impossible
    if (!isFinite(x1) || isNaN(x1) || x1 <= 0) {
        throw new Error("Calculation resulted in an invalid matting width");
    }

    return x1;
}

/*** TrayLayout ******************************************/

function ParseSections(s) {
    var sections = [];
    for (var section of s.split(":")) {
	var operands = section.split("/");
	if (operands.length > 2) return sections;
	if (operands.length == 2) {
	    for (var i=0; i<operands[1]; i++) {
		sections.push(Number(operands[0])/Number(operands[1]));
	    }
	    continue;
	}
	operands = section.split("*");
	if (operands.length > 2) return sections;
	if (operands.length == 2) {
	    for (var i=0; i<operands[1]; i++) {
		sections.push(Number(operands[0]));
	    }
	    continue;
	}
	sections.push(Number(section));
    }
    return sections;
}

function TrayLayout_GenerateLayout(sx, sy) {

    sx = ParseSections(sx);
    sy = ParseSections(sy);
    nx = sx.length
    ny = sy.length
    layout = '';
    if (nx <= 0)
        nx = 1;
    if (ny <= 0)
        ny = 1;

    for (i = 0; i < nx; i++) {
        line = ' |'.repeat(i) + ` ,> ${sx[i].toFixed(2)}mm\n`;
        layout += line;
    }
    for (i = 0; i < ny; i++) {
        layout += "+-".repeat(nx) + "+\n";
        layout += "| ".repeat(nx) + `|  ${sy[i].toFixed(2)}mm\n`;
    }
    layout += "+-".repeat(nx) + "+\n";
    return layout
}

function TrayUpdateLayout(event) {
    if (window.layoutUpdated == true) {
        // Don't do the update if the layout has been manually touched.
        if (confirm("You have manually updated the Layout.  Do you wish to regenerate it?")) {
            window.layoutUpdated = false;
        } else {
            return;
        }
    }
    sx = document.getElementById('sx').value;
    sy = document.getElementById('sy').value;
    layout_id = document.getElementById('layout');
    layout_id.value = TrayLayout_GenerateLayout(sx, sy);
}


function TrayLayoutInit() {
    ids = ['sx', 'sy'];
    window.layoutUpdated=false;
    for (id_string of ids) {
        id = document.getElementById(id_string);
        id.addEventListener('input', TrayUpdateLayout);
    }
    TrayUpdateLayout();
    layout_id = document.getElementById('layout');
    layout_id.addEventListener('change', setUpdated);
    layout_id.addEventListener('input', setUpdated);
    layout_id.rows = 20;
    layout_id.cols = 24;
}

function addCallbacks() {
    page_callbacks = {
        "TrayLayout": TrayLayoutInit,
        "GridfinityTrayLayout": GridfinityTrayLayoutInit,
        "PhotoFrame": PhotoFrameInit,
    };
    loc = new URL(window.location.href);
    pathname = loc.pathname;
    page = pathname.substr(pathname.lastIndexOf('/')+1);
    if (page in page_callbacks) {
        callback = page_callbacks[page];
        callback();
    }
}

/*** Search for generators **************************************/

document.addEventListener('DOMContentLoaded', function() {
    addCallbacks();
}, false);

function collapseAll() {
    const h = document.getElementsByClassName("toggle");
    for (let el of h) {
        id = el.getAttribute("data-id")
        collapseId(id);
    }
}

function expandAll() {
    const h = document.getElementsByClassName("toggle");
    for (let el of h) {
        id = el.getAttribute("data-id")
        expandId(id);
    }
}

function showAll(str) {
    let matching_ids = document.querySelectorAll('[id^="search_id_"]')
    for (let id of matching_ids) {
        id.style.display = "inline-block";
    }
}

function showOnly(str) {
    str = str.toLowerCase();
    let matching_ids = document.querySelectorAll('[id^="search_id_"]')
    for (let id of matching_ids) {
        name = id.id.replace("search_id_", "").toLowerCase();
        if (name.includes(str) || id.textContent.toLowerCase().includes(str)) {
            id.style.display = "inline-block";
        } else {
            id.style.display = "none";
	}
    }
}

function filterSearchItems() {
    const search = document.getElementById("search")
    if (search.value.length == 0) {
        collapseAll();
        showAll()
    } else {
        expandAll();
        showOnly(search.value)
    }
}

/*** Save to Local Storage ******************************************/

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
}

function saveToLocal() {
    // Get the current URL parameters
    const form = document.querySelector("#arguments");
    const formData = new FormData(form);
    
    // Get the box type from the URL
    const pathname = window.location.pathname;
    const boxType = pathname.substr(pathname.lastIndexOf('/') + 1);
    
    // Build the query string (everything after the box name)
    const queryString = new URLSearchParams(formData).toString();
    const configUrl = boxType + '?' + queryString;
    
    // Open modal to get name from user
    openModal('saveLocalModal');
    
    // Store the URL temporarily so we can save it after getting the name
    window.tempConfigUrl = configUrl;
    window.tempBoxType = boxType;
}

function confirmSaveToLocal() {
    const nameInput = document.getElementById('configName');
    const configName = nameInput.value.trim();
    
    if (!configName) {
        showNotification('Please enter a name for this configuration', 'error');
        return;
    }
    
    // Get existing saved configs or create new object
    let savedConfigs = {};
    try {
        const stored = localStorage.getItem('boxes_saved_configs');
        if (stored) {
            savedConfigs = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading saved configs:', e);
        savedConfigs = {};
    }
    
    // Check if name already exists
    if (savedConfigs[configName]) {
        if (!confirm('A configuration with this name already exists. Overwrite?')) {
            return;
        }
    }
    
    // Save the configuration
    savedConfigs[configName] = {
        url: window.tempConfigUrl,
        boxType: window.tempBoxType,
        timestamp: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('boxes_saved_configs', JSON.stringify(savedConfigs));
        
        // Clear the input and close modal
        nameInput.value = '';
        closeModal('saveLocalModal');
        
        // Show success notification
        showNotification('Configuration saved successfully!', 'success');
    } catch (e) {
        console.error('Error saving configuration:', e);
        showNotification('Error saving configuration: ' + e.message, 'error');
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    // Close any modal if clicking on the backdrop
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

/*** Notification Modal ******************************************/

function showNotification(message, type = 'info') {
    // Create notification modal if it doesn't exist
    let notifModal = document.getElementById('notificationModal');
    if (!notifModal) {
        notifModal = document.createElement('div');
        notifModal.id = 'notificationModal';
        notifModal.className = 'modal';
        notifModal.innerHTML = `
            <div class="modal-content notification-modal">
                <span class="close-modal" onclick="closeNotification()">&times;</span>
                <div class="notification-icon" id="notificationIcon"></div>
                <div class="notification-message" id="notificationMessage"></div>
                <div class="modal-footer">
                    <button type="button" class="primary" onclick="closeNotification()">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(notifModal);
    }
    
    const iconEl = document.getElementById('notificationIcon');
    const messageEl = document.getElementById('notificationMessage');
    
    // Set icon based on type
    if (type === 'success') {
        iconEl.innerHTML = '✓';
        iconEl.className = 'notification-icon success';
    } else if (type === 'error') {
        iconEl.innerHTML = '✕';
        iconEl.className = 'notification-icon error';
    } else {
        iconEl.innerHTML = 'ℹ';
        iconEl.className = 'notification-icon info';
    }
    
    messageEl.textContent = message;
    notifModal.style.display = 'block';
}

function closeNotification() {
    const notifModal = document.getElementById('notificationModal');
    if (notifModal) {
        notifModal.style.display = 'none';
    }
}

/*** Saved Makes Management ******************************************/

function loadSavedMakes() {
    // Get saved configurations from localStorage
    let savedConfigs = {};
    try {
        const stored = localStorage.getItem('boxes_saved_configs');
        if (stored) {
            savedConfigs = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading saved configs:', e);
        return {};
    }
    return savedConfigs;
}

function displaySavedMakes() {
    const container = document.getElementById('saved-makes-container');
    if (!container) return;
    
    const savedConfigs = loadSavedMakes();
    const configNames = Object.keys(savedConfigs);
    
    if (configNames.length === 0) {
        container.innerHTML = '<p>No saved configurations yet. Visit a box generator page and click "Save to Local" to save your first configuration.</p>';
        return;
    }
    
    // Build the list of saved makes
    let html = '<div class="makes-list">';
    
    configNames.forEach(name => {
        const config = savedConfigs[name];
        const date = new Date(config.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        html += `
            <div class="make-item" data-name="${escapeHtml(name)}">
                <div class="make-info">
                    <h3 class="make-name">${escapeHtml(name)}</h3>
                    <p class="make-details">
                        <span class="make-type">${escapeHtml(config.boxType)}</span>
                        <span class="make-date">${formattedDate}</span>
                    </p>
                </div>
                <div class="make-actions">
                    <button class="primary" onclick="loadMake('${escapeHtml(name)}')">Load</button>
                    <button class="secondary" onclick="renameMake('${escapeHtml(name)}')">Rename</button>
                    <button class="danger" onclick="deleteMake('${escapeHtml(name)}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadMake(name) {
    const savedConfigs = loadSavedMakes();
    const config = savedConfigs[name];
    
    if (!config) {
        alert('Configuration not found!');
        return;
    }
    
    // Navigate to the saved URL
    window.location.href = config.url;
}

function renameMake(oldName) {
    // Store the old name for later use
    window.tempOldMakeName = oldName;
    
    // Create or show rename modal
    let renameModal = document.getElementById('renameModal');
    if (!renameModal) {
        renameModal = document.createElement('div');
        renameModal.id = 'renameModal';
        renameModal.className = 'modal';
        renameModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('renameModal')">&times;</span>
                    Rename Configuration
                </div>
                <div class="modal-body">
                    <label for="newMakeName">New Name:</label>
                    <input type="text" id="newMakeName" placeholder="Enter new name" />
                </div>
                <div class="modal-footer">
                    <button type="button" class="tertiary" onclick="closeModal('renameModal')">Cancel</button>
                    <button type="button" class="primary" onclick="confirmRenameMake()">Rename</button>
                </div>
            </div>
        `;
        document.body.appendChild(renameModal);
    }
    
    // Pre-fill the input with current name
    document.getElementById('newMakeName').value = oldName;
    openModal('renameModal');
    
    // Focus and select the input
    setTimeout(() => {
        const input = document.getElementById('newMakeName');
        input.focus();
        input.select();
    }, 100);
}

function confirmRenameMake() {
    const oldName = window.tempOldMakeName;
    const newName = document.getElementById('newMakeName').value.trim();
    
    if (!newName || newName === '') {
        showNotification('Please enter a valid name', 'error');
        return;
    }
    
    if (newName === oldName) {
        closeModal('renameModal');
        return;
    }
    
    const savedConfigs = loadSavedMakes();
    
    if (savedConfigs[newName]) {
        showNotification('A configuration with that name already exists!', 'error');
        return;
    }
    
    // Rename by copying and deleting old
    savedConfigs[newName] = savedConfigs[oldName];
    delete savedConfigs[oldName];
    
    try {
        localStorage.setItem('boxes_saved_configs', JSON.stringify(savedConfigs));
        closeModal('renameModal');
        displaySavedMakes(); // Refresh the list
        showNotification('Configuration renamed successfully!', 'success');
    } catch (e) {
        console.error('Error renaming configuration:', e);
        showNotification('Error renaming configuration: ' + e.message, 'error');
    }
}

function deleteMake(name) {
    // Store the name for later use
    window.tempDeleteMakeName = name;
    
    // Create or show delete confirmation modal
    let deleteModal = document.getElementById('deleteModal');
    if (!deleteModal) {
        deleteModal = document.createElement('div');
        deleteModal.id = 'deleteModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('deleteModal')">&times;</span>
                    Confirm Delete
                </div>
                <div class="modal-body">
                    <p id="deleteMessage"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="tertiary" onclick="closeModal('deleteModal')">Cancel</button>
                    <button type="button" class="danger" onclick="confirmDeleteMake()">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    
    // Set the confirmation message
    document.getElementById('deleteMessage').textContent = `Are you sure you want to delete "${name}"?`;
    openModal('deleteModal');
}

function confirmDeleteMake() {
    const name = window.tempDeleteMakeName;
    const savedConfigs = loadSavedMakes();
    delete savedConfigs[name];
    
    try {
        localStorage.setItem('boxes_saved_configs', JSON.stringify(savedConfigs));
        closeModal('deleteModal');
        displaySavedMakes(); // Refresh the list
        showNotification('Configuration deleted successfully!', 'success');
    } catch (e) {
        console.error('Error deleting configuration:', e);
        showNotification('Error deleting configuration: ' + e.message, 'error');
    }
}

function initMakesPage() {
    console.log('Initializing Makes page');
    displaySavedMakes();
}

// ===== Materials Management Functions =====

function getMaterials() {
    const stored = localStorage.getItem('boxes_materials');
    return stored ? JSON.parse(stored) : {};
}

function saveMaterial(materialData) {
    const materials = getMaterials();
    const id = materialData.id || Date.now().toString();
    materials[id] = {
        id: id,
        name: materialData.name,
        type: materialData.type,
        notes: materialData.notes || '',
        thickness: parseFloat(materialData.thickness) || 0,
        burn: parseFloat(materialData.burn) || 0,
        spacing: materialData.spacing || '2',
        createdAt: materialData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('boxes_materials', JSON.stringify(materials));
        return id;
    } catch (e) {
        console.error('Error saving material:', e);
        throw e;
    }
}

function updateMaterial(id, materialData) {
    const materials = getMaterials();
    if (!materials[id]) {
        throw new Error('Material not found');
    }
    
    materials[id] = {
        ...materials[id],
        ...materialData,
        id: id,
        updatedAt: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('boxes_materials', JSON.stringify(materials));
    } catch (e) {
        console.error('Error updating material:', e);
        throw e;
    }
}

function deleteMaterial(id) {
    const materials = getMaterials();
    delete materials[id];
    
    try {
        localStorage.setItem('boxes_materials', JSON.stringify(materials));
    } catch (e) {
        console.error('Error deleting material:', e);
        throw e;
    }
}

function displayMaterials() {
    const materials = getMaterials();
    const materialsContainer = document.getElementById('materials-list');
    
    if (!materialsContainer) return;
    
    // Group materials by type
    const grouped = {
        'Wood': [],
        'Acrylic': [],
        'Cardboard': [],
        'Other': []
    };
    
    Object.values(materials).forEach(material => {
        const type = material.type || 'Other';
        if (grouped[type]) {
            grouped[type].push(material);
        } else {
            grouped['Other'].push(material);
        }
    });
    
    // Build HTML
    let html = '';
    
    Object.keys(grouped).forEach(type => {
        if (grouped[type].length > 0) {
            html += `<div class="material-group">
                <h3>${type}</h3>
                <div class="material-cards">`;
            
            grouped[type].forEach(material => {
                html += `
                    <div class="material-card">
                        <div class="material-card-header">
                            <h4>${material.name}</h4>
                            <div class="material-card-actions">
                                <button class="tertiary small" onclick="editMaterial('${material.id}')">Edit</button>
                                <button class="danger small" onclick="confirmDeleteMaterial('${material.id}', '${material.name}')">Delete</button>
                            </div>
                        </div>
                        <div class="material-card-body">
                            <div class="material-property"><strong>Thickness:</strong> ${material.thickness} mm</div>
                            <div class="material-property"><strong>Burn:</strong> ${material.burn} mm</div>
                            <div class="material-property"><strong>Spacing:</strong> ${material.spacing}</div>
                            ${material.notes ? `<div class="material-notes"><strong>Notes:</strong> ${material.notes}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
    });
    
    if (html === '') {
        html = '<p class="empty-state">No materials yet. Click "Add Material" to get started!</p>';
    }
    
    materialsContainer.innerHTML = html;
}

function openMaterialModal(materialId = null) {
    const modal = document.getElementById('materialModal');
    const form = document.getElementById('materialForm');
    const modalTitle = modal.querySelector('.modal-header');
    
    form.reset();
    
    if (materialId) {
        // Edit mode
        modalTitle.textContent = 'Edit Material';
        const materials = getMaterials();
        const material = materials[materialId];
        
        if (material) {
            document.getElementById('materialId').value = material.id;
            document.getElementById('materialName').value = material.name;
            document.getElementById('materialType').value = material.type;
            document.getElementById('materialNotes').value = material.notes || '';
            document.getElementById('materialThickness').value = material.thickness;
            document.getElementById('materialBurn').value = material.burn;
            document.getElementById('materialSpacing').value = material.spacing;
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Material';
        document.getElementById('materialId').value = '';
    }
    
    openModal('materialModal');
}

function editMaterial(id) {
    openMaterialModal(id);
}

function saveMaterialForm() {
    const form = document.getElementById('materialForm');
    const materialId = document.getElementById('materialId').value;
    
    const materialData = {
        name: document.getElementById('materialName').value.trim(),
        type: document.getElementById('materialType').value,
        notes: document.getElementById('materialNotes').value.trim(),
        thickness: document.getElementById('materialThickness').value,
        burn: document.getElementById('materialBurn').value,
        spacing: document.getElementById('materialSpacing').value
    };
    
    // Validation
    if (!materialData.name) {
        showNotification('Please enter a material name', 'error');
        return;
    }
    
    if (!materialData.thickness || materialData.thickness <= 0) {
        showNotification('Please enter a valid thickness', 'error');
        return;
    }
    
    try {
        if (materialId) {
            // Update existing
            updateMaterial(materialId, materialData);
            showNotification('Material updated successfully!', 'success');
        } else {
            // Create new
            saveMaterial(materialData);
            showNotification('Material added successfully!', 'success');
        }
        
        closeModal('materialModal');
        displayMaterials();
    } catch (e) {
        showNotification('Error saving material: ' + e.message, 'error');
    }
}

function confirmDeleteMaterial(id, name) {
    window.tempDeleteMaterialId = id;
    
    let deleteModal = document.getElementById('deleteMaterialModal');
    if (!deleteModal) {
        deleteModal = document.createElement('div');
        deleteModal.id = 'deleteMaterialModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('deleteMaterialModal')">&times;</span>
                    Confirm Delete
                </div>
                <div class="modal-body">
                    <p id="deleteMaterialMessage"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="tertiary" onclick="closeModal('deleteMaterialModal')">Cancel</button>
                    <button type="button" class="danger" onclick="executeDeleteMaterial()">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    
    document.getElementById('deleteMaterialMessage').textContent = `Are you sure you want to delete "${name}"?`;
    openModal('deleteMaterialModal');
}

function executeDeleteMaterial() {
    const id = window.tempDeleteMaterialId;
    
    try {
        deleteMaterial(id);
        closeModal('deleteMaterialModal');
        displayMaterials();
        showNotification('Material deleted successfully!', 'success');
    } catch (e) {
        showNotification('Error deleting material: ' + e.message, 'error');
    }
}

function initMaterialsPage() {
    console.log('Initializing Materials page');
    displayMaterials();
}

// ===== Material Selector for Box Generation =====

function populateMaterialSelector() {
    const searchInput = document.getElementById('material-search');
    const select = document.getElementById('material-select');
    if (!searchInput || !select) return;
    
    const materials = getMaterials();
    const materialsList = Object.values(materials);
    
    if (materialsList.length === 0) {
        searchInput.placeholder = 'No materials saved yet - click "Manage Materials" to add some';
        searchInput.disabled = true;
        return;
    }
    
    // Sort materials by type, then name
    materialsList.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
        }
        return a.name.localeCompare(b.name);
    });
    
    // Store materials for searching
    window.allMaterials = materialsList;
    
    // Setup autocomplete behavior
    searchInput.addEventListener('focus', () => {
        updateMaterialList('');
        select.style.display = 'block';
    });
    
    searchInput.addEventListener('input', (e) => {
        updateMaterialList(e.target.value);
        select.style.display = 'block';
    });
    
    searchInput.addEventListener('blur', () => {
        // Delay hiding to allow click on select
        setTimeout(() => {
            select.style.display = 'none';
        }, 200);
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            select.focus();
            if (select.options.length > 0) {
                select.selectedIndex = 0;
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (select.options.length > 0) {
                select.selectedIndex = 0;
                applyMaterial();
            }
        }
    });
    
    select.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyMaterial();
            select.style.display = 'none';
            searchInput.value = '';
        }
    });
}

function updateMaterialList(searchTerm) {
    const select = document.getElementById('material-select');
    if (!select || !window.allMaterials) return;
    
    select.innerHTML = '';
    
    const filtered = window.allMaterials.filter(material => {
        const searchLower = searchTerm.toLowerCase();
        return material.name.toLowerCase().includes(searchLower) ||
               material.type.toLowerCase().includes(searchLower) ||
               material.thickness.toString().includes(searchTerm);
    });
    
    if (filtered.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No materials match your search';
        select.appendChild(option);
        return;
    }
    
    // Group by type
    let currentType = null;
    filtered.forEach(material => {
        if (material.type !== currentType) {
            if (currentType !== null) {
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = `───── ${material.type} ─────`;
                select.appendChild(separator);
            } else {
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.textContent = `───── ${material.type} ─────`;
                select.appendChild(separator);
            }
            currentType = material.type;
        }
        
        const option = document.createElement('option');
        option.value = material.id;
        option.textContent = `${material.name} (${material.thickness}mm)`;
        option.setAttribute('data-material', JSON.stringify(material));
        select.appendChild(option);
    });
}

function applyMaterial() {
    const select = document.getElementById('material-select');
    const searchInput = document.getElementById('material-search');
    
    if (!select || !select.value) return;
    
    const selectedOption = select.options[select.selectedIndex];
    const materialData = JSON.parse(selectedOption.getAttribute('data-material'));
    
    // Apply to form fields if they exist
    const thicknessField = document.getElementById('thickness');
    const burnField = document.getElementById('burn');
    const spacingField = document.getElementById('spacing');
    
    if (thicknessField) {
        thicknessField.value = materialData.thickness;
        thicknessField.dispatchEvent(new Event('change'));
    }
    
    if (burnField) {
        burnField.value = materialData.burn;
        burnField.dispatchEvent(new Event('change'));
    }
    
    if (spacingField) {
        spacingField.value = materialData.spacing;
        spacingField.dispatchEvent(new Event('change'));
    }
    
    // Clear and hide dropdown
    if (searchInput) {
        searchInput.value = `✓ ${materialData.name}`;
        setTimeout(() => {
            searchInput.value = '';
        }, 2000);
    }
    select.style.display = 'none';
    
    // Show notification
    showNotification(`Applied material: ${materialData.name}`, 'success');
    
    // Refresh preview if it exists
    if (typeof refreshPreview === 'function') {
        refreshPreview();
    }
}
