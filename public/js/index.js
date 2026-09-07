const expresion = document.getElementById("expresion");
const arbol = document.getElementById("arbol");
let lineas = [];

// Función para encontrar el operador principal (el de menor precedencia fuera de paréntesis)
function buscarOperadorPrincipal(texto) {
    let nivelParentesis = 0;
    let posOperador = -1;
    let menorPrioridad = 99;

    // Recorremos de derecha a izquierda para respetar la asociatividad natural
    for (let i = texto.length - 1; i >= 0; i--) {
        const char = texto[i];

        if (char === ')') nivelParentesis++;
        else if (char === '(') nivelParentesis--;
        else if (nivelParentesis === 0) {
            // Fuera de paréntesis: '+' y '-' tienen prioridad 1 (se hacen después, van más arriba en el árbol)
            if ((char === '+' || char === '-') && menorPrioridad > 1) {
                menorPrioridad = 1;
                posOperador = i;
            } 
            // '*' y '/' tienen prioridad 2
            else if ((char === '*' || char === '/') && menorPrioridad > 2) {
                menorPrioridad = 2;
                posOperador = i;
            }
        }
    }
    return posOperador;
}

// Quita paréntesis sobrantes si envuelven toda la expresión: "(A+B)" -> "A+B"
function limpiarParentesis(texto) {
    while (texto.startsWith('(') && texto.endsWith(')')) {
        let nivel = 0;
        let esEnvoltorioCompleto = true;
        for (let i = 0; i < texto.length - 1; i++) {
            if (texto[i] === '(') nivel++;
            if (texto[i] === ')') nivel--;
            if (nivel === 0) { esEnvoltorioCompleto = false; break; }
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

// Construye el HTML del árbol dividiendo en Izquierda y Derecha (recursión simple)
function crearArbolVisual(cadena) {
    cadena = limpiarParentesis(cadena.trim());
    if (!cadena) return null;

    const opIdx = buscarOperadorPrincipal(cadena);
    const idActual = "nodo_" + (++contadorId);

    // Caso 1: Es una letra o número final (una hoja)
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

    // Caso 2: Es un operador con rama izquierda y derecha
    const operador = cadena[opIdx];
    const ramaIzq = crearArbolVisual(cadena.substring(0, opIdx));
    const ramaDer = crearArbolVisual(cadena.substring(opIdx + 1));

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

// Conecta los círculos con LeaderLine
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

// Escuchador de eventos cuando escribes
expresion.addEventListener("input", (e) => {
    // Borrar líneas anteriores
    lineas.forEach(l => l.remove());
    lineas = [];
    contadorId = 0;

    const texto = e.target.value;
    if (!texto.trim()) {
        arbol.innerHTML = "";
        return;
    }

    // Dibujar en pantalla
    const estructura = crearArbolVisual(texto);
    if (estructura) {
        arbol.innerHTML = `<div class="d-flex justify-content-center py-4 w-100 overflow-auto">${estructura.html}</div>`;
        setTimeout(() => conectarLineas(estructura), 50);
    }
});