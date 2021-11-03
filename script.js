const btnTheme = document.querySelector('.theme')
const btnClearCompleted = document.querySelector('#clear-completed')
const btnsSortingList = document.querySelector('.sorting-options')
const btnAddNew = document.querySelector('.add-task')
const spanItemsLeft = document.querySelector('#items-left')
const taskContainer = document.querySelector('.tasks')
const taskElements = document.querySelectorAll('.task')
const inputNewTask = document.querySelector('#new-todo')


class Model {
    constructor() {
        //download data from local storage
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }

    addTodo(todoText) {
        //add new todo object to array
        const todo = {
            id: this.todos.length === 0 ? 1 : this.todos[this.todos.length - 1].id + 1,
            text: todoText,
            done: false
        }

        this.todos.push(todo)
    }

    removeTodo(id) {
        //remove todo with given id
        this.todos = this.todos.filter((todo) => todo.id !== id)
    }

    toggleTodo(id) {
        //toggle state of todo with given id
        this.todos = this.todos.map((todo) =>
            todo.id === id ? {id: todo.id, text: todo.text, done: !todo.done} : todo,
        )
    }
}

class View {
    constructor() {
        this.theme = false  //false - dark theme, true - light theme
        this.displayedTasks = new Array() //stores nodes with displayed todos (keep track of order, used to perform drag and drop)

        //Event handlers
        window.addEventListener('resize', this.resizeHandler) 
        taskContainer.addEventListener('mouseover', this._showRemoveBtn.bind(this))
        taskContainer.addEventListener('mouseout', this._hideRemoveBtn.bind(this))
        taskContainer.addEventListener('dragover', this._dropHandler.bind(this))
    }

    displayTodos(todos) {
        //Remove all nodes and render new ones from data stored in todos array
        document.querySelectorAll('.task').forEach(t => t.remove())

        todos.forEach(task => {
            const newTask = document.createElement('div')
            newTask.classList.add('tab')
            newTask.classList.add('task')
            if (task.done) newTask.classList.add('done')
            newTask.setAttribute('draggable', 'true')
            newTask.setAttribute('id', task.id)
            newTask.innerHTML = `
            <div>
                <div class="check-circle ${task.done ? 'checked' : ''}"></div>
                <p class="task-content">${task.text}</p>
            </div>

            <img class="cross-sign" src="images/icon-cross.svg" alt="x">`

            newTask.addEventListener('dragstart', function() {
                this.classList.add('dragging')
            })

            newTask.addEventListener('dragend', function() {
                this.classList.remove('dragging')
            })

            taskContainer.insertAdjacentElement('afterbegin', newTask)
        })

        //Populate array with newly created nodes
        this.updateDisplayedTasksArr()
    }

    filterTasks(todos, done) {
        if (done) this.displayTodos(todos.filter(task => task.done)) //display only done tasks
        else this.displayTodos(todos.filter(task => !task.done)) //display only undone tasks
    }

    updateSortingMenu(e) {
        e.preventDefault()

        //remove 'active' class from all
        btnsSortingList.querySelectorAll('a')
        .forEach(btn => btn.classList.remove('sorting-selected'))

        //add 'active' class to event target
        e.target.classList.add('sorting-selected')
    }

    updateNumberTasksLeft(todos) {
        //Update information about number of tasks without 'done' state
        spanItemsLeft.innerText = todos.filter(task => !task.done).length
    }

    updateDisplayedTasksArr() {
        //Empty array and populate with displayed nodes
        this.displayedTasks = []
        document.querySelectorAll('.task').forEach(el => this.displayedTasks.push(el))
    }

    _getDragAfterElement(y) {
        const notDraggedArr = [...document.querySelectorAll('.task:not(.dragging)')]
            
        //Reduce array of elements that are not dragged to one element which defines the position of dragged element
        //If that element is placed at the very end of tasks container return 0 which causes appending one to that container
        //(will be placed at the end)
        //If dragged element is placed over some other elements return that element which dragged element will be insert before
        //So area which defines that object have to be translated a little above 
        return notDraggedArr.reduce((prev, cur) => {
            const dragTopBorder = cur.getBoundingClientRect().top - cur.getBoundingClientRect().height 
            const dragBottomBorder = cur.getBoundingClientRect().top + (cur.getBoundingClientRect().height / 2)
            if (y > taskContainer.getBoundingClientRect().bottom - (cur.getBoundingClientRect().height / 2)) return 0
            return (y > dragTopBorder && y < dragBottomBorder) ? cur : prev
        }, undefined)
    } 

    _dropHandler(e) {
        //Change posiiton of dragged element based on coursor position when it is dropped
        e.preventDefault()
        const overEl = this._getDragAfterElement(e.clientY)
        const draggingEl = document.querySelector('.dragging')
    
        if (overEl === 0) taskContainer.appendChild(draggingEl)
        if (overEl) taskContainer.insertBefore(draggingEl, overEl)

        this.updateDisplayedTasksArr()
    }

    //Modify UI depending on viewport width 
    _showRemoveBtn(e) {
        if (e.target.classList.contains('task-content')) {
            e.target.parentElement.nextElementSibling.style.visibility = 'visible'
        }
    }

    _hideRemoveBtn(e) {
        if (e.target.classList.contains('task-content')) {
            e.target.parentElement.nextElementSibling.style.visibility = 'hidden'
        }
    }

    _resizeHandler() {
        const listContainer = document.querySelector('.options-mobile')
    
        if (window.innerWidth < 640) {
            listContainer.appendChild(btnsSortingList)
            listContainer.classList.remove('hidden')
        } else {
            document.querySelector('.options').insertBefore(btnsSortingList, btnClearCompleted)
            listContainer.classList.add('hidden')
        }
    }

