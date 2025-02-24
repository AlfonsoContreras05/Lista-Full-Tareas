

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#form-tarea');
    const input = document.querySelector('#nueva-tarea');
    const listaTareas = document.querySelector('#lista-tareas');

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
            listaTareas.removeChild(li);
            eliminarTarea(tarea.id);
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

