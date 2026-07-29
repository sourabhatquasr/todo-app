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
    const currentDate = new Date();
    let incompleteTasks: Todo[] = this.todoTasks.concat(this.ongoingTasks);
    this.overdueTasks = incompleteTasks.filter(task => {
      return task.dueDate && new Date(task.dueDate) < currentDate && task.status !== TaskStatus.Completed;
    });
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
    this.todos = this.service.getTodos();
    this.todoTasks = this.todos.filter(todo => todo.status === TaskStatus.Todo);
    this.ongoingTasks = this.todos.filter(todo => todo.status === TaskStatus.InProgress);
    let unsortedCompleted = this.todos.filter(todo => todo.status === TaskStatus.Completed);
    this.completedTasks = unsortedCompleted.sort((a, b) =>
      (b.completedDate as Date).getTime() - (a.completedDate as Date).getTime()
    );
    this.filterOverdueTasks();
  }
}
