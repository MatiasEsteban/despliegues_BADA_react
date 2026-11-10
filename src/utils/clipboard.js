// clipboard.js - Único punto autorizado de manipulación directa del DOM (R-DS-03 / P2-06.2).
//
// El fallback de portapapeles necesita un <textarea> fuera de pantalla porque
// `document.execCommand('copy')` solo opera sobre una selección real del DOM.
// Por eso ESTE archivo usa `element.style` (excepción aprobada y documentada);
// ningún componente de src/components debe contener estilos inline.

const OFFSCREEN_TEXTAREA_STYLE = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '2em',
    height: '2em',
    padding: '0',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    background: 'transparent',
    opacity: '0',
    zIndex: '-1',
};

/**
 * Fallback síncrono: copia con un textarea temporal fuera de pantalla.
 * El textarea se elimina del DOM siempre, incluso si `execCommand` lanza.
 *
 * @param {string} text
 * @returns {boolean} true si el navegador confirmó la copia.
 */
function copyWithTextArea(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');

    // Excepción autorizada (ver cabecera): ocultar el textarea sin CSS externo.
    Object.assign(textArea.style, OFFSCREEN_TEXTAREA_STYLE);

    document.body.appendChild(textArea);

    try {
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, text.length);
        return document.execCommand('copy');
    } catch (err) {
        console.error('Error al ejecutar execCommand:', err);
        return false;
    } finally {
        textArea.remove();
    }
}

/**
 * Copia texto al portapapeles: Clipboard API primero, textarea como respaldo.
 *
 * @param {string} text - Texto plano a copiar.
 * @returns {Promise<boolean>} true si la copia se completó.
 */
export async function copyText(text) {
    if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('navigator.clipboard no disponible o bloqueado, usando fallback:', err);
        }
    }

    return copyWithTextArea(text);
}
