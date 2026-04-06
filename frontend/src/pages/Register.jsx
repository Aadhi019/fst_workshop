import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DEPARTMENTS = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'CSD'];

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '', email: '', password: '',
        year: '', department: '', age: '',
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const err = {};
        if (!form.username.trim()) err.username = 'Username is required';
        else if (form.username.length < 3) err.username = 'Minimum 3 characters';
        if (!form.email.trim()) err.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Invalid email';
        if (!form.password) err.password = 'Password is required';
        else if (form.password.length < 6) err.password = 'Minimum 6 characters';
        else if (!/\d/.test(form.password)) err.password = 'Must contain a number';
        if (!form.year) err.year = 'Year is required';
        if (!form.department) err.department = 'Department is required';
        if (!form.age) err.age = 'Age is required';
        else if (Number(form.age) < 16 || Number(form.age) > 100) err.age = 'Age must be 16–100';
        return err;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' });
        setApiError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) { setErrors(validationErrors); return; }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', {
                ...form, year: Number(form.year), age: Number(form.age),
            });
            login(data.data.token, data.data.user);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center page-center--register page-bg--register">
            <div className="blob blob--top-left" />
            <div className="blob blob--bottom-right" />

            <div className="glass auth-card auth-card--md p-8 animate-fade-in">

                {/* Header */}
                <div className="auth-header mb-8">
                    <div className="brand-icon brand-icon--md mb-4">✅</div>
                    <h1 className="font-bold gradient-text" style={{ fontSize: '1.875rem' }}>Create Account</h1>
                    <p className="auth-header__sub">Join the Todo platform today</p>
                </div>

                {apiError && (
                    <div className="alert alert--error">⚠️ {apiError}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Row 1: Username + Email */}
                    <div className="grid-2">
                        <div>
                            <label className="form-label">Username</label>
                            <input name="username" value={form.username} onChange={handleChange}
                                className="input-field" placeholder="john_doe" />
                            {errors.username && <p className="error-text">{errors.username}</p>}
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                className="input-field" placeholder="john@example.com" />
                            {errors.email && <p className="error-text">{errors.email}</p>}
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="form-label">Password</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                            className="input-field" placeholder="Min 6 chars, 1 number" />
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>

                    {/* Row 2: Year + Dept + Age */}
                    <div className="grid-3">
                        <div>
                            <label className="form-label">Year</label>
                            <select name="year" value={form.year} onChange={handleChange} className="input-field">
                                <option value="">—</option>
                                {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>{y}st/nd</option>)}
                            </select>
                            {errors.year && <p className="error-text">{errors.year}</p>}
                        </div>
                        <div>
                            <label className="form-label">Dept</label>
                            <select name="department" value={form.department} onChange={handleChange} className="input-field">
                                <option value="">—</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors.department && <p className="error-text">{errors.department}</p>}
                        </div>
                        <div>
                            <label className="form-label">Age</label>
                            <input name="age" type="number" value={form.age} onChange={handleChange}
                                className="input-field" placeholder="20" min="16" max="100" />
                            {errors.age && <p className="error-text">{errors.age}</p>}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary mt-2" disabled={loading}>
                        {loading ? (
                            <span className="spinner">
                                <span className="spinner__ring" />
                                Creating account...
                            </span>
                        ) : 'Create Account →'}
                    </button>
                </form>

                <p className="text-center text-muted text-sm mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
