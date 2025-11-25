import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from './ui/Icons';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            setError('');
            await login(email, password);
        } catch (err) {
            setError('Error al iniciar sesión. Verifica tus credenciales.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="modal-overlay modal-show">
            {/* Usamos la estructura de modal para que sea visualmente consistente y pequeño */}
            <div className="modal modal-info modal-login">
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icons.Lock className="icon" />
                        Iniciar Sesión
                    </h2>
                </div>

                <div className="modal-body-content">
                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="Correo Electrónico"
                            type="email"
                            id="login-email"
                            className="login-input"
                            placeholder="usuario@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Contraseña"
                            type="password"
                            id="login-password"
                            className="login-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="login-error" style={{ display: 'block' }}>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions login-actions">
                            <Button
                                type="submit"
                                variant="primary"
                                className="btn-login-submit"
                                disabled={loading}
                            >
                                {loading ? 'Verificando...' : 'Ingresar'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}