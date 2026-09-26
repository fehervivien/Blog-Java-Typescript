import { fetchPosts, createPost, updatePost, deletePost } from './api';
import { BlogPost, AuthUser } from './types';

const postsContainer = document.querySelector<HTMLDivElement>('#posts-container')!;
const postForm = document.querySelector<HTMLFormElement>('#post-form')!;
const formTitle = document.querySelector<HTMLHeadingElement>('#form-title')!;
const submitBtn = document.querySelector<HTMLButtonElement>('#submit-btn')!;
const cancelBtn = document.querySelector<HTMLButtonElement>('#cancel-btn')!;
const searchInput = document.querySelector<HTMLInputElement>('#search-input')!;
const navAuthContainer = document.querySelector<HTMLDivElement>('#nav-auth-container')!;

const titleInput = document.querySelector<HTMLInputElement>('#title')!;
const authorInput = document.querySelector<HTMLInputElement>('#author')!;
const contentInput = document.querySelector<HTMLTextAreaElement>('#content')!;

let editingPostId: number | null = null;
let allPosts: BlogPost[] = [];
let currentUser: AuthUser | null = JSON.parse(localStorage.getItem('devlog_user') || 'null');

function updateAuthUI(): void {
    if (currentUser) {
        navAuthContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-sm font-semibold text-slate-700">👤 ${currentUser.displayName}</span>
        <button id="logout-btn" class="border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold py-1.5 px-3 rounded-md text-sm transition-colors">Kijelentkezés</button>
      </div>
    `;
        document.querySelector('#logout-btn')!.addEventListener('click', () => {
            localStorage.removeItem('devlog_user');
            currentUser = null;
            updateAuthUI();
            filterAndRender();
        });

        authorInput.value = currentUser.displayName;
    } else {
        navAuthContainer.innerHTML = `
      <div class="flex gap-2">
        <a href="/login.html" class="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold py-1.5 px-3 rounded-md text-sm transition-colors decoration-transparent">Belépés</a>
        <a href="/register.html" class="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold py-1.5 px-3 rounded-md text-sm transition-colors decoration-transparent">Regisztráció</a>
      </div>
    `;
        authorInput.value = '';
    }
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function calculateReadingTime(text: string): string {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} perc olvasás`;
}

function resetForm(): void {
    editingPostId = null;
    postForm.reset();
    if (currentUser) {
        authorInput.value = currentUser.displayName;
    }
    formTitle.textContent = '✍️ Új cikk közzététele';
    submitBtn.textContent = 'Közzététel';
    cancelBtn.style.display = 'none';
}

function startEditing(post: BlogPost): void {
    editingPostId = post.id;
    titleInput.value = post.title;
    authorInput.value = post.author;
    contentInput.value = post.content;

    formTitle.textContent = `✏️ Bejegyzés szerkesztése (#${post.id})`;
    submitBtn.textContent = 'Módosítások mentése';
    cancelBtn.style.display = 'inline-block';

    postForm.scrollIntoView({ behavior: 'smooth' });
}

function render(posts: BlogPost[]): void {
    if (posts.length === 0) {
        const isSearching = searchInput.value.trim().length > 0;
        postsContainer.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 shadow-sm">
        <p>${isSearching ? 'Nincs a keresésnek megfelelő bejegyzés.' : 'Még nincsenek bejegyzések. Írd meg az elsőt fent!'}</p>
      </div>`;
        return;
    }

    postsContainer.innerHTML = '';
    posts.forEach((post) => {
        const initial = (post.author || 'N').charAt(0).toUpperCase();
        const readingTime = calculateReadingTime(post.content);
        const isAuthor = currentUser && (currentUser.displayName === post.author || currentUser.username === post.author);

        const article = document.createElement('article');
        // Itt vannak a cikk kártya Tailwind osztályai:
        article.className = 'bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6';
        article.innerHTML = `
      <h3 class="text-xl font-bold text-slate-900 mb-4 leading-tight">${post.title}</h3>
      
      <div class="flex items-center gap-3 mb-4">
        <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
          ${initial}
        </div>
        <div class="flex flex-col text-sm">
          <span class="font-semibold text-slate-900">${post.author}</span>
          <span class="text-slate-500">${formatDate(post.createdAt)} • ${readingTime}</span>
        </div>
      </div>

      <div class="text-slate-700 leading-relaxed whitespace-pre-wrap mb-2">${post.content}</div>

      ${
            isAuthor
                ? `
          <div class="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-4">
            <button class="btn-action edit border border-slate-200 text-slate-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors" data-id="${post.id}">Szerkesztés</button>
            <button class="btn-action delete border border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors" data-id="${post.id}">Törlés</button>
          </div>
          `
                : ''
        }
    `;

        if (isAuthor) {
            article.querySelector<HTMLButtonElement>('.btn-action.edit')!.addEventListener('click', () => {
                startEditing(post);
            });

            article.querySelector<HTMLButtonElement>('.btn-action.delete')!.addEventListener('click', async () => {
                if (confirm('Biztosan törölni szeretnéd ezt a saját bejegyzésedet?')) {
                    try {
                        if (editingPostId === post.id) resetForm();
                        await deletePost(post.id); // Itt ne felejtsd el, hogy a felhasználó átadását már kivettük a JWT miatt!
                        await loadAllPosts();
                    } catch (err: any) {
                        alert(err.message);
                    }
                }
            });
        }

        postsContainer.appendChild(article);
    });
}

function filterAndRender(): void {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        render(allPosts);
        return;
    }

    const filtered = allPosts.filter(
        (p) =>
            p.title.toLowerCase().includes(query) ||
            p.author.toLowerCase().includes(query) ||
            p.content.toLowerCase().includes(query)
    );

    render(filtered);
}

searchInput.addEventListener('input', () => {
    filterAndRender();
});

async function loadAllPosts(): Promise<void> {
    try {
        allPosts = await fetchPosts();
        filterAndRender();
    } catch (err) {
        postsContainer.innerHTML = `
      <div class="bg-white border border-red-200 rounded-xl p-10 text-center text-red-500 shadow-sm font-semibold">
        Nem sikerült elérni a szervert. Ellenőrizd, hogy fut-e a Spring Boot backend!
      </div>`;
        console.error(err);
    }
}

postForm.addEventListener('submit', async (e: SubmitEvent) => {
    e.preventDefault();

    if (!currentUser) {
        alert('A bejegyzés közzétételéhez kérlek jelentkezz be!');
        window.location.href = '/login.html';
        return;
    }

    const title = titleInput.value.trim();
    const author = currentUser.displayName;
    const content = contentInput.value.trim();

    if (!title || !content) return;

    try {
        if (editingPostId !== null) {
            await updatePost(editingPostId, { title, author, content });
        } else {
            await createPost({ title, author, content });
        }

        resetForm();
        await loadAllPosts();
    } catch (err: any) {
        alert(err.message || 'Hiba történt a mentés során!');
        console.error(err);
    }
});

cancelBtn.addEventListener('click', () => {
    resetForm();
});

updateAuthUI();
loadAllPosts();