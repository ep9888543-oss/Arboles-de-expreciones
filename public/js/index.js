const expresion = document.getElementById("expresion");
const arbol = document.getElementById("arbol");
let lineas = [];

// 1. Busca el operador principal (+, -, *, /) fuera de paréntesis
function buscarOperadorPrincipal(texto) {
    let nivelParentesis = 0;
    let posOperador = -1;
    let menorPrioridad = 99;

    // Se recorre de derecha a izquierda
    for (let i = texto.length - 1; i >= 0; i--) {
        const char = texto[i];

        if (char === ')') nivelParentesis++;
        else if (char === '(') nivelParentesis--;
        else if (nivelParentesis === 0) {
            // '+' y '-' se evalúan al final (van más arriba en el árbol)
            if ((char === '+' || char === '-') && menorPrioridad > 1) {
                menorPrioridad = 1;
                posOperador = i;
            } 
            // '*' y '/' tienen mayor prioridad interna
            else if ((char === '*' || char === '/') && menorPrioridad > 2) {
                menorPrioridad = 2;
                posOperador = i;
            }
        }
    }
    return posOperador;
}

// 2. Remueve paréntesis envolventes: "(2+3)" -> "2+3"
function limpiarParentesis(texto) {
    while (texto.startsWith('(') && texto.endsWith(')')) {
        let nivel = 0;
        let esEnvoltorioCompleto = true;
        for (let i = 0; i < texto.length - 1; i++) {
            if (texto[i] === '(') nivel++;
            if (texto[i] === ')') nivel--;
            if (nivel === 0) {
                esEnvoltorioCompleto = false;
                break;
            }
        }
        if (esEnvoltorioCompleto) {
            texto = texto.substring(1, texto.length - 1).trim();
        } else {
            break;
        }
    }
    return texto;
}

let contadorId = 0;

// 3. Divide la operación en rama izquierda y derecha de forma recursiva
function crearArbolVisual(cadena) {
    cadena = limpiarParentesis(cadena.trim());
    if (!cadena) return null;

    const opIdx = buscarOperadorPrincipal(cadena);
    const idActual = "nodo_" + (++contadorId);

    // Caso base: Si no hay operador, es un número (nodo hoja)
    if (opIdx === -1) {
        return {
            id: idActual,
            html: `
                <div class="d-flex flex-column align-items-center">
                    <div id="${idActual}" class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                        ${cadena}
                    </div>
                </div>`,
            hijos: []
        };
    }

    // Caso recursivo: Es un operador con hijos
    const operador = cadena[opIdx];
    const ramaIzq = crearArbolVisual(cadena.substring(0, opIdx));
    const ramaDer = crearArbolVisual(cadena.substring(opIdx + 1));

    if (!ramaIzq || !ramaDer) return null;

    return {
        id: idActual,
        html: `
            <div class="d-flex flex-column align-items-center">
                <div id="${idActual}" class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                    ${operador}
                </div>
                <div class="d-flex justify-content-center gap-4 mt-4">
                    ${ramaIzq.html}
                    ${ramaDer.html}
                </div>
            </div>`,
        hijos: [ramaIzq, ramaDer]
    };
}

// 4. Traza las líneas entre padres e hijos
function conectarLineas(nodo) {
    if (!nodo || !nodo.hijos || nodo.hijos.length === 0) return;

    nodo.hijos.forEach(hijo => {
        const origen = document.getElementById(nodo.id);
        const destino = document.getElementById(hijo.id);
        if (origen && destino) {
            lineas.push(new LeaderLine(origen, destino, {
                startPlug: 'disc',
                endPlug: 'disc',
                color: '#8b772c',
                size: 3,
                path: 'straight'
            }));
        }
        conectarLineas(hijo);
    });
}

// 5. Evento de escritura
expresion.addEventListener("input", (e) => {
    // Solo permite números (0-9), operadores (+, -, *, /) y paréntesis
    e.target.value = e.target.value.replace(/[^0-9+\-*/()]/g, "");

    // Limpia líneas viejas para no acumular basura en pantalla
    lineas.forEach(l => l.remove());
    lineas = [];
    contadorId = 0;

    const texto = e.target.value.trim();
    if (!texto) {
        arbol.innerHTML = "";
        return;
    }

    const estructura = crearArbolVisual(texto);
    if (estructura) {
        arbol.innerHTML = `<div class="d-flex justify-content-center py-4 w-100 overflow-auto">${estructura.html}</div>`;
        setTimeout(() => conectarLineas(estructura), 50);
    }
});

// Ajusta las líneas si la pantalla cambia de tamaño
window.addEventListener("resize", () => {
    lineas.forEach(linea => linea.position());
});