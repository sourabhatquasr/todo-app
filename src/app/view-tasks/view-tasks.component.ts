import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Todo } from '../model';
import { TodoService } from '../todo.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { ConfimrationDialogComponent } from '../confimration-dialog/confimration-dialog.component';
import { ToastService, ToastType } from '../toast.service';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.css'],

})
export class ViewTasksComponent {

  incompleteTasks: Todo[] = [];
  completedTasks: Todo[] = [];

  constructor(private service: TodoService, public dialog: MatDialog, private toast: ToastService) {
    this.incompleteTasks = this.service.getTodos().filter(todo => !todo.completed)
    this.completedTasks = this.service.getTodos().filter(todo => todo.completed)
  }

  toggleStatus(todo: Todo): void {
    this.service.toggleCompletion(todo);
    this.updateView();
  }

  deleteTodo(todo: Todo): void {
    this.service.deleteTodo(todo);
    this.updateView();
  }

  editTask(todo: Todo) {
    this.toast.showToast(`Modifying '${todo.title}`, ToastType.Info)
    const dialogRef = this.dialog.open(EditTaskComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      this.updateView();
      console.log(result)
    });
  }

  confirmDeletion(todo: Todo) {
    const dialogRef = this.dialog.open(ConfimrationDialogComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.deleteTodo(todo);
      };
    });
  }

  updateView() {
    this.incompleteTasks = this.service.getTodos().filter(todo => !todo.completed)
    this.completedTasks = this.service.getTodos().filter(todo => todo.completed)
  }
}
