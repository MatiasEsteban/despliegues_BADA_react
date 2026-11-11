import React, { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useModal } from '../../context/ModalContext';
import { Icons } from '../ui/Icons';

export default function WorkspaceSwitcher() {
    const {
        workspaces,
        activeWorkspaceId,
        isDropdownOpen,
        toggleDropdown,
        closeDropdown,
        setActiveWorkspace,
        createWorkspace,
        deleteWorkspace,
    } = useWorkspaceStore();

    const { confirm } = useModal();
    const [newName, setNewName] = useState('');
    const [showInput, setShowInput] = useState(false);
    const [creating, setCreating] = useState(false);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

    // Cerrar al hacer click fuera
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                closeDropdown();
                setShowInput(false);
                setNewName('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen, closeDropdown]);

    // Foco automático en el input de nuevo workspace
    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showInput]);

    const handleCreate = async () => {
        const name = newName.trim();
        if (!name) return;
        setCreating(true);
        try {
            await createWorkspace(name);
            setNewName('');
            setShowInput(false);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (e, ws) => {
        e.stopPropagation();
        const ok = await confirm(
            `¿Eliminar el workspace "${ws.name}"? Esta acción no se puede deshacer y perderás todos sus datos.`,
            'Eliminar workspace',
            'error'
        );
        if (ok) {
            await deleteWorkspace(ws.id);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleCreate();
        if (e.key === 'Escape') { setShowInput(false); setNewName(''); }
    };

    return (
        <div className="ws-switcher" ref={dropdownRef}>
            {/* TRIGGER */}
            <button
                className="ws-trigger"
                onClick={toggleDropdown}
                title="Cambiar workspace"
            >
                <span className="ws-trigger-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" aria-hidden="true" focusable="false">
                        <rect x="2" y="3" width="9" height="9" rx="1.5"/>
                        <rect x="13" y="3" width="9" height="9" rx="1.5"/>
                        <rect x="2" y="14" width="9" height="9" rx="1.5"/>
                        <rect x="13" y="14" width="9" height="9" rx="1.5"/>
                    </svg>
                </span>
                <span className="ws-trigger-name">{activeWorkspace?.name || 'Workspace'}</span>
                <Icons.ChevronDown
                    className={`ws-trigger-chevron ${isDropdownOpen ? 'ws-trigger-chevron--open' : ''}`}
                />
            </button>

            {/* DROPDOWN */}
            {isDropdownOpen && (
                <div className="ws-dropdown">
                    <div className="ws-dropdown-label">Espacios de trabajo</div>

                    <ul className="ws-list">
                        {workspaces.map(ws => (
                            <li key={ws.id} className="ws-item-wrap">
                                <button
                                    className={`ws-item ${ws.id === activeWorkspaceId ? 'ws-item--active' : ''}`}
                                    onClick={() => setActiveWorkspace(ws.id)}
                                >
                                    <span className="ws-item-check">
                                        {ws.id === activeWorkspaceId && (
                                            <Icons.Check className="icon-md" />
                                        )}
                                    </span>
                                    <span className="ws-item-name">{ws.name}</span>
                                    {ws.type === 'full' && (
                                        <span className="ws-item-badge">completo</span>
                                    )}
                                </button>
                                {!ws.protected && (
                                    <button
                                        className="ws-item-delete"
                                        onClick={(e) => handleDelete(e, ws)}
                                        title={`Eliminar "${ws.name}"`}
                                        aria-label={`Eliminar workspace ${ws.name}`}
                                    >
                                        <Icons.Trash className="icon-sm" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="ws-dropdown-footer">
                        {showInput ? (
                            <div className="ws-new-input-wrap">
                                <input
                                    ref={inputRef}
                                    className="ws-new-input"
                                    type="text"
                                    placeholder="Nombre del workspace..."
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    maxLength={40}
                                    disabled={creating}
                                />
                                <button
                                    className="ws-new-confirm"
                                    onClick={handleCreate}
                                    disabled={!newName.trim() || creating}
                                >
                                    {creating ? '...' : 'Crear'}
                                </button>
                                <button
                                    className="ws-new-cancel"
                                    onClick={() => { setShowInput(false); setNewName(''); }}
                                    aria-label="Cancelar creación de workspace"
                                >
                                    <Icons.X className="icon-sm" />
                                </button>
                            </div>
                        ) : (
                            <button
                                className="ws-new-btn"
                                onClick={() => setShowInput(true)}
                            >
                                <Icons.Plus className="icon-md" />
                                Nuevo workspace
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
