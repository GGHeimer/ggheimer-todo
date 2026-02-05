// Import functions from the Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc } from 'https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js';

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

// Function to fetch and display tasks from Firestore
async function fetchAndDisplayTasks() {
    
    const backlogList = document.querySelector('.card.backlog ul');
    const ongoingList = document.querySelector('.card.ongoing ul');
    const finishedList = document.querySelector('.card.finished ul');
    
    if (!backlogList || !ongoingList || !finishedList) {
        // This function is intended to run on index.html, so if the elements are not found, we just return.
        return;
    }

    backlogList.innerHTML = '';
    ongoingList.innerHTML = '';
    finishedList.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "tasks"));

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
    li.innerHTML = `<h6 class="mb-1">${task.task_desc || 'No Description'}</h6>`;
    return li;
}

// Function to create a new task in Firestore
async function createTask(event){
    event.preventDefault(); // Prevent default form submission

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
        task_id: taskId,
        task_status: 'b'
        
    };

    try {
        const docRef = await addDoc(collection(db, "tasks"), newTask);
        console.log("Document written with ID: ", docRef.id)
        window.location.href = "./index.html";
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Error creating task. See console for details.");
    }
}

// Run fetchAndDisplayTasks when the page content is loaded (for index.html)
document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);

// Add event listener for the form submission (for createTask.html)
const createTaskForm = document.getElementById('createTaskForm');
if (createTaskForm) {
    createTaskForm.addEventListener('submit', createTask);
}
