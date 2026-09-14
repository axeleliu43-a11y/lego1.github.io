// Interacción para el modo oscuro
const botonTema = document.getElementById('btn-tema');

botonTema.addEventListener('click', function() {
    document.body.classList.toggle('modo-oscuro');

    if (document.body.classList.contains('modo-oscuro')) {
        botonTema.textContent = 'Modo Claro';
    } else {
        botonTema.textContent = 'Modo Oscuro';
    }
});

// ---------- Comentarios en Experiencias LEGO ----------
const formComentario = document.getElementById('form-comentario');
const listaComentarios = document.getElementById('lista-comentarios');
const btnExcel = document.getElementById('btn-excel');
const btnPdf = document.getElementById('btn-pdf');

let comentarios = JSON.parse(localStorage.getItem('comentariosLego')) || [];

function guardarComentarios() {
    localStorage.setItem('comentariosLego', JSON.stringify(comentarios));
}

function renderComentarios() {
    listaComentarios.innerHTML = '';

    // Mensaje cuando aún no hay comentarios
    if (comentarios.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'comentario-vacio';
        vacio.textContent = 'Aún no hay comentarios. ¡Sé el primero en compartir tu experiencia!';
        listaComentarios.appendChild(vacio);
        return;
    }

    comentarios.forEach(function(c, index) {
        const li = document.createElement('li');

        const nombreEl = document.createElement('strong');
        nombreEl.textContent = c.nombre;

        const textoEl = document.createElement('p');
        textoEl.textContent = c.texto;

        const fechaEl = document.createElement('span');
        fechaEl.className = 'fecha';
        fechaEl.textContent = c.fecha;

        // Botón para borrar este comentario individual
        const btnBorrar = document.createElement('button');
        btnBorrar.type = 'button';
        btnBorrar.className = 'btn-borrar-comentario';
        btnBorrar.textContent = '✕';
        btnBorrar.setAttribute('aria-label', 'Borrar comentario de ' + c.nombre);
        btnBorrar.addEventListener('click', function() {
            comentarios.splice(index, 1);
            guardarComentarios();
            renderComentarios();
        });

        li.appendChild(btnBorrar);
        li.appendChild(nombreEl);
        li.appendChild(textoEl);
        li.appendChild(fechaEl);

        listaComentarios.appendChild(li);
    });
}

if (formComentario) {
    formComentario.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre-comentario').value.trim();
        const texto = document.getElementById('texto-comentario').value.trim();

        if (!nombre || !texto) return;

        const nuevoComentario = {
            nombre: nombre,
            texto: texto,
            fecha: new Date().toLocaleString('es-ES')
        };

        comentarios.push(nuevoComentario);
        guardarComentarios();
        renderComentarios();

        formComentario.reset();
    });
}

// Descargar en Excel
if (btnExcel) {
    btnExcel.addEventListener('click', function() {
        if (comentarios.length === 0) {
            alert('Todavía no hay comentarios para descargar.');
            return;
        }

        const datos = comentarios.map(function(c) {
            return { Nombre: c.nombre, Comentario: c.texto, Fecha: c.fecha };
        });

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, 'Comentarios');
        XLSX.writeFile(libro, 'comentarios_lego.xlsx');
    });
}

// Descargar en PDF
if (btnPdf) {
    btnPdf.addEventListener('click', function() {
        if (comentarios.length === 0) {
            alert('Todavía no hay comentarios para descargar.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Comentarios - Experiencias LEGO', 14, 20);

        let y = 35;
        doc.setFontSize(11);

        comentarios.forEach(function(c, i) {
            const lineaNombre = (i + 1) + '. ' + c.nombre + ' (' + c.fecha + ')';
            const lineasTexto = doc.splitTextToSize(c.texto, 180);

            if (y > 270) {
                doc.addPage();
                y = 20;
            }

            doc.setFont(undefined, 'bold');
            doc.text(lineaNombre, 14, y);
            y += 6;

            doc.setFont(undefined, 'normal');
            doc.text(lineasTexto, 14, y);
            y += lineasTexto.length * 6 + 6;
        });

        doc.save('comentarios_lego.pdf');
    });
}

renderComentarios();