const Main = {
  tasks: [],
  lastId: 0,
  init: function() {
    this.cacheSelectors()
    this.bindEvents()
    this.getStoraged()
    this.buildTasks()
  },
  cacheSelectors: function() {
    this.$checkButtons = document.querySelectorAll('.check')
    this.$inputTask = document.querySelector('#inputTask')
    this.$list = document.querySelector('#list')
    this.$removeButtons = document.querySelectorAll('.remove')
    this.$editButtons = document.querySelectorAll('.edit')
    this.$searchInput = document.querySelector('#searchInput')
  },
  bindEvents: function() {
    const self = this
    this.$checkButtons.forEach(function(button){
      button.onclick = self.Events.checkButton_click.bind(self)
    })
    this.$inputTask.onkeypress = self.Events.inputTask_keypress.bind(this)
    this.$removeButtons.forEach(function(button){
      button.onclick = self.Events.removeButton_click.bind(self)
    })
    this.$editButtons.forEach(function(button){
      button.onclick = self.Events.editButton_click.bind(self)
    })
    this.$searchInput.onkeypress = self.Events.searchInput_keypress.bind(this)
  },
  getStoraged: function() {
    const tasks = localStorage.getItem('tasks')
    const lastId = localStorage.getItem('lastId') 
    if (tasks) {
      this.tasks = JSON.parse(tasks)
      this.lastId = lastId ? parseInt(lastId) : 0 
    } else {
      localStorage.setItem('tasks', JSON.stringify([]))
      localStorage.setItem('lastId', '0') 
    }
  },
  getTaskHtml: function(task, isDone, id) {
    return `
      <li class="${isDone ? 'done' : ''}" data-task="${task}" data-id="${id}">          
        <div class="check"></div>
        <label class="task">
          <span class="span-id">${id}</span> ${task} 
        </label>
        <i class="far fa-edit edit"></i>
        <button class="remove"></button>
      </li>
    `
  },
  insertHTML: function(element, htmlString) {
    element.innerHTML += htmlString
    this.cacheSelectors()
    this.bindEvents()
  },
  buildTasks: function() {
    let html = ''
    // Ordena as tarefas em ordem crescente de id
    this.tasks.sort((a, b) => a.id - b.id)
    this.tasks.forEach(item => {
      html += this.getTaskHtml(item.task, item.done, item.id)
    })
    this.insertHTML(this.$list, html)
  },
  Events: {
    checkButton_click: function(e) {
      const li = e.target.parentElement
      const id = parseInt(li.dataset['id'])
      const isDone = li.classList.contains('done')
      const newTasksState = this.tasks.map(item => {
        if (item.id === id) {
          item.done = !isDone
        }
        return item
      })
      localStorage.setItem('tasks', JSON.stringify(newTasksState))
      if (!isDone) {
        return li.classList.add('done')       
      }
      li.classList.remove('done')
    },
    inputTask_keypress: function(e){      
      const key = e.key
      const value = e.target.value
      if (key === 'Enter') {
        if(value != ''){
          const id = ++this.lastId
          const taskHtml = this.getTaskHtml(value, false, id)
          this.insertHTML(this.$list, taskHtml)
          e.target.value = ''        
          const savedTasks = localStorage.getItem('tasks')
          const savedTasksArr = JSON.parse(savedTasks)        
          const arrTasks = [
            { task: value, done: false, id: id },
            ...savedTasksArr,
          ]
          const jsonTasks = JSON.stringify(arrTasks)
          this.tasks = arrTasks
          localStorage.setItem('tasks', jsonTasks)
          localStorage.setItem('lastId', this.lastId)
        }
      }
    },
    removeButton_click: function(e){
      const li = e.target.parentElement
      const id = parseInt(li.dataset['id'])  
      const newTasksState = this.tasks.filter(item => {
        return  item.id !== id
      })
      localStorage.setItem('tasks', JSON.stringify(newTasksState))
      this.tasks = newTasksState
      li.classList.add('removed')
      setTimeout(function(){
        li.classList.add('hidden')
      },300)
    },
    editButton_click: function(e){
      const li = e.target.parentElement
      const id = parseInt(li.dataset['id'])
      const task = this.tasks.find(item => item.id === id)
  
      
      const input = document.createElement('input')
      input.type = 'text'
      input.classList.add('editando')
      input.value = task.task

    
      const taskLabel = li.querySelector('.task')
      taskLabel.innerHTML = ''
      taskLabel.appendChild(input)

      
      input.focus()

      
      input.onkeypress = (e) => {
        if (e.key === 'Enter') {
          
          if (input.value.trim() !== '') {
            task.task = input.value
            localStorage.setItem('tasks', JSON.stringify(this.tasks))
            taskLabel.innerHTML = `<span>${id}</span>${input.value}`
          }
        }
      }
    },
    searchInput_keypress: function(e){
      const key = e.key
      const value = e.target.value
      if (key === 'Enter') {
        const id = parseInt(value)
        const task = this.tasks.find(item => item.id === id)
        if (task) {
          showToast(`Tarefa: ${task.task} | ${task.done ? 'Tarefa concluida' : 'Tarefa não concluida'}`)
        } else {
          showToast('Tarefa não encontrada')
        }
      }
    }
  }
}

function showToast(message) {
  
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message

  
  document.body.appendChild(toast)

  
  setTimeout(() => {
    toast.classList.add('show')
  }, 10)

 
  setTimeout(() => {
    toast.classList.add('hide')
  }, 3000)
}

Main.init()