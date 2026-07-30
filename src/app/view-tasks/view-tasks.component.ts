import { Component, EventEmitter, Output } from '@angular/core';
import { TaskStatus, Todo } from '../model';
import { TodoService } from '../todo.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { ConfimrationDialogComponent } from '../confimration-dialog/confimration-dialog.component';
import { ToastService, ToastType } from '../toast.service';

@Component({
    selector: 'app-view-tasks',
    templateUrl: './view-tasks.component.html',
    styleUrls: ['./view-tasks.component.css'],
    standalone: false
})
export class ViewTasksComponent {
  @Output() statsChanged = new EventEmitter<void>();

  todos: Todo[] = [];
  todoTasks: Todo[] = [];
  ongoingTasks: Todo[] = [];
  completedTasks: Todo[] = [];
  overdueTasks: Todo[] = [];
  showOverdueTasks: boolean = false;

  constructor(private service: TodoService, public dialog: MatDialog, private toast: ToastService) {
    this.updateView();
    this.filterOverdueTasks();
  }

  showOverdueTodos(){
    this.filterOverdueTasks();
    this.showOverdueTasks = !this.showOverdueTasks;
  }

  filterOverdueTasks() {
    // Bolt Optimization: Calculate overdue tasks without using .concat() which allocates a new array.
    // Iterates directly over existing arrays, reducing GC overhead.
    const currentDate = new Date();
    const overdue: Todo[] = [];

    const checkAndAdd = (task: Todo) => {
      if (task.dueDate && new Date(task.dueDate) < currentDate && task.status !== TaskStatus.Completed) {
        overdue.push(task);
      }
    };

    for (let i = 0; i < this.todoTasks.length; i++) {
      checkAndAdd(this.todoTasks[i]);
    }
    for (let i = 0; i < this.ongoingTasks.length; i++) {
      checkAndAdd(this.ongoingTasks[i]);
    }
    this.overdueTasks = overdue;
  }

  markAsCompleted(todo: Todo){
    todo.status = TaskStatus.Completed;
    todo.completedDate = new Date();
    this.service.updateTodo(todo);
    this.toast.showToast(`'${todo.title}' is marked as completed`, ToastType.Success);
    this.updateView();
    this.statsChanged.emit();
  }

  markTaskInProgress(todo: Todo){
    this.service.updateTodo(todo);
    todo.status = TaskStatus.InProgress;
    todo.completedDate = undefined;
    this.toast.showToast(`'${todo.title}' is in progress`, ToastType.Success);
    this.updateView();
    this.statsChanged.emit();
  }

  markAsIncomplete(todo: Todo){
    todo.status = TaskStatus.Todo;
    todo.completedDate = undefined;
    this.service.updateTodo(todo);
    this.toast.showToast(`'${todo.title}' is marked as Todo`, ToastType.Info);
    this.updateView();
    this.statsChanged.emit();
  }

  deleteTodo(todo: Todo): void {
    this.service.deleteTodo(todo);
    this.updateView();
    this.statsChanged.emit();
  }

  editTask(todo: Todo) {
    this.toast.showToast(`Modifying '${todo.title}'`, ToastType.Info);
    const dialogRef = this.dialog.open(EditTaskComponent, { data: todo, panelClass: 'dark-dialog' });
    dialogRef.afterClosed().subscribe(result => {
      this.updateView();
      this.statsChanged.emit();
    });
  }

  confirmDeletion(todo: Todo) {
    const dialogRef = this.dialog.open(ConfimrationDialogComponent, { data: todo, panelClass: 'dark-dialog' });
    dialogRef.afterClosed().subscribe(result => {
      if(result){ this.deleteTodo(todo); }
    });
  }

  newTaskAdded(){
    if(this.showOverdueTasks){ this.showOverdueTodos(); }
    this.updateView();
    this.statsChanged.emit();
  }

  updateView() {
    // Bolt Optimization: Single-pass O(N) loop to group tasks by their status.
    // This removes 3 separate filter allocations and multiple iterations.
    this.todos = this.service.getTodos();

    const todoTasks: Todo[] = [];
    const ongoingTasks: Todo[] = [];
    const completedTasks: Todo[] = [];

    for (let i = 0; i < this.todos.length; i++) {
      const todo = this.todos[i];
      const status = todo.status;

      if (status === TaskStatus.Todo) {
        todoTasks.push(todo);
      } else if (status === TaskStatus.InProgress) {
        ongoingTasks.push(todo);
      } else if (status === TaskStatus.Completed) {
        completedTasks.push(todo);
      }
    }

    // Sort completed tasks by completedDate desc
    completedTasks.sort((a, b) =>
      (b.completedDate as Date).getTime() - (a.completedDate as Date).getTime()
    );

    this.todoTasks = todoTasks;
    this.ongoingTasks = ongoingTasks;
    this.completedTasks = completedTasks;

    // Calculate overdue tasks
    this.filterOverdueTasks();
  }
}
