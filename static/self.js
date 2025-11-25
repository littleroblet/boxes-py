
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
    
    // Initialize templates dropdown if templates exist
    initTemplates();
    
    // Initialize grid designers for any fields with designer metadata
    initGridDesigners();
    
    // Apply defaults before refreshing preview
    applyDefaults();
    
    refreshPreview();
    document.getElementById("preview_chk").addEventListener("change", togglePreview);
    
    // Populate material selector if it exists
    populateMaterialSelector();
    populateFavoriteButton();
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
    loadDarkModePreference();
    
    // Initialize home page if on home
    if (document.getElementById('favorites-container')) {
        initHomePage();
    }
    
    // Initialize tag filter if on Gallery/Menu page
    if (window.allGeneratorTags) {
        initTagFilter();
    }
}, false);

// Load dark mode preference from localStorage on page load
function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem('boxes_dark_mode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

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

/*** Tag Filtering **************************************/

function initTagFilter() {
    // Populate tag dropdown with all unique tags
    const tagFilter = document.getElementById('tagFilter');
    console.log('initTagFilter called, tagFilter:', tagFilter);
    console.log('window.allGeneratorTags:', window.allGeneratorTags);
    
    if (!tagFilter || !window.allGeneratorTags) {
        console.log('Exiting early - tagFilter or allGeneratorTags not found');
        return;
    }
    
    const allTags = new Set();
    Object.values(window.allGeneratorTags).forEach(tags => {
        tags.forEach(tag => allTags.add(tag));
    });
    
    console.log('All tags collected:', allTags);
    
    const sortedTags = Array.from(allTags).sort();
    sortedTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
    
    console.log('Tag filter populated with', sortedTags.length, 'tags');
}

function filterByTag() {
    const tagFilter = document.getElementById('tagFilter');
    const selectedTag = tagFilter.value;
    
    console.log('filterByTag called with tag:', selectedTag);
    
    // Get all generator list items and gallery spans
    const items = document.querySelectorAll('[id^="search_id_"]');
    
    console.log('Found', items.length, 'items to filter');
    
    items.forEach(item => {
        if (!selectedTag) {
            // Show all if no tag selected
            item.style.display = item.tagName === 'LI' ? 'list-item' : 'inline-block';
        } else {
            // Check if item has the selected tag
            const itemTags = item.getAttribute('data-tags');
            if (itemTags && itemTags.split(',').includes(selectedTag)) {
                item.style.display = item.tagName === 'LI' ? 'list-item' : 'inline-block';
            } else {
                item.style.display = 'none';
            }
        }
    });
    
    // Also apply search filter if active
    const search = document.getElementById('search');
    if (search && search.value.length > 0) {
        // Re-apply search on visible items
        const searchText = search.value.toLowerCase();
        items.forEach(item => {
            const displayStyle = item.tagName === 'LI' ? 'list-item' : 'inline-block';
            if (item.style.display === displayStyle) {
                const text = item.textContent.toLowerCase();
                if (!text.includes(searchText)) {
                    item.style.display = 'none';
                }
            }
        });
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
        project: 'Uncategorized',
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

function getMakeProjects() {
    const stored = localStorage.getItem('boxes_make_projects');
    if (stored) {
        const projects = JSON.parse(stored);
        // Always ensure "Uncategorized" exists
        if (!projects.includes('Uncategorized')) {
            projects.unshift('Uncategorized');
            localStorage.setItem('boxes_make_projects', JSON.stringify(projects));
        }
        return projects;
    }
    // Default projects
    return ['Uncategorized'];
}

function saveMakeProjects(projects) {
    // Always ensure "Uncategorized" is first
    const filtered = projects.filter(p => p !== 'Uncategorized');
    const final = ['Uncategorized', ...filtered];
    localStorage.setItem('boxes_make_projects', JSON.stringify(final));
}

function addMakeProject(projectName) {
    const projects = getMakeProjects();
    const trimmed = projectName.trim();
    if (trimmed && !projects.includes(trimmed)) {
        projects.push(trimmed);
        saveMakeProjects(projects);
        return true;
    }
    return false;
}

function deleteMakeProject(projectName) {
    if (projectName === 'Uncategorized') {
        return false; // Cannot delete Uncategorized
    }
    const projects = getMakeProjects();
    const filtered = projects.filter(p => p !== projectName);
    saveMakeProjects(filtered);
    
    // Update any makes using this project to "Uncategorized"
    const savedConfigs = loadSavedMakes();
    let updated = false;
    Object.values(savedConfigs).forEach(config => {
        if (config.project === projectName) {
            config.project = 'Uncategorized';
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('boxes_saved_configs', JSON.stringify(savedConfigs));
    }
    return true;
}

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
        container.innerHTML = '<div class="card"><div class="card-body" style="text-align: center; padding: 60px 20px;"><p style="color: #999; font-size: 16px; margin: 0;">No saved configurations yet. Visit a box generator page and click "Save to Local" to save your first configuration.</p></div></div>';
        return;
    }
    
    // Get projects and initialize grouped object
    const projects = getMakeProjects();
    const grouped = {};
    projects.forEach(proj => {
        grouped[proj] = [];
    });
    
    // Group makes by project
    configNames.forEach(name => {
        const config = savedConfigs[name];
        const project = config.project || 'Uncategorized';
        if (grouped[project]) {
            grouped[project].push({ name, config });
        } else {
            grouped['Uncategorized'].push({ name, config });
        }
    });
    
    // Build HTML
    let html = '';
    
    Object.keys(grouped).forEach(project => {
        if (grouped[project].length > 0) {
            const deleteBtn = project !== 'Uncategorized' ? 
                `<button class="accent red small" onclick="confirmDeleteProject('${project}')" style="padding: 4px 8px; font-size: 12px;">Delete Project</button>` : '';
            html += `<div style="margin-bottom: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="font-size: 20px; font-weight: 600; margin: 0; color: #333;">${project}</h4>
                    ${deleteBtn}
                </div>
                <div class="card-grid">`;
            
            grouped[project].forEach(({ name, config }) => {
                const date = new Date(config.timestamp);
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
                
                html += `
                    <div class="card" data-name="${escapeHtml(name)}">
                    <div class="card-header">
                            <div class="card-header-title">${escapeHtml(name)}</div>
                        </div>
                        <div class="card-body">
                            <div class="card-meta">
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Type:</span>
                                    <span class="card-meta-value">${escapeHtml(config.boxType)}</span>
                                </div>
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Saved:</span>
                                    <span class="card-meta-value">${formattedDate}</span>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="card-actions">
                                <button class="primary" onclick="loadMake('${escapeHtml(name)}')">Load</button>
                                <button class="secondary" onclick="editMake('${escapeHtml(name)}')">Edit</button>
                                <button class="accent red" onclick="deleteMake('${escapeHtml(name)}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }
    });
    
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

function editMake(name) {
    // Store the name for later use
    window.tempEditMakeName = name;
    
    const savedConfigs = loadSavedMakes();
    const config = savedConfigs[name];
    
    if (!config) {
        showNotification('Configuration not found!', 'error');
        return;
    }
    
    // Create or show edit modal
    let editModal = document.getElementById('editMakeModal');
    if (!editModal) {
        editModal = document.createElement('div');
        editModal.id = 'editMakeModal';
        editModal.className = 'modal';
        editModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('editMakeModal')">&times;</span>
                    Edit Configuration
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="editMakeName">Name:</label>
                        <input type="text" id="editMakeName" class="form-control" placeholder="Enter name" />
                    </div>
                    <div class="form-group">
                        <label for="editMakeProject">Project:</label>
                        <select id="editMakeProject" class="form-control" onchange="handleProjectSelect(this)">
                            <option value="Uncategorized">Uncategorized</option>
                        </select>
                        <small>Select a project or create a new one</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="accent lightgrey" onclick="closeModal('editMakeModal')">Cancel</button>
                    <button type="button" class="primary" onclick="confirmEditMake()">Save Changes</button>
                </div>
            </div>
        `;
        document.body.appendChild(editModal);
    }
    
    // Populate project dropdown
    populateProjectSelect();
    
    // Pre-fill the form
    document.getElementById('editMakeName').value = name;
    document.getElementById('editMakeProject').value = config.project || 'Uncategorized';
    
    openModal('editMakeModal');
    
    // Focus the input
    setTimeout(() => {
        document.getElementById('editMakeName').focus();
    }, 100);
}

function populateProjectSelect() {
    const select = document.getElementById('editMakeProject');
    if (!select) return;
    
    const projects = getMakeProjects();
    const currentValue = select.value;
    
    select.innerHTML = '';
    projects.forEach(proj => {
        const option = document.createElement('option');
        option.value = proj;
        option.textContent = proj;
        select.appendChild(option);
    });
    
    // Add "Add New Project..." option
    const addOption = document.createElement('option');
    addOption.value = '__ADD_NEW__';
    addOption.textContent = '+ Add New Project...';
    select.appendChild(addOption);
    
    // Restore previous value if it exists
    if (currentValue && projects.includes(currentValue)) {
        select.value = currentValue;
    }
}

function handleProjectSelect(selectElement) {
    if (selectElement.value === '__ADD_NEW__') {
        const newProject = prompt('Enter new project name:');
        if (newProject && newProject.trim()) {
            if (addMakeProject(newProject.trim())) {
                populateProjectSelect();
                selectElement.value = newProject.trim();
            } else {
                showNotification('Project already exists or is invalid', 'error');
                selectElement.value = 'Uncategorized';
            }
        } else {
            selectElement.value = 'Uncategorized';
        }
    }
}

function confirmEditMake() {
    const oldName = window.tempEditMakeName;
    const newName = document.getElementById('editMakeName').value.trim();
    const project = document.getElementById('editMakeProject').value;
    
    if (!newName || newName === '') {
        showNotification('Please enter a valid name', 'error');
        return;
    }
    
    const savedConfigs = loadSavedMakes();
    
    // Check if renaming to a different name that already exists
    if (newName !== oldName && savedConfigs[newName]) {
        showNotification('A configuration with that name already exists!', 'error');
        return;
    }
    
    // Update the configuration
    if (newName !== oldName) {
        // Rename: copy to new name and delete old
        savedConfigs[newName] = savedConfigs[oldName];
        delete savedConfigs[oldName];
    }
    
    // Update project
    savedConfigs[newName].project = project;
    
    try {
        localStorage.setItem('boxes_saved_configs', JSON.stringify(savedConfigs));
        closeModal('editMakeModal');
        displaySavedMakes();
        showNotification('Configuration updated successfully!', 'success');
    } catch (e) {
        console.error('Error updating configuration:', e);
        showNotification('Error updating configuration: ' + e.message, 'error');
    }
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
                    <button type="button" class="accent lightgrey" onclick="closeModal('renameModal')">Cancel</button>
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
                    <button type="button" class="accent lightgrey" onclick="closeModal('deleteModal')">Cancel</button>
                    <button type="button" class="accent red" onclick="confirmDeleteMake()">Delete</button>
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

function confirmDeleteProject(projectName) {
    window.tempDeleteProjectName = projectName;
    
    // Count makes in this project
    const savedConfigs = loadSavedMakes();
    const count = Object.values(savedConfigs).filter(c => c.project === projectName).length;
    
    let deleteModal = document.getElementById('deleteProjectModal');
    if (!deleteModal) {
        deleteModal = document.createElement('div');
        deleteModal.id = 'deleteProjectModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('deleteProjectModal')">&times;</span>
                    Delete Project
                </div>
                <div class="modal-body">
                    <p id="deleteProjectMessage"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="accent lightgrey" onclick="closeModal('deleteProjectModal')">Cancel</button>
                    <button type="button" class="accent red" onclick="executeDeleteProject()">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    
    const message = count > 0 
        ? `Delete project "${projectName}"? ${count} configuration(s) will be moved to "Uncategorized".`
        : `Delete project "${projectName}"?`;
    
    document.getElementById('deleteProjectMessage').textContent = message;
    openModal('deleteProjectModal');
}

function executeDeleteProject() {
    const projectName = window.tempDeleteProjectName;
    
    try {
        deleteMakeProject(projectName);
        closeModal('deleteProjectModal');
        displaySavedMakes();
        showNotification('Project deleted successfully!', 'success');
    } catch (e) {
        showNotification('Error deleting project: ' + e.message, 'error');
    }
}

function initMakesPage() {
    console.log('Initializing Makes page');
    displaySavedMakes();
}

// ===== Materials Management Functions =====

function getMaterialCategories() {
    const stored = localStorage.getItem('boxes_material_categories');
    if (stored) {
        const categories = JSON.parse(stored);
        // Always ensure "Uncategorized" exists
        if (!categories.includes('Uncategorized')) {
            categories.unshift('Uncategorized');
            localStorage.setItem('boxes_material_categories', JSON.stringify(categories));
        }
        return categories;
    }
    // Default categories
    return ['Uncategorized', 'Wood', 'Acrylic', 'Cardboard'];
}

function saveMaterialCategories(categories) {
    // Always ensure "Uncategorized" is first
    const filtered = categories.filter(c => c !== 'Uncategorized');
    const final = ['Uncategorized', ...filtered];
    localStorage.setItem('boxes_material_categories', JSON.stringify(final));
}

function addMaterialCategory(categoryName) {
    const categories = getMaterialCategories();
    const trimmed = categoryName.trim();
    if (trimmed && !categories.includes(trimmed)) {
        categories.push(trimmed);
        saveMaterialCategories(categories);
        return true;
    }
    return false;
}

function deleteMaterialCategory(categoryName) {
    if (categoryName === 'Uncategorized') {
        return false; // Cannot delete Uncategorized
    }
    const categories = getMaterialCategories();
    const filtered = categories.filter(c => c !== categoryName);
    saveMaterialCategories(filtered);
    
    // Update any materials using this category to "Uncategorized"
    const materials = getMaterials();
    let updated = false;
    Object.values(materials).forEach(material => {
        if (material.type === categoryName) {
            material.type = 'Uncategorized';
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('boxes_materials', JSON.stringify(materials));
    }
    return true;
}

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
        inner_corner: materialData.inner_corner || 'loop',
        tabs: parseFloat(materialData.tabs) || 0,
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
    
    // Get categories and initialize grouped object
    const categories = getMaterialCategories();
    const grouped = {};
    categories.forEach(cat => {
        grouped[cat] = [];
    });
    
    // Group materials by type
    Object.values(materials).forEach(material => {
        const type = material.type || 'Uncategorized';
        if (grouped[type]) {
            grouped[type].push(material);
        } else {
            grouped['Uncategorized'].push(material);
        }
    });
    
    // Build HTML
    let html = '';
    
    Object.keys(grouped).forEach(type => {
        if (grouped[type].length > 0) {
            const deleteBtn = type !== 'Uncategorized' ? 
                `<button class="accent red small" onclick="confirmDeleteCategory('${type}')" style="padding: 4px 8px; font-size: 12px;">Delete Category</button>` : '';
            html += `<div style="margin-bottom: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="font-size: 20px; font-weight: 600; margin: 0; color: #333;">${type}</h4>
                    ${deleteBtn}
                </div>
                <div class="card-grid">`;
            
            grouped[type].forEach(material => {
                html += `
                    <div class="card">
                    <div class="card-header">
                    <div class="card-header-title">${material.name}</div>
                </div>
                        <div class="card-body">
                            <div class="card-meta">
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Thickness:</span>
                                    <span class="card-meta-value">${material.thickness} mm</span>
                                </div>
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Burn:</span>
                                    <span class="card-meta-value">${material.burn} mm</span>
                                </div>
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Spacing:</span>
                                    <span class="card-meta-value">${material.spacing}</span>
                                </div>
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Inner Corner:</span>
                                    <span class="card-meta-value">${material.inner_corner || 'loop'}</span>
                                </div>
                                <div class="card-meta-item">
                                    <span class="card-meta-label">Tabs:</span>
                                    <span class="card-meta-value">${material.tabs || 0}</span>
                                </div>
                            </div>
                            ${material.notes ? `<div class="card-text" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f0f0;"><strong>Notes:</strong><br>${material.notes}</div>` : ''}
                        </div>
                        <div class="card-footer">
                            <div class="card-actions">
                                <button class="accent grey" onclick="editMaterial('${material.id}')">Edit</button>
                                <button class="accent red" onclick="confirmDeleteMaterial('${material.id}', '${material.name}')">Delete</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }
    });
    
    if (html === '') {
        html = '<div class="card"><div class="card-body" style="text-align: center; padding: 60px 20px;"><p style="color: #999; font-size: 16px; margin: 0;">No materials yet. Click "Add Material" to get started!</p></div></div>';
    }
    
    materialsContainer.innerHTML = html;
}

function populateCategorySelect() {
    const select = document.getElementById('materialType');
    if (!select) return;
    
    const categories = getMaterialCategories();
    const currentValue = select.value;
    
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
    
    // Add "Add New Category..." option
    const addOption = document.createElement('option');
    addOption.value = '__ADD_NEW__';
    addOption.textContent = '+ Add New Category...';
    select.appendChild(addOption);
    
    // Restore previous value if it exists
    if (currentValue && categories.includes(currentValue)) {
        select.value = currentValue;
    }
}

function handleCategorySelect(selectElement) {
    if (selectElement.value === '__ADD_NEW__') {
        const newCategory = prompt('Enter new category name:');
        if (newCategory && newCategory.trim()) {
            if (addMaterialCategory(newCategory.trim())) {
                populateCategorySelect();
                selectElement.value = newCategory.trim();
            } else {
                showNotification('Category already exists or is invalid', 'error');
                selectElement.value = 'Uncategorized';
            }
        } else {
            selectElement.value = 'Uncategorized';
        }
    }
}

function openMaterialModal(materialId = null) {
    const modal = document.getElementById('materialModal');
    const form = document.getElementById('materialForm');
    const modalTitle = modal.querySelector('.modal-header');
    
    form.reset();
    
    // Populate category dropdown
    populateCategorySelect();
    
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
            document.getElementById('materialInnerCorner').value = material.inner_corner || 'loop';
            document.getElementById('materialTabs').value = material.tabs || 0;
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
        spacing: document.getElementById('materialSpacing').value,
        inner_corner: document.getElementById('materialInnerCorner').value,
        tabs: document.getElementById('materialTabs').value
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
                    <button type="button" class="accent lightgrey" onclick="closeModal('deleteMaterialModal')">Cancel</button>
                    <button type="button" class="accent red" onclick="executeDeleteMaterial()">Delete</button>
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

function confirmDeleteCategory(categoryName) {
    window.tempDeleteCategoryName = categoryName;
    
    // Count materials in this category
    const materials = getMaterials();
    const count = Object.values(materials).filter(m => m.type === categoryName).length;
    
    let deleteModal = document.getElementById('deleteCategoryModal');
    if (!deleteModal) {
        deleteModal = document.createElement('div');
        deleteModal.id = 'deleteCategoryModal';
        deleteModal.className = 'modal';
        deleteModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <span class="close-modal" onclick="closeModal('deleteCategoryModal')">&times;</span>
                    Delete Category
                </div>
                <div class="modal-body">
                    <p id="deleteCategoryMessage"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="accent lightgrey" onclick="closeModal('deleteCategoryModal')">Cancel</button>
                    <button type="button" class="accent red" onclick="executeDeleteCategory()">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(deleteModal);
    }
    
    const message = count > 0 
        ? `Delete category "${categoryName}"? ${count} material(s) will be moved to "Uncategorized".`
        : `Delete category "${categoryName}"?`;
    
    document.getElementById('deleteCategoryMessage').textContent = message;
    openModal('deleteCategoryModal');
}

function executeDeleteCategory() {
    const categoryName = window.tempDeleteCategoryName;
    
    try {
        deleteMaterialCategory(categoryName);
        closeModal('deleteCategoryModal');
        displayMaterials();
        showNotification('Category deleted successfully!', 'success');
    } catch (e) {
        showNotification('Error deleting category: ' + e.message, 'error');
    }
}

function initMaterialsPage() {
    console.log('Initializing Materials page');
    displayMaterials();
}

// ===== Favorite Boxes Management =====

// Get current box name from URL
function getCurrentBoxName() {
    const path = window.location.pathname;
    const match = path.match(/\/([^\/]+)$/);
    return match ? match[1] : null;
}

// Load favorite boxes from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('boxes_favorite_boxes');
    return stored ? JSON.parse(stored) : [];
}   

// Save favorite boxes to localStorage
function saveFavorites(favorites) {
    localStorage.setItem('boxes_favorite_boxes', JSON.stringify(favorites));
}   

function populateFavoriteButton() {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;
    
    const favorites = loadFavorites();
    const boxName = getCurrentBoxName();
    
    if (!boxName) return;
    
    if (favorites.includes(boxName)) {
        favoriteBtn.classList.add('active');
    } else {
        favoriteBtn.classList.remove('active');
    }
}


// Toggle favorite status for a box
function toggleFavorite(name) {
    const favorites = loadFavorites();
    const index = favorites.indexOf(name);
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (index === -1) {
        favorites.push(name);
        saveFavorites(favorites);
        if (favoriteBtn) {
            favoriteBtn.classList.add('active');
        }
        showNotification(`Added "${name}" to favorites`, 'success');
    } else {
        favorites.splice(index, 1);
        saveFavorites(favorites);
        if (favoriteBtn) {
            favoriteBtn.classList.remove('active');
        }
        showNotification(`Removed "${name}" from favorites`, 'success');
    }
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
    const innerCornerField = document.getElementById('inner_corner');
    const tabsField = document.getElementById('tabs');
    
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
    
    if (innerCornerField) {
        innerCornerField.value = materialData.inner_corner || 'loop';
        innerCornerField.dispatchEvent(new Event('change'));
    }
    
    if (tabsField) {
        tabsField.value = materialData.tabs || 0;
        tabsField.dispatchEvent(new Event('change'));
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

// ===== Settings Page Functions =====

// Get default settings from localStorage
function getDefaults() {
    const stored = localStorage.getItem('boxes_defaults');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing defaults:', e);
        }
    }
    // Return default values
    return {
        format: 'svg',
        reference: 100,
        qr_code: false,
        debug: false,
        labels: false
    };
}

// Save default settings to localStorage
function saveDefaultsToStorage(defaults) {
    localStorage.setItem('boxes_defaults', JSON.stringify(defaults));
}

// Open edit defaults modal and populate with current values
function editDefaults() {
    const defaults = getDefaults();
    
    // Populate form fields
    document.getElementById('defaultFormat').value = defaults.format || 'svg';
    document.getElementById('defaultReference').value = defaults.reference || 100;
    document.getElementById('defaultQrCode').checked = defaults.qr_code || false;
    document.getElementById('defaultDebug').checked = defaults.debug || false;
    document.getElementById('defaultLabels').checked = defaults.labels || false;
    
    openModal('editDefaultsModal');
}

// Save defaults from form
function saveDefaults() {
    const defaults = {
        format: document.getElementById('defaultFormat').value,
        reference: parseFloat(document.getElementById('defaultReference').value) || 100,
        qr_code: document.getElementById('defaultQrCode').checked,
        debug: document.getElementById('defaultDebug').checked,
        labels: document.getElementById('defaultLabels').checked
    };
    
    try {
        saveDefaultsToStorage(defaults);
        showNotification('Defaults saved successfully!', 'success');
        closeModal('editDefaultsModal');
    } catch (e) {
        showNotification('Error saving defaults: ' + e.message, 'error');
    }
}

// Apply defaults to form fields on generator pages
function applyDefaults() {
    const defaults = getDefaults();
    
    // Only apply if URL doesn't have parameters (except language)
    const urlParams = new URLSearchParams(window.location.search);
    const hasParams = Array.from(urlParams.keys()).some(key => key !== 'language');
    
    if (hasParams) {
        // URL has parameters, don't override
        return;
    }
    
    // Apply format
    const formatField = document.getElementById('format');
    if (formatField && !formatField.value) {
        formatField.value = defaults.format;
    }
    
    // Apply reference
    const referenceField = document.getElementById('reference');
    if (referenceField && !referenceField.value) {
        referenceField.value = defaults.reference;
    }
    
    // Apply qr_code
    const qrCodeField = document.getElementById('qr_code');
    if (qrCodeField && qrCodeField.type === 'checkbox') {
        qrCodeField.checked = defaults.qr_code;
    }
    
    // Apply debug
    const debugField = document.getElementById('debug');
    if (debugField && debugField.type === 'checkbox') {
        debugField.checked = defaults.debug;
    }
    
    // Apply labels
    const labelsField = document.getElementById('labels');
    if (labelsField && labelsField.type === 'checkbox') {
        labelsField.checked = defaults.labels;
    }
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('boxes_dark_mode', isDarkMode ? 'true' : 'false');
}

// Export user data to JSON file
function exportUserData() {
    const savedMakes = localStorage.getItem('boxes_saved_configs') || '{}';
    const materials = localStorage.getItem('boxes_materials') || '{}';
    const materialCategories = localStorage.getItem('boxes_material_categories') || '[]';
    const makeProjects = localStorage.getItem('boxes_make_projects') || '[]';
    const favoriteBoxes = localStorage.getItem('boxes_favorite_boxes') || '[]';
    const darkMode = localStorage.getItem('boxes_dark_mode') || 'false';
    const defaults = localStorage.getItem('boxes_defaults') || '{}';
    
    const data = {
        savedMakes: JSON.parse(savedMakes),
        materials: JSON.parse(materials),
        materialCategories: JSON.parse(materialCategories),
        makeProjects: JSON.parse(makeProjects),
        favoriteBoxes: JSON.parse(favoriteBoxes),
        darkMode: darkMode === 'true',
        defaults: JSON.parse(defaults)
    };  
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "boxes_user_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Trigger file input for import
function triggerImportFile() {
    const fileInput = document.getElementById('importFileInput');
    if (fileInput) {
        fileInput.click();
    }
}

// Handle the imported file
function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showNotification('Please select a valid JSON file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            let itemsImported = 0;

            if (data.savedMakes) {
                localStorage.setItem('boxes_saved_configs', JSON.stringify(data.savedMakes));
                itemsImported++;
            }
            if (data.materials) {
                localStorage.setItem('boxes_materials', JSON.stringify(data.materials));
                itemsImported++;
            }
            if (data.materialCategories) {
                localStorage.setItem('boxes_material_categories', JSON.stringify(data.materialCategories));
                itemsImported++;
            }
            if (data.makeProjects) {
                localStorage.setItem('boxes_make_projects', JSON.stringify(data.makeProjects));
                itemsImported++;
            }
            if (data.favoriteBoxes) {
                localStorage.setItem('boxes_favorite_boxes', JSON.stringify(data.favoriteBoxes));
                itemsImported++;
            }
            if (typeof data.darkMode === 'boolean') {
                localStorage.setItem('boxes_dark_mode', data.darkMode ? 'true' : 'false');
                itemsImported++;
            }
            if (data.defaults) {
                localStorage.setItem('boxes_defaults', JSON.stringify(data.defaults));
                itemsImported++;
            }
            
            if (itemsImported > 0) {
                showNotification('User data imported successfully! Refresh the page to see changes.', 'success');
                // Reset file input
                event.target.value = '';
            } else {
                showNotification('No valid data found in the file', 'error');
            }
        } catch (error) {
            console.error('Error importing user data:', error);
            showNotification('Error importing data: Invalid JSON file', 'error');
            event.target.value = '';
        }
    };
    reader.readAsText(file);
}

// ===== Home Page - Favorite Generators Display =====

function displayFavoriteGenerators() {
    const favorites = loadFavorites();
    const container = document.getElementById('favorites-container');
    const noFavoritesMsg = document.getElementById('no-favorites');
    
    if (!container) return; // Not on home page
    
    if (favorites.length === 0) {
        container.style.display = 'none';
        noFavoritesMsg.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noFavoritesMsg.style.display = 'none';
    
    let html = '';
    
    favorites.forEach(name => {
        const box = window.allBoxesData.find(b => b.name === name);
        if (!box) return; // Skip if box not found
        
        const langParam = window.languageParam || '';
        const staticUrl = window.staticUrl || 'static';
        const thumbnailPath = box.thumbnail || `${staticUrl}/samples/${box.name}-thumb.jpg`;
        const fallbackImg = `${staticUrl}/samples/no-image-thumb.jpg`;
        
        html += `
            <div class="card">
                <div class="card-header">
                    <div class="card-header-title">${escapeHtml(box.label)}</div>
                    <button type="button" class="favorite active" onclick="toggleFavoriteOnHome('${escapeHtml(box.name)}')" title="Remove from favorites">★</button>
                </div>
                <div class="card-body">
                    <div style="margin-bottom: 16px; text-align: center;">
                        <img src="${thumbnailPath}" 
                             onerror="this.onerror=null; this.src='${fallbackImg}';" 
                             alt="${escapeHtml(box.label)}" 
                             style="max-width: 200px; max-height: 200px; display: inline-block; border-radius: 4px;">
                    </div>
                    <p class="card-text">${escapeHtml(box.description)}</p>
                </div>
                <div class="card-footer">
                    <a href="./${box.name}${langParam}" class="primary" style="display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Create Box</a>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function toggleFavoriteOnHome(name) {
    toggleFavorite(name);
    // Refresh the display after toggle
    setTimeout(() => {
        displayFavoriteGenerators();
    }, 100);
}

function initHomePage() {
    console.log('Initializing Home page');
    if (typeof window.allBoxesData !== 'undefined') {
        displayFavoriteGenerators();
    }
}

/*** Grid Designer ****************************************/

function initGridDesigners() {
    const textareas = document.querySelectorAll('textarea[data-designer]');
    textareas.forEach(textarea => {
        try {
            const designerData = JSON.parse(textarea.getAttribute('data-designer'));
            if (designerData && designerData.type === 'grid') {
                createGridDesigner(textarea, designerData);
            }
        } catch (e) {
            console.error('Failed to parse designer data:', e);
        }
    });
}

function createGridDesigner(textarea, config) {
    // Create a wrapper to hold both textarea and grid designer
    const wrapper = document.createElement('div');
    wrapper.className = 'grid-designer-wrapper';
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);
    
    // Initially hide textarea
    textarea.style.display = 'none';
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'Switch to Text Mode';
    toggleBtn.style.cssText = 'margin-bottom: 10px; padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;';
    wrapper.appendChild(toggleBtn);
    
    // Create designer container
    const container = document.createElement('div');
    container.className = 'grid-designer-container';
    wrapper.appendChild(container);
    
    let isGridMode = true;
    
    toggleBtn.addEventListener('click', () => {
        isGridMode = !isGridMode;
        if (isGridMode) {
            textarea.style.display = 'none';
            container.style.display = 'block';
            toggleBtn.textContent = 'Switch to Text Mode';
            // Sync grid from textarea when switching back
            syncGridFromTextarea();
        } else {
            textarea.style.display = 'block';
            container.style.display = 'none';
            toggleBtn.textContent = 'Switch to Grid Mode';
        }
    });
    
    const palette = document.createElement('div');
    palette.className = 'grid-designer-palette';
    let selectedElement = config.elements[0];
    config.elements.forEach((elem, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'grid-palette-btn';
        btn.textContent = elem.label;
        btn.style.background = elem.color;
        btn.style.color = getBrightness(elem.color) > 128 ? '#000' : '#fff';
        if (idx === 0) btn.style.borderColor = '#333';
        btn.addEventListener('click', () => {
            selectedElement = elem;
            palette.querySelectorAll('button').forEach(b => b.style.borderColor = 'transparent');
            btn.style.borderColor = '#333';
        });
        palette.appendChild(btn);
    });
    container.appendChild(palette);
    const grid = document.createElement('div');
    grid.className = 'grid-designer-grid';
    grid.style.gridTemplateColumns = `repeat(${config.grid_x}, 40px)`;
    grid.style.gridTemplateRows = `repeat(${config.grid_y}, 40px)`;
    const gridState = parseLayoutToGrid(textarea.value, config.grid_y, config.grid_x, config.elements);
    let isMouseDown = false;
    for (let row = 0; row < config.grid_y; row++) {
        for (let col = 0; col < config.grid_x; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            const cellState = gridState[row][col];
            cell.style.background = cellState.color;
            cell.style.color = getBrightness(cellState.color) > 128 ? '#000' : '#fff';
            cell.textContent = cellState.code;
            cell.dataset.symbol = cellState.symbol;
            cell.addEventListener('mousedown', () => { isMouseDown = true; paintCell(cell, selectedElement); updateTextarea(); });
            cell.addEventListener('mouseenter', () => { if (isMouseDown) { paintCell(cell, selectedElement); updateTextarea(); } });
            grid.appendChild(cell);
        }
    }
    document.addEventListener('mouseup', () => { isMouseDown = false; });
    container.appendChild(grid);
    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear Grid';
    clearBtn.style.cssText = 'margin-top: 10px; padding: 8px 15px; background: #d9534f; color: white; border: none; border-radius: 5px; cursor: pointer;';
    clearBtn.addEventListener('click', () => {
        grid.querySelectorAll('.grid-cell').forEach(cell => {
            const emptyElem = config.elements.find(e => e.symbol === ' ') || config.elements[0];
            paintCell(cell, emptyElem);
        });
        updateTextarea();
    });
    container.appendChild(clearBtn);
    function paintCell(cell, element) {
        cell.style.background = element.color;
        cell.style.color = getBrightness(element.color) > 128 ? '#000' : '#fff';
        cell.textContent = element.code;
        cell.dataset.symbol = element.symbol;
    }
    function updateTextarea() {
        const rows = [];
        for (let row = 0; row < config.grid_y; row++) {
            let rowStr = '';
            for (let col = 0; col < config.grid_x; col++) {
                const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                rowStr += cell.dataset.symbol;
            }
            rows.push(rowStr);
        }
        textarea.value = rows.join('\n');
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    function syncGridFromTextarea() {
        const gridState = parseLayoutToGrid(textarea.value, config.grid_y, config.grid_x, config.elements);
        for (let row = 0; row < config.grid_y; row++) {
            for (let col = 0; col < config.grid_x; col++) {
                const cell = grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const cellState = gridState[row][col];
                paintCell(cell, cellState);
            }
        }
    }
}

function parseLayoutToGrid(layoutStr, rows, cols, elements) {
    const lines = layoutStr.split('\n');
    const grid = [];
    const emptyElem = elements.find(e => e.symbol === ' ') || elements[0];
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        const line = lines[row] || '';
        for (let col = 0; col < cols; col++) {
            const char = line[col] || ' ';
            const elem = elements.find(e => e.symbol === char) || emptyElem;
            grid[row][col] = elem;
        }
    }
    return grid;
}

function getBrightness(hexColor) {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

/*** Templates ****************************************/

function initTemplates() {
    if (!window.generatorTemplates || window.generatorTemplates.length === 0) {
        return; // No templates defined for this generator
    }
    
    // Find the form
    const form = document.querySelector('#arguments');
    if (!form) return;
    
    // Create template selector panel
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.style.cssText = 'margin-bottom: 20px;';
    panel.innerHTML = `
        <div class="panel-header">
            <h4>Template Selection</h4>
        </div>
        <div class="panel-body">
            <table role="presentation">
                <tr>
                    <td><label for="template-select">Load Template</label></td>
                    <td>
                        <select id="template-select" class="form-control">
                            <option value="">-- Select a template --</option>
                        </select>
                    </td>
                    <td id="template-description" style="font-style: italic; color: #666;"></td>
                </tr>
            </table>
        </div>
    `;
    
    // Insert panel at the top of the form (after material panel if it exists)
    const materialPanel = form.querySelector('.panel');
    if (materialPanel && materialPanel.nextSibling) {
        form.insertBefore(panel, materialPanel.nextSibling);
    } else {
        form.insertBefore(panel, form.firstChild);
    }
    
    // Populate template dropdown
    const select = document.getElementById('template-select');
    window.generatorTemplates.forEach((template, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = template.name;
        select.appendChild(option);
    });
    
    // Handle template selection
    select.addEventListener('change', (e) => {
        const templateIdx = e.target.value;
        const descEl = document.getElementById('template-description');
        
        if (templateIdx === '') {
            descEl.textContent = '';
            return;
        }
        
        const template = window.generatorTemplates[templateIdx];
        descEl.textContent = template.description || '';
        
        // Load template args into form
        loadTemplate(template);
    });
}

function loadTemplate(template) {
    if (!template || !template.args) return;
    
    // Apply each argument from the template
    for (const [key, value] of Object.entries(template.args)) {
        const input = document.getElementById(key);
        if (!input) continue;
        
        if (input.tagName === 'TEXTAREA') {
            input.value = value;
            // Trigger grid designer sync if it exists
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        } else if (input.type === 'checkbox') {
            input.checked = value;
        } else if (input.type === 'number' || input.type === 'text') {
            input.value = value;
        } else if (input.tagName === 'SELECT') {
            input.value = value;
        }
    }
    
    // Trigger preview refresh
    refreshPreview();
}
