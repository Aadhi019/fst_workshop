import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const err = {};
        if (!form.email.trim()) err.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = 'Invalid email';
        if (!form.password) err.password = 'Password is required';
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
            const { data } = await api.post('/auth/login', form);
            login(data.data.token, data.data.user);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-center page-bg--login">
            <div className="blob blob--top-right" />
            <div className="blob blob--bottom-left" />

            <div className="glass auth-card auth-card--sm p-8 animate-fade-in">

                {/* Logo */}
                <div className="auth-header mb-8">
                    <div className="brand-icon brand-icon--lg mb-4">✅</div>
                    <h1 className="font-bold gradient-text" style={{ fontSize: '1.875rem' }}>Welcome Back</h1>
                    <p className="auth-header__sub">Sign in to your Todo account</p>
                </div>

                {apiError && (
                    <div className="alert alert--error">⚠️ {apiError}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="form-label">Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                            className="input-field" placeholder="you@example.com" autoComplete="email" />
                        {errors.email && <p className="error-text">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="form-label">Password</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange}
                            className="input-field" placeholder="Your password" autoComplete="current-password" />
                        {errors.password && <p className="error-text">{errors.password}</p>}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <span className="spinner">
                                <span className="spinner__ring" />
                                Signing in...
                            </span>
                        ) : 'Sign in →'}
                    </button>
                </form>

                <p className="text-center text-muted text-sm mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="link">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
