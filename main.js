// Import functions from the Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js';

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

// Function to fetch and display tasks from Firestore, ordered by task_weight
async function fetchAndDisplayTasks() {
    
    const backlogList = document.querySelector('.card.backlog ul');
    const ongoingList = document.querySelector('.card.ongoing ul');
    const finishedList = document.querySelector('.card.finished ul');
    
    if (!backlogList || !ongoingList || !finishedList) {
        return; // Exit if the lists aren't on the page
    }

    backlogList.innerHTML = '';
    ongoingList.innerHTML = '';
    finishedList.innerHTML = '';

    try {
        // Create a query to get tasks ordered by weight
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
            } else { // Default to backlog
                backlogList.appendChild(taskElement);
            }
        });

    } catch (error) {
        console.error("Error fetching from Firestore:", error);
        backlogList.innerHTML = '<li>Error loading tasks. See console.</li>';
    }
}

// Function to create an LI element for a task
function createTaskListItem(id, task) {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.setAttribute('data-id', id);
    li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <h6 class="mb-1">${task.task_desc || 'No Description'}</h6><div style="min-width: 2rem; min-height: 2rem; text-align: center;">
            <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg></a><a href="./index.html"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
</svg></a></div>
        </div>
    `;
    return li;
}

// Function to create a new task in Firestore
async function createTask(event){
    event.preventDefault();

    let taskId = document.getElementById('taskId').value;
    let taskDesc = document.getElementById('taskDesc').value;
    let taskCost = document.getElementById('taskCost').value;
    let taskDueDate = document.getElementById('taskDueDate').value;
    let taskWeight = document.getElementById('taskWeight').value;

    if (!taskId) {
        alert("Task ID is required.");
        return;
    }

    const newTask = {
        task_id: parseInt(taskId),
        task_desc: taskDesc,
        task_cost: parseFloat(taskCost) || 0,
        task_due_date: taskDueDate,
        task_weight: parseInt(taskWeight) || 0,
        task_status: 'b' // 'b' for backlog
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), newTask);
        console.log("Document written with auto-generated ID: ", docRef.id);
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error creating task. See console for details.");
    }
}

// --- Event Listeners ---

document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);

const createTaskForm = document.getElementById('createTaskForm');
if (createTaskForm) {
    createTaskForm.addEventListener('submit', createTask);
}
