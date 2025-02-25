

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#form-tarea');
    const input = document.querySelector('#nueva-tarea');
    const listaTareas = document.querySelector('#lista-tareas');

    listaTareas.addEventListener("drop", () => {
        const nuevasTareas = [...listaTareas.children].map(li => {
            return {
                id: parseInt(li.dataset.id),
                texto: li.querySelector(".texto-tarea").textContent,
                completada: li.classList.contains("completada"),
                fecha: li.querySelector(".fecha-tarea").textContent.replace("📅 ", ""),
            };
        });
    
        localStorage.setItem("tareas", JSON.stringify(nuevasTareas));
    });

    console.log("Formulario detectado:", form);

    if (!form) {
        console.error("❌ Error: No se encontró el formulario. Verifica que el id sea 'form-tarea'.");
        return;
    }

    cargarTareas();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("✔ Evento de envío detectado.");

        const textoTarea = input.value.trim();
        if (textoTarea !== '') {
            const fechaActual = new Date().toLocaleString(); // 📅 Capturamos la fecha y hora
            const tarea = {
                id: Date.now(),
                texto: textoTarea,
                completada: false,
                fecha: fechaActual
            };


            agregarTarea(tarea);
            guardarTarea(tarea);
            input.value = '';
        }
    });

    function agregarTarea(tarea) {
        console.log("✔ Se agrega una tarea:", tarea);

        const li = document.createElement('li');
        li.dataset.id = tarea.id;
        li.draggable = true;

        //evento para deteccion cuando la tarea comience a moverse
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tarea.id);
            li.classList.add('arrastrando');
        });

        li.addEventListener('dragend', () => {
            li.classList.remove('arrastrando');
        });

        // 🔹 Contenedor de texto y fecha
        const divTexto = document.createElement('div');
        divTexto.textContent = tarea.texto;
        divTexto.classList.add('texto-tarea');

        const spanFecha = document.createElement('span');
        spanFecha.textContent = `📅 ${tarea.fecha}`;
        spanFecha.classList.add('fecha-tarea');

        // 🔹 Botón COMPLETAR (marcar/desmarcar como completada)
        const botonCompletar = document.createElement('button');
        botonCompletar.textContent = '✔ Completar';
        botonCompletar.classList.add('btn-completar');
        botonCompletar.addEventListener('click', () => {
            li.classList.toggle('completada');
            actualizarEstadoTarea(tarea.id);
        });

        // 🔹 Botón EDITAR (editar el texto)
        const botonEditar = document.createElement('button');
        botonEditar.textContent = '✏ Editar';
        botonEditar.classList.add('btn-editar');
        botonEditar.addEventListener('click', () => {
            editarTarea(tarea.id, divTexto);
        });

        // 🔹 Botón ELIMINAR (borrar la tarea)
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = '🗑 Eliminar';
        botonEliminar.classList.add('btn-eliminar');
        botonEliminar.addEventListener('click', () => {
            li.classList.add('desaparecer');
            setTimeout(() => {
                listaTareas.removeChild(li);
                eliminarTarea(tarea.id);
            }
                , 500);
        });

        // 📌 Si la tarea está completada, aplicamos la clase CSS
        if (tarea.completada) {
            li.classList.add('completada');
        }

        // 🔹 Agregamos los elementos al <li>
        li.appendChild(divTexto);
        li.appendChild(spanFecha);
        li.appendChild(botonCompletar);
        li.appendChild(botonEditar);
        li.appendChild(botonEliminar);

        listaTareas.appendChild(li);
    }

    function guardarTarea(tarea) {
        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas.push(tarea);
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    function cargarTareas() {
        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas.sort((a, b) => a.completada - b.completada);
        listaTareas.innerHTML = '';
        tareas.forEach(tarea => agregarTarea(tarea));

        

    }

    listaTareas.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(listaTareas, e.clientY);
        const dragging = document.querySelector('.arrastrando');

        if (afterElement == null) {
            listaTareas.appendChild(dragging);
        } else {
            listaTareas.insertBefore(dragging, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.arrastrando)')];

        

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();

            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }
            , { offset: Number.NEGATIVE_INFINITY }).element;
    }



    // 📤 EXPORTAR JSON
    document.getElementById("exportar-json").addEventListener("click", () => {
        let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
        let blob = new Blob([JSON.stringify(tareas, null, 2)], { type: "application/json" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "tareas.json";
        link.click();
    });

    // 📤 EXPORTAR TXT
    document.getElementById("exportar-txt").addEventListener("click", () => {
        let tareas = JSON.parse(localStorage.getItem("tareas")) || [];
        let contenido = tareas.map(t => `[${t.completada ? "✔" : "❌"}] ${t.texto} - ${t.fecha}`).join("\n");
        let blob = new Blob([contenido], { type: "text/plain" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "tareas.txt";
        link.click();
    });

    // 📥 IMPORTAR JSON
    document.getElementById("importar-btn").addEventListener("click", () => {
        document.getElementById("importar-json").click();
    });

    document.getElementById("importar-json").addEventListener("change", (event) => {
        let file = event.target.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = (e) => {
            try {
                let tareasImportadas = JSON.parse(e.target.result);

                // 📌 Validamos que el archivo tenga tareas correctamente formateadas
                if (!Array.isArray(tareasImportadas)) {
                    throw new Error("Formato incorrecto");
                }

                // 📌 Verificamos que cada tarea tenga los campos correctos
                tareasImportadas = tareasImportadas.filter(t =>
                    t.hasOwnProperty("id") &&
                    t.hasOwnProperty("texto") &&
                    t.hasOwnProperty("completada") &&
                    t.hasOwnProperty("fecha")
                );

                if (tareasImportadas.length === 0) {
                    alert("❌ El archivo no contiene tareas válidas.");
                    return;
                }

                // 📌 Guardamos en localStorage
                localStorage.setItem("tareas", JSON.stringify(tareasImportadas));

                // 📌 Recargamos la lista de tareas en la UI
                recargarListaOrdenada();

                alert("✅ Tareas importadas con éxito!");

            } catch (error) {
                alert("❌ Error al importar el archivo. Asegúrate de que sea un JSON válido.");
            }
        };

        reader.readAsText(file);
    });


    function actualizarEstadoTarea(id) {
        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas = tareas.map(t => t.id === id ? { ...t, completada: !t.completada } : t);
        localStorage.setItem('tareas', JSON.stringify(tareas));

        recargarListaOrdenada();
    }

    function recargarListaOrdenada() {
        while (listaTareas.firstChild) {
            listaTareas.removeChild(listaTareas.firstChild);
        }


        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];

        tareas.sort((a, b) => a.completada - b.completada);
        tareas.forEach(tarea => agregarTarea(tarea));
    }

    function eliminarTarea(id) {
        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas = tareas.filter(t => t.id !== id);
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    function editarTarea(id, divTexto) {
        const textoActual = divTexto.textContent.trim();

        if (divTexto.querySelector("input")) return;

        const input = document.createElement("input");
        input.type = "text";
        input.value = textoActual;
        input.classList.add("editando");

        divTexto.innerHTML = "";
        divTexto.appendChild(input);
        input.focus();

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const nuevoTexto = input.value.trim();
                if (nuevoTexto !== "") {
                    actualizarTextoTarea(id, nuevoTexto);
                    divTexto.textContent = nuevoTexto;
                }
            }
        });

        input.addEventListener("blur", () => {
            divTexto.textContent = textoActual;
        });
    }



    // 🔹 Nueva función para agregar el botón "Eliminar"
    function agregarBotonEliminar(li, id) {
        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', () => {
            listaTareas.removeChild(li);
            eliminarTarea(id);
        });

        li.appendChild(botonEliminar);
    }

    function actualizarTextoTarea(id, nuevoTexto) {
        let tareas = JSON.parse(localStorage.getItem('tareas')) || [];
        tareas = tareas.map(t => t.id === id ? { ...t, texto: nuevoTexto } : t);
        localStorage.setItem('tareas', JSON.stringify(tareas));
    }

    document.getElementById("mostrar-todas").addEventListener("click", () => filtrarTareas("todas"));

    document.getElementById("mostrar-completadas").addEventListener("click", () => filtrarTareas("completadas"));

    document.getElementById("mostrar-pendientes").addEventListener("click", () => filtrarTareas("pendientes"));

    function filtrarTareas(filtro) {
        let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

        let tareasFiltradas = [];

        if (filtro === "pendientes") {
            tareasFiltradas = tareas.filter(t => !t.completada);
        } else if (filtro === "completadas") {
            tareasFiltradas = tareas.filter(t => t.completada);
        } else {
            tareasFiltradas = tareas; // Todas las tareas
        }

        listaTareas.innerHTML = ""; // Limpiar la lista antes de mostrar el filtro
        tareasFiltradas.forEach(tarea => agregarTarea(tarea));
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const botonModoOscuro = document.getElementById('modo-oscuro');

    if (localStorage.getItem('modo') === 'oscuro') {
        document.body.classList.add('oscuro');
        botonModoOscuro.textContent = '☀️ Modo claro';
    }

    botonModoOscuro.addEventListener('click', () => {
        document.body.classList.toggle('oscuro');

        if (document.body.classList.contains('oscuro')) {
            localStorage.setItem('modo', 'oscuro');
            botonModoOscuro.textContent = '☀️ Modo claro';
        } else {
            localStorage.setItem('modo', 'claro');
            botonModoOscuro.textContent = '🌙 Modo oscuro';
        }
    }
    );
});



