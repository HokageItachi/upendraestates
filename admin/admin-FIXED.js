/* ==========================================================
   VINODHA ESTATES — ADMIN PANEL LOGIC
   ========================================================== */

// ⚙️ API base — same-origin works for both local and production
// Since the frontend is served by the same Express server, we use a relative URL.
const API_BASE = '/api';

const token = () => localStorage.getItem('vin_token');
const setToken = (t) => localStorage.setItem('vin_token', t);
const clearAuth = () => { localStorage.removeItem('vin_token'); localStorage.removeItem('vin_admin'); };

function toast(msg, type = 'success') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast show ${type}`;
    setTimeout(() => t.classList.remove('show'), 2800);
}

// ==========================================================
// LOGIN PAGE
// ==========================================================
function initLogin() {
    // If already logged in, skip
    if (token()) {
        fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.ok && (window.location.href = 'dashboard.html'));
    }

    const form = document.getElementById('loginForm');
    const err = document.getElementById('err');
    const btn = document.getElementById('loginBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        err.textContent = '';
        btn.disabled = true; btn.textContent = 'Signing in...';
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login failed');
            setToken(data.token);
            localStorage.setItem('vin_admin', JSON.stringify(data.admin));
            window.location.href = 'dashboard.html';
        } catch (ex) {
            err.textContent = ex.message;
            btn.disabled = false; btn.textContent = 'Sign In';
        }
    });
}

// ==========================================================
// DASHBOARD PAGE
// ==========================================================
let allProps = [];

function initDashboard() {
    if (!token()) { window.location.href = 'login.html'; return; }

    const admin = JSON.parse(localStorage.getItem('vin_admin') || '{}');
    document.getElementById('adminEmail').textContent = admin.email || '';

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearAuth(); window.location.href = 'login.html';
    });

    document.getElementById('openAddModal').addEventListener('click', () => openForm());
    document.getElementById('closeForm').addEventListener('click', closeForm);
    document.getElementById('cancelForm').addEventListener('click', closeForm);
    document.getElementById('formModal').addEventListener('click', (e) => {
        if (e.target.id === 'formModal') closeForm();
    });

    document.getElementById('propForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('search').addEventListener('input', (e) => renderTable(e.target.value));

    loadProperties();
}

async function loadProperties() {
    try {
        const res = await fetch(`${API_BASE}/properties`);
        allProps = await res.json();
        renderTable();
        renderStats();
    } catch {
        toast('Failed to load properties', 'error');
    }
}

function renderStats() {
    document.getElementById('statTotal').textContent = allProps.length;
    document.getElementById('statFeatured').textContent = allProps.filter(p => p.featured).length;
    document.getElementById('statCities').textContent = new Set(allProps.map(p => p.city)).size;
}

function renderTable(filter = '') {
    const tbody = document.getElementById('propTableBody');
    const f = filter.toLowerCase().trim();
    const list = f
        ? allProps.filter(p => [p.title, p.city, p.location, p.propertyType].some(v => (v||'').toLowerCase().includes(f)))
        : allProps;

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty">No properties yet. Click "+ Add Property" to create one.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(p => `
        <tr>
            <td><img src="${p.image || ''}" alt="" class="thumb" onerror="this.style.opacity=.2"></td>
            <td>
                <strong>${escapeHtml(p.title)}</strong>
                ${p.featured ? '<span class="badge">FEATURED</span>' : ''}
            </td>
            <td>${escapeHtml(p.propertyType || '-')}</td>
            <td>${escapeHtml(p.city || '-')}</td>
            <td>${escapeHtml(p.location || '-')}</td>
            <td>${escapeHtml(p.price || '-')}</td>
            <td>${escapeHtml(p.area || '-')}</td>
            <td>
                <div class="row-actions">
                    <button class="btn-icon" title="Edit" onclick="editProperty('${p._id}')">✎</button>
                    <button class="btn-icon del" title="Delete" onclick="deleteProperty('${p._id}')">🗑</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ---------- Form (Add / Edit) ----------
