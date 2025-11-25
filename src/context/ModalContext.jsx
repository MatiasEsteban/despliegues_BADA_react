import React, { createContext, useContext, useState, useCallback } from 'react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const ModalContext = createContext();

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        showCancel: false,
        resolve: null, // Guardamos la función resolve de la promesa
    });

    // Función principal que devuelve una Promesa
    const showModal = useCallback(({ title, message, type = 'info', confirmText = 'Aceptar', cancelText = 'Cancelar', showCancel = false }) => {
        return new Promise((resolve) => {
            setModalState({
                isOpen: true,
                title,
                message,
                type,
                confirmText,
                cancelText,
                showCancel,
                resolve,
            });
        });
    }, []);

    // Helpers rápidos compatibles con tu código original
    const confirm = useCallback((message, title = 'Confirmación', type = 'warning') => {
        return showModal({ title, message, type, showCancel: true });
    }, [showModal]);

    const alert = useCallback((message, title = 'Aviso', type = 'info') => {
        return showModal({ title, message, type, showCancel: false });
    }, [showModal]);

    const handleClose = (result) => {
        setModalState((prev) => {
            if (prev.resolve) prev.resolve(result); // Resuelve la promesa con true/false
            return { ...prev, isOpen: false };
        });
    };

    return (
        <ModalContext.Provider value={{ showModal, confirm, alert }}>
            {children}

            {/* Renderizado global del modal */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={() => handleClose(false)}
                title={modalState.title}
                type={modalState.type}
                actions={
                    <>
                        {modalState.showCancel && (
                            <Button variant="secondary" onClick={() => handleClose(false)}>
                                {modalState.cancelText}
                            </Button>
                        )}
                        <Button variant="primary" onClick={() => handleClose(true)}>
                            {modalState.confirmText}
                        </Button>
                    </>
                }
            >
                {modalState.message}
            </Modal>
        </ModalContext.Provider>
    );
}