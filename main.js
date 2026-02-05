// Import functions from the Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, addDoc, query, orderBy, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js';

// Your correct Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgen2CqFQlI2Vw3Cbd1Ah6T-zzB_BXQs8",
    authDomain: "ggheimer-todo-3ee5e.firebaseapp.com",
    projectId: "ggheimer-todo-3ee5e",
    storageBucket: "ggheimer-todo-3ee5e.appspot.com",
    messagingSenderId: "674639923713",
    appId: "1:674639923713:web:d4e7102f416667f1f1ce00"
};

// Connect to Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Main Page Functions ---
async function fetchAndDisplayTasks() {
    const backlogList = document.querySelector('.card.backlog ul');
    const ongoingList = document.querySelector('.card.ongoing ul');
    const finishedList = document.querySelector('.card.finished ul');

    if (!backlogList || !ongoingList || !finishedList) return;

    backlogList.innerHTML = '';
    ongoingList.innerHTML = '';
    finishedList.innerHTML = '';

    try {
        const tasksRef = collection(db, "tasks");
        const q = query(tasksRef, orderBy("task_weight"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            backlogList.innerHTML = '<li>No tasks in database!</li>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const task = doc.data();
            const taskElement = createTaskListItem(doc.id, task);
            if (task.task_status === 'o') {
                ongoingList.appendChild(taskElement);
            } else if (task.task_status === 'f') {
                finishedList.appendChild(taskElement);
            } else {
                backlogList.appendChild(taskElement);
            }
        });
    } catch (error) {
        console.error("Error fetching from Firestore:", error);
    }
}

function createTaskListItem(id, task) {
    const li = document.createElement('li');
    li.className = 'list-group-item list-group-item-action';
    li.setAttribute('data-id', id);

    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="task-desc">${task.task_desc || 'No Description'}</span>
            <div class="task-actions" style="min-width:3rem;">
                <a href="#" class="edit-link"><i class="bi bi-pencil-square text-light"></i></a>
                <a href="#" class="delete-link ms-2"><i class="bi bi-trash text-danger"></i></a>
            </div>
        </div>
    `;

    if (task.task_cost > 1000){
        li.classList.add('bg-warning');
    
    }
    return li;
}

async function deleteTask(docId) {
    if (!docId) {
        console.error("Delete failed: No document ID provided.");
        return;
    }
    try {
        await deleteDoc(doc(db, "tasks", docId));
        const taskItem = document.querySelector(`li[data-id="${docId}"]`);
        if (taskItem) taskItem.remove();
    } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete task. See console for details.");
    }
}

async function createTask(event) {
    event.preventDefault();
    const taskId = document.getElementById('taskId').value;
    if (!taskId) {
        alert("Task ID is required.");
        return;
    }

    const costString = document.getElementById('taskCost').value.replace(',', '.');

    const newTask = {
        task_id: taskId,
        task_desc: document.getElementById('taskDesc').value,
        task_cost: parseFloat(costString) || 0,
        task_due_date: document.getElementById('taskDueDate').value,
        task_weight: parseInt(document.getElementById('taskWeight').value) || 0,
        task_status: document.querySelector('input[name="taskStatus"]:checked').value
    };

    try {
        // Use setDoc to create a document with a specific ID
        const docRef = doc(db, "tasks", taskId);
        await setDoc(docRef, newTask);
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to create task. See console for details.");
    }
}


async function populateIndexUpdateForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    if (!docId) {
        alert("Could not find the task to update.");
        window.location.href = "./index.html";
        return;
    }

    const updateDiv = document.createElement('div');
    updateDiv.className = 'form';
    updateDiv.setAttribute('data-id', id);

    updateDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <span class="task-id">Task ID: ${task.task_id || 'No Description'}</span>
        </div>
    `;

    try {
        const docRef = doc(db, "tasks", docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const task = docSnap.data();
            document.getElementById('taskDesc').value = task.task_desc || '';
            document.getElementById('taskCost').value = task.task_cost || '';
            document.getElementById('taskDueDate').value = task.task_due_date || '';
            document.querySelector(`input[name="taskStatus"][value="${task.task_status}"]`).checked = true;
        } else {
            alert("Task not found.");
            window.location.href = "./index.html";
        }
    } catch (error) {
        console.error("Error getting document:", error);
    }
}

async function updateTask(event) {
    event.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    if (!docId) {
        alert("Error: No task ID provided for update.");
        return;
    }
    const costString = document.getElementById('taskCost').value.replace(',', '.');
    const updatedTask = {
        task_desc: document.getElementById('taskDesc').value,
        task_cost: parseFloat(costString) || 0,
        task_due_date: document.getElementById('taskDueDate').value,
        task_status: document.querySelector('input[name="taskStatus"]:checked').value
    };
    try {
        await updateDoc(doc(db, "tasks", docId), updatedTask);
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Error updating document: ", error);
        alert("Failed to update task. See console for details.");
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    const pagePath = window.location.pathname;

    // Router logic
    if (pagePath.includes('updateTask.html')) {
        populateUpdateForm();
        document.getElementById('updateTaskForm').addEventListener('submit', updateTask);
    } else if (pagePath.includes('createTask.html')) {
        document.getElementById('createTaskForm').addEventListener('submit', createTask);
    } else {
        fetchAndDisplayTasks();
        const mainElement = document.querySelector('main');
        if (mainElement) {
            mainElement.addEventListener('click', (event) => {
                const editIcon = event.target.closest('.bi-pencil-square');
                const deleteIcon = event.target.closest('.bi-trash');

                if (editIcon) {
                    event.preventDefault();
                    const taskItem = editIcon.closest('li[data-id]');
                    if (taskItem) {
                        window.location.href = `./updateTask.html?id=${taskItem.dataset.id}`;
                    }
                } else if (deleteIcon) {
                    event.preventDefault();
                    const taskItem = deleteIcon.closest('li[data-id]');
                    if (taskItem && confirm("Are you sure you want to delete this task?")) {
                        deleteTask(taskItem.dataset.id);
                    }
                }
            });
        }
    }
});
