// ==================== داده‌ها ====================
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';
let currentYear, currentMonth;
let editingTaskId = null;

// المنت‌ها
const taskList = document.getElementById('taskList');
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const saveEditBtn = document.getElementById('saveEditBtn');
const modalClose = document.querySelector('.modal-close');

// ==================== توابع اصلی ====================
function loadTasks() {
    const stored = localStorage.getItem('taskflow_pro');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        tasks = [
            { id: 1, text: 'تکمیل مستندات پروژه کارشناسی', completed: false, date: '2026-05-28' },
            { id: 2, text: 'تمرین ارائه دفاع', completed: false, date: '2026-05-29' },
            { id: 3, text: 'بررسی منابع اضافی', completed: true, date: '2026-05-25' },
            { id: 4, text: 'ارسال ایمیل به استاد راهنما', completed: false, date: '2026-05-30' }
        ];
    }
    renderAll();
}

function saveTasks() {
    localStorage.setItem('taskflow_pro', JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;
    
    document.getElementById('totalTasks').innerText = total;
    document.getElementById('pendingTasks').innerText = pending;
    document.getElementById('doneTasks').innerText = done;
    document.getElementById('sidePending').innerText = pending;
    document.getElementById('sideDone').innerText = done;
    document.getElementById('tasksCount').innerText = ${pending} کار باقی مانده;
    
    // پیام انگیزشی
    let msg = '';
    if (total === 0) msg = '🌟 اولین کارت رو اضافه کن! امروز روز خوبیه 🌟';
    else if (done === total && total > 0) msg = '🎉 تبریک! امروز رو کامل انجام دادی! 🎉';
    else if (done >= total / 2) msg = '💪 عالی پیش میری، نصف راه رو رفتی! 💪';
    else if (done > 0) msg = '✨ آفرین! هر تیک یه قدم به موفقیت نزدیکترت می‌کنه ✨';
    else msg = '⭐ امروز روز جدیدیه! شروع کن به انجام کارهات ⭐';
    
    document.getElementById('motivationMsg').innerHTML = <i class="fas fa-sparkle"></i><span>${msg}</span>;
}

function renderTasks() {
    let filtered = tasks.filter(t => {
        if (currentFilter === 'completed') return t.completed;
        if (currentFilter === 'pending') return !t.completed;
        return true;
    });
    
    if (searchQuery) {
        filtered = filtered.filter(t => t.text.includes(searchQuery));
    }
    
    taskList.innerHTML = '';
    
    if (filtered.length === 0) {
        taskList.innerHTML = <li class="empty-state"><i class="fas fa-smile-wink"></i><p>کاری یافت نشد</p></li>;
        return;
    }
    
    filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = task-item ${task.completed ? 'completed' : ''};
        li.dataset.id = task.id;
        
        li.innerHTML = `
            <div class="task-left">
                <div class="check-circle ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <div class="task-actions">
                <button class="edit-task" data-id="${task.id}"><i class="fas fa-pen"></i></button>
                <button class="delete-task" data-id="${task.id}"><i class="fas fa-trash"></i></button>
				</div>
        ;
        
        taskList.appendChild(li);
    });
    
    // attach events
    document.querySelectorAll('.check-circle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleTask(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.edit-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(parseInt(btn.dataset.id));
        });
    });
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderAll();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
}

function addTask() {
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.style.borderColor = '#ef4444';
        setTimeout(() => taskInput.style.borderColor = '#e2e8f0', 500);
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        date: new Date().toISOString().split('T')[0]
    };
    tasks.push(newTask);
    saveTasks();
    renderAll();
    taskInput.value = '';
    taskInput.focus();
}

function openEditModal(id) {
    editingTaskId = id;
    const task = tasks.find(t => t.id === id);
    editInput.value = task.text;
    editModal.style.display = 'flex';
}

function saveEdit() {
    if (editingTaskId) {
        const task = tasks.find(t => t.id === editingTaskId);
        if (task && editInput.value.trim()) {
            task.text = editInput.value.trim();
            saveTasks();
            renderAll();
        }
        editModal.style.display = 'none';
        editingTaskId = null;
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== تقویم ====================
function renderCalendar() {
    const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    document.getElementById('monthYear').innerText = ${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDay = firstDay.getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    const calendarDiv = document.getElementById('calendarDays');
    calendarDiv.innerHTML = '';
    
    for (let i = 0; i < startDay; i++) {
        calendarDiv.innerHTML += '<div></div>';
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;
        
        const today = new Date();
        if (today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === i) {
            dayDiv.classList.add('today');
        }
        
        const hasTask = tasks.some(t => {
            if (!t.date) return false;
            const taskDate = new Date(t.date);
            return taskDate.getFullYear() === currentYear && taskDate.getMonth() === currentMonth && taskDate.getDate() === i;
        });
        
        if (hasTask) dayDiv.classList.add('has-task');
        calendarDiv.appendChild(dayDiv);
    }
}

function changeMonth(delta) {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    if (newMonth > 11) { newMonth = 0; newYear++; }
    currentMonth = newMonth;
    currentYear = newYear;
    renderCalendar();
}
// ==================== تاریخ و زمان ====================
function setPersianDate() {
    const now = new Date();
    document.getElementById('weekday').innerText = now.toLocaleDateString('fa-IR', { weekday: 'long' });
    document.getElementById('persianDate').innerText = now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const hour = now.getHours();
    let greeting = '';
    if (hour < 12) greeting = 'صبح بخیر، روز پرانرژی 🌤️';
    else if (hour < 18) greeting = 'ظهر بخیر، ادامه بده ☀️';
    else greeting = 'شب بخیر، فردا رو قوی شروع کن 🌙';
    document.getElementById('greetingText').innerHTML = ${greeting} ✨;
}

// ==================== رندر کلی ====================
function renderAll() {
    updateStats();
    renderTasks();
    renderCalendar();
    setPersianDate();
}

// ==================== Event Listeners ====================
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTask(); });
searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderTasks(); });
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});
document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
saveEditBtn.addEventListener('click', saveEdit);
modalClose.addEventListener('click', () => editModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === editModal) editModal.style.display = 'none'; });

// ==================== اجرای اولیه ====================
const today = new Date();
currentYear = today.getFullYear();
currentMonth = today.getMonth();
loadTasks();