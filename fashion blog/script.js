// ===============================
//  FASHION VIBE — Blog Script
// ===============================

// ---- SAMPLE DATA ----
const samplePosts = [
    {
        title: "Top 10 Summer Dresses 2024",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600",
        description: "Flowy summer dresses perfect for beach days and casual outings. Lightweight fabrics and vibrant colors make them a must-have this season.",
        links: "[amazon]https://amzn.to/sample-amazon-link[/amazon]\n[etsy]https://etsy.me/sample-etsy-link[/etsy]"
    },
    {
        title: "Best Sneakers for Spring",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        description: "Comfortable and stylish sneakers that match every outfit. From classic white to bold colors — find your perfect pair this spring.",
        links: "[amazon]https://amzn.to/sample-sneaker-link[/amazon]\n[ebay]https://ebay.us/sample-ebay-link[/ebay]"
    },
    {
        title: "Trendy Handbags Under $50",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        description: "Designer-inspired handbags that won't break the bank. Perfect for everyday use or special occasions — curated with care.",
        links: "[amazon]https://amzn.to/sample-bag-link[/amazon]\n[etsy]https://etsy.me/sample-bag-etsy[/etsy]"
    }
];

// ---- STATE ----
let posts = [];
let editingIndex = -1;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    renderPosts();
    setupNavScroll();
    setupEventListeners();
});

// ---- STORAGE ----
function loadPosts() {
    const stored = localStorage.getItem('fashionPosts');
    posts = stored ? JSON.parse(stored) : [...samplePosts];
}

function savePosts() {
    localStorage.setItem('fashionPosts', JSON.stringify(posts));
}

// ---- NAVBAR SCROLL ----
function setupNavScroll() {
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
    });
}

// ---- EVENT LISTENERS ----
function setupEventListeners() {
    // Hamburger
    document.getElementById('hamburger').addEventListener('click', () => {
        document.getElementById('navMenu').classList.toggle('active');
        document.getElementById('hamburger').classList.toggle('active');
    });

    // Close menu on nav link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Open Add Modal
    document.getElementById('openAddModal').addEventListener('click', (e) => {
        e.preventDefault();
        openModal('addPostModal');
    });

    // Close modal via overlay or × button
    document.querySelectorAll('[data-close]').forEach(el => {
        el.addEventListener('click', (e) => {
            // Overlay clicks: only close if clicking the overlay itself
            if (el.classList.contains('modal-overlay') && e.target !== el) return;
            closeAllModals();
        });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Form submits
    document.getElementById('postForm').addEventListener('submit', handleAddPost);
    document.getElementById('editForm').addEventListener('submit', handleEditPost);

    // Keyboard close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });
}

// ---- MOBILE MENU ----
function closeMobileMenu() {
    document.getElementById('navMenu').classList.remove('active');
    document.getElementById('hamburger').classList.remove('active');
}

// ---- MODALS ----
function openModal(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
    document.getElementById('postForm').reset();
    editingIndex = -1;
}

// ---- RENDER POSTS ----
function renderPosts() {
    const grid = document.getElementById('postsGrid');
    const empty = document.getElementById('emptyState');
    grid.innerHTML = '';

    if (posts.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    posts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.style.animationDelay = `${index * 0.08}s`;

        const fallback = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600';

        card.innerHTML = `
            <div class="post-image-wrap">
                <img
                    src="${escapeHtml(post.image || fallback)}"
                    alt="${escapeHtml(post.title)}"
                    class="post-image"
                    onerror="this.src='${fallback}'"
                    loading="lazy"
                >
                <div class="post-image-overlay"></div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <p class="post-description">${escapeHtml(post.description)}</p>
                <div class="post-links">${parseLinks(post.links)}</div>
                <div class="post-actions">
                    <button class="btn-action edit" onclick="openEditModal(${index})">
                        <i class="fas fa-pen"></i> Edit
                    </button>
                    <button class="btn-action delete" onclick="deletePost(${index})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ---- PARSE AFFILIATE LINKS ----
// Supports [amazon]...[/amazon], [ebay]...[/ebay], [etsy]...[/etsy]
function parseLinks(linksText) {
    if (!linksText) return '';

    return linksText
        .replace(/\[amazon\](.*?)\[\/amazon\]/gi,
            '<a href="$1" class="aff-link amazon" target="_blank" rel="noopener sponsored"><i class="fab fa-amazon"></i> Amazon</a>')
        .replace(/\[ebay\](.*?)\[\/ebay\]/gi,
            '<a href="$1" class="aff-link ebay" target="_blank" rel="noopener sponsored"><i class="fab fa-ebay"></i> eBay</a>')
        .replace(/\[etsy\](.*?)\[\/etsy\]/gi,
            '<a href="$1" class="aff-link etsy" target="_blank" rel="noopener sponsored"><i class="fab fa-etsy"></i> Etsy</a>')
        .replace(/\n/g, '');
}

// ---- ESCAPE HTML (XSS protection) ----
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ---- ADD POST ----
function handleAddPost(e) {
    e.preventDefault();

    const title = document.getElementById('postTitle').value.trim();
    const image = document.getElementById('postImage').value.trim();
    const description = document.getElementById('postDescription').value.trim();
    const links = document.getElementById('postLinks').value.trim();

    if (!title || !description || !links) {
        showToast('Please fill in all required fields.');
        return;
    }

    posts.unshift({ title, image, description, links });
    savePosts();
    renderPosts();
    closeAllModals();
    showToast('✦ Post published successfully!');
}

// ---- OPEN EDIT MODAL ----
function openEditModal(index) {
    const post = posts[index];
    if (!post) return;

    editingIndex = index;
    document.getElementById('editTitle').value = post.title;
    document.getElementById('editImage').value = post.image || '';
    document.getElementById('editDescription').value = post.description;
    document.getElementById('editLinks').value = post.links;
    document.getElementById('editIndex').value = index;

    openModal('editPostModal');
}

// ---- SAVE EDIT ----
function handleEditPost(e) {
    e.preventDefault();

    const index = parseInt(document.getElementById('editIndex').value);
    if (index < 0 || index >= posts.length) return;

    posts[index] = {
        title: document.getElementById('editTitle').value.trim(),
        image: document.getElementById('editImage').value.trim(),
        description: document.getElementById('editDescription').value.trim(),
        links: document.getElementById('editLinks').value.trim()
    };

    savePosts();
    renderPosts();
    closeAllModals();
    showToast('✦ Post updated.');
}

// ---- DELETE POST ----
function deletePost(index) {
    if (!confirm('Delete this post?')) return;
    posts.splice(index, 1);
    savePosts();
    renderPosts();
    showToast('Post deleted.');
}

// ---- TOAST ----
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}