function openForm(prop = null) {
    const form = document.getElementById('propForm');
    form.reset();
    document.getElementById('formErr').textContent = '';
    document.getElementById('existingGallery').hidden = true;

    if (prop) {
        document.getElementById('formTitle').textContent = 'Edit Property';
        document.getElementById('editId').value = prop._id;
        form.title.value        = prop.title || '';
        form.propertyType.value = prop.propertyType || '';
        form.price.value        = prop.price || '';
        form.area.value         = prop.area || '';
        form.city.value         = prop.city || '';
        form.location.value     = prop.location || '';
        form.beds.value         = prop.beds || 0;
        form.baths.value        = prop.baths || 0;
        form.style.value        = prop.style || '';
        form.year.value         = prop.year || '';
        form.description.value  = prop.description || '';
        form.featured.checked   = !!prop.featured;
        renderExistingGallery(prop);
    } else {
        document.getElementById('formTitle').textContent = 'Add Property';
        document.getElementById('editId').value = '';
    }
    document.getElementById('formModal').classList.add('active');
}

function closeForm() {
    document.getElementById('formModal').classList.remove('active');
}

function renderExistingGallery(prop) {
    const wrap = document.getElementById('existingGallery');
    const grid = document.getElementById('existingGalleryGrid');
    if (!prop.gallery || !prop.gallery.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    window._editingGallery = [...prop.gallery];
    grid.innerHTML = window._editingGallery.map((url, i) => `
        <div class="eg-item">
            <img src="${url}" alt="">
            <button type="button" onclick="removeGalleryItem(${i})" title="Remove">×</button>
        </div>
    `).join('');
}

window.removeGalleryItem = function (i) {
    window._editingGallery.splice(i, 1);
    const grid = document.getElementById('existingGalleryGrid');
    grid.innerHTML = window._editingGallery.map((url, idx) => `
        <div class="eg-item">
            <img src="${url}" alt="">
            <button type="button" onclick="removeGalleryItem(${idx})" title="Remove">×</button>
        </div>
    `).join('');
};

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const editId = document.getElementById('editId').value;
    const btn = document.getElementById('submitBtn');
    const err = document.getElementById('formErr');
    err.textContent = '';

    const fd = new FormData();
    ['title','propertyType','price','area','city','location','beds','baths','style','year','description']
        .forEach(k => fd.append(k, form[k].value));
    fd.append('featured', form.featured.checked ? 'true' : 'false');

    if (form.image.files[0]) fd.append('image', form.image.files[0]);
    for (const f of form.gallery.files) fd.append('gallery', f);

    // If editing and user removed some gallery items, send remaining list
    if (editId && window._editingGallery) {
        fd.append('galleryUrls', JSON.stringify(window._editingGallery));
    }

    btn.disabled = true; btn.textContent = 'Saving...';
    try {
        const url = editId ? `${API_BASE}/properties/${editId}` : `${API_BASE}/properties`;
        const method = editId ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { Authorization: `Bearer ${token()}` },
            body: fd
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Save failed');
        toast(editId ? 'Property updated' : 'Property added', 'success');
        closeForm();
        loadProperties();
    } catch (ex) {
        err.textContent = ex.message;
    } finally {
        btn.disabled = false; btn.textContent = 'Save Property';
    }
}

window.editProperty = function (id) {
    const prop = allProps.find(p => p._id === id);
    if (prop) openForm(prop);
};

window.deleteProperty = async function (id) {
    const prop = allProps.find(p => p._id === id);
    if (!prop) return;
    if (!confirm(`Delete "${prop.title}"? This cannot be undone.`)) return;
    try {
        const res = await fetch(`${API_BASE}/properties/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token()}` }
        });
        if (!res.ok) throw new Error('Delete failed');
        toast('Property deleted', 'success');
        loadProperties();
    } catch (ex) {
        toast(ex.message, 'error');
    }
};
