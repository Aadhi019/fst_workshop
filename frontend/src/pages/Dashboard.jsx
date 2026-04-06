import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ── Helpers ────────────────────────────────────
const genId = () => crypto.randomUUID();
const PRIORITIES = {
    high: { label: 'High', color: '#ef4444' },
    medium: { label: 'Medium', color: '#f59e0b' },
    low: { label: 'Low', color: '#22c55e' },
};

const Dashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();

    // ── Todo State ──────────────────────────────
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');
    const [priority, setPriority] = useState('medium');
    const [filter, setFilter] = useState('all');

    // ── Profile Edit State ──────────────────────
    const [editMode, setEditMode] = useState(false);
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        department: user?.department || '',
        year: user?.year || '',
        age: user?.age || '',
    });
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // ── Active tab ──────────────────────────────
    const [activeTab, setActiveTab] = useState('todos'); // 'todos' | 'profile'

    // ── Todo Actions ────────────────────────────
    const addTodo = () => {
        if (!input.trim()) return;
        setTodos([{ id: genId(), text: input.trim(), completed: false, priority, createdAt: new Date() }, ...todos]);
        setInput('');
    };
    const toggleTodo = (id) => setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    const deleteTodo = (id) => setTodos(todos.filter(t => t.id !== id));

    const filteredTodos = todos.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    // ── Profile Update ──────────────────────────
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');
        setProfileLoading(true);
        try {
            await api.patch('/user/updateuser', {
                username: profileForm.username,
                department: profileForm.department,
                year: Number(profileForm.year),
                age: Number(profileForm.age),
            });
            await refreshUser();
            setProfileSuccess('Profile updated successfully! ✅');
            setEditMode(false);
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

    const stats = {
        total: todos.length,
        completed: todos.filter(t => t.completed).length,
        active: todos.filter(t => !t.completed).length,
    };

    return (
        <div className="page-bg--dash" style={{ minHeight: '100vh' }}>

            {/* Navbar */}
            <nav className="navbar">
                <div className="navbar__brand">
                    <div className="brand-icon brand-icon--sm">✅</div>
                    <span className="font-bold gradient-text" style={{ fontSize: '1.125rem' }}>TodoApp</span>
                </div>
                <div className="navbar__actions">
                    <div className="navbar__user">
                        <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
                        <span className="text-sm text-muted font-semibold">{user?.username}</span>
                    </div>
                    <button onClick={handleLogout} className="btn-outline">Logout</button>
                </div>
            </nav>

            <div className="max-w-6xl p-4" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>

                {/* Welcome banner */}
                <div className="glass glass--banner p-6 mb-6 animate-fade-in">
                    <h2 className="font-bold" style={{ fontSize: '1.5rem' }}>
                        Good day, <span className="gradient-text">{user?.username}!</span> 👋
                    </h2>
                    <p className="text-muted text-sm mt-1">
                        {user?.department} · Year {user?.year} · Age {user?.age}
                    </p>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { label: 'Total Tasks', value: stats.total, color: '#818cf8', icon: '📋' },
                        { label: 'Active', value: stats.active, color: '#f59e0b', icon: '⚡' },
                        { label: 'Completed', value: stats.completed, color: '#22c55e', icon: '✅' },
                    ].map(s => (
                        <div key={s.label} className="glass stat-card animate-fade-in">
                            <div className="stat-card__icon">{s.icon}</div>
                            <div className="stat-card__value" style={{ color: s.color }}>{s.value}</div>
                            <div className="stat-card__label">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Tabs */}
                <div className="tab-bar">
                    {['todos', 'profile'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`tab-btn${activeTab === tab ? ' tab-btn--active' : ''}`}>
                            {tab === 'todos' ? '📋 Todos' : '👤 Profile'}
                        </button>
                    ))}
                </div>

                {/* ── TODOS TAB ── */}
                {activeTab === 'todos' && (
                    <div className="animate-fade-in">

                        {/* Add Todo */}
                        <div className="glass add-todo mb-4">
                            <input value={input} onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addTodo()}
                                className="input-field" placeholder="Add a new task… (Press Enter)" />
                            <select value={priority} onChange={e => setPriority(e.target.value)}
                                className="input-field input-field--auto">
                                {Object.entries(PRIORITIES).map(([k, v]) =>
                                    <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <button onClick={addTodo} className="btn-primary btn-primary--auto">+ Add</button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="tab-bar mb-4">
                            {['all', 'active', 'completed'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`filter-btn${filter === f ? ' filter-btn--active' : ''}`}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Todo List */}
                        <div className="space-y-2">
                            {filteredTodos.length === 0 ? (
                                <div className="glass todo-empty">
                                    <div className="todo-empty__icon">📝</div>
                                    <p className="font-semibold">No tasks here yet</p>
                                    <p className="text-sm mt-1">Add a task above to get started</p>
                                </div>
                            ) : filteredTodos.map((todo, i) => (
                                <div key={todo.id} className="glass todo-item animate-slide-in"
                                    style={{ animationDelay: `${i * 0.05}s` }}>

                                    {/* Checkbox */}
                                    <button onClick={() => toggleTodo(todo.id)}
                                        className={`todo-checkbox${todo.completed ? ' todo-checkbox--done' : ''}`}>
                                        {todo.completed && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                                    </button>

                                    {/* Text */}
                                    <span className={`todo-text${todo.completed ? ' todo-text--done' : ''}`}>
                                        {todo.text}
                                    </span>

                                    {/* Priority badge */}
                                    <span className="badge" style={{
                                        background: `${PRIORITIES[todo.priority].color}22`,
                                        color: PRIORITIES[todo.priority].color,
                                    }}>
                                        {PRIORITIES[todo.priority].label}
                                    </span>

                                    {/* Delete */}
                                    <button onClick={() => deleteTodo(todo.id)} className="todo-delete">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                    <div className="glass p-6 animate-fade-in max-w-lg">

                        <div className="profile-header">
                            <h3 className="font-bold" style={{ fontSize: '1.125rem' }}>Your Profile</h3>
                            <button onClick={() => { setEditMode(!editMode); setProfileError(''); setProfileSuccess(''); }}
                                className="btn-outline btn-outline--indigo">
                                {editMode ? 'Cancel' : '✏️ Edit'}
                            </button>
                        </div>

                        {profileSuccess && <div className="alert alert--success">{profileSuccess}</div>}
                        {profileError && <div className="alert alert--error">⚠️ {profileError}</div>}

                        {!editMode ? (
                            <div className="space-y-4">
                                {[
                                    { label: 'User ID', value: user?.id },
                                    { label: 'Username', value: user?.username },
                                    { label: 'Email', value: user?.email },
                                    { label: 'Year', value: `Year ${user?.year}` },
                                    { label: 'Department', value: user?.department },
                                    { label: 'Age', value: `${user?.age} years` },
                                    { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—' },
                                ].map(field => (
                                    <div key={field.label} className="profile-field">
                                        <span className="profile-field__label">{field.label}</span>
                                        <span className="profile-field__value">{field.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="form-label">Username</label>
                                    <input value={profileForm.username}
                                        onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div className="grid-3">
                                    <div>
                                        <label className="form-label">Year</label>
                                        <select value={profileForm.year}
                                            onChange={e => setProfileForm({ ...profileForm, year: e.target.value })}
                                            className="input-field">
                                            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Dept</label>
                                        <input value={profileForm.department}
                                            onChange={e => setProfileForm({ ...profileForm, department: e.target.value })}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="form-label">Age</label>
                                        <input type="number" value={profileForm.age}
                                            onChange={e => setProfileForm({ ...profileForm, age: e.target.value })}
                                            className="input-field" />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={profileLoading}>
                                    {profileLoading ? (
                                        <span className="spinner">
                                            <span className="spinner__ring" />
                                            Saving...
                                        </span>
                                    ) : 'Save Changes'}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
