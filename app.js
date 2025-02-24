

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
            const tarea = { id: Date.now(), texto: textoTarea, completada: false };

            agregarTarea(tarea);
            guardarTarea(tarea);
            input.value = '';
        }
    });

    function agregarTarea(tarea) {
        console.log("✔ Se agrega una tarea:", tarea);

        const li = document.createElement('li');
        li.textContent = tarea.texto;
        li.dataset.id = tarea.id;

        if (tarea.completada) {
            li.classList.add('completada');
        }

        li.addEventListener('click', () => {
            li.classList.toggle('completada');
            actualizarEstadoTarea(tarea.id);
        });

        li.addEventListener('dblclick', () => {
            editarTarea(tarea.id, li);
        });

        const botonEliminar = document.createElement('button');
        botonEliminar.textContent = 'Eliminar';
        botonEliminar.addEventListener('click', () => {
            listaTareas.removeChild(li);
            eliminarTarea(tarea.id);
        });

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

    function editarTarea(id, li) {
        const textoActual = li.textContent.replace('Eliminar', '').trim();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textoActual;
        input.classList.add('editando');

        li.textContent = '';
        li.appendChild(input);
        input.focus();

        // Evento para guardar cambios al presionar Enter
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const nuevoTexto = input.value.trim();
                if (nuevoTexto !== "") {
                    actualizarTextoTarea(id, nuevoTexto);

                    // 🔹 Restauramos el contenido del <li> con el texto editado y el botón "Eliminar"
                    li.textContent = nuevoTexto;
                    agregarBotonEliminar(li, id);
                }
            }
        });

        // Evento para cancelar edición si el input pierde el foco
        input.addEventListener("blur", () => {
            li.textContent = textoActual;
            agregarBotonEliminar(li, id);
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

