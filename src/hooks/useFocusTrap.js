import { useEffect, useRef } from 'react';

/**
 * Selector de elementos enfocables usado por el ciclo de Tab. Se recalcula en
 * cada `keydown` para tolerar contenido que aparece/desaparece con el modal
 * abierto (p. ej. listas filtradas).
 */
export const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea',
    'input',
    'select',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Atrapa el foco dentro de un contenedor mientras `isActive` sea `true`.
 *
 * Comportamiento:
 * 1. Foco inicial: primer enfocable del contenedor; si no hay, el propio
 *    contenedor (debe tener `tabIndex={-1}`).
 * 2. Tab / Shift+Tab: ciclo cerrado, con el primer/último enfocable recalculado
 *    en cada `keydown`. Sin enfocables, el foco se queda en el contenedor.
 * 3. Escape: invoca `onClose` una sola vez (único listener del modal).
 * 4. Restauración: devuelve el foco al elemento activo previo al activarse.
 * 5. Scroll: bloquea `document.body` con `overflow: hidden` y restaura el valor
 *    previo. Es el único `style` que escribe el hook: R-DS-03 lo admite como
 *    manipulación directa del DOM para bloquear el scroll del documento, no
 *    como estilo de componente.
 *
 * Los listeners y el estado del body se limpian en el `cleanup`, por lo que
 * `isActive=false` no deja efectos colaterales.
 *
 * @param {Object} options
 * @param {boolean} options.isActive - Activa el atrapamiento y el bloqueo de scroll.
 * @param {() => void} [options.onClose] - Callback invocado al pulsar Escape.
 * @param {{ current: HTMLElement | null }} options.containerRef - Ref al diálogo.
 * @returns {void}
 */
export function useFocusTrap({ isActive, onClose, containerRef }) {
    // `onClose` se guarda en un ref para que un cambio de identidad no vuelva a
    // ejecutar el efecto (y no robe el foco en cada render del contenedor).
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isActive) return undefined;

        const container = containerRef?.current;
        if (!container) return undefined;

        const previouslyFocused = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));

        const firstFocusable = getFocusable()[0];
        if (firstFocusable) firstFocusable.focus();
        else container.focus();

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== 'Tab') return;

            const focusable = getFocusable();
            const activeElement = document.activeElement;

            if (focusable.length === 0) {
                event.preventDefault();
                container.focus();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            // Foco fuera del diálogo: se devuelve al borde correspondiente.
            if (!container.contains(activeElement)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
                return;
            }

            if (event.shiftKey && activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;

            if (
                previouslyFocused instanceof HTMLElement
                && previouslyFocused.isConnected
                && typeof previouslyFocused.focus === 'function'
            ) {
                previouslyFocused.focus();
            }
        };
    }, [isActive, containerRef]);
}
