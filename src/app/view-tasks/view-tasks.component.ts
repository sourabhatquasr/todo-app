import { Component, EventEmitter, Output } from '@angular/core';
import { Todo } from '../model';
import { TodoService } from '../todo.service';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskComponent } from '../edit-task/edit-task.component';
import { ConfimrationDialogComponent } from '../confimration-dialog/confimration-dialog.component';

@Component({
  selector: 'app-view-tasks',
  templateUrl: './view-tasks.component.html',
  styleUrls: ['./view-tasks.component.css']
})
export class ViewTasksComponent {
  @Output()
  editTasksEvent: EventEmitter<void> = new EventEmitter<void>();

  todos: Todo[] = []
  constructor(private service: TodoService, public dialog: MatDialog) {
    this.todos = this.service.getTodos();
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
    const dialogRef = this.dialog.open(EditTaskComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      this.updateView();
      console.log(result)
    });
  }

  markAsIncomplete(todo: Todo) {
    const dialogRef = this.dialog.open(ConfimrationDialogComponent, { data: todo });
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.toggleStatus(todo);
      };
    });
  }

  updateView() {
    this.todos = this.service.getTodos();
  }
}
