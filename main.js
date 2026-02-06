// Importa funções do SDK do Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, query, orderBy, updateDoc, deleteDoc, limit, where, writeBatch } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js';

// Configuração do banco de dados
const firebaseConfig = {
    apiKey: "AIzaSyAgen2CqFQlI2Vw3Cbd1Ah6T-zzB_BXQs8",
    authDomain: "ggheimer-todo-3ee5e.firebaseapp.com",
    projectId: "ggheimer-todo-3ee5e",
    storageBucket: "ggheimer-todo-3ee5e.appspot.com",
    messagingSenderId: "674639923713",
    appId: "1:674639923713:web:d4e7102f416667f1f1ce00"
};

// Conexão com o banco de dados do Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Funções principais
async function fetchAndDisplayTarefas() {
    const listaTarefas = document.querySelector('.card.lista-tarefas ul');
    const totalCustoTarefas = document.querySelector('.card');

    if (!listaTarefas) return;

    listaTarefas.innerHTML = '';

    try {
        const tarefasRef = collection(db, "tarefas");
        const q = query(tarefasRef, orderBy("ordemTar"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            listaTarefas.innerHTML = '<li>Sem tarefas na base de dados!</li>';
            return;
        }

        let custoTotal = 0;
        querySnapshot.forEach((doc) => {
            const tarefa = doc.data();
            custoTotal += tarefa.custoTar || 0;
            const itemTarefa = criaItemTarefa(doc.id, tarefa);
                listaTarefas.appendChild(itemTarefa);
            });

        const divTotalAntiga = document.querySelector('.total-tarefas-div');
        if (divTotalAntiga) {divTotalAntiga.remove()};

        const divCustoTotal = document.createElement('div');
        divCustoTotal.className = 'total-tarefas-div mt-2 me-3 text-end fw-bold';
        divCustoTotal.style.height = '2.5em';
        divCustoTotal.innerHTML = `
                <span class="total-custo-tarefas">Custo Total: ${custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            `;
        totalCustoTarefas.appendChild(divCustoTotal);

    } catch (error) {
        console.error("Erro ao buscar tarefas do Firestore:", error);
    }
}

function criaItemTarefa(id, tarefa) {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.setAttribute('data-id', id);

    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div class="order-arrows" hidden><i class="bi bi-chevron-up me-2 up-arrow"></i><i class="bi bi-chevron-down down-arrow"></i></div>
            <span class="tarefa-desc">${tarefa.nomeTar || 'Sem descrição'}</span>
            <div class="tarefa-actions" style="min-width:3rem;">
                <a href="#" class="edit-link"><i class="bi bi-pencil-square text-light"></i></a>
                <a href="#" class="delete-link ms-2"><i class="bi bi-trash text-danger"></i></a>
            </div>
        </div><hr>
    `;

    li.addEventListener('mouseover', () => {

        const arrows = li.querySelector('.order-arrows');
        li.style.height = '45px';
        li.style.color = 'black';
        li.classList.add('bg-body-secondary');

        if (arrows) {
            arrows.hidden = false;
        }
    });

    // Esconde as setas quando o mouse sai
    li.addEventListener('mouseout', () => {
        const arrows = li.querySelector('.order-arrows');
        li.style.height = '';
        li.style.color = '';
        li.classList.remove('bg-body-secondary');

        if (arrows) {
            arrows.hidden = true;
        }
    });

    if (tarefa.custoTar > 1000) {
        li.classList.add('bg-warning');
    }
    return li;
}

async function deletarTarefa(docId) {
    if (!docId) {
        console.error("Falha ao deletar. Sem ID do documento.");
        return;
    }
    try {
        await deleteDoc(doc(db, "tarefas", docId));
        await fetchAndDisplayTarefas();
    } catch (error) {
        console.error("Erro ao deletar documento: ", error);
        alert("Erro ao deletar tarefa. Veja console para detalhes.");
    }
}

async function showUpdateForm(docId) {
    try {
        const docRef = doc(db, "tarefas", docId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("tarefa not found.");
            return;
        }
        const tarefa = docSnap.data();

        const existingForm = document.getElementById('update-form-container');
        if (existingForm) {
            existingForm.remove();
        }

        const formContainer = document.createElement('div');
        formContainer.id = 'update-form-container';
        formContainer.className = 'form m-5 p-4 border rounded';

        formContainer.innerHTML = `
            <h3>Atualizar Tarefa</h3>
            <form id="dynamicUpdateTarefaForm">
                <div class="mb-3">
                    <label for="atualizaNomeTarefa" class="form-label">Tarefa</label>
                    <textarea type="text" class="form-control" id="atualizaNomeTarefa" required>${tarefa.nomeTar || ''}</textarea>
                </div>
                <div class="mb-3">
                    <label for="atualizaCustoTarefa" class="form-label">Custo da Tarefa</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control" id="atualizaCustoTarefa" value="${tarefa.custoTar || ''}" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="atualizaDataLimTarefa" class="form-label">Data Limite</label>
                    <input type="date" class="form-control" id="atualizaDataLimTarefa" value="${tarefa.dataLimTar || ''}" required>
                </div>
                    <button type="submit" class="btn btn-primary" id="dynamicUpdateTarefaForm">Atualizar</button>
                    <button type="button" class="btn btn-secondary" id="cancelaNovaTarefa">Cancelar</button>
                </div>
            </form>
        `;

        const mainElement = document.querySelector('.cards');
        mainElement.appendChild(formContainer);

        document.getElementById('dynamicUpdateTarefaForm').addEventListener('submit', (event) => {
            event.preventDefault();
            handleDynamicUpdate(docId);
        });

        document.getElementById('cancelaNovaTarefa').addEventListener('click', () => {
            formContainer.remove();
        });

    } catch (error) {
        console.error("Error showing update form:", error);
        alert("Could not display update form.");
    }
}

async function showCreateForm() {
    try {
        const existingCreateForm = document.getElementById('create-form-container');
        if (existingCreateForm) existingCreateForm.remove();

        const formContainer = document.createElement('div');
        formContainer.id = 'create-form-container';
        formContainer.className = 'form p-2 border rounded';

        formContainer.innerHTML = `
            <h3>Incluir Tarefa</h3>
            <form id="dynamicCreateForm">
                <div class="mb-3">
                    <label for="criaNomeTarefa" class="form-label">Tarefa</label>
                    <textarea type="text" class="form-control" id="criaNomeTarefa" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="criaCustoTarefa" class="form-label">Custo da Tarefa</label>
                    <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input type="text" class="form-control" id="criaCustoTarefa"}" required>
                    </div>
                </div>
                <div class="mb-3">
                    <label for="criaDataLimTarefa" class="form-label">Data Limite</label>
                    <input type="date" class="form-control" id="criaDataLimTarefa"}" required>
                </div>
                    <button type="submit" class="btn btn-primary">Incluir</button>
                    <button type="button" class="btn btn-secondary" id="cancelaNovaTarefa">Cancelar</button>
                </div>
            </form>
        `;

        const mainElement = document.querySelector('.cards');
        mainElement.appendChild(formContainer);

        document.getElementById('dynamicCreateForm').addEventListener('submit', (event) => {
            event.preventDefault();
            handleDynamicCreate();
        });

        document.getElementById('cancelaNovaTarefa').addEventListener('click', () => {
            formContainer.remove();
        });

    } catch (error) {
        console.error("Error showing update form:", error);
        alert("Could not display create form.");
    }
}

async function handleDynamicCreate() {
    try {
    const tarefasRef = collection(db, "tarefas");
        const q = query(tarefasRef, orderBy("ordemTar", "desc"), limit(1));
        const querySnapshot = await getDocs(q);
        let nextOrder = 1;
        if (!querySnapshot.empty) {
            const lastTask = querySnapshot.docs[0].data();
            nextOrder = lastTask.ordemTar + 1;
        }

        const custoString = document.getElementById('criaCustoTarefa').value.replace(',', '.');
        const novaTarefa = {
            nomeTar: document.getElementById('criaNomeTarefa').value,
            custoTar: parseFloat(custoString),
            dataLimTar: document.getElementById('criaDataLimTarefa').value,
            ordemTar: nextOrder
        };
    
        await addDoc(collection(db, "tarefas"), novaTarefa);
        
        document.getElementById('create-form-container').remove();

        await fetchAndDisplayTarefas();

    } catch (error) {
        console.error("Erro ao criar tarefa: ", error);
        alert("Falha ao criar tarefa. Veja o console para detalhes.");
    }
}

async function handleDynamicUpdate(docId) {
    if (!docId) {
        alert("Erro: ID não fornecido para atualização.");
        return;
    }

        const formContainer = document.getElementById('update-form-container');
        const costString = document.getElementById('atualizaCustoTarefa').value.replace(',', '.');
        const tarefaAtualizada = {
            nomeTar: document.getElementById('atualizaNomeTarefa').value,
            custoTar: parseFloat(costString) || 0,
            dataLimTar: document.getElementById('atualizaDataLimTarefa').value
        };
        
        try {
            await updateDoc(doc(db, "tarefas", docId), tarefaAtualizada);

            document.getElementById('update-form-container').remove();

            await fetchAndDisplayTarefas();

    } catch (error) {
        console.error("Error updating document: ", error);
        alert("Failed to update tarefa. See console for details.");
    }
}

async function sobeTarefa(docId) {
    if (!docId) return;

    try {
        const refTarefa = doc(db, "tarefas", docId);
        const snapTarefa = await getDoc(refTarefa);

        if (!snapTarefa.exists()) {
            console.error("Tarefa não encontrada!");
            return;
        }

        const dadosTarefaAtual = snapTarefa.data();
        const ordemAtual = dadosTarefaAtual.ordemTar;

        // Encontra a tarefa com a ordem imediatamente anterior
        const q = query(
            collection(db, "tarefas"),
            where("ordemTar", "<", ordemAtual),
            orderBy("ordemTar", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return; // Já está no topo
        }

        const previousSnapTarefa = querySnapshot.docs[0];
        const previousRefTarefa = doc(db, "tarefas", previousSnapTarefa.id);
        
        // Troca a ordem das duas tarefas
        const batch = writeBatch(db);
        batch.update(refTarefa, { ordemTar: previousSnapTarefa.data().ordemTar });
        batch.update(previousRefTarefa, { ordemTar: ordemAtual });
        await batch.commit();

        await fetchAndDisplayTarefas();

    } catch (error) {
        console.error("Erro ao subir tarefa: ", error);
    }
}

async function desceTarefa(docId) {
    if (!docId) return;

    try {
        const refTarefa = doc(db, "tarefas", docId);
        const snapTarefa = await getDoc(refTarefa);

        if (!snapTarefa.exists()) {
            console.error("Tarefa não encontrada!");
            return;
        }

        const dadosTarefaAtual = snapTarefa.data();
        const ordemAtual = dadosTarefaAtual.ordemTar;

        // Encontra a tarefa com a ordem imediatamente posterior
        const q = query(
            collection(db, "tarefas"),
            where("ordemTar", ">", ordemAtual),
            orderBy("ordemTar", "asc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return; // Já está na base
        }

        const nextsnapTarefa = querySnapshot.docs[0];
        const nextrefTarefa = doc(db, "tarefas", nextsnapTarefa.id);

        // Troca a ordem das duas tarefas
        const batch = writeBatch(db);
        batch.update(refTarefa, { ordemTar: nextsnapTarefa.data().ordemTar });
        batch.update(nextrefTarefa, { ordemTar: ordemAtual });
        await batch.commit();

        await fetchAndDisplayTarefas();

    } catch (error) {
        console.error("Erro ao descer tarefa: ", error);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {

        fetchAndDisplayTarefas();

        const createTaskBtn = document.getElementById('show-create-form-btn');
        if (createTaskBtn) {
            createTaskBtn.addEventListener('click', (event) => {
                event.preventDefault();
                showCreateForm();
        });
}
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.addEventListener('click', (event) => {
                const editLink = event.target.closest('.edit-link');
                const deleteLink = event.target.closest('.delete-link');
                const upArrow = event.target.closest('.up-arrow');
                const downArrow = event.target.closest('.down-arrow');

                if (editLink) {
                    event.preventDefault();
                    const tarefaItem = editLink.closest('li[data-id]');
                    if (tarefaItem) {
                        showUpdateForm(tarefaItem.dataset.id);
                    }
                } else if (deleteLink) {
                    event.preventDefault();
                    const tarefaItem = deleteLink.closest('li[data-id]');
                    if (tarefaItem && confirm("Are you sure you want to delete this tarefa?")) {
                        deletarTarefa(tarefaItem.dataset.id);
                    }
                } else if (upArrow){
                    event.preventDefault();
                    const tarefaItem = upArrow.closest('li[data-id]');
                    if (tarefaItem) {
                        sobeTarefa(tarefaItem.dataset.id);
                    }
                } else if (downArrow){
                    event.preventDefault();
                    const tarefaItem = downArrow.closest('li[data-id]');
                    if (tarefaItem) {
                        desceTarefa(tarefaItem.dataset.id);
                }
            }
            });
    }
});