    changeTheme() {
        //Toggle between ligh and dark mode  
        this.theme = !this.theme

        if (this.theme) {
            btnTheme.setAttribute('src', 'images/icon-moon.svg')
            document.documentElement.style.setProperty('--bg-desktop', 'url(images/bg-desktop-light.jpg)')
            document.documentElement.style.setProperty('--bg-mobile', 'url(images/bg-mobile-light.jpg)')
            document.documentElement.style.setProperty('--body-bg', 'hsl(0, 0%, 98%)')
            document.documentElement.style.setProperty('--tab-bg', 'hsl(0, 0%, 98%)') 
            document.documentElement.style.setProperty('--active-task-color', 'hsl(235, 19%, 35%)')
            document.documentElement.style.setProperty('--done-task-color', 'hsl(236, 9%, 61%)') 
            document.querySelector('.tasks').style.boxShadow = 'hsl(236, 33%, 92%) 0px 8px 24px'
    
        } else {
            btnTheme.setAttribute('src', 'images/icon-sun.svg')
            document.documentElement.style.setProperty('--bg-desktop', 'url(images/bg-desktop-dark.jpg)')
            document.documentElement.style.setProperty('--bg-mobile', 'url(images/bg-mobile-dark.jpg)')
            document.documentElement.style.setProperty('--body-bg', 'hsl(235, 21%, 11%)')
            document.documentElement.style.setProperty('--tab-bg', 'hsl(235, 24%, 19%)')
            document.documentElement.style.setProperty('--active-task-color', 'hsl(234, 39%, 85%)')
            document.documentElement.style.setProperty('--done-task-color', 'hsl(234, 11%, 52%)')
            document.querySelector('.tasks').style.boxShadow = 'none'
        }
    }

    clearInput() {
        inputNewTask.value = ''
        inputNewTask.blur()
    }

    getInput() {
        return inputNewTask.value
    }
}

class Controller {
    constructor(model, view) {
        this.model = model
        this.view = view
        this.filter = 'all' //Initial filtering condition
        this.elementsOrder = new Array

        //Display default data
        this.view.displayTodos(this.model.todos)
        this.view.updateNumberTasksLeft(this.model.todos)

        //Event handlers
        btnAddNew.addEventListener('click', this._addTaskHandler.bind(this))
        taskContainer.addEventListener('click', this._removeTaskHandler.bind(this))
        taskContainer.addEventListener('click', this._toggleTaskHandler.bind(this))
        taskContainer.addEventListener('drop', this._updateOrder.bind(this))
        btnClearCompleted.addEventListener('click', this._removeDonesHandler.bind(this))
        btnsSortingList.addEventListener('click', this._changeFilter.bind(this))
        btnTheme.addEventListener('click', this.view.changeTheme.bind(this))
        document.addEventListener('keydown', this._enterKeydownHandler.bind(this))
    }

    _commit() {
        //Update data in local storage
        localStorage.setItem('todos', JSON.stringify(this.model.todos))
    }

    _updateUI() {
        this._commit()
        this.view.updateNumberTasksLeft(this.model.todos)

        //Display todos according to current filtering condition
        if (this.filter === 'all') this.view.displayTodos(this.model.todos)
        if (this.filter === 'completed') this.view.filterTasks(this.model.todos, true)
        if (this.filter === 'active') this.view.filterTasks(this.model.todos, false)
    }

    _addTaskHandler() {
        //Handle adding new todo. Call adding method with input value
        if (!this.view.getInput()) return

        this.model.addTodo(this.view.getInput())
        this._updateUI()
        this.view.clearInput()
    }

    _removeTaskHandler(e) {
        //Get id property of element which contains removing trigger (clicking on 'x' or todos text) and pass it to removing method
        if (e.target.classList.contains('task-content') || e.target.classList.contains('cross-sign')) {
            const id = Number(e.target.closest('.task').getAttribute('id'))
            this.model.removeTodo(id)
            this._updateUI()
        }
    }

    _removeDonesHandler() {
        //Apply removing handler to all todos with 'done' state
        this.model.todos.forEach(task => {
            if (task.done)
            this.model.removeTodo(task.id)
        })
        this._updateUI()
    }

    _toggleTaskHandler(e) {
        //Get id of chosen element and toggle its state by passing the id to toggling method
        if (!e.target.classList.contains('check-circle')) return

        this.model.toggleTodo(Number(e.target.closest('.task').getAttribute('id')))
        this._updateUI()
    }

    _changeFilter(e) {
        //Change filtering condition to clicked one and set it as active on UI
        this.filter = e.target.innerText.toLowerCase()
        this.view.updateSortingMenu(e)
        this._updateUI()
    }

    _updateOrder() {
        //After dropping element get order of id property from array which contains all nodes. After that reassing 'id' property of each object in 'todos'  
        //so it follows new order of elements and sort them in ascending order
        this.elementsOrder = Array.from(this.view.displayedTasks, task => Number(task.id)).reverse()
        this.model.todos = this.model.todos.map((todo, index) => todo = {...todo, id: this.elementsOrder[index]}).sort((a, b) => a.id - b.id)
        this._updateUI()
    }

    _enterKeydownHandler(e) {
        //Add new todo by clicking 'enter'
        if (e.key === 'Enter') this._addTaskHandler()
    }
}

const app = new Controller(new Model(), new View())

// localStorage.clear()

// https://www.taniarascia.com/javascript-mvc-todo-app/